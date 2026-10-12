import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  Scissors,
  Layers,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Pencil,
  Trash2,
  Eye,
  Send,
  FileText,
  Phone,
  Mail,
  Globe,
  Award,
  Sparkles,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  Package,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import TailorAvatar from "../components/common/TailorAvatar";

const CATEGORIES = [
  "Corporate Uniforms",
  "School Uniforms",
  "Hospitality & Hotel Wear",
  "Workwear & Industrial Safety",
  "Hospital & Healthcare Scrubs",
  "Bridal & Festive Bulk",
  "Custom Merch & Casual Wear",
  "Other Apparel Demand",
];

export default function Bulk() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded, profile, getToken, openSignIn } = useAuth();

  const userRole = (profile?.role || "customer").toLowerCase();
  const isBusiness = userRole === "business";
  const isTailor = userRole === "tailor";
  const isAdmin = userRole === "admin";
  const isAllowed = isBusiness || isTailor || isAdmin;

  // Data states
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [businessProfile, setBusinessProfile] = useState(null);
  const [allBusinesses, setAllBusinesses] = useState([]);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState(isTailor ? "market" : isBusiness ? "mine" : "all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [viewingRequestQuotes, setViewingRequestQuotes] = useState(null);
  const [quotingRequest, setQuotingRequest] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Forms
  const [tenderForm, setTenderForm] = useState({
    title: "",
    organisation: "",
    category: "Corporate Uniforms",
    requirement: "",
    quantity: 100,
    unitBudget: "",
    estBudget: "",
    timeline: "30 Days",
    city: "Jaipur",
    sampleRequired: true,
    notes: "",
  });

  const [quoteForm, setQuoteForm] = useState({
    pricePerUnit: "",
    leadTimeDays: 14,
    sampleOffered: true,
    notes: "",
  });

  const [verifyForm, setVerifyForm] = useState({
    companyName: "",
    gstin: "",
    businessType: "Corporate Enterprise",
    panNumber: "",
    website: "",
    address: "",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "",
    contactPerson: "",
    contactPhone: "",
    documentUrl: "",
  });

  // Load Data
  const loadData = async () => {
    if (!isSignedIn) return;
    try {
      setLoading(true);
      setLoadError("");
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Load Requests
      const reqRes = await fetch("/api/business-requests", { headers });
      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(data);
      } else {
        const err = await reqRes.json().catch(() => ({}));
        setLoadError(err.error || "Failed to load requirements");
      }

      // If business, load business profile
      if (isBusiness || isAdmin) {
        const bpRes = await fetch("/api/business/profile", { headers });
        if (bpRes.ok) {
          const bpData = await bpRes.json();
          setBusinessProfile(bpData.businessProfile);
          if (bpData.businessProfile) {
            setVerifyForm((prev) => ({
              ...prev,
              ...bpData.businessProfile,
              companyName: bpData.businessProfile.companyName || "",
            }));
          }
        }
      }

      // If admin, load business accounts for verification queue
      if (isAdmin) {
        const adminBizRes = await fetch("/api/admin/businesses", { headers });
        if (adminBizRes.ok) {
          setAllBusinesses(await adminBizRes.json());
        }
      }
    } catch (err) {
      setLoadError(err.message || "Failed to communicate with server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      loadData();
    }
  }, [isSignedIn, userRole]);

  // Derived metrics
  const myRequests = useMemo(
    () => requests.filter((r) => r.isOwner || r.clerkUserId === profile?.id),
    [requests, profile]
  );

  const marketRequests = useMemo(
    () => requests.filter((r) => ["open", "submitted", "reviewing", "quoted"].includes(r.status)),
    [requests]
  );

  const awardedRequests = useMemo(
    () => requests.filter((r) => r.isAwardedToMe || r.status === "awarded"),
    [requests]
  );

  const myBidsRequests = useMemo(
    () => requests.filter((r) => r.hasMyQuote || Boolean(r.myQuote)),
    [requests]
  );

  const pendingBusinesses = useMemo(
    () => allBusinesses.filter((b) => b.verificationStatus === "pending"),
    [allBusinesses]
  );

  const filteredList = useMemo(() => {
    let list = requests;
    if (activeTab === "mine") {
      list = myRequests;
    } else if (activeTab === "market") {
      list = marketRequests;
    } else if (activeTab === "awarded") {
      list = awardedRequests;
    } else if (activeTab === "mybids") {
      list = myBidsRequests;
    }

    if (selectedCategory !== "all") {
      list = list.filter((r) => r.category === selectedCategory);
    }
    if (selectedStatus !== "all") {
      list = list.filter((r) => r.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.organisation?.toLowerCase().includes(q) ||
          r.requirement?.toLowerCase().includes(q) ||
          r.city?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [requests, activeTab, myRequests, marketRequests, awardedRequests, myBidsRequests, selectedCategory, selectedStatus, searchQuery]);

  // Handlers for Requirements
  const handleOpenPostModal = (reqToEdit = null) => {
    if (reqToEdit) {
      setEditingRequest(reqToEdit);
      setTenderForm({
        title: reqToEdit.title || "",
        organisation: reqToEdit.organisation || "",
        category: reqToEdit.category || "Corporate Uniforms",
        requirement: reqToEdit.requirement || "",
        quantity: reqToEdit.quantity || 100,
        unitBudget: reqToEdit.unitBudget || "",
        estBudget: reqToEdit.estBudget || "",
        timeline: reqToEdit.timeline || "30 Days",
        city: reqToEdit.city || "Jaipur",
        sampleRequired: reqToEdit.sampleRequired !== false,
        notes: reqToEdit.notes || "",
      });
    } else {
      setEditingRequest(null);
      setTenderForm({
        title: "",
        organisation: businessProfile?.companyName || profile?.firstName ? `${profile.firstName}'s Enterprise` : "",
        category: "Corporate Uniforms",
        requirement: "",
        quantity: 100,
        unitBudget: "",
        estBudget: "",
        timeline: "30 Days",
        city: businessProfile?.city || "Jaipur",
        sampleRequired: true,
        notes: "",
      });
    }
    setIsPostModalOpen(true);
  };

  const handleSubmitTender = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAction(true);
      const token = await getToken();
      const url = editingRequest ? `/api/business-requests/${editingRequest._id}` : "/api/business-requests";
      const method = editingRequest ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(tenderForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save requirement");

      toast.success(editingRequest ? "Tender requirement updated." : "Bulk tender published to artisans!");
      setIsPostModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDeleteRequest = async (reqItem) => {
    if (!window.confirm(`Delete requirement "${reqItem.title || reqItem.requirement}"?`)) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/business-requests/${reqItem._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
      toast.success("Requirement removed.");
      if (viewingRequestQuotes?._id === reqItem._id) setViewingRequestQuotes(null);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handlers for Tailor Quotations
  const handleOpenQuotationModal = (reqItem) => {
    setQuotingRequest(reqItem);
    if (reqItem.myQuote) {
      setQuoteForm({
        pricePerUnit: reqItem.myQuote.pricePerUnit || "",
        leadTimeDays: reqItem.myQuote.leadTimeDays || 14,
        sampleOffered: reqItem.myQuote.sampleOffered !== false,
        notes: reqItem.myQuote.notes || "",
      });
    } else {
      setQuoteForm({
        pricePerUnit: reqItem.unitBudget || "",
        leadTimeDays: 14,
        sampleOffered: true,
        notes: "",
      });
    }
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!quotingRequest) return;
    try {
      setSubmittingAction(true);
      const token = await getToken();
      const pricePerUnit = Number(quoteForm.pricePerUnit);
      const totalAmount = pricePerUnit * (quotingRequest.quantity || 1);

      const res = await fetch(`/api/business-requests/${quotingRequest._id}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          pricePerUnit,
          totalAmount,
          leadTimeDays: Number(quoteForm.leadTimeDays),
          sampleOffered: Boolean(quoteForm.sampleOffered),
          notes: quoteForm.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit quote");

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      toast.success(data.message || "Quotation sent to client!");
      setQuotingRequest(null);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handlers for Quote Moderation (Accept / Shortlist / Reject)
  const handleUpdateQuoteStatus = async (requestId, quoteId, status) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/business-requests/${requestId}/quotes/${quoteId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update quotation");

      if (status === "accepted") {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        toast.success(data.message || "Tender successfully awarded! Confirmed bulk order created.");
      } else {
        toast.info(`Quotation marked as ${status}.`);
      }

      loadData();
      // Update local viewing state
      if (viewingRequestQuotes?._id === requestId) {
        setViewingRequestQuotes((prev) => ({
          ...prev,
          quotes: prev.quotes.map((q) => (q._id === quoteId ? { ...q, status } : q)),
          status: status === "accepted" ? "awarded" : prev.status,
          awardedOrderId: data.order?._id || data.orderId || prev.awardedOrderId,
        }));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handlers for Business Verification
  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAction(true);
      const token = await getToken();
      const res = await fetch("/api/business/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...verifyForm, submitForAudit: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification submission failed");

      toast.success("Business credentials submitted for administrative audit!");
      setIsVerificationModalOpen(false);
      setBusinessProfile(data.businessProfile);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Admin Verification of Businesses
  const handleAdminVerifyBusiness = async (bizId, approve = true) => {
    try {
      const token = await getToken();
      const endpoint = approve ? "verify" : "reject";
      const res = await fetch(`/api/admin/businesses/${bizId}/${endpoint}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: approve ? "Approved" : "Incomplete or unverifiable GSTIN" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      toast.success(approve ? "Business verified successfully!" : "Business verification rejected.");
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // RENDER CUSTOMER ACCESS GATEWAY
  if (!isLoaded || (isSignedIn && !isAllowed)) {
    return (
      <div className="min-h-screen bg-[#faf9f6] text-[#172033] flex flex-col font-sans antialiased">
        <Navbar />
        <main className="mx-auto flex-1 max-w-4xl px-4 py-16 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs mb-6">
            <Building2 size={32} />
          </div>
          <span className="rounded-full bg-amber-100 text-amber-900 px-3.5 py-1 text-xs font-bold tracking-wide uppercase">
            B2B Commercial & Institutional Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-4 tracking-tight">
            Commercial Apparel Tenders & Sourcing
          </h1>
          <p className="mt-3 text-stone-600 max-w-xl text-sm sm:text-base leading-relaxed">
            The <code>/bulk</code> platform is exclusively configured for institutional corporate buyers, certified tailor workshops, and platform administrators.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {!isSignedIn ? (
              <button
                onClick={openSignIn}
                className="rounded-xl bg-[#8f2338] text-white px-6 py-3 text-xs sm:text-sm font-bold shadow-xs hover:bg-[#761c30] transition"
              >
                Sign In as Business or Atelier
              </button>
            ) : (
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-xl bg-[#8f2338] text-white px-6 py-3 text-xs sm:text-sm font-bold shadow-xs hover:bg-[#761c30] transition"
              >
                Go to Account & Switch Role
              </button>
            )}
            <Link
              to="/"
              className="rounded-xl border border-stone-200 bg-white text-stone-700 px-6 py-3 text-xs sm:text-sm font-semibold hover:bg-stone-50 transition"
            >
              Return to Homepage
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isBizVerified = businessProfile?.verificationStatus === "verified" || businessProfile?.verified;
  const isBizPending = businessProfile?.verificationStatus === "pending";

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#172033] flex flex-col font-sans antialiased">
      <Navbar />

      {/* MAIN CONTAINER */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* PAGE HEADER */}
        <section className="relative isolate overflow-hidden rounded-[28px] border border-stone-200/90 bg-white shadow-sm">
          <div className="grid md:grid-cols-[1.1fr_.9fr]">
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          {/* Left: Module Title */}
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8f2338]">
                <Layers size={15} />
                <span>{isAdmin ? "Admin workspace" : isTailor ? "Artisan marketplace" : "For businesses"}</span>
              </div>
              <h1 className="mt-3 max-w-xl text-2xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
                Bulk apparel, made with care.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">
                Bring larger clothing orders to skilled ateliers. Compare requirements, timelines and quotations in one place.
              </p>
          {/* Right: Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
            {(isBusiness || isAdmin) && (
              <button
                type="button"
                onClick={() => handleOpenPostModal()}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#8f2338] hover:bg-[#761c30] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Post Requirement</span>
              </button>
            )}

            {isBusiness && (
              <button
                type="button"
                onClick={() => setIsVerificationModalOpen(true)}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold border transition cursor-pointer ${
                  isBizVerified
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : isBizPending
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                }`}
              >
                <ShieldCheck size={14} className={isBizVerified ? "text-emerald-600" : "text-amber-500"} />
                <span>{isBizVerified ? "Verified GSTIN" : isBizPending ? "Audit Pending" : "Verify Business"}</span>
              </button>
            )}
          </div>
            </div>
            <div className="relative min-h-56 overflow-hidden md:min-h-[20rem]">
              <img
                src="/assets/hero-atelier.jpg"
                alt="A local tailor carefully working with fabric in a bright atelier"
                className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:via-transparent md:to-white/10" />
              <div className="absolute bottom-4 left-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-800 shadow-sm backdrop-blur-sm sm:bottom-6 sm:left-6">
                Thoughtful craft, at every scale
              </div>
            </div>
          </div>
        </section>
        {/* 1. BUSINESS VERIFICATION BANNER (FOR BUSINESS ACCOUNTS) */}
        {isBusiness && !isBizVerified && (
          <div
            className={`rounded-3xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
              isBizPending
                ? "bg-amber-50/70 border-amber-200/90 text-amber-950"
                : "bg-white border-stone-200 text-stone-800"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  isBizPending ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-700"
                }`}
              >
                {isBizPending ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {isBizPending
                    ? "Business GSTIN Verification Audit in Progress"
                    : "Complete Business Verification to Unlock Verified Enterprise Badge"}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {isBizPending
                    ? "Mera Tailor compliance team is verifying your registered company GSTIN. You can still post requirements, and certified ateliers can quote."
                    : "Industry standard buyer verification boosts confidence, accelerating quotations from India's top ateliers."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsVerificationModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-900 hover:bg-stone-50 transition self-start sm:self-auto cursor-pointer"
            >
              <span>{isBizPending ? "View Application" : "Submit GSTIN Details"}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* 2. ADMIN VERIFICATION QUEUE CALLOUT (IF ADMIN) */}
        {isAdmin && pendingBusinesses.length > 0 && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200/70">
              <div className="flex items-center gap-2.5">
                <ShieldAlert size={18} className="text-rose-600" />
                <h3 className="text-sm font-bold text-rose-950">
                  Business Verification Requests ({pendingBusinesses.length})
                </h3>
              </div>
              <span className="text-xs text-rose-700 font-medium">Industry Standard Compliance Audit</span>
            </div>

            <div className="mt-3 divide-y divide-rose-100">
              {pendingBusinesses.map((biz) => (
                <div key={biz.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">
                        {biz.businessProfile?.companyName || "Company"}
                      </span>
                      <span className="rounded-md bg-stone-100 text-stone-700 px-2 py-0.5 text-[10px] font-mono font-bold">
                        GST: {biz.businessProfile?.gstin || "N/A"}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {biz.businessProfile?.businessType || "Enterprise"} • {biz.businessProfile?.city || "Jaipur"} • Contact: {biz.businessProfile?.contactPerson || biz.name} ({biz.email})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAdminVerifyBusiness(biz.id, false)}
                      title="Reject Business Audit"
                      className="h-8 w-8 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 flex items-center justify-center transition cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdminVerifyBusiness(biz.id, true)}
                      title="Approve Business GSTIN"
                      className="h-8 w-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-2xs transition cursor-pointer"
                    >
                      <Check size={14} strokeWidth={2.4} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. TABS & FILTER BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Scope Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 border border-stone-200/80 w-fit">
            {(isBusiness || isAdmin) && (
              <button
                type="button"
                onClick={() => setActiveTab("mine")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "mine"
                    ? "bg-white text-stone-900 shadow-2xs"
                    : "text-stone-600 hover:text-stone-950"
                }`}
              >
                My Requirements ({myRequests.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab("market")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "market"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              Active Market Tenders ({marketRequests.length})
            </button>
            {isTailor && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("mybids")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "mybids"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-600 hover:text-stone-950"
                  }`}
                >
                  My Bids ({myBidsRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("awarded")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "awarded"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-emerald-800 hover:text-emerald-950"
                  }`}
                >
                  <Award size={13} />
                  <span>Awarded Contracts ({awardedRequests.length})</span>
                </button>
              </>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "all"
                    ? "bg-white text-stone-900 shadow-2xs"
                    : "text-stone-600 hover:text-stone-950"
                }`}
              >
                All Platform Tenders ({requests.length})
              </button>
            )}
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3.5 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tender, firm or city..."
                className="w-full rounded-xl border border-stone-200/90 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-stone-400"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-stone-200 bg-white py-1.5 px-3 text-xs font-semibold text-stone-700 outline-none cursor-pointer"
            >
              <option value="all">All Apparel Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-stone-200 bg-white py-1.5 px-3 text-xs font-semibold text-stone-700 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="reviewing">Reviewing</option>
              <option value="awarded">Awarded</option>
              <option value="in-production">In Production</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* 4. REQUIREMENTS LIST / GRID */}
        {loadError && !loading && (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between">
            <span>{loadError}</span>
            <button type="button" onClick={loadData} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 font-semibold text-rose-900 hover:bg-rose-100">
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        )}
        {loading ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-stone-400" />
            <span>Loading commercial apparel tenders...</span>
          </div>
        ) : loadError ? null : filteredList.length === 0 ? (
          <div className="rounded-3xl border border-stone-200/80 bg-white p-12 text-center shadow-2xs my-4 max-w-xl mx-auto">
            <div className="h-16 w-16 mx-auto rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <Layers size={28} />
            </div>
            <h3 className="text-base font-bold text-stone-900">No matching tenders found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              There are no active requirements matching your selected filters. Adjust your search parameters or publish a new requirement.
            </p>
            {(isBusiness || isAdmin) && (
              <button
                type="button"
                onClick={() => handleOpenPostModal()}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] text-white px-4 py-2 text-xs font-bold hover:bg-[#761c30] transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Post Requirement</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredList.map((item) => {
              const isOwner = item.isOwner || item.clerkUserId === profile?.id;
              const hasMyQuote = Boolean(item.myQuote);
              const quotesCount = item.quotesCount ?? (item.quotes?.length || 0);

              return (
                <div
                  key={item._id}
                  className="group rounded-3xl border border-stone-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-stone-300 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badges & Status */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="rounded-lg bg-stone-100 text-stone-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                        {item.category || "Apparel"}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                          item.status === "awarded"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "reviewing"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Awarded / Winner Banner */}
                    {item.isAwardedToMe && (
                      <div className="mb-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-3 text-white shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award size={18} className="text-amber-300 shrink-0" />
                          <div>
                            <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-100">
                              Official Contract Awarded
                            </span>
                            <span className="text-xs font-bold">You Won This Tender!</span>
                          </div>
                        </div>
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                          Confirmed
                        </span>
                      </div>
                    )}

                    {/* Title & Organisation */}
                    <h3 className="text-base font-bold text-stone-900 leading-snug line-clamp-2">
                      {item.title || `${item.quantity} Units ${item.category}`}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-600 font-medium">
                      <Building2 size={13} className="text-stone-400" />
                      <span>{item.organisation}</span>
                    </div>

                    <p className="text-xs text-stone-500 mt-2.5 line-clamp-3 leading-relaxed">
                      {item.requirement}
                    </p>

                    {/* Key Metrics Chips */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-stone-50 p-2 border border-stone-100">
                        <span className="text-[10px] text-stone-400 block font-semibold uppercase">Quantity</span>
                        <span className="font-bold text-stone-900 font-mono text-sm">
                          {item.quantity.toLocaleString()} pcs
                        </span>
                      </div>
                      <div className="rounded-xl bg-stone-50 p-2 border border-stone-100">
                        <span className="text-[10px] text-stone-400 block font-semibold uppercase">Target Budget</span>
                        <span className="font-bold text-stone-900 font-mono text-sm">
                          {item.unitBudget ? `₹${item.unitBudget}/pc` : item.estBudget ? `₹${item.estBudget.toLocaleString()}` : "Market Quotes"}
                        </span>
                      </div>
                    </div>

                    {/* Location & Delivery Info */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#8f2338]" />
                        <span>{item.city || "Jaipur"}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-stone-400" />
                        <span>{item.timeline || "30 Days"}</span>
                      </span>
                    </div>

                    {/* Tailor's Own Quote Badge if already submitted */}
                    {isTailor && hasMyQuote && (
                      <div className="mt-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-950 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-emerald-800 block text-[11px]">Your Submitted Bid:</span>
                          <span className="font-mono font-bold text-xs">
                            ₹{item.myQuote.pricePerUnit}/pc (Total: ₹{item.myQuote.totalAmount?.toLocaleString()})
                          </span>
                        </div>
                        <span className="rounded-full bg-emerald-200/60 text-emerald-900 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                          {item.myQuote.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between gap-2">
                    {/* Left: Quotes Counter or Status */}
                    <div className="flex items-center gap-1.5 text-xs text-stone-600">
                      <span className="font-bold text-stone-900">{quotesCount}</span>
                      <span className="text-stone-400">{quotesCount === 1 ? "Quote" : "Quotes"}</span>
                    </div>

                    {/* Right: Role specific action buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Tailor Action: Quote or Edit Quote */}
                      {isTailor && (
                        item.isAwardedToMe ? (
                          <Link
                            to={`/dashboard?tab=orders&orderId=${(typeof item.awardedOrderId === 'object' && item.awardedOrderId?._id) ? item.awardedOrderId._id : (item.awardedOrderId || item._id)}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 px-3 py-1.5 text-xs font-bold transition shadow-2xs"
                          >
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            <span>Contract Won · View Order</span>
                          </Link>
                        ) : item.status === "awarded" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 text-stone-500 px-3 py-1.5 text-xs font-medium">
                            <span>Tender Closed</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenQuotationModal(item)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] hover:bg-[#761c30] text-white px-3.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                          >
                            <Send size={12} />
                            <span>{hasMyQuote ? "Update Bid" : "Quote"}</span>
                          </button>
                        )
                      )}

                      {/* Business Owner / Admin Actions */}
                      {(isOwner || isAdmin) && (
                        <>
                          {item.status === "awarded" && (
                            <Link
                              to={`/dashboard?tab=orders&orderId=${(typeof item.awardedOrderId === 'object' && item.awardedOrderId?._id) ? item.awardedOrderId._id : (item.awardedOrderId || item._id)}`}
                              title="Track Manufacturing Order & Milestones"
                              className="h-8 px-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                            >
                              <Package size={13} className="text-emerald-600" />
                              <span>View Order</span>
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => setViewingRequestQuotes(item)}
                            title="Inspect Quotes"
                            className="h-8 px-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Bids ({quotesCount})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenPostModal(item)}
                            title="Edit Requirement"
                            className="h-8 w-8 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 flex items-center justify-center transition cursor-pointer"
                          >
                            <Pencil size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(item)}
                            title="Delete Requirement"
                            className="h-8 w-8 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL 1: POST OR EDIT REQUIREMENT
      ========================================================================== */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[#8f2338]" />
                <h3 className="font-bold text-stone-900 text-base">
                  {editingRequest ? "Edit Tender Requirement" : "Publish Bulk Requirement / RFQ"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitTender} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Requirement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 Poly-Viscose Corporate Blazers"
                  value={tenderForm.title}
                  onChange={(e) => setTenderForm({ ...tenderForm, title: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50 focus:bg-white focus:border-stone-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Company / Institution Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Hospitality Group"
                    value={tenderForm.organisation}
                    onChange={(e) => setTenderForm({ ...tenderForm, organisation: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50 focus:bg-white focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Apparel Category</label>
                  <select
                    value={tenderForm.category}
                    onChange={(e) => setTenderForm({ ...tenderForm, category: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50 focus:bg-white focus:border-stone-400 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Quantity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    max="500000"
                    required
                    value={tenderForm.quantity}
                    onChange={(e) => setTenderForm({ ...tenderForm, quantity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50 focus:bg-white focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Target Budget (₹/pc)</label>
                  <input
                    type="number"
                    placeholder="e.g. 650"
                    value={tenderForm.unitBudget}
                    onChange={(e) => setTenderForm({ ...tenderForm, unitBudget: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50 focus:bg-white focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Delivery City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur"
                    value={tenderForm.city}
                    onChange={(e) => setTenderForm({ ...tenderForm, city: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50 focus:bg-white focus:border-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Garment Specifications & Detailed Requirements</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify fabric blend (e.g. 70/30 poly-viscose), stitching gauge, sizes breakdown (S/M/L/XL), lining, branding embroidery..."
                  value={tenderForm.requirement}
                  onChange={(e) => setTenderForm({ ...tenderForm, requirement: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50 focus:bg-white focus:border-stone-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sampleRequired"
                  checked={tenderForm.sampleRequired}
                  onChange={(e) => setTenderForm({ ...tenderForm, sampleRequired: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#8f2338] cursor-pointer"
                />
                <label htmlFor="sampleRequired" className="font-semibold text-stone-700 cursor-pointer">
                  Require initial master prototype / sample piece before bulk production
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="rounded-xl bg-[#8f2338] text-white px-5 py-2 font-bold hover:bg-[#761c30] shadow-2xs transition cursor-pointer"
                >
                  {submittingAction ? "Publishing..." : editingRequest ? "Update Tender" : "Publish Tender"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: TAILOR SUBMIT / UPDATE QUOTATION
      ========================================================================== */}
      {quotingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Scissors size={18} className="text-[#8f2338]" />
                <h3 className="font-bold text-stone-900 text-base">Submit Atelier Bid / Quotation</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuotingRequest(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Requirement Summary Card */}
            <div className="mt-3 p-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs">
              <span className="font-bold text-stone-900 block">{quotingRequest.title || quotingRequest.requirement}</span>
              <div className="flex items-center gap-3 mt-1 text-stone-500">
                <span>Buyer: {quotingRequest.organisation}</span>
                <span>•</span>
                <span>Volume: {quotingRequest.quantity} pcs</span>
                <span>•</span>
                <span>Destination: {quotingRequest.city}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitQuote} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Your Price Per Unit (₹/pc)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 520"
                    value={quoteForm.pricePerUnit}
                    onChange={(e) => setQuoteForm({ ...quoteForm, pricePerUnit: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50 focus:bg-white focus:border-stone-400 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Turnaround Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 15"
                    value={quoteForm.leadTimeDays}
                    onChange={(e) => setQuoteForm({ ...quoteForm, leadTimeDays: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50 focus:bg-white focus:border-stone-400 font-mono text-sm"
                  />
                </div>
              </div>

              {/* Real-time Order Value Calculation */}
              {quoteForm.pricePerUnit && (
                <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-3 text-xs flex items-center justify-between">
                  <span className="text-stone-600 font-medium">Estimated Total Tender Value:</span>
                  <span className="text-base font-bold text-stone-900 font-mono">
                    ₹{(Number(quoteForm.pricePerUnit) * quotingRequest.quantity).toLocaleString()}
                  </span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Proposal Details & Fabric Guarantee</label>
                <textarea
                  rows={3}
                  placeholder="Detail your atelier's fabric sourcing options, sample turnaround, stitching finish, and quality assurances..."
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50 focus:bg-white focus:border-stone-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sampleOffered"
                  checked={quoteForm.sampleOffered}
                  onChange={(e) => setQuoteForm({ ...quoteForm, sampleOffered: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#8f2338] cursor-pointer"
                />
                <label htmlFor="sampleOffered" className="font-semibold text-stone-700 cursor-pointer">
                  Will provide initial sample prototype prior to full production run
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuotingRequest(null)}
                  className="rounded-xl border border-stone-200 px-4 py-2 font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="rounded-xl bg-[#8f2338] text-white px-5 py-2 font-bold hover:bg-[#761c30] shadow-2xs transition cursor-pointer"
                >
                  {submittingAction ? "Submitting..." : "Send Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: VIEW & AWARD QUOTATIONS DRAWER / MODAL
      ========================================================================== */}
      {viewingRequestQuotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f2338]">Tender Bids Inspection</span>
                <h3 className="font-bold text-stone-900 text-base">
                  {viewingRequestQuotes.title || viewingRequestQuotes.organisation}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingRequestQuotes(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4">
              {(!viewingRequestQuotes.quotes || viewingRequestQuotes.quotes.length === 0) ? (
                <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center text-xs text-stone-500">
                  <Scissors size={24} className="mx-auto text-stone-300 mb-2" />
                  <span>No ateliers have quoted on this tender yet. Registered tailor workshops will submit bids shortly.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {viewingRequestQuotes.quotes.map((quote) => {
                    const isAccepted = quote.status === "accepted";
                    return (
                      <div
                        key={quote._id}
                        className={`rounded-2xl p-4 border transition ${
                          isAccepted
                            ? "border-emerald-300 bg-emerald-50/60 shadow-2xs"
                            : "border-stone-200 bg-white"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <TailorAvatar
                              image={quote.tailorImage}
                              name={quote.tailorName}
                              size="sm"
                              rounded="rounded-xl"
                              alt={quote.tailorName}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-stone-900">{quote.tailorName}</span>
                                {quote.tailorVerified && (
                                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.2 text-[9px] font-bold">
                                    ✓ Verified Atelier
                                  </span>
                                )}
                                <span
                                  className={`rounded-full px-2 py-0.2 text-[9px] font-bold capitalize ${
                                    quote.status === "accepted"
                                      ? "bg-emerald-600 text-white"
                                      : quote.status === "rejected"
                                      ? "bg-stone-200 text-stone-600"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {quote.status}
                                </span>
                              </div>
                            <span className="text-xs text-stone-500 mt-0.5 block">
                              {quote.tailorCity || "Jaipur"} • Lead Time: {quote.leadTimeDays || 14} days {quote.sampleOffered ? "• Free Sample Prototype" : ""}
                            </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-extrabold text-stone-900 font-mono block">
                              ₹{quote.pricePerUnit}/pc
                            </span>
                            <span className="text-[11px] text-stone-500 font-mono">
                              Total: ₹{quote.totalAmount?.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {quote.notes && (
                          <p className="mt-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                            "{quote.notes}"
                          </p>
                        )}

                        {/* Business Owner Actions */}
                        {viewingRequestQuotes.status !== "awarded" && quote.status !== "accepted" && (
                          <div className="mt-3 pt-2 border-t border-stone-100 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuoteStatus(viewingRequestQuotes._id, quote._id, "rejected")}
                              className="rounded-lg border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuoteStatus(viewingRequestQuotes._id, quote._id, "accepted")}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1 text-xs font-bold shadow-2xs transition cursor-pointer"
                            >
                              Accept & Award Tender
                            </button>
                          </div>
                        )}

                        {quote.status === "accepted" && (
                          <div className="mt-3 pt-2.5 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                              <span>Tender Awarded · Production Order Created</span>
                            </span>
                            <Link
                              to="/orders?type=bulk"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
                            >
                              <Package size={13} />
                              <span>Track Order & Milestones</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: BUSINESS VERIFICATION AUDIT (GSTIN)
      ========================================================================== */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <h3 className="font-bold text-stone-900 text-base">Business Credential Audit (GSTIN)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVerificationModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-stone-500 mt-2">
              Industry standard validation safeguards bulk procurement transactions and enables high-volume manufacturing lines.
            </p>

            <form onSubmit={handleSubmitVerification} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Company / Legal Entity Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Heritage Textiles Pvt Ltd"
                    value={verifyForm.companyName}
                    onChange={(e) => setVerifyForm({ ...verifyForm, companyName: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">GSTIN (15 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="08AAACH7409R1ZZ"
                    value={verifyForm.gstin}
                    onChange={(e) => setVerifyForm({ ...verifyForm, gstin: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Enterprise Sector / Type</label>
                  <select
                    value={verifyForm.businessType}
                    onChange={(e) => setVerifyForm({ ...verifyForm, businessType: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50 cursor-pointer"
                  >
                    <option value="Corporate Enterprise">Corporate Enterprise</option>
                    <option value="Educational Institution">Educational Institution / School</option>
                    <option value="Hospitality & Hotel Chain">Hospitality & Hotel Chain</option>
                    <option value="Fashion Label / Designer">Fashion Label / Designer</option>
                    <option value="Garment Retailer / Distributor">Garment Retailer / Distributor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="AAACH7409R"
                    value={verifyForm.panNumber}
                    onChange={(e) => setVerifyForm({ ...verifyForm, panNumber: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Contact Officer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={verifyForm.contactPerson}
                    onChange={(e) => setVerifyForm({ ...verifyForm, contactPerson: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Official Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={verifyForm.contactPhone}
                    onChange={(e) => setVerifyForm({ ...verifyForm, contactPhone: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Registered Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plot 42, Sitapura Industrial Area"
                    value={verifyForm.address}
                    onChange={(e) => setVerifyForm({ ...verifyForm, address: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={verifyForm.city}
                    onChange={(e) => setVerifyForm({ ...verifyForm, city: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="rounded-xl bg-[#8f2338] text-white px-5 py-2 font-bold hover:bg-[#761c30] shadow-2xs transition cursor-pointer"
                >
                  {submittingAction ? "Submitting..." : "Submit for Admin Audit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
