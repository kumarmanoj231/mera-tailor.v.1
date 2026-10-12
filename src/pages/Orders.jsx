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
  MessageSquare,
  Building2,
  Send,
  Check,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

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
  const { isSignedIn, getToken, openSignUp, profile, user } = useAuth();
  const userRole = (profile?.role || user?.publicMetadata?.appRole || "customer").toLowerCase();
  const isTailor = userRole === "tailor";
  const isBusiness = userRole === "business";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [actingId, setActingId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [quoteModalOrder, setQuoteModalOrder] = useState(null);
  const [quotePriceInput, setQuotePriceInput] = useState("");

  // Chat conversation state
  const [chatOrder, setChatOrder] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessageText, setNewMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Milestone transition state
  const [milestoneOrder, setMilestoneOrder] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState("cutting");
  const [milestoneNote, setMilestoneNote] = useState("");
  const [updatingMilestone, setUpdatingMilestone] = useState(false);

  const load = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = await getToken();
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load orders.");
      setOrders(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      if (showLoading) setError(e.message || "Failed to load orders.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      load(true);
      const interval = setInterval(() => {
        load(false);
      }, 15000);
      return () => clearInterval(interval);
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [isSignedIn]);

  // Purely database-driven list - zero dummy or sample order fallbacks
  const activeOrdersList = useMemo(() => {
    if (!isSignedIn) return [];
    return orders;
  }, [orders, isSignedIn]);

  // Quote acceptance action (Customer)
  const acceptQuote = async (orderId) => {
    setActingId(orderId);
    try {
      const token = await getToken();
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/accept`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept quote.");
      toast.success(isHi ? "कोटेशन स्वीकार कर लिया गया!" : "Quote accepted! Tailor notified.");
      await load(false);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: "Accepted" } : null));
      }
    } catch (e) {
      toast.error(e.message || "Failed to accept quote.");
    } finally {
      setActingId("");
    }
  };

  // Safe cancellation: cancels without purging from DB so past order history is preserved
  const handleCancelOrder = async (orderId) => {
    setActingId(orderId);
    try {
      const token = await getToken();
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason || "Cancelled by customer" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not cancel order.");
      toast.success(isHi ? "ऑर्डर सफलतापूर्वक रद्द कर दिया गया।" : "Order cancelled and archived in history.");
      setCancelModalOrder(null);
      setCancelReason("");
      await load(false);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: "Cancelled" } : null));
      }
    } catch (e) {
      toast.error(e.message || "Failed to cancel order.");
    } finally {
      setActingId("");
    }
  };

  // Tailor: submit or update quote
  const handleSendQuote = async (orderId, price) => {
    const numPrice = Number(price);
    if (!Number.isFinite(numPrice) || numPrice < 0) {
      toast.error(isHi ? "कृपया मान्य कोट राशि दर्ज करें।" : "Please enter a valid quote amount.");
      return;
    }
    setActingId(orderId);
    try {
      const token = await getToken();
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/quote`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quotePrice: numPrice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit quote.");
      toast.success(isHi ? "कोटेशन ग्राहक को भेज दिया गया!" : "Quote submitted to client successfully!");
      setQuoteModalOrder(null);
      setQuotePriceInput("");
      await load(false);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, quotePrice: numPrice, status: "Quote Received" } : null));
      }
    } catch (e) {
      toast.error(e.message || "Failed to submit quote.");
    } finally {
      setActingId("");
    }
  };

  // Tailor: decline request
  const handleDeclineOrder = async (orderId) => {
    if (!window.confirm(isHi ? "क्या आप वाकई इस अनुरोध को अस्वीकार करना चाहते हैं?" : "Are you sure you want to decline this tailoring request?")) return;
    setActingId(orderId);
    try {
      const token = await getToken();
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/decline`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to decline order.");
      toast.success(isHi ? "अनुरोध अस्वीकार कर दिया गया।" : "Request declined.");
      await load(false);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: "Cancelled" } : null));
      }
    } catch (e) {
      toast.error(e.message || "Failed to decline order.");
    } finally {
      setActingId("");
    }
  };

  // Tailor: progress status
  const handleUpdateStatus = async (orderId, nextStatus) => {
    setActingId(orderId);
    try {
      const token = await getToken();
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order status.");
      toast.success(isHi ? `ऑर्डर स्थिति: ${nextStatus}` : `Order status updated to ${nextStatus}!`);
      await load(false);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    } catch (e) {
      toast.error(e.message || "Failed to update status.");
    } finally {
      setActingId("");
    }
  };

  // Chat communication handlers
  const openChat = async (order) => {
    setChatOrder(order);
    setLoadingMessages(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/orders/${encodeURIComponent(order.id || order._id)}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load conversation.");
      setChatMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message || "Could not load messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatOrder || !newMessageText.trim() || sendingMessage) return;
    setSendingMessage(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/orders/${encodeURIComponent(chatOrder.id || chatOrder._id)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newMessageText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message.");
      setChatMessages((prev) => [...prev, data]);
      setNewMessageText("");
    } catch (e) {
      toast.error(e.message || "Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  // Milestone transition handler
  const handleUpdateMilestone = async () => {
    if (!milestoneOrder || updatingMilestone) return;
    setUpdatingMilestone(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/orders/${encodeURIComponent(milestoneOrder.id || milestoneOrder._id)}/milestone`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ milestone: selectedMilestone, note: milestoneNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update milestone.");
      toast.success(`Milestone updated to ${selectedMilestone.replace(/_/g, " ")}!`);
      setMilestoneOrder(null);
      setMilestoneNote("");
      await load(false);
      if (selectedOrder?.id === milestoneOrder.id) {
        setSelectedOrder((prev) => (prev ? { ...prev, productionStatus: selectedMilestone } : null));
      }
    } catch (e) {
      toast.error(e.message || "Failed to update milestone.");
    } finally {
      setUpdatingMilestone(false);
    }
  };

  // Filter calculations across pure database orders
  const bulkCount = useMemo(
    () => activeOrdersList.filter((o) => o.orderType === "bulk").length,
    [activeOrdersList]
  );
  const individualCount = useMemo(
    () => activeOrdersList.filter((o) => o.orderType !== "bulk").length,
    [activeOrdersList]
  );
  const activeCount = useMemo(
    () => activeOrdersList.filter((o) => ["In Production", "Accepted", "Confirmed", "Request Sent", "Pending Review"].includes(o.status)).length,
    [activeOrdersList]
  );
  const quoteCount = useMemo(
    () => activeOrdersList.filter((o) => ["Quote Received", "Quote Ready"].includes(o.status)).length,
    [activeOrdersList]
  );
  const completedCount = useMemo(
    () => activeOrdersList.filter((o) => ["Ready for Pickup", "Ready", "Delivered", "Completed"].includes(o.status)).length,
    [activeOrdersList]
  );
  const cancelledCount = useMemo(
    () => activeOrdersList.filter((o) => o.status === "Cancelled").length,
    [activeOrdersList]
  );

  const filteredOrders = useMemo(() => {
    let list = activeOrdersList;

    if (orderTypeFilter === "bulk") {
      list = list.filter((o) => o.orderType === "bulk");
    } else if (orderTypeFilter === "individual") {
      list = list.filter((o) => o.orderType !== "bulk");
    }

    if (statusFilter === "active") {
      list = list.filter((o) => ["In Production", "Accepted", "Confirmed", "Request Sent", "Pending Review"].includes(o.status));
    } else if (statusFilter === "quotes") {
      list = list.filter((o) => ["Quote Received", "Quote Ready", "Request Sent"].includes(o.status));
    } else if (statusFilter === "completed") {
      list = list.filter((o) => ["Ready for Pickup", "Ready", "Delivered", "Completed"].includes(o.status));
    } else if (statusFilter === "cancelled") {
      list = list.filter((o) => o.status === "Cancelled");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.garment?.toLowerCase().includes(q) ||
          o.category?.toLowerCase().includes(q) ||
          o.organisation?.toLowerCase().includes(q) ||
          o.tailorName?.toLowerCase().includes(q) ||
          o.clientName?.toLowerCase().includes(q) ||
          o.clientPhone?.toLowerCase().includes(q) ||
          String(o.id || o._id).toLowerCase().includes(q) ||
          o.color?.toLowerCase().includes(q) ||
          o.fabric?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeOrdersList, orderTypeFilter, statusFilter, searchQuery]);

  const formatOrderDate = (dateString) => {
    try {
      const d = dateString ? new Date(dateString) : new Date();
      if (isNaN(d.getTime())) return new Date().toLocaleDateString();
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return new Date().toLocaleDateString();
    }
  };

  const formatShortDate = (dateString, addDays = 0) => {
    try {
      const d = dateString ? new Date(dateString) : new Date();
      if (isNaN(d.getTime())) return "—";
      d.setDate(d.getDate() + addDays);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return "—";
    }
  };

  // Check if order is cancellable by customer (tailor has not started progress)
  const isOrderCancellable = (order) => {
    return !isTailor && order && ["Request Sent", "Quote Received", "Pending Review"].includes(order.status);
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] font-sans text-[#111827] selection:bg-[#8f2338] selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =========================================================
            HEADER BANNER WITH ILLUSTRATION MATCHING MOCKUP
        ========================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
          {/* Atelier Illustration on Right */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-20 w-72 overflow-hidden opacity-40 hidden 2xl:block">
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
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8f2338]">
                    {isTailor
                      ? (isHi ? "दर्जी कंसोल गतिविधि" : "ATELIER ORDERS CONSOLE")
                      : (isHi ? "आपकी गतिविधि" : "YOUR ACTIVITY")}
                  </span>
                  <h1 className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-stone-900 leading-tight">
                    {isTailor
                      ? (isHi ? "स्टूडियो ऑर्डर" : "Studio Orders")
                      : (isHi ? "मेरे ऑर्डर" : "My Orders")}
                  </h1>
                </div>
              </div>

              <p className="mt-1 text-xs sm:text-sm text-stone-500 leading-relaxed font-sans">
                {isTailor
                  ? (isHi
                      ? "अपने ग्राहकों के ऑर्डर, कोटेशन अनुरोध और सिलाई की प्रगति प्रबंधित करें।"
                      : "Manage client bespoke requests, submit pricing quotes, and advance garments through production.")
                  : (isHi
                      ? "अपने सिलाई अनुरोधों, कोट्स और पिछले सभी ऑर्डरों को ट्रैक करें।"
                      : "Track your tailoring requests, review quotes, and follow your order history.")}
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
                    placeholder={
                      isTailor
                        ? (isHi ? "ऑर्डर, ग्राहक नाम, फ़ोन या परिधान खोजें..." : "Search client, phone, garment, order ID...")
                        : (isHi ? "ऑर्डर, परिधान या स्टूडियो खोजें..." : "Search order, garment, studio...")
                    }
                    className="w-full sm:w-64 rounded-xl border border-stone-200 bg-[#fdfbf9] pl-9 pr-3 py-2 text-xs font-sans outline-none focus:border-[#8f2338] focus:bg-white focus:ring-2 focus:ring-rose-100 transition"
                  />
                </div>

                <div className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-700 shadow-2xs">
                  <span>
                    {activeOrdersList.length} {isHi ? "कुल ऑर्डर" : "Total Orders"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Filter Status & Order Type Tabs Strip */}
          {isSignedIn && (
            <div className="relative z-10 mt-6 flex flex-col gap-3 border-t border-stone-100 pt-5 pb-1 xl:flex-row xl:items-center xl:justify-between">
              {/* Order Type Toggle (Bulk vs Individual) */}
              <div className="flex max-w-full items-center gap-1.5 overflow-x-auto bg-stone-100/80 p-1 rounded-2xl shrink-0 self-start">
                <button
                  type="button"
                  onClick={() => setOrderTypeFilter("all")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    orderTypeFilter === "all"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  All ({activeOrdersList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderTypeFilter("bulk")}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    orderTypeFilter === "bulk"
                      ? "bg-[#8f2338] text-white shadow-2xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Building2 size={13} />
                  <span>B2B Bulk ({bulkCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderTypeFilter("individual")}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    orderTypeFilter === "individual"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Scissors size={13} />
                  <span>Individual ({individualCount})</span>
                </button>
              </div>

              {/* Status Tabs */}
              <div className="flex max-w-full items-center gap-2 overflow-x-auto scrollbar-thin">
              {[
                {
                  id: "all",
                  label: isHi ? "सभी स्थितियां" : "All Statuses",
                  count: filteredOrders.length,
                  icon: <ShoppingBag size={14} />,
                },
                ...(isTailor
                  ? [
                      {
                        id: "quotes",
                        label: isHi ? "कोटेशन प्रतीक्षारत" : "Needs Quote",
                        count: quoteCount,
                        icon: <FileText size={14} />,
                      },
                      {
                        id: "active",
                        label: isHi ? "सिलाई प्रगति पर" : "In Production",
                        count: activeCount,
                        icon: <Scissors size={14} />,
                      },
                    ]
                  : [
                      {
                        id: "active",
                        label: isHi ? "सक्रिय / प्रगति पर" : "Active & In Progress",
                        count: activeCount,
                        icon: <Clock size={14} />,
                      },
                      {
                        id: "quotes",
                        label: isHi ? "कोट्स तैयार" : "Quotes Ready",
                        count: quoteCount,
                        icon: <FileText size={14} />,
                      },
                    ]),
                {
                  id: "completed",
                  label: isHi ? "तैयार व डिलीवर" : "Completed",
                  count: completedCount,
                  icon: <Truck size={14} />,
                },
                {
                  id: "cancelled",
                  label: isHi ? "रद्द किए गए" : "Cancelled",
                  count: cancelledCount,
                  icon: <X size={14} />,
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
                const orderRef = order.id || (order._id ? order._id.slice(-8).toUpperCase() : "MT-ORDER");
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                              ORDER REFERENCE #{orderRef} · {orderDate}
                            </span>
                            {order.orderType === "bulk" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                <Building2 size={10} />
                                <span>B2B BULK CONTRACT</span>
                              </span>
                            )}
                          </div>

                          <h2 className="mt-0.5 font-serif text-lg sm:text-xl font-black text-stone-900">
                            {order.quantity || 1} × {order.garment || order.category || "Alteration & Hemming"}
                            {order.organisation && (
                              <span className="block text-xs font-sans font-medium text-stone-500 mt-0.5">
                                Enterprise Client: <strong>{order.organisation}</strong>
                              </span>
                            )}
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

                    {/* Bottom Row: Garment Swatch, Studio / Client Link, Tags, Price Quote & Action Buttons */}
                    <div className="p-5 sm:px-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Left: Swatch Image, Identity & Tags */}
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
                          {isTailor ? (
                            <div className="flex items-center gap-2">
                              {order.clientAvatar ? (
                                <img
                                  src={order.clientAvatar}
                                  alt={order.clientName}
                                  className="h-7 w-7 rounded-full object-cover border border-stone-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-[#8f2338] border border-rose-100 text-xs font-bold shrink-0">
                                  {(order.clientName || "C").charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-stone-900 text-xs block">
                                  {order.clientName || "Client"}
                                </span>
                                {order.clientPhone && (
                                  <a
                                    href={`tel:${order.clientPhone}`}
                                    className="text-[11px] text-stone-500 hover:text-[#8f2338] flex items-center gap-1 font-sans"
                                  >
                                    <Phone size={10} />
                                    <span>{order.clientPhone}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <Link
                              to={order.tailorId ? `/tailors/${encodeURIComponent(order.tailorId)}` : "/find-tailors"}
                              className="inline-flex items-center gap-1 font-sans text-xs font-bold text-stone-900 hover:text-[#8f2338] transition"
                            >
                              <MapPin size={13} className="text-[#8f2338]" />
                              <span>{order.tailorName || (order.status === "Completed" ? "undefined" : t("dashboardPage.masterStudio", "Master Studio"))}</span>
                              <ChevronRight size={13} />
                            </Link>
                          )}

                          {/* Attribute Tags */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            {/* Color tag */}
                            {order.color && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-700">
                                <span>🎨</span>
                                <span>Color: {order.color}</span>
                              </span>
                            )}

                            {/* Fabric tag */}
                            {order.fabric && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-700">
                                <span>🧵</span>
                                <span>{order.fabric}</span>
                              </span>
                            )}

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
                            {isTailor
                              ? (isHi ? "ऑर्डर कोटेशन" : "Order Quotation")
                              : (isHi ? "दर्जी कोटेशन" : "Tailor quote")}
                          </span>
                          <strong className="text-2xl font-black text-[#8f2338]">
                            {order.quotePrice != null
                              ? `₹${order.quotePrice}`
                              : order.price != null
                              ? `₹${order.price}`
                              : isTailor
                              ? (isHi ? "कोट प्रतीक्षारत" : "Needs Quote")
                              : (isHi ? "समीक्षाधीन" : "Awaiting Review")}
                          </strong>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* TAILOR ACTIONS */}
                          {isTailor ? (
                            <>
                              {/* Send or Update Quote */}
                              {(order.status === "Request Sent" || order.status === "Quote Received") && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuoteModalOrder(order);
                                    setQuotePriceInput(order.quotePrice != null ? String(order.quotePrice) : order.price != null ? String(order.price) : "");
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] hover:bg-[#781c2e] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95"
                                >
                                  <FileText size={13} />
                                  <span>
                                    {order.status === "Quote Received"
                                      ? (isHi ? "कोट अपडेट करें" : "Update Quote")
                                      : (isHi ? "कोट भेजें" : "Send Quote")}
                                  </span>
                                </button>
                              )}

                              {/* Decline pre-production request */}
                              {["Request Sent", "Quote Received"].includes(order.status) && (
                                <button
                                  type="button"
                                  disabled={actingId === (order.id || order._id)}
                                  onClick={() => handleDeclineOrder(order.id || order._id)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3 py-2 text-xs font-bold text-[#8f2338] shadow-2xs transition active:scale-95 disabled:opacity-50"
                                >
                                  <X size={13} />
                                  <span>{isHi ? "अस्वीकार करें" : "Decline"}</span>
                                </button>
                              )}

                              {/* Start Production when Accepted */}
                              {order.status === "Accepted" && (
                                <button
                                  type="button"
                                  disabled={actingId === (order.id || order._id)}
                                  onClick={() => handleUpdateStatus(order.id || order._id, "In Production")}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95 disabled:opacity-50"
                                >
                                  <Scissors size={13} />
                                  <span>{actingId === (order.id || order._id) ? "Updating..." : (isHi ? "सिलाई शुरू करें" : "Start Production")}</span>
                                </button>
                              )}

                              {/* Mark Ready when In Production */}
                              {order.status === "In Production" && (
                                <button
                                  type="button"
                                  disabled={actingId === (order.id || order._id)}
                                  onClick={() => handleUpdateStatus(order.id || order._id, "Ready for Pickup")}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95 disabled:opacity-50"
                                >
                                  <Package size={13} />
                                  <span>{actingId === (order.id || order._id) ? "Updating..." : (isHi ? "तैयार मार्क करें" : "Mark Ready")}</span>
                                </button>
                              )}

                              {/* Mark Completed when Ready for Pickup */}
                              {order.status === "Ready for Pickup" && (
                                <button
                                  type="button"
                                  disabled={actingId === (order.id || order._id)}
                                  onClick={() => handleUpdateStatus(order.id || order._id, "Completed")}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95 disabled:opacity-50"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>{actingId === (order.id || order._id) ? "Updating..." : (isHi ? "ऑर्डर पूर्ण करें" : "Mark Completed")}</span>
                                </button>
                              )}
                            </>
                          ) : (
                            /* CUSTOMER ACTIONS */
                            <>
                              {/* Cancel Order Button */}
                              {isOrderCancellable(order) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCancelModalOrder(order);
                                    setCancelReason("");
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 px-3 py-2 text-xs font-bold text-[#8f2338] shadow-2xs transition active:scale-95"
                                  title="Cancel order before studio starts cutting/production"
                                >
                                  <X size={13} />
                                  <span>{isHi ? "रद्द करें" : "Cancel"}</span>
                                </button>
                              )}

                              {/* Accept Quote Button if Quote Received */}
                              {(order.status === "Quote Received" || order.status === "Quote Ready") && (
                                <button
                                  type="button"
                                  disabled={actingId === (order.id || order._id)}
                                  onClick={() => acceptQuote(order.id || order._id)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95 disabled:opacity-50"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>{actingId === (order.id || order._id) ? (isHi ? "स्वीकार कर रहे..." : "Accepting...") : (isHi ? "कोट स्वीकारें" : "Accept Quote")}</span>
                                </button>
                              )}
                            </>
                          )}

                          {/* Order-Linked Chat Button */}
                          <button
                            type="button"
                            onClick={() => openChat(order)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800 shadow-2xs transition active:scale-95"
                            title="Chat with atelier / business"
                          >
                            <MessageSquare size={13} className="text-[#8f2338]" />
                            <span>Messages</span>
                          </button>

                          {/* Tailor Milestone Button: ONLY FOR ENTERPRISE & BULK ORDERS */}
                          {isTailor && order.orderType === "bulk" && ["In Production", "Confirmed", "Accepted"].includes(order.status) && (
                            <button
                              type="button"
                              onClick={() => {
                                setMilestoneOrder(order);
                                setSelectedMilestone(order.productionStatus || "cutting");
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 px-3 py-2 text-xs font-bold text-blue-900 shadow-2xs transition active:scale-95"
                            >
                              <Scissors size={13} className="text-blue-700" />
                              <span>Milestones</span>
                            </button>
                          )}

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
            CANCEL ORDER CONFIRMATION MODAL
        ========================================================== */}
        {cancelModalOrder && (
          <div
            className="fixed inset-0 z-[1050] flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs transition-opacity"
            onClick={(e) => {
              if (e.target === e.currentTarget) setCancelModalOrder(null);
            }}
          >
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl transition-all">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#8f2338]">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="font-sans text-base sm:text-lg font-bold text-stone-900">
                    {isHi ? "ऑर्डर रद्द करने की पुष्टि" : "Cancel Tailoring Request?"}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Reference #{cancelModalOrder.id || cancelModalOrder._id?.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs sm:text-sm">
                <p className="text-stone-600 leading-relaxed font-sans">
                  {isHi
                    ? "क्या आप वाकई इस सिलाई अनुरोध को रद्द करना चाहते हैं? चूंकि दर्जी ने अभी सिलाई या कटाई शुरू नहीं की है, इसलिए आप इसे अभी रद्द कर सकते हैं। यह रिकॉर्ड आपके पिछले ऑर्डरों में सुरक्षित रहेगा।"
                    : "Are you sure you want to cancel this order? Because the tailoring studio has not yet begun fabric cutting or production, cancellation is permitted. This order will remain safely preserved in your past orders history."}
                </p>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isHi ? "रद्द करने का कारण (वैकल्पिक):" : "Reason for cancellation (optional):"}
                  </label>
                  <textarea
                    rows={2}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder={isHi ? "जैसे: कार्यक्रम की तारीख बदल गई..." : "e.g., Event date changed, found fabric locally..."}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs font-sans outline-none focus:border-[#8f2338] focus:bg-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
                >
                  {isHi ? "रखें" : "Keep Order"}
                </button>
                <button
                  type="button"
                  disabled={actingId === (cancelModalOrder.id || cancelModalOrder._id)}
                  onClick={() => handleCancelOrder(cancelModalOrder.id || cancelModalOrder._id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition disabled:opacity-50"
                >
                  <X size={14} />
                  <span>
                    {actingId === cancelModalOrder.id
                      ? (isHi ? "रद्द हो रहा..." : "Cancelling...")
                      : (isHi ? "हां, रद्द करें" : "Confirm Cancel")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAILOR SEND / UPDATE QUOTE MODAL
        ========================================================== */}
        {quoteModalOrder && (
          <div
            className="fixed inset-0 z-[1050] flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs transition-opacity"
            onClick={(e) => {
              if (e.target === e.currentTarget) setQuoteModalOrder(null);
            }}
          >
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl transition-all">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-sans text-base sm:text-lg font-bold text-stone-900">
                    {isHi ? "कोटेशन सबमिट करें" : "Submit Tailor Quotation"}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Order #{quoteModalOrder.id || quoteModalOrder._id?.slice(-8).toUpperCase()} · {quoteModalOrder.garment}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs sm:text-sm">
                <p className="text-stone-600 leading-relaxed font-sans">
                  {isHi
                    ? "ग्राहक को अपनी सिलाई और सामग्री का कुल कोटेशन भेजें। ग्राहक के स्वीकार करने पर आप कटाई और उत्पादन शुरू कर सकेंगे।"
                    : "Enter your custom tailoring price for this client request. When the client approves, you can begin fabric cutting and production."}
                </p>

                {quoteModalOrder.clientName && (
                  <div className="rounded-xl bg-stone-50 border border-stone-100 p-2.5 text-xs">
                    <span className="text-stone-400 block text-[10px] font-bold uppercase">Client</span>
                    <strong className="text-stone-800">{quoteModalOrder.clientName}</strong>
                    {quoteModalOrder.clientPhone && (
                      <span className="text-stone-500 ml-2">({quoteModalOrder.clientPhone})</span>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isHi ? "कुल कोटेशन राशि (₹):" : "Total Quotation Amount (₹):"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-400 text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={quotePriceInput}
                      onChange={(e) => setQuotePriceInput(e.target.value)}
                      placeholder="e.g. 1499"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-8 pr-3 py-2.5 text-sm font-bold text-stone-900 outline-none focus:border-[#8f2338] focus:bg-white"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => setQuoteModalOrder(null)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
                >
                  {isHi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="button"
                  disabled={actingId === (quoteModalOrder.id || quoteModalOrder._id) || !quotePriceInput}
                  onClick={() => handleSendQuote(quoteModalOrder.id || quoteModalOrder._id, quotePriceInput)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  <span>
                    {actingId === quoteModalOrder.id
                      ? (isHi ? "सबमिट हो रहा..." : "Submitting...")
                      : (isHi ? "कोटेशन भेजें" : "Send Quote")}
                  </span>
                </button>
              </div>
            </div>
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
                    <h3 className="font-sans text-lg font-bold text-stone-900">
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
                    <p className="font-bold text-stone-900 mt-0.5">{selectedOrder.garment || selectedOrder.category || "Custom Garment"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Status</span>
                    <p className="font-bold text-[#8f2338] mt-0.5">{selectedOrder.status}</p>
                  </div>
                </div>

                {/* Client Information (Tailor View) */}
                {isTailor && (
                  <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-2">Client Details</span>
                    <div className="flex items-center gap-2.5">
                      {selectedOrder.clientAvatar ? (
                        <img
                          src={selectedOrder.clientAvatar}
                          alt={selectedOrder.clientName}
                          className="h-9 w-9 rounded-full object-cover border border-stone-200"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-[#8f2338] border border-rose-100 text-xs font-bold shrink-0">
                          {(selectedOrder.clientName || "C").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <strong className="text-stone-900 text-xs sm:text-sm block">
                          {selectedOrder.clientName || "Client"}
                        </strong>
                        <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5 flex-wrap">
                          {selectedOrder.clientPhone && (
                            <a
                              href={`tel:${selectedOrder.clientPhone}`}
                              className="hover:text-[#8f2338] flex items-center gap-1 font-sans text-stone-700 font-medium"
                            >
                              <Phone size={11} /> {selectedOrder.clientPhone}
                            </a>
                          )}
                          {selectedOrder.clientEmail && <span>{selectedOrder.clientEmail}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Color</span>
                    <p className="font-semibold text-stone-800">{selectedOrder.color || "Specified"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Fabric</span>
                    <p className="font-semibold text-stone-800">{selectedOrder.fabric || "Selected"}</p>
                  </div>
                </div>

                {/* B2B Bulk Specific Details: Size breakdown & Platform Fees */}
                {selectedOrder.orderType === "bulk" && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-amber-900 flex items-center gap-1">
                        <Building2 size={12} /> B2B Commercial Contract Breakdown
                      </span>
                      <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                        {selectedOrder.quantity || 1} Total Units
                      </span>
                    </div>

                    {selectedOrder.organisation && (
                      <p className="text-xs text-stone-700">
                        Institutional Client: <strong>{selectedOrder.organisation}</strong>
                      </p>
                    )}

                    {selectedOrder.sizeBreakdown && typeof selectedOrder.sizeBreakdown === 'object' && (
                      <div className="text-xs text-stone-600 bg-white/80 p-2 rounded-xl border border-amber-100">
                        <span className="font-bold block text-[10px] text-stone-500 uppercase mb-1">Size Distribution</span>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedOrder.sizeBreakdown).map(([sz, qty]) => (
                            <span key={sz} className="rounded-md bg-stone-100 px-2 py-0.5 font-mono text-[11px] font-bold text-stone-800">
                              {sz}: {qty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200/60 text-center">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-400 block">Agreed Amount</span>
                        <span className="font-bold text-stone-900 text-xs">₹{selectedOrder.agreedAmount || selectedOrder.price}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-400 block">Platform Fee (5%)</span>
                        <span className="font-bold text-stone-600 text-xs">₹{selectedOrder.platformFeeAmount || Math.round((selectedOrder.price || 0) * 0.05)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-emerald-700 block">Net Atelier Payout</span>
                        <span className="font-bold text-emerald-800 text-xs">₹{selectedOrder.netTailorAmount || Math.round((selectedOrder.price || 0) * 0.95)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {!isTailor && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Tailoring Studio</span>
                    <p className="font-bold text-stone-900 mt-0.5">
                      {selectedOrder.tailorName || (selectedOrder.status === "Completed" ? "undefined" : t("dashboardPage.masterStudio", "Master Studio"))}
                    </p>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Customer Instructions</span>
                    <p className="mt-1 text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100 italic">
                      "{selectedOrder.notes}"
                    </p>
                  </div>
                )}

                {/* Status Timeline History */}
                {Array.isArray(selectedOrder.history) && selectedOrder.history.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-2">Order Activity Log</span>
                    <div className="space-y-1.5 bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                      {selectedOrder.history.map((step, idx) => {
                        const stepTitle = Array.isArray(step) ? step[0] : String(step);
                        const stepDate = Array.isArray(step) && step[1] ? step[1] : "";
                        const stepDetail = Array.isArray(step) && step[2] ? step[2] : "";
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-stone-800">{stepTitle}{stepDetail ? ` (${stepDetail})` : ""}</span>
                            <span className="text-stone-400 font-mono text-[11px]">{stepDate}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                  <span className="font-bold text-stone-700">Total Quotation</span>
                  <strong className="text-xl font-black text-[#8f2338]">
                    {selectedOrder.quotePrice != null
                      ? `₹${selectedOrder.quotePrice}`
                      : selectedOrder.price != null
                      ? `₹${selectedOrder.price}`
                      : (isHi ? "समीक्षाधीन" : "Awaiting Review")}
                  </strong>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex items-center justify-between gap-2 border-t border-stone-100 pt-4 flex-wrap">
                {isOrderCancellable(selectedOrder) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCancelModalOrder(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-[#8f2338] hover:bg-rose-100 transition"
                  >
                    {isHi ? "ऑर्डर रद्द करें" : "Cancel Request"}
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-bold text-stone-700 hover:bg-stone-50 text-xs"
                  >
                    Close
                  </button>
                  {isTailor ? (
                    <>
                      {(selectedOrder.status === "Request Sent" || selectedOrder.status === "Quote Received") && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuoteModalOrder(selectedOrder);
                            setQuotePriceInput(selectedOrder.quotePrice != null ? String(selectedOrder.quotePrice) : selectedOrder.price != null ? String(selectedOrder.price) : "");
                            setSelectedOrder(null);
                          }}
                          className="rounded-xl bg-[#8f2338] px-4 py-2 font-bold text-white shadow-xs hover:bg-[#781c2e] text-xs"
                        >
                          {selectedOrder.status === "Quote Received" ? "Update Quote" : "Send Quote"}
                        </button>
                      )}
                      {selectedOrder.status === "Accepted" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(selectedOrder.id || selectedOrder._id, "In Production")}
                          className="rounded-xl bg-blue-700 px-4 py-2 font-bold text-white shadow-xs hover:bg-blue-800 text-xs"
                        >
                          Start Production
                        </button>
                      )}
                      {selectedOrder.status === "In Production" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(selectedOrder.id || selectedOrder._id, "Ready for Pickup")}
                          className="rounded-xl bg-amber-700 px-4 py-2 font-bold text-white shadow-xs hover:bg-amber-800 text-xs"
                        >
                          Mark Ready
                        </button>
                      )}
                      {selectedOrder.status === "Ready for Pickup" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(selectedOrder.id || selectedOrder._id, "Completed")}
                          className="rounded-xl bg-emerald-700 px-4 py-2 font-bold text-white shadow-xs hover:bg-emerald-800 text-xs"
                        >
                          Mark Completed
                        </button>
                      )}
                    </>
                  ) : (
                    selectedOrder.status === "Quote Received" && (
                      <button
                        type="button"
                        onClick={() => acceptQuote(selectedOrder.id || selectedOrder._id)}
                        className="rounded-xl bg-[#8f2338] px-5 py-2 font-bold text-white shadow-xs hover:bg-[#781c2e] text-xs"
                      >
                        Accept Quote
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            ORDER-LINKED CHAT DRAWER / MODAL
        ========================================================== */}
        {chatOrder && (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs transition-opacity"
            onClick={(e) => {
              if (e.target === e.currentTarget) setChatOrder(null);
            }}
          >
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl transition-all flex flex-col h-[600px] max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#8f2338]">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3 className="font-sans text-base font-bold text-stone-900 leading-tight">
                      Order Conversation #{chatOrder.id}
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      {chatOrder.garment || chatOrder.category} · {isTailor ? (chatOrder.clientName || "Client") : (chatOrder.tailorName || "Artisan Workshop")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setChatOrder(null)}
                  className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-2 my-3 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-xs text-stone-400">
                    Loading messages...
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-stone-400 space-y-1">
                    <MessageSquare size={32} className="text-stone-300 mb-1" />
                    <p className="text-xs font-bold text-stone-700">No messages yet</p>
                    <p className="text-[11px]">Send a message to coordinate design specifications, fabric samples, or fittings.</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => {
                    const isMe = msg.senderClerkUserId === user?.id || msg.senderClerkUserId === profile?.clerkUserId;
                    const isSystem = msg.messageType === 'system' || msg.senderRole === 'system';
                    const isMilestone = msg.messageType === 'milestone_update' || msg.messageType === 'status_update';

                    if (isSystem || isMilestone) {
                      return (
                        <div key={msg._id || idx} className="rounded-xl bg-amber-50/80 border border-amber-200/60 p-2.5 text-center text-xs text-amber-900">
                          <span className="font-bold block text-[10px] text-amber-700 uppercase tracking-wider">Platform Event</span>
                          <p className="mt-0.5 leading-snug">{msg.content}</p>
                          <span className="text-[10px] text-stone-400 font-mono block mt-1">
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-bold text-stone-600">
                            {isMe ? 'You' : msg.senderName || msg.senderRole}
                          </span>
                          <span className="text-[9px] text-stone-400">
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs max-w-[85%] leading-relaxed ${
                            isMe
                              ? 'bg-[#8f2338] text-white rounded-tr-none'
                              : 'bg-stone-100 text-stone-800 rounded-tl-none border border-stone-200/60'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="border-t border-stone-100 pt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type a message or milestone question..."
                  className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs outline-none focus:border-[#8f2338] focus:bg-white transition"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !newMessageText.trim()}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#8f2338] hover:bg-[#761c30] text-white px-4 py-2.5 text-xs font-bold shadow-xs transition disabled:opacity-40 cursor-pointer"
                >
                  <Send size={13} />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            TAILOR PRODUCTION MILESTONE MODAL
        ========================================================== */}
        {milestoneOrder && (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs transition-opacity"
            onClick={(e) => {
              if (e.target === e.currentTarget) setMilestoneOrder(null);
            }}
          >
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl transition-all">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Scissors size={18} />
                  </div>
                  <div>
                    <h3 className="font-sans text-base font-bold text-stone-900 leading-tight">
                      Production Milestone Stage
                    </h3>
                    <p className="text-xs text-stone-400">Order #{milestoneOrder.id}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMilestoneOrder(null)}
                  className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block text-xs font-bold text-stone-700">Select Production Milestone:</label>
                <select
                  value={selectedMilestone}
                  onChange={(e) => setSelectedMilestone(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs font-semibold text-stone-800 outline-none focus:border-[#8f2338] focus:bg-white"
                >
                  <option value="not_started">Not Started</option>
                  <option value="measurements_pending">Measurements Pending</option>
                  <option value="design_approval_pending">Design Approval Pending</option>
                  <option value="materials_pending">Materials / Fabric Procurement</option>
                  <option value="cutting">Fabric Cutting</option>
                  <option value="stitching">Artisan Stitching</option>
                  <option value="quality_check">Quality Check & Finishing</option>
                  <option value="ready_for_delivery">Ready for Delivery / Pickup</option>
                  <option value="delivered">Delivered to Client</option>
                </select>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Production Notes (Optional):</label>
                  <textarea
                    rows={3}
                    value={milestoneNote}
                    onChange={(e) => setMilestoneNote(e.target.value)}
                    placeholder="e.g. Fabric washed and pressed. Cutting commences tomorrow morning."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
                <button
                  type="button"
                  onClick={() => setMilestoneOrder(null)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updatingMilestone}
                  onClick={handleUpdateMilestone}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 text-xs font-bold shadow-xs transition"
                >
                  <Check size={14} />
                  <span>{updatingMilestone ? "Updating..." : "Update Milestone"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
