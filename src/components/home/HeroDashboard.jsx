import React, { useEffect, useState } from "react";
import {
  Heart,
  Scissors,
  CheckCircle2,
  Star,
  ChevronRight,
  Clock3,
  Ruler,
  PackageCheck,
  Compass,
  Phone,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

const HeroDashboard = ({ onSignUp }) => {
  const { t } = useTranslation();
  const { isSignedIn, getToken, openSignUp } = useAuth();

  const [topTailor, setTopTailor] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadLiveData() {
      try {
        setLoading(true);
        // 1. Fetch live top tailor
        const res = await fetch("/api/tailors?limit=1");
        if (res.ok) {
          const tailors = await res.json();
          if (isMounted && Array.isArray(tailors) && tailors.length > 0) {
            setTopTailor(tailors[0]);
          }
        }

        // 2. Fetch live user order if signed in
        if (isSignedIn) {
          try {
            const token = await getToken();
            if (token) {
              const orderRes = await fetch("/api/orders", {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (orderRes.ok) {
                const orders = await orderRes.json();
                if (isMounted && Array.isArray(orders) && orders.length > 0) {
                  // Find first non-completed order
                  const active = orders.find(
                    (o) => !["Completed", "Cancelled"].includes(o.status)
                  );
                  setActiveOrder(active || orders[0]);
                }
              }
            }
          } catch {
            // Ignore order fetch errors for dashboard preview
          }
        }
      } catch (err) {
        console.warn("Live dashboard fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLiveData();
    return () => {
      isMounted = false;
    };
  }, [isSignedIn, getToken]);

  const tailorName = topTailor?.name || t("home.featuredTailorFallback", "Verified Master Studio");
  const tailorSpecialty =
    topTailor?.categories?.[0] ||
    topTailor?.description?.slice(0, 40) ||
    t("home.tailorSpeciality", "Custom Tailoring & Alterations");
  const tailorRating = topTailor?.rating && Number(topTailor.rating) > 0 ? Number(topTailor.rating).toFixed(1) : "New";
  const tailorLocation = [topTailor?.area, topTailor?.city].filter(Boolean).join(", ") || t("home.nearYou", "Near You");

  const initials = tailorName
    ? tailorName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "MT";

  const cleanPhone = topTailor?.phone ? String(topTailor.phone).replace(/[^\d+]/g, "") : null;

  return (
    <div className="w-full select-none">
      <div
        className="
          rounded-[24px]
          border
          border-white/90
          bg-[#fffdf9]/98
          p-3.5
          shadow-[0_24px_60px_rgba(50,30,20,0.22)]
          sm:p-4
        "
      >
        {/* =====================================================
            DASHBOARD HEADER
        ====================================================== */}
        <div className="flex items-center justify-between px-1 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8f2338] text-white shadow-xs">
              <Scissors size={18} />
            </div>

            <div>
              <p className="text-[clamp(.55rem,1.2vw,.62rem)] font-bold uppercase tracking-[0.16em] text-[#928981]">
                {t("home.liveStudioFeed", "Live Atelier Feed")}
              </p>
              <h3 className="mt-0.5 font-serif text-[clamp(1.15rem,2.8vw,1.35rem)] font-semibold leading-none text-[#171c2d]">
                {t("home.featuredStudio", "Featured Studio")}
              </h3>
            </div>
          </div>

          <Link
            to="/find-tailors"
            className="flex h-8 items-center gap-1 rounded-full bg-[#f8eee8] px-2.5 text-[11px] font-bold text-[#8f2338] transition hover:bg-[#f1dfd5]"
            title={t("home.exploreAll", "Explore all studios")}
          >
            <Compass size={13} />
            <span className="hidden sm:inline">{t("home.explore", "Explore")}</span>
          </Link>
        </div>

        {/* =====================================================
            LIVE TAILOR PROFILE CARD
        ====================================================== */}
        {loading ? (
          <div className="h-32 animate-pulse rounded-[18px] border border-[#eee5dc] bg-stone-100/70 p-3.5" />
        ) : (
          <div className="rounded-[18px] border border-[#eee5dc] bg-white p-3.5 transition-all hover:border-[#8f2338]/30">
            <Link
              to={topTailor?._id ? `/tailors/${encodeURIComponent(topTailor._id)}` : "/find-tailors"}
              className="flex items-center gap-3 group"
            >
              {/* Tailor image / avatar */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-[#f7eee5]">
                {topTailor?.image && !imageError ? (
                  <img
                    src={topTailor.image}
                    alt={tailorName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-[#8f2338]">
                    {initials}
                  </div>
                )}

                {/* Verified badge */}
                {(topTailor?.verified || topTailor?.verificationStatus === "verified") && (
                  <span
                    className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500"
                    title="Verified Studio"
                  >
                    <CheckCircle2 size={9} className="text-white" />
                  </span>
                )}
              </div>

              {/* Tailor information */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h4 className="truncate text-[clamp(.78rem,1.8vw,.88rem)] font-bold text-[#202538] group-hover:text-[#8f2338] transition">
                    {tailorName}
                  </h4>
                  {(topTailor?.verified || topTailor?.verificationStatus === "verified") && (
                    <CheckCircle2 size={12} className="shrink-0 text-[#8f2338]" />
                  )}
                </div>

                <p className="mt-0.5 truncate text-[clamp(.58rem,1.4vw,.66rem)] text-[#777b84]">
                  {tailorSpecialty}
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[clamp(.55rem,1.3vw,.64rem)] font-bold text-[#c68635]">
                    <Star size={10} fill="currentColor" />
                    {tailorRating}
                  </span>

                  <span className="text-[8px] text-[#aaa39c]">•</span>

                  <span className="truncate text-[clamp(.55rem,1.3vw,.64rem)] text-[#777b84]">
                    {isSignedIn ? tailorLocation : (topTailor?.city || t("home.nearYou", "Near You"))}
                  </span>
                </div>
              </div>

              <ChevronRight size={16} className="shrink-0 text-[#827b76] group-hover:translate-x-0.5 transition" />
            </Link>

            {/* Quick Actions Bar */}
            <div className="mt-3 grid grid-cols-4 gap-1.5 border-t border-stone-100 pt-2.5">
              <Link
                to={isSignedIn ? "/dashboard" : "/find-tailors"}
                onClick={(e) => {
                  if (!isSignedIn) {
                    e.preventDefault();
                    if (onSignUp) onSignUp(); else openSignUp();
                  }
                }}
                className="flex flex-col items-center justify-center gap-1 rounded-xl bg-stone-50 py-1.5 text-center text-[#555] transition hover:bg-stone-100 hover:text-[#8f2338]"
              >
                <Ruler size={13} />
                <span className="text-[10px] font-semibold">{t("home.measurements", "Fit Vault")}</span>
              </Link>

              <Link
                to="/find-tailors"
                className="flex flex-col items-center justify-center gap-1 rounded-xl bg-stone-50 py-1.5 text-center text-[#555] transition hover:bg-stone-100 hover:text-[#8f2338]"
              >
                <Compass size={13} />
                <span className="text-[10px] font-semibold">{t("home.findTailors", "Studios")}</span>
              </Link>

              <Link
                to={isSignedIn ? "/orders" : "/find-tailors"}
                onClick={(e) => {
                  if (!isSignedIn) {
                    e.preventDefault();
                    if (onSignUp) onSignUp(); else openSignUp();
                  }
                }}
                className="flex flex-col items-center justify-center gap-1 rounded-xl bg-stone-50 py-1.5 text-center text-[#555] transition hover:bg-stone-100 hover:text-[#8f2338]"
              >
                <PackageCheck size={13} />
                <span className="text-[10px] font-semibold">{t("home.myOrders", "Orders")}</span>
              </Link>

              {isSignedIn && cleanPhone ? (
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl bg-emerald-50 py-1.5 text-center text-emerald-800 transition hover:bg-emerald-100"
                  title="Call Studio"
                >
                  <Phone size={13} />
                  <span className="text-[10px] font-semibold">{t("home.call", "Call")}</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onSignUp) onSignUp();
                    else openSignUp();
                  }}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl bg-rose-50 py-1.5 text-center text-[#8f2338] transition hover:bg-rose-100"
                  title={isSignedIn ? "Explore Studio" : "Get Started to Call"}
                >
                  {isSignedIn ? <Sparkles size={13} /> : <Phone size={13} />}
                  <span className="text-[10px] font-semibold">{isSignedIn ? t("home.book", "Book") : t("home.call", "Call")}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* =====================================================
            LIVE ACTIVE ORDER OR PLATFORM GUARANTEE
        ====================================================== */}
        <div className="mt-2.5 rounded-[18px] border border-[#eee5dc] bg-[#fffdf9] p-3.5">
          {activeOrder ? (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[clamp(.55rem,1.2vw,.62rem)] font-bold uppercase tracking-[0.14em] text-[#99918b]">
                    {t("home.currentOrder", "Current Order")}
                  </p>
                  <h4 className="mt-1 text-[clamp(.68rem,1.6vw,.78rem)] font-bold text-[#222638]">
                    {activeOrder.garmentType || activeOrder.title || t("home.orderName", "Bespoke Garment")}
                  </h4>
                </div>

                <Link
                  to="/orders"
                  className="flex items-center gap-1 text-[11px] font-bold text-[#8f2338] hover:underline"
                >
                  <span>{t("home.view", "View")}</span>
                  <ChevronRight size={13} />
                </Link>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700">
                  {t(`orders.status.${activeOrder.status}`, activeOrder.status || "In Progress")}
                </span>
                <span className="text-[11px] text-stone-400">
                  {activeOrder.estimatedDeliveryDate
                    ? new Date(activeOrder.estimatedDeliveryDate).toLocaleDateString()
                    : t("home.inProduction", "In Production")}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800">
                    {t("home.perfectFitGuaranteed", "Perfect Fit Guaranteed")}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {t("home.freeAlterationSupport", "Doorstep pickup & free alterations on every order")}
                  </p>
                </div>
              </div>

              <Link
                to="/find-tailors"
                className="shrink-0 rounded-xl bg-[#8f2338] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#781c2e] transition"
              >
                {t("home.explore", "Explore")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroDashboard;
