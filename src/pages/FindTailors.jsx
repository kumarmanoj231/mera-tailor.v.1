import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Heart,
  MapPin,
  Mic,
  Search,
  SlidersHorizontal,
  Star,
  Sparkles,
  CheckCircle2,
  X,
  Clock,
  Shirt,
  Phone,
  Lock,
  Map as MapIcon,
  List as ListIcon,
  Navigation,
  Compass,
  ArrowRight,
  Globe,
  Scissors,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Store,
  LayoutGrid,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { parseVoiceRequest } from "../utils/voiceRequest";
import VoiceSearchModal from "../components/voice/VoiceSearchModal";
import {
  getUnifiedLocation,
  setUnifiedLocation,
  isGuestLocationPromptDismissed,
  dismissGuestLocationPrompt,
} from "../utils/locationService";
import TailorAvatar from "../components/common/TailorAvatar";

const DEFAULT_CENTER = [26.9124, 75.7873]; // Jaipur Central Discovery

// High-Res Custom SVG Markers with Atelier Store Icon
const verifiedIcon = L.divIcon({
  className: "custom-pin-verified",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:#047857;color:#ffffff;border:2.5px solid #ffffff;box-shadow:0 4px 10px rgba(0,0,0,0.3);cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

const standardIcon = L.divIcon({
  className: "custom-pin-standard",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:#8f2338;color:#ffffff;border:2.5px solid #ffffff;box-shadow:0 4px 10px rgba(0,0,0,0.3);cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

const centerPinIcon = L.divIcon({
  className: "custom-pin-center",
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;cursor:pointer;"><div style="position:absolute;width:32px;height:32px;border-radius:9999px;background:rgba(37,99,235,0.25);animation:ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div><div style="position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:#2563eb;color:#ffffff;border:2px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.35);"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/></svg></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
});

// Custom Illustrated Craft Category SVG Graphics matching the atelier UI mockup
function EthnicWearIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4 drop-shadow-2xs" fill="none">
      <path d="M17 10L24 6L31 10L35 18L30 20L28 16V42H20V16L18 20L13 18L17 10Z" fill="#0D9488" />
      <path d="M28 16L33 24L30 38L24 42V16H28Z" fill="#E11D48" opacity="0.9" />
      <path d="M24 6L21 14H27L24 6Z" fill="#F59E0B" />
      <circle cx="24" cy="22" r="1.5" fill="#FEF08A" />
      <circle cx="24" cy="28" r="1.5" fill="#FEF08A" />
    </svg>
  );
}

function LadiesWearIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4 drop-shadow-2xs" fill="none">
      <path d="M20 8C20 8 22 13 24 13C26 13 28 8 28 8L31 14L28 20H20L17 14L20 8Z" fill="#2563EB" />
      <path d="M20 20L12 42C12 42 20 44 24 44C28 44 36 42 36 42L28 20H20Z" fill="#3B82F6" />
      <path d="M19 20H29V22H19V20Z" fill="#93C5FD" />
    </svg>
  );
}

function FormalWearIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4 drop-shadow-2xs" fill="none">
      <rect x="10" y="15" width="28" height="23" rx="4" fill="#854D0E" />
      <path d="M19 15V12C19 10.3431 20.3431 9 22 9H26C27.6569 9 29 10.3431 29 12V15" stroke="#A16207" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 24H38" stroke="#CA8A04" strokeWidth="2" />
      <rect x="22" y="22" width="4" height="5" rx="1" fill="#FEF08A" />
    </svg>
  );
}

function ShirtsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4 drop-shadow-2xs" fill="none">
      <path d="M16 12L24 8L32 12L38 18L33 22L30 18V42H18V18L15 22L10 18L16 12Z" fill="#3B82F6" />
      <path d="M24 8L20 15L24 17L28 15L24 8Z" fill="#60A5FA" />
      <rect x="27" y="21" width="5" height="6" rx="1" fill="#2563EB" />
    </svg>
  );
}

function PantsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4 drop-shadow-2xs" fill="none">
      <path d="M14 10H34V14L32 42H26L24 24L22 42H16L14 14V10Z" fill="#2563EB" />
      <path d="M14 10H34V13H14V10Z" fill="#1D4ED8" />
    </svg>
  );
}

function SuitsSherwaniIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4 drop-shadow-2xs" fill="none">
      <circle cx="24" cy="11" r="5" fill="#FBBF24" />
      <path d="M14 40V24L24 18L34 24V40H14Z" fill="#1E293B" />
      <path d="M24 18L21 28H27L24 18Z" fill="#FFFFFF" />
      <path d="M22 23L24 25L26 23L25 21H23L22 23Z" fill="#B91C1C" />
    </svg>
  );
}

function AlterationsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4 drop-shadow-2xs" fill="none">
      <circle cx="16" cy="36" r="6" stroke="#EC4899" strokeWidth="3" />
      <circle cx="32" cy="36" r="6" stroke="#8B5CF6" strokeWidth="3" />
      <path d="M18 31L32 10" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 31L16 10" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="22" r="2.5" fill="#F59E0B" />
    </svg>
  );
}

const CATEGORIES_LIST = [
  { id: "", label: "All categories", icon: <Sparkles size={14} /> },
  { id: "Ethnic Wear", label: "Ethnic Wear", icon: <EthnicWearIcon /> },
  { id: "Ladies Wear", label: "Ladies Wear", icon: <LadiesWearIcon /> },
  { id: "Bridal Wear", label: "Bridal & Wedding", icon: <EthnicWearIcon /> },
  { id: "Salwar & Suits", label: "Salwar & Suits", icon: <EthnicWearIcon /> },
  { id: "Formal Wear", label: "Formal Wear", icon: <FormalWearIcon /> },
  { id: "Sherwani & Groom", label: "Sherwani & Groom", icon: <SuitsSherwaniIcon /> },
  { id: "Suit", label: "Suits", icon: <SuitsSherwaniIcon /> },
  { id: "Shirt", label: "Shirts", icon: <ShirtsIcon /> },
  { id: "Pants", label: "Trousers & Pants", icon: <PantsIcon /> },
  { id: "Dress", label: "Dresses & Gowns", icon: <LadiesWearIcon /> },
  { id: "Uniforms", label: "Uniforms", icon: <ShirtsIcon /> },
  { id: "Kids Wear", label: "Kids Wear", icon: <ShirtsIcon /> },
  { id: "Alteration", label: "Alterations & Repair", icon: <AlterationsIcon /> },
];

const CITY_PRESETS = [
  { city: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { city: "Delhi", lat: 28.6139, lng: 77.2090 },
  { city: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { city: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { city: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { city: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  { city: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { city: "Pune", lat: 18.5204, lng: 73.8567 },
  { city: "Lucknow", lat: 26.8467, lng: 80.9462 },
];

const validCenter = (value) =>
  Array.isArray(value) &&
  value.length === 2 &&
  Number.isFinite(Number(value[0])) &&
  Math.abs(Number(value[0])) <= 90 &&
  Number.isFinite(Number(value[1])) &&
  Math.abs(Number(value[1])) <= 180;

const mapPosition = (location) => {
  const coords = location?.coordinates;
  if (!Array.isArray(coords) || coords.length !== 2) return DEFAULT_CENTER;
  const [lng, lat] = coords.map(Number);
  return Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lng) && Math.abs(lng) <= 180
    ? [lat, lng]
    : DEFAULT_CENTER;
};

async function readJson(response, source) {
  const type = response.headers.get("content-type") || "";
  if (!type.includes("application/json")) {
    throw new Error(
      `${source} returned ${
        type.includes("text/html") ? "a web page instead of JSON" : "an unexpected response"
      }. Check the API server and try again.`
    );
  }
  try {
    return await response.json();
  } catch {
    throw new Error(`Failed to parse response from ${source}.`);
  }
}

function Recenter({ center, zoom = 12 }) {
  const map = useMap();
  useEffect(() => {
    if (validCenter(center)) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

function MapFlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (validCenter(target)) {
      map.flyTo(target, 14, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

function SmartBoundsFitter({ items, center, shouldFit }) {
  const map = useMap();
  useEffect(() => {
    if (!shouldFit || !Array.isArray(items) || items.length === 0) return;
    const points = [];
    if (validCenter(center)) points.push(center);
    items.forEach((item) => {
      const pos = mapPosition(item.location);
      if (pos) points.push(pos);
    });
    if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 13 });
    }
  }, [items, center, shouldFit, map]);
  return null;
}

export default function FindTailors() {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === "hi";
  const { isSignedIn, openSignUp, getToken, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search States
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [locationQuery, setLocationQuery] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [radius, setRadius] = useState(100);
  const [sort, setSort] = useState("recommended");
  const [showAllLocations, setShowAllLocations] = useState(searchParams.get("all") === "true");

  // Geolocation & Map State
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [place, setPlace] = useState("Jaipur, Jaipur Municipal Corporation");
  const [locationSelected, setLocationSelected] = useState(true);
  const [mapFlyTarget, setMapFlyTarget] = useState(null);
  const [mapExpanded, setMapExpanded] = useState(false);
  const mapContainerRef = useRef(null);

  // View Mode: 'split' | 'list' | 'map'
  const [viewMode, setViewMode] = useState("split");

  // Data & Async States
  const [tailors, setTailors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [intent, setIntent] = useState(null);

  // Bookmarked / Saved Tailors
  const [savedTailorIds, setSavedTailorIds] = useState(new Set());
  const [savingTailorIds, setSavingTailorIds] = useState(new Set());

  // Category labels helper
  const categoryLabel = (val) => {
    const found = CATEGORIES_LIST.find((c) => c.id === val);
    return found ? found.label : val;
  };

  const colorLabel = (val) => val;

  // Initialize from searchParams & sessionStorage (Voice Assistant handoff)
  useEffect(() => {
    let initialCategory = searchParams.get("category") || "";
    let initialSearch = searchParams.get("search") || "";
    let initialRadius = searchParams.get("radius");
    let initialArea = searchParams.get("area") || "";

    // Check if coming from voice request handoff
    const storedVoice = sessionStorage.getItem("meratailor.voice-request");
    if (storedVoice) {
      try {
        const parsed = JSON.parse(storedVoice);
        setIntent(parsed);
        if (parsed.category && !initialCategory) initialCategory = parsed.category;
        if (parsed.garment && !initialSearch) initialSearch = parsed.garment;
        else if (parsed.text && !initialSearch) initialSearch = parsed.text;
        if (parsed.radiusKm && !initialRadius) initialRadius = parsed.radiusKm;
        if (parsed.location && !initialArea) initialArea = parsed.location;
      } catch (e) {
        console.warn("Failed to parse stored voice request", e);
      }
      // Clean after reading to avoid sticky state on subsequent manual page navigation
      sessionStorage.removeItem("meratailor.voice-request");
    }

    if (initialCategory) setCategory(initialCategory);
    if (initialSearch) setQuery(initialSearch);
    if (initialRadius) setRadius(Number(initialRadius));
    if (initialArea) {
      setLocationQuery(initialArea);
      geocodeLocation(initialArea);
    }
  }, [searchParams]);

  // Load Saved Tailors for Signed-in user
  useEffect(() => {
    let active = true;
    async function loadSavedTailors() {
      if (!isSignedIn) return;
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch("/api/saved-tailors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data)) {
            setSavedTailorIds(new Set(data.map((item) => String(item._id || item.id))));
          }
        }
      } catch (err) {
        console.warn("Could not load saved tailors:", err);
      }
    }
    loadSavedTailors();
    return () => {
      active = false;
    };
  }, [isSignedIn, getToken]);

  // Dedicated Voice Assistant Modal state
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Auto-detect & synchronize user location (profile if signed in, unified storage, or 1-time guest prompt)
  useEffect(() => {
    // 1. Signed-in profile location & radius
    if (isSignedIn && profile) {
      const profLoc = getUnifiedLocation(profile);
      if (profLoc) {
        setCenter([profLoc.latitude, profLoc.longitude]);
        setPlace(profLoc.label);
        setLocationQuery(profLoc.label);
        setLocationSelected(true);
        if (profLoc.radius && !searchParams.get("radius")) {
          setRadius(profLoc.radius);
        }
        if (profLoc.sortBy && !searchParams.get("sort")) {
          setSort(profLoc.sortBy);
        }
        setShowLocationPrompt(false);
        searchTailorsWithCoords(profLoc.latitude, profLoc.longitude, profLoc.radius);
        return;
      }
    }

    // 2. Previously stored unified location (across Home, FindTailors, etc.)
    const stored = getUnifiedLocation();
    if (stored) {
      setCenter([stored.latitude, stored.longitude]);
      setPlace(stored.label);
      setLocationQuery(stored.label);
      setLocationSelected(true);
      if (stored.radius && !searchParams.get("radius")) {
        setRadius(stored.radius);
      }
      setShowLocationPrompt(false);
      searchTailorsWithCoords(stored.latitude, stored.longitude, stored.radius);
      return;
    }

    // 3. For guest (not signed in): ask one time
    if (!isSignedIn) {
      if (!isGuestLocationPromptDismissed()) {
        setShowLocationPrompt(true);
      }
    } else {
      // Signed-in user without saved location in profile: try browser geolocation once
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setCenter([lat, lng]);
            setLocationSelected(true);
            let placeName = isHi ? "मेरा वर्तमान स्थान" : "My Current Location";
            try {
              const rev = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
              );
              const data = await rev.json();
              if (data?.display_name) {
                placeName = data.display_name.split(",").slice(0, 3).join(",");
              }
            } catch {}
            setPlace(placeName);
            setLocationQuery(placeName);
            getToken().then((token) => {
              setUnifiedLocation(
                { latitude: lat, longitude: lng, label: placeName, radius, accuracyMeters: pos.coords.accuracy },
                token
              );
            });
            searchTailorsWithCoords(lat, lng);
          },
          (err) => {
            console.info("User location unavailable:", err.message);
            setShowLocationPrompt(true);
          },
          { timeout: 7000 }
        );
      } else {
        setShowLocationPrompt(true);
      }
    }
  }, [isSignedIn, profile]);

  // Voice Coachmark Hover / Auto-dismiss state
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const voiceHelpTimeoutRef = useRef(null);

  useEffect(() => () => {
    if (voiceHelpTimeoutRef.current) clearTimeout(voiceHelpTimeoutRef.current);
  }, []);

  const handleVoiceHoverEnter = () => {
    if (voiceHelpTimeoutRef.current) clearTimeout(voiceHelpTimeoutRef.current);
    setShowVoiceHelp(true);
  };

  const handleVoiceHoverLeave = () => {
    voiceHelpTimeoutRef.current = setTimeout(() => {
      setShowVoiceHelp(false);
    }, 2500);
  };

  // Dedicated Voice Search Apply Handler (Unified with Gemini classification)
  const handleApplyVoiceModal = (parsed) => {
    setIntent(parsed);
    setVoiceOpen(false);
    toast.success(isHi ? `आवाज़ पहचान ली गई: "${parsed.summary}"` : `Understood: "${parsed.summary}"`);
    
    let nextQuery = query;
    let nextCategory = category;
    let nextRadius = radius;

    if (parsed.garment) {
      nextQuery = parsed.garment;
      setQuery(parsed.garment);
    }
    if (parsed.category) {
      nextCategory = parsed.category;
      setCategory(parsed.category);
      setSort("category");
    }
    if (parsed.radiusKm) {
      nextRadius = parsed.radiusKm;
      setRadius(parsed.radiusKm);
    }

    if (parsed.location) {
      setLocationQuery(parsed.location);
      geocodeLocation(parsed.location);
    } else {
      searchTailorsDirect(nextQuery, nextCategory, nextRadius);
    }
  };

  async function searchTailorsDirect(q, cat, rad) {
    setBusy(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (!showAllLocations && center[0] && center[1]) {
        params.set("lat", center[0]);
        params.set("lng", center[1]);
        params.set("radiusKm", rad);
        params.set("radius", rad);
      }
      if (q && q.trim()) params.set("search", q.trim());
      if (cat) params.set("category", cat);

      const res = await fetch(`/api/tailors?${params.toString()}`);
      if (res.ok) {
        const data = await readJson(res, "/api/tailors");
        setTailors(Array.isArray(data) ? data : []);
      } else {
        setTailors([]);
      }
    } catch (err) {
      console.warn("Direct voice search failed:", err);
      setError(t("discovery.error", "Failed to fetch tailoring studios."));
      setTailors([]);
    } finally {
      setBusy(false);
    }
  }

  // Geocode an area or city query
  async function geocodeLocation(targetPlace) {
    if (!targetPlace || !targetPlace.trim()) return;
    try {
      setBusy(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          targetPlace.trim() + ", India"
        )}&limit=1`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          const placeName = data[0].display_name.split(",").slice(0, 3).join(",");
          setCenter([lat, lng]);
          setPlace(placeName);
          setLocationSelected(true);
          setShowAllLocations(false);
          dismissGuestLocationPrompt();
          setShowLocationPrompt(false);
          if (isSignedIn) {
            getToken().then((token) => {
              setUnifiedLocation({ latitude: lat, longitude: lng, label: placeName, radius }, token);
            });
          } else {
            setUnifiedLocation({ latitude: lat, longitude: lng, label: placeName, radius });
          }
          searchTailorsWithCoords(lat, lng);
          return;
        }
      }
      toast.info(isHi ? "स्थान नहीं मिला, डिफ़ॉल्ट क्षेत्र का उपयोग कर रहे हैं" : "Area not found, using default center.");
    } catch (err) {
      console.warn("Geocoding failed:", err);
    } finally {
      setBusy(false);
    }
  }

  // Use Browser Geolocation
  function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error(isHi ? "आपके ब्राउज़र में जीपीएस समर्थित नहीं है।" : "Geolocation is not supported by your browser.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCenter([lat, lng]);
        setLocationSelected(true);
        setShowAllLocations(false);
        dismissGuestLocationPrompt();
        setShowLocationPrompt(false);
        let placeName = isHi ? "मेरा वर्तमान स्थान" : "My Current Location";
        try {
          const rev = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await rev.json();
          if (data && data.display_name) {
            placeName = data.display_name.split(",").slice(0, 3).join(",");
          }
        } catch {}
        setPlace(placeName);
        if (isSignedIn) {
          getToken().then((token) => {
            setUnifiedLocation(
              { latitude: lat, longitude: lng, label: placeName, radius, accuracyMeters: pos.coords.accuracy },
              token
            );
          });
        } else {
          setUnifiedLocation({
            latitude: lat,
            longitude: lng,
            label: placeName,
            radius,
            accuracyMeters: pos.coords.accuracy,
          });
        }
        searchTailorsWithCoords(lat, lng);
      },
      (err) => {
        setBusy(false);
        toast.error(isHi ? "स्थान का पता नहीं लगाया जा सका।" : "Could not determine your location.");
      },
      { timeout: 8000 }
    );
  }

  // Handle Preset City Select
  function handleSelectCityPreset(preset) {
    const placeName = `${preset.city}, India`;
    setCenter([preset.lat, preset.lng]);
    setPlace(placeName);
    setLocationSelected(true);
    setShowAllLocations(false);
    dismissGuestLocationPrompt();
    setShowLocationPrompt(false);
    if (isSignedIn) {
      getToken().then((token) => {
        setUnifiedLocation({ latitude: preset.lat, longitude: preset.lng, label: placeName, radius }, token);
      });
    } else {
      setUnifiedLocation({ latitude: preset.lat, longitude: preset.lng, label: placeName, radius });
    }
    searchTailorsWithCoords(preset.lat, preset.lng);
  }

  // Search Tailors Core Function
  async function searchTailors() {
    searchTailorsWithCoords(center[0], center[1]);
  }

  async function searchTailorsWithCoords(lat, lng) {
    setBusy(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (!showAllLocations && lat && lng) {
        params.set("lat", lat);
        params.set("lng", lng);
        params.set("radiusKm", radius);
        params.set("radius", radius);
      }
      if (query.trim()) params.set("search", query.trim());
      if (category) params.set("category", category);

      const res = await fetch(`/api/tailors?${params.toString()}`);
      if (res.ok) {
        const data = await readJson(res, "/api/tailors");
        if (Array.isArray(data)) {
          setTailors(data);
        } else {
          setTailors([]);
        }
      } else {
        setTailors([]);
      }
    } catch (err) {
      console.warn("Search tailors failed:", err);
      setError(t("discovery.error", "Failed to fetch tailoring studios."));
      setTailors([]);
    } finally {
      setBusy(false);
    }
  }

  // Trigger search on mount and key parameter shifts
  useEffect(() => {
    searchTailors();
  }, [category, radius, showAllLocations]);

  // Form submit handlers
  function findArea(e) {
    e.preventDefault();
    if (locationQuery.trim()) {
      geocodeLocation(locationQuery.trim());
    }
  }

  function handleCategoryChange(catId) {
    setCategory(catId);
    const newParams = new URLSearchParams(searchParams);
    if (catId) newParams.set("category", catId);
    else newParams.delete("category");
    setSearchParams(newParams, { replace: true });
  }

  function changeRadius(newRad) {
    setRadius(newRad);
    setShowAllLocations(false);
  }

  function clearVoiceIntent() {
    setIntent(null);
    setQuery("");
    setCategory("");
  }

  // Fly map to a specific tailor
  function handleFlyToTailor(tailor) {
    const pos = mapPosition(tailor.location);
    if (pos) {
      setMapFlyTarget(pos);
      if (viewMode === "list") setViewMode("split");
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  }

  // Toggle Save Tailor Action
  async function toggleSavedTailor(tailor) {
    const id = String(tailor._id || tailor.id);
    if (!isSignedIn) {
      toast.info(t("discovery.getStartedToSave", "Get started to save this studio."));
      openSignUp();
      return;
    }
    const wasSaved = savedTailorIds.has(id);
    const shouldSave = !wasSaved;

    setSavedTailorIds((prev) => {
      const next = new Set(prev);
      if (shouldSave) next.add(id);
      else next.delete(id);
      return next;
    });

    try {
      const token = await getToken();
      const res = await fetch(`/api/saved-tailors/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ saved: shouldSave }),
      });
      if (res.ok) {
        toast.success(
          shouldSave
            ? (isHi ? "स्टूडियो सहेजा गया!" : "Studio saved to bookmarks!")
            : (isHi ? "सहेजे गए से हटाया गया" : "Removed from bookmarks")
        );
      }
    } catch {
      // Revert on error
      setSavedTailorIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  }

  // Enhanced Sorting (Category Relevance, Rating, Distance, Price)
  const sorted = useMemo(() => {
    let list = [...tailors];
    const targetCategory = (category || intent?.category || "").toLowerCase();
    const targetQuery = (query || intent?.garment || "").toLowerCase();

    const getScore = (tailor) => {
      let score = 0;
      const cats = (tailor.categories || []).map((c) => String(c).toLowerCase());
      const tailorName = (tailor.name || "").toLowerCase();
      const services = (tailor.services || []).map((s) => (s.name || "").toLowerCase());

      // Priority match for chosen/spoken category
      if (targetCategory) {
        if (cats.some((c) => c === targetCategory)) score += 50;
        else if (cats.some((c) => c.includes(targetCategory) || targetCategory.includes(c))) score += 30;
      }

      // Priority match for garment/search query
      if (targetQuery) {
        if (tailorName.includes(targetQuery)) score += 20;
        if (cats.some((c) => c.includes(targetQuery))) score += 25;
        if (services.some((s) => s.includes(targetQuery))) score += 20;
      }

      // Verified boost
      if (tailor.verified || tailor.verificationStatus === "verified") score += 10;
      return score;
    };

    if (sort === "category" || sort === "relevance" || sort === "recommended") {
      list.sort((a, b) => {
        const scoreDiff = getScore(b) - getScore(a);
        if (scoreDiff !== 0) return scoreDiff;
        // Secondary sort: rating
        return (b.rating || 0) - (a.rating || 0);
      });
    } else if (sort === "distance") {
      list.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
    } else if (sort === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === "price-asc") {
      list.sort((a, b) => (a.minPrice || 499) - (b.minPrice || 499));
    } else if (sort === "price-desc") {
      list.sort((a, b) => (b.minPrice || 499) - (a.minPrice || 499));
    }
    return list;
  }, [tailors, sort, category, query, intent]);

  const verifiedStudiosCount = useMemo(() => {
    return sorted.filter((t) => t.verified || t.verificationStatus === "verified").length;
  }, [sorted]);

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#111827] selection:bg-[#8f2338] selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* =========================================================
            TOP COMPONENT: HERO, METRICS, SEARCH & CONTROLS
        ========================================================== */}
        <section className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
          {/* Row 1: Badges & Current Search Center Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-semibold text-[#8f2338]">
                <MapPin size={12} className="text-[#8f2338]" />
                <span>{isHi ? "मास्टर दर्जी खोज हब" : "Master Atelier Discovery Hub"}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>
                  {sorted.length}{" "}
                  {isHi
                    ? "स्टूडियो उपलब्ध"
                    : `Studio${sorted.length === 1 ? "" : "s"} Available`}
                </span>
              </span>
            </div>

            {/* Current Search Origin Card */}
            <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] px-4 py-2 flex items-center gap-3 shrink-0 shadow-2xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-[#8f2338]">
                <MapPin size={15} />
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-stone-400">
                  {isHi ? "खोज केंद्र" : "SEARCH CENTER"}
                </span>
                <p className="text-xs font-bold text-stone-900 truncate max-w-[240px]">
                  {place}
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Headline & Description */}
          <div className="mt-4 grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
            <div className="min-w-0">
              <h1 className="font-sans text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-[#111827]">
                {isHi ? "दर्जी खोजें" : "Find Tailors"}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
                {isHi
                  ? "किसी भी स्थान के आस-पास कुशल सिलाई कारीगरों को खोजें। अपना क्षेत्र और खोज दायरा चुनें।"
                  : "Search skilled tailoring professionals around any location. Choose your search area and radius."}
              </p>
            </div>
            <img
              src="/assets/hero-atelier.jpg"
              alt={isHi ? "कारीगर अपने एटेलियर में कपड़े की कटाई करते हुए" : "A tailor cutting fabric in a local atelier"}
              className="h-32 w-full rounded-2xl border border-stone-200 object-cover object-[72%_center] shadow-sm sm:h-24 sm:w-44 lg:h-28 lg:w-48"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Row 3: 4 Metric Cards Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Card 1: STUDIOS */}
            <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 transition hover:border-[#8f2338]/40 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#8f2338]">
                <Store size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {isHi ? "स्टूडियो" : "STUDIOS"}
                </span>
                <p className="text-xl font-black text-stone-900 leading-tight">
                  {sorted.length}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-stone-500 sm:text-[11px]">
                  {isHi ? "दायरे के भीतर" : "Within radius"}
                </p>
              </div>
            </div>

            {/* Card 2: VERIFIED */}
            <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 transition hover:border-emerald-400 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {isHi ? "सत्यापित" : "VERIFIED"}
                </span>
                <p className="text-xl font-black text-emerald-700 leading-tight">
                  {verifiedStudiosCount}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-stone-500 sm:text-[11px]">
                  {isHi ? "गुणवत्ता प्रमाणित कारीगर" : "Quality-Checked Artisans"}
                </p>
              </div>
            </div>

            {/* Card 3: COVERAGE */}
            <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 transition hover:border-blue-400 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <MapPin size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {isHi ? "कवरेज दायरा" : "COVERAGE"}
                </span>
                <p className="text-xl font-black text-stone-900 leading-tight">
                  {showAllLocations ? (isHi ? "अखिल भारतीय" : "All India") : `${radius} km`}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-stone-500 sm:text-[11px]">
                  {showAllLocations
                    ? (isHi ? "देशभर में खोज" : "Nationwide discovery")
                    : (isHi ? "केंद्र से दूरी" : "From center coordinate")}
                </p>
              </div>
            </div>

            {/* Card 4: CATEGORY */}
            <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 transition hover:border-[#8f2338]/40 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#8f2338]">
                <LayoutGrid size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {isHi ? "सक्रिय श्रेणी" : "CATEGORY"}
                </span>
                <p className="text-base font-black truncate text-stone-900 leading-tight">
                  {category ? categoryLabel(category) : (isHi ? "सभी वस्त्र" : "All Specialties")}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-stone-500 sm:text-[11px]">
                  {category
                    ? (isHi ? "फ़िल्टर सक्रिय" : "Specialty active")
                    : (isHi ? "समस्त सिलाई विधाएं" : "All bespoke categories")}
                </p>
              </div>
            </div>
          </div>

          {/* Row 4: Search Inputs Bar */}
          <div className="mt-6 flex flex-col lg:flex-row items-center gap-3">
            {/* Location Area Input */}
            <div className="relative w-full lg:w-72">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    findArea(e);
                  }
                }}
                placeholder={isHi ? "शहर, क्षेत्र या पिनकोड..." : "Choose a city, area or postal code"}
                className="w-full rounded-xl border border-stone-200 bg-[#fdfbf9] pl-10 pr-3 py-2.5 text-xs sm:text-sm outline-none transition focus:border-[#8f2338] focus:bg-white focus:ring-2 focus:ring-rose-200/50"
              />
            </div>

            {/* Use my location button */}
            <button
              type="button"
              onClick={useMyLocation}
              className="inline-flex w-full lg:w-auto shrink-0 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 shadow-2xs hover:bg-stone-50 hover:text-[#8f2338] transition active:scale-95"
            >
              <Navigation size={14} className="text-[#8f2338]" />
              <span>{isHi ? "मेरी लोकेशन उपयोग करें" : "Use my location"}</span>
            </button>

            {/* Keyword Query Input */}
            <div className="relative w-full flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    searchTailors();
                  }
                }}
                placeholder={isHi ? "परिधान, दर्जी, क्षेत्र, शहर..." : "Garment, tailor, area, city..."}
                className="w-full rounded-xl border border-stone-200 bg-[#fdfbf9] pl-10 pr-10 py-2.5 text-xs sm:text-sm outline-none transition focus:border-[#8f2338] focus:bg-white focus:ring-2 focus:ring-rose-200/50"
              />
              {/* Gemini Voice Search Mic with Coachmark Hover Modal */}
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowVoiceHelp(false);
                    setVoiceOpen(true);
                  }}
                  onMouseEnter={handleVoiceHoverEnter}
                  onMouseLeave={handleVoiceHoverLeave}
                  onFocus={handleVoiceHoverEnter}
                  onBlur={handleVoiceHoverLeave}
                  title="Search by voice"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8f2338] hover:bg-rose-50 transition active:scale-95"
                >
                  <Mic size={15} />
                </button>

                {/* Floating Coachmark Modal/Tooltip */}
                {showVoiceHelp && (
                  <div
                    role="tooltip"
                    className="absolute bottom-9 right-0 z-40 w-64 rounded-xl bg-[#1e293b] p-3 text-white shadow-xl border border-slate-700/80 text-xs animate-in fade-in duration-200"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                        <span>{isHi ? "बोलकर खोजें व छांटें" : "Speak to Search & Sort"}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowVoiceHelp(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] leading-tight text-slate-200">
                      {isHi
                        ? "जैसे 'शेरवानी 10 किमी' या 'शादी का लहंगा' कहें। श्रेणी और परिणाम तुरंत क्रमबद्ध होंगे!"
                        : 'Say e.g. "Bridal Lehenga in 5 days" or "Sherwani 10 km". Results filter & sort instantly!'}
                    </p>
                    <div className="absolute -bottom-1.5 right-3 w-3 h-3 rotate-45 bg-[#1e293b] border-r border-b border-slate-700/80" />
                  </div>
                )}
              </div>
            </div>

            {/* Search CTA button */}
            <button
              type="button"
              onClick={searchTailors}
              className="inline-flex w-full lg:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-[#8f2338] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#781c2e] transition active:scale-95"
            >
              <Search size={15} />
              <span>{isHi ? "खोजें" : "Search"}</span>
            </button>
          </div>

          {/* Location Permission / Set Center Banner when location is not determined */}
          {showLocationPrompt && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-amber-50 border border-amber-200/80 p-3.5 text-xs text-amber-900 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shrink-0">
                  <MapPin size={16} />
                </span>
                <div>
                  <p className="font-bold">
                    {isHi ? "खोज केंद्र सेट करें" : "Set Your Search Center"}
                  </p>
                  <p className="text-amber-800/80 text-[11px] mt-0.5">
                    {isHi
                      ? "सटीक दर्जी परिणाम पाने के लिए अपना वर्तमान स्थान साझा करें या ऊपर अपना शहर दर्ज करें।"
                      : "Allow location access to view verified ateliers nearest to you, or type your city above."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#8f2338] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#781c2e] transition"
                >
                  <Navigation size={12} />
                  <span>{isHi ? "मेरी लोकेशन उपयोग करें" : "Use My Location"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dismissGuestLocationPrompt();
                    setShowLocationPrompt(false);
                  }}
                  className="rounded-xl border border-amber-300/80 bg-white px-2.5 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100/50"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Row 5: Category Filter Pills */}
          <div className="mt-5 border-t border-stone-100 pt-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
              {CATEGORIES_LIST.map((cat) => {
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id || "all"}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#8f2338] text-white shadow-xs"
                        : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-[#8f2338] hover:border-[#8f2338]/40"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.id ? categoryLabel(cat.id) : (isHi ? "सभी श्रेणियां" : "All categories")}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 6: Filter Controls & View Switcher */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Show All Locations Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  const next = !showAllLocations;
                  setShowAllLocations(next);
                  const newParams = new URLSearchParams(searchParams);
                  if (next) newParams.set("all", "true");
                  else newParams.delete("all");
                  setSearchParams(newParams, { replace: true });
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition shadow-2xs ${
                  showAllLocations
                    ? "bg-[#8f2338] text-white ring-2 ring-[#8f2338]/20 shadow-xs"
                    : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
                }`}
              >
                <Globe size={13} className={showAllLocations ? "text-white" : "text-[#8f2338]"} />
                <span>{t("discovery.showAllLocations", "Show All Tailors (Irrespective of Location)")}</span>
              </button>

              {/* Radius Select */}
              <label
                className={`flex items-center gap-1.5 font-medium transition ${
                  showAllLocations ? "opacity-40 pointer-events-none" : "text-stone-700"
                }`}
              >
                <span className="text-stone-500">{t("discovery.radius", "Search radius")}:</span>
                <select
                  disabled={showAllLocations}
                  value={radius}
                  onChange={(e) => changeRadius(Number(e.target.value))}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-800 outline-none focus:border-[#8f2338]"
                >
                  <option value="2">2 km</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="20">20 km</option>
                  <option value="50">50 km</option>
                  <option value="100">100 km</option>
                </select>
              </label>

              {/* Sort Select */}
              <label className="flex items-center gap-1.5 font-medium text-stone-700">
                <span className="text-stone-500">{t("discovery.sort", "Sort")}:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-800 outline-none focus:border-[#8f2338]"
                >
                  <option value="recommended">{t("discovery.recommended", "Recommended")}</option>
                  <option value="category">{isHi ? "श्रेणी प्रासंगिकता" : "Category Relevance"}</option>
                  <option value="rating">{t("discovery.rating", "Rating (Highest)")}</option>
                  <option value="distance">{t("discovery.distance", "Distance (Closest)")}</option>
                  <option value="price-asc">{isHi ? "कीमत (कम से ज्यादा)" : "Price (Low to High)"}</option>
                  <option value="price-desc">{isHi ? "कीमत (ज्यादा से कम)" : "Price (High to Low)"}</option>
                </select>
              </label>
            </div>

            {/* View Mode Switcher Pill */}
            <div className="inline-flex rounded-xl bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition ${
                  viewMode === "split"
                    ? "bg-white text-[#8f2338] shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <SlidersHorizontal size={13} />
                <span>Split View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition ${
                  viewMode === "list"
                    ? "bg-white text-[#8f2338] shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <ListIcon size={13} />
                <span>List View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition ${
                  viewMode === "map"
                    ? "bg-white text-[#8f2338] shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <MapIcon size={13} />
                <span>Map Only</span>
              </button>
            </div>
          </div>
        </section>

        {/* Voice Understood Intent Banner */}
        {intent && intent.text && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                  <CheckCircle2 size={14} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  {t("discovery.understood", "Request understood:")}
                </span>
                <span className="text-xs font-medium text-emerald-800">"{intent.text}"</span>
              </div>
              <button
                type="button"
                onClick={clearVoiceIntent}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
              >
                <X size={13} /> {isHi ? "फ़िल्टर हटाएं" : "Clear filter"}
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 font-medium border border-red-200">
            {error}
          </p>
        )}

        {/* =========================================================
            BOTTOM MAIN CONTAINER: MAP & TAILORS DISCOVERY RESULTS
        ========================================================== */}
        <div
          className={`mt-6 grid gap-6 ${
            viewMode === "split"
              ? "lg:grid-cols-12"
              : viewMode === "map"
              ? "grid-cols-1"
              : "grid-cols-1"
          }`}
        >
          {/* MAP COLUMN (Visible in "split" and "map" modes) */}
          {(viewMode === "split" || viewMode === "map") && (
            <div
              ref={mapContainerRef}
              className={`${
                viewMode === "split" ? "lg:col-span-5 xl:col-span-5" : "col-span-1"
              }`}
            >
              <div
                className={`relative z-0 isolate overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xs ${
                  viewMode === "split"
                    ? `lg:sticky lg:top-24 transition-all ${
                        mapExpanded ? "h-[580px] lg:h-[760px]" : "h-[450px] lg:h-[660px]"
                      }`
                    : "h-[620px]"
                }`}
              >
                {/* Map Header Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-[#fdfbf9] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-[#8f2338] font-bold">
                      <MapPin size={15} />
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-stone-900">
                        {isHi ? "इंटरएक्टिव स्टूडियो मानचित्र" : "Interactive Studio Map"}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        {sorted.length} {isHi ? "स्टूडियो पिन" : "studio pins"}{" "}
                        {showAllLocations
                          ? isHi
                            ? "देशभर में"
                            : "nationwide"
                          : `(${radius} km)`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Quick City Dropdown */}
                    <select
                      onChange={(e) => {
                        const cityMatch = CITY_PRESETS.find((c) => c.city === e.target.value);
                        if (cityMatch) handleSelectCityPreset(cityMatch);
                      }}
                      defaultValue=""
                      className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-semibold text-stone-700 outline-none hover:border-[#8f2338]"
                    >
                      <option value="" disabled>
                        {isHi ? "शहर चुनें..." : "Jump to city..."}
                      </option>
                      {CITY_PRESETS.map((c) => (
                        <option key={c.city} value={c.city}>
                          {c.city}
                        </option>
                      ))}
                    </select>

                    {/* Reset Center View */}
                    <button
                      type="button"
                      onClick={() => setMapFlyTarget(center)}
                      title={isHi ? "खोज केंद्र पर रीसेट करें" : "Reset view to search center"}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-[#8f2338] transition"
                    >
                      <Navigation size={13} />
                    </button>

                    {/* Map Height Expand / Compact */}
                    <button
                      type="button"
                      onClick={() => setMapExpanded(!mapExpanded)}
                      title={mapExpanded ? "Compact height" : "Expand height"}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-[#8f2338] transition"
                    >
                      {mapExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                    </button>
                  </div>
                </div>

                {/* Leaflet Map Canvas */}
                <div className="relative h-[calc(100%-53px)] w-full">
                  <MapContainer
                    center={center}
                    zoom={locationSelected ? 12 : 11}
                    scrollWheelZoom
                    className="h-full w-full"
                  >
                    <Recenter center={center} zoom={locationSelected ? 12 : 11} />
                    <MapFlyTo target={mapFlyTarget} />
                    <SmartBoundsFitter items={sorted} center={center} shouldFit={!mapFlyTarget} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Search Center Circle */}
                    {!showAllLocations && locationSelected && validCenter(center) && (
                      <Circle
                        center={center}
                        radius={radius * 1000}
                        pathOptions={{
                          color: "#8f2338",
                          fillColor: "#8f2338",
                          fillOpacity: 0.08,
                          weight: 1.5,
                          dashArray: "4 4",
                        }}
                      />
                    )}

                    {/* Search Center Pulse Pin */}
                    {validCenter(center) && (
                      <Marker position={center} icon={centerPinIcon}>
                        <Popup>
                          <div className="p-1 text-xs">
                            <span className="rounded-sm bg-blue-100 text-blue-800 px-1 py-0.5 text-[10px] font-bold uppercase">
                              {isHi ? "खोज केंद्र" : "Search Origin"}
                            </span>
                            <p className="mt-1 font-semibold text-stone-900">{place}</p>
                            <p className="text-[11px] text-stone-500">
                              {showAllLocations
                                ? isHi
                                  ? "अखिल भारतीय खोज मोड"
                                  : "Nationwide discovery mode"
                                : `${radius} km ${isHi ? "दायरा" : "discovery radius"}`}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {/* Discovered Tailor Pins */}
                    {sorted.map((tailor) => {
                      const position = mapPosition(tailor.location);
                      const isVerified = tailor.verified || tailor.verificationStatus === "verified";
                      return (
                        position && (
                          <Marker
                            key={tailor._id}
                            position={position}
                            icon={isVerified ? verifiedIcon : standardIcon}
                          >
                            <Popup>
                              <div className="p-1 min-w-[210px] text-xs">
                                <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
                                  <span
                                    className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                                      isVerified
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-rose-100 text-[#8f2338]"
                                    }`}
                                  >
                                    {isVerified ? "✓ Verified" : "★ Artisan"}
                                  </span>
                                  <span className="font-extrabold text-stone-900 text-xs">
                                    ₹{tailor.minPrice || 499}+
                                  </span>
                                </div>
                                <h4 className="font-serif font-bold text-stone-950 text-sm mt-1.5 truncate">
                                  {tailor.name}
                                </h4>
                                <p className="text-stone-500 text-[11px] truncate">
                                  {isSignedIn
                                    ? [tailor.area, tailor.city].filter(Boolean).join(", ") || (isHi ? "स्थानीय स्टूडियो" : "Local Studio")
                                    : (tailor.city || (isHi ? "दर्जी स्टूडियो" : "Tailor Studio"))}
                                </p>
                                <p className="mt-1 font-semibold text-stone-800 text-[11px]">
                                  {t("discovery.kmAway", { distance: tailor.distance ?? "—" })}
                                </p>
                                <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-end">
                                  <Link
                                    to={`/tailors/${encodeURIComponent(tailor._id)}`}
                                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#8f2338] py-1.5 px-3 text-center text-xs font-bold text-white shadow-xs hover:bg-[#761c30] transition"
                                  >
                                    {!isSignedIn && <Lock size={11} className="text-rose-200" />}
                                    <span>{t("tailorView.viewInfo") || (isHi ? "विवरण देखें" : "View Details")} →</span>
                                  </Link>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        )
                      );
                    })}
                  </MapContainer>

                  {/* Floating Map Radius Overlay Pill matching mockup */}
                  <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white/95 px-3 py-1.5 text-xs font-bold text-stone-800 shadow-md backdrop-blur-xs">
                    <Compass size={13} className="text-[#8f2338]" />
                    <span>Radius: {radius} km</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAILORS CARDS LIST COLUMN (Visible in "split" and "list" modes) */}
          {(viewMode === "split" || viewMode === "list") && (
            <section
              className={`${
                viewMode === "split" ? "lg:col-span-7 xl:col-span-7" : "col-span-1"
              }`}
            >
              {/* Header inside listing */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-sans text-lg font-extrabold text-stone-900">
                    {busy
                      ? isHi ? "खोज जारी है..." : "Searching ateliers…"
                      : `${sorted.length} ${isHi ? "दर्जी" : "tailors"} within ${radius} km`}
                  </h2>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 size={13} />
                  <span>
                    {verifiedStudiosCount}{" "}
                    {isHi ? "सत्यापित स्टूडियो" : "Verified Studios"}
                  </span>
                </span>
              </div>

              {/* Skeletons while loading */}
              {busy ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="h-44 animate-pulse rounded-2xl border border-stone-200 bg-white p-5"
                    />
                  ))}
                </div>
              ) : sorted.length === 0 ? (
                /* Empty State */
                <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center">
                  <Shirt className="mx-auto text-stone-300 mb-3" size={40} />
                  <h3 className="font-serif text-lg font-bold text-stone-800">
                    {showAllLocations
                      ? isHi
                        ? "इस खोज या श्रेणी से मेल खाते कोई दर्जी नहीं मिले।"
                        : "No verified tailors found matching this search or category."
                      : isHi
                      ? "इस दायरे में कोई दर्जी नहीं मिले।"
                      : "No tailors found within this radius."}
                  </h3>
                  <p className="mt-1.5 text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                    {isHi
                      ? "खोज कीवर्ड बदलें या पूरे देश के दर्जी देखने के लिए 'Show All Tailors' चालू करें।"
                      : "Try expanding your search radius, clearing keywords, or enabling nationwide discovery."}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {!showAllLocations && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAllLocations(true);
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set("all", "true");
                          setSearchParams(newParams, { replace: true });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                      >
                        <Globe size={13} />
                        <span>{isHi ? "सभी दर्जी देखें (अखिल भारतीय)" : "Show All Tailors (Irrespective of Location)"}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setRadius(100);
                        handleCategoryChange("");
                        setQuery("");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
                    >
                      <span>{isHi ? "फ़िल्टर रीसेट करें" : "Reset Filters"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Tailors List: Horizontal Cards matching mockup */
                <div className="space-y-4">
                  {sorted.map((tailor) => {
                    const isSaved = savedTailorIds.has(String(tailor._id));
                    const isVerified = tailor.verified || tailor.verificationStatus === "verified";
                    const tailorImage = tailor.image || tailor.heroImage;
                    const tailorArea = tailor.area || tailor.city || "C block, Jaipur";
                    const tailorRating = tailor.rating || 4.8;
                    const tailorReviews = tailor.reviews || 120;
                    const tailorExp = tailor.experience || 5;
                    const tailorPrice = tailor.minPrice || 499;

                    return (
                      <article
                        key={tailor._id}
                        className="group relative flex flex-col sm:flex-row items-stretch overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8f2338]/40 hover:shadow-md gap-4"
                      >
                        {/* Left: Studio Image Showcase */}
                        <div className="relative h-44 sm:h-auto sm:w-56 shrink-0 overflow-hidden rounded-xl border border-stone-100">
                          <TailorAvatar
                            image={tailorImage}
                            name={tailor.name}
                            size="banner"
                            className="h-full w-full rounded-xl"
                            alt={tailor.name}
                          />
                        </div>

                        {/* Right: Studio Details & Actions */}
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div>
                            {/* Top row: Name & Bookmark Heart */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-sans text-base font-bold text-stone-900 group-hover:text-[#8f2338] transition truncate">
                                  {tailor.name}
                                </h3>

                                {/* Verified & Experience row */}
                                <div className="mt-1 flex items-center gap-1.5">
                                  {isVerified ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                                      <CheckCircle2 size={11} />
                                      <span>Verified</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-[#8f2338]">
                                      <Scissors size={11} />
                                      <span>Atelier</span>
                                    </span>
                                  )}
                                  <span className="text-stone-400 text-xs">·</span>
                                  <span className="text-xs text-stone-500 font-medium">
                                    {tailorExp}y exp
                                  </span>
                                </div>
                              </div>

                              {/* Bookmark Button */}
                              <button
                                type="button"
                                onClick={() => toggleSavedTailor(tailor)}
                                title={isSaved ? "Remove from bookmarks" : "Save studio"}
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-stone-400 hover:text-[#8f2338] hover:bg-rose-50 transition active:scale-95"
                              >
                                <Heart
                                  size={17}
                                  className={isSaved ? "fill-[#8f2338] text-[#8f2338]" : "hover:text-[#8f2338]"}
                                />
                              </button>
                            </div>

                            {/* Location & Distance */}
                            <div className="mt-2 flex items-center gap-3 text-xs text-stone-500 flex-wrap">
                              {isSignedIn ? (
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} className="text-[#8f2338] shrink-0" />
                                  <span className="truncate">{tailorArea}</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[11px] text-stone-400">
                                  <Lock size={11} className="text-stone-400 shrink-0" />
                                  <span className="truncate">{tailor.city || "Sign in to view location"}</span>
                                </span>
                              )}
                              {tailor.distance !== undefined && (
                                <span className="flex items-center gap-1 font-semibold text-stone-700">
                                  <Navigation size={11} className="text-[#8f2338] shrink-0" />
                                  <span>{t("discovery.kmAway", { distance: tailor.distance })}</span>
                                </span>
                              )}
                            </div>

                            {/* Rating with Gold Star */}
                            <div className="mt-2 flex items-center gap-1.5 text-xs">
                              <div className="flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 text-xs font-bold text-amber-900">
                                <Star size={11} fill="currentColor" className="text-amber-500" />
                                <span>{tailorRating}</span>
                              </div>
                              <span className="text-stone-400">({tailorReviews} reviews)</span>
                            </div>

                            {/* Category Tags */}
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {(tailor.categories && tailor.categories.length > 0
                                ? tailor.categories.slice(0, 3)
                                : ["Ethnic Wear", "Alteration"]
                              ).map((cat) => (
                                <span
                                  key={cat}
                                  className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-700"
                                >
                                  {categoryLabel(cat)}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Bottom Row: Starting price & Action buttons */}
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
                            <div>
                              <span className="block text-[9px] font-bold uppercase tracking-wider text-stone-400">
                                STARTING FROM
                              </span>
                              <p className="text-lg font-black text-stone-900">
                                ₹{tailorPrice}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Pin Button */}
                              <button
                                type="button"
                                onClick={() => handleFlyToTailor(tailor)}
                                title="Pin on map"
                                className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-[#8f2338] transition"
                              >
                                <MapPin size={12} className="text-[#8f2338]" />
                                <span>Pin</span>
                              </button>

                              {/* Call Tailor or Locked State */}
                              {isSignedIn ? (
                                <a
                                  href={`tel:${tailor.phone || "+919876543210"}`}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                                >
                                  <Phone size={12} />
                                  <span>Call tailor</span>
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openSignUp()}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
                                  title="Sign in to unlock contact number"
                                >
                                  <Lock size={12} className="text-amber-700" />
                                  <span>Call</span>
                                </button>
                              )}

                              {/* View Information CTA */}
                              <Link
                                to={`/tailors/${encodeURIComponent(tailor._id)}`}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition active:scale-95"
                                title={isSignedIn ? "View complete atelier profile" : "View studio details (Guest Mode)"}
                              >
                                {!isSignedIn && <Lock size={12} className="text-rose-200" />}
                                <span>View information</span>
                                <ArrowRight size={13} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Dedicated Voice Search Assistant Modal */}
      <VoiceSearchModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onApply={handleApplyVoiceModal}
      />

      <Footer />
    </div>
  );
}
