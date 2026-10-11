import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Heart,
  MapPin,
  Search,
  Star,
  Phone,
  ArrowRight,
  CheckCircle2,
  Users,
  Compass,
  AlertCircle,
  Scissors,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function MyTailors() {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === "hi";
  const { isSignedIn, getToken, openSignUp } = useAuth();

  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch("/api/saved-tailors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("pages.error", "Failed to load saved studios."));
      setTailors(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e.message || t("pages.error", "Could not load saved tailors."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      load();
    } else {
      setTailors([]);
      setLoading(false);
    }
  }, [isSignedIn]);

  async function unsave(id) {
    setRemovingId(id);
    try {
      const token = await getToken();
      const res = await fetch(`/api/saved-tailors/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ saved: false }),
      });
      if (!res.ok) throw new Error();
      setTailors((prev) => prev.filter((tailor) => tailor._id !== id));
      toast.success(isHi ? "सहेजे गए दर्जी से हटाया गया।" : "Removed from saved tailors.");
    } catch {
      setError(isHi ? "हटाने में विफल।" : "Could not remove tailor.");
      toast.error(isHi ? "हटाने में विफल।" : "Could not remove tailor.");
    } finally {
      setRemovingId(null);
    }
  }

  const filteredTailors = useMemo(() => {
    if (!searchQuery.trim()) return tailors;
    const q = searchQuery.toLowerCase();
    return tailors.filter(
      (tailor) =>
        tailor.name?.toLowerCase().includes(q) ||
        tailor.area?.toLowerCase().includes(q) ||
        tailor.city?.toLowerCase().includes(q) ||
        tailor.categories?.some((cat) => cat.toLowerCase().includes(q))
    );
  }, [tailors, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#111827] selection:bg-[#8f2338] selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =========================================================
            HEADER BANNER WITH ILLUSTRATION MATCHING MOCKUP
        ========================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
          {/* Atelier Illustration on Right */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-80 lg:w-96 overflow-hidden opacity-90 hidden sm:block">
            <img
              src="/assets/tailor_banner_illustration.jpg"
              alt="Tailor atelier illustration"
              className="h-full w-full object-contain object-right"
            />
          </div>

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            {/* Left: Eyebrow, Title, Subtitle */}
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-[#8f2338] border border-rose-100 shadow-2xs">
                  <Heart size={20} className="text-[#8f2338]" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#8f2338]">
                    {isHi ? "आपका संग्रह" : "YOUR COLLECTION"}
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-stone-900 leading-tight">
                    {isHi ? "मेरे दर्जी" : "My Tailors"}
                  </h1>
                </div>
              </div>

              <p className="mt-1 text-xs sm:text-sm text-stone-500 leading-relaxed">
                {isHi
                  ? "आपके विश्वसनीय सिलाई पेशेवर एक ही स्थान पर। अपने सहेजे गए दर्जियों को प्रबंधित करें, विवरण देखें और नए ऑर्डर दें।"
                  : "Your trusted tailoring professionals in one place. Manage your saved tailors, view details and place new orders."}
              </p>
            </div>

            {/* Right: Search Input & Saved Count Badge */}
            {isSignedIn && tailors.length > 0 && (
              <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isHi ? "सहेजे गए दर्जियों में खोजें..." : "Search in saved tailors..."}
                    className="w-full sm:w-60 rounded-xl border border-stone-200 bg-[#fdfbf9] pl-9 pr-3 py-2 text-xs outline-none focus:border-[#8f2338] focus:bg-white focus:ring-2 focus:ring-rose-100 transition"
                  />
                </div>

                <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs">
                  <Users size={13} className="text-stone-500" />
                  <span>
                    {filteredTailors.length}{" "}
                    {filteredTailors.length === 1
                      ? isHi ? "स्टूडियो सहेजा गया" : "Studio Saved"
                      : isHi ? "स्टूडियो सहेजे गए" : "Studios Saved"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Error message */}
        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-[#8f2338]">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Signed Out Prompt */}
        {!isSignedIn && (
          <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-12 text-center shadow-xs">
            <Heart size={36} className="mx-auto text-rose-300 mb-3" />
            <h2 className="font-serif text-xl font-bold text-stone-900">
              {isHi ? "अपने पसंदीदा दर्जियों को सहेजें" : "Save Your Favorite Tailors"}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              {isHi
                ? "अपने पसंदीदा मास्टर कारीगरों को बुकमार्क करने और कभी भी त्वरित ऑर्डर देने के लिए साइन इन करें।"
                : "Sign in to bookmark your favorite master artisans and place orders whenever you need custom stitching."}
            </p>
            <button
              onClick={openSignUp}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#8f2338] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#781c2e] transition active:scale-95"
            >
              <span>{isHi ? "शुरू करें" : "Get Started"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Loading State */}
        {isSignedIn && loading && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-3xl border border-stone-200 bg-white p-6"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {isSignedIn && !loading && tailors.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[#8f2338] mb-3">
              <Heart size={24} />
            </div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              {isHi ? "अभी कोई सहेजा गया दर्जी नहीं है" : "No saved tailors yet"}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              {isHi
                ? "मास्टर दर्जियों को खोजते समय दिल के आइकन पर क्लिक करके अपने व्यक्तिगत संग्रह में जोड़ें।"
                : "Browse vetted ateliers near you and tap the heart icon on any tailor card to add them to your collection."}
            </p>
            <Link
              to="/find-tailors"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8f2338] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#781c2e] transition active:scale-95"
            >
              <Compass size={14} />
              <span>{isHi ? "आस-पास के दर्जी खोजें" : "Find Tailors Nearby"}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* =========================================================
            SAVED TAILORS CARDS GRID MATCHING MOCKUP
        ========================================================== */}
        {isSignedIn && !loading && filteredTailors.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTailors.map((tailor) => {
              const isRemoving = removingId === tailor._id;
              const initials = tailor.name
                ? tailor.name
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                : "RJ";

              const tailorArea = [tailor.area, tailor.city, tailor.country || "India"]
                .filter(Boolean)
                .join(", ") || (isHi ? "सी ब्लॉक, जयपुर, भारत" : "C block, Jaipur, India");

              const categories = tailor.categories?.length > 0
                ? tailor.categories
                : ["Ethnic Wear", "Alteration"];

              return (
                <article
                  key={tailor._id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#8f2338]/40 hover:shadow-md"
                >
                  <div>
                    {/* Top Row: Initials Avatar, Name & Solid Maroon Heart */}
                    <div className="flex items-start gap-3.5">
                      {/* Initials Avatar Box */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 font-bold text-lg text-[#8f2338]">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="truncate font-sans text-base font-bold text-stone-900 group-hover:text-[#8f2338] transition">
                            {tailor.name}
                          </h3>

                          {/* Solid Maroon Heart Bookmark Toggle */}
                          <button
                            type="button"
                            onClick={() => unsave(tailor._id)}
                            disabled={isRemoving}
                            title={isHi ? "सहेजे गए से हटाएं" : "Remove from saved"}
                            className="text-[#8f2338] hover:scale-110 transition active:scale-95 shrink-0"
                          >
                            <Heart size={18} className="fill-[#8f2338] text-[#8f2338]" />
                          </button>
                        </div>

                        {/* Verified Studio Badge */}
                        <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-emerald-800">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>{isHi ? "सत्यापित स्टूडियो" : "Verified Studio"}</span>
                        </div>

                        {/* Location */}
                        <p className="mt-1 flex items-center gap-1 text-xs text-stone-500 truncate">
                          <MapPin size={12} className="shrink-0 text-[#8f2338]" />
                          <span className="truncate">{tailorArea}</span>
                        </p>

                        {/* Rating & Experience */}
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1 rounded bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 text-xs font-bold text-stone-800">
                            <Star size={11} fill="currentColor" className="text-amber-500" />
                            <span>{tailor.rating || 4.8}</span>
                          </div>
                          <span className="text-stone-300">|</span>
                          <span className="text-stone-500 font-medium">
                            {tailor.experience || 5} {isHi ? "वर्ष अनुभव" : "yrs exp"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category Tags in Soft Rose Pills */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <span
                          key={cat}
                          className="rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-xs font-semibold text-[#8f2338]"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Row Actions matching mockup */}
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
                    <a
                      href={`tel:${tailor.phone || "+919876543210"}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                      title="Call Studio"
                    >
                      <Phone size={13} />
                      <span>{isHi ? "कॉल करें" : "Call tailor"}</span>
                    </a>

                    <Link
                      to={`/tailors/${encodeURIComponent(tailor._id)}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition active:scale-95"
                    >
                      <span>{isHi ? "इस दर्जी से सिलवाएं" : "Order with this tailor"}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
