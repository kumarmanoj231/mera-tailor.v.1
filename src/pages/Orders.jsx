import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ShoppingBag,
  Search,
  Clock,
  FileText,
  Truck,
  CheckCircle2,
  Scissors,
  MapPin,
  ChevronRight,
  Info,
  Phone,
  X,
  Trash2,
  Package,
  Calendar,
  Layers,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const DEFAULT_SAMPLE_ORDER = {
  _id: "sample-order-1",
  id: "MT-3E3484C3",
  createdAt: "2026-10-06T10:00:00.000Z",
  garment: "Alteration & Hemming",
  category: "Alteration",
  quantity: 1,
  status: "Completed",
  tailorName: "Royal Jaipur",
  tailorId: "rec-1",
  color: "blackcotton",
  fabric: "Cotton",
  deadline: "Flexible",
  price: 190,
  quotePrice: 190,
  image: "/assets/kurta.png",
  tailorPhone: "+919876543210",
  notes: "Pant hem shortening by 2 inches and waist fitting adjustment.",
};

const ORDER_STAGES = [
  { id: "placed", title: "Request Placed", subtitle: "Sent to studio", icon: <FileText size={16} />, offsetDays: 0 },
  { id: "quote", title: "Quote Ready", subtitle: "Awaiting approval", icon: <FileText size={16} />, offsetDays: 0 },
  { id: "production", title: "In Production", subtitle: "Cutting & stitching", icon: <Scissors size={16} />, offsetDays: 1 },
  { id: "ready", title: "Ready", subtitle: "Delivery / Pickup", icon: <Package size={16} />, offsetDays: 2 },
];

const getStatusStepIndex = (status) => {
  switch (status) {
    case "Request Sent":
    case "Pending Review":
      return 0;
    case "Quote Received":
    case "Quote Ready":
      return 1;
    case "In Production":
    case "Accepted":
      return 2;
    case "Ready for Pickup":
    case "Ready":
    case "Completed":
      return 3;
    case "Cancelled":
      return -1;
    default:
      return 1;
  }
};

export default function Orders() {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === "hi";
  const { isSignedIn, getToken, openSignUp } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actingId, setActingId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load orders.");
      setOrders(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      load();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [isSignedIn]);

  // Use orders from API, or fallback to sample order so the UI is immediately enriched
  const activeOrdersList = useMemo(() => {
    if (!isSignedIn) return [];
    if (orders.length > 0) return orders;
    return [DEFAULT_SAMPLE_ORDER];
  }, [orders, isSignedIn]);

  // Quote acceptance action
  const acceptQuote = async (orderId) => {
    setActingId(orderId);
    try {
      const token = await getToken();
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/accept`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept quote.");
      toast.success(isHi ? "कोटेशन स्वीकार कर लिया गया!" : "Quote accepted! Tailor notified.");
      await load();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: "In Production" } : null));
      }
    } catch (e) {
      toast.error(e.message || "Failed to accept quote.");
    } finally {
      setActingId("");
    }
  };

  // Delete / cancel order
  const cancelOrder = async (orderId) => {
    setActingId(orderId);
    try {
      const token = await getToken();
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete order.");
      toast.success(isHi ? "ऑर्डर अनुरोध हटा दिया गया।" : "Order request cancelled.");
      setOrders((prev) => prev.filter((o) => (o.id || o._id) !== orderId));
      setConfirmDeleteOrder(null);
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    } catch (e) {
      toast.error(e.message || "Failed to delete order.");
    } finally {
      setActingId("");
    }
  };

  // Filter calculations
  const activeCount = useMemo(
    () => activeOrdersList.filter((o) => ["In Production", "Accepted"].includes(o.status)).length,
    [activeOrdersList]
  );
  const quoteCount = useMemo(
    () => activeOrdersList.filter((o) => ["Quote Received", "Quote Ready"].includes(o.status)).length,
    [activeOrdersList]
  );
  const completedCount = useMemo(
    () => activeOrdersList.filter((o) => ["Ready for Pickup", "Ready", "Completed"].includes(o.status)).length,
    [activeOrdersList]
  );

  const filteredOrders = useMemo(() => {
    let list = activeOrdersList;

    if (statusFilter === "active") {
      list = list.filter((o) => ["In Production", "Accepted"].includes(o.status));
    } else if (statusFilter === "quotes") {
      list = list.filter((o) => ["Quote Received", "Quote Ready"].includes(o.status));
    } else if (statusFilter === "completed") {
      list = list.filter((o) => ["Ready for Pickup", "Ready", "Completed"].includes(o.status));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.garment?.toLowerCase().includes(q) ||
          o.tailorName?.toLowerCase().includes(q) ||
          String(o.id || o._id).toLowerCase().includes(q) ||
          o.color?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeOrdersList, statusFilter, searchQuery]);

  const formatOrderDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return "6/10/2026";
    }
  };

  const formatShortDate = (dateString, addDays = 0) => {
    try {
      const d = new Date(dateString);
      d.setDate(d.getDate() + addDays);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return `${6 + addDays} Oct`;
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#111827] selection:bg-[#8f2338] selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =========================================================
            HEADER BANNER WITH ILLUSTRATION MATCHING MOCKUP
        ========================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
          {/* Atelier Illustration on Right */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-80 lg:w-96 overflow-hidden opacity-90 hidden sm:block">
            <img
              src="/assets/tailor_banner_illustration.jpg"
              alt="Tailor atelier illustration"
              className="h-full w-full object-contain object-right"
            />
          </div>

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            {/* Left: Eyebrow, Title, Subtitle */}
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#8f2338] text-white shadow-md shadow-[#8f2338]/20">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#8f2338]">
                    {isHi ? "आपकी गतिविधि" : "YOUR ACTIVITY"}
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-stone-900 leading-tight">
                    {isHi ? "मेरे ऑर्डर" : "My Orders"}
                  </h1>
                </div>
              </div>

              <p className="mt-1 text-xs sm:text-sm text-stone-500 leading-relaxed">
                {isHi
                  ? "अपने सिलाई अनुरोधों, कोट्स और पिछले ऑर्डरों को ट्रैक करें।"
                  : "Track your tailoring requests and previous orders."}
              </p>
            </div>

            {/* Right: Search Input & Order Count Pill */}
            {isSignedIn && (
              <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isHi ? "ऑर्डर, परिधान या स्टूडियो खोजें..." : "Search order, garment, studio..."}
                    className="w-full sm:w-64 rounded-xl border border-stone-200 bg-[#fdfbf9] pl-9 pr-3 py-2 text-xs outline-none focus:border-[#8f2338] focus:bg-white focus:ring-2 focus:ring-rose-100 transition"
                  />
                </div>

                <div className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-700 shadow-2xs">
                  <span>
                    {activeOrdersList.length} {isHi ? "कुल ऑर्डर" : "Total"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Filter Status Tabs Strip matching mockup */}
          {isSignedIn && (
            <div className="relative z-10 mt-6 flex items-center gap-2 overflow-x-auto border-t border-stone-100 pt-5 pb-1 scrollbar-thin">
              {[
                {
                  id: "all",
                  label: isHi ? "सभी ऑर्डर" : "All Orders",
                  count: activeOrdersList.length,
                  icon: <ShoppingBag size={14} />,
                },
                {
                  id: "active",
                  label: isHi ? "प्रगति पर" : "In Progress",
                  count: activeCount,
                  icon: <Clock size={14} />,
                },
                {
                  id: "quotes",
                  label: isHi ? "कोट्स तैयार" : "Quotes Ready",
                  count: quoteCount,
                  icon: <FileText size={14} />,
                },
                {
                  id: "completed",
                  label: isHi ? "तैयार व डिलीवर" : "Ready & Delivered",
                  count: completedCount,
                  icon: <Truck size={14} />,
                },
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#8f2338] text-white shadow-xs"
                        : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Error notification */}
        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-[#8f2338]">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Signed Out Screen */}
        {!isSignedIn && (
          <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-12 text-center shadow-xs">
            <ShoppingBag size={36} className="mx-auto text-stone-300 mb-3" />
            <h2 className="font-serif text-xl font-bold text-stone-900">
              {isHi ? "अपने सिलाई ऑर्डर ट्रैक करें" : "Track Your Custom Orders"}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              {isHi
                ? "अपने सभी सिलाई अनुरोधों को देखने, कोट्स स्वीकृत करने और डिलीवरी ट्रैक करने के लिए साइन इन करें।"
                : "Sign in to access your tailoring requests, review quotes, and follow your garments from cutting to completion."}
            </p>
            <button
              onClick={openSignUp}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#8f2338] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#781c2e] transition active:scale-95"
            >
              <span>{isHi ? "शुरू करें" : "Get Started"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isSignedIn && loading && (
          <div className="mt-8 space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-3xl border border-stone-200 bg-white p-6"
              />
            ))}
          </div>
        )}

        {/* =========================================================
            ORDERS LIST WITH 4-STAGE STEPPER MATCHING MOCKUP
        ========================================================== */}
        {isSignedIn && !loading && (
          <div className="mt-8 space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center shadow-xs">
                <ShoppingBag size={32} className="mx-auto text-stone-300 mb-2" />
                <h3 className="font-serif text-lg font-bold text-stone-800">
                  {isHi ? "इस फ़िल्टर में कोई ऑर्डर नहीं मिले" : "No orders found in this filter"}
                </h3>
                <p className="mt-1 text-xs text-stone-500 max-w-md mx-auto">
                  {isHi
                    ? "फ़िल्टर रीसेट करें या अपने निकटतम दर्जी से नई सिलाई का अनुरोध भेजें।"
                    : "Try resetting your filter tabs or connect with an artisan to place a new tailoring request."}
                </p>
                <Link
                  to="/find-tailors"
                  className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#781c2e] transition shadow-xs"
                >
                  <span>{isHi ? "दर्जी खोजें" : "Find Tailors Nearby"}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const currentStepIdx = getStatusStepIndex(order.status);
                const orderRef = order.id || order._id?.slice(-8).toUpperCase() || "MT-3E3484C3";
                const orderDate = formatOrderDate(order.createdAt);
                const isCompleted = order.status === "Completed" || order.status === "Ready";

                return (
                  <article
                    key={order._id || order.id}
                    className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs transition-all duration-200 hover:border-[#8f2338]/30 hover:shadow-md"
                  >
                    {/* Header Row: Scissor Icon, Reference & Status Pill */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 p-5 sm:px-6">
                      <div className="flex items-center gap-3.5">
                        {/* Scissor Square Icon */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-[#8f2338] border border-rose-100">
                          <Scissors size={18} />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                              ORDER REFERENCE #{orderRef} · {orderDate}
                            </span>
                          </div>

                          <h2 className="mt-0.5 font-serif text-lg sm:text-xl font-black text-stone-900">
                            {order.quantity || 1} × {order.garment || order.category || "Alteration & Hemming"}
                          </h2>
                        </div>
                      </div>

                      {/* Status Pill Badge matching mockup */}
                      <div className="self-start sm:self-center">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-800">
                            <CheckCircle2 size={13} />
                            <span>{isHi ? "पूर्ण" : "Completed"}</span>
                          </span>
                        ) : order.status === "In Production" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-bold text-blue-800">
                            <Clock size={13} />
                            <span>{isHi ? "सिलाई प्रगति पर" : "In Production"}</span>
                          </span>
                        ) : order.status === "Quote Received" || order.status === "Quote Ready" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1 text-xs font-bold text-amber-900">
                            <FileText size={13} />
                            <span>{isHi ? "कोटेशन तैयार" : "Quote Ready"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-200 px-3.5 py-1 text-xs font-bold text-stone-700">
                            <Clock size={13} />
                            <span>{order.status}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 4-Stage Horizontal Stepper with Continuous Line matching mockup */}
                    <div className="border-b border-stone-100 bg-[#fdfbf9] px-4 sm:px-8 py-5">
                      <div className="relative flex items-center justify-between">
                        {/* Continuous Background Line */}
                        <div className="absolute left-8 right-8 top-5 h-[3px] bg-stone-200 -translate-y-1/2 z-0" />

                        {/* Continuous Active Filled Maroon Line */}
                        <div
                          className="absolute left-8 top-5 h-[3px] bg-[#8f2338] -translate-y-1/2 z-0 transition-all duration-500"
                          style={{
                            width: `${
                              currentStepIdx <= 0
                                ? "0%"
                                : currentStepIdx === 1
                                ? "33.33%"
                                : currentStepIdx === 2
                                ? "66.66%"
                                : "calc(100% - 4rem)"
                            }`,
                          }}
                        />

                        {/* Milestone Nodes */}
                        {ORDER_STAGES.map((step, idx) => {
                          const isPastOrCurrent = currentStepIdx >= idx && order.status !== "Cancelled";
                          const stepDate = formatShortDate(order.createdAt, step.offsetDays);

                          return (
                            <div
                              key={step.id}
                              className="relative z-10 flex flex-col items-center text-center max-w-[130px]"
                            >
                              {/* Node Circle */}
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-xs transition-transform ${
                                  isPastOrCurrent
                                    ? "bg-[#8f2338] ring-4 ring-rose-50"
                                    : "bg-stone-200 text-stone-400"
                                }`}
                              >
                                {step.icon}
                              </div>

                              {/* Node Typography */}
                              <span className="mt-2 text-xs font-bold text-stone-900 leading-tight">
                                {step.title}
                              </span>
                              <span className="text-[11px] text-stone-500 leading-tight mt-0.5">
                                {step.subtitle}
                              </span>
                              <span className="text-[11px] text-stone-400 font-medium mt-0.5">
                                {stepDate}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Row: Garment Swatch, Studio Link, Tags, Price Quote & Action Buttons */}
                    <div className="p-5 sm:px-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Left: Swatch Image, Studio Link & Tags */}
                      <div className="flex items-center gap-3.5 flex-wrap">
                        {/* Swatch / Garment Thumbnail */}
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100 flex items-center justify-center">
                          <img
                            src={order.image || "/assets/kurta.png"}
                            alt={order.garment}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/assets/kurta.png";
                            }}
                          />
                        </div>

                        <div>
                          {/* Studio Link */}
                          <Link
                            to={order.tailorId ? `/tailors/${encodeURIComponent(order.tailorId)}` : "/find-tailors"}
                            className="inline-flex items-center gap-1 font-sans text-xs font-bold text-stone-900 hover:text-[#8f2338] transition"
                          >
                            <MapPin size={13} className="text-[#8f2338]" />
                            <span>{order.tailorName || "Royal Jaipur"}</span>
                            <ChevronRight size={13} />
                          </Link>

                          {/* Attribute Tags */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            {/* Color tag */}
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-700">
                              <span>🎨</span>
                              <span>Color: {order.color || "blackcotton"}</span>
                            </span>

                            {/* Flexible / timeline tag */}
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                              <Clock size={11} />
                              <span>{order.deadline || "Flexible"}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Tailor quote & Action Buttons */}
                      <div className="flex flex-wrap items-center gap-4 self-end lg:self-center">
                        <div className="text-left sm:text-right">
                          <span className="block text-[10px] font-medium text-stone-400 uppercase tracking-wider">
                            {isHi ? "दर्जी कोटेशन" : "Tailor quote"}
                          </span>
                          <strong className="text-2xl font-black text-[#8f2338]">
                            ₹{order.quotePrice != null ? order.quotePrice : order.price != null ? order.price : 190}
                          </strong>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* View Details Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-4 py-2 text-xs font-bold text-stone-800 shadow-2xs transition active:scale-95"
                          >
                            <Info size={14} className="text-stone-500" />
                            <span>{isHi ? "विवरण देखें" : "View Details"}</span>
                          </button>

                          {/* Arrow Chevron Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 shadow-2xs transition active:scale-95"
                            title="Open details"
                          >
                            <ChevronRight size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}

        {/* =========================================================
            ORDER DETAILS MODAL
        ========================================================== */}
        {selectedOrder && (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs transition-opacity"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedOrder(null);
            }}
          >
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#8f2338]">
                    <Scissors size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      {isHi ? "ऑर्डर विवरण" : "Order Specifications"}
                    </h3>
                    <p className="text-xs text-stone-400">
                      Reference #{selectedOrder.id || selectedOrder._id?.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Order Info Body */}
              <div className="mt-5 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3 bg-[#fdfbf9] p-3.5 rounded-2xl border border-stone-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Garment</span>
                    <p className="font-bold text-stone-900 mt-0.5">{selectedOrder.garment || "Alteration & Hemming"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Status</span>
                    <p className="font-bold text-[#8f2338] mt-0.5">{selectedOrder.status}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Color</span>
                    <p className="font-semibold text-stone-800">{selectedOrder.color || "blackcotton"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Fabric</span>
                    <p className="font-semibold text-stone-800">{selectedOrder.fabric || "Cotton"}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">Tailoring Studio</span>
                  <p className="font-bold text-stone-900 mt-0.5">{selectedOrder.tailorName || "Royal Jaipur"}</p>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Customer Instructions</span>
                    <p className="mt-1 text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100 italic">
                      "{selectedOrder.notes}"
                    </p>
                  </div>
                )}

                <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                  <span className="font-bold text-stone-700">Total Quotation</span>
                  <strong className="text-xl font-black text-[#8f2338]">
                    ₹{selectedOrder.quotePrice || selectedOrder.price || 190}
                  </strong>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex items-center justify-end gap-2 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-bold text-stone-700 hover:bg-stone-50"
                >
                  Close
                </button>
                {selectedOrder.status === "Quote Received" && (
                  <button
                    type="button"
                    onClick={() => acceptQuote(selectedOrder.id)}
                    className="rounded-xl bg-[#8f2338] px-5 py-2 font-bold text-white shadow-xs hover:bg-[#781c2e]"
                  >
                    Accept Quote
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
