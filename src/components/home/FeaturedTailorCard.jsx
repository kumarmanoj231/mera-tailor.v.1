import React from "react";
import { Star, MapPin, CheckCircle2, ArrowRight, Phone, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import TailorAvatar from "../common/TailorAvatar";

const FeaturedTailorCard = ({ tailor }) => {
  const { t } = useTranslation();
  const { isSignedIn, openSignUp } = useAuth();

  if (!tailor) return null;

  const {
    _id,
    name,
    area,
    city,
    image,
    rating,
    reviews,
    experience,
    minPrice,
    services = [],
    categories = [],
    verified,
    verificationStatus,
    phone,
    description,
  } = tailor;

  const isVerified = Boolean(verified === true || verificationStatus === "verified");
  const startingPrice = minPrice && Number(minPrice) > 0 
    ? Number(minPrice) 
    : (services?.[0]?.price && Number(services[0].price) > 0 ? Number(services[0].price) : null);

  const cleanPhone = phone ? String(phone).replace(/[^\d+]/g, "") : null;

  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "MT";

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#eadfd4] bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#8f2338]/40 hover:shadow-lg">
      {/* Top Details & Avatar */}
      <div>
        <div className="flex items-start gap-3.5">
          <TailorAvatar
            image={image}
            name={name}
            size="lg"
            rounded="rounded-xl"
            alt={name || "Tailor Studio"}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-bold text-[#231b1a]">{name}</h3>
              {isVerified && (
                <span title="Verified Studio" className="shrink-0 text-emerald-600">
                  <CheckCircle2 size={16} fill="currentColor" className="text-white fill-emerald-600" />
                </span>
              )}
            </div>

            {/* Location */}
            {isSignedIn ? (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
                <MapPin size={13} className="shrink-0 text-[#8f2338]" />
                <span className="truncate">{[area, city].filter(Boolean).join(", ") || t("home.tailorName", "Local Studio")}</span>
              </div>
            ) : (
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-stone-400">
                <Lock size={11} className="shrink-0 text-stone-400" />
                <span className="truncate">{t("home.getStartedToViewLocation", "Get started to view location")}</span>
              </div>
            )}

            <div className="mt-1.5 flex items-center gap-2 text-xs">
              {Number(rating) > 0 ? (
                <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                  <Star size={12} fill="currentColor" className="text-amber-500" />
                  {Number(rating).toFixed(1)}
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  {t("home.newStudio", "New")}
                </span>
              )}

              {Number(reviews) > 0 && (
                <span className="text-[11px] text-stone-400">
                  ({reviews} {t("home.reviewsCount", "reviews")})
                </span>
              )}

              {Number(experience) > 0 && (
                <>
                  <span className="h-3 w-px bg-stone-200" />
                  <span className="text-[11px] font-medium text-stone-600">
                    {experience} {t("home.yrsExp", "yrs exp")}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Short Bio */}
        <p className="mt-3.5 line-clamp-2 min-h-[38px] text-xs leading-relaxed text-stone-600">
          {description || `${name} provides custom stitching, bespoke tailoring, and precision alterations.`}
        </p>

        {/* Categories Chips */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="rounded-lg bg-[#f9f5f0] border border-[#ece3d9] px-2 py-0.5 text-[11px] font-medium text-stone-700"
            >
              {cat}
            </span>
          ))}
          {categories.length > 3 && (
            <span className="rounded-lg bg-stone-50 px-1.5 py-0.5 text-[10px] font-medium text-stone-500">
              +{categories.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Bottom Actions & Price */}
      <div className="mt-5 border-t border-stone-100 pt-3.5 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
            {t("home.startingFrom", "Starting from")}
          </p>
          <p className="text-sm font-extrabold text-[#8f2338]">
            {startingPrice ? `₹${startingPrice}` : t("home.customPrice", "Bespoke")}
          </p>
        </div>

        {/* Actions */}
        {isSignedIn ? (
          <div className="flex items-center gap-2">
            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
                title={t("home.call", "Call")}
              >
                <Phone size={13} />
                <span>{t("home.call", "Call")}</span>
              </a>
            )}
            <Link
              to={_id ? `/tailors/${encodeURIComponent(_id)}` : "/find-tailors"}
              className="inline-flex items-center gap-1 rounded-xl bg-[#8f2338] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#781c2e] shadow-xs"
            >
              <span>{t("home.viewProfile", "View Profile")}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={openSignUp}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
          >
            <Lock size={12} />
            <span>{t("home.getStartedToContact", "Get Started to Contact")}</span>
          </button>
        )}
      </div>
    </article>
  );
};

export default FeaturedTailorCard;