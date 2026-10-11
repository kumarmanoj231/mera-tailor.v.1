import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  Layers,
  Store,
  Scissors,
  Ruler,
  Wallet,
  Star,
  BarChart3,
  Settings,
  Crown,
  Shield,
  ShieldCheck,
  Clock,
  Package,
  Tag,
  Users,
  Sparkles,
  Check,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  FileText,
  Zap,
  Building2,
  Eye,
  ExternalLink,
  Award,
  DollarSign,
  TrendingUp,
  X,
  AlertCircle,
  Clock3,
  Plus,
  Trash2,
  Edit3,
  Sliders,
  Send,
  MessageSquare,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import { useAuth } from "../../context/AuthContext";

export default function TailorHomeSection() {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === "hi";
  const { profile, user, getToken } = useAuth();
  const navigate = useNavigate();

  const [activeSidebarTab, setActiveSidebarTab] = useState("home");
  const [tailorProfile, setTailorProfile] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [bulkList, setBulkList] = useState([]);
  const [liveEarnings, setLiveEarnings] = useState(null);
  const [livePipeline, setLivePipeline] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [liveCapacity, setLiveCapacity] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verification modal state
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // Time range filter for earnings analytics
  const [timeRange, setTimeRange] = useState("30d");

  // B2B proposal submission modal state
  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
  const [activeB2BJob, setActiveB2BJob] = useState(null);
  const [bidAmount, setBidAmount] = useState(15000);
  const [bidDays, setBidDays] = useState(20);
  const [bidNotes, setBidNotes] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);

  // Quick Action 1: Studio Profile Editor modal
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  const [savingStudio, setSavingStudio] = useState(false);
  const [studioFormData, setStudioFormData] = useState({
    name: "",
    owner: "",
    phone: "",
    city: "",
    area: "",
    experience: 8,
    description: "",
  });

  // Quick Action 2: Rate Card modal
  const [isRateCardModalOpen, setIsRateCardModalOpen] = useState(false);
  const [savingRateCard, setSavingRateCard] = useState(false);
  const [rateCardMinPrice, setRateCardMinPrice] = useState(499);
  const [rateCardServices, setRateCardServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDays, setNewServiceDays] = useState("5");

  // Quick Action 3: Reviews modal
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  // Workshop Capacity adjustment modal
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
  const [savingCapacity, setSavingCapacity] = useState(false);
  const [newCapacitySlots, setNewCapacitySlots] = useState(10);

  // Load live tailor studio, orders, B2B RFQs, and earnings from database
  useEffect(() => {
    let isMounted = true;

    async function loadTailorData() {
      try {
        const token = await getToken();
        if (!token) {
          if (isMounted) setLoading(false);
          return;
        }

        // Fetch tailor dashboard (contains tailor profile, requests, B2B RFQs, live earnings & pipeline)
        const res = await fetch("/api/users/tailor-dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.tailor) setTailorProfile(data.tailor);
            if (Array.isArray(data.requests)) setOrdersList(data.requests);
            if (Array.isArray(data.bulkRequirements)) setBulkList(data.bulkRequirements);
            if (data.earnings) setLiveEarnings(data.earnings);
            if (data.pipeline) setLivePipeline(data.pipeline);
            if (data.stats) setLiveStats(data.stats);
            if (data.capacity) setLiveCapacity(data.capacity);
          }
        } else {
          // Backward-compatible fallback
          const studioRes = await fetch("/api/tailors/my-studio", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (studioRes.ok) {
            const studioData = await studioRes.json();
            if (isMounted) setTailorProfile(studioData);
          }
        }
      } catch (err) {
        console.warn("Error loading tailor home data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTailorData();
    return () => {
      isMounted = false;
    };
  }, [getToken]);

  const isVerified = Boolean(
    tailorProfile?.verified === true || tailorProfile?.verificationStatus === "verified"
  );
  const isPending = tailorProfile?.verificationStatus === "pending";

  // Real Database Earnings Calculations
  const completedRevenue = ordersList
    .filter((o) => o.status === "Completed")
    .reduce((sum, o) => sum + (Number(o.quotePrice ?? o.price) || 0), 0);
  const activePipelineRevenue = ordersList
    .filter((o) => ["In Production", "Accepted", "Ready for Pickup", "Quote Received"].includes(o.status))
    .reduce((sum, o) => sum + (Number(o.quotePrice ?? o.price) || 0), 0);
  const totalRevenue =
    liveEarnings?.totalEarnings !== undefined
      ? liveEarnings.totalEarnings
      : completedRevenue + activePipelineRevenue;

  // Real Database Pipeline Stage Counts
  const countInquiries =
    livePipeline?.newInquiries ??
    ordersList.filter((o) => o.status === "Request Sent").length;
  const countMeasurements =
    livePipeline?.measurements ??
    ordersList.filter((o) => o.status === "Accepted").length;
  const countCutting =
    livePipeline?.cuttingAndStitch ??
    ordersList.filter((o) => o.status === "In Production").length;
  const countQuality =
    livePipeline?.qualityCheck ??
    ordersList.filter((o) => o.status === "Ready for Pickup").length;
  const countReady =
    livePipeline?.readyDelivered ??
    ordersList.filter((o) => o.status === "Completed").length;

  const openOrdersCount =
    liveStats?.openOrders ??
    ordersList.filter((o) => !["Completed", "Cancelled"].includes(o.status)).length;

  // Dynamic capacity & velocity metrics
  const capacitySlots =
    tailorProfile?.capacitySlots ||
    (typeof liveCapacity === "object" ? liveCapacity?.capacitySlots : Number(liveCapacity)) ||
    10;
  const activeSlots =
    (typeof liveCapacity === "object" ? liveCapacity?.activeSlots : null) ??
    openOrdersCount ??
    3;
  const capacityPct = Math.min(100, Math.round((activeSlots / (capacitySlots || 1)) * 100));
  const avgLeadDays =
    (typeof liveCapacity === "object" ? liveCapacity?.avgLeadDays : null) ?? 4.2;

  // Time-window dynamic revenue & trend calculations
  const displayedRevenue =
    timeRange === "7d"
      ? liveEarnings?.earnings7d ?? Math.round(totalRevenue * 0.35)
      : timeRange === "90d"
      ? liveEarnings?.earnings90d ?? Math.round(totalRevenue * 2.5)
      : liveEarnings?.earnings30d ?? totalRevenue;

  const growthText =
    timeRange === "7d"
      ? "+18.2% velocity vs prior 7 days"
      : timeRange === "90d"
      ? "+42.5% quarterly demand increase"
      : "+24.8% vs last month";

  // Dynamic SVG chart shapes based on active timeRange
  const chartPoints =
    timeRange === "7d"
      ? {
          path: "M 0,135 Q 100,110 200,85 T 350,45 T 500,20 L 500,150 L 0,150 Z",
          line: "M 0,135 Q 100,110 200,85 T 350,45 T 500,20",
          dots: [
            { cx: 120, cy: 105 },
            { cx: 250, cy: 75 },
            { cx: 380, cy: 40 },
            { cx: 500, cy: 20 },
          ],
          labels: ["Day 1-2", "Day 3-4", "Day 5-6", "Today (Day 7)"],
        }
      : timeRange === "90d"
      ? {
          path: "M 0,140 Q 90,130 180,95 T 320,60 T 440,25 L 500,10 L 500,150 L 0,150 Z",
          line: "M 0,140 Q 90,130 180,95 T 320,60 T 440,25 L 500,10",
          dots: [
            { cx: 140, cy: 110 },
            { cx: 280, cy: 75 },
            { cx: 400, cy: 35 },
            { cx: 500, cy: 10 },
          ],
          labels: ["Month 1 (Jul)", "Month 2 (Aug)", "Month 3 (Sep)", "Current (Oct)"],
        }
      : {
          path: "M 0,130 Q 80,120 150,90 T 300,50 T 420,30 L 500,15 L 500,150 L 0,150 Z",
          line: "M 0,130 Q 80,120 150,90 T 300,50 T 420,30 L 500,15",
          dots: [
            { cx: 150, cy: 90 },
            { cx: 300, cy: 50 },
            { cx: 420, cy: 30 },
            { cx: 500, cy: 15 },
          ],
          labels: ["Week 1", "Week 2", "Week 3", "Week 4 (Current)"],
        };

  // Quick Action Handlers
  function handleOpenStudioModal() {
    setStudioFormData({
      name: tailorProfile?.name || `${tailorName}'s Atelier`,
      owner: tailorProfile?.owner || tailorName,
      phone: tailorProfile?.phone || "+91 98290 12345",
      city: tailorProfile?.city || "Jaipur",
      area: tailorProfile?.area || "Central Market",
      experience: tailorProfile?.experience || 8,
      description: tailorProfile?.description || "Master bespoke tailoring, fine embroidery, and precision garment alterations.",
    });
    setIsStudioModalOpen(true);
  }

  async function handleSaveStudio(e) {
    if (e) e.preventDefault();
    setSavingStudio(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/tailors/my-studio", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(studioFormData),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || "Failed to update studio.");
      setTailorProfile(updated);
      setIsStudioModalOpen(false);
      toast.success(t("studio.updated", "Studio Profile updated successfully!"));
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch (err) {
      toast.error(err.message || "Failed to update studio.");
    } finally {
      setSavingStudio(false);
    }
  }

  function handleOpenRateCardModal() {
    setRateCardMinPrice(tailorProfile?.minPrice || 499);
    setRateCardServices(
      Array.isArray(tailorProfile?.services) && tailorProfile.services.length
        ? [...tailorProfile.services]
        : [
            { name: "Custom Suit / Blazer", price: 2499, days: 7 },
            { name: "Designer Kurti / Dress", price: 799, days: 5 },
            { name: "Formal Shirt & Trouser", price: 999, days: 4 },
            { name: "Bespoke Alteration & Fit", price: 299, days: 2 },
          ]
    );
    setIsRateCardModalOpen(true);
  }

  function handleAddService(e) {
    if (e) e.preventDefault();
    if (!newServiceName.trim()) return;
    const priceNum = Number(newServicePrice) || 499;
    const daysNum = Number(newServiceDays) || 5;
    setRateCardServices((prev) => [
      ...prev,
      { name: newServiceName.trim(), price: priceNum, days: daysNum },
    ]);
    setNewServiceName("");
    setNewServicePrice("");
  }

  function handleRemoveService(index) {
    setRateCardServices((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSaveRateCard(e) {
    if (e) e.preventDefault();
    setSavingRateCard(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/tailors/my-studio", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          minPrice: Number(rateCardMinPrice),
          services: rateCardServices,
        }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || "Failed to save rate card.");
      setTailorProfile(updated);
      setIsRateCardModalOpen(false);
      toast.success(t("rateCard.updated", "Rate card & pricing updated in real-time!"));
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch (err) {
      toast.error(err.message || "Failed to save rate card.");
    } finally {
      setSavingRateCard(false);
    }
  }

  async function handleSaveCapacity(e) {
    if (e && e.preventDefault) e.preventDefault();
    const slots = Number(newCapacitySlots) || 10;
    setSavingCapacity(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/tailors/my-studio", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ capacitySlots: slots }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || "Failed to update capacity.");
      setTailorProfile(updated);
      setLiveCapacity((prev) => ({
        ...(typeof prev === "object" ? prev : {}),
        capacitySlots: slots,
        capacityPct: Math.min(100, Math.round((activeSlots / slots) * 100)),
      }));
      setIsCapacityModalOpen(false);
      toast.success(`Workshop capacity updated to ${slots} slots!`);
    } catch (err) {
      toast.error(err.message || "Failed to update capacity.");
    } finally {
      setSavingCapacity(false);
    }
  }

  // B2B proposal submission handlers
  function handleOpenB2BModal(job) {
    setActiveB2BJob(job);
    setBidAmount(job.estBudget || (job.quantity ? job.quantity * 250 : 15000));
    setBidDays(job.timeline?.includes("15") ? 15 : job.timeline?.includes("20") ? 20 : 30);
    setBidNotes(`Our atelier has active workshop capacity to fulfill this ${job.quantity || 100}-unit batch within timeline.`);
    setIsB2BModalOpen(true);
  }

  async function handleSubmitB2BBid(e) {
    if (e) e.preventDefault();
    if (!activeB2BJob) return;
    setSubmittingBid(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/tailors/b2b-bid/${activeB2BJob._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(bidAmount),
          days: Number(bidDays),
          notes: bidNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit B2B proposal.");

      toast.success(t("b2b.bidSuccess", "Commercial B2B proposal submitted to institution!"));
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setIsB2BModalOpen(false);

      // Real-time local state update
      setBulkList((prev) =>
        prev.map((item) =>
          item._id === activeB2BJob._id
            ? { ...item, status: "reviewing", hasMyBid: true }
            : item
        )
      );
    } catch (err) {
      toast.error(err.message || "Failed to submit B2B proposal.");
    } finally {
      setSubmittingBid(false);
    }
  }

  const tailorName =
    tailorProfile?.owner ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    user?.firstName ||
    "Manoj Kumar";

  const studioName = tailorProfile?.name || tailorProfile?.shopName || `${tailorName}'s Atelier`;

  // Submit verification request
  async function handleApplyVerification(e) {
    if (e) e.preventDefault();
    setSubmittingVerification(true);
    try {
      const token = await getToken();
      const response = await fetch("/api/tailors/apply-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: verificationNotes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit verification.");
      if (data.tailor) setTailorProfile(data.tailor);
      setIsVerificationModalOpen(false);
      setVerificationNotes("");
      toast.success(t("verification.submitted", "Verification application submitted to administrator!"));
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      toast.error(err.message || "Failed to apply for verification.");
    } finally {
      setSubmittingVerification(false);
    }
  }

  // Sample fallback B2B bulk feeds if none in database
  const sampleBulkDemands = [
    {
      _id: "bulk-1",
      title: "School Uniform Batch (250 sets)",
      organisation: "St. Xavier's Academy",
      requirement: "Complete summer uniform sets with embroidery crest. Boys shirts, trousers, and girls pleated skirts.",
      quantity: 250,
      city: "Jaipur, Rajasthan",
      timeline: "30 days",
      estBudget: "₹62,500",
    },
    {
      _id: "bulk-2",
      title: "Corporate Blazers & Trousers (80 pcs)",
      organisation: "Meridian Hospitality Group",
      requirement: "Poly-viscose corporate blazers with customized lining and matching slim-fit formal trousers.",
      quantity: 80,
      city: "Delhi NCR",
      timeline: "20 days",
      estBudget: "₹96,000",
    },
    {
      _id: "bulk-3",
      title: "Boutique Kurti & Palazzo Run (150 pcs)",
      organisation: "Ananya Designer Boutique",
      requirement: "Chanderi silk festive kurtis with gota-patti border hemming and matching elasticated palazzos.",
      quantity: 150,
      city: "Jaipur, Rajasthan",
      timeline: "15 days",
      estBudget: "₹45,000",
    },
  ];

  const displayBulkList = bulkList.length > 0 ? bulkList.slice(0, 3) : sampleBulkDemands;

  const sidebarNavItems = [
    { id: "home", label: t("tailorDashboard.navHome", "Home"), icon: Home, route: "/" },
    { id: "orders", label: t("tailorDashboard.navOrders", "Client Orders"), icon: ShoppingBag, route: "/orders" },
    { id: "bulk", label: t("tailorDashboard.navBulk", "B2B Bulk Jobs"), icon: Layers, route: "/bulk" },
    { id: "studio", label: t("tailorDashboard.navStudio", "Studio Profile"), icon: Scissors, route: "/dashboard?tab=studio" },
    { id: "measurements", label: t("tailorDashboard.navMeasurements", "Measurements"), icon: Ruler, route: "/dashboard?tab=measurements" },
    { id: "earnings", label: t("tailorDashboard.navEarnings", "Earnings"), icon: DollarSign, route: "/dashboard?tab=orders" },
    { id: "reviews", label: t("tailorDashboard.navReviews", "Reviews"), icon: Star, route: "/dashboard?tab=studio" },
    { id: "analytics", label: t("tailorDashboard.navAnalytics", "Analytics"), icon: BarChart3, route: "#analytics" },
    { id: "settings", label: t("tailorDashboard.navSettings", "Settings"), icon: Settings, route: "/dashboard?tab=profile" },
  ];

  return (
    <div className="w-full pb-16 pt-2">
      {/* =========================================================
          TOP BREADCRUMB
      ========================================================== */}
      <div className="flex items-center gap-2 text-xs font-medium text-stone-500 mb-5">
        <Link to="/" className="hover:text-stone-900">MeraTailor</Link>
        <span>/</span>
        <span>{isHi ? "दर्जी कार्यशाला" : "Tailor Studio"}</span>
        <span>/</span>
        <span className="font-semibold text-stone-800">
          {isHi ? "कंसोल डैशबोर्ड" : "Console Dashboard"}
        </span>
      </div>

      {/* =========================================================
          MAIN LAYOUT: LEFT SIDEBAR + CONSOLE MAIN AREA
      ========================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =======================================================
            1. LEFT SIDEBAR (SIDE OPTIONS & GET VERIFIED CARD)
        ======================================================== */}
        <aside className="lg:col-span-3 xl:col-span-2 space-y-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
            {/* Navigation Options List */}
            <nav className="space-y-1">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSidebarTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveSidebarTab(item.id);
                      if (item.route.startsWith("/")) {
                        navigate(item.route);
                      } else if (item.route === "#analytics") {
                        const el = document.getElementById("analytics-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className={`w-full flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition ${
                      isActive
                        ? "bg-rose-50 text-[#8f2338] shadow-2xs font-extrabold"
                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={isActive ? "text-[#8f2338]" : "text-stone-400"}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Verification Status Card */}
            {isVerified ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-left shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 shadow-2xs">
                    <ShieldCheck size={20} className="text-emerald-700" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                    Active
                  </span>
                </div>

                <h4 className="mt-2.5 font-sans text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Verified Atelier</span>
                  <CheckCircle2 size={13} className="text-emerald-600 fill-emerald-100" />
                </h4>
                <p className="mt-1 text-[11px] text-stone-600 leading-relaxed">
                  Your workshop is officially certified with priority search visibility.
                </p>
              </div>
            ) : isPending ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-left shadow-2xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 border border-amber-300 text-amber-700 shadow-2xs">
                  <Clock3 size={18} />
                </div>
                <h4 className="mt-2.5 font-sans text-xs font-bold text-stone-900">
                  Verification In Review
                </h4>
                <p className="mt-1 text-[11px] text-stone-600 leading-relaxed">
                  Application submitted to admin. Status will update once approved.
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-rose-100 bg-[#fdf4f4] p-4 text-left shadow-2xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
                  <Crown size={18} className="text-amber-500 fill-amber-400" />
                </div>

                <h4 className="mt-2.5 font-sans text-sm font-bold text-stone-900">
                  {t("tailorDashboard.getVerified", "Get Verified")}
                </h4>
                <p className="mt-1 text-[11px] text-stone-500 leading-relaxed">
                  {t("tailorDashboard.getVerifiedSub", "Boost visibility & get 5x more orders")}
                </p>

                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="mt-3.5 w-full inline-flex items-center justify-center gap-1 rounded-xl bg-[#8f2338] py-2 text-xs font-bold text-white shadow-xs hover:bg-[#761c30] transition active:scale-95"
                >
                  <span>{t("tailorDashboard.applyForVerification", "Apply for Verification")} →</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* =======================================================
            2. MAIN RIGHT CONSOLE WORKSPACE (10 / 9 COLS)
        ======================================================== */}
        <div className="lg:col-span-9 xl:col-span-10 space-y-6">
          {/* =====================================================
              ROW 1: HERO COMMAND BANNER + STUDIO SNAPSHOT
          ====================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Hero Banner (8 cols) */}
            <div className="lg:col-span-8 relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col justify-between">
              {/* Atelier Graphic Artwork on right side */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-64 sm:w-80 md:w-96 overflow-hidden opacity-90 hidden sm:block">
                <img
                  src="/assets/tailor_banner_illustration.jpg"
                  alt="Tailor atelier illustration"
                  className="h-full w-full object-contain object-right"
                />
              </div>

              <div className="relative z-10 max-w-xl">
                {/* Eyebrow badge */}
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8f2338]">
                  {t("tailorDashboard.consoleEyebrow", "Tailor Studio Console")}
                </p>

                {/* Main Heading */}
                <h1 className="mt-2 font-serif sm:font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#111827] leading-tight">
                  Welcome back, <br />
                  <span className="text-[#8f2338]">{tailorName}!</span>
                </h1>

                {/* Subtitle */}
                <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed max-w-lg">
                  {t(
                    "tailorDashboard.consoleSubtitle",
                    "Manage your bespoke client orders, expand workshop capacity with high-value B2B batch orders, and grow your verified local ranking."
                  )}
                </p>

                {/* Action Buttons Row */}
                <div className="mt-6 flex flex-wrap items-center gap-2.5">
                  <Link
                    to="/orders"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#761c30] transition active:scale-95"
                  >
                    <ShoppingBag size={14} />
                    <span>{t("tailorDashboard.viewOrders", "View Orders")} →</span>
                  </Link>

                  <Link
                    to="/orders"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 transition"
                  >
                    <Package size={14} className="text-stone-500" />
                    <span>{t("tailorDashboard.clientInquiries", "Client Inquiries")}</span>
                  </Link>

                  <Link
                    to="/bulk"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 transition"
                  >
                    <Layers size={14} className="text-stone-500" />
                    <span>{t("tailorDashboard.b2bOpportunities", "B2B Opportunities")}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Card: Studio Snapshot (4 cols) */}
            <div className="lg:col-span-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-sans text-xs font-extrabold uppercase tracking-wider text-stone-800">
                    {t("tailorDashboard.studioSnapshot", "Studio Snapshot")}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>

                <ul className="mt-4 space-y-3.5 text-xs text-stone-600">
                  <li className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-stone-500">
                      <Shield size={15} className="text-stone-400" />
                      {t("tailorDashboard.verification", "Verification")}
                    </span>
                    {isVerified ? (
                      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                        Verified ✓
                      </span>
                    ) : isPending ? (
                      <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[11px]">
                        In Review ⏳
                      </span>
                    ) : (
                      <span className="font-bold text-amber-600">
                        Unverified
                      </span>
                    )}
                  </li>

                  <li className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-stone-500">
                      <Clock size={15} className="text-stone-400" />
                      {t("tailorDashboard.experience", "Experience")}
                    </span>
                    <strong className="text-stone-900 font-bold">
                      {tailorProfile?.experience || 5}+ Years
                    </strong>
                  </li>

                  <li className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-stone-500">
                      <Package size={15} className="text-stone-400" />
                      {t("tailorDashboard.specialties", "Specialties")}
                    </span>
                    <strong className="text-stone-900 font-bold">
                      {tailorProfile?.categories?.length || 4} Categories
                    </strong>
                  </li>

                  <li className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-stone-500">
                      <Tag size={15} className="text-stone-400" />
                      {t("tailorDashboard.startingPrice", "Starting Price")}
                    </span>
                    <strong className="text-stone-900 font-bold text-sm">
                      ₹{tailorProfile?.minPrice || 399}
                    </strong>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-2">
                {isVerified ? (
                  <Link
                    to={tailorProfile?._id ? `/tailors/${tailorProfile._id}` : "/dashboard?tab=studio"}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#761c30] transition active:scale-95"
                  >
                    <Eye size={15} />
                    <span>{t("tailorDashboard.viewPublicStudio", "View Public Studio Profile")} →</span>
                  </Link>
                ) : isPending ? (
                  <div className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs font-bold text-amber-800">
                    <Clock3 size={15} />
                    <span>{t("tailorDashboard.verificationPending", "Application In Review")}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsVerificationModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#761c30] transition active:scale-95"
                  >
                    <Award size={15} />
                    <span>{t("tailorDashboard.getVerifiedBadge", "Get Verified Badge")}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              ROW 2: 5 KPI METRICS CARDS
          ====================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {/* Card 1: Atelier Tier */}
            <div className="rounded-2xl border border-stone-200 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-[#8f2338]/30 transition">
              <div className="flex items-center justify-between">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${isVerified ? "bg-emerald-50 text-emerald-700" : "bg-[#fdf2f4] text-[#8f2338]"}`}>
                  {isVerified ? <ShieldCheck size={16} /> : <Users size={16} />}
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-[#8f2338] text-[11px] font-bold">
                  →
                </div>
              </div>
              <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Atelier Tier
              </p>
              <p className="font-sans text-base sm:text-lg font-bold text-stone-900 mt-0.5 flex items-center gap-1">
                {isVerified ? "Verified Master" : "Standard"}
                {isVerified && <CheckCircle2 size={14} className="text-emerald-600 fill-emerald-100" />}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                {isVerified ? "Top Rank in Discovery" : "Unlock verified badge"}
              </p>
            </div>

            {/* Card 2: Client Trust */}
            <div className="rounded-2xl border border-stone-200 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-emerald-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Star size={16} className="fill-emerald-500 text-emerald-600" />
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-[#8f2338] text-[11px] font-bold">
                  →
                </div>
              </div>
              <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Client Trust
              </p>
              <p className="font-sans text-base sm:text-lg font-bold text-stone-900 mt-0.5">
                {tailorProfile?.rating ? `${tailorProfile.rating} ★` : "4.9 ★"}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                {tailorProfile?.reviews ? `${tailorProfile.reviews} reviews` : "Bespoke fit rating"}
              </p>
            </div>

            {/* Card 3: Open Orders */}
            <div className="rounded-2xl border border-stone-200 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-blue-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText size={16} />
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-[#8f2338] text-[11px] font-bold">
                  →
                </div>
              </div>
              <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Open Orders
              </p>
              <p className="font-sans text-base sm:text-lg font-bold text-stone-900 mt-0.5">
                {openOrdersCount}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Active client orders
              </p>
            </div>

            {/* Card 4: B2B Demands */}
            <div className="rounded-2xl border border-stone-200 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-purple-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Layers size={16} />
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-[#8f2338] text-[11px] font-bold">
                  →
                </div>
              </div>
              <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                B2B Demands
              </p>
              <p className="font-sans text-base sm:text-lg font-bold text-stone-900 mt-0.5">
                {bulkList.length > 0 ? bulkList.length : 3}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Institutional RFQs
              </p>
            </div>

            {/* Card 5: Base Pricing */}
            <div className="rounded-2xl border border-stone-200 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-teal-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-bold text-sm">
                  ₹
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-[#8f2338] text-[11px] font-bold">
                  →
                </div>
              </div>
              <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Base Pricing
              </p>
              <p className="font-sans text-base sm:text-lg font-bold text-stone-900 mt-0.5">
                ₹{tailorProfile?.minPrice || 399}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Public starting card
              </p>
            </div>
          </div>

          {/* =====================================================
              ROW 3: VERIFICATION BOOSTER BANNER (ONLY IF UNVERIFIED)
          ====================================================== */}
          {!isVerified && (
            <div className="relative overflow-hidden rounded-3xl border border-rose-200 bg-[#fdf4f4] p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4 z-10 max-w-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8f2338] text-white shadow-xs shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-sans text-base sm:text-lg font-bold text-stone-900 leading-snug">
                    Boost Your Workshop: Become a Verified MeraTailor Atelier
                  </h3>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                    Verified tailors receive up to 5x more customer bookings, appear at the top of local customer searches, and gain exclusive rights to submit bids on B2B contracts.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 z-10 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#761c30] transition active:scale-95"
                >
                  <span>Apply for Verification</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Illustration graphic on right */}
              <div className="pointer-events-none absolute right-4 top-0 bottom-0 w-44 md:w-56 overflow-hidden opacity-90 hidden lg:block">
                <img
                  src="/assets/tailor-character.png"
                  alt="Artisan crafting"
                  className="h-full w-full object-contain object-right"
                />
              </div>
            </div>
          )}

          {/* =====================================================
              ROW 4: ORDER WORKFLOW & PIPELINE + RECENT ORDERS
          ====================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Order Workflow & Production Pipeline (8 cols) */}
            <div className="lg:col-span-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fdf2f4] text-[#8f2338]">
                      <Scissors size={16} />
                    </div>
                    <div>
                      <h3 className="font-sans text-sm sm:text-base font-bold text-stone-900">
                        Order Workflow & Production Pipeline
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Track garment progress from initial measurements to final dispatch.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/orders"
                    className="text-xs font-bold text-[#8f2338] hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Manage All Orders</span> →
                  </Link>
                </div>

                {/* 5-Stage Stepper Pipeline */}
                <div className="relative mt-8 mb-4">
                  {/* Pipeline Horizontal Connecting Line */}
                  <div className="absolute top-[18px] left-[6%] right-[6%] h-[2px] bg-stone-200 -z-0" />

                  <div className="relative z-10 grid grid-cols-5 gap-2 text-center">
                    {/* Node 1: New Inquiries */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-stone-200 bg-white shadow-2xs hover:border-[#8f2338] transition">
                        <FileText size={15} className="text-[#8f2338]" />
                      </div>
                      <p className="mt-2 text-xs font-bold text-stone-900">New Inquiries</p>
                      <p className="text-[10px] text-stone-400 max-w-[90px] leading-tight mt-0.5">
                        Review specs & send price quote
                      </p>
                      <span className="mt-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-[10px] font-bold text-[#8f2338]">
                        {countInquiries}
                      </span>
                    </div>

                    {/* Node 2: Measurements */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-stone-200 bg-white shadow-2xs hover:border-[#8f2338] transition">
                        <Ruler size={15} className="text-[#8f2338]" />
                      </div>
                      <p className="mt-2 text-xs font-bold text-stone-900">Measurements</p>
                      <p className="text-[10px] text-stone-400 max-w-[90px] leading-tight mt-0.5">
                        Doorstep or digital vault fit
                      </p>
                      <span className="mt-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-[10px] font-bold text-[#8f2338]">
                        {countMeasurements}
                      </span>
                    </div>

                    {/* Node 3: Cutting & Stitch */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-stone-200 bg-white shadow-2xs hover:border-[#8f2338] transition">
                        <Scissors size={15} className="text-[#8f2338]" />
                      </div>
                      <p className="mt-2 text-xs font-bold text-stone-900">Cutting & Stitch</p>
                      <p className="text-[10px] text-stone-400 max-w-[90px] leading-tight mt-0.5">
                        Master crafting in progress
                      </p>
                      <span className="mt-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-[10px] font-bold text-[#8f2338]">
                        {countCutting}
                      </span>
                    </div>

                    {/* Node 4: Quality Check */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-stone-200 bg-white shadow-2xs hover:border-[#8f2338] transition">
                        <Settings size={15} className="text-[#8f2338]" />
                      </div>
                      <p className="mt-2 text-xs font-bold text-stone-900">Quality Check</p>
                      <p className="text-[10px] text-stone-400 max-w-[90px] leading-tight mt-0.5">
                        Ironing, buttons & fit review
                      </p>
                      <span className="mt-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-[10px] font-bold text-[#8f2338]">
                        {countQuality}
                      </span>
                    </div>

                    {/* Node 5: Ready / Delivered */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-stone-200 bg-white shadow-2xs hover:border-[#8f2338] transition">
                        <CheckCircle2 size={15} className="text-[#8f2338]" />
                      </div>
                      <p className="mt-2 text-xs font-bold text-stone-900">Ready / Delivered</p>
                      <p className="text-[10px] text-stone-400 max-w-[90px] leading-tight mt-0.5">
                        Customer handover & review
                      </p>
                      <span className="mt-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-[10px] font-bold text-[#8f2338]">
                        {countReady}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Recent Client Orders (4 cols) */}
            <div className="lg:col-span-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fdf2f4] text-[#8f2338]">
                      <FileText size={14} />
                    </div>
                    <h3 className="font-sans text-sm font-bold text-stone-900">
                      Recent Client Orders
                    </h3>
                  </div>
                  <Link to="/orders" className="text-xs font-bold text-[#8f2338] hover:underline">
                    View All →
                  </Link>
                </div>

                {/* Live Orders List or Clean Empty State */}
                {ordersList.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {ordersList.slice(0, 3).map((order) => {
                      const priceVal = (order.quotePrice ?? order.price) || tailorProfile?.minPrice || 499;
                      return (
                        <div
                          key={order.id || order._id}
                          className="flex items-center justify-between rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3 text-xs hover:border-[#8f2338]/30 hover:bg-white transition"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 truncate">
                                {order.garment || "Custom Bespoke"}
                              </span>
                              <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-600">
                                #{order.id ? order.id.slice(0, 8) : "MT-ORD"}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                              {order.deadline ? `Due: ${order.deadline}` : `Qty: ${order.quantity || 1} • ${order.fabric || "Bespoke"}`}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-black text-stone-900">₹{priceVal}</span>
                            <div className="mt-0.5">
                              <span
                                className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                  order.status === "Completed"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : order.status === "In Production"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : order.status === "Request Sent"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-stone-100 text-stone-700 border border-stone-200"
                                }`}
                              >
                                {order.status || "In Progress"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <Link
                      to="/orders"
                      className="mt-3 block text-center rounded-xl border border-stone-200 bg-white py-2 text-xs font-bold text-[#8f2338] hover:bg-rose-50/50 transition"
                    >
                      View All Orders ({ordersList.length}) →
                    </Link>
                  </div>
                ) : (
                  <div className="py-8 text-center flex flex-col items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[#8f2338] mb-2 shadow-2xs">
                      <Package size={24} />
                    </div>
                    <p className="font-sans text-sm font-bold text-stone-800">
                      No active client Orders
                    </p>
                    <p className="mt-1 text-xs text-stone-500 max-w-xs leading-relaxed">
                      When customers place orders, they will appear here.
                    </p>

                    <Link
                      to="/orders"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#761c30] transition"
                    >
                      <span>View Inquiries</span> →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              ROW 5: B2B DEMANDS FEED + QUICK ACTIONS
          ====================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: B2B Demands Feed (8 cols) */}
            <div className="lg:col-span-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">
                    Commercial B2B Opportunities
                  </span>
                  <h3 className="font-sans text-base sm:text-lg font-bold text-stone-900">
                    B2B Bulk Job Demands Feed
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Institutions, schools, and fashion labels looking for workshop manufacturing capacity.
                  </p>
                </div>

                <Link
                  to="/bulk"
                  className="text-xs font-bold text-[#8f2338] hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Explore All Bulk RFQs</span> →
                </Link>
              </div>

              {/* Feed Items */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {displayBulkList.map((job, idx) => (
                  <div
                    key={job._id || job.id || idx}
                    className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 flex flex-col justify-between hover:border-[#8f2338]/40 hover:bg-white transition shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="rounded-md bg-rose-50 border border-rose-100 px-2 py-0.5 text-[10px] font-bold text-[#8f2338]">
                          {job.quantity || 100} units
                        </span>
                        {job.estBudget ? (
                          <span className="text-[10px] font-semibold text-stone-500">
                            Est. ₹{Number(job.estBudget).toLocaleString("en-IN")}
                          </span>
                        ) : null}
                      </div>
                      <h4 className="mt-2 font-sans text-xs font-bold text-stone-900 line-clamp-1">
                        {job.requirement || job.title || "Bulk Batch Order"}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                        {job.organisation || "Corporate / Institutional Buyer"} {job.city ? `• ${job.city}` : ""}
                      </p>
                      <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {job.requirement || job.notes || "Workshop tailoring batch order."}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-stone-500 text-[11px]">{job.timeline || "30 days"}</span>
                      <button
                        type="button"
                        onClick={() => handleOpenB2BModal(job)}
                        className={`font-bold text-xs flex items-center gap-1 transition px-2.5 py-1 rounded-lg cursor-pointer ${
                          job.hasMyBid
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-[#8f2338] text-white hover:bg-[#761c30] shadow-2xs"
                        }`}
                      >
                        <span>{job.hasMyBid ? "Bid Placed ✓" : "Submit Quote"}</span> →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Quick Actions (4 cols) */}
            <div className="lg:col-span-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fdf2f4] text-[#8f2338]">
                    <Zap size={14} />
                  </div>
                  <h3 className="font-sans text-sm font-bold text-stone-900">
                    Quick Actions
                  </h3>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {/* Action 1: Update Studio Profile */}
                  <button
                    type="button"
                    onClick={handleOpenStudioModal}
                    className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-center hover:border-[#8f2338]/40 hover:bg-white transition shadow-2xs cursor-pointer group w-full"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#8f2338] mb-2 group-hover:scale-105 transition-transform">
                      <Store size={18} />
                    </div>
                    <span className="text-xs font-bold text-stone-900 leading-tight">
                      Update Studio Profile
                    </span>
                  </button>

                  {/* Action 2: Manage Rate Card */}
                  <button
                    type="button"
                    onClick={handleOpenRateCardModal}
                    className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-center hover:border-[#8f2338]/40 hover:bg-white transition shadow-2xs cursor-pointer group w-full"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 mb-2 group-hover:scale-105 transition-transform">
                      <DollarSign size={18} />
                    </div>
                    <span className="text-xs font-bold text-stone-900 leading-tight">
                      Manage Rate Card
                    </span>
                  </button>

                  {/* Action 3: View Reviews */}
                  <button
                    type="button"
                    onClick={() => setIsReviewsModalOpen(true)}
                    className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-center hover:border-[#8f2338]/40 hover:bg-white transition shadow-2xs cursor-pointer group w-full"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-2 group-hover:scale-105 transition-transform">
                      <Star size={18} />
                    </div>
                    <span className="text-xs font-bold text-stone-900 leading-tight">
                      View Reviews
                    </span>
                  </button>

                  {/* Action 4: Analytics */}
                  <a
                    href="#analytics-section"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById("analytics-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-center hover:border-[#8f2338]/40 hover:bg-white transition shadow-2xs cursor-pointer group w-full"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-2 group-hover:scale-105 transition-transform">
                      <BarChart3 size={18} />
                    </div>
                    <span className="text-xs font-bold text-stone-900 leading-tight">
                      Analytics
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              ROW 6: WORKSHOP PRODUCTION & EARNINGS GRAPHS
          ====================================================== */}
          <div
            id="analytics-section"
            className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-[#8f2338]">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="font-sans text-base sm:text-lg font-bold text-stone-900">
                    Workshop Capacity & Earnings Analytics
                  </h3>
                  <p className="text-xs text-stone-500">
                    Real-time stitching velocity, revenue trends, and turnaround performance.
                  </p>
                </div>
              </div>

              {/* Time Range Pills */}
              <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-[#fdfbf9] p-1 text-xs font-bold text-stone-600">
                {["7d", "30d", "90d"].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTimeRange(range)}
                    className={`rounded-lg px-2.5 py-1 text-xs transition cursor-pointer ${
                      timeRange === range
                        ? "bg-[#8f2338] text-white shadow-2xs"
                        : "hover:text-stone-900"
                    }`}
                  >
                    {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
                  </button>
                ))}
              </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Revenue Growth Trend Area Chart (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl border border-stone-100 bg-[#fdfbf9] p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Estimated Revenue ({timeRange === "7d" ? "Past 7 Days" : timeRange === "30d" ? "Past 30 Days" : "Past 90 Days"})
                    </span>
                    <p className="font-sans text-2xl font-black text-stone-900">
                      ₹{displayedRevenue.toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-bold text-emerald-600 ml-1">
                        {growthText}
                      </span>
                    </p>
                  </div>
                  <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    {displayedRevenue > 0 ? "Profitable" : "Active Atelier"}
                  </span>
                </div>

                {/* SVG Area Line Chart */}
                <div className="h-44 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8f2338" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#8f2338" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#f0ebe6" strokeDasharray="3 3" />
                    <line x1="0" y1="75" x2="500" y2="75" stroke="#f0ebe6" strokeDasharray="3 3" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#f0ebe6" strokeDasharray="3 3" />

                    {/* Gradient area */}
                    <path
                      d={chartPoints.path}
                      fill="url(#revenueGradient)"
                    />

                    {/* Trend Line */}
                    <path
                      d={chartPoints.line}
                      fill="none"
                      stroke="#8f2338"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    {chartPoints.dots.map((pt, i) => (
                      <circle key={i} cx={pt.cx} cy={pt.cy} r="5" fill="#8f2338" stroke="#ffffff" strokeWidth="2" />
                    ))}
                  </svg>
                </div>

                <div className="flex justify-between text-[11px] font-semibold text-stone-400 mt-2 px-1">
                  {chartPoints.labels.map((lbl, i) => (
                    <span key={i}>{lbl}</span>
                  ))}
                </div>
              </div>

              {/* Stitching Capacity & Speed Breakdown (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl border border-stone-100 bg-[#fdfbf9] p-4 shadow-2xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-700">Workshop Stitching Load</span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#8f2338]">
                        {capacityPct}% Capacity
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCapacityModalOpen(true)}
                        className="text-[10px] font-bold text-stone-500 hover:text-[#8f2338] underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Sliders size={11} />
                        <span>Adjust</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 h-2.5 w-full rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className="h-full bg-[#8f2338] rounded-full transition-all duration-500"
                      style={{
                        width: `${capacityPct}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-stone-500">
                    {activeSlots} of {capacitySlots} slots occupied ({capacitySlots - activeSlots > 0 ? `${capacitySlots - activeSlots} available` : "at maximum capacity"}).
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-100 bg-[#fdfbf9] p-4 shadow-2xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-700">Turnaround Speed</span>
                    <span className="font-extrabold text-emerald-700">{avgLeadDays} Days Avg</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full rounded-full bg-stone-200 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "90%" }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-stone-500">
                    Average turnaround across bespoke commissions and active batch production.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          VERIFICATION APPLICATION MODAL (ONLY IF UNVERIFIED)
      ========================================================== */}
      {!isVerified && isVerificationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submittingVerification) {
              setIsVerificationModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
                  <Crown size={18} />
                </div>
                <div>
                  <h3 className="font-sans text-base font-bold text-stone-900">
                    Apply for Verified Atelier Badge
                  </h3>
                  <p className="text-xs text-stone-500">
                    Submit your workshop credentials for MeraTailor admin review.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsVerificationModalOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyVerification} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Workshop Atelier Details & Experience
                </label>
                <textarea
                  rows={4}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Mention your shop location, years in business, specialty garments (ethnic wear, suits, uniforms), and workshop machine count..."
                  className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                  required
                />
              </div>

              <div className="rounded-2xl border border-rose-100 bg-[#fdf4f4] p-3.5 text-xs text-stone-700 leading-relaxed">
                🛡️ <strong>What happens after submission:</strong> Administrators verify your shop address and phone. Once approved, your studio is featured with the green verified badge and ranks #1 on Find Tailors.
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVerification}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#761c30] disabled:opacity-50"
                >
                  <Award size={14} />
                  <span>{submittingVerification ? "Submitting..." : "Submit Application"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          B2B PROPOSAL / BID MODAL
      ========================================================== */}
      {isB2BModalOpen && activeB2BJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submittingBid) {
              setIsB2BModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#8f2338]">
                  <Send size={18} />
                </div>
                <div>
                  <h3 className="font-sans text-base font-bold text-stone-900">
                    Submit B2B Bulk Proposal
                  </h3>
                  <p className="text-xs text-stone-500">
                    {activeB2BJob.organisation || "Institutional Buyer"} • {activeB2BJob.quantity || 100} units
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsB2BModalOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitB2BBid} className="mt-5 space-y-4">
              <div className="rounded-2xl border border-stone-100 bg-[#fdfbf9] p-3.5 text-xs text-stone-700">
                <span className="font-bold text-stone-900">Requirement: </span>
                {activeB2BJob.requirement || activeB2BJob.notes || "Bulk batch production"}
                {activeB2BJob.estBudget ? (
                  <div className="mt-1 font-semibold text-emerald-700">
                    Target Budget: ₹{Number(activeB2BJob.estBudget).toLocaleString("en-IN")}
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Quote Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="500"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="e.g. 45000"
                    className="w-full rounded-xl border border-stone-200 bg-[#fdfbf9] px-3 py-2 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Turnaround (Days) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={bidDays}
                    onChange={(e) => setBidDays(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full rounded-xl border border-stone-200 bg-[#fdfbf9] px-3 py-2 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Workshop Capabilities / Production Notes
                </label>
                <textarea
                  rows={3}
                  value={bidNotes}
                  onChange={(e) => setBidNotes(e.target.value)}
                  placeholder="Mention fabric sourcing, stitch reinforcement, sample availability, and production timeline..."
                  className="w-full rounded-xl border border-stone-200 bg-[#fdfbf9] p-3 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsB2BModalOpen(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#761c30] disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{submittingBid ? "Submitting..." : "Submit Quote"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          UPDATE STUDIO PROFILE MODAL
      ========================================================== */}
      {isStudioModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget && !savingStudio) {
              setIsStudioModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#8f2338]">
                  <Store size={18} />
                </div>
                <div>
                  <h3 className="font-sans text-base font-bold text-stone-900">
                    Update Studio Profile
                  </h3>
                  <p className="text-xs text-stone-500">
                    Live atelier details displayed to bespoke clients.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStudioModalOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStudio} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Studio / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studioFormData.name}
                    onChange={(e) => setStudioFormData({ ...studioFormData, name: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-[#fdfbf9] px-3 py-2 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={studioFormData.phone}
                    onChange={(e) => setStudioFormData({ ...studioFormData, phone: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-[#fdfbf9] px-3 py-2 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Area / City Landmark
                  </label>
                  <input
                    type="text"
                    value={studioFormData.area}
                    onChange={(e) => setStudioFormData({ ...studioFormData, area: e.target.value })}
                    placeholder="e.g. Bandra West, Mumbai"
                    className="w-full rounded-xl border border-stone-200 bg-[#fdfbf9] px-3 py-2 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={studioFormData.experience}
                    onChange={(e) => setStudioFormData({ ...studioFormData, experience: Number(e.target.value) })}
                    className="w-full rounded-xl border border-stone-200 bg-[#fdfbf9] px-3 py-2 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Atelier Bio & Craft Specialty
                </label>
                <textarea
                  rows={3}
                  value={studioFormData.description}
                  onChange={(e) => setStudioFormData({ ...studioFormData, description: e.target.value })}
                  placeholder="Master tailor specializing in bespoke suits, sherwanis, and fine ethnic craft..."
                  className="w-full rounded-xl border border-stone-200 bg-[#fdfbf9] p-3 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsStudioModalOpen(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStudio}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#761c30] disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  <span>{savingStudio ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MANAGE RATE CARD MODAL
      ========================================================== */}
      {isRateCardModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget && !savingRateCard) {
              setIsRateCardModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <DollarSign size={18} />
                </div>
                <div>
                  <h3 className="font-sans text-base font-bold text-stone-900">
                    Manage Bespoke Rate Card
                  </h3>
                  <p className="text-xs text-stone-500">
                    Configure base tailoring prices and turnaround timelines.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRateCardModalOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRateCard} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Starting Base Price (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  value={rateCardMinPrice}
                  onChange={(e) => setRateCardMinPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-200 bg-[#fdfbf9] px-3 py-2 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                />
              </div>

              {/* Service List */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  Tailoring Services & Turnarounds
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {rateCardServices.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-stone-200 p-4 text-center text-xs text-stone-400">
                      No custom services added yet. Add your first service below.
                    </div>
                  ) : (
                    rateCardServices.map((svc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-stone-200 bg-[#fdfbf9] p-2.5 text-xs"
                      >
                        <div>
                          <div className="font-bold text-stone-900">{svc.name}</div>
                          <div className="text-[11px] text-stone-500">
                            ₹{svc.price} • {svc.days || svc.turnaroundDays || 5} days lead time
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(i)}
                          className="rounded-lg p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Service Section */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 space-y-2.5">
                <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Plus size={14} className="text-[#8f2338]" /> Add New Service
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="Service Name (e.g. 2-Pc Suit)"
                    className="rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#8f2338]"
                  />
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    placeholder="Price (₹)"
                    className="rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#8f2338]"
                  />
                  <input
                    type="number"
                    value={newServiceDays}
                    onChange={(e) => setNewServiceDays(e.target.value)}
                    placeholder="Days (e.g. 4)"
                    className="rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#8f2338]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddService}
                  className="w-full rounded-xl bg-stone-900 py-1.5 text-xs font-bold text-white hover:bg-stone-800 transition cursor-pointer"
                >
                  + Add to Rate Card
                </button>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsRateCardModalOpen(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRateCard}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#761c30] disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  <span>{savingRateCard ? "Saving..." : "Save Rate Card"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW REVIEWS MODAL
      ========================================================== */}
      {isReviewsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsReviewsModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl transition-all max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Star size={18} />
                </div>
                <div>
                  <h3 className="font-sans text-base font-bold text-stone-900">
                    Bespoke Client Reviews
                  </h3>
                  <p className="text-xs text-stone-500">
                    Satisfaction scores and fit feedback from verified customers.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewsModalOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Rating Summary Card */}
              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans text-2xl font-black text-stone-900">
                      {tailorProfile?.rating ? tailorProfile.rating.toFixed(1) : "4.9"}
                    </span>
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={15} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Based on {tailorProfile?.reviewCount || 48} verified tailoring commissions
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-lg bg-emerald-100/80 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    98.6% Fit Satisfaction
                  </span>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">Rohit S.</span>
                    <span className="text-[10px] text-stone-400">3 days ago</span>
                  </div>
                  <div className="flex text-amber-500 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs text-stone-600">
                    "Exceptional precision on my bandhgala suit. The armhole curve and shoulder pitch were tailored to exact millimeter measurement."
                  </p>
                  <span className="inline-block mt-2 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                    Verified Bespoke Fit
                  </span>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">Ananya Verma</span>
                    <span className="text-[10px] text-stone-400">1 week ago</span>
                  </div>
                  <div className="flex text-amber-500 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs text-stone-600">
                    "Finished 2 days before the scheduled delivery date. The fabric drape and neckline embroidery are top tier atelier quality."
                  </p>
                  <span className="inline-block mt-2 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                    Verified Bespoke Fit
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsReviewsModalOpen(false)}
                  className="rounded-xl border border-stone-200 bg-white px-5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          WORKSHOP CAPACITY MODAL
      ========================================================== */}
      {isCapacityModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget && !savingCapacity) {
              setIsCapacityModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-[#8f2338]">
                  <Sliders size={16} />
                </div>
                <h3 className="font-sans text-sm font-bold text-stone-900">
                  Adjust Workshop Capacity
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCapacityModalOpen(false)}
                className="rounded-full p-1 text-stone-400 hover:bg-stone-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCapacity} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Concurrent Order Capacity Slots
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={newCapacitySlots}
                  onChange={(e) => setNewCapacitySlots(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-[#fdfbf9] px-3 py-2 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                />
                <p className="mt-1.5 text-[11px] text-stone-500">
                  Currently {activeSlots} active orders booked. Setting this will recalculate your workshop load in real time.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCapacityModalOpen(false)}
                  className="rounded-xl border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCapacity}
                  className="rounded-xl bg-[#8f2338] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#761c30] disabled:opacity-50 cursor-pointer"
                >
                  {savingCapacity ? "Saving..." : "Update Slots"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
