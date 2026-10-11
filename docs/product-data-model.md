# Product study: identity, location, discovery and voice

## What the reference product needs

The Render app presents a customer marketplace: home, tailor discovery, bulk requests, how-it-works, account entry, bilingual navigation, location awareness and a personal customer area. The GitHub repository supplies the React UI and tailoring flows, but it is a frontend resource; it does not provide the complete API, durable user database, or the location/auth model. The new API is organized using MVC so the interface can be incrementally connected without mixing database behavior into React components.

## Identity lifecycle: Clerk first, MongoDB second

Clerk is the authority for credentials, sessions, verified email and account recovery. MongoDB is the authority for MeraTailor-specific profile and activity. On an authenticated request, Express validates the Clerk session; middleware fetches the Clerk user server-side and upserts a `User` document using `clerkUserId` as a unique immutable key. A new user is created the first time they open `/api/me` or another protected app endpoint. No password is stored in MongoDB. Never accept a `clerkUserId`, role, or verified email from a client request body.

The client does not need a separate registration form: Clerk's sign-up collects/validates credentials and email according to the Clerk dashboard configuration. Additional app details (phone, language and optional location) should be collected in the onboarding/profile flow after sign-up. Keep phone optional unless product policy requires it. Clerk profile edits may sync name/email back to Mongo on the next authenticated request; app-only preferences are patched to `/api/me`.

## `User` model

| Field | Purpose and handling |
| --- | --- |
| `clerkUserId` | Required unique Clerk subject; joins authenticated customer data. |
| `email`, `firstName`, `lastName` | Synced from the server-verified Clerk user; email is normalized. |
| `phone` | Optional contact number; validate/normalize before production messaging. |
| `preferredLanguage` | `en` or `hi`; drives i18next and speech locale. |
| `role` | `customer`, `tailor`, or `business`; role changes must be an administrative/verified flow, never a client patch. |
| `primaryLocation` | Optional GeoJSON Point `[longitude, latitude]`; only saved after explicit confirmation. |
| `locationLabel` | Human-readable area/city label; avoid storing a full street address unless necessary. |
| `locationAccuracyMeters`, `locationSource` | Browser accuracy and `browser`/`manual` origin, useful for UX and troubleshooting. |
| `locationConsentAt` | Timestamp showing when the user pressed the save/use action. Clear location if the user revokes permission or removes it. |
| `searchPreferences.radiusKm` | User's default range (1–100 km; default 10 km). |
| `searchPreferences.categories`, `sortBy` | Optional category filters and recommendation/distance/rating/price sort. |
| `savedTailors[]` | Tailor reference and save timestamp; scoped to this user. |
| timestamps | Created/updated tracking for profile lifecycle. |

Orders and measurements also carry `clerkUserId`, so one customer's queries cannot read another customer's records. Tailor profile `location` is GeoJSON with a MongoDB `2dsphere` index, enabling `$geoNear` radius queries. The current order and measurement models are starting points; before launch, add strict enums/validation, measurement units, order event history and tailor ownership checks.

## Location and radius flow

1. Ask for location only after a user action. Browser location permission is controlled by the browser; a manual city/area/postal-code lookup is the fallback.
2. A location can be used for a one-session search. Persisting it to the user's Mongo profile is a distinct action requiring `consent: true`; the UI must state why it is retained.
3. Store GeoJSON coordinates in Mongo as `[longitude, latitude]` (the browser gives latitude first; convert at the API boundary). Do not store location history.
4. Search uses the selected center and radius; server clamps radius to 100 km and Mongo `$geoNear` returns distance. The UI draws that same radius and places returned tailors on the map.
5. Give the user a remove/change location action and honor account deletion/data deletion policy. Production geocoding should use a provider with an appropriate usage policy and caching/attribution; current prototype lookup uses Nominatim/OpenStreetMap and must follow its public usage rules.

Location consent is not implied by account creation or by granting browser permission. A current-location lookup can remain in browser session storage for the current session; profile persistence is separate.

## Hindi/English behavior

Use stable language-neutral values for categories/statuses/IDs and translate display labels only. `src/i18n/i18n.js` has English and Hindi resources and stores the chosen locale locally. After authentication, persist `preferredLanguage` to `/api/me` so it follows the profile across devices; avoid translating API enum values or free-text tailor names. Set speech recognition locale to `en-IN` or `hi-IN` from active UI language. Add translation keys for every visible page label/error, and test long Hindi strings for layout wrapping.

The request mentions n8n, but translation does not need n8n: i18next is faster, predictable and avoids sending interface strings to an automation service. Add n8n only if you later need an authorized workflow such as human-reviewed translation imports, order notifications or catalog ingestion. Do not send credentials, exact location or measurements to an n8n workflow unless that specific purpose and retention are disclosed.

## Voice request and search intent

Use browser speech recognition when available, with a visible typed-input fallback. First parse the utterance into a draft intent, then show the user what was understood before searching/creating an order. Suggested normalized intent fields:

```json
{
  "language": "hi-IN",
  "garment": "shirt",
  "category": "menswear",
  "color": "blue",
  "quantity": 2,
  "deadline": "2026-10-10",
  "location": null,
  "radiusKm": 10
}
```

In production, use a schema-validated parser (rules or an LLM service) and confirm ambiguous category, count, date, color and location. Voice search should only discover matching tailors; it must not place an order or save a location without a separate user confirmation. Current browser-only parser is deliberately a prototype: it recognizes a few garment/color/date patterns and shows a review summary; it does not yet create requirements or persist an order.

## Generic geography and directory readiness

The search API has no Jaipur condition. Each tailor needs valid coordinates plus area/city/state/country for display, categories, availability, verified status and contact/service data. Add a verified tailor onboarding/import workflow before claiming broad coverage: six seed records only demonstrate the Jaipur behavior. For global launch, decide currency, measurement units, phone formats, locale, geocoding coverage and map provider by market.

## Clerk/Mongo setup before a real sign-in test

- Create/configure a Clerk application and set the frontend publishable key and server secret in ignored `.env` (`VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`). Configure allowed origins and sign-in methods in Clerk.
- Keep the Mongo URI local for development (`mongodb://127.0.0.1:27017/meratailor`); replace only `MONGO_URI` when deploying to the selected MongoDB service.
- Test account creation, verified email, session expiry, protected endpoint denial, first-login upsert, profile patch, explicit location consent and owner-scoped order/measurement access.
- Back up production data and define retention/deletion before collecting phone, location, measurements, or order details.
