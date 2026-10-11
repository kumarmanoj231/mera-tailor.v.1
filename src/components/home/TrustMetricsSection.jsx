import React, { useEffect, useState } from "react";
import { Users, Scissors, Award, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

const TrustMetricsSection = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const res = await fetch("/api/platform/stats");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setStats(data);
        }
      } catch (err) {
        console.warn("Could not load live platform stats:", err);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const tailorCount = stats?.verifiedTailors || stats?.totalTailors;
  const tailorDisplay = tailorCount && tailorCount > 0 ? `${tailorCount}+` : "Verified";

  const orderCount = stats?.totalOrders;
  const orderDisplay = orderCount && orderCount > 0 ? `${orderCount}+` : "Guaranteed";

  const metrics = [
    {
      icon: <Scissors className="text-[#8f2338]" size={20} />,
      value: tailorDisplay,
      label: t("home.trustVerifiedTailors", "Verified Tailor Studios"),
      subtext: t("home.trustVerifiedSub", "Master artisans in your locality"),
    },
    {
      icon: <Award className="text-amber-600" size={20} />,
      value: "100%",
      label: t("home.trustFitAccuracy", "Fit Guarantee"),
      subtext: t("home.trustFitSub", "Free alteration & fitting assurance"),
    },
    {
      icon: <Users className="text-emerald-700" size={20} />,
      value: orderDisplay,
      label: orderCount && orderCount > 0 ? t("home.trustOrdersDelivered", "Orders Delivered") : t("home.doorstepFitting", "Doorstep Pickup"),
      subtext: t("home.trustOrdersSub", "Retail & bulk uniforms"),
    },
    {
      icon: <Clock className="text-blue-600" size={20} />,
      value: "3–5 Days",
      label: t("home.trustAvgTurnaround", "Quick Turnaround"),
      subtext: t("home.trustAvgSub", "Express delivery available"),
    },
  ];

  return (
    <section className="border-t border-[#eadfd4] bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
          {metrics.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3.5 rounded-2xl border border-stone-100 bg-[#fdfbf9] p-4 shadow-2xs transition-all hover:border-stone-200 hover:shadow-xs"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs border border-stone-100">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="font-serif text-lg sm:text-xl font-bold text-[#231b1a] truncate">
                  {item.value}
                </p>
                <p className="text-xs font-semibold text-stone-800 line-clamp-1">
                  {item.label}
                </p>
                <p className="text-[11px] text-stone-500 hidden sm:block truncate">
                  {item.subtext}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustMetricsSection;
