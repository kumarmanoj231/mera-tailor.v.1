import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const CategoryCard = ({
  emoji,
  title,
  categoryKey,
  price,
  tag,
  popular,
}) => {
  const { t } = useTranslation();
  const targetCategory = categoryKey || title;

  return (
    <Link
      to={`/find-tailors?category=${encodeURIComponent(targetCategory)}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-[#eadfd4] bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#8f2338]/40 hover:shadow-md sm:p-5"
    >
      {popular && (
        <span className="absolute right-3 top-3 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
          {t("home.popular", "Popular")}
        </span>
      )}

      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbf7f2] border border-[#eee4d8] text-2xl transition-transform duration-200 group-hover:scale-110">
          {emoji}
        </div>

        <h3 className="mt-3.5 text-sm font-bold text-[#231b1a] group-hover:text-[#8f2338] transition-colors">
          {title}
        </h3>

        <p className="mt-1 text-xs font-semibold text-[#8f2338]">
          {price}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-2.5 text-[11px] text-stone-500">
        <span className="truncate">{tag || t("home.customFit", "Custom Fit")}</span>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition-colors group-hover:bg-[#8f2338] group-hover:text-white">
          <ArrowUpRight size={12} />
        </span>
      </div>
    </Link>
  );
};

export default CategoryCard;