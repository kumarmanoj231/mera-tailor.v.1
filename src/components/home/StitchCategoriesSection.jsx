import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import CategoryCard from "./CategoryCard";

const StitchCategoriesSection = () => {
  const { t } = useTranslation();

  const categories = [
    {
      emoji: "🥻",
      title: t("home.categories.ethnic", "Ethnic Wear"),
      categoryKey: "Ethnic Wear",
      price: t("home.categories.ethnicPrice", "₹799+"),
      tag: t("home.categories.ethnicTag", "Lehenga, Kurti, Saree"),
      popular: true,
    },
    {
      emoji: "👗",
      title: t("home.categories.dress", "Ladies Wear"),
      categoryKey: "Ladies Wear",
      price: t("home.categories.dressPrice", "₹499+"),
      tag: t("home.categories.dressTag", "Blouse, Gowns, Dresses"),
      popular: true,
    },
    {
      emoji: "🤵",
      title: t("home.categories.suit", "Suits & Sherwani"),
      categoryKey: "Suit",
      price: t("home.categories.suitPrice", "₹1,499+"),
      tag: t("home.categories.suitTag", "3-Piece, Tuxedo, Safari"),
      popular: false,
    },
    {
      emoji: "👔",
      title: t("home.categories.shirt", "Shirts"),
      categoryKey: "Shirt",
      price: t("home.categories.shirtPrice", "₹349+"),
      tag: t("home.categories.shirtTag", "Formal & Casual"),
      popular: false,
    },
    {
      emoji: "👖",
      title: t("home.categories.pants", "Trousers & Pants"),
      categoryKey: "Pants",
      price: t("home.categories.pantsPrice", "₹399+"),
      tag: t("home.categories.pantsTag", "Chinos, Formal, Jeans"),
      popular: false,
    },
    {
      emoji: "💼",
      title: t("home.categories.formal", "Formal & Office"),
      categoryKey: "Formal Wear",
      price: t("home.categories.formalPrice", "₹699+"),
      tag: t("home.categories.formalTag", "Blazers, Overcoats"),
      popular: false,
    },
    {
      emoji: "✂️",
      title: t("home.categories.alteration", "Alterations & Repair"),
      categoryKey: "Alteration",
      price: t("home.categories.alterationPrice", "₹99+"),
      tag: t("home.categories.alterationTag", "Fitting, Resizing, Hemming"),
      popular: true,
    },
  ];

  return (
    <section className="border-t border-[#eadfd4] bg-[#fcfaf7] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8f2338]">
              {t("home.exploreServices", "Explore Services")}
            </span>
            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#231b1a] sm:text-3xl lg:text-4xl">
              {t("home.whatToStitch", "What Would You Like Stitched?")}
            </h2>
            <p className="mt-2 text-sm text-stone-600 max-w-2xl">
              {t("home.whatToStitchSubtitle", "Select a category to instantly find specialist tailors in your neighborhood.")}
            </p>
          </div>

          <Link
            to="/find-tailors"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8f2338] hover:underline shrink-0"
          >
            <span>{t("home.viewAllServices", "View all stitching services")}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 sm:gap-3.5">
          {categories.map((category) => (
            <CategoryCard
              key={category.categoryKey}
              {...category}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StitchCategoriesSection;