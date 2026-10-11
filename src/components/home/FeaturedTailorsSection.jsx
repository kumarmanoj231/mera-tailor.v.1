import React, { useEffect, useState } from "react";
import { ArrowRight, Sparkles, MapPin, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FeaturedTailorCard from "./FeaturedTailorCard";

const CATEGORY_TABS = [
  { id: "all", label: "All Studios" },
  { id: "Ethnic Wear", label: "Ethnic & Traditional" },
  { id: "Ladies Wear", label: "Ladies & Bridal" },
  { id: "Formal Wear", label: "Formal & Suits" },
  { id: "Alteration", label: "Alterations & Repair" },
];

const FeaturedTailorsSection = () => {
  const { t } = useTranslation();
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const categoryTabs = [
    { id: "all", label: t("home.allStudios", "All Studios") },
    { id: "Ethnic Wear", label: t("home.catEthnic", "Ethnic & Traditional") },
    { id: "Ladies Wear", label: t("home.catLadies", "Ladies & Bridal") },
    { id: "Formal Wear", label: t("home.catFormal", "Formal & Suits") },
    { id: "Alteration", label: t("home.catAlteration", "Alterations & Repair") },
  ];

  useEffect(() => {
    let isMounted = true;
    async function fetchTailors() {
      try {
        setLoading(true);
        const res = await fetch("/api/tailors");
        if (!res.ok) throw new Error("Could not load tailors");
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          setTailors(data);
        }
      } catch (err) {
        console.warn("Featured tailors fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchTailors();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTailors = React.useMemo(() => {
    if (activeCategory === "all") return tailors.slice(0, 6);
    return tailors
      .filter((tailor) =>
        tailor.categories?.some((cat) =>
          cat.toLowerCase().includes(activeCategory.toLowerCase())
        )
      )
      .slice(0, 6);
  }, [tailors, activeCategory]);

  return (
    <section className="border-t border-[#eadfd4] bg-[#fdfbf9] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-bold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t("home.featuredBadge", "Real-Time Database Feed")}</span>
            </div>
            <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight text-[#231b1a] sm:text-3xl lg:text-4xl">
              {t("home.featuredTailors", "Featured Master Tailors & Boutiques")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              {t("home.featuredSubtitle", "Discover verified tailoring masters near you with transparent rates, real customer ratings, and guaranteed fittings.")}
            </p>
          </div>

          <Link
            to="/find-tailors"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-[#8f2338] shadow-xs transition hover:border-[#8f2338] hover:bg-rose-50/30"
          >
            <span>{t("home.viewAll", "Explore All on Map")}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-stone-200/80 pb-4">
          {categoryTabs.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#8f2338] text-white shadow-xs"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tailors Grid */}
        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-64 animate-pulse rounded-2xl border border-stone-200 bg-stone-100/70 p-5"
              />
            ))}
          </div>
        ) : filteredTailors.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <MapPin className="mx-auto text-stone-400 mb-2" size={32} />
            <h3 className="text-base font-bold text-stone-800">
              {t("home.noTailorsCategory", "No tailors found in this category")}
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              {t("home.noTailorsSub", "Browse other categories or check all available studios in the discovery map.")}
            </p>
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#8f2338] underline"
            >
              {t("home.showAllTailors", "Show all tailors")}
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTailors.map((tailor) => (
              <FeaturedTailorCard key={tailor._id} tailor={tailor} />
            ))}
          </div>
        )}

        {/* Bottom Explorer Banner */}
        <div className="mt-12 rounded-3xl border border-[#eadfd4] bg-gradient-to-r from-[#8f2338] to-[#701b2c] p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center sm:text-left">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-rose-100">
              {t("home.personalizedDiscovery", "Personalized Tailoring Discovery")}
            </span>
            <h3 className="mt-2 font-serif text-xl font-bold sm:text-2xl">
              {t("home.cantFindTitle", "Can't find the exact style you need?")}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-rose-100/90 leading-relaxed">
              {t("home.cantFindSub", "Use our AI Voice Assistant or radius locator to find specialized studios for bridal, corporate uniforms, or same-day alterations.")}
            </p>
          </div>

          <Link
            to="/find-tailors"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-xs sm:text-sm font-bold text-[#8f2338] shadow-sm transition hover:bg-stone-50"
          >
            <Search size={16} />
            <span>{t("home.searchNearMe", "Search Tailors Near Me")}</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTailorsSection;