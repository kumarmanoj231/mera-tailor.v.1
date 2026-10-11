import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

const AudienceCard = ({
  icon,
  badge,
  title,
  subtitle,
  points = [],
  ctaText,
  ctaLink,
  popular,
}) => {
  return (
    <div
      className={`group relative flex flex-col justify-between rounded-3xl border p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
        popular
          ? "border-[#8f2338]/30 bg-gradient-to-b from-white to-[#fff9f5] shadow-md ring-1 ring-[#8f2338]/20"
          : "border-[#eadfd4] bg-white shadow-xs hover:border-stone-300"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-6 rounded-full bg-[#8f2338] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
          {badge}
        </span>
      )}

      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7eee5] text-[#8f2338]">
          {icon}
        </div>

        <h3 className="mt-5 font-serif text-lg font-bold text-[#231b1a] sm:text-xl">
          {title}
        </h3>

        <p className="mt-1 text-xs text-stone-500 leading-relaxed">
          {subtitle}
        </p>

        <div className="mt-5 space-y-2.5 border-t border-stone-100 pt-4">
          {points.map((point, index) => (
            <div key={index} className="flex items-start gap-2 text-xs text-stone-700">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <Check size={11} strokeWidth={3} />
              </span>
              <span className="leading-snug">{point}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7 pt-4 border-t border-stone-100">
        <Link
          to={ctaLink || "/find-tailors"}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            popular
              ? "bg-[#8f2338] text-white hover:bg-[#781c2e] shadow-xs"
              : "border border-stone-200 bg-stone-50 text-stone-800 hover:bg-stone-100 hover:border-stone-300"
          }`}
        >
          <span>{ctaText || "Learn More"}</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};

export default AudienceCard;
