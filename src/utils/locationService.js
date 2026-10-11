/**
 * Unified Location Service for MeraTailor
 * Manages user location across FindTailors, Home, Orders, and Booking.
 * Handles profile syncing for logged-in users and 1-time guest prompting with persistent storage.
 */

const STORAGE_KEY = "meraTailor.unifiedLocation";
const SESSION_KEY = "meratailor.search-location";
const ASKED_KEY = "meraTailor.guestLocationAsked";

/**
 * Retrieves the best available location in order of priority:
 * 1. Logged-in profile location (coordinates & label & radius)
 * 2. Unified localStorage location (persisted guest / app-wide)
 * 3. Session storage location
 */
export function getUnifiedLocation(profile = null) {
  // 1. Profile location
  if (profile?.location?.coordinates && profile.location.coordinates.length >= 2) {
    const lng = Number(profile.location.coordinates[0]);
    const lat = Number(profile.location.coordinates[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return {
        latitude: lat,
        longitude: lng,
        label: profile.location.label || profile.address || profile.city || "Saved Profile Location",
        radius: Number(profile.searchPreferences?.radiusKm) || 10,
        sortBy: profile.searchPreferences?.sortBy || "recommended",
        source: "profile",
      };
    }
  }

  // 2. Persisted local storage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
        return {
          latitude: Number(parsed.latitude),
          longitude: Number(parsed.longitude),
          label: parsed.label || "Saved Location",
          radius: Number(parsed.radius) || 10,
          sortBy: "recommended",
          source: "unified",
        };
      }
    }
  } catch (err) {
    console.warn("Failed to parse unifiedLocation from localStorage", err);
  }

  // 3. Session fallback
  try {
    const rawSession = sessionStorage.getItem(SESSION_KEY);
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
        return {
          latitude: Number(parsed.latitude),
          longitude: Number(parsed.longitude),
          label: parsed.label || "Search Location",
          radius: Number(parsed.radius) || 10,
          sortBy: "recommended",
          source: "session",
        };
      }
    }
  } catch (err) {}

  return null;
}

/**
 * Saves location persistently across the application and optionally syncs to profile
 */
export async function setUnifiedLocation({ latitude, longitude, label, radius = 10, accuracyMeters }, token = null) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

  const locObj = {
    latitude: Number(latitude),
    longitude: Number(longitude),
    label: label || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    radius: Number(radius) || 10,
    accuracyMeters: accuracyMeters || null,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locObj));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(locObj));
    localStorage.setItem(ASKED_KEY, "true");
  } catch (e) {
    console.warn("Failed to write unified location to storage", e);
  }

  // Sync to backend if token is provided
  if (token) {
    try {
      await fetch("/api/users/location", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: locObj.latitude,
          longitude: locObj.longitude,
          label: locObj.label,
          source: "browser",
          accuracyMeters: locObj.accuracyMeters,
          consent: true,
        }),
      });
    } catch (syncErr) {
      console.warn("Failed to sync location with server", syncErr);
    }
  }
}

/**
 * Checks if a guest has already been asked for location
 */
export function isGuestLocationPromptDismissed() {
  try {
    return localStorage.getItem(ASKED_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Dismisses guest prompt so user is never prompted repeatedly
 */
export function dismissGuestLocationPrompt() {
  try {
    localStorage.setItem(ASKED_KEY, "true");
  } catch {}
}
