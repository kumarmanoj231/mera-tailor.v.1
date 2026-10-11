``
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  /* =====================================================
     ENGLISH
  ====================================================== */

  en: {
    translation: {
      /* ===================================================
         NAVBAR
      ================================================== */

      navbar: {
        home: "Home",
        findTailors: "Find Tailors",
        bulk: "For Bulk",
        howItWorks: "How It Works",
        myTailors: "My Tailors",
        orders: "My Orders",
        language: "Language",
        signIn: "Sign in",
        getStarted: "Get Started",
        joinMeraTailor: "Join MeraTailor",
        hello: "Hello",
        viewProfile: "View Profile",

        // User roles
        customer: "Customer",
        tailor: "Tailor",
        business: "Business",
        admin: "Admin",
        guest: "Guest",
        dashboard: "Dashboard",
        adminPortal: "Admin portal",
        notifications: "Notifications",
        markAllRead: "Mark all as read",
        clearAll: "Clear all",
        noNotifications: "No notifications yet",
      },

      notifications: {
        new: "new",
        confirmClear: "Clear all notifications permanently?",
        allCaughtUp: "All caught up!",
        loading: "Loading updates…",
      },

      discovery: { eyebrow: "DISCOVER", title: "Find Tailors", intro: "Search skilled tailoring professionals around any location. Choose your search area and radius.", locationPlaceholder: "Choose a city, area or postal code", searchArea: "Search this area", useLocation: "Use current location", queryPlaceholder: "Garment, tailor, area, city…", search: "Search", radius: "Search radius", category: "Category", allCategories: "All categories", hideMap: "Hide map", showMap: "Show map", sort: "Sort", recommended: "Recommended", distance: "Distance", rating: "Rating", understood: "Request understood:", submitRequest: "Search this request", searching: "Searching…", withinDays: "within {{count}} days", voiceRequestError: "We could not use that voice request. Please try again.", chooseLocationFirst: "Choose an area or allow location access to search nearby tailors.", locationUnavailable: "Location is unavailable in this browser. Search by area instead.", voiceUnavailable: "Voice input is unavailable here. Type your request instead.", voiceError: "We couldn't hear that. Please try again or type your request.", placeSearchError: "Place search failed.", directoryError: "The tailor directory could not be loaded.", invalidDirectory: "The tailor directory returned invalid map data.", currentLocation: "Current location", mapCenter: "Map center {{center}}", tailorsWithin: "{{count}} tailors within {{radius}} km", kmAway: "{{distance}} km away", newRating: "New", searchVoice: "Speak your request", chooseLocation: "Choose an area to discover nearby tailors", chooseLocationHelp: "Choose a city, area or postal code above, or use current location. Your profile location is not saved unless you confirm it.", noResults: "No tailors found in this radius. Increase the radius or search another area.", locationError: "We couldn't find that place. Try a city, area or postal code.", locationDenied: "Location permission was not granted. Search by city or area instead.", categoryNames: { "Men's Wear": "Men's Wear", "Ladies Wear": "Ladies Wear", "Formal Wear": "Formal Wear", "Ethnic Wear": "Ethnic Wear", Shirt: "Shirt", Pants: "Pants", Dress: "Dress", Suit: "Suit", Alteration: "Alteration" }, colorNames: { black: "black", white: "white", blue: "blue", red: "red", green: "green", yellow: "yellow", pink: "pink", maroon: "maroon", purple: "purple", orange: "orange", brown: "brown", grey: "grey" } },
      portals: { dashboard: "Dashboard", welcome: "Welcome back", orders: "Orders", savedTailors: "Saved tailors", measurements: "Measurements", location: "Search location", radius: "Default radius", tailorTitle: "Tailor workspace", tailorText: "Review customer requests, manage your profile and keep your service area current.", businessTitle: "Business workspace", businessText: "Manage bulk requirements, compare tailor proposals and track production.", adminTitle: "Administration", adminText: "Manage registered accounts and tailor listings.", users: "Users", tailors: "Tailors", email: "Email", role: "Role", status: "Status", actions: "Actions", active: "Active", disabled: "Disabled", save: "Save", delete: "Delete", addTailor: "Add tailor", editTailor: "Edit tailor", ownerClerkUserId: "Tailor Clerk user ID", createTestUser: "Create local test user", name: "Name", city: "City", country: "Country", area: "Area", category: "Categories", latitude: "Latitude", longitude: "Longitude", phone: "Phone", noAccess: "You do not have access to this portal.", loadError: "Could not load this data.", confirmDelete: "Permanently remove this account and its Clerk login?", bulkTitle: "Bulk clothing, made simpler.", bulkIntro: "Connect your business with skilled tailoring professionals for uniforms, collections and large-scale custom orders.", postRequirement: "Post a requirement", findRightTailor: "Find the right tailor", getQuotes: "Get multiple quotes", manageProduction: "Manage production", feature1Text: "Find professionals who handle the type and scale of work your business needs.", feature2Text: "Share requirements and compare proposals from suitable tailors.", feature3Text: "Keep bulk orders organized from requirement to completion.", process: "From requirement to production.", steps: ["Tell us what you need", "Receive suitable tailor proposals", "Compare and connect", "Track your production"], requirementSent: "Your requirement has been sent.", quantity: "Quantity", timeline: "Timeline", requirement: "What do you need made?", organization: "Organization" },

      /* ===================================================
         HOME
      ================================================== */

      home: {
        /* =================================================
           HERO
        ================================================= */

        location: "Choose your location",

        brand: "मेरा Tailor",

        tagline: "Apna Tailor, Ab Asani Se.",

        description:
          "Find trusted local tailors, tell us what you need, save your measurements once, and manage your complete stitching orders from one place.",

        findTailors: "Find Tailors",

        tellUsNeed: "Tell Us What You Need",
        voiceEyebrow: "Voice tailoring assistant",
        voiceTitle: "What would you like stitched?",
        voiceHelp: "Speak or type your request in Hindi or English. We’ll carry it into tailor search; you can search without signing in.",
        voiceAutoLanguage: "Gemini automatically recognizes Hindi, English, and language mixing.",
        voiceRequestLabel: "Your request",
        voicePlaceholder: "For example: I need a blue shirt within 5 km, ready in 7 days.",
        voiceSpeak: "Speak your request",
        voiceStop: "Stop and transcribe",
        voiceTranscribing: "Transcribing with Gemini…",
        voiceContinue: "Find matching tailors",
        voiceClose: "Close voice assistant",
        voiceRecording: "Listening… tap to stop",
        voicePrivacyShort: "Audio is sent to Gemini for transcription · Privacy",
        voicePrivacy: "Your microphone recording is sent to Google Gemini for transcription and deleted from its temporary file storage after processing. Free-tier data may be used by Google to improve its products. Don't include sensitive details.",
        voiceUnsupported: "Voice input is unavailable in this browser. Type your request instead.",
        voicePermission: "Microphone is blocked for this site. Allow it in site settings, then try again.",
        voiceEmbeddedPermission: "This embedded preview blocks the microphone. Open the app directly in a browser tab and allow mic access.",
        voiceCaptureBlocked: "Permission is allowed, but this preview cannot open the microphone. Open the app directly in Chrome or Edge. If it still fails, check your device's microphone privacy and selected input.",
        voiceNoMicrophone: "No microphone was found. Connect one or type your request.",
        voiceMicBusy: "Microphone is busy or unavailable. Close other apps using it and try again.",
        voiceSecureContext: "Microphone needs a secure page. Open this app on HTTPS or localhost.",
        voiceNoAudio: "No clear speech was captured. Please try again or type your request.",
        voiceMaxDuration: "Recording stopped after 30 seconds.",
        voiceGeminiNotConfigured: "Gemini is not configured on this server. Add GEMINI_API_KEY to the server .env file and restart it.",
        voiceGeminiRateLimited: "Gemini is temporarily rate-limited. Please wait and try again.",
        voiceAudioTooLarge: "That recording is too large. Please make a shorter recording.",
        voiceAudioUnsupported: "This microphone audio format is unsupported. Type your request instead.",
        voiceGeminiError: "Gemini could not transcribe the recording. Please try again or type your request.",
        voiceTryAgain: "We couldn’t hear that clearly. Try again or type your request.",
        voiceClear: "Clear",
        voiceUnderstood: "Understood Requirements:",
        voiceAiReady: "✓ AI Ready",
        voiceQuickIdeas: "Quick ideas (Hindi / English):",

        verifiedTailors: "420+ local tailors",

        rating: "4.8 average rating",

        /* =================================================
           HERO DASHBOARD
        ================================================= */

        yourTailorLabel:
          "Your personal tailoring space",

        myTailor: "My Tailor",

        tailorName: "Your Tailor",

        tailorSpeciality:
          "Custom Stitching & Alterations",

        nearYou: "Near you",

        saveTailor: "Save tailor",

        measurements: "Measurements",

        myOrders: "My Orders",

        chat: "Chat",

        call: "Call",

        saveFavourite:
          "Save your favourite tailors",

        buildPersonalList:
          "Build your personal list",

        currentOrder: "Current Order",

        orderName: "Your Current Order",

        inProgress: "In Progress",

        stitching: "Stitching",

        readyDate: "Ready in 4 days",

        viewOrder: "View Order",

        measurementSaved:
          "Measurements saved",

        measurementDescription:
          "Ready for your next order",

        callTailor: "Call your tailor",

        directConnection:
          "Direct connection",

        /* =================================================
           HERO FEATURES
        ================================================= */

        featureFindTitle:
          "Find Nearby Tailors",

        featureFindText:
          "Discover trusted local professionals",

        featureMeasureTitle:
          "Save Measurements",

        featureMeasureText:
          "Measure once, use anytime",

        featureOrderTitle:
          "Track Your Orders",

        featureOrderText:
          "Stay updated from stitch to delivery",

        /* =================================================
           HOW IT WORKS
        ================================================= */

        howItWorksTitle:
          "How it works",

        step1: "Step 1",

        step1Title:
          "Find a tailor",

        step1Text:
          "Find local tailors within 1–20 km of your location.",

        step2: "Step 2",

        step2Title:
          "Connect directly",

        step2Text:
          "Call, discuss your requirements and confirm the price in one tap.",

        step3: "Step 3",

        step3Title:
          "Track your order",

        step3Text:
          "Follow every step from measurements to delivery in the app.",

        /* =================================================
           TRUST METRICS
        ================================================= */
        trustVerifiedTailors: "420+ Verified Tailors",
        trustVerifiedSub: "Master artisans in your locality",
        trustFitAccuracy: "99.2% Fit Accuracy",
        trustFitSub: "Guaranteed alteration coverage",
        trustOrdersDelivered: "18,500+ Orders Delivered",
        trustOrdersSub: "Retail & bulk uniforms",
        trustAvgTurnaround: "3–5 Days Turnaround",
        trustAvgSub: "Express delivery available",

        /* =================================================
           WHAT TO STITCH
        ================================================= */
        whatToStitch: "What Would You Like Stitched?",
        exploreServices: "Explore Services",
        whatToStitchSubtitle: "Select a category to instantly find specialist tailors in your neighborhood.",
        viewAllServices: "View all stitching services",
        customFit: "Custom Fit",
        popular: "Popular",

        categories: {
          shirt: "Shirts",
          shirtPrice: "₹349+",
          shirtTag: "Formal & Casual",

          pants: "Trousers & Pants",
          pantsPrice: "₹399+",
          pantsTag: "Chinos, Formal, Jeans",

          dress: "Ladies Wear",
          dressPrice: "₹499+",
          dressTag: "Blouse, Gowns, Dresses",

          suit: "Suits & Sherwani",
          suitPrice: "₹1,499+",
          suitTag: "3-Piece, Tuxedo, Safari",

          ethnic: "Ethnic Wear",
          ethnicPrice: "₹799+",
          ethnicTag: "Lehenga, Kurti, Saree",

          formal: "Formal & Office",
          formalPrice: "₹699+",
          formalTag: "Blazers, Overcoats",

          alteration: "Alterations & Repair",
          alterationPrice: "₹99+",
          alterationTag: "Fitting, Resizing, Hemming",
        },

        /* =================================================
           FEATURED TAILORS
        ================================================= */
        featuredTailors: "Featured Master Tailors & Boutiques",
        featuredSubtitle: "Discover verified tailoring masters near you with transparent rates, real customer ratings, and guaranteed fittings.",
        featuredBadge: "Real-Time Database Feed",
        viewAll: "Explore All on Map",
        startingFrom: "Starting from",
        yrsExp: "yrs exp",
        reviewsCount: "reviews",
        viewProfile: "View Profile",
        call: "Call",
        signInToContact: "Sign In to Contact",
        signInToViewLocation: "Sign in to view location",
        getStartedToContact: "Get Started to Contact",
        getStartedToViewLocation: "Get started to view location",
        locationHidden: "Location hidden (Get started to view)",
        allStudios: "All Studios",
        catEthnic: "Ethnic & Traditional",
        catLadies: "Ladies & Bridal",
        catFormal: "Formal & Suits",
        catAlteration: "Alterations & Repair",
        cantFindTitle: "Can't find the exact style you need?",
        cantFindSub: "Use our AI Voice Assistant or radius locator to find specialized studios for bridal, corporate uniforms, or same-day alterations.",
        searchNearMe: "Search Tailors Near Me",
        personalizedDiscovery: "Personalized Tailoring Discovery",
        noTailorsCategory: "No tailors found in this category",
        noTailorsSub: "Browse other categories or check all available studios in the discovery map.",
        showAllTailors: "Show all tailors",

        /* =================================================
           EVERYONE
        ================================================= */
        everyoneEyebrow: "BUILT FOR EVERYONE IN TAILORING",
        everyoneTitle: "One Unified Platform for All Tailoring Needs",
        everyoneSubtitle: "Whether you need a single outfit stitched with perfection or manage bulk uniform production, MeraTailor connects you seamlessly.",

        audience: {
          customerBadge: "For Individuals",
          customerTitle: "Customers & Shoppers",
          customerSubtitle: "Get perfect-fitting garments crafted by verified local masters without the hassle.",
          customerPoints: [
            "Save measurements once in your digital cloud vault",
            "AI Voice & radius search for nearby specialists",
            "1-tap direct call, upfront prices & fabric guidance",
            "Real-time progress updates from cutting to delivery",
          ],
          customerCta: "Find a Tailor Near You",

          tailorBadge: "Dual Role for Tailors",
          tailorTitle: "Tailors & Boutiques",
          tailorSubtitle: "Grow your business by taking local retail orders and bidding on profitable bulk contracts.",
          tailorPoints: [
            "Dual earning: retail customers + institutional orders",
            "Free digital order management & measurement book",
            "Direct client communication with zero hidden commission",
            "Get verified studio badge to build trust in your city",
          ],
          tailorCta: "Join as a Tailor",

          bulkBadge: "Bulk & Corporate",
          bulkTitle: "Businesses & Brands",
          bulkSubtitle: "Source uniforms, boutique runs, and event attire from vetted manufacturing tailors.",
          bulkPoints: [
            "Post bulk RFQs and compare competitive bids",
            "Sample verification before full batch manufacturing",
            "Production milestone tracking & timeline guarantees",
            "GST invoices and dedicated procurement support",
          ],
          bulkCta: "Post Bulk Requirement",
        },

        /* =================================================
           LOCATION
        ================================================= */

        tailorsAroundYou:
          "TAILORS AROUND YOU",

        findRightTailor:
          "Find the right tailor",

        nearLocation:
          "near you.",

        locationDescription:
          "Allow your location to discover trusted tailors nearby, compare their services and connect with the right professional.",

        locationBenefitNearby:
          "Discover tailors within your area",

        locationBenefitSpecialist:
          "Find specialists for your outfit",

        locationBenefitConnect:
          "Connect directly with your tailor",

        whereLocated:
          "Where are you located?",

        locationCardDescription:
          "Use your current location to find tailors around you.",

        detectLocation:
          "Detect my location",

        detecting:
          "Detecting...",

        locationPrivacy:
          "Your location is only used to show relevant nearby tailors.",

        locationDetectedLabel:
          "Location detected",

        youAreHere:
          "You're here",

        yourArea:
          "Your area",

        yourLocation:
          "Your location",

        pinCode:
          "PIN code",

        detectedAddress:
          "Detected address",

        findTailorsNearMe:
          "Find tailors near me",

        locationAccessNeeded:
          "Location access needed",

        tryAgain:
          "Try again",

        locationNotSupported:
          "Location services are not supported by this browser.",

        locationDetected:
          "Location detected, but the address could not be retrieved.",

        locationPermission:
          "Please allow location access to continue.",

        locationUnavailable:
          "Your location is currently unavailable.",

        locationTimeout:
          "Location request timed out.",

        locationError:
          "Unable to detect your location.",

        saveLocation:
          "Save this location for nearby search",

        locationPrivacy:
          "Your precise location is saved only after you choose to save it.",

        notAvailable:
          "N/A",

        /* =================================================
           JAIPUR / LOCAL TRUST
        ================================================= */

        jaipurImageAlt:
          "Jaipur architecture",

        builtForCity:
          "BUILT FOR YOUR NEIGHBOURHOOD",

        jaipurKnows:
          "Your neighbourhood, your tailor",

        goodCraftsmanship:
          "good craftsmanship.",

        jaipurDescription:
          "From everyday alterations to wedding outfits, MeraTailor helps you discover local professionals and build long-term tailoring relationships.",

        localProfessionals:
          "Local professionals",

        localProfessionalsText:
          "Discover skilled tailors across your neighbourhood.",

        directConnectionText:
          "Talk directly with your tailor and discuss your requirements.",

        buildFavourites:
          "Build your favourites",

        buildFavouritesText:
          "Save tailors you trust and return to them whenever you need.",

        /* =================================================
           CTA
        ================================================= */

        ctaEyebrow:
          "YOUR PERFECT STITCH STARTS HERE",

        ctaTitle:
          "Ready to find",

        ctaTitleAccent:
          "your tailor?",

        ctaText:
          "Discover trusted tailors around you and make your next outfit easier.",

        ctaButton:
          "Find a Tailor",
      },

      howItWorks: {
        badge: "HOW IT WORKS",
        title: "Tailoring Made Effortless for Everyone",
        intro:
          "Whether you need bespoke garments, want to place bulk organizational orders, or are a tailor looking to serve retail clients and take large-scale bulk work — MeraTailor connects the entire journey seamlessly.",
        activeRole: "Your Active Role",
        switchRoles: "Explore Different Workflows",
        dualCapabilityBadge: "Dual Revenue: Retail Clients + Bulk B2B Orders",
        recommendedForYou: "Recommended for your account",
        tabs: {
          customer: "For Customers",
          customerSubtitle: "Discover local tailors, save your fit, and get bespoke clothes crafted.",
          tailor: "For Tailors & Workshops",
          tailorSubtitle: "Serve local customers and take high-volume B2B bulk orders to grow your business.",
          business: "For Business & Bulk",
          businessSubtitle: "Source uniforms, merchandise, and volume production from verified tailors.",
        },
        steps: {
          customer: [
            {
              number: "01",
              badge: "Discovery & Voice",
              title: "Find Nearby Tailors",
              description: "Search verified local tailors by radius and specialty, or speak your request naturally in Hindi or English using Gemini AI.",
            },
            {
              number: "02",
              badge: "Measurements",
              title: "Set Your Perfect Fit",
              description: "Save your body measurements once to your profile to reuse anytime, or select in-person measuring during checkout.",
            },
            {
              number: "03",
              badge: "Direct Quotes",
              title: "Review & Accept Quotes",
              description: "Receive transparent upfront service pricing or tailor-submitted quotes. Accept with one click with zero hidden charges.",
            },
            {
              number: "04",
              badge: "Live Tracking",
              title: "Track & Pick Up",
              description: "Follow real-time status as your garment moves from cutting to ready for pickup or home delivery.",
            },
          ],
          tailor: [
            {
              number: "01",
              badge: "Studio Listing",
              title: "List & Get Verified",
              description: "Showcase your specialties (Ethnic, Suits, Shirts, Alterations), pricing, and turnaround times. Earn a verified badge.",
            },
            {
              number: "02",
              badge: "Direct Client Orders",
              title: "Receive Retail Requests",
              description: "Get direct stitching requests from nearby customers, review specifications, and send instant custom price quotes.",
            },
            {
              number: "03",
              badge: "B2B Bulk Jobs",
              title: "Accept High-Volume Bulk Work",
              description: "Browse corporate & institutional bulk requirements (uniforms, batch apparel) to keep your workshop busy year-round.",
            },
            {
              number: "04",
              badge: "Status & Growth",
              title: "Manage & Expand",
              description: "Update production milestones with 1 click, collect 5-star customer ratings, and grow your local tailoring brand.",
            },
          ],
          business: [
            {
              number: "01",
              badge: "Post Requirement",
              title: "Submit Bulk Specs",
              description: "Post your organizational clothing needs with required volume (20 to 500+ units), timeline, fabrics, and sample needs.",
            },
            {
              number: "02",
              badge: "Verified Proposals",
              title: "Compare Tailor Bids",
              description: "Receive competitive proposals from verified tailoring workshops with production capacity and transparent pricing.",
            },
            {
              number: "03",
              badge: "Sample Approval",
              title: "Quality & Batch Production",
              description: "Approve physical samples and track manufacturing milestones with full transparency and verified quality checks.",
            },
            {
              number: "04",
              badge: "Scheduled Dispatch",
              title: "Timely Delivery & Invoicing",
              description: "Get on-time batch deliveries with centralized requirement tracking, status alerts, and corporate invoicing.",
            },
          ],
        },
        highlights: {
          customer: ["Radius-based search", "Saved body measurements", "Voice AI assistant", "Transparent quotes"],
          tailor: ["Dual income: Retail + Bulk", "Direct customer requests", "Verified workshop badge", "Zero middleman fee"],
          business: ["Volume pricing", "Verified workshop network", "Sample approvals", "Dedicated tracking"],
        },
        ctas: {
          customerPrimary: "Find Local Tailors",
          customerSecondary: "Track My Orders",
          tailorPrimary: "Open Tailor Dashboard",
          tailorSecondary: "Explore Bulk Opportunities",
          businessPrimary: "Post Bulk Requirement",
          businessSecondary: "View Business Requests",
          getStarted: "Get Started Free",
        },
      },

      howItWorksPage: {
        badge: "HOW MERATAILOR WORKS",
        title: "Tailoring Made Effortless for Everyone",
        intro: "Whether you need bespoke garments, want to place bulk organizational orders, or are a tailor looking to serve retail clients and take large-scale bulk work — MeraTailor connects the entire journey seamlessly.",
        stepsCustomerEyebrow: "4 Simple Steps",
        stepsCustomerTitle: "From Discovery to Perfect Fit",
        stepsTailorEyebrow: "Tailor Partner Journey",
        stepsTailorTitle: "Grow Your Craft & Client Base",
        stepsBusinessEyebrow: "B2B Production Lifecycle",
        stepsBusinessTitle: "Streamlined Bulk Apparel Procurement",
        findNearbyBtn: "Find Nearby Tailors Now",
        postBulkBtn: "Post a Bulk Requirement",
        openTailorBtn: "Open Tailor Workspace",
        coreTechEyebrow: "Core Technology",
        coreTechTitle: "Engineered for Precision & Trust",
        coreTechSubtitle: "Four unique pillars that make MeraTailor India’s premier bespoke tailoring platform.",
        voiceTitle: "Bilingual Voice AI Assistant",
        voiceDesc: "Powered by Google Gemini, speak naturally in Hindi, English, or mixed Hinglish. Speak what you need and the app extracts specifications instantly.",
        voiceTag: "✓ Multilingual AI transcription · Automatic intent parsing",
        fitTitle: "Reusable Fit Profiles Vault",
        fitDesc: "Store body measurements (Chest, Waist, Hip, Shoulder, Sleeve, Length) in centimeters on your account. Reuse them across different tailoring requests or opt for physical measuring.",
        fitTag: "✓ Zero repetitive measuring · Precision fit guarantee",
        guardTitle: "Pre-Production Cancellation Guard",
        guardDesc: "Orders in pre-production stages (Request Sent / Quote Received) can be deleted anytime with a single tap. Once removed, the request is permanently cleared for both user and tailor.",
        guardTag: "✓ Safe order lifecycle · Dual-side instant sync",
        directTitle: "Direct Connection & Fair Pricing",
        directDesc: "Call your tailor directly, discuss fabric selection, and review transparent tailor quotes without middlemen markups or hidden fees.",
        directTag: "✓ 100% direct artisan connection · Transparent quotes",
        comparisonEyebrow: "Why MeraTailor",
        comparisonTitle: "Traditional Tailoring vs. MeraTailor",
        comparisonFeature: "Feature",
        comparisonTraditional: "Traditional Method",
        comparisonMeraTailor: "MeraTailor Platform",
        faqEyebrow: "Got Questions?",
        faqTitle: "Frequently Asked Questions",
        ctaEyebrow: "Start Stitching Today",
        ctaTitle: "Experience the Future of Custom Tailoring",
        ctaSubtitle: "Join thousands of customers and master artisans across Jaipur and India who trust MeraTailor for seamless, transparent tailoring.",
        ctaPrimary: "Find Nearby Tailors",
        ctaSecondary: "Join MeraTailor Free"
      },

      dashboardPage: {
        overview: "Overview",
        orders: "Orders",
        measurements: "Measurements",
        savedTailors: "Saved Tailors",
        profileSettings: "Profile & Settings",
        tailorWorkspace: "Tailor Workspace",
        bulkRequirements: "Bulk Requirements",
        accountOverview: "Account Overview",
        editProfile: "Edit Profile",
        searchPreferences: "Search Preferences",
        activityHighlights: "Activity Highlights",
        activeOrders: "Active Orders",
        quotesReady: "Quotes Ready",
        fitProfiles: "Fit Profiles",
        savedStudios: "Saved Studios",
        activeStitching: "Active Stitching Progress",
        viewAll: "View All",
        noActiveOrders: "No active orders right now",
        noActiveOrdersHelp: "Ready to stitch something custom? Search verified tailors in your radius.",
        findTailorsNearMe: "Find Tailors Near Me",
        myOrdersTitle: "My Tailoring Orders",
        myOrdersSubtitle: "Manage order quotes, track production milestones, and delete pre-production requests.",
        searchOrdersPlaceholder: "Search orders...",
        filterAll: "All",
        filterInProgress: "In Progress",
        filterQuotesReady: "Quotes Ready",
        filterCompleted: "Completed",
        noMatchingOrders: "No matching orders found",
        noMatchingOrdersHelp: "Explore local tailors to place a new tailoring request.",
        totalPrice: "Total Price",
        awaitingReview: "Awaiting Review",
        acceptQuote: "Accept Quote",
        accepting: "Accepting…",
        viewDetails: "View Details",
        delete: "Delete",
        savedMeasurementsTitle: "Saved Measurement Profiles",
        savedMeasurementsSubtitle: "Save body measurement profiles once and attach them seamlessly to any tailor request.",
        addProfile: "Add Profile",
        noMeasurementsTitle: "No measurement profiles yet",
        noMeasurementsDesc: "Create your first fit profile (Chest, Waist, Shoulders, Length) to speed up orders.",
        createFitProfile: "Create Fit Profile",
        updated: "Updated",
        savedTailorsTitle: "Saved Tailor Studios",
        savedTailorsSubtitle: "Your bookmarked local artisans and alteration experts.",
        discoverMore: "Discover More →",
        noSavedTailorsTitle: "No saved tailors yet",
        noSavedTailorsDesc: "Explore the tailor directory and tap \"Save Tailor\" to keep them in your collection.",
        starting: "Starting",
        call: "Call",
        viewStudio: "View Studio",
        personalProfileTitle: "Personal Profile Details",
        personalProfileSubtitle: "View your registered credentials, contact information, and preferences.",
        firstName: "First Name",
        lastName: "Last Name",
        emailAddress: "Email Address",
        securedViaClerk: "Secured via Clerk",
        phoneNumber: "Phone Number",
        notConfigured: "Not configured",
        savedLocationTitle: "Saved Location & Search Area",
        currentSavedAddress: "Current Saved Address",
        gpsCoordinates: "GPS Coordinates",
        useCurrentGPS: "Use Current GPS",
        searchPlacePlaceholder: "Search city, area, or PIN code...",
        update: "Update",
        updatingLocation: "Updating location…",
        tailorWorkshopTitle: "Tailor Workshop & Retail Requests",
        tailorWorkshopSubtitle: "Send price quotes and update production milestones for customer requests.",
        viewPublicStudio: "View Public Studio",
        noTailorRequests: "No new customer requests at this time.",
        quoteTotal: "Quote Total (₹)",
        sendQuote: "Send Quote",
        decline: "Decline",
        startProduction: "Start Production →",
        markReady: "Mark Ready for Pickup ✓",
        markCompleted: "Mark Completed 🎉",
        bulkTitle: "Organization Bulk Requirements",
        bulkSubtitle: "Manage batch orders, corporate apparel, and supplier proposals.",
        postRequirement: "Post Requirement",
        noBulkRequests: "No bulk requirements submitted yet.",
        volume: "Volume",
        timeline: "Timeline",
        units: "units",
        tailoringMember: "Tailoring Member",
        verified: "Verified",
        findTailors: "Find Tailors",
        language: "Language",
        joined: "Joined",
        activeMember: "Active Member",
        kmRadius: "km radius",
        sort: "Sort",
        studio: "Studio",
        quote: "Quote",
        est: "Est",
        awaitingQuote: "Awaiting quote",
        detailsAndActions: "Details & Actions →",
        add: "Add",
        noMeasurementsHelp: "No saved measurements yet. Save your fit profile once to reuse across orders.",
        noSavedTailorsHelp: "Bookmark your favorite tailors from the discovery map to find them here.",
        edit: "Edit",
        cancel: "Cancel",
        saveChanges: "Save Changes",
        editProfileTitle: "Edit Profile & Preferences",
        editProfileSubtitle: "Update your name, bio, contact, and search filters.",
        bioLabel: "Bio / Short Statement",
        bioPlaceholder: "Tell tailors about your style or tailoring requirements...",
        prefLangLabel: "Preferred Language",
        searchRadiusLabel: "Search Radius",
        defaultSortingLabel: "Default Sorting",
        preferredCategoriesLabel: "Preferred Clothing Specialties",
        newFitProfile: "New Fit Profile",
        editFitProfile: "Edit Fit Profile",
        fitProfileSubtitle: "Enter body measurements in centimeters (cm).",
        profileName: "Profile Name",
        profileNamePlaceholder: "e.g. My Formal Fit",
        garmentType: "Garment Type",
        saveProfile: "Save Profile",
        saving: "Saving…",
        orderDetails: "Order Details",
        currentStatus: "Current Status",
        activeOrder: "Active Order",
        color: "Color",
        fabric: "Fabric",
        notes: "Notes",
        totalPriceOrQuote: "Total Price / Final Quote",
        awaitingStudioQuote: "Awaiting Studio Quote",
        deleteRequest: "Delete Request",
        close: "Close",
        deleteOrderHeading: "Delete Order #{{id}}?",
        keepOrder: "Keep Order",
        yesDeleteOrder: "Yes, Delete Order",
        deleting: "Deleting…",
        editBulkTitle: "Edit Bulk Requirement",
        postBulkTitle: "Post Bulk Requirement",
        bulkSubtitleModal: "Submit institutional apparel & uniform specifications.",
        orgNameLabel: "Organization / Company Name",
        reqDescLabel: "Requirement Description",
        reqDescPlaceholder: "e.g. 100 sets of bespoke staff blazers with customized embroidery...",
        quantityUnitsLabel: "Quantity (Units)",
        reqTimelineLabel: "Required Timeline",
        reqTimelinePlaceholder: "e.g. 30 days",
        submitRequirement: "Submit Requirement"
      },


      /* ===================================================
         FOOTER
      ================================================== */

      footer: {
        description:
          "Find trusted local tailors, get the right measurements, and get your clothes stitched with ease.",

        location:
          "Find local tailors wherever you are",

        quickLinks:
          "Quick Links",

        forYou:
          "For You",

        orders:
          "My Orders",

        profile:
          "My Profile",

        contact:
          "Contact Us",

        getInTouch:
          "Get in Touch",

        support:
          "Need help? We're here for you.",

        rights:
          "All rights reserved.",

        madeWith:
          "Made with ❤️ in India",

        privacy:
          "Privacy",

        terms:
          "Terms",
      },
    },
  },

  /* =====================================================
     HINDI
  ====================================================== */

  hi: {
    translation: {
      /* ===================================================
         NAVBAR
      ================================================== */

      navbar: {
        home: "होम",

        findTailors:
          "दर्जी खोजें",

        bulk:
          "थोक के लिए",

        howItWorks:
          "कैसे काम करता है",

        myTailors:
          "मेरे दर्जी",

        orders:
          "मेरे ऑर्डर",

        language:
          "भाषा",

        signIn:
          "लॉग इन",

        getStarted:
          "शुरू करें",

        joinMeraTailor:
          "MeraTailor से जुड़ें",

        hello:
          "नमस्ते",

        viewProfile:
          "प्रोफ़ाइल देखें",

        // User roles
        customer:
          "ग्राहक",
        tailor: "दर्जी",
        business: "व्यवसाय",
        admin: "एडमिन",
        guest: "अतिथि",
        dashboard: "डैशबोर्ड",
        adminPortal: "एडमिन पोर्टल",
        notifications: "सूचनाएं",
        markAllRead: "सभी पढ़ी हुई मार्क करें",
        clearAll: "सभी हटाएं",
        noNotifications: "अभी कोई सूचना नहीं है",
      },

      notifications: {
        new: "नई",
        confirmClear: "क्या सभी सूचनाएं स्थायी रूप से हटाएं?",
        allCaughtUp: "सब कुछ पढ़ा जा चुका है!",
        loading: "सूचनाएं लोड हो रही हैं…",
      },

      discovery: { eyebrow: "खोजें", title: "दर्जी खोजें", intro: "किसी भी जगह के आसपास कुशल दर्जी खोजें। अपना क्षेत्र और दूरी चुनें।", locationPlaceholder: "शहर, क्षेत्र या पिन कोड चुनें", searchArea: "यह क्षेत्र खोजें", useLocation: "वर्तमान लोकेशन इस्तेमाल करें", queryPlaceholder: "कपड़ा, दर्जी, क्षेत्र, शहर…", search: "खोजें", radius: "खोज की दूरी", category: "श्रेणी", allCategories: "सभी श्रेणियाँ", hideMap: "मैप छिपाएँ", showMap: "मैप दिखाएँ", sort: "क्रम", recommended: "सुझाए गए", distance: "दूरी", rating: "रेटिंग", understood: "आपकी जरूरत समझी:", submitRequest: "यह जरूरत खोजें", searching: "खोज रहे हैं…", withinDays: "{{count}} दिनों के अंदर", voiceRequestError: "आवाज़ वाला अनुरोध पढ़ा नहीं जा सका। कृपया फिर कोशिश करें।", chooseLocationFirst: "पास के दर्जी खोजने के लिए क्षेत्र चुनें या लोकेशन की अनुमति दें।", locationUnavailable: "इस ब्राउज़र में लोकेशन उपलब्ध नहीं है। क्षेत्र से खोजें।", voiceUnavailable: "यहाँ आवाज़ से इनपुट उपलब्ध नहीं है। अपनी ज़रूरत लिखें।", voiceError: "आवाज़ सुनाई नहीं दी। फिर कोशिश करें या अपनी ज़रूरत लिखें।", placeSearchError: "जगह की खोज नहीं हो सकी।", directoryError: "दर्जी सूची लोड नहीं हो सकी।", invalidDirectory: "दर्जी सूची का मैप डेटा सही नहीं है।", currentLocation: "वर्तमान लोकेशन", mapCenter: "मैप केंद्र {{center}}", tailorsWithin: "{{radius}} किमी के अंदर {{count}} दर्जी", kmAway: "{{distance}} किमी दूर", newRating: "नया", searchVoice: "अपनी ज़रूरत बोलें", chooseLocation: "पास के दर्जी खोजने के लिए क्षेत्र चुनें", chooseLocationHelp: "ऊपर शहर, क्षेत्र या पिन कोड चुनें या वर्तमान लोकेशन इस्तेमाल करें। पुष्टि किए बिना प्रोफ़ाइल में लोकेशन सेव नहीं होगी।", noResults: "इस दूरी में दर्जी नहीं मिले। दूरी बढ़ाएँ या दूसरा क्षेत्र खोजें।", locationError: "यह जगह नहीं मिली। शहर, क्षेत्र या पिन कोड आज़माएँ।", locationDenied: "लोकेशन अनुमति नहीं मिली। शहर या क्षेत्र से खोजें।", categoryNames: { "Men's Wear": "पुरुषों के कपड़े", "Ladies Wear": "महिलाओं के कपड़े", "Formal Wear": "फॉर्मल कपड़े", "Ethnic Wear": "पारंपरिक कपड़े", Shirt: "शर्ट", Pants: "पैंट", Dress: "ड्रेस", Suit: "सूट", Alteration: "अल्टरशन" }, colorNames: { black: "काला", white: "सफेद", blue: "नीला", red: "लाल", green: "हरा", yellow: "पीला", pink: "गुलाबी", maroon: "मैरून", purple: "बैंगनी", orange: "नारंगी", brown: "भूरा", grey: "ग्रे" } },
      portals: { dashboard: "डैशबोर्ड", welcome: "वापसी पर स्वागत है", orders: "ऑर्डर", savedTailors: "सेव किए दर्जी", measurements: "नाप", location: "खोज लोकेशन", radius: "डिफ़ॉल्ट दूरी", tailorTitle: "दर्जी कार्यक्षेत्र", tailorText: "ग्राहक अनुरोध देखें, अपनी प्रोफ़ाइल संभालें और सेवा क्षेत्र अपडेट रखें।", businessTitle: "व्यवसाय कार्यक्षेत्र", businessText: "थोक जरूरतें संभालें, दर्जियों के प्रस्तावों की तुलना करें और उत्पादन ट्रैक करें।", adminTitle: "प्रशासन", adminText: "रजिस्टर्ड खाते और दर्जी सूची प्रबंधित करें।", users: "उपयोगकर्ता", tailors: "दर्जी", email: "ईमेल", role: "भूमिका", status: "स्थिति", actions: "कार्रवाई", active: "सक्रिय", disabled: "बंद", save: "सेव करें", delete: "हटाएँ", addTailor: "दर्जी जोड़ें", editTailor: "दर्जी संपादित करें", ownerClerkUserId: "दर्जी का Clerk यूज़र ID", createTestUser: "लोकल टेस्ट यूज़र बनाएँ", name: "नाम", city: "शहर", country: "देश", area: "क्षेत्र", category: "श्रेणियाँ", latitude: "अक्षांश", longitude: "देशांतर", phone: "फ़ोन", noAccess: "आपको इस पोर्टल का एक्सेस नहीं है।", loadError: "डेटा लोड नहीं हो सका।", confirmDelete: "क्या यह खाता और इसका Clerk लॉगिन स्थायी रूप से हटाएँ?", bulkTitle: "थोक सिलाई अब आसान।", bulkIntro: "यूनिफॉर्म, कलेक्शन और बड़े कस्टम ऑर्डर के लिए अपने व्यवसाय को कुशल दर्जियों से जोड़ें।", postRequirement: "जरूरत पोस्ट करें", findRightTailor: "सही दर्जी खोजें", getQuotes: "कई कोटेशन पाएँ", manageProduction: "उत्पादन प्रबंधित करें", feature1Text: "अपने काम के प्रकार और मात्रा को संभालने वाले प्रोफेशनल खोजें।", feature2Text: "अपनी जरूरत बताएँ और दर्जियों के प्रस्तावों की तुलना करें।", feature3Text: "थोक ऑर्डर को जरूरत से पूरा होने तक व्यवस्थित रखें।", process: "जरूरत से उत्पादन तक।", steps: ["अपनी जरूरत बताएँ", "दर्जी के प्रस्ताव पाएँ", "तुलना करके जुड़ें", "उत्पादन ट्रैक करें"], requirementSent: "आपकी जरूरत भेज दी गई है।", quantity: "मात्रा", timeline: "समयसीमा", requirement: "क्या बनवाना है?", organization: "संस्था" },

      /* ===================================================
         HOME
      ================================================== */

      home: {
        /* =================================================
           HERO
        ================================================= */

        location:
          "अपनी जगह चुनें",

        brand:
          "मेरा Tailor",

        tagline:
          "अपना दर्जी, अब आसानी से।",

        description:
          "अपने आसपास भरोसेमंद स्थानीय दर्जी खोजें, अपनी जरूरत बताएं, नाप एक बार सेव करें और सिलाई के पूरे ऑर्डर एक ही जगह से आसानी से मैनेज करें।",

        findTailors:
          "दर्जी खोजें",

        tellUsNeed:
          "अपनी जरूरत बताएं",

        voiceEyebrow: "आवाज़ से सिलाई सहायक",
        voiceTitle: "आप क्या सिलवाना चाहते हैं?",
        voiceHelp: "हिन्दी या अंग्रेज़ी में बोलें या लिखें। आपकी ज़रूरत दर्जी खोज में जुड़ जाएगी; खोजने के लिए साइन इन करना ज़रूरी नहीं है।",
        voiceAutoLanguage: "Gemini बोली गई हिन्दी, अंग्रेज़ी और दोनों के मिश्रण को अपने-आप पहचानता है।",
        voiceRequestLabel: "आपकी ज़रूरत",
        voicePlaceholder: "उदाहरण: 5 किमी के अंदर नीली शर्ट सिलवानी है, 7 दिनों में चाहिए।",
        voiceSpeak: "अपनी ज़रूरत बोलें",
        voiceStop: "रोकें और लिखित रूप पाएँ",
        voiceTranscribing: "Gemini आवाज़ को लिख रहा है…",
        voiceContinue: "मिलते-जुलते दर्जी खोजें",
        voiceClose: "आवाज़ सहायक बंद करें",
        voiceRecording: "सुन रहा है… रोकने के लिए दबाएँ",
        voicePrivacyShort: "आवाज़ लिखने के लिए Gemini को भेजी जाएगी · गोपनीयता",
        voicePrivacy: "माइक्रोफ़ोन की रिकॉर्डिंग लिखने के लिए Google Gemini को भेजी जाती है और प्रोसेसिंग के बाद उसकी अस्थायी फ़ाइल से हटा दी जाती है। Google मुफ़्त टियर के डेटा का उपयोग अपने उत्पाद बेहतर करने के लिए कर सकता है। संवेदनशील जानकारी न बोलें।",
        voiceUnsupported: "इस ब्राउज़र में आवाज़ से इनपुट उपलब्ध नहीं है। अपनी ज़रूरत लिखें।",
        voicePermission: "इस साइट के लिए माइक्रोफ़ोन बंद है। साइट सेटिंग में अनुमति देकर फिर कोशिश करें।",
        voiceEmbeddedPermission: "यह embedded preview माइक्रोफ़ोन रोकता है। ऐप को सीधे ब्राउज़र टैब में खोलें और माइक्रोफ़ोन की अनुमति दें।",
        voiceCaptureBlocked: "अनुमति है, लेकिन यह preview माइक्रोफ़ोन नहीं खोल पा रहा। ऐप को सीधे Chrome या Edge में खोलें। फिर भी न चले तो डिवाइस की माइक्रोफ़ोन प्राइवेसी और चुना हुआ इनपुट जाँचें।",
        voiceNoMicrophone: "माइक्रोफ़ोन नहीं मिला। कनेक्ट करें या अपनी ज़रूरत लिखें।",
        voiceMicBusy: "माइक्रोफ़ोन व्यस्त है या उपलब्ध नहीं है। उसे इस्तेमाल कर रहे दूसरे ऐप बंद करके फिर कोशिश करें।",
        voiceSecureContext: "माइक्रोफ़ोन के लिए सुरक्षित पेज ज़रूरी है। ऐप को HTTPS या localhost पर खोलें।",
        voiceNoAudio: "आवाज़ साफ़ रिकॉर्ड नहीं हुई। फिर कोशिश करें या अपनी ज़रूरत लिखें।",
        voiceMaxDuration: "30 सेकंड बाद रिकॉर्डिंग रोक दी गई।",
        voiceGeminiNotConfigured: "इस सर्वर पर Gemini सेट नहीं है। सर्वर की .env फ़ाइल में GEMINI_API_KEY जोड़कर सर्वर फिर शुरू करें।",
        voiceGeminiRateLimited: "Gemini की अनुरोध सीमा अभी पूरी है। थोड़ी देर बाद फिर कोशिश करें।",
        voiceAudioTooLarge: "रिकॉर्डिंग बहुत बड़ी है। छोटी रिकॉर्डिंग करें।",
        voiceAudioUnsupported: "यह माइक्रोफ़ोन फ़ॉर्मैट समर्थित नहीं है। अपनी ज़रूरत लिखें।",
        voiceGeminiError: "Gemini रिकॉर्डिंग लिख नहीं सका। फिर कोशिश करें या अपनी ज़रूरत लिखें।",
        voiceTryAgain: "आवाज़ साफ़ सुनाई नहीं दी। फिर कोशिश करें या अपनी ज़रूरत लिखें।",
        voiceClear: "हटाएं",
        voiceUnderstood: "आपकी आवश्यकताएं समझी गईं:",
        voiceAiReady: "✓ AI तैयार",
        voiceQuickIdeas: "सुझाव (हिन्दी / अंग्रेज़ी):",

        verifiedTailors:
          "420+ स्थानीय दर्जी",

        rating:
          "4.8 औसत रेटिंग",

        /* =================================================
           HERO DASHBOARD
        ================================================= */

        yourTailorLabel:
          "आपकी व्यक्तिगत सिलाई की जगह",

        myTailor:
          "मेरा दर्जी",

        tailorName:
          "आपका दर्जी",

        tailorSpeciality:
          "कस्टम सिलाई और अल्टरशन",

        nearYou:
          "आपके पास",

        saveTailor:
          "दर्जी सेव करें",

        measurements:
          "नाप",

        myOrders:
          "मेरे ऑर्डर",

        chat:
          "चैट",

        call:
          "कॉल",

        saveFavourite:
          "अपने पसंदीदा दर्जी सेव करें",

        buildPersonalList:
          "अपनी व्यक्तिगत सूची बनाएं",

        currentOrder:
          "वर्तमान ऑर्डर",

        orderName:
          "आपका वर्तमान ऑर्डर",

        inProgress:
          "काम चल रहा है",

        stitching:
          "सिलाई का काम",

        readyDate:
          "4 दिनों में तैयार",

        viewOrder:
          "ऑर्डर देखें",

        measurementSaved:
          "नाप सेव है",

        measurementDescription:
          "अगले ऑर्डर के लिए तैयार",

        callTailor:
          "अपने दर्जी को कॉल करें",

        directConnection:
          "सीधा संपर्क",

        /* =================================================
           HERO FEATURES
        ================================================= */

        featureFindTitle:
          "पास के दर्जी खोजें",

        featureFindText:
          "भरोसेमंद स्थानीय प्रोफेशनल खोजें",

        featureMeasureTitle:
          "नाप सेव करें",

        featureMeasureText:
          "एक बार नापें, कभी भी इस्तेमाल करें",

        featureOrderTitle:
          "ऑर्डर ट्रैक करें",

        featureOrderText:
          "सिलाई से डिलीवरी तक अपडेट पाएं",

        /* =================================================
           HOW IT WORKS
        ================================================= */

        howItWorksTitle:
          "कैसे काम करता है",

        step1:
          "चरण 1",

        step1Title:
          "दर्जी खोजें",

        step1Text:
          "अपनी लोकेशन से 1–20 किमी के अंदर स्थानीय दर्जी खोजें।",

        step2:
          "चरण 2",

        step2Title:
          "सीधे जुड़ें",

        step2Text:
          "एक टैप में कॉल करें, अपनी जरूरत बताएं और कीमत तय करें।",

        step3:
          "चरण 3",

        step3Title:
          "ऑर्डर ट्रैक करें",

        step3Text:
          "नाप से लेकर डिलीवरी तक हर चरण को ऐप में ट्रैक करें।",

        /* =================================================
           TRUST METRICS
        ================================================= */
        trustVerifiedTailors: "420+ सत्यापित दर्जी",
        trustVerifiedSub: "आपके क्षेत्र के अनुभवी कारीगर",
        trustFitAccuracy: "99.2% सटीक फिटिंग",
        trustFitSub: "फिटिंग गारंटी व सुधार सुविधा",
        trustOrdersDelivered: "18,500+ पूर्ण ऑर्डर",
        trustOrdersSub: "व्यक्तिगत व बल्क यूनिफॉर्म",
        trustAvgTurnaround: "3–5 दिनों में डिलीवरी",
        trustAvgSub: "एक्सप्रेस डिलीवरी विकल्प",

        /* =================================================
           WHAT TO STITCH
        ================================================= */
        whatToStitch: "आप क्या सिलवाना चाहते हैं?",
        exploreServices: "सिलाई सेवाएं देखें",
        whatToStitchSubtitle: "अपने क्षेत्र में विशेषज्ञ दर्जी खोजने के लिए कोई भी श्रेणी चुनें।",
        viewAllServices: "सभी सिलाई सेवाएं देखें",
        customFit: "कस्टम फिटिंग",
        popular: "लोकप्रिय",

        categories: {
          shirt: "शर्ट",
          shirtPrice: "₹349+",
          shirtTag: "फॉर्मल व कैजुअल",

          pants: "पतलून व पैंट",
          pantsPrice: "₹399+",
          pantsTag: "चीनोस, फॉर्मल, जीन्स",

          dress: "महिलाओं के परिधान",
          dressPrice: "₹499+",
          dressTag: "ब्लाउज, गाउन, ड्रेसेस",

          suit: "सूट व शेरवानी",
          suitPrice: "₹1,499+",
          suitTag: "थ्री-पीस, टक्सीडो, सफारी",

          ethnic: "पारंपरिक व एथनिक",
          ethnicPrice: "₹799+",
          ethnicTag: "लहंगा, कुर्ती, साड़ी",

          formal: "फॉर्मल व ऑफिस वियर",
          formalPrice: "₹699+",
          formalTag: "ब्लेज़र, ओवरकोट",

          alteration: "अल्टरेशन व मरम्मत",
          alterationPrice: "₹99+",
          alterationTag: "फिटिंग, रीसाइज़, रफू",
        },

        /* =================================================
           FEATURED TAILORS
        ================================================= */
        featuredTailors: "प्रमुख मास्टर दर्जी और बुटीक",
        featuredSubtitle: "पारदर्शी दरों, वास्तविक रेटिंग और फिटिंग गारंटी के साथ अपने आसपास के सत्यापित दर्जी खोजें।",
        featuredBadge: "लाइव दर्जी सूची",
        viewAll: "मैप पर सभी देखें",
        startingFrom: "शुरुआती दर",
        yrsExp: "वर्ष अनुभव",
        reviewsCount: "समीक्षाएं",
        viewProfile: "प्रोफ़ाइल देखें",
        call: "कॉल करें",
        signInToContact: "संपर्क के लिए साइन इन करें",
        signInToViewLocation: "लोकेशन देखने के लिए साइन इन करें",
        getStartedToContact: "संपर्क करने के लिए शुरुआत करें",
        getStartedToViewLocation: "लोकेशन देखने के लिए शुरुआत करें",
        locationHidden: "लोकेशन देखने के लिए शुरुआत करें",
        allStudios: "सभी दर्जी",
        catEthnic: "पारंपरिक व एथनिक",
        catLadies: "महिलाएं व ब्राइडल",
        catFormal: "फॉर्मल व सूट",
        catAlteration: "अल्टरेशन व मरम्मत",
        cantFindTitle: "क्या आपको मनचाहा डिज़ाइन नहीं मिल रहा?",
        cantFindSub: "ब्राइडल, कॉर्पोरेट यूनिफॉर्म या अर्जेंट अल्टरेशन के लिए हमारे AI आवाज़ सहायक या एरिया सर्च का उपयोग करें।",
        searchNearMe: "आसपास के दर्जी खोजें",
        personalizedDiscovery: "व्यक्तिगत दर्जी खोज",
        noTailorsCategory: "इस श्रेणी में कोई दर्जी नहीं मिला",
        noTailorsSub: "दूसरी श्रेणियां देखें या मैप में उपलब्ध सभी स्टूडियो देखें।",
        showAllTailors: "सभी दर्जी देखें",

        /* =================================================
           EVERYONE
        ================================================= */
        everyoneEyebrow: "सिलाई जगत में हर किसी के लिए",
        everyoneTitle: "सिलाई की हर ज़रूरत के लिए एक मंच",
        everyoneSubtitle: "चाहे एक पोशाक सिलवानी हो या बड़े पैमाने पर बल्क यूनिफॉर्म बनवानी हो, मेरा टेलर सब कुछ आसान बनाता है।",

        audience: {
          customerBadge: "ग्राहकों के लिए",
          customerTitle: "ग्राहक और खरीदार",
          customerSubtitle: "बिना किसी परेशानी के स्थानीय अनुभवी दर्जियों से मनचाही फिटिंग पाएं।",
          customerPoints: [
            "डिजिटल क्लाउड वॉल्ट में नाप एक बार सेव करें",
            "पास के विशेषज्ञों के लिए AI वॉयस और रेडियस सर्च",
            "1-टैप डायरेक्ट कॉल, पारदर्शी कीमतें व फैब्रिक सलाह",
            "कटिंग से लेकर डिलीवरी तक लाइव स्टेटस अपडेट",
          ],
          customerCta: "पास के दर्जी खोजें",

          tailorBadge: "दर्जियों के लिए दोहरा अवसर",
          tailorTitle: "दर्जी और बुटीक",
          tailorSubtitle: "स्थानीय ग्राहकों के ऑर्डर और बड़े बल्क कॉन्ट्रैक्ट लेकर अपना कारोबार बढ़ाएं।",
          tailorPoints: [
            "दोहरी कमाई: खुदरा ग्राहक + संस्थागत बल्क ऑर्डर",
            "मुफ़्त डिजिटल ऑर्डर मैनेजमेंट और नाप की बही",
            "सीधा ग्राहक संपर्क, बिना किसी छिपे कमीशन के",
            "शहर में भरोसा बढ़ाने के लिए वेरिफाइड बैज पाएं",
          ],
          tailorCta: "दर्जी के रूप में जुड़ें",

          bulkBadge: "बिजनेस व कॉर्पोरेट",
          bulkTitle: "बिजनेस और ब्रांड्स",
          bulkSubtitle: "अनुभवी उत्पादक दर्जियों से यूनिफॉर्म, बुटीक कलेक्शन और इवेंट के कपड़े तैयार करवाएं।",
          bulkPoints: [
            "बल्क रिक्वायरमेंट पोस्ट करें और कोटेशन की तुलना करें",
            "पूरे लॉट से पहले सैंपल की जांच व अप्रूवल",
            "उत्पादन माइलस्टोन ट्रैकिंग और समय पर डिलीवरी गारंटी",
            "जीएसटी इनवॉइस और समर्पित प्रोडक्शन सपोर्ट",
          ],
          bulkCta: "बल्क रिक्वायरमेंट पोस्ट करें",
        },

        /* =================================================
           LOCATION
        ================================================= */

        tailorsAroundYou:
          "आपके आसपास के दर्जी",

        findRightTailor:
          "सही दर्जी खोजें",

        nearLocation:
          "अपने पास।",

        locationDescription:
          "अपनी लोकेशन की मदद से आसपास के भरोसेमंद दर्जी खोजें, उनकी सेवाओं की तुलना करें और सही प्रोफेशनल से जुड़ें।",

        locationBenefitNearby:
          "अपने आसपास के दर्जी खोजें",

        locationBenefitSpecialist:
          "अपने कपड़ों के लिए विशेषज्ञ खोजें",

        locationBenefitConnect:
          "अपने दर्जी से सीधे जुड़ें",

        whereLocated:
          "आप कहाँ हैं?",

        locationCardDescription:
          "अपने आसपास के दर्जी खोजने के लिए अपनी वर्तमान लोकेशन का इस्तेमाल करें।",

        detectLocation:
          "मेरी लोकेशन पता करें",

        detecting:
          "लोकेशन खोज रहे हैं...",

        locationPrivacy:
          "आपकी लोकेशन का इस्तेमाल केवल आसपास के दर्जी दिखाने के लिए किया जाता है।",

        locationDetectedLabel:
          "लोकेशन मिल गई",

        youAreHere:
          "आप यहाँ हैं",

        yourArea:
          "आपका क्षेत्र",

        yourLocation:
          "आपकी लोकेशन",

        pinCode:
          "पिन कोड",

        detectedAddress:
          "पता",

        findTailorsNearMe:
          "मेरे पास दर्जी खोजें",

        locationAccessNeeded:
          "लोकेशन की अनुमति चाहिए",

        tryAgain:
          "फिर कोशिश करें",

        locationNotSupported:
          "इस ब्राउज़र में लोकेशन सेवा उपलब्ध नहीं है।",

        locationDetected:
          "लोकेशन मिल गई, लेकिन पता प्राप्त नहीं हो सका।",

        locationPermission:
          "जारी रखने के लिए लोकेशन की अनुमति दें।",

        locationUnavailable:
          "अभी आपकी लोकेशन उपलब्ध नहीं है।",

        locationTimeout:
          "लोकेशन अनुरोध का समय समाप्त हो गया।",

        locationError:
          "आपकी लोकेशन पता नहीं चल सकी।",

        saveLocation:
          "आस-पास के दर्ज़ियों के लिए यह जगह सेव करें",

        locationPrivacy:
          "आपकी सटीक लोकेशन केवल आपकी अनुमति के बाद सेव होगी।",

        notAvailable:
          "उपलब्ध नहीं",

        /* =================================================
           JAIPUR / LOCAL TRUST
        ================================================= */

        jaipurImageAlt:
          "जयपुर की वास्तुकला",

        builtForCity:
          "आपके मोहल्ले के लिए बनाया गया",

        jaipurKnows:
          "आपका मोहल्ला, आपका दर्जी",

        goodCraftsmanship:
          "अच्छी कारीगरी।",

        jaipurDescription:
          "रोज़मर्रा के अल्टरशन से लेकर शादी के कपड़ों तक, MeraTailor आपको स्थानीय प्रोफेशनल खोजने और लंबे समय तक भरोसेमंद दर्जियों से जुड़ने में मदद करता है।",

        localProfessionals:
          "स्थानीय प्रोफेशनल",

        localProfessionalsText:
          "अपने आसपास के कुशल दर्जियों को खोजें।",

        directConnectionText:
          "अपने दर्जी से सीधे बात करें और अपनी जरूरत बताएं।",

        buildFavourites:
          "अपने पसंदीदा दर्जी बनाएं",

        buildFavouritesText:
          "भरोसेमंद दर्जियों को सेव करें और जरूरत पड़ने पर दोबारा चुनें।",

        /* =================================================
           CTA
        ================================================= */

        ctaEyebrow:
          "आपकी सही सिलाई यहीं से शुरू होती है",

        ctaTitle:
          "अपना",

        ctaTitleAccent:
          "दर्जी खोजने के लिए तैयार?",

        ctaText:
          "अपने आसपास भरोसेमंद दर्जी खोजें और अपना अगला आउटफिट आसानी से तैयार करवाएं।",

        ctaButton:
          "दर्जी खोजें",
      },


      howItWorks: {
        badge: "यह कैसे काम करता है",
        title: "हर किसी के लिए सिलाई हुई और भी आसान",
        intro:
          "चाहे आपको खुद के लिए कपड़े सिलवाने हों, संस्था के लिए थोक ऑर्डर देना हो, या आप एक दर्जी हैं जो खुदरा ग्राहकों के साथ-साथ बड़े थोक (B2B Bulk) ऑर्डर्स पर भी काम करना चाहते हैं — MeraTailor सभी को एक सहज मंच पर जोड़ता है।",
        activeRole: "आपकी वर्तमान भूमिका",
        switchRoles: "अलग-अलग भूमिकाएं देखें",
        dualCapabilityBadge: "दोहरी कमाई: खुदरा ग्राहक + थोक (B2B Bulk) ऑर्डर्स",
        recommendedForYou: "आपके अकाउंट के लिए अनुशंसित",
        tabs: {
          customer: "ग्राहकों के लिए",
          customerSubtitle: "स्थानीय दर्जी खोजें, नाप सुरक्षित रखें और मनपसंद कपड़े सिलवाएं।",
          tailor: "दर्जियों और वर्कशॉप के लिए",
          tailorSubtitle: "स्थानीय ग्राहकों से सीधे जुड़ें और साथ ही बड़े थोक (Bulk) ऑर्डर्स पर काम करके अपनी कमाई बढ़ाएं।",
          business: "थोक व व्यवसाय के लिए",
          businessSubtitle: "यूनिफॉर्म, परिधान और बड़े पैमाने पर सिलाई के लिए सत्यापित दर्जियों से जुड़ें।",
        },
        steps: {
          customer: [
            {
              number: "01",
              badge: "खोज व वॉयस इनपुट",
              title: "आसपास के दर्जी खोजें",
              description: "दूरी और श्रेणी के आधार पर सत्यापित दर्जी खोजें, या Gemini AI से हिन्दी/अंग्रेजी में बोलकर अपनी जरूरत बताएं।",
            },
            {
              number: "02",
              badge: "नाप व पसंद",
              title: "सटीक नाप तय करें",
              description: "अपना नाप प्रोफाइल में एक बार सुरक्षित रखें या ऑर्डर के समय खुद दर्जी से नाप लेने का विकल्प चुनें।",
            },
            {
              number: "03",
              badge: "पारदर्शी कोटेशन",
              title: "कोटेशन देखें और ऑर्डर दें",
              description: "दर्जी से सीधी कीमत और समय का कोटेशन प्राप्त करें और बिना किसी छिपे शुल्क के आसानी से कन्फर्म करें।",
            },
            {
              number: "04",
              badge: "लाइव ट्रैकिंग",
              title: "ट्रैक करें और डिलीवरी पाएं",
              description: "सिलाई की शुरुआत से लेकर तैयार होने तक हर कदम को ऐप में लाइव ट्रैक करें और समय पर प्राप्त करें।",
            },
          ],
          tailor: [
            {
              number: "01",
              badge: "दुकान लिस्टिंग",
              title: "लिस्ट करें और सत्यापित हों",
              description: "अपनी विशेषताएं (एथनिक, सूट, शर्ट, अल्टरेशन), सिलाई दरें और समय जोड़ें। ग्राहकों का भरोसा जीतने के लिए वेरिफाइड बनें।",
            },
            {
              number: "02",
              badge: "सीधे ग्राहक ऑर्डर",
              title: "ग्राहकों से ऑर्डर प्राप्त करें",
              description: "आसपास के ग्राहकों से सीधे सिलाई अनुरोध प्राप्त करें, आवश्यकताएं समझें और अपनी कस्टम कोटेशन भेजें।",
            },
            {
              number: "03",
              badge: "थोक (Bulk) अवसर",
              title: "थोक B2B ऑर्डर लेकर काम बढ़ाएं",
              description: "कंपनियों और स्कूलों के बड़े यूनिफॉर्म व थोक ऑर्डर्स के लिए कोटेशन देकर अपनी वर्कशॉप को साल भर व्यस्त रखें।",
            },
            {
              number: "04",
              badge: "स्टेटस और कमाई",
              title: "ऑर्डर पूरा करें और आगे बढ़ें",
              description: "एक क्लिक में ऑर्डर स्टेटस अपडेट करें, अच्छी रेटिंग पाएं और अपना स्थानीय सिलाई ब्रांड मजबूत करें।",
            },
          ],
          business: [
            {
              number: "01",
              badge: "आवश्यकता पोस्ट करें",
              title: "थोक आवश्यकता साझा करें",
              description: "अपनी संस्था के लिए यूनिफॉर्म या परिधानों की संख्या (20 से 500+), समय, फैब्रिक और सैंपल आवश्यकता दर्ज करें।",
            },
            {
              number: "02",
              badge: "सत्यापित प्रस्ताव",
              title: "दर्जियों के प्रपोजल देखें",
              description: "कुशल और सत्यापित दर्जी वर्कशॉप से प्रतिस्पर्धी दरें और क्षमता प्रस्ताव प्राप्त करें।",
            },
            {
              number: "03",
              badge: "सैंपल और प्रोडक्शन",
              title: "सैंपल अप्रूवल और सिलाई",
              description: "सैंपल की गुणवत्ता जांचें और बैच प्रोडक्शन की स्थिति को पारदर्शी तरीके से ट्रैक करें।",
            },
            {
              number: "04",
              badge: "समय पर डिलीवरी",
              title: "तय समय पर डिलीवरी व इनवॉइस",
              description: "पारदर्शी इनवॉइसिंग और सेंट्रल ट्रैकिंग के साथ समय पर डिलीवरी प्राप्त करें।",
            },
          ],
        },
        highlights: {
          customer: ["दूरी के अनुसार खोज", "सुरक्षित बॉडी मेजरमेंट्स", "वॉयस AI असिस्टेंट", "पारदर्शी कोटेशन"],
          tailor: ["दोहरी आय: खुदरा + थोक", "सीधे ग्राहक अनुरोध", "सत्यापित वर्कशॉप बैज", "शून्य बिचौलिया शुल्क"],
          business: ["थोक डिस्काउंट", "सत्यापित वर्कशॉप नेटवर्क", "सैंपल अप्रूवल", "समर्पित ट्रैकिंग"],
        },
        ctas: {
          customerPrimary: "आसपास के दर्जी खोजें",
          customerSecondary: "मेरे ऑर्डर ट्रैक करें",
          tailorPrimary: "दर्जी डैशबोर्ड खोलें",
          tailorSecondary: "थोक अवसर देखें",
          businessPrimary: "थोक आवश्यकता पोस्ट करें",
          businessSecondary: "बिजनेस रिक्वेस्ट्स देखें",
          getStarted: "शुरू करें",
        },
      },

      howItWorksPage: {
        badge: "MeraTailor कैसे काम करता है",
        title: "सिलाई अब सबके लिए आसान",
        intro: "चाहे आपको मनपसंद कपड़े सिलवाने हों, संस्थागत थोक ऑर्डर देने हों, या आप खुद एक दर्जी हों जो नए ग्राहकों और थोक काम की तलाश में हैं — MeraTailor पूरी प्रक्रिया को आसान बनाता है।",
        stepsCustomerEyebrow: "4 आसान कदम",
        stepsCustomerTitle: "खोज से लेकर सही फिटिंग तक",
        stepsTailorEyebrow: "दर्जी पार्टनर का सफर",
        stepsTailorTitle: "अपना हुनर और कमाई बढ़ाएं",
        stepsBusinessEyebrow: "थोक सिलाई प्रक्रिया",
        stepsBusinessTitle: "आसान थोक परिधान सिलाई",
        findNearbyBtn: "पास के दर्जी खोजें",
        postBulkBtn: "थोक आवश्यकता पोस्ट करें",
        openTailorBtn: "दर्जी कार्यक्षेत्र खोलें",
        coreTechEyebrow: "मुख्य विशेषताएं",
        coreTechTitle: "सटीकता और भरोसे के लिए निर्मित",
        coreTechSubtitle: "चार अनूठी विशेषताएं जो MeraTailor को भारत का सबसे भरोसेमंद सिलाई प्लेटफॉर्म बनाती हैं।",
        voiceTitle: "द्विभाषी वॉयस AI सहायक",
        voiceDesc: "Google Gemini द्वारा संचालित, हिन्दी या अंग्रेजी में बोलें और तुरंत सही दर्जी खोजें।",
        voiceTag: "✓ बहुभाषी AI ट्रांसक्रिप्शन · स्वचालित जरूरत पहचान",
        fitTitle: "सुरक्षित नाप प्रोफाइल",
        fitDesc: "सेंटीमीटर में अपना सटीक नाप प्रोफाइल में सेव रखें। हर बार दोबारा नाप देने का झंझट खत्म।",
        fitTag: "✓ बार-बार नापने की जरूरत नहीं · सही फिट की गारंटी",
        guardTitle: "सिलाई पूर्व ऑर्डर निरस्तीकरण सुरक्षा",
        guardDesc: "सिलाई शुरू होने से पहले (अनुरोध भेजा / कोटेशन मिला) ऑर्डर कभी भी एक टैप में हटाएं। यह दोनों पक्षों से सुरक्षित रूप से हट जाएगा।",
        guardTag: "✓ सुरक्षित ऑर्डर प्रक्रिया · दोनों तरफ तुरंत अपडेट",
        directTitle: "सीधा संपर्क और पारदर्शी दरें",
        directDesc: "दर्जी को सीधे कॉल करें, कपड़े और डिजाइन पर बात करें और बिना किसी बिचौलिया शुल्क के सही कोटेशन पाएं।",
        directTag: "✓ 100% सीधा संपर्क · पारदर्शी कोटेशन",
        comparisonEyebrow: "MeraTailor ही क्यों",
        comparisonTitle: "पारंपरिक सिलाई बनाम MeraTailor",
        comparisonFeature: "सुविधा",
        comparisonTraditional: "पारंपरिक तरीका",
        comparisonMeraTailor: "MeraTailor प्लेटफॉर्म",
        faqEyebrow: "कोई सवाल है?",
        faqTitle: "अक्सर पूछे जाने वाले सवाल",
        ctaEyebrow: "आज ही शुरू करें",
        ctaTitle: "कस्टम सिलाई के नए दौर का अनुभव करें",
        ctaSubtitle: "जयपुर और भारत भर के उन हजारों ग्राहकों और दर्जियों से जुड़ें जो MeraTailor पर भरोसा करते हैं।",
        ctaPrimary: "पास के दर्जी खोजें",
        ctaSecondary: "MeraTailor से मुफ्त जुड़ें"
      },

      dashboardPage: {
        overview: "अवलोकन",
        orders: "ऑर्डर",
        measurements: "नाप",
        savedTailors: "सेव किए दर्जी",
        profileSettings: "प्रोफ़ाइल व सेटिंग्स",
        tailorWorkspace: "दर्जी कार्यक्षेत्र",
        bulkRequirements: "थोक आवश्यकताएं",
        accountOverview: "खाता विवरण",
        editProfile: "प्रोफ़ाइल संपादित करें",
        searchPreferences: "खोज प्राथमिकताएं",
        activityHighlights: "गतिविधि सारांश",
        activeOrders: "सक्रिय ऑर्डर",
        quotesReady: "कोटेशन तैयार",
        fitProfiles: "नाप प्रोफाइल",
        savedStudios: "सेव किए दर्जी",
        activeStitching: "सिलाई की लाइव प्रगति",
        viewAll: "सभी देखें",
        noActiveOrders: "अभी कोई सक्रिय ऑर्डर नहीं है",
        noActiveOrdersHelp: "कस्टम सिलाई के लिए तैयार हैं? अपने क्षेत्र में सत्यापित दर्जी खोजें।",
        findTailorsNearMe: "मेरे पास के दर्जी खोजें",
        myOrdersTitle: "मेरे सिलाई ऑर्डर",
        myOrdersSubtitle: "कोटेशन देखें, सिलाई की स्थिति ट्रैक करें और सिलाई पूर्व ऑर्डर हटाएं।",
        searchOrdersPlaceholder: "ऑर्डर खोजें...",
        filterAll: "सभी",
        filterInProgress: "सिलाई जारी",
        filterQuotesReady: "कोटेशन तैयार",
        filterCompleted: "पूरा हुआ",
        noMatchingOrders: "कोई मेल खाता ऑर्डर नहीं मिला",
        noMatchingOrdersHelp: "नया सिलाई अनुरोध देने के लिए स्थानीय दर्जी खोजें।",
        totalPrice: "कुल कीमत",
        awaitingReview: "समीक्षा जारी",
        acceptQuote: "कोटेशन स्वीकार करें",
        accepting: "स्वीकार किया जा रहा है…",
        viewDetails: "विवरण देखें",
        delete: "हटाएं",
        savedMeasurementsTitle: "सेव किए गए नाप प्रोफ़ाइल",
        savedMeasurementsSubtitle: "एक बार नाप सेव करें और किसी भी सिलाई अनुरोध में जोड़ें।",
        addProfile: "नाप जोड़ें",
        noMeasurementsTitle: "अभी कोई नाप प्रोफ़ाइल नहीं है",
        noMeasurementsDesc: "सिलाई तेज करने के लिए अपनी पहली फिटिंग प्रोफ़ाइल (सीना, कमर, कंधा, लंबाई) बनाएं।",
        createFitProfile: "नाप प्रोफ़ाइल बनाएं",
        updated: "अपडेट किया गया",
        savedTailorsTitle: "सेव किए गए दर्जी",
        savedTailorsSubtitle: "आपके पसंदीदा स्थानीय दर्जी और अल्टरेशन विशेषज्ञ।",
        discoverMore: "और दर्जी खोजें →",
        noSavedTailorsTitle: "अभी कोई सेव किया दर्जी नहीं है",
        noSavedTailorsDesc: "दर्जी डायरेक्टरी देखें और पसंदीदा दर्जियों को सेव करें।",
        starting: "शुरुआती",
        call: "कॉल करें",
        viewStudio: "स्टूडियो देखें",
        personalProfileTitle: "व्यक्तिगत प्रोफ़ाइल विवरण",
        personalProfileSubtitle: "अपनी संपर्क जानकारी और प्राथमिकताएं देखें।",
        firstName: "पहला नाम",
        lastName: "अंतिम नाम",
        emailAddress: "ईमेल पता",
        securedViaClerk: "Clerk द्वारा सुरक्षित",
        phoneNumber: "फ़ोन नंबर",
        notConfigured: "दर्ज नहीं है",
        savedLocationTitle: "सेव की गई लोकेशन और खोज क्षेत्र",
        currentSavedAddress: "वर्तमान सेव किया गया पता",
        gpsCoordinates: "GPS निर्देशांक",
        useCurrentGPS: "वर्तमान GPS लोकेशन लें",
        searchPlacePlaceholder: "शहर, क्षेत्र या पिन कोड खोजें...",
        update: "अपडेट करें",
        updatingLocation: "लोकेशन अपडेट हो रही है…",
        tailorWorkshopTitle: "दर्जी कार्यशाला और ग्राहक अनुरोध",
        tailorWorkshopSubtitle: "ग्राहकों को कोटेशन भेजें और सिलाई की प्रगति अपडेट करें।",
        viewPublicStudio: "पब्लिक स्टूडियो देखें",
        noTailorRequests: "इस समय कोई नया ग्राहक अनुरोध नहीं है।",
        quoteTotal: "कोटेशन राशि (₹)",
        sendQuote: "कोटेशन भेजें",
        decline: "अस्वीकार करें",
        startProduction: "सिलाई शुरू करें →",
        markReady: "पिकअप के लिए तैयार मार्क करें ✓",
        markCompleted: "सम्पन्न मार्क करें 🎉",
        bulkTitle: "संस्थागत थोक आवश्यकताएं",
        bulkSubtitle: "यूनिफॉर्म, बैच ऑर्डर और प्रस्ताव प्रबंधित करें।",
        postRequirement: "आवश्यकता पोस्ट करें",
        noBulkRequests: "अभी कोई थोक आवश्यकता पोस्ट नहीं की गई है।",
        volume: "मात्रा",
        timeline: "समय-सीमा",
        units: "यूनिट्स",
        tailoringMember: "सिलाई सदस्य",
        verified: "सत्यापित",
        findTailors: "दर्जी खोजें",
        language: "भाषा",
        joined: "शामिल हुए",
        activeMember: "सक्रिय सदस्य",
        kmRadius: "किमी दायरा",
        sort: "क्रमबद्ध करें",
        studio: "स्टूडियो",
        quote: "कोटेशन",
        est: "अनुमानित",
        awaitingQuote: "कोटेशन की प्रतीक्षा",
        detailsAndActions: "विवरण और क्रियाएं →",
        add: "जोड़ें",
        noMeasurementsHelp: "अभी कोई नाप सेव नहीं है। हर बार इस्तेमाल करने के लिए एक बार नाप सेव करें।",
        noSavedTailorsHelp: "खोज मैप से अपने पसंदीदा दर्जियों को यहां सहेजने के लिए बुकमार्क करें।",
        edit: "संपादित करें",
        cancel: "रद्द करें",
        saveChanges: "बदलाव सहेजें",
        editProfileTitle: "प्रोफ़ाइल व प्राथमिकताएं संपादित करें",
        editProfileSubtitle: "अपना नाम, बायो, संपर्क और खोज फ़िल्टर अपडेट करें।",
        bioLabel: "बायो / संक्षिप्त विवरण",
        bioPlaceholder: "दर्जियों को अपनी पसंद या सिलाई आवश्यकताओं के बारे में बताएं...",
        prefLangLabel: "पसंदीदा भाषा",
        searchRadiusLabel: "खोज दायरा",
        defaultSortingLabel: "डिफ़ॉल्ट क्रम",
        preferredCategoriesLabel: "पसंदीदा वस्त्र श्रेणियां",
        newFitProfile: "नई नाप प्रोफ़ाइल",
        editFitProfile: "नाप प्रोफ़ाइल संपादित करें",
        fitProfileSubtitle: "सेंटीमीटर (cm) में शरीर का नाप दर्ज करें।",
        profileName: "प्रोफ़ाइल नाम",
        profileNamePlaceholder: "उदा. मेरा फॉर्मल फिट",
        garmentType: "परिधान प्रकार",
        saveProfile: "नाप सहेजें",
        saving: "सहेजा जा रहा है…",
        orderDetails: "ऑर्डर विवरण",
        currentStatus: "वर्तमान स्थिति",
        activeOrder: "सक्रिय ऑर्डर",
        color: "रंग",
        fabric: "कपड़ा (फैब्रिक)",
        notes: "टिप्पणियां / निर्देश",
        totalPriceOrQuote: "कुल मूल्य / अंतिम कोटेशन",
        awaitingStudioQuote: "स्टूडियो कोटेशन की प्रतीक्षा",
        deleteRequest: "अनुरोध हटाएं",
        close: "बंद करें",
        deleteOrderHeading: "ऑर्डर #{{id}} हटाएं?",
        keepOrder: "ऑर्डर रखें",
        yesDeleteOrder: "हाँ, ऑर्डर हटाएं",
        deleting: "हटाया जा रहा है…",
        editBulkTitle: "थोक आवश्यकता संपादित करें",
        postBulkTitle: "थोक आवश्यकता पोस्ट करें",
        bulkSubtitleModal: "संस्थागत परिधान और यूनिफॉर्म विवरण सबमिट करें।",
        orgNameLabel: "संस्था / कंपनी का नाम",
        reqDescLabel: "आवश्यकता विवरण",
        reqDescPlaceholder: "उदा. 100 सेट स्टाफ ब्लेज़र अनुकूलित कढ़ाई के साथ...",
        quantityUnitsLabel: "मात्रा (यूनिट्स)",
        reqTimelineLabel: "अपेक्षित समय-सीमा",
        reqTimelinePlaceholder: "उदा. 30 दिन",
        submitRequirement: "आवश्यकता सबमिट करें"
      },


      /* ===================================================
         FOOTER
      ================================================== */

      footer: {
        description:
          "अपने भरोसेमंद स्थानीय दर्जी खोजें, सही माप लें और आसानी से अपने कपड़े सिलवाएं।",

        location:
          "आप जहाँ हों, वहीं स्थानीय दर्जी खोजें",

        quickLinks:
          "त्वरित लिंक",

        forYou:
          "आपके लिए",

        orders:
          "मेरे ऑर्डर",

        profile:
          "मेरी प्रोफ़ाइल",

        contact:
          "संपर्क करें",

        getInTouch:
          "हमसे जुड़ें",

        support:
          "मदद चाहिए? हम आपकी सहायता के लिए यहाँ हैं।",

        rights:
          "सर्वाधिकार सुरक्षित।",

        madeWith:
          "भारत में ❤️ के साथ बनाया गया",

        privacy:
          "गोपनीयता",

        terms:
          "नियम और शर्तें",
      },
    },
  },
};

/* =====================================================
   SAVED LANGUAGE
====================================================== */

const savedLanguage =
  localStorage.getItem("meraTailorLanguage") || "en";

resources.en.translation.auth = { signInRequired: "Sign in to continue." };
resources.hi.translation.auth = { signInRequired: "आगे बढ़ने के लिए लॉग इन करें।" };
resources.en.translation.discovery.categories = { mens: "Men's Wear", ladies: "Ladies Wear", formal: "Formal Wear", ethnic: "Ethnic Wear", shirt: "Shirt", pants: "Pants", dress: "Dress", suit: "Suit", alteration: "Alteration" };
resources.hi.translation.discovery.categories = { mens: "पुरुषों के कपड़े", ladies: "महिलाओं के कपड़े", formal: "फॉर्मल कपड़े", ethnic: "एथनिक वियर", shirt: "शर्ट", pants: "पैंट", dress: "ड्रेस", suit: "सूट", alteration: "अल्टरशन" };
resources.en.translation.discovery.mapCenter = "Map center";
resources.hi.translation.discovery.mapCenter = "मैप का केंद्र";

resources.en.translation.pages = {
  howTitle: "How MeraTailor works", howIntro: "From finding the right professional to getting a great fit, manage the tailoring journey in a few clear steps.", howSteps: ["Find a tailor", "Connect directly", "Share measurements", "Get your perfect fit"], howDescriptions: ["Search skilled professionals around your chosen location.", "Discuss your design, fabric, price and timeline directly.", "Use a saved fit profile or agree on a measurement method.", "Confirm the order and stay in touch through completion."],
  ordersEyebrow: "YOUR ACTIVITY", ordersTitle: "My Orders", ordersIntro: "Track your tailoring requests and previous orders.", noOrders: "No orders yet", noOrdersHelp: "Your confirmed tailoring requests will appear here.", orderStatus: "Status", tailor: "Tailor", orderDate: "Date", viewTailors: "Find a tailor", inProgress: "In progress", completed: "Completed", requestSent: "Request sent",
  savedEyebrow: "YOUR COLLECTION", savedTitle: "My Tailors", savedIntro: "Your trusted tailoring professionals in one place.", noSaved: "No saved tailors yet", noSavedHelp: "Save a tailor from discovery and they will appear here.", callTailor: "Call tailor", discover: "Discover tailors",
  profileTitle: "My profile", profileIntro: "Manage your contact details and search preferences.", firstName: "First name", lastName: "Last name", phone: "Phone number", radius: "Default search radius", saveProfile: "Save profile", profileSaved: "Profile updated.", locationPrivacy: "Your saved search location is used only to find nearby tailors.", accountType: "Account type", location: "Saved location",
  contactTitle: "Get in touch", contactIntro: "Questions about tailoring, orders or your account? Send us a note.", contactName: "Your name", contactEmail: "Email address", contactSubject: "Subject", contactMessage: "How can we help?", sendMessage: "Send message", messageSent: "Thanks. Your message is ready for our support team.", required: "Please complete the required fields.",
  formNotes: "Notes", close: "Close", cancel: "Cancel", confirm: "Confirm", error: "Something went wrong. Please try again.", contactHelp: "We're here to help", contactHero: "Let's talk about your perfect fit.", contactExperience: "Have a question, need help finding a tailor, or want to tell us about your experience? MeraTailor is always happy to hear from you.", callUs: "Call us", madeWithCare: "Made with care.", careText: "From the first measurement to the final stitch, we're building a better way to connect people with trusted tailoring.", emailUs: "Email us", selectTopic: "Select a topic", topicFinding: "Finding a tailor", topicOrder: "Order support", topicPartner: "Become a tailor partner", topicBusiness: "Business enquiry", topicFeedback: "Feedback", topicOther: "Something else", enterName: "Enter your name", messagePlaceholder: "Tell us how we can help...", finalContactTitle: "We're just a message away.", finalContactText: "Have an idea, question, or feedback for MeraTailor? We'd love to hear from you."
};
resources.hi.translation.pages = {
  howTitle: "MeraTailor कैसे काम करता है", howIntro: "सही प्रोफेशनल खोजने से लेकर बेहतरीन फिट पाने तक, सिलाई के सफर को कुछ आसान चरणों में संभालें।", howSteps: ["दर्जी खोजें", "सीधे बात करें", "नाप साझा करें", "सही फिट पाएँ"], howDescriptions: ["अपनी चुनी हुई जगह के आसपास कुशल प्रोफेशनल खोजें।", "डिज़ाइन, कपड़े, कीमत और समय पर सीधे चर्चा करें।", "सेव किया नाप इस्तेमाल करें या नाप लेने का तरीका तय करें।", "ऑर्डर कन्फर्म करें और काम पूरा होने तक संपर्क में रहें।"],
  ordersEyebrow: "आपकी गतिविधि", ordersTitle: "मेरे ऑर्डर", ordersIntro: "अपने सिलाई अनुरोध और पुराने ऑर्डर ट्रैक करें।", noOrders: "अभी कोई ऑर्डर नहीं", noOrdersHelp: "आपके कन्फर्म किए गए सिलाई अनुरोध यहाँ दिखेंगे।", orderStatus: "स्थिति", tailor: "दर्जी", orderDate: "तारीख", viewTailors: "दर्जी खोजें", inProgress: "काम जारी", completed: "पूरा हुआ", requestSent: "अनुरोध भेजा गया",
  savedEyebrow: "आपका संग्रह", savedTitle: "मेरे दर्जी", savedIntro: "आपके भरोसेमंद दर्जी एक ही जगह।", noSaved: "अभी कोई दर्जी सेव नहीं", noSavedHelp: "खोज में किसी दर्जी को सेव करें, वह यहाँ दिखेगा।", callTailor: "दर्जी को कॉल करें", discover: "दर्जी खोजें",
  profileTitle: "मेरी प्रोफ़ाइल", profileIntro: "संपर्क जानकारी और खोज की प्राथमिकताएँ संभालें।", firstName: "पहला नाम", lastName: "उपनाम", phone: "फ़ोन नंबर", radius: "खोज की डिफ़ॉल्ट दूरी", saveProfile: "प्रोफ़ाइल सेव करें", profileSaved: "प्रोफ़ाइल अपडेट हो गई।", locationPrivacy: "सेव लोकेशन का इस्तेमाल केवल आसपास के दर्जी खोजने के लिए है।", accountType: "खाते का प्रकार", location: "सेव लोकेशन",
  contactTitle: "हमसे संपर्क करें", contactIntro: "सिलाई, ऑर्डर या खाते के बारे में सवाल हैं? हमें संदेश भेजें।", contactName: "आपका नाम", contactEmail: "ईमेल पता", contactSubject: "विषय", contactMessage: "हम आपकी कैसे मदद करें?", sendMessage: "संदेश भेजें", messageSent: "धन्यवाद। आपका संदेश सहायता टीम को भेजने के लिए तैयार है।", required: "कृपया जरूरी जानकारी भरें।",
  formNotes: "नोट्स", close: "बंद करें", cancel: "रद्द करें", confirm: "पुष्टि करें", error: "कुछ गड़बड़ हुई। फिर कोशिश करें।", contactHelp: "हम आपकी मदद के लिए हैं", contactHero: "आइए, आपकी सही फिट की बात करें।", contactExperience: "कोई सवाल है, दर्जी खोजने में मदद चाहिए या अपना अनुभव साझा करना चाहते हैं? MeraTailor आपकी बात सुनने के लिए तैयार है।", callUs: "कॉल करें", madeWithCare: "ध्यान से बनाया गया।", careText: "पहले नाप से आखिरी सिलाई तक, हम लोगों को भरोसेमंद दर्जियों से जोड़ने का बेहतर तरीका बना रहे हैं।", emailUs: "ईमेल करें", selectTopic: "विषय चुनें", topicFinding: "दर्जी खोजने में मदद", topicOrder: "ऑर्डर सहायता", topicPartner: "दर्जी पार्टनर बनें", topicBusiness: "व्यवसाय संबंधी सवाल", topicFeedback: "सुझाव", topicOther: "कुछ और", enterName: "अपना नाम लिखें", messagePlaceholder: "बताएँ कि हम आपकी कैसे मदद करें...", finalContactTitle: "हमसे संपर्क करना आसान है।", finalContactText: "MeraTailor के लिए कोई विचार, सवाल या सुझाव है? हमें बताएं।"
};

/* =====================================================
   INITIALIZE I18N
====================================================== */

resources.en.translation.authFlow = {
  close:'Close', chooseRole:'What brings you to MeraTailor?', signUpIntro:'Choose how you will use MeraTailor. We will ask you to continue with secure Clerk sign-in next.', signInIntro:'Choose your account type, then continue with secure Clerk sign-in.', adminHint:'For authorized administrators only.', customerHint:'Discover tailors, save preferences and manage orders.', tailorHint:'Manage your tailoring profile and customer work.', businessHint:'Find partners for uniforms and bulk production.', clerkNote:'Your password and verification are handled by Clerk.', step:'Your account setup', welcome:'Let’s set up your account', roleSelected:'Account type: {{role}}', locationTitle:'Where should we look for tailors?', locationIntro:'Add a location for nearby results and radius searches. You can skip this and add it later in your profile.', currentLocation:'Saved location', useCurrent:'Use my current location', placePlaceholder:'Search city, area or postal code', search:'Search', confirmLocation:'Confirm and save this location', privacy:'Your location is saved only after you choose to use or confirm it. It powers nearby tailor search.', skip:'Skip for now', addOrSkip:'Add a location or choose “Skip for now” to continue.', continue:'Finish setup', working:'Please wait…', loading:'Loading your account…', accountLoadError:'Could not load permissions from the account server: {{error}}', locationSaved:'Location saved. Nearby tailors are ready to discover!', locationPrompt:'Add a location to find tailors near you.', openProfile:'Open profile', locationError:'Could not save this location.', finishError:'Could not finish account setup.', geoUnavailable:'Location is unavailable. Search for a city or area instead.', geoDenied:'Location permission was not granted. Search for a city or area instead.', placeNotFound:'No matching place found. Try a nearby city or postal code.'
};
resources.hi.translation.authFlow = {
  close:'बंद करें', chooseRole:'आप MeraTailor का उपयोग कैसे करेंगे?', signUpIntro:'MeraTailor में अपनी भूमिका चुनें। इसके बाद सुरक्षित Clerk साइन इन खुलेगा।', signInIntro:'अपनी भूमिका चुनें, फिर सुरक्षित Clerk साइन इन करें।', adminHint:'केवल अधिकृत एडमिन के लिए।', customerHint:'दर्जी खोजें, पसंद सेव करें और ऑर्डर संभालें।', tailorHint:'अपनी दर्जी प्रोफ़ाइल और ग्राहक काम संभालें।', businessHint:'यूनिफॉर्म और थोक उत्पादन के लिए साझेदार खोजें।', clerkNote:'पासवर्ड और सत्यापन Clerk सुरक्षित रूप से संभालता है।', step:'खाता सेटअप', welcome:'आइए आपका खाता सेट करें', roleSelected:'खाते का प्रकार: {{role}}', locationTitle:'दर्जी कहाँ खोजें?', locationIntro:'आसपास के परिणाम और दूरी की खोज के लिए स्थान जोड़ें। चाहें तो अभी छोड़कर बाद में प्रोफ़ाइल में जोड़ें।', currentLocation:'सेव किया स्थान', useCurrent:'मेरा वर्तमान स्थान इस्तेमाल करें', placePlaceholder:'शहर, इलाका या पिन कोड खोजें', search:'खोजें', confirmLocation:'इस स्थान की पुष्टि करके सेव करें', privacy:'आपके चुनने या पुष्टि करने के बाद ही स्थान सेव होगा। इसका उपयोग आसपास के दर्जी खोजने में होगा।', skip:'अभी छोड़ें', addOrSkip:'आगे बढ़ने के लिए स्थान जोड़ें या “अभी छोड़ें” चुनें।', continue:'सेटअप पूरा करें', working:'कृपया प्रतीक्षा करें…', loading:'खाता लोड हो रहा है…', accountLoadError:'खाता सर्वर से अनुमतियाँ लोड नहीं हो सकीं: {{error}}', locationSaved:'स्थान सेव हो गया। आसपास के दर्जी खोजें!', locationPrompt:'आसपास के दर्जी खोजने के लिए स्थान जोड़ें।', openProfile:'प्रोफ़ाइल खोलें', locationError:'स्थान सेव नहीं हो सका।', finishError:'खाता सेटअप पूरा नहीं हो सका।', geoUnavailable:'स्थान उपलब्ध नहीं है। शहर या इलाका खोजें।', geoDenied:'स्थान अनुमति नहीं मिली। शहर या इलाका खोजें।', placeNotFound:'स्थान नहीं मिला। पास का शहर या पिन कोड आज़माएँ।'
};
resources.en.translation.roleApproval = { title:'Role requests', empty:'There are no pending role requests.', requestedAt:'Requested', approve:'Approve role', reject:'Reject request', approved:'Role approved. The user receives the new permissions on their next session.', rejected:'Request rejected. The account keeps its current role.', pendingMessage:'Your account remains {{currentRole}} while your request to become {{role}} awaits admin approval.', rejectedMessage:'Your {{role}} request was declined. Your account remains {{currentRole}}.' };
resources.hi.translation.roleApproval = { title:'भूमिका अनुरोध', empty:'कोई लंबित भूमिका अनुरोध नहीं है।', requestedAt:'अनुरोध की तारीख', approve:'भूमिका स्वीकारें', reject:'अनुरोध अस्वीकारें', approved:'भूमिका स्वीकार हुई। नई अनुमति अगले सत्र में लागू होगी।', rejected:'अनुरोध अस्वीकार हुआ। खाता अपनी मौजूदा भूमिका में रहेगा।', pendingMessage:'एडमिन की मंज़ूरी तक आपका खाता {{currentRole}} रहेगा और {{role}} बनने का अनुरोध लंबित है।', rejectedMessage:'आपका {{role}} अनुरोध अस्वीकार हुआ। आपका खाता {{currentRole}} रहेगा।' };
resources.en.translation.discovery.demoListing = 'Demo listing';
resources.hi.translation.discovery.demoListing = 'डेमो सूची';
resources.en.translation.discovery.callTailor = 'Call tailor';
resources.hi.translation.discovery.callTailor = 'दर्जी को कॉल करें';
resources.en.translation.profile = {
  personalDetails:'Personal details', personalDetailsHelp:'Review and update the information saved for your account.', emailManagedByClerk:'Email and Google sign-in are securely managed by Clerk.', language:'Preferred language', defaultSort:'Default tailor sorting', preferredCategories:'Preferred tailoring categories', price:'Price', locationAndSearch:'Location and search preferences', locationHelp:'Manage your saved location and the radius used to find nearby tailors.', noLocation:'No location saved yet.', coordinates:'Coordinates', locationSource:'Location source', manual:'Manually selected', browser:'Device location', consentRecorded:'Location consent recorded', accuracy:'Location accuracy', measurements:'Your measurements', measurementHelp:'Save measurements by garment, then edit or remove them here.', measurementName:'Profile name', garment:'Garment', chest:'Chest', waist:'Waist', hip:'Hip', shoulder:'Shoulder', sleeve:'Sleeve', length:'Length', lastUpdated:'Updated', noMeasurements:'No measurement profiles yet.', addMeasurement:'Add measurements', editMeasurement:'Edit measurements', deleteMeasurement:'Delete measurements', measurementSaved:'Measurements saved.', measurementDeleted:'Measurements deleted.', businessRequirements:'Your bulk requirements', businessRequirementsHelp:'Requirements submitted by your organization and their current status.', yourRequirements:'Requirements placed by your organization', noRequirements:'No requirements submitted yet.', openBulk:'Open bulk orders', tailorListing:'Public tailor listing', viewPublicListing:'View public information', noTailorListing:'No tailor listing is linked to this profile yet.', bulkOpportunities:'Bulk requirements from businesses', bulkOpportunitiesHelp:'Open organization requirements seeking tailoring partners.', noBulkOpportunities:'No open business requirements right now.', status:{ submitted:'Submitted', reviewing:'Reviewing', quoted:'Quoted', 'in-production':'In production', completed:'Completed', cancelled:'Cancelled' }
};
resources.hi.translation.profile = {
  personalDetails:'व्यक्तिगत जानकारी', personalDetailsHelp:'अपने खाते में सेव जानकारी देखें और अपडेट करें।', emailManagedByClerk:'ईमेल और Google साइन इन Clerk सुरक्षित रूप से संभालता है।', language:'पसंदीदा भाषा', defaultSort:'दर्जी सूची का क्रम', preferredCategories:'पसंदीदा सिलाई श्रेणियाँ', price:'कीमत', locationAndSearch:'लोकेशन और खोज प्राथमिकताएँ', locationHelp:'सेव लोकेशन और आसपास के दर्जी खोजने की दूरी संभालें।', noLocation:'अभी कोई लोकेशन सेव नहीं है।', coordinates:'निर्देशांक', locationSource:'लोकेशन का स्रोत', manual:'खुद चुना गया', browser:'डिवाइस लोकेशन', consentRecorded:'लोकेशन अनुमति का समय', accuracy:'लोकेशन की सटीकता', measurements:'आपके नाप', measurementHelp:'कपड़ों के अनुसार नाप सेव करें और यहाँ बदलें या हटाएँ।', measurementName:'नाप प्रोफ़ाइल का नाम', garment:'कपड़ा', chest:'छाती', waist:'कमर', hip:'कूल्हा', shoulder:'कंधा', sleeve:'आस्तीन', length:'लंबाई', lastUpdated:'अपडेट', noMeasurements:'अभी कोई नाप प्रोफ़ाइल नहीं है।', addMeasurement:'नाप जोड़ें', editMeasurement:'नाप बदलें', deleteMeasurement:'नाप हटाएँ', measurementSaved:'नाप सेव हो गया।', measurementDeleted:'नाप हटा दिया गया।', businessRequirements:'आपकी थोक आवश्यकताएँ', businessRequirementsHelp:'आपके संगठन की भेजी आवश्यकताएँ और उनकी स्थिति।', yourRequirements:'आपके संगठन की रखी गई आवश्यकताएँ', noRequirements:'अभी कोई आवश्यकता नहीं भेजी गई।', openBulk:'थोक ऑर्डर खोलें', tailorListing:'दर्जी की सार्वजनिक प्रोफ़ाइल', viewPublicListing:'सार्वजनिक जानकारी देखें', noTailorListing:'इस प्रोफ़ाइल से अभी कोई दर्जी सूची नहीं जुड़ी है।', bulkOpportunities:'व्यवसायों की थोक आवश्यकताएँ', bulkOpportunitiesHelp:'सिलाई साझेदार खोज रहे संगठनों की खुली आवश्यकताएँ।', noBulkOpportunities:'अभी कोई खुली व्यावसायिक आवश्यकता नहीं है।', status:{ submitted:'जमा हुआ', reviewing:'समीक्षा में', quoted:'कोटेशन भेजा', 'in-production':'उत्पादन में', completed:'पूरा हुआ', cancelled:'रद्द हुआ' }
};
resources.en.translation.tailorView = {
  viewInfo:'View information',
  back:'Back to Tailors',
  eyebrow:'VERIFIED ARTISAN STUDIO',
  loading:'Loading tailor details…',
  notFound:'Tailor not found.',
  new:'New',
  experience:'Experience',
  years:'years',
  startingPrice:'Starting price',
  status:'Availability',
  reviews:'Reviews',
  specialties:'Specialties',
  languages:'Languages',
  services:'Services',
  days:'days',
  call:'Call Studio',
  verifiedMaster:'Verified Master Tailor',
  acceptingOrders:'Accepting Orders',
  openMaps:'View on Google Maps',
  share:'Share Studio',
  linkCopied:'Studio link copied to clipboard!',
  saveToFavorites:'Save Studio',
  savedToFavorites:'Saved to Favorites',
  servicesTitle:'Craftsmanship Services & Rates',
  servicesSubtitle:'Choose a specialty garment to configure custom styling, measurements, and request an instant quote.',
  selectGarment:'Select for Order',
  selected:'Selected',
  estimatedDelivery:'Estimated Turnaround',
  aboutStudio:'About the Master Artisan',
  experienceText:'Years of Tailoring Mastery',
  trustPillarsTitle:'MeraTailor Craftsmanship Guarantee',
  trustPillar1Title:'Bespoke Precision Cut',
  trustPillar1Desc:'Individually cut & styled to your exact body measurements and posture.',
  trustPillar2Title:'Free Alteration Coverage',
  trustPillar2Desc:'Minor fitting adjustments completed promptly with zero extra charges.',
  trustPillar3Title:'Pre-Production Safe Guard',
  trustPillar3Desc:'Cancel or modify anytime before production starts with dual-side auto sync.',
  reviewsTitle:'Neighbourhood Reviews & Ratings',
  reviewsSubtitle:'Feedback from local clients across Jaipur and surrounding areas.',
  noReviewsYet:'No client reviews posted yet. Be the first to place an order and leave feedback!',
  signInToCall:'Sign in to view phone & call studio',
  getStartedToCall:'Get started to view phone & call studio',
  locationHidden:'Sign in to view precise address & directions',
};

resources.hi.translation.tailorView = {
  viewInfo:'जानकारी देखें',
  back:'दर्जी सूची पर वापस जाएँ',
  eyebrow:'सत्यापित कारीगर स्टूडियो',
  loading:'दर्जी की जानकारी लोड हो रही है…',
  notFound:'दर्जी नहीं मिला।',
  new:'नया',
  experience:'अनुभव',
  years:'वर्ष',
  startingPrice:'शुरुआती कीमत',
  status:'उपलब्धता',
  reviews:'समीक्षाएँ',
  specialties:'विशेषताएँ',
  languages:'भाषाएँ',
  services:'सेवाएँ',
  days:'दिन',
  call:'स्टूडियो को कॉल करें',
  verifiedMaster:'सत्यापित मास्टर दर्जी',
  acceptingOrders:'सिलाई के लिए उपलब्ध',
  openMaps:'गूगल मैप पर देखें',
  share:'स्टूडियो साझा करें',
  linkCopied:'स्टूडियो लिंक कॉपी हो गया!',
  saveToFavorites:'स्टूडियो सेव करें',
  savedToFavorites:'पसंदीदा में सेव है',
  servicesTitle:'सिलाई सेवाएं व दरें',
  servicesSubtitle:'अपनी पसंद की सिलाई चुनें, नाप जोड़ें और सीधा कोटेशन प्राप्त करें।',
  selectGarment:'ऑर्डर के लिए चुनें',
  selected:'चुना गया',
  estimatedDelivery:'अनुमानित समय',
  aboutStudio:'कारीगर के बारे में',
  experienceText:'वर्षों का सिलाई अनुभव',
  trustPillarsTitle:'MeraTailor सिलाई सुरक्षा गारंटी',
  trustPillar1Title:'सटीक कस्टम कटिंग',
  trustPillar1Desc:'आपके शरीर के नाप और पसंद के अनुसार विशेष व्यक्तिगत सिलाई।',
  trustPillar2Title:'निःशुल्क सुधार गारंटी',
  trustPillar2Desc:'फिटिंग में बदलाव बिना किसी अतिरिक्त शुल्क के प्राथमिकता से पूरा।',
  trustPillar3Title:'सिलाई पूर्व निरस्तीकरण सुरक्षा',
  trustPillar3Desc:'सिलाई शुरू होने से पहले किसी भी समय बिना झंझट रद्द करें।',
  reviewsTitle:'ग्राहकों की रेटिंग व समीक्षाएं',
  reviewsSubtitle:'स्थानीय पड़ोस के ग्राहकों के वास्तविक अनुभव।',
  noReviewsYet:'अभी कोई समीक्षा नहीं है। पहला ऑर्डर देकर अपनी राय साझा करें!',
  signInToCall:'फ़ोन नंबर देखने और कॉल करने के लिए साइन इन करें',
  getStartedToCall:'फ़ोन नंबर देखने और कॉल करने के लिए शुरुआत करें',
  locationHidden:'सटीक पता और दिशा देखने के लिए शुरुआत करें',
};

resources.en.translation.verification = { title:'Tailor verification', empty:'No unverified tailor profiles.', reviewInfo:'Contact', approve:'Approve verified badge', revoke:'Remove verified badge', approved:'Verified badge approved.', revoked:'Verified badge removed.', badge:'Admin verified', unverified:'Not verified' };
resources.hi.translation.verification = { title:'दर्जी सत्यापन', empty:'कोई असत्यापित दर्जी प्रोफ़ाइल नहीं है।', reviewInfo:'संपर्क', approve:'सत्यापित बैज मंज़ूर करें', revoke:'सत्यापित बैज हटाएँ', approved:'सत्यापित बैज मंज़ूर हुआ।', revoked:'सत्यापित बैज हटा दिया गया।', badge:'एडमिन द्वारा सत्यापित', unverified:'सत्यापित नहीं' };
Object.assign(resources.en.translation.discovery, {
  saveTailor:'Save tailor', removeSaved:'Remove from saved', saved:'Tailor saved to your collection.', removed:'Tailor removed from your collection.', signInToSave:'Sign in to save tailors to your collection.', getStartedToSave:'Get started to save tailors to your collection.', saveError:'Could not update your saved tailors. Please try again.'
});
Object.assign(resources.hi.translation.discovery, {
  saveTailor:'दर्जी सेव करें', removeSaved:'सेव सूची से हटाएँ', saved:'दर्जी आपकी सूची में सेव हो गया।', removed:'दर्जी आपकी सेव सूची से हट गया।', signInToSave:'दर्जी सेव करने के लिए साइन इन करें।', getStartedToSave:'दर्जी सेव करने के लिए शुरुआत करें।', saveError:'सेव किए दर्जी अपडेट नहीं हो सके। फिर कोशिश करें।'
});
resources.en.translation.orderFlow = {
  customStitching:'Custom stitching',
  checkoutEyebrow:'CUSTOM STITCHING BOOKING',
  checkoutTitle:'Order Configuration',
  stepDetails:'1 · Configure Fit',
  stepReview:'2 · Review & Confirm',
  stepConfirmation:'3 · Confirmation',
  service:'Garment Specialty',
  chooseService:'Select garment type…',
  chooseServiceError:'Please select a garment type to continue.',
  quantity:'Quantity (Units)',
  quantityError:'Enter a valid quantity between 1 and 500.',
  deadline:'Completion Timeline',
  flexible:'Flexible Timing',
  days7:'Express (Within 7 days)',
  days14:'Standard (Within 14 days)',
  days30:'Relaxed (Within 30 days)',
  color:'Color / Style Reference',
  colorPlaceholder:'e.g. Royal Navy Blue, Matte Black',
  fabric:'Fabric Source & Material',
  fabricPlaceholder:'e.g. Cotton linen, pure silk (customer provided)',
  measurements:'Body Measurement Mode',
  measureInPerson:'Measure In-Person with Tailor',
  measureInPersonHelp:'Tailor takes physical measurements during studio visit or pickup.',
  savedMeasurement:'Use Saved Fit Profile (cm)',
  savedMeasurementHelp:'Attach a saved fit profile from your account vault.',
  noSavedMeasurement:'No saved fit profiles found. In-person measuring selected.',
  measurementProfile:'Select Fit Profile',
  chooseMeasurement:'Choose from saved profiles…',
  notes:'Custom Styling & Fit Remarks',
  notesPlaceholder:'Specify collar style, pocket requirements, lining preferences, or delivery instructions…',
  estimateTimeline:'Timeline confirmed by studio',
  quoteAfterReview:'Price quote on review',
  reviewOrder:'Proceed to Review & Confirm →',
  reviewTitle:'Review Your Tailoring Request',
  reviewHelp:'Verify your outfit specifications before sending the request to the tailor studio.',
  quoteNotice:'Direct Studio Request: No immediate online payment taken. The tailor will review your styling requirements and provide a confirmed quote in your dashboard.',
  signInToPlace:'Sign in to send this request with 1-click. Your form selections are preserved.',
  getStartedToPlace:'Get started to send this request with 1-click. Your form selections are preserved.',
  getStartedToView:'Get started to view your orders',
  customerOnly:'Ordering is available to customer accounts.',
  editDetails:'← Edit Details',
  placeOrder:'Confirm & Send Order Request ✓',
  signInAndPlace:'Sign in & Send Request',
  getStartedAndPlace:'Get Started & Send Request',
  placing:'Submitting Request…',
  placeError:'Could not place the order request. Please try again.',
  orderPlaced:'Your tailoring request was successfully sent to the studio!',
  confirmationEyebrow:'REQUEST DISPATCHED',
  confirmationTitle:'Tailoring Request Sent Successfully!',
  confirmationHelp:'{{tailor}} has received your request and will review fabric specifications and submit a quote in your dashboard.',
  orderNumber:'ORDER REFERENCE',
  requestStatus:'Awaiting Tailor Quote · Zero Upfront Payment',
  trackOrder:'Track in My Orders →',
  continueShopping:'Explore More Studios',
  orderNow:'Order with this tailor',
  totalEstimate:'Estimated Total',
  viewTailor:'View Studio',
  viewFitDetails:'View Fit Profile',
  orderLifecycleTitle:'Order Lifecycle Preview',
  stage1:'1. Request Sent',
  stage2:'2. Quote Received',
  stage3:'3. Production',
  stage4:'4. Ready / Delivery'
};

resources.hi.translation.orderFlow = {
  customStitching:'कस्टम सिलाई',
  checkoutEyebrow:'सिलाई बुकिंग',
  checkoutTitle:'ऑर्डर कॉन्फ़िगरेशन',
  stepDetails:'1 · नाप व विवरण',
  stepReview:'2 · समीक्षा व पुष्टि',
  stepConfirmation:'3 · पुष्टि',
  service:'परिधान प्रकार',
  chooseService:'परिधान चुनें…',
  chooseServiceError:'आगे बढ़ने के लिए परिधान प्रकार चुनें।',
  quantity:'मात्रा (संख्या)',
  quantityError:'1 से 500 के बीच सही संख्या दर्ज करें।',
  deadline:'डिलीवरी समय-सीमा',
  flexible:'लचीला समय',
  days7:'एक्सप्रेस (7 दिनों में)',
  days14:'मानक (14 दिनों में)',
  days30:'आराम से (30 दिनों में)',
  color:'रंग / डिज़ाइन प्राथमिकता',
  colorPlaceholder:'उदा. रॉयल नेवी ब्लू, मैट ब्लैक',
  fabric:'कपड़े का प्रकार (फैब्रिक)',
  fabricPlaceholder:'उदा. कॉटन लिनन, सिल्क (ग्राहक द्वारा उपलब्ध)',
  measurements:'नाप का तरीका',
  measureInPerson:'दर्जी से प्रत्यक्ष नाप कराएं',
  measureInPersonHelp:'स्टूडियो जाकर या दर्जी से प्रत्यक्ष नाप कराएं।',
  savedMeasurement:'सेव किया नाप इस्तेमाल करें (cm)',
  savedMeasurementHelp:'अपनी प्रोफ़ाइल से सेव किया हुआ नाप जोड़ें।',
  noSavedMeasurement:'कोई सेव नाप नहीं मिला। दर्जी से नाप लेने का विकल्प चुना गया।',
  measurementProfile:'नाप प्रोफ़ाइल चुनें',
  chooseMeasurement:'सेव किए नाप में से चुनें…',
  notes:'विशेष सिलाई निर्देश व टिप्पणियां',
  notesPlaceholder:'कॉलर स्टाइल, पॉकेट, अस्तर या अन्य फिटिंग निर्देश लिखें…',
  estimateTimeline:'समय दर्जी कन्फर्म करेगा',
  quoteAfterReview:'समीक्षा के बाद कोटेशन',
  reviewOrder:'समीक्षा और पुष्टि के लिए आगे बढ़ें →',
  reviewTitle:'ऑर्डर अनुरोध की समीक्षा करें',
  reviewHelp:'दर्जी को अनुरोध भेजने से पहले अपनी सिलाई पसंद और नाप की जांच करें।',
  quoteNotice:'सीधा स्टूडियो अनुरोध: अभी कोई ऑनलाइन भुगतान नहीं लिया जाएगा। दर्जी आपके अनुरोध की समीक्षा कर सटीक कोटेशन भेजेगा जिसे आप डैशबोर्ड में स्वीकार कर सकते हैं।',
  signInToPlace:'अनुरोध भेजने के लिए साइन इन करें। साइन इन के दौरान विवरण सुरक्षित रहेगा।',
  getStartedToPlace:'अनुरोध भेजने के लिए शुरुआत करें। आपके चयन सुरक्षित रहेंगे।',
  getStartedToView:'अपने ऑर्डर देखने के लिए शुरुआत करें',
  customerOnly:'ऑर्डर केवल ग्राहक खाते से किए जा सकते हैं।',
  editDetails:'← जानकारी बदलें',
  placeOrder:'कन्फर्म करें और अनुरोध भेजें ✓',
  signInAndPlace:'साइन इन करके अनुरोध भेजें',
  getStartedAndPlace:'शुरुआत करें और अनुरोध भेजें',
  placing:'अनुरोध भेजा जा रहा है…',
  placeError:'ऑर्डर अनुरोध नहीं भेजा जा सका। कृपया पुनः प्रयास करें।',
  orderPlaced:'आपका सिलाई अनुरोध सफलतापूर्वक दर्जी स्टूडियो को भेज दिया गया!',
  confirmationEyebrow:'अनुरोध सफलतापूर्वक भेजा गया',
  confirmationTitle:'सिलाई अनुरोध दर्ज हो गया!',
  confirmationHelp:'{{tailor}} को आपका अनुरोध प्राप्त हो गया है। वे समीक्षा कर आपके डैशबोर्ड में कोटेशन भेजेंगे।',
  orderNumber:'ऑर्डर संदर्भ आईडी',
  requestStatus:'कोटेशन की प्रतीक्षा · शून्य अग्रिम भुगतान',
  trackOrder:'मेरे ऑर्डर में ट्रैक करें →',
  continueShopping:'और दर्जी खोजें',
  orderNow:'इस दर्जी से ऑर्डर करें',
  totalEstimate:'अनुमानित कुल',
  viewTailor:'स्टूडियो देखें',
  viewFitDetails:'नाप विवरण देखें',
  orderLifecycleTitle:'ऑर्डर प्रगति पूर्वावलोकन',
  stage1:'1. अनुरोध भेजा',
  stage2:'2. कोटेशन मिला',
  stage3:'3. सिलाई जारी',
  stage4:'4. तैयार / डिलीवरी'
};

Object.assign(resources.en.translation.orderFlow, {
  acceptQuote:'Accept quote', finalQuote:'Tailor quote', quoteAwaiting:'Review this quote and accept it to start the order.', quoteAccepted:'Quote accepted. The tailor can begin production.', quoteSent:'Quote sent to customer.', status:{ 'Request Sent':'Request sent', 'Quote Received':'Quote received', Accepted:'Accepted', 'In Production':'In production', 'Ready for Pickup':'Ready for pickup', Completed:'Completed', Cancelled:'Cancelled' }, tailorRequests:'Customer order requests', newRequest:'New request', sendQuote:'Send quote', quoteAmount:'Your total quote (₹)', quoteAmountRequired:'Enter a valid total quote.', noCustomerOrders:'New customer order requests will appear here.', moveToProduction:'Start production', markReady:'Mark ready for pickup', markCompleted:'Mark completed', orderUpdated:'Order status updated.',
  deleteOrder: 'Delete request', deleteOrderConfirm: 'Are you sure you want to delete this order request? This will permanently delete the request for both you and the tailor studio.', orderDeleted: 'Order request deleted successfully.', deleteFailed: 'Could not delete order request.'
});
Object.assign(resources.hi.translation.orderFlow, {
  acceptQuote:'कोटेशन स्वीकारें', finalQuote:'दर्जी का कोटेशन', quoteAwaiting:'ऑर्डर शुरू करने के लिए कोटेशन देखकर स्वीकारें।', quoteAccepted:'कोटेशन स्वीकार हुआ। दर्जी उत्पादन शुरू कर सकता है।', quoteSent:'कोटेशन ग्राहक को भेज दिया गया।', status:{ 'Request Sent':'अनुरोध भेजा', 'Quote Received':'कोटेशन मिला', Accepted:'स्वीकार हुआ', 'In Production':'उत्पादन में', 'Ready for Pickup':'पिकअप के लिए तैयार', Completed:'पूरा हुआ', Cancelled:'रद्द हुआ' }, tailorRequests:'ग्राहकों के ऑर्डर अनुरोध', newRequest:'नया अनुरोध', sendQuote:'कोटेशन भेजें', quoteAmount:'कुल कोटेशन (₹)', quoteAmountRequired:'सही कुल कोटेशन दर्ज करें।', noCustomerOrders:'ग्राहकों के नए ऑर्डर अनुरोध यहाँ दिखेंगे।', moveToProduction:'उत्पादन शुरू करें', markReady:'पिकअप के लिए तैयार करें', markCompleted:'पूरा हुआ मार्क करें', orderUpdated:'ऑर्डर की स्थिति अपडेट हुई।',
  deleteOrder: 'अनुरोध हटाएं', deleteOrderConfirm: 'क्या आप वाकई यह ऑर्डर अनुरोध हटाना चाहते हैं? यह आपके और दर्जी दोनों के खाते से हमेशा के लिए हट जाएगा।', orderDeleted: 'ऑर्डर अनुरोध सफलतापूर्वक हटा दिया गया।', deleteFailed: 'ऑर्डर अनुरोध नहीं हटाया जा सका।'
});
resources.en.translation.authFlow.continueToSignIn = 'Continue to secure sign-in';
resources.en.translation.authFlow.signInIntro = 'Sign in securely. We will open the role already saved on your account.';
resources.hi.translation.authFlow.continueToSignIn = 'सुरक्षित साइन इन जारी रखें';
resources.hi.translation.authFlow.signInIntro = 'सुरक्षित रूप से साइन इन करें। हम आपके खाते में सेव भूमिका खोलेंगे।';

/* =====================================================
   TERMS OF SERVICE (ENGLISH & HINDI)
====================================================== */
resources.en.translation.termsPage = {
  eyebrow: "LEGAL & COMPLIANCE",
  title: "Terms of Service",
  subtitle: "Effective Date: October 2026 · MeraTailor Platform Operating Agreement",
  version: "Version 2.4",
  lastUpdated: "October 6, 2026",
  introTitle: "Welcome to MeraTailor",
  introText: "These Terms of Service ('Terms') govern your access to and use of the MeraTailor platform, website, tailor studio directory, digital measurement vault, bespoke order processing workflows, and B2B corporate apparel services. By accessing or using MeraTailor, you agree to comply with and be bound by these Terms and our Privacy Policy.",
  keyHighlightsTitle: "Key Principles at a Glance",
  highlights: [
    { title: "Bespoke Marketplace", desc: "MeraTailor connects clients, master tailor studios, and businesses. Custom garments are individually crafted to client-provided measurements." },
    { title: "Verified Artisans", desc: "Only studios verified by MeraTailor administrators appear in the public discovery directory." },
    { title: "Transparent Pricing", desc: "Tailors send binding quotes before production commences. Clients have full freedom to review and accept quotes." },
    { title: "Fit & Measurements Ownership", desc: "Your measurement profiles remain your private property and can be edited or deleted anytime." }
  ],
  tableOfContents: "Table of Contents",
  sections: [
    {
      id: "acceptance",
      num: "01",
      title: "Acceptance & Eligibility",
      content: "By creating an account, browsing studios, posting bulk apparel requirements, or submitting tailoring requests, you represent that you are at least 18 years of age (or have explicit parental/guardian consent) and possess the legal authority to enter into binding agreements under the Indian Contract Act, 1872 and applicable local laws."
    },
    {
      id: "roles-accounts",
      num: "02",
      title: "User Accounts & Unified Roles",
      content: "MeraTailor provides secure unified authentication via Clerk. You may register under one of four roles: Customer, Tailor Studio, Business Organization, or Administrator. You agree to provide accurate, current, and complete details during registration and profile setup. You are solely responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account."
    },
    {
      id: "bespoke-orders",
      num: "03",
      title: "Custom Tailoring Orders & Quotation Lifecycle",
      content: "All custom tailoring transactions proceed through structured lifecycle stages: (1) Request Sent with fabric, styling, and measurement specifications; (2) Tailor Studio reviews specs and sends a formal price quote; (3) Client reviews and accepts the quote; (4) In Production; (5) Ready for Pickup / Delivery; (6) Completed. Prior to quote acceptance, requests may be cancelled or declined by either party without financial penalty."
    },
    {
      id: "studio-verification",
      num: "04",
      title: "Master Studio Verification & Quality Standards",
      content: "To safeguard quality and prevent counterfeit listings, tailor ateliers must apply for verification. MeraTailor administrators review workshop credentials, experience, physical shop addresses, and craft capabilities before granting the 'Verified Master Studio' badge. Only verified studios appear on public discovery maps and directories. Verified status may be revoked if a studio repeatedly fails to meet craft standards or breaches platform ethics."
    },
    {
      id: "b2b-bulk",
      num: "05",
      title: "Institutional & B2B Bulk Requirements",
      content: "Business users may post institutional uniform and bulk apparel demands specifying volume, fabric standards, embroidery details, and delivery milestones. Tailor studios and textile manufacturers may submit quotations. Both parties agree that bulk contracts constitute commercial arrangements and agree to fulfill agreed quantity and deadline commitments."
    },
    {
      id: "pricing-payments",
      num: "06",
      title: "Pricing Transparency, Taxes & Billing",
      content: "All price quotes, service base rates, and turnaround times displayed on the platform are in Indian Rupees (INR ₹). Quotes must include all applicable direct crafting charges. Studios and clients are responsible for complying with applicable Goods and Services Tax (GST) regulations and local billing requirements for physical garment exchanges."
    },
    {
      id: "fitting-cancellations",
      num: "07",
      title: "Fittings Guarantee, Alterations & Cancellations",
      content: "Given the customized, made-to-measure nature of bespoke garments: (a) Orders in 'Request Sent' or 'Quote Received' status may be cancelled freely; (b) Once production commences ('In Production'), cancellation is subject to tailor approval and cost incurred for cut fabrics; (c) If a completed garment deviates materially from confirmed measurement profiles or stitch specifications, the tailor atelier agrees to provide corrective alterations within reasonable turnaround time."
    },
    {
      id: "ip-content",
      num: "08",
      title: "Intellectual Property & User Submissions",
      content: "The MeraTailor name, branding, user interface design, logos, and proprietary code are the exclusive property of MeraTailor. You retain ownership of custom design sketches, reference photos, and reviews you upload, granting MeraTailor a non-exclusive license to display such content solely for fulfilling your tailoring requests and discovery features."
    },
    {
      id: "prohibited",
      num: "09",
      title: "Prohibited Platform Activities",
      content: "Users may not: (a) Submit fraudulent or automated requests; (b) Impersonate another artisan or organization; (c) Interfere with platform infrastructure or extract database listings; (d) Harass or use abusive language toward tailors, clients, or platform support; (e) Upload malicious code or violate third-party trademarks."
    },
    {
      id: "liability-jurisdiction",
      num: "10",
      title: "Limitation of Liability, Indemnity & Jurisdiction",
      content: "MeraTailor operates as an intermediary technology platform connecting clients and independent tailoring ateliers. To the maximum extent permitted by law, MeraTailor shall not be liable for indirect, incidental, or consequential damages arising from physical fabric variations, customer-provided measurement errors, or off-platform interactions. These Terms shall be governed by the laws of India, and any legal disputes shall be subject to the exclusive jurisdiction of the courts at Jaipur, Rajasthan, India."
    }
  ],
  supportPrompt: "Questions about our terms or legal policies?",
  contactLegal: "Contact Legal & Compliance Team",
  backToHome: "Back to Home"
};

resources.hi.translation.termsPage = {
  eyebrow: "कानूनी एवं अनुपालन",
  title: "सेवा की शर्तें (Terms of Service)",
  subtitle: "प्रभावी तिथि: अक्टूबर 2026 · MeraTailor प्लेटफ़ॉर्म परिचालन अनुबंध",
  version: "संस्करण 2.4",
  lastUpdated: "6 अक्टूबर, 2026",
  introTitle: "MeraTailor में आपका स्वागत है",
  introText: "ये सेवा शर्तें ('शर्तें') MeraTailor प्लेटफ़ॉर्म, वेबसाइट, दर्जी खोज निर्देशिका, डिजिटल नाप वॉल्ट, कस्टम सिलाई ऑर्डर प्रबंधन और बी2बी बल्क परिधान सेवाओं के आपके उपयोग को नियंत्रित करती हैं। MeraTailor का उपयोग करके आप इन शर्तों और हमारी गोपनीयता नीति का पालन करने की कानूनी सहमति देते हैं।",
  keyHighlightsTitle: "मुख्य सिद्धांत संक्षेप में",
  highlights: [
    { title: "कस्टम सिलाई बाज़ार", desc: "MeraTailor ग्राहकों, कुशल दर्जियों और व्यवसायों को जोड़ता है। प्रत्येक कपड़ा ग्राहक के नाप और पसंद के अनुसार विशेष रूप से तैयार किया जाता है।" },
    { title: "सत्यापित दर्जी (Verified)", desc: "केवल MeraTailor एडमिन द्वारा सत्यापित दर्जी ही सार्वजनिक खोज सूची (/find-tailors) पर प्रदर्शित होते हैं।" },
    { title: "पारदर्शी कोटेशन", desc: "सिलाई शुरू होने से पहले दर्जी पक्का कोटेशन भेजते हैं। ग्राहक को कोटेशन देखकर स्वीकार करने की पूरी स्वतंत्रता है।" },
    { title: "नाप का पूर्ण स्वामित्व", desc: "आपकी नाप प्रोफ़ाइल आपकी निजी संपत्ति है जिसे आप कभी भी बदल या हटा सकते हैं।" }
  ],
  tableOfContents: "विषय सूची",
  sections: [
    {
      id: "acceptance",
      num: "01",
      title: "स्वीकृति एवं पात्रता",
      content: "खाता बनाकर, दर्जी खोजकर, थोक मांग पोस्ट करके या सिलाई अनुरोध भेजकर, आप यह पुष्टि करते हैं कि आपकी आयु कम से कम 18 वर्ष है (या आपके पास अभिभावक की अनुमति है) और आप भारतीय अनुबंध अधिनियम, 1872 के तहत कानूनी समझौते में प्रवेश करने के पात्र हैं।"
    },
    {
      id: "roles-accounts",
      num: "02",
      title: "उपयोगकर्ता खाते एवं एकीकृत भूमिकाएं",
      content: "MeraTailor Clerk के माध्यम से सुरक्षित प्रमाणीकरण प्रदान करता है। आप चार भूमिकाओं में से किसी एक में पंजीकरण कर सकते हैं: ग्राहक, दर्जी स्टूडियो, व्यावसायिक संस्था, या व्यवस्थापक (Admin)। आप सटीक और पूरी जानकारी देने के लिए सहमत हैं और अपने लॉगिन की गोपनीयता बनाए रखने के लिए पूरी तरह जिम्मेदार हैं।"
    },
    {
      id: "bespoke-orders",
      num: "03",
      title: "कस्टम सिलाई ऑर्डर एवं कोटेशन प्रक्रिया",
      content: "सभी सिलाई ऑर्डर स्पष्ट चरणों में पूरे होते हैं: (1) कपड़े और नाप के साथ अनुरोध भेजा गया; (2) दर्जी द्वारा कोटेशन भेजा गया; (3) ग्राहक द्वारा कोटेशन स्वीकृत; (4) उत्पादन/सिलाई जारी; (5) पिकअप/डिलीवरी हेतु तैयार; (6) पूर्ण। कोटेशन स्वीकृति से पहले दोनों पक्ष बिना किसी शुल्क के अनुरोध रद्द कर सकते हैं।"
    },
    {
      id: "studio-verification",
      num: "04",
      title: "दर्जी स्टूडियो सत्यापन एवं गुणवत्ता मानक",
      content: "गुणवत्ता बनाए रखने के लिए, दर्जी स्टूडियो को सत्यापन हेतु आवेदन करना होता है। MeraTailor एडमिन कार्यशाला, अनुभव और पते की समीक्षा के बाद 'सत्यापित मास्टर स्टूडियो' बैज प्रदान करते हैं। केवल सत्यापित स्टूडियो ही सार्वजनिक खोज में दिखते हैं।"
    },
    {
      id: "b2b-bulk",
      num: "05",
      title: "संस्थागत एवं बी2बी थोक आवश्यकताएं",
      content: "व्यावसायिक उपयोगकर्ता यूनिफॉर्म और बड़े पैमाने पर परिधान आवश्यकताएं पोस्ट कर सकते हैं। दर्जी और निर्माता अपने कोटेशन जमा कर सकते हैं। दोनों पक्ष तय समयसीमा और मात्रा की गुणवत्ता बनाए रखने के लिए सहमत हैं।"
    },
    {
      id: "pricing-payments",
      num: "06",
      title: "मूल्य पारदर्शिता, टैक्स एवं बिलिंग",
      content: "प्लेटफ़ॉर्म पर प्रदर्शित सभी कीमतें, कोटेशन और सिलाई दरें भारतीय रुपये (INR ₹) में हैं। दर्जी और ग्राहक सिलाई सेवाओं के लिए लागू जीएसटी और स्थानीय बिलिंग नियमों का पालन करने के लिए स्वयं उत्तरदायी हैं।"
    },
    {
      id: "fitting-cancellations",
      num: "07",
      title: "फ़िटिंग गारंटी, अल्टरेशन एवं रद्दीकरण नीति",
      content: "कस्टम सिलाई की प्रकृति को देखते हुए: (क) उत्पादन शुरू होने से पहले अनुरोध कभी भी रद्द किया जा सकता है; (ख) उत्पादन शुरू होने के बाद रद्दीकरण दर्जी की सहमति पर निर्भर है; (ग) यदि तैयार कपड़ा दिए गए नाप से भिन्न है, तो दर्जी उचित समयसीमा में निःशुल्क सुधार (Alteration) करने के लिए सहमत हैं।"
    },
    {
      id: "ip-content",
      num: "08",
      title: "बौद्धिक संपदा एवं सामग्री अधिकार",
      content: "MeraTailor का नाम, लोगो, डिज़ाइन और कोड MeraTailor की विशेष संपत्ति हैं। आपके द्वारा अपलोड किए गए डिज़ाइन स्केच, संदर्भ फ़ोटो और समीक्षाएं आपकी संपत्ति बनी रहती हैं।"
    },
    {
      id: "prohibited",
      num: "09",
      title: "प्रतिबंधित गतिविधियाँ",
      content: "उपयोगकर्ताओं को किसी अन्य कारीगर का रूप धारण करने, भ्रामक अनुरोध भेजने, सिस्टम से छेड़छाड़ करने, या किसी दर्जी/ग्राहक के साथ अभद्र भाषा का प्रयोग करने की सख्त मनाही है।"
    },
    {
      id: "liability-jurisdiction",
      num: "10",
      title: "दायित्व की सीमा एवं क्षेत्राधिकार",
      content: "MeraTailor एक प्रौद्योगिकी मध्यस्थ प्लेटफ़ॉर्म है। किसी भी विवाद की स्थिति में, कानूनी क्षेत्राधिकार केवल जयपुर, राजस्थान, भारत की अदालतों के अधीन होगा।"
    }
  ],
  supportPrompt: "नियमों या कानूनी नीतियों के संबंध में कोई प्रश्न?",
  contactLegal: "कानूनी सहायता टीम से संपर्क करें",
  backToHome: "मुख्य पृष्ठ पर वापस जाएँ"
};

/* =====================================================
   PRIVACY POLICY (ENGLISH & HINDI)
====================================================== */
resources.en.translation.privacyPage = {
  eyebrow: "DATA PROTECTION & TRUST",
  title: "Privacy Policy",
  subtitle: "Last Updated: October 2026 · Compliant with Digital Personal Data Protection Act (DPDP Act, India)",
  version: "Version 2.4",
  lastUpdated: "October 6, 2026",
  introTitle: "Your Privacy is Paramount",
  introText: "At MeraTailor, we deeply respect your personal identity, sensitive body measurements, search radius, and tailoring preferences. This Privacy Policy details the exact types of data we collect, why we collect it, how securely it is stored, and your absolute right to access, export, or permanently delete your account and personal records.",
  commitmentsTitle: "Our Core Privacy Commitments",
  commitments: [
    { title: "No Selling of Data", desc: "We never sell, rent, or trade your personal information, contact numbers, or body measurements to third-party data brokers or advertisers." },
    { title: "Explicit Location Consent", desc: "Precise GPS coordinates are only gathered with your explicit browser consent and are never tracked in the background." },
    { title: "Ephemeral AI Audio", desc: "Voice tailoring requests sent to Google Gemini API are transcribed in real-time and immediately deleted from temporary storage." },
    { title: "Complete Account Deletion", desc: "Deleting your account completely removes all measurements, orders, and credentials in both MongoDB and Clerk." }
  ],
  tableOfContents: "Policy Navigation",
  sections: [
    {
      id: "info-collected",
      num: "01",
      title: "Information We Collect",
      content: "We collect minimal information necessary to deliver custom tailoring services: (1) Identity & Contact Data (Name, email address, phone number provided via Clerk authentication); (2) Body Measurement Profiles (Chest, waist, hip, shoulder, sleeve, length, and garment types); (3) Geolocation Data (Coordinates and neighbourhood label when permitted by you); (4) Order & Style Preferences (Fabric choices, reference specifications, deadline dates, and notes); (5) Voice Audio (Temporary audio snippets when using the AI voice tailoring assistant)."
    },
    {
      id: "how-we-use",
      num: "02",
      title: "How We Use Your Information",
      content: "Your data is used exclusively to: (a) Match you with skilled, verified tailor ateliers within your desired radius; (b) Provide tailors with accurate measurements for custom garment creation; (c) Process quotes, track production milestones, and notify you of completion; (d) Facilitate B2B corporate apparel proposals; (e) Maintain security, prevent fraud, and verify authentic accounts."
    },
    {
      id: "voice-ai",
      num: "03",
      title: "AI Voice Assistant & Audio Processing",
      content: "When using the bilingual voice tailoring feature powered by Google Gemini API, your microphone recording is streamed securely to Google Gemini solely to extract garment requirements, color, and location parameters. Audio is not used to build biometric profiles, is not stored long-term, and is deleted after processing."
    },
    {
      id: "location-mapping",
      num: "04",
      title: "Location Data & OpenStreetMap Integration",
      content: "We use OpenStreetMap (Nominatim and Tile Layer) for geographic radius calculations and studio discovery. Your location is processed locally in your browser. We never track your background location when you are not actively using the app."
    },
    {
      id: "third-parties",
      num: "05",
      title: "Third-Party Service Providers & Sub-processors",
      content: "We partner with trusted, industry-standard infrastructure providers under strict data protection terms: (a) Clerk (Authentication, identity management, and JWT session tokens); (b) MongoDB Atlas (Encrypted cloud database storage); (c) Google Gemini API (Natural language transcription); (d) OpenStreetMap (Map rendering and geocoding)."
    },
    {
      id: "user-rights",
      num: "06",
      title: "Your Rights & Account Deletion (DPDP Act)",
      content: "Under the Digital Personal Data Protection Act, 2023 (India) and international privacy frameworks, you have the right to: (1) Access and review your profile; (2) Correct or update body measurements anytime; (3) Withdraw location consent; (4) Request complete account erasure. When you delete your account via the Dashboard or API, all measurement vaults, saved tailors, and personal records are permanently deleted from MongoDB and Clerk simultaneously."
    },
    {
      id: "security-retention",
      num: "07",
      title: "Data Security & Encryption",
      content: "All data transmitted between your browser, our Express application, and cloud databases is encrypted in transit using Transport Layer Security (TLS 1.3 / HTTPS). Database storage utilizes encryption-at-rest with strict role-based access control."
    },
    {
      id: "grievance-contact",
      num: "08",
      title: "Grievance Officer & Contact Information",
      content: "In accordance with the Information Technology Act 2000 and DPDP Act 2023, if you have any questions, concerns, or data requests, you may contact our designated Grievance Officer at: Email: privacy@meratailor.in · MeraTailor Data Protection Office, C-Scheme, Jaipur, Rajasthan, 302001, India."
    }
  ],
  supportPrompt: "Have questions about your data or privacy settings?",
  contactPrivacy: "Contact Data Protection Officer",
  backToHome: "Back to Home"
};


i18n.use(initReactI18next).init({
  resources,

  lng: savedLanguage,

  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },
});

/* =====================================================
   SAVE LANGUAGE WHEN CHANGED
====================================================== */

i18n.on("languageChanged", (language) => {
  localStorage.setItem(
    "meraTailorLanguage",
    language
  );
});

export default i18n;
