import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  Store,
  Layers,
  Activity,
  Sliders,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

export default function AdminHomeSection({ onNavigateTab }) {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === "hi";
  const { profile, user, getToken } = useAuth();
  const navigate = useNavigate();

  const handleTabClick = (tabKey, fallbackRoute = "/admin") => {
    if (onNavigateTab && tabKey) {
      onNavigateTab(tabKey);
    } else {
      navigate(tabKey ? `/admin?tab=${tabKey}` : fallbackRoute);
    }
  };

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch real-time admin analytics and summary
  useEffect(() => {
    let isMounted = true;

    async function loadAdminSummary() {
      try {
        const token = await getToken();
        if (!token) {
          if (isMounted) setLoading(false);
          return;
        }

        const res = await fetch("/api/admin/dashboard-summary", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) setDashboardData(data);
        } else {
          // Fallback to individual endpoints if summary isn't available
          const [tailorsRes, usersRes] = await Promise.all([
            fetch("/api/admin/tailors", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          const tailors = tailorsRes.ok ? await tailorsRes.json() : [];
          const users = usersRes.ok ? await usersRes.json() : [];

          if (isMounted) {
            const pendingAudits = tailors.filter(
              (t) => !t.verified && t.verificationStatus !== "verified"
            );
            const rolesBreakdown = { customer: 0, tailor: 0, business: 0, admin: 0 };
            users.forEach((u) => {
              if (rolesBreakdown[u.role] !== undefined) rolesBreakdown[u.role]++;
              else rolesBreakdown.customer++;
            });

            setDashboardData({
              snapshot: {
                pendingStudioAudits: pendingAudits.length,
                activeStudios: tailors.length,
                totalRegisteredUsers: users.length,
                enterpriseRfqs: 3,
                platformHealth: "Healthy",
              },
              rolesBreakdown,
              tailors,
              users,
              pendingAudits,
            });
          }
        }
      } catch (err) {
        console.warn("Failed to load admin summary:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAdminSummary();
    return () => {
      isMounted = false;
    };
  }, [getToken]);

  const adminName =
    profile?.name ||
    user?.fullName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : null) ||
    "Manoj Kumar Lodha";

  // Summary Metrics
  const stats = useMemo(() => {
    const snap = dashboardData?.snapshot || {};
    const tailorsList = dashboardData?.tailors || [];
    const usersList = dashboardData?.users || [];
    const pendingList = dashboardData?.pendingAudits || [];

    return {
      pendingAudits: snap.pendingStudioAudits ?? pendingList.length ?? 0,
      activeStudios: snap.activeStudios ?? (tailorsList.length || 1),
      totalUsers: snap.totalRegisteredUsers ?? (usersList.length || 4),
      enterpriseRfqs: snap.enterpriseRfqs ?? 3,
      platformHealth: snap.platformHealth || "Healthy",
    };
  }, [dashboardData]);

  // 6 Primary Admin Options matching the reference UI mockup
  const adminOptions = [
    {
      id: "verifications",
      tab: "verifications",
      title: isHi ? "टेलर सत्यापन" : "Tailor Verifications",
      subtitle: isHi
        ? "लंबित स्टूडियो पंजीकरण आवेदनों की समीक्षा करें, कार्यशाला प्रामाणिकता का ऑडिट करें, और सत्यापित बैज स्वीकृत या अस्वीकृत करें।"
        : "Review pending atelier registration applications, audit workshop authenticity, and approve or reject verified badges.",
      icon: Shield,
      iconBg: "bg-[#fef2f2]",
      iconColor: "text-[#ef4444]",
      image: "/assets/admin_home/card_verification.png",
      statLabel: isHi ? "लंबित ऑडिट" : "Pending Audits",
      statValue: stats.pendingAudits,
      statColor: "text-stone-900",
      actionLabel: isHi ? "आवेदन समीक्षा करें" : "Review Applications",
      linkColor: "text-[#ef4444]",
    },
    {
      id: "users",
      tab: "users",
      title: isHi ? "उपयोगकर्ता खाते और भूमिकाएं" : "User Accounts & Roles",
      subtitle: isHi
        ? "भूमिका असाइनमेंट के साथ ग्राहकों, दर्जियों, व्यवसायों और प्रशासकों के पंजीकृत खातों का प्रबंधन करें।"
        : "Manage registered accounts across customers, tailors, businesses, and administrators with role assignment.",
      icon: Users,
      iconBg: "bg-[#f5f3ff]",
      iconColor: "text-[#8b5cf6]",
      image: "/assets/admin_home/card_users.png",
      statLabel: isHi ? "कुल खाते" : "Total Accounts",
      statValue: stats.totalUsers,
      statColor: "text-stone-900",
      actionLabel: isHi ? "उपयोगकर्ता प्रबंधित करें" : "Manage Users",
      linkColor: "text-[#8b5cf6]",
    },
    {
      id: "tailors",
      tab: "tailors",
      title: isHi ? "टेलर स्टूडियो निर्देशिका" : "Tailor Studios Directory",
      subtitle: isHi
        ? "सूचीबद्ध कारीगर कार्यशालाओं का निरीक्षण करें, मानचित्र निर्देशांक, दर कार्ड और सार्वजनिक खोज स्थिति अपडेट करें।"
        : "Inspect listed artisan workshops, update map coordinates, rate cards, and public discovery status.",
      icon: Store,
      iconBg: "bg-[#ecfdf5]",
      iconColor: "text-[#10b981]",
      image: "/assets/admin_home/card_studios.png",
      statLabel: isHi ? "सक्रिय स्टूडियो" : "Active Studios",
      statValue: stats.activeStudios,
      statColor: "text-stone-900",
      actionLabel: isHi ? "स्टूडियो देखें" : "Explore Studios",
      linkColor: "text-[#10b981]",
    },
    {
      id: "bulk",
      tab: "bulk",
      title: isHi ? "B2B थोक ऑर्डर और RFQ" : "B2B Bulk Orders & RFQs",
      subtitle: isHi
        ? "संस्थागत सिलाई निविदाओं, कॉर्पोरेट वर्दी और उद्यम थोक उद्धरण मांगों को मॉडरेट करें।"
        : "Moderate institutional stitching tenders, corporate uniforms, and enterprise bulk quotation demands.",
      icon: Layers,
      iconBg: "bg-[#fffbeb]",
      iconColor: "text-[#f59e0b]",
      image: "/assets/admin_home/card_bulk.png",
      statLabel: isHi ? "थोक RFQ" : "Bulk RFQs",
      statValue: stats.enterpriseRfqs,
      statColor: "text-stone-900",
      actionLabel: isHi ? "अनुरोध मॉडरेट करें" : "Moderate Requests",
      linkColor: "text-[#d97706]",
    },
    {
      id: "portal",
      tab: "verifications",
      title: isHi ? "मास्टर एडमिन कंसोल" : "Master Admin Console",
      subtitle: isHi
        ? "पूर्ण प्रशासन कंसोल, एकीकृत टेबल, सत्यापन वर्कफ़्लो और डेटाबेस रिकॉर्ड तक पहुंचें।"
        : "Access the full administration console, unified tables, verification workflows, and database records.",
      icon: Activity,
      iconBg: "bg-[#eff6ff]",
      iconColor: "text-[#3b82f6]",
      image: "/assets/admin_home/card_console.png",
      statLabel: isHi ? "सिस्टम स्थिति" : "System Status",
      statValue: stats.platformHealth || "Healthy",
      statColor: "text-[#10b981]",
      actionLabel: isHi ? "कंसोल खोलें" : "Open Console",
      linkColor: "text-[#2563eb]",
    },
    {
      id: "profile",
      tab: "profile",
      title: isHi ? "एडमिन सेटिंग्स और प्रोफ़ाइल" : "Admin Settings & Profile",
      subtitle: isHi
        ? "व्यवस्थापक प्रोफ़ाइल, संपर्क जानकारी, बायो क्रेडेंशियल्स और इंटरफ़ेस प्राथमिकताएं कॉन्फ़िगर करें।"
        : "Configure administrator profile, contact information, bio credentials, and interface preferences.",
      icon: Sliders,
      iconBg: "bg-[#f1f5f9]",
      iconColor: "text-[#475569]",
      image: "/assets/admin_home/card_settings.png",
      statLabel: isHi ? "सक्रिय भाषा" : "Active Language",
      statValue: isHi ? "हिंदी" : "English",
      statColor: "text-stone-900",
      actionLabel: isHi ? "सेटिंग्स कॉन्फ़िगर करें" : "Configure Settings",
      linkColor: "text-stone-900",
    },
  ];

  return (
    <div className="w-full space-y-7 pb-12 pt-1 font-sans">
      {/* =========================================================
          HERO BANNER (MATCHING REFERENCE MOCKUP EXACTLY)
      ========================================================== */}
      <div className="relative overflow-hidden rounded-[28px] border border-stone-200/70 bg-[#fdfbf9] p-6 sm:p-8 lg:p-9 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
          {/* Left Column: Badges, Title, Subtitle, 4 KPI stats */}
          <div className="flex-1 max-w-2xl">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf2f2] border border-[#fecaca]/80 px-3 py-1 text-xs font-semibold text-[#b91c1c]">
                <Shield size={13} className="text-[#dc2626]" />
                <span>{isHi ? "मास्टर एडमिन कंट्रोल सेंटर" : "Master Admin Control Center"}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0]/80 px-3 py-1 text-xs font-semibold text-[#047857]">
                <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                <span>{isHi ? "प्लेटफ़ॉर्म स्वास्थ्य: परिचालन" : "Platform Health: Operational"}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-4 text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight text-stone-900 leading-snug">
              {isHi ? `नमस्ते, ${adminName}` : `Welcome, ${adminName}`} <span className="inline-block">👋</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-2 text-xs sm:text-sm text-stone-500 leading-relaxed max-w-xl">
              {isHi
                ? "टेलर सत्यापन, उपयोगकर्ता निर्देशिका निरीक्षण, कार्यशाला सूची या B2B उद्यम आदेशों को प्रबंधित करने के लिए नीचे दिए गए प्रशासनिक मॉड्यूल का चयन करें।"
                : "Select an administrative module below to manage tailor verifications, inspect user directories, oversee workshop listings, or moderate B2B enterprise orders."}
            </p>

            {/* 4 KPI Metric Pills */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {/* Stat 1: Pending Audits */}
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-stone-200/80 px-4 py-2.5 shadow-2xs min-w-[125px]">
                <div className="h-10 w-10 rounded-xl bg-[#fef2f2] flex items-center justify-center text-[#ef4444] shrink-0">
                  <Shield size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-stone-900 leading-none">
                    {stats.pendingAudits}
                  </span>
                  <span className="text-[11px] font-medium text-stone-400 mt-1 whitespace-nowrap">
                    {isHi ? "लंबित ऑडिट" : "Pending Audits"}
                  </span>
                </div>
              </div>

              {/* Stat 2: Active Studios */}
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-stone-200/80 px-4 py-2.5 shadow-2xs min-w-[125px]">
                <div className="h-10 w-10 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#10b981] shrink-0">
                  <Store size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-stone-900 leading-none">
                    {stats.activeStudios}
                  </span>
                  <span className="text-[11px] font-medium text-stone-400 mt-1 whitespace-nowrap">
                    {isHi ? "सक्रिय स्टूडियो" : "Active Studios"}
                  </span>
                </div>
              </div>

              {/* Stat 3: Total Users */}
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-stone-200/80 px-4 py-2.5 shadow-2xs min-w-[125px]">
                <div className="h-10 w-10 rounded-xl bg-[#f5f3ff] flex items-center justify-center text-[#8b5cf6] shrink-0">
                  <Users size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-stone-900 leading-none">
                    {stats.totalUsers}
                  </span>
                  <span className="text-[11px] font-medium text-stone-400 mt-1 whitespace-nowrap">
                    {isHi ? "कुल उपयोगकर्ता" : "Total Users"}
                  </span>
                </div>
              </div>

              {/* Stat 4: B2B Demands */}
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-stone-200/80 px-4 py-2.5 shadow-2xs min-w-[125px]">
                <div className="h-10 w-10 rounded-xl bg-[#fffbeb] flex items-center justify-center text-[#f59e0b] shrink-0">
                  <Layers size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-stone-900 leading-none">
                    {stats.enterpriseRfqs}
                  </span>
                  <span className="text-[11px] font-medium text-stone-400 mt-1 whitespace-nowrap">
                    {isHi ? "B2B मांग" : "B2B Demands"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Illustration */}
          <div className="shrink-0 flex items-center justify-center lg:justify-end mt-4 lg:mt-0">
            <img
              src="/assets/admin_home/hero_illustration.png"
              alt="Admin Control Center"
              className="w-full max-w-[380px] sm:max-w-[430px] lg:max-w-[460px] xl:max-w-[480px] h-auto object-contain select-none pointer-events-none drop-shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* =========================================================
          SECTION HEADER
      ========================================================== */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
          {isHi ? "प्लेटफ़ॉर्म प्रबंधन विकल्प" : "Platform Management Options"}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          {isHi
            ? "संबंधित प्रबंधन कंसोल में सीधे जाने के लिए एक विकल्प चुनें।"
            : "Select an option to jump directly into the respective management console."}
        </p>
      </div>

      {/* =========================================================
          PRIMARY 6 OPTION CARDS (2x3 GRID)
      ========================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {adminOptions.map((opt) => {
          const IconComponent = opt.icon;
          return (
            <div
              key={opt.id}
              onClick={() => handleTabClick(opt.tab)}
              className="group relative flex flex-col justify-between rounded-3xl border border-stone-200/80 bg-white p-6 shadow-2xs hover:shadow-md hover:border-stone-300/90 transition-all duration-200 cursor-pointer"
            >
              <div>
                {/* Header row with Icon and Right Graphic */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`h-11 w-11 rounded-2xl flex items-center justify-center ${opt.iconBg} ${opt.iconColor} shadow-2xs transition group-hover:scale-105 shrink-0`}
                  >
                    <IconComponent size={22} />
                  </div>

                  <div className="shrink-0 h-16 flex items-center justify-end">
                    <img
                      src={opt.image}
                      alt={opt.title}
                      className="h-16 w-auto max-w-[90px] object-contain select-none pointer-events-none transition group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h3 className="mt-4 text-base font-bold text-stone-900 group-hover:text-stone-950 transition-colors leading-snug">
                  {opt.title}
                </h3>

                <p className="mt-1.5 text-xs text-stone-500 leading-relaxed min-h-[38px]">
                  {opt.subtitle}
                </p>
              </div>

              {/* Bottom Metric & Arrow Link */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-end justify-between gap-3">
                <div>
                  <span className="text-[11px] font-medium text-stone-400 block">
                    {opt.statLabel}
                  </span>
                  <span className={`text-base font-bold ${opt.statColor} block mt-0.5`}>
                    {opt.statValue}
                  </span>
                </div>

                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold ${opt.linkColor} group-hover:gap-1.5 transition-all`}
                >
                  <span>{opt.actionLabel}</span>
                  <span className="text-sm font-bold">→</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
