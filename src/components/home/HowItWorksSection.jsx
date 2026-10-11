import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  UserRound,
  Scissors,
  Building2,
  Search,
  Ruler,
  CheckCircle2,
  PackageCheck,
  MessageSquare,
  TrendingUp,
  FileText,
  Users,
  ShieldCheck,
  Clock3,
  ArrowRight,
  Sparkles,
  Layers,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const STEP_ICONS = {
  customer: [Search, Ruler, CheckCircle2, PackageCheck],
  tailor: [Scissors, MessageSquare, Layers, TrendingUp],
  business: [FileText, Users, ShieldCheck, Clock3],
};

export default function HowItWorksSection({ isPage = false }) {
  const { t } = useTranslation();
  const { isSignedIn, profile, openSignUp } = useAuth();

  const userRole = profile?.role;
  const initialRole = ["customer", "tailor", "business"].includes(userRole)
    ? userRole
    : "customer";

  const [activeTab, setActiveTab] = useState(initialRole);

  // Sync active tab if user logs in or profile changes
  useEffect(() => {
    if (userRole && ["customer", "tailor", "business"].includes(userRole)) {
      setActiveTab(userRole);
    }
  }, [userRole]);

  const tabs = [
    {
      id: "customer",
      label: t("howItWorks.tabs.customer"),
      subtitle: t("howItWorks.tabs.customerSubtitle"),
      icon: UserRound,
      badge: null,
    },
    {
      id: "tailor",
      label: t("howItWorks.tabs.tailor"),
      subtitle: t("howItWorks.tabs.tailorSubtitle"),
      icon: Scissors,
      badge: t("howItWorks.dualCapabilityBadge"),
    },
    {
      id: "business",
      label: t("howItWorks.tabs.business"),
      subtitle: t("howItWorks.tabs.businessSubtitle"),
      icon: Building2,
      badge: null,
    },
  ];

  const stepsData = t(`howItWorks.steps.${activeTab}`, { returnObjects: true });
  const steps = Array.isArray(stepsData) ? stepsData : [];
  const icons = STEP_ICONS[activeTab] || STEP_ICONS.customer;

  const highlightsData = t(`howItWorks.highlights.${activeTab}`, {
    returnObjects: true,
  });
  const highlights = Array.isArray(highlightsData) ? highlightsData : [];

  return (
    <section
      id="how-it-works-section"
      className={`relative overflow-hidden ${
        isPage ? "bg-transparent" : "border-y border-[#eadfd4] bg-[#faf6f0]/70"
      } py-14 sm:py-16 lg:py-20`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8f2338]/20 bg-[#8f2338]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8f2338]">
            <Sparkles size={13} />
            {t("howItWorks.badge")}
          </span>

          <h2 className="mt-4 font-serif text-3xl font-semibold tracking-[-0.03em] text-[#1a1715] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            {t("howItWorks.title")}
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-[#5e5852] sm:text-base">
            {t("howItWorks.intro")}
          </p>
        </div>

        {/* Interactive Role Switcher Tabs */}
        <div className="mt-10 flex flex-col items-center">
          <div className="inline-flex w-full max-w-3xl flex-col gap-2 rounded-2xl border border-[#e2d5c5] bg-white p-1.5 shadow-[0_4px_20px_rgba(70,45,30,0.05)] sm:flex-row">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isUserCurrentRole = userRole === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex flex-1 items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#8f2338] text-white shadow-md shadow-[#8f2338]/20"
                      : "text-[#4a423d] hover:bg-[#fbf7f2] hover:text-[#8f2338]"
                  }`}
                >
                  <Icon
                    size={17}
                    className={`shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-[#8f2338]"
                    }`}
                  />
                  <span>{tab.label}</span>

                  {/* Active user role indicator pill */}
                  {isUserCurrentRole && (
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {t("howItWorks.activeRole")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Subtitle & Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-center">
            <p className="text-sm font-medium text-[#6e645d]">
              {tabs.find((t) => t.id === activeTab)?.subtitle}
            </p>

            {activeTab === "tailor" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm">
                <Layers size={13} className="text-amber-700" />
                {t("howItWorks.dualCapabilityBadge")}
              </span>
            )}
          </div>

          {/* Highlights Pill Row */}
          {highlights.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e5dcd1] bg-white/80 px-3 py-1 text-xs font-medium text-[#4d443e]"
                >
                  <Check size={12} className="text-emerald-600" />
                  {highlight}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 4 Step Cards Grid */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((stepItem, index) => {
            const IconComponent = icons[index] || CheckCircle2;

            return (
              <div
                key={index}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#e4d7c8] bg-white p-6 shadow-[0_4px_16px_rgba(70,45,30,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#8f2338]/40 hover:shadow-[0_12px_28px_rgba(70,45,30,0.08)]"
              >
                <div>
                  {/* Top Row: Counter & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl font-bold text-[#8f2338]/80 group-hover:text-[#8f2338]">
                      {stepItem.number || `0${index + 1}`}
                    </span>

                    {stepItem.badge && (
                      <span className="rounded-full bg-[#faf1ea] px-2.5 py-0.5 text-[11px] font-semibold text-[#8f2338]">
                        {stepItem.badge}
                      </span>
                    )}
                  </div>

                  {/* Icon Container */}
                  <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#faf1ea] text-[#8f2338] transition-transform duration-300 group-hover:scale-105 group-hover:bg-[#8f2338] group-hover:text-white">
                    <IconComponent size={22} />
                  </div>

                  {/* Step Title */}
                  <h3 className="mt-4 text-base font-bold text-[#1f1a18] sm:text-lg">
                    {stepItem.title}
                  </h3>

                  {/* Step Description */}
                  <p className="mt-2 text-xs leading-relaxed text-[#665e57] sm:text-sm">
                    {stepItem.description}
                  </p>
                </div>

                {/* Bottom Step Indicator Bar */}
                <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-emerald-100/70">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500 group-hover:bg-emerald-600"
                    style={{ width: `${(index + 1) * 25}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Contextual Action Banner */}
        <div className="mt-10 rounded-2xl border border-[#e5d8cb] bg-gradient-to-r from-white via-[#fffdfb] to-[#faf4ee] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <h4 className="font-serif text-xl font-bold text-[#1f1a18] sm:text-2xl">
                {activeTab === "customer" && t("howItWorks.ctas.customerPrimary")}
                {activeTab === "tailor" && t("howItWorks.ctas.tailorPrimary")}
                {activeTab === "business" && t("howItWorks.ctas.businessPrimary")}
              </h4>
              <p className="mt-1 text-xs text-[#6e645d] sm:text-sm">
                {activeTab === "customer" &&
                  "Search verified studios in your neighbourhood or speak what you need."}
                {activeTab === "tailor" &&
                  "Connect with retail clients and bid on commercial batch requirements."}
                {activeTab === "business" &&
                  "Get volume production proposals with sample verification and milestone tracking."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* CUSTOMER CTAs */}
              {activeTab === "customer" && (
                <>
                  <Link
                    to="/find-tailors"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#8f2338] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#8f2338]/20 transition-all hover:bg-[#781b2e] hover:shadow-lg"
                  >
                    <Search size={16} />
                    {t("howItWorks.ctas.customerPrimary")}
                    <ArrowRight size={15} />
                  </Link>

                  {isSignedIn ? (
                    <Link
                      to="/orders"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#d8c9bc] bg-white px-4 py-3 text-sm font-semibold text-[#3d342f] transition hover:bg-[#fcf8f4]"
                    >
                      <PackageCheck size={16} className="text-[#8f2338]" />
                      {t("howItWorks.ctas.customerSecondary")}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={openSignUp}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#d8c9bc] bg-white px-4 py-3 text-sm font-semibold text-[#3d342f] transition hover:bg-[#fcf8f4]"
                    >
                      {t("howItWorks.ctas.getStarted")}
                    </button>
                  )}
                </>
              )}

              {/* TAILOR CTAs */}
              {activeTab === "tailor" && (
                <>
                  {isSignedIn && userRole === "tailor" ? (
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#8f2338] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#8f2338]/20 transition hover:bg-[#781b2e]"
                    >
                      <Scissors size={16} />
                      {t("howItWorks.ctas.tailorPrimary")}
                      <ArrowRight size={15} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={isSignedIn ? () => {} : () => openSignUp('tailor')}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#8f2338] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#8f2338]/20 transition hover:bg-[#781b2e]"
                    >
                      <Scissors size={16} />
                      {isSignedIn
                        ? t("howItWorks.ctas.tailorPrimary")
                        : "Join as a Tailor Partner"}
                      <ArrowRight size={15} />
                    </button>
                  )}

                  <Link
                    to="/find-tailors"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#d8c9bc] bg-white px-4 py-3 text-sm font-semibold text-[#3d342f] transition hover:bg-[#fcf8f4]"
                  >
                    {t("howItWorks.ctas.tailorSecondary")}
                  </Link>
                </>
              )}

              {/* BUSINESS CTAs */}
              {activeTab === "business" && (
                <>
                  <Link
                    to="/bulk"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#8f2338] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#8f2338]/20 transition hover:bg-[#781b2e]"
                  >
                    <FileText size={16} />
                    {t("howItWorks.ctas.businessPrimary")}
                    <ArrowRight size={15} />
                  </Link>

                  {isSignedIn && (userRole === "business" || userRole === "admin") && (
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#d8c9bc] bg-white px-4 py-3 text-sm font-semibold text-[#3d342f] transition hover:bg-[#fcf8f4]"
                    >
                      <Building2 size={16} className="text-[#8f2338]" />
                      {t("howItWorks.ctas.businessSecondary")}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}