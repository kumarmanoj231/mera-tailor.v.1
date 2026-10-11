import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Search,
  MapPin,
  Ruler,
  Package,
  ShoppingBag,
  Heart,
  Scissors,
  ArrowRight,
  ChevronRight,
  Clock3,
  Star,
  ShieldCheck,
  Compass,
  BookOpen,
  Tag,
  Zap,
  ClipboardCheck,
  Smile,
  Image as ImageIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

// Custom Illustrated Craft Category SVG Graphics matching the atelier UI mockup
function EthnicWearIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 drop-shadow-xs" fill="none">
      <path d="M17 10L24 6L31 10L35 18L30 20L28 16V42H20V16L18 20L13 18L17 10Z" fill="#0D9488" />
      <path d="M28 16L33 24L30 38L24 42V16H28Z" fill="#E11D48" opacity="0.9" />
      <path d="M24 6L21 14H27L24 6Z" fill="#F59E0B" />
      <circle cx="24" cy="22" r="1.5" fill="#FEF08A" />
      <circle cx="24" cy="28" r="1.5" fill="#FEF08A" />
      <circle cx="24" cy="34" r="1.5" fill="#FEF08A" />
    </svg>
  );
}

function LadiesWearIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 drop-shadow-xs" fill="none">
      <path d="M20 8C20 8 22 13 24 13C26 13 28 8 28 8L31 14L28 20H20L17 14L20 8Z" fill="#2563EB" />
      <path d="M20 20L12 42C12 42 20 44 24 44C28 44 36 42 36 42L28 20H20Z" fill="#3B82F6" />
      <path d="M19 20H29V22H19V20Z" fill="#93C5FD" />
      <path d="M24 13V20" stroke="#1D4ED8" strokeWidth="1.5" />
    </svg>
  );
}

function FormalWearIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 drop-shadow-xs" fill="none">
      <rect x="10" y="15" width="28" height="23" rx="4" fill="#854D0E" />
      <path d="M19 15V12C19 10.3431 20.3431 9 22 9H26C27.6569 9 29 10.3431 29 12V15" stroke="#A16207" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 24H38" stroke="#CA8A04" strokeWidth="2" />
      <rect x="22" y="22" width="4" height="5" rx="1" fill="#FEF08A" />
      <rect x="15" y="23" width="2" height="3" fill="#A16207" />
      <rect x="31" y="23" width="2" height="3" fill="#A16207" />
    </svg>
  );
}

function SuitsSherwaniIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 drop-shadow-xs" fill="none">
      <circle cx="24" cy="11" r="5" fill="#FBBF24" />
      <path d="M14 40V24L24 18L34 24V40H14Z" fill="#1E293B" />
      <path d="M24 18L21 28H27L24 18Z" fill="#FFFFFF" />
      <path d="M22 23L24 25L26 23L25 21H23L22 23Z" fill="#B91C1C" />
      <path d="M14 24L21 34V40H14V24Z" fill="#0F172A" />
      <path d="M34 24L27 34V40H34V24Z" fill="#0F172A" />
    </svg>
  );
}

function ShirtsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 drop-shadow-xs" fill="none">
      <path d="M16 12L24 8L32 12L38 18L33 22L30 18V42H18V18L15 22L10 18L16 12Z" fill="#3B82F6" />
      <path d="M24 8L20 15L24 17L28 15L24 8Z" fill="#60A5FA" />
      <path d="M24 17V42" stroke="#1D4ED8" strokeWidth="1.5" strokeDasharray="2 3" />
      <rect x="27" y="21" width="5" height="6" rx="1" fill="#2563EB" />
    </svg>
  );
}

function PantsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 drop-shadow-xs" fill="none">
      <path d="M14 10H34V14L32 42H26L24 24L22 42H16L14 14V10Z" fill="#2563EB" />
      <path d="M14 10H34V13H14V10Z" fill="#1D4ED8" />
      <path d="M24 13V24" stroke="#93C5FD" strokeWidth="1.5" />
      <path d="M16 16H20" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 16H28" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AlterationsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 drop-shadow-xs" fill="none">
      <circle cx="16" cy="36" r="6" stroke="#EC4899" strokeWidth="3" />
      <circle cx="32" cy="36" r="6" stroke="#8B5CF6" strokeWidth="3" />
      <path d="M18 31L32 10" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 31L16 10" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="22" r="2.5" fill="#F59E0B" />
    </svg>
  );
}

const CATEGORIES_DATA = [
  {
    id: "Ethnic Wear",
    label: "Ethnic Wear",
    hiLabel: "एथनिक वियर",
    icon: <EthnicWearIcon />,
  },
  {
    id: "Ladies Wear",
    label: "Ladies Wear",
    hiLabel: "लेडीज़ वियर",
    icon: <LadiesWearIcon />,
  },
  {
    id: "Formal Wear",
    label: "Formal Wear",
    hiLabel: "फॉर्मल वियर",
    icon: <FormalWearIcon />,
  },
  {
    id: "Suit",
    label: "Suits & Sherwani",
    hiLabel: "सूट व शेरवानी",
    icon: <SuitsSherwaniIcon />,
  },
  {
    id: "Shirt",
    label: "Shirts",
    hiLabel: "शर्ट्स",
    icon: <ShirtsIcon />,
  },
  {
    id: "Pants",
    label: "Trousers & Pants",
    hiLabel: "ट्राउज़र्स व पैंट्स",
    icon: <PantsIcon />,
  },
  {
    id: "Dress",
    label: "Dresses & Gowns",
    hiLabel: "ड्रेसेस व गाउन",
    icon: <LadiesWearIcon />,
  },
  {
    id: "Salwar & Suits",
    label: "Salwar & Suits",
    hiLabel: "सलवार व सूट्स",
    icon: <EthnicWearIcon />,
  },
  {
    id: "Bridal Wear",
    label: "Bridal & Wedding",
    hiLabel: "शादी व ब्राइडल",
    icon: <EthnicWearIcon />,
  },
  {
    id: "Uniforms",
    label: "Uniforms",
    hiLabel: "यूनिफॉर्म",
    icon: <ShirtsIcon />,
  },
  {
    id: "Kids Wear",
    label: "Kids Wear",
    hiLabel: "किड्स वियर",
    icon: <ShirtsIcon />,
  },
  {
    id: "Alteration",
    label: "Alterations & Repair",
    hiLabel: "अल्टरेशन व रिपेयर",
    icon: <AlterationsIcon />,
  },
];

export default function CustomerHomeSection() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === "hi";
  const { user, profile, getToken } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [savedTailorIds, setSavedTailorIds] = useState(new Set());
  const [savedCount, setSavedCount] = useState(0);
  const [recommendedTailors, setRecommendedTailors] = useState([]);
  const [loadingTailors, setLoadingTailors] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Customer Name and Location formatted cleanly
  const rawName = profile?.firstName || user?.firstName || profile?.name?.split(" ")[0] || "Customer";
  const displayName = rawName.toUpperCase();
  const userLocation = profile?.city
    ? `${profile.city}${profile?.area ? `, ${profile.area}` : ""}`
    : (isHi ? "लोकेशन सेट नहीं है" : "Location not set");

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      try {
        setLoadingTailors(true);
        setLoadingOrders(true);
        const token = await getToken();
        if (token) {
          const res = await fetch("/api/users/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (active) {
              setOrders(data.orders || []);
              setMeasurements(data.measurements || []);
              const savedList = data.savedTailors || [];
              setSavedCount(savedList.length);
              setSavedTailorIds(new Set(savedList.map((t) => t._id || t.id)));
            }
          }
        }

        // Fetch top recommended ateliers
        const tailorRes = await fetch("/api/tailors?limit=4");
        if (tailorRes.ok) {
          const tList = await tailorRes.json();
          if (active && Array.isArray(tList)) {
            setRecommendedTailors(tList.slice(0, 4));
          }
        }
      } catch (err) {
        console.warn("Failed to load customer home data:", err);
      } finally {
        if (active) {
          setLoadingTailors(false);
          setLoadingOrders(false);
        }
      }
    }

    loadDashboardData();
    return () => {
      active = false;
    };
  }, [getToken]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/find-tailors?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/find-tailors");
    }
  };

  const handleToggleSaveTailor = async (e, tailorId) => {
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlySaved = savedTailorIds.has(tailorId);
    const shouldSave = !isCurrentlySaved;

    // Optimistic UI updates
    setSavedTailorIds((prev) => {
      const next = new Set(prev);
      if (shouldSave) next.add(tailorId);
      else next.delete(tailorId);
      return next;
    });
    setSavedCount((prev) => (shouldSave ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const token = await getToken();
      if (token) {
        const res = await fetch(`/api/saved-tailors/${encodeURIComponent(tailorId)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ saved: shouldSave }),
        });
        if (res.ok) {
          toast.success(
            shouldSave
              ? (isHi ? "दर्जी सहेजा गया!" : "Studio bookmarked!")
              : (isHi ? "सहेजे गए से हटाया गया" : "Removed from saved studios")
          );
        }
      }
    } catch (err) {
      console.warn("Failed to toggle saved tailor", err);
    }
  };

  const activeOrders = orders.filter(
    (o) => o.status !== "Completed" && o.status !== "Cancelled"
  );

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 pt-1 selection:bg-[#8f2338] selection:text-white">
      {/* =========================================================
          1. COCKPIT HERO & FIT PROFILE VAULT (HEADER BLOCK)
      ========================================================== */}
      <section className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          {/* Left Column: Role Badges, Greeting, Subtitle, Quick Actions */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 px-3 py-1 text-xs font-semibold text-emerald-800">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>{isHi ? "ग्राहक खाता · व्यक्तिगत हब" : "Customer Account - Personal Hub"}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-200 px-3 py-1 text-xs font-medium text-stone-700">
                <MapPin size={13} className="text-[#8f2338]" />
                <span className="truncate max-w-[240px]">{userLocation}</span>
              </span>
            </div>

            <h1 className="mt-4 font-sans text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-[#111827] leading-tight">
              {isHi ? `नमस्ते, ${displayName}!` : `Welcome back, ${displayName}!`}
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed">
              {isHi
                ? "आपका व्यक्तिगत सिलाई कॉकपिट। निकटवर्ती सत्यापित मास्टर दर्जी खोजें, अपने नाप वॉल्ट में रिकॉर्ड सुरक्षित रखें और ऑर्डर प्रगति ट्रैक करें।"
                : "Your personal bespoke tailoring cockpit. Discover vetted master ateliers nearby, keep measurements synced in your fit vault, and track custom stitch orders."}
            </p>

            {/* Quick Action Navigation CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/find-tailors"
                className="inline-flex items-center gap-2 rounded-full bg-[#8f2338] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#781c2e] active:scale-95"
              >
                <Compass size={14} />
                <span>{isHi ? "आस-पास के दर्जी खोजें" : "Find Tailors Nearby"}</span>
                <ArrowRight size={13} />
              </Link>

              <Link
                to="/orders"
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-semibold text-stone-800 shadow-2xs transition hover:bg-stone-50 active:scale-95"
              >
                <Package size={14} className="text-emerald-600" />
                <span>{isHi ? "मेरे ऑर्डर व कोट्स" : "My Orders & Quotes"}</span>
                {activeOrders.length > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {activeOrders.length}
                  </span>
                )}
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-semibold text-stone-800 shadow-2xs transition hover:bg-stone-50 active:scale-95"
              >
                <Tag size={14} className="text-[#8f2338]" />
                <span>{isHi ? "नाप प्रोफ़ाइल वॉल्ट" : "Fit Profile Vault"}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Fit Profile Vault Snapshot with Mannequin Graphic */}
          <div className="w-full lg:w-96 shrink-0 rounded-2xl border border-stone-200/90 bg-[#fdfbf9] p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-[#8f2338]">
                  <Ruler size={14} />
                </span>
                <h3 className="font-sans text-xs sm:text-sm font-bold text-stone-900">
                  {isHi ? "नाप प्रोफ़ाइल वॉल्ट" : "Fit Profile Vault"}
                </h3>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                {measurements.length > 0
                  ? `${measurements.length} ${isHi ? "प्रोफ़ाइल" : "profiles"}`
                  : (isHi ? "रिक्त" : "Empty")}
              </span>
            </div>

            <div className="mt-3.5 flex items-center justify-between gap-4">
              <div className="space-y-2 text-xs flex-1">
                <div className="flex justify-between gap-2 text-stone-600">
                  <span>{isHi ? "सहेजे गए नाप:" : "Saved Profiles:"}</span>
                  <strong className="text-stone-900 font-bold">
                    {measurements.length} {isHi ? "प्रोफ़ाइल" : "profiles"}
                  </strong>
                </div>
                <div className="flex justify-between gap-2 text-stone-600">
                  <span>{isHi ? "प्राथमिक परिधान:" : "Primary Garment:"}</span>
                  <strong className="text-stone-900 font-bold truncate max-w-[110px]">
                    {measurements[0]?.garment || (isHi ? "शर्ट / कुर्ता" : "Shirt / Kurta")}
                  </strong>
                </div>
                <div className="flex justify-between gap-2 text-stone-600">
                  <span>{isHi ? "खोज दायरा:" : "Discovery Radius:"}</span>
                  <strong className="text-stone-900 font-bold">100 km</strong>
                </div>
              </div>

              {/* Mannequin Graphic */}
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-stone-100 bg-white">
                <img
                  src="/assets/mannequin_fit_vault.jpg"
                  alt="Fit Vault Mannequin"
                  className="h-full w-full object-contain p-1"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200/80">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#8f2338] hover:underline"
              >
                <span>{isHi ? "नाप वॉल्ट प्रबंधित करें" : "Manage Measurement Vault"}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Metric Indicator Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-stone-100 pt-5">
          {/* Card 01: ACTIVE ORDERS */}
          <Link
            to="/orders"
            className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 transition-all duration-200 hover:border-[#8f2338]/40 hover:bg-white hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-[#8f2338]">
                01
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {isHi ? "सक्रिय ऑर्डर" : "ACTIVE ORDERS"}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-black text-stone-900">{activeOrders.length}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {activeOrders.length === 0
                    ? (isHi ? "कोई चालू सिलाई नहीं" : "No ongoing orders")
                    : `${activeOrders.length} in production`}
                </p>
              </div>
              <Package
                size={34}
                className="text-rose-300 stroke-[1.2] shrink-0 transition-transform group-hover:scale-110"
              />
            </div>
          </Link>

          {/* Card 02: FIT PROFILES */}
          <Link
            to="/dashboard"
            className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 transition-all duration-200 hover:border-emerald-500/40 hover:bg-white hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                02
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {isHi ? "नाप प्रोफ़ाइल" : "FIT PROFILES"}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-black text-stone-900">{measurements.length}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {isHi ? "डिजिटल वॉल्ट में सुरक्षित" : "Saved in digital vault"}
                </p>
              </div>
              <BookOpen
                size={34}
                className="text-rose-300 stroke-[1.2] shrink-0 transition-transform group-hover:scale-110"
              />
            </div>
          </Link>

          {/* Card 03: SAVED STUDIOS */}
          <Link
            to="/my-tailors"
            className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 transition-all duration-200 hover:border-rose-400/40 hover:bg-white hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-[#8f2338]">
                03
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {isHi ? "सेव किए दर्जी" : "SAVED STUDIOS"}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-black text-stone-900">{savedCount}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {isHi ? "बुकमार्क किए स्टूडियो" : "Bookmarked ateliers"}
                </p>
              </div>
              <Heart
                size={34}
                className="text-rose-400 stroke-[1.2] shrink-0 transition-transform group-hover:scale-110"
              />
            </div>
          </Link>

          {/* Card 04: LOCAL RANGE */}
          <Link
            to="/find-tailors"
            className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 transition-all duration-200 hover:border-blue-400/40 hover:bg-white hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-800">
                04
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {isHi ? "लोकल रेंज" : "LOCAL RANGE"}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-black text-stone-900">100 km</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {isHi ? "सहेजे स्थान के आस-पास" : "Around saved location"}
                </p>
              </div>
              <MapPin
                size={34}
                className="text-rose-300 stroke-[1.2] shrink-0 transition-transform group-hover:scale-110"
              />
            </div>
          </Link>
        </div>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-[#fdfbf9] p-2 shadow-xs transition focus-within:border-[#8f2338] focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-100"
        >
          <div className="flex flex-1 items-center gap-3 pl-3">
            <Search size={18} className="text-stone-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isHi
                  ? "परिधान, मास्टर दर्जी, ब्राइडल बुटीक या विशेषता खोजें..."
                  : "Search garment, master tailor, bridal atelier or specialty..."
              }
              className="w-full bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#8f2338] px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-[#781c2e] active:scale-95"
          >
            <Search size={14} />
            <span>{isHi ? "स्टूडियो खोजें" : "Explore Studios"}</span>
          </button>
        </form>
      </section>

      {/* =========================================================
          2. CRAFT SPECIALTIES / WHAT WOULD YOU LIKE STITCHED?
      ========================================================== */}
      <section className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8f2338]">
              <Scissors size={14} className="text-[#8f2338]" />
              <span>{isHi ? "सिलाई श्रेणियां" : "CRAFT SPECIALTIES"}</span>
            </span>
            <h2 className="mt-1 font-sans text-xl sm:text-2xl font-black text-stone-900">
              {isHi ? "क्या सिलवाना चाहते हैं?" : "What Would You Like Stitched?"}
            </h2>
          </div>
          <Link
            to="/find-tailors"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#8f2338] hover:underline"
          >
            <span>{isHi ? "सभी श्रेणियां देखें" : "View All Categories"}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {CATEGORIES_DATA.map((cat) => (
            <Link
              key={cat.id}
              to={`/find-tailors?category=${encodeURIComponent(cat.id)}`}
              className="group flex flex-col items-center justify-between rounded-2xl border border-stone-200/80 bg-[#fdfbf9] p-4 text-center transition hover:-translate-y-1 hover:border-[#8f2338]/40 hover:bg-white hover:shadow-sm min-h-[148px]"
            >
              <div className="flex h-12 w-12 items-center justify-center transition-transform duration-200 group-hover:scale-110">
                {cat.icon}
              </div>
              <div className="mt-2">
                <h3 className="text-xs font-bold text-stone-900 group-hover:text-[#8f2338] transition">
                  {isHi ? cat.hiLabel : cat.label}
                </h3>
                <span className="mt-0.5 block text-[11px] font-semibold text-stone-400 group-hover:text-stone-600 transition">
                  {isHi ? "देखें →" : "Explore →"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================
          3. ACTIVE TAILORING ORDERS & QUOTES
      ========================================================== */}
      <section className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <Package size={16} />
              </span>
              <h2 className="font-sans text-xl font-black text-stone-900">
                {isHi ? "सक्रिय सिलाई ऑर्डर व कोट्स" : "Active Tailoring Orders & Quotes"}
              </h2>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              {isHi
                ? "कस्टम सिलाई, अल्टरेशन फिटिंग्स और स्टूडियो कोट्स पर रीयल-टाइम अपडेट।"
                : "Real-time updates on bespoke crafting, alteration fittings, and studio quotes."}
            </p>
          </div>

          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition"
          >
            <span>{isHi ? "सभी ऑर्डर प्रबंधित करें" : "Manage All Orders"}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {loadingOrders ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 animate-pulse rounded-2xl border border-stone-200 bg-stone-100/70 p-5 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <div className="h-5 w-24 rounded-md bg-stone-200" />
                    <div className="h-5 w-16 rounded-full bg-stone-200" />
                  </div>
                  <div className="h-4 w-3/4 rounded-md bg-stone-200 mt-2" />
                  <div className="h-3 w-1/2 rounded-md bg-stone-200" />
                </div>
                <div className="h-8 w-full rounded-xl bg-stone-200" />
              </div>
            ))}
          </div>
        ) : activeOrders.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeOrders.map((order) => (
              <div
                key={order._id || order.id}
                className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-[#fdfbf9] p-5 transition hover:border-[#8f2338]/40 hover:bg-white hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-white border border-stone-200 px-2.5 py-0.5 text-xs font-bold text-stone-800">
                      {order.garment || order.category || (isHi ? "कस्टम परिधान" : "Bespoke Garment")}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                      <Clock3 size={11} />
                      <span>{order.status || "In Progress"}</span>
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-stone-900 line-clamp-1">
                    {order.tailorName || (isHi ? "सत्यापित दर्जी स्टूडियो" : "Verified Tailor Atelier")}
                  </h3>

                  <p className="mt-1 text-xs text-stone-500 line-clamp-2">
                    {order.notes || (isHi ? "सिलाई विवरण और नाप दर्ज किया गया।" : "Custom tailoring instructions recorded.")}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs border-t border-stone-200/80 pt-2.5">
                    <span className="text-stone-500">{isHi ? "कोटेशन मूल्य:" : "Quote Price:"}</span>
                    <strong className="text-stone-900 font-extrabold">
                      {order.quotePrice != null ? `₹${order.quotePrice}` : order.price != null ? `₹${order.price}` : (isHi ? "प्रतीक्षित" : "Pending")}
                    </strong>
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <Link
                    to="/orders"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#8f2338] py-2 text-xs font-bold text-white hover:bg-[#781c2e] transition shadow-xs"
                  >
                    <span>{isHi ? "ऑर्डर प्रगति देखें" : "View Order Progress"}</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-stone-200/80 bg-[#fdfbf9] p-8 text-center max-w-2xl mx-auto my-2">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-stone-400 mb-3">
              <ShoppingBag size={22} />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">
              {isHi ? "इस समय कोई सक्रिय ऑर्डर नहीं है" : "No active orders right now"}
            </h3>
            <p className="mt-1.5 text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              {isHi
                ? "अपने सटीक नाप के अनुसार शर्ट, सूट, लहंगा या अल्टरेशन बनवाने के लिए किसी सत्यापित स्थानीय कारीगर से जुड़ें।"
                : "Connect with a verified local artisan to get shirts, suits, lehengas, or alterations made to your exact measurements."}
            </p>
            <Link
              to="/find-tailors"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#8f2338] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#781c2e] transition shadow-xs active:scale-95"
            >
              <Compass size={14} />
              <span>{isHi ? "आस-पास के दर्जी खोजें" : "Find Tailors Nearby"}</span>
            </Link>
          </div>
        )}
      </section>

      {/* =========================================================
          4. RECOMMENDED & VERIFIED MASTER TAILORS
      ========================================================== */}
      <section className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-[#8f2338]">
                <Scissors size={15} />
              </span>
              <h2 className="font-sans text-xl font-black text-stone-900">
                {isHi ? "अनुशंसित व सत्यापित मास्टर दर्जी" : "Recommended & Verified Master Tailors"}
              </h2>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              {isHi
                ? "आपके इलाके के शीर्ष-रेटेड बीस्पोक कारीगर और अल्टरेशन विशेषज्ञ।"
                : "Top-rated bespoke ateliers and alteration specialists near your location."}
            </p>
          </div>

          <Link
            to="/find-tailors"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#8f2338] hover:underline"
          >
            <span>{isHi ? "सभी स्टूडियो देखें" : "Explore All Studios"}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {loadingTailors ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 animate-pulse rounded-2xl border border-stone-200 bg-stone-100/70 p-4" />
            ))}
          </div>
        ) : recommendedTailors.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
            <Scissors className="mx-auto text-stone-400 mb-2" size={28} />
            <h4 className="text-sm font-bold text-stone-800">
              {isHi ? "अभी आपके इलाके में कोई टेलर उपलब्ध नहीं है" : "No tailoring studios listed in this area yet"}
            </h4>
            <p className="mt-1 text-xs text-stone-500">
              {isHi
                ? "पूरे शहर के कारीगर देखने के लिए एक्सप्लोर मैप पर जाएं।"
                : "Explore master artisans across other districts on the discovery map."}
            </p>
            <Link
              to="/find-tailors"
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e]"
            >
              <span>{isHi ? "नक्शे पर खोजें" : "Explore on Map"}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedTailors.map((tailor) => {
              const isSaved = savedTailorIds.has(tailor._id);
              const tailorRating = Number(tailor.rating) > 0 ? Number(tailor.rating).toFixed(1) : null;
              const tailorReviews = Number(tailor.reviews) > 0 ? tailor.reviews : null;
              const tailorArea = [tailor.area, tailor.city].filter(Boolean).join(", ") || (isHi ? "स्थानीय स्टूडियो" : "Local Studio");
              const tailorPrice = tailor.minPrice || tailor.services?.[0]?.price || null;
              const studioImage = tailor.image || tailor.heroImage;

              return (
                <div
                  key={tailor._id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[#8f2338]/40 hover:shadow-md"
                >
                  <div>
                    {/* Studio Image Thumbnail / Card Header */}
                    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-stone-100 flex items-center justify-center border border-stone-100">
                      {studioImage ? (
                        <img
                          src={studioImage}
                          alt={tailor.name || "Tailor Studio"}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-stone-300">
                          <ImageIcon size={34} strokeWidth={1.2} />
                        </div>
                      )}

                      {/* Bookmark / Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleSaveTailor(e, tailor._id)}
                        title={isSaved ? "Remove from bookmarks" : "Save studio"}
                        className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-xs transition hover:scale-110 active:scale-95"
                      >
                        <Heart
                          size={15}
                          className={isSaved ? "fill-[#8f2338] text-[#8f2338]" : "text-stone-400 hover:text-stone-600"}
                        />
                      </button>
                    </div>

                    {/* Studio Info */}
                    <div className="mt-3">
                      <h3 className="font-sans text-sm font-bold text-stone-900 truncate group-hover:text-[#8f2338] transition">
                        {tailor.name}
                      </h3>

                      {/* Rating row */}
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                        {tailorRating ? (
                          <div className="flex items-center gap-1 font-bold text-stone-800">
                            <Star size={12} fill="currentColor" className="text-amber-500" />
                            <span>{tailorRating}</span>
                          </div>
                        ) : (
                          <span className="rounded bg-emerald-50 px-1 py-0.5 text-[10px] font-semibold text-emerald-700">
                            {isHi ? "नया" : "New"}
                          </span>
                        )}
                        {tailorReviews && (
                          <span className="text-stone-400">({tailorReviews} {isHi ? "समीक्षाएं" : "reviews"})</span>
                        )}
                      </div>

                      {/* Location */}
                      <p className="mt-1 flex items-center gap-1 text-xs text-stone-500 truncate">
                        <MapPin size={12} className="text-[#8f2338] shrink-0" />
                        <span className="truncate">{tailorArea}</span>
                      </p>

                      {/* Starting Price */}
                      <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2.5 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          {isHi ? "शुरुआती दर" : "STARTING"}
                        </span>
                        <strong className="text-sm font-black text-stone-900">
                          {tailorPrice ? `₹${tailorPrice}` : (isHi ? "अनुरोध पर" : "Bespoke")}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* View Studio Button */}
                  <div className="mt-3">
                    <Link
                      to={tailor._id ? `/tailors/${encodeURIComponent(tailor._id)}` : "/find-tailors"}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#8f2338] py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#781c2e] active:scale-95"
                    >
                      <span>{isHi ? "स्टूडियो देखें" : "View Studio"}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================
          5. WHY MERATAILOR / BESPOKE TAILORING, MADE SIMPLE
      ========================================================== */}
      <section className="rounded-3xl border border-rose-100/90 bg-[#fffbfc] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#8f2338]">
              <Zap size={13} className="text-[#8f2338]" />
              <span>{isHi ? "मेरा टेलर क्यों चुनें" : "WHY MERATAILOR"}</span>
            </span>
            <h2 className="mt-1 font-sans text-xl sm:text-2xl font-black text-stone-900">
              {isHi ? "बीस्पोक सिलाई, अब बिल्कुल आसान" : "Bespoke Tailoring, Made Simple"}
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-stone-500">
              {isHi
                ? "कारीगर की खोज से लेकर डिलीवरी तक, सहज व पारदर्शी सिलाई का अनुभव।"
                : "From discovery to delivery, experience a seamless tailoring journey."}
            </p>
          </div>

          <Link
            to="/how-it-works"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#8f2338] hover:underline"
          >
            <span>{isHi ? "अधिक जानें" : "Learn More"}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* 4 Feature Pill Cards Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Feature 1 */}
          <div className="flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Search size={18} />
            </div>
            <div>
              <h3 className="font-sans text-xs font-bold text-stone-900">
                {isHi ? "स्थानीय दर्जी खोजें" : "Discover Local Tailors"}
              </h3>
              <p className="mt-0.5 text-[11px] text-stone-500 leading-relaxed">
                {isHi
                  ? "अपने स्थान के पास सत्यापित मास्टर दर्जी खोजें।"
                  : "Find verified master tailors near your location."}
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Ruler size={18} />
            </div>
            <div>
              <h3 className="font-sans text-xs font-bold text-stone-900">
                {isHi ? "नाप सुरक्षित रखें" : "Keep Measurements Safe"}
              </h3>
              <p className="mt-0.5 text-[11px] text-stone-500 leading-relaxed">
                {isHi
                  ? "अपने नाप को डिजिटल रूप से वॉल्ट में स्टोर करें।"
                  : "Store your fit profile digitally in your vault."}
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-[#8f2338]">
              <ClipboardCheck size={18} />
            </div>
            <div>
              <h3 className="font-sans text-xs font-bold text-stone-900">
                {isHi ? "ऑर्डर आसानी से ट्रैक करें" : "Track Orders Easily"}
              </h3>
              <p className="mt-0.5 text-[11px] text-stone-500 leading-relaxed">
                {isHi
                  ? "कस्टम ऑर्डर पर रीयल-टाइम अपडेट प्राप्त करें।"
                  : "Get real-time updates on your custom orders."}
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <Smile size={18} />
            </div>
            <div>
              <h3 className="font-sans text-xs font-bold text-stone-900">
                {isHi ? "गुणवत्तापूर्ण शिल्प कौशल" : "Quality Craftsmanship"}
              </h3>
              <p className="mt-0.5 text-[11px] text-stone-500 leading-relaxed">
                {isHi
                  ? "विश्वसनीय कारीगर, प्रीमियम सिलाई, सही फिट।"
                  : "Trusted artisans, premium stitching, perfect fit."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
