import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  User,
  UserRound,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Ruler,
  Scissors,
  ShoppingBag,
  Bookmark,
  Sparkles,
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ExternalLink,
  Globe,
  Sliders,
  Building2,
  Tag,
  Search,
  ArrowRight,
  ChevronRight,
  Info,
  ShieldCheck,
  Layers,
  FileText,
  Activity,
  Package,
  Star,
  TrendingUp,
  DollarSign,
  Heart,
  Home,
  Settings,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminPortal from "./AdminPortal";
import TailorAvatar from "../components/common/TailorAvatar";
import { PageContentSkeleton } from "../components/common/DashboardSkeleton";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const emptyMeasurement = {
  name: "",
  garment: "Shirt",
  values: { chest: "", waist: "", hip: "", shoulder: "", sleeve: "", length: "" },
};

const measurementFields = ["chest", "waist", "hip", "shoulder", "sleeve", "length"];

const garmentPresets = [
  "Shirt",
  "Pants",
  "Suit / Blazer",
  "Kurti",
  "Lehenga",
  "Blouse",
  "Dress",
  "Sherwani",
  "Alteration",
];

const categoryOptions = [
  "Shirt",
  "Pants",
  "Dress",
  "Suit",
  "Ethnic Wear",
  "Alteration",
];

const orderProgressPercent = {
  "Request Sent": 25,
  "Quote Received": 45,
  Accepted: 60,
  "In Production": 80,
  "Ready for Pickup": 95,
  Completed: 100,
  Cancelled: 100,
};

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { isSignedIn, user, profile, profileError, getToken, openSignUp, refreshProfile } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab:
  // For tailor: 'overview' | 'orders' | 'studio' | 'bulk' | 'profile'
  // For customer: 'overview' | 'orders' | 'measurements' | 'saved' | 'profile'
  // For business: 'overview' | 'orders' | 'bulk' | 'profile'
  const activeTab = searchParams.get("tab") || "overview";
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // Main Dashboard Data
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [savedTailors, setSavedTailors] = useState([]);
  const [businessRequests, setBusinessRequests] = useState([]);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [isBusinessVerificationSubmitting, setIsBusinessVerificationSubmitting] = useState(false);
  const [businessVerifyForm, setBusinessVerifyForm] = useState({
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
  });
  const [tailorData, setTailorData] = useState(null);
  const [tailorRequests, setTailorRequests] = useState([]);
  const [tailorBulkFeed, setTailorBulkFeed] = useState([]);
  const [tailorAwardedTenders, setTailorAwardedTenders] = useState([]);
  const [tailorOrdersFilter, setTailorOrdersFilter] = useState("all");
  const [tailorOrdersSearch, setTailorOrdersSearch] = useState("");
  const [globalError, setGlobalError] = useState("");

  // Sub-Action states
  const [actingId, setActingId] = useState("");
  const [quoteDrafts, setQuoteDrafts] = useState({});

  // Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isApplyVerificationOpen, setIsApplyVerificationOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isEditStudioOpen, setIsEditStudioOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState(null);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(emptyMeasurement);
  const [editingMeasurementId, setEditingMeasurementId] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    organisation: "",
    requirement: "",
    quantity: 50,
    timeline: "30 days",
    notes: "",
  });
  const [editingBulkId, setEditingBulkId] = useState(null);

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    preferredLanguage: "en",
    radiusKm: 10,
    sortBy: "recommended",
    categories: [],
  });

  // Edit Tailor Studio Form State
  const [tailorStudioForm, setTailorStudioForm] = useState({
    name: "",
    owner: "",
    phone: "",
    city: "",
    area: "",
    experience: 5,
    minPrice: 499,
    description: "",
    categories: ["Ethnic Wear", "Alteration"],
    services: [
      { name: "Custom Stitching", price: 499, days: 5 },
      { name: "Suit / Blazer Fitting", price: 1499, days: 7 },
      { name: "Alteration & Hemming", price: 149, days: 2 },
    ],
  });

  // Location search state
  const [locBusy, setLocBusy] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");

  // Search in tabs
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersStatusFilter, setOrdersStatusFilter] = useState("all");
  const [measurementsSearch, setMeasurementsSearch] = useState("");

  const role = profile?.role || "customer";

  // Sync profileForm with profile
  useEffect(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        preferredLanguage: profile.preferredLanguage || i18n.language || "en",
        radiusKm: profile.searchPreferences?.radiusKm || 10,
        sortBy: profile.searchPreferences?.sortBy || "recommended",
        categories: profile.searchPreferences?.categories || [],
      });
    }
  }, [profile, i18n.language]);

  // Sync tailorStudioForm with tailorData
  useEffect(() => {
    if (tailorData) {
      setTailorStudioForm({
        name: tailorData.name || "",
        owner: tailorData.owner || "",
        phone: tailorData.phone || "",
        city: tailorData.city || "",
        area: tailorData.area || "",
        experience: tailorData.experience || 5,
        minPrice: tailorData.minPrice || 499,
        description: tailorData.description || "",
        categories: Array.isArray(tailorData.categories) && tailorData.categories.length > 0 ? tailorData.categories : ["Ethnic Wear", "Alteration"],
        services: Array.isArray(tailorData.services) && tailorData.services.length > 0 ? tailorData.services : [
          { name: "Custom Stitching", price: 499, days: 5 },
          { name: "Suit / Blazer Fitting", price: 1499, days: 7 },
          { name: "Alteration & Hemming", price: 149, days: 2 },
        ],
      });
    }
  }, [tailorData]);

  // Load all dashboard resources on mount or role change
  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);

    (async () => {
      try {
        const token = await getToken();

        // 1. Fetch User Dashboard Data (Orders, Measurements, Saved Tailors)
        const dashRes = await fetch("/api/users/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          if (active) {
            setOrders(dashData.orders || []);
            setMeasurements(dashData.measurements || []);
            setSavedTailors(dashData.savedTailors || []);
          }
        }

        // 2. Fetch Role Specific Data
        if (role === "tailor") {
          const tailorRes = await fetch("/api/users/tailor-dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (tailorRes.ok) {
            const tData = await tailorRes.json();
            if (active) {
              setTailorData(tData.tailor || null);
              setTailorRequests(tData.requests || []);
              setTailorBulkFeed(tData.bulkRequirements || []);
              setTailorAwardedTenders(tData.awardedTenders || []);
            }
          }
        } else if (role === "business") {
          const [bizRes, bpRes] = await Promise.all([
            fetch("/api/business-requests", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/api/business/profile", { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          if (bizRes.ok) {
            const bData = await bizRes.json();
            if (active) setBusinessRequests(Array.isArray(bData) ? bData : []);
          }
          if (bpRes.ok) {
            const bpData = await bpRes.json();
            if (active) {
              setBusinessProfile(bpData.businessProfile || null);
              if (bpData.businessProfile) {
                setBusinessVerifyForm((prev) => ({
                  ...prev,
                  ...bpData.businessProfile,
                  companyName: bpData.businessProfile.companyName || "",
                }));
              }
            }
          }
        }
      } catch (err) {
        if (active) setGlobalError(err.message || "Failed to load dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isSignedIn, role, getToken]);

  /* =========================================================
     CRUD: PROFILE & PREFERENCES
  ========================================================== */
  async function handleSaveProfile(e) {
    if (e) e.preventDefault();
    setActingId("profile");
    try {
      const token = await getToken();
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          phone: profileForm.phone,
          bio: profileForm.bio,
          preferredLanguage: profileForm.preferredLanguage,
          searchPreferences: {
            radiusKm: Number(profileForm.radiusKm),
            sortBy: profileForm.sortBy,
            categories: profileForm.categories,
          },
        }),
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || t("pages.error"));

      if (body.preferredLanguage && i18n.language !== body.preferredLanguage) {
        await i18n.changeLanguage(body.preferredLanguage);
      }

      await refreshProfile();
      setIsEditProfileOpen(false);
      toast.success(t("pages.profileSaved", "Profile updated successfully."));
    } catch (err) {
      toast.error(err.message || t("pages.error"));
    } finally {
      setActingId("");
    }
  }

  async function persistLocation(latitude, longitude, label, source, accuracyMeters) {
    setLocBusy(true);
    try {
      const token = await getToken();
      const r = await fetch("/api/users/location", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude,
          longitude,
          label,
          source,
          accuracyMeters,
          consent: true,
        }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || t("pages.error"));
      await refreshProfile();
      toast.success(t("authFlow.locationSaved", "Location updated successfully!"));
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      toast.error(e.message || t("pages.error"));
    } finally {
      setLocBusy(false);
    }
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error(t("authFlow.geoUnavailable", "Geolocation is not supported by your browser."));
      return;
    }
    setLocBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        persistLocation(
          p.coords.latitude,
          p.coords.longitude,
          `${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`,
          "browser",
          p.coords.accuracy
        );
      },
      () => {
        setLocBusy(false);
        toast.error(t("authFlow.geoDenied", "Location permission denied."));
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  async function handleSearchLocation(e) {
    if (e) e.preventDefault();
    if (!placeQuery.trim()) return;
    setLocBusy(true);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
          placeQuery.trim()
        )}`
      );
      const rows = await r.json();
      if (!rows.length) throw new Error(t("authFlow.placeNotFound", "No matching place found."));
      await persistLocation(
        Number(rows[0].lat),
        Number(rows[0].lon),
        rows[0].display_name,
        "manual"
      );
      setPlaceQuery("");
    } catch (e) {
      toast.error(e.message || t("pages.error"));
      setLocBusy(false);
    }
  }

  /* =========================================================
     CRUD: ORDERS (CUSTOMER)
  ========================================================== */
  async function handleAcceptQuote(orderId) {
    setActingId(orderId);
    try {
      const token = await getToken();
      const response = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}/accept`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.error || "Failed to accept quote.");
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrderDetails?.id === orderId) setSelectedOrderDetails(updated);
      toast.success(t("orderFlow.quoteAccepted", "Quote accepted! Tailor studio notified."));
    } catch (err) {
      toast.error(err.message || "Failed to accept quote.");
    } finally {
      setActingId("");
    }
  }

  async function handleDeleteOrder(orderId) {
    setActingId(orderId);
    try {
      const token = await getToken();
      const response = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete order.");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrderDetails?.id === orderId) setSelectedOrderDetails(null);
      setConfirmDeleteOrder(null);
      toast.success(t("orderFlow.orderDeleted", "Order request deleted successfully."));
    } catch (err) {
      toast.error(err.message || "Could not delete order.");
    } finally {
      setActingId("");
    }
  }

  /* =========================================================
     CRUD: MEASUREMENTS (BODY PROFILES)
  ========================================================== */
  function handleOpenCreateMeasurement() {
    setEditingMeasurementId(null);
    setEditingMeasurement(emptyMeasurement);
    setIsMeasurementModalOpen(true);
  }

  function handleOpenEditMeasurement(meas) {
    setEditingMeasurementId(meas._id);
    setEditingMeasurement({
      name: meas.name || "",
      garment: meas.garment || "Shirt",
      values: Object.fromEntries(
        measurementFields.map((f) => [f, meas.values?.[f] ?? ""])
      ),
    });
    setIsMeasurementModalOpen(true);
  }

  async function handleSaveMeasurement(e) {
    if (e) e.preventDefault();
    setActingId("measurement");
    try {
      const token = await getToken();
      const cleanValues = Object.fromEntries(
        Object.entries(editingMeasurement.values)
          .filter(([, v]) => v !== "" && Number.isFinite(Number(v)))
          .map(([k, v]) => [k, Number(v)])
      );

      const isEdit = Boolean(editingMeasurementId);
      const url = isEdit
        ? `/api/measurements/${editingMeasurementId}`
        : "/api/measurements";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingMeasurement.name,
          garment: editingMeasurement.garment,
          values: cleanValues,
        }),
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to save measurement.");

      if (isEdit) {
        setMeasurements((prev) =>
          prev.map((m) => (m._id === editingMeasurementId ? body : m))
        );
      } else {
        setMeasurements((prev) => [body, ...prev]);
      }

      setIsMeasurementModalOpen(false);
      setEditingMeasurement(emptyMeasurement);
      setEditingMeasurementId(null);
      toast.success(t("profile.measurementSaved", "Measurement profile saved!"));
    } catch (err) {
      toast.error(err.message || "Failed to save measurement.");
    } finally {
      setActingId("");
    }
  }

  async function handleDeleteMeasurement(id) {
    if (!window.confirm("Are you sure you want to delete this measurement profile?")) return;
    setActingId(id);
    try {
      const token = await getToken();
      const response = await fetch(`/api/measurements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to delete measurement.");
      setMeasurements((prev) => prev.filter((m) => m._id !== id));
      toast.success(t("profile.measurementDeleted", "Measurement profile removed."));
    } catch (err) {
      toast.error(err.message || "Failed to delete measurement.");
    } finally {
      setActingId("");
    }
  }

  /* =========================================================
     CRUD: SAVED TAILORS
  ========================================================== */
  async function handleUnsaveTailor(tailorId) {
    setActingId(tailorId);
    try {
      const token = await getToken();
      const response = await fetch(`/api/tailors/${tailorId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ saved: false }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to unsave tailor.");
      setSavedTailors((prev) => prev.filter((t) => (t._id || t.id) !== tailorId));
      await refreshProfile();
      toast.success(t("discovery.removed", "Tailor removed from saved collection."));
    } catch (err) {
      toast.error(err.message || "Failed to unsave tailor.");
    } finally {
      setActingId("");
    }
  }

  /* =========================================================
     CRUD: TAILOR WORKSPACE (STUDIO, VERIFICATION & ORDERS)
  ========================================================== */
  async function handleSaveStudio(e) {
    if (e) e.preventDefault();
    setActingId("studio");
    try {
      const token = await getToken();
      const response = await fetch("/api/tailors/my-studio", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tailorStudioForm),
      });
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.error || "Failed to update studio profile.");
      setTailorData(updated);
      setIsEditStudioOpen(false);
      toast.success(t("tailorStudio.studioSaved", "Tailor studio profile & services updated!"));
    } catch (err) {
      toast.error(err.message || "Failed to update studio.");
    } finally {
      setActingId("");
    }
  }

  async function handleApplyVerification(e) {
    if (e) e.preventDefault();
    setActingId("applyVerification");
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
      if (data.tailor) setTailorData(data.tailor);
      setIsApplyVerificationOpen(false);
      setVerificationNotes("");
      toast.success(t("verification.submitted", "Verification application submitted to administrator!"));
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      toast.error(err.message || "Failed to apply for verification.");
    } finally {
      setActingId("");
    }
  }

  async function handleTailorDeclineOrder(order) {
    if (!window.confirm(t("orderFlow.declineOrderConfirm", "Are you sure you want to decline this customer order request?"))) return;
    setActingId(order.id);
    try {
      const token = await getToken();
      const response = await fetch(`/api/orders/${encodeURIComponent(order.id)}/decline`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.error || "Failed to decline order.");
      setTailorRequests((prev) => prev.map((item) => (item.id === order.id ? updated : item)));
      toast.info(t("orderFlow.orderDeclined", "Order request declined and marked cancelled."));
    } catch (err) {
      toast.error(err.message || "Action failed.");
    } finally {
      setActingId("");
    }
  }

  async function handleTailorUpdateOrder(order, action, value) {
    setActingId(order.id);
    try {
      const token = await getToken();
      const isQuote = action === "quote";
      const response = await fetch(
        `/api/orders/${encodeURIComponent(order.id)}/${isQuote ? "quote" : "status"}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(
            isQuote ? { quotePrice: Number(value) } : { status: value }
          ),
        }
      );
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.error || "Failed to update order.");
      setTailorRequests((prev) =>
        prev.map((item) => (item.id === order.id ? updated : item))
      );
      if (value === "Completed") {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
      }
      toast.success(t(isQuote ? "orderFlow.quoteSent" : "orderFlow.orderUpdated"));
    } catch (err) {
      toast.error(err.message || "Action failed.");
    } finally {
      setActingId("");
    }
  }

  async function handleTailorDeleteOrder(order) {
    if (!window.confirm(t("orderFlow.deleteOrderConfirm", "Are you sure you want to delete this order request?"))) return;
    setActingId(order.id);
    try {
      const token = await getToken();
      const response = await fetch(
        `/api/orders/${encodeURIComponent(order.id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete request.");
      setTailorRequests((prev) => prev.filter((item) => item.id !== order.id));
      toast.success(t("orderFlow.orderDeleted", "Order request deleted."));
    } catch (err) {
      toast.error(err.message || "Action failed.");
    } finally {
      setActingId("");
    }
  }

  /* =========================================================
     CRUD: BUSINESS REQUIREMENTS & VERIFICATION
  ========================================================== */
  async function handleSaveBusinessVerification(e) {
    if (e) e.preventDefault();
    setIsBusinessVerificationSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/business/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...businessVerifyForm, submitForAudit: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit verification");
      toast.success("Business credentials submitted for administrative audit!");
      setBusinessProfile(data.businessProfile);
      refreshProfile?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsBusinessVerificationSubmitting(false);
    }
  }

  function handleOpenCreateBulk() {
    const isBizVerified = businessProfile?.verificationStatus === "verified" || businessProfile?.verified;
    if (!isBizVerified) {
      toast.warn("Verification required: Only verified business accounts with an approved GSTIN can post bulk requirements. Please submit your business credentials for verification.");
      setActiveTab("verification");
      return;
    }
    setEditingBulkId(null);
    setBulkForm({
      organisation: businessProfile?.companyName || (profile?.firstName ? `${profile.firstName}'s Org` : ""),
      requirement: "",
      quantity: 50,
      timeline: "30 days",
      notes: "",
    });
    setIsBulkModalOpen(true);
  }

  function handleOpenEditBulk(row) {
    setEditingBulkId(row._id);
    setBulkForm({
      organisation: row.organisation || "",
      requirement: row.requirement || "",
      quantity: row.quantity || 50,
      timeline: row.timeline || "30 days",
      notes: row.notes || "",
    });
    setIsBulkModalOpen(true);
  }

  async function handleSaveBulk(e) {
    if (e) e.preventDefault();
    setActingId("bulk");
    try {
      const token = await getToken();
      const isEdit = Boolean(editingBulkId);
      const url = isEdit
        ? `/api/business-requests/${editingBulkId}`
        : "/api/business-requests";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bulkForm),
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to save requirement.");

      if (isEdit) {
        setBusinessRequests((prev) =>
          prev.map((r) => (r._id === editingBulkId ? body : r))
        );
      } else {
        setBusinessRequests((prev) => [
          { ...bulkForm, _id: body.requestId || Date.now(), createdAt: new Date() },
          ...prev,
        ]);
      }

      setIsBulkModalOpen(false);
      setEditingBulkId(null);
      toast.success("Business bulk requirement submitted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save requirement.");
    } finally {
      setActingId("");
    }
  }

  async function handleDeleteBulk(id) {
    if (!window.confirm("Are you sure you want to delete this business requirement?")) return;
    setActingId(id);
    try {
      const token = await getToken();
      const response = await fetch(`/api/business-requests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to delete requirement.");
      setBusinessRequests((prev) => prev.filter((r) => r._id !== id));
      toast.success("Requirement deleted.");
    } catch (err) {
      toast.error(err.message || "Failed to delete requirement.");
    } finally {
      setActingId("");
    }
  }

  /* =========================================================
     FILTERED DATA HELPERS
  ========================================================== */
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (ordersStatusFilter === "active") {
        if (!["Request Sent", "Quote Received", "Accepted", "In Production"].includes(order.status)) {
          return false;
        }
      } else if (ordersStatusFilter === "quotes") {
        if (order.status !== "Quote Received") return false;
      } else if (ordersStatusFilter === "completed") {
        if (!["Ready for Pickup", "Completed"].includes(order.status)) return false;
      }

      if (ordersSearch.trim()) {
        const q = ordersSearch.toLowerCase();
        const matchesId = String(order.id || "").toLowerCase().includes(q);
        const matchesGarment = String(order.garment || order.category || "").toLowerCase().includes(q);
        const matchesTailor = String(order.tailorName || "").toLowerCase().includes(q);
        if (!matchesId && !matchesGarment && !matchesTailor) return false;
      }

      return true;
    });
  }, [orders, ordersStatusFilter, ordersSearch]);

  const filteredMeasurements = useMemo(() => {
    if (!measurementsSearch.trim()) return measurements;
    const q = measurementsSearch.toLowerCase();
    return measurements.filter(
      (m) =>
        String(m.name || "").toLowerCase().includes(q) ||
        String(m.garment || "").toLowerCase().includes(q)
    );
  }, [measurements, measurementsSearch]);

  // Tailor calculated stats & checklist
  const tailorPendingQuotesCount = useMemo(
    () => tailorRequests.filter((r) => r.status === "Request Sent").length,
    [tailorRequests]
  );
  const tailorInProductionCount = useMemo(
    () => tailorRequests.filter((r) => ["Accepted", "In Production", "Ready for Pickup"].includes(r.status)).length,
    [tailorRequests]
  );
  const tailorCompletedCount = useMemo(
    () => tailorRequests.filter((r) => r.status === "Completed").length,
    [tailorRequests]
  );
  const tailorRevenue = useMemo(
    () =>
      tailorRequests
        .filter((r) => r.status === "Completed")
        .reduce((sum, r) => sum + (Number(r.quotePrice) || Number(r.price) || 0), 0),
    [tailorRequests]
  );

  const tailorChecklist = useMemo(() => {
    const hasStudioName = Boolean(tailorData?.name && tailorData?.name.trim() !== "");
    const hasLocation = Boolean(tailorData?.city || profile?.location?.coordinates?.length || profile?.location?.label);
    const hasPhone = Boolean(tailorData?.phone || profile?.phone);
    const hasRateCard = Boolean(tailorData?.services?.length > 0 && tailorData?.categories?.length > 0);
    const isVerified = Boolean(tailorData?.verified);

    const steps = [
      {
        id: "name",
        title: t("tailorDashboard.stepStudioName", "Studio Branding & Bio"),
        done: hasStudioName,
        desc: t("tailorDashboard.stepStudioNameDesc", "Atelier identity, owner name & master craftsmanship story"),
      },
      {
        id: "location",
        title: t("tailorDashboard.stepLocation", "Workshop City & GPS Locality"),
        done: hasLocation,
        desc: t("tailorDashboard.stepLocationDesc", "Enables local customer discovery on the interactive map"),
      },
      {
        id: "phone",
        title: t("tailorDashboard.stepPhone", "Studio Contact Phone"),
        done: hasPhone,
        desc: t("tailorDashboard.stepPhoneDesc", "Direct customer inquiry and measurement booking contact"),
      },
      {
        id: "services",
        title: t("tailorDashboard.stepServices", "Rate Card & Garment Specialties"),
        done: hasRateCard,
        desc: t("tailorDashboard.stepServicesDesc", "Transparent pricing menu and turnaround timelines"),
      },
      {
        id: "verified",
        title: t("tailorDashboard.stepVerified", "Admin Studio Verification"),
        done: isVerified,
        desc: t("tailorDashboard.stepVerifiedDesc", "Official verification badge to rank #1 on Find Tailors directory"),
      },
    ];
    const completedCount = steps.filter((s) => s.done).length;
    const score = Math.round((completedCount / steps.length) * 100);
    return { steps, completedCount, totalCount: steps.length, score, isVerified };
  }, [tailorData, profile, t]);

  const businessChecklist = useMemo(() => {
    const hasName = Boolean(businessProfile?.companyName && businessProfile.companyName.trim() !== "");
    const hasGstin = Boolean(businessProfile?.gstin && businessProfile.gstin.trim().length === 15);
    const hasAddress = Boolean(businessProfile?.address && businessProfile?.city);
    const hasContact = Boolean((businessProfile?.contactPerson || profile?.firstName) && (businessProfile?.contactPhone || profile?.phone));
    const isVerified = Boolean(businessProfile?.verificationStatus === "verified" || businessProfile?.verified);

    const steps = [
      {
        id: "name",
        title: "Enterprise Identity & Sector",
        done: hasName,
        desc: "Company legal entity name and primary industry sector",
      },
      {
        id: "gstin",
        title: "15-Digit GSTIN & PAN",
        done: hasGstin,
        desc: "Standard Indian Goods & Services Tax identification number",
      },
      {
        id: "address",
        title: "Registered Corporate HQ",
        done: hasAddress,
        desc: "Official business operations address, city and state",
      },
      {
        id: "contact",
        title: "Authorized Procurement Officer",
        done: hasContact,
        desc: "Direct contact person name and verified telephone",
      },
      {
        id: "verified",
        title: "MeraTailor Admin Audit Approval",
        done: isVerified,
        desc: "Official verification status enabling marketplace RFQ tender posting",
      },
    ];
    const completedCount = steps.filter((s) => s.done).length;
    const score = Math.round((completedCount / steps.length) * 100);
    return { steps, completedCount, totalCount: steps.length, score, isVerified };
  }, [businessProfile, profile]);

  const filteredTailorRequests = useMemo(() => {
    return tailorRequests.filter((req) => {
      if (tailorOrdersFilter === "needsQuote") {
        if (req.status !== "Request Sent") return false;
      } else if (tailorOrdersFilter === "quoted") {
        if (req.status !== "Quote Received") return false;
      } else if (tailorOrdersFilter === "inProduction") {
        if (!["Accepted", "In Production"].includes(req.status)) return false;
      } else if (tailorOrdersFilter === "readyOrDone") {
        if (!["Ready for Pickup", "Completed"].includes(req.status)) return false;
      } else if (tailorOrdersFilter === "cancelled") {
        if (req.status !== "Cancelled") return false;
      }

      if (tailorOrdersSearch.trim()) {
        const q = tailorOrdersSearch.toLowerCase();
        const matchesId = String(req.id || "").toLowerCase().includes(q);
        const matchesGarment = String(req.garment || req.category || "").toLowerCase().includes(q);
        const matchesNotes = String(req.notes || "").toLowerCase().includes(q);
        const matchesColor = String(req.color || "").toLowerCase().includes(q);
        if (!matchesId && !matchesGarment && !matchesNotes && !matchesColor) return false;
      }

      return true;
    });
  }, [tailorRequests, tailorOrdersFilter, tailorOrdersSearch]);

  // Counts
  const activeOrdersCount = orders.filter((o) =>
    ["Request Sent", "Quote Received", "Accepted", "In Production"].includes(o.status)
  ).length;
  const quotesCount = orders.filter((o) => o.status === "Quote Received").length;
  const completedOrdersCount = orders.filter((o) => o.status === "Completed").length;

  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    profile?.email?.split("@")[0] ||
    "Better Hidden";

  const initials =
    [profile?.firstName?.[0], profile?.lastName?.[0]].filter(Boolean).join("").toUpperCase() ||
    profile?.email?.slice(0, 2)?.toUpperCase() ||
    "BH";

  const isHi = i18n.language === "hi";

  // Clean real data bindings - zero mock or dummy fallbacks
  const displayOrder = orders.length > 0 ? orders[0] : null;
  const displaySavedStudio = savedTailors.length > 0 ? savedTailors[0] : null;

  /* =========================================================
     ADMIN AUTO-REDIRECT TO ADMIN PORTAL
  ========================================================== */
  if (isSignedIn && profile?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  /* =========================================================
     AUTH / GUEST VIEW
  ========================================================== */
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#fbf9f5] text-[#111827]">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-10 shadow-xs">
            <UserRound size={48} className="mx-auto text-[#8f2338] mb-4" />
            <h1 className="font-sans text-2xl font-bold text-[#111827] sm:text-3xl">
              {t("portals.dashboard", "Dashboard")}
            </h1>
            <p className="mt-2 text-stone-600 max-w-md mx-auto text-sm">
              {t("auth.signInRequired", {
                defaultValue: "Get started to access your personal dashboard, body measurements, and active orders.",
              })}
            </p>
            <button
              onClick={openSignUp}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8f2338] px-6 py-3 font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
            >
              <span>{t("navbar.getStarted", "Get Started")}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* =========================================================
     ROLE-AWARE SKELETON LOADING VIEW (WITHOUT ARTIFICIAL DELAY)
  ========================================================== */
  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#fbf9f5] text-[#111827]">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <PageContentSkeleton role={role} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#111827] selection:bg-[#8f2338] selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* =========================================================
            BROSSARD TOP BREADCRUMB NAVIGATION
        ========================================================== */}
        <div className="flex items-center gap-2 text-xs font-medium text-stone-500 mb-5">
          <Link to="/" className="hover:text-stone-900">MeraTailor</Link>
          <span>/</span>
          <span>
            {role === "tailor"
              ? (isHi ? "टेलर स्टूडियो पोर्टल" : "Tailor Studio Portal")
              : role === "business"
              ? (isHi ? "B2B प्रोक्योरमेंट" : "B2B Procurement")
              : (isHi ? "ग्राहक डैशबोर्ड" : "Customer Dashboard")}
          </span>
          <span>/</span>
          <span className="capitalize font-semibold text-stone-800">
            {activeTab}
          </span>
        </div>

        {/* =========================================================
            TOP PROFILE HERO BAR
        ========================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs">
          {/* Atelier Illustration on right side */}
          <div className="pointer-events-none absolute right-4 sm:right-16 md:right-32 top-0 bottom-0 w-64 md:w-80 overflow-hidden opacity-90 hidden sm:block">
            <img
              src="/assets/tailor_banner_illustration.jpg"
              alt="Tailoring atelier"
              className="h-full w-full object-contain object-right"
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* User / Studio Title & Badge */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#fceeed] text-[#8f2338] text-2xl font-black shadow-xs border border-rose-100 overflow-hidden">
                  {role === "tailor" && tailorData?.image ? (
                    <img
                      src={tailorData.image}
                      alt={tailorData.name || "Tailor Studio"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (profile?.avatar || profile?.imageUrl || user?.imageUrl) ? (
                    <img
                      src={profile?.avatar || profile?.imageUrl || user?.imageUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : role === "tailor" ? (
                    <Scissors size={26} />
                  ) : role === "business" ? (
                    <Building2 size={26} />
                  ) : (
                    initials
                  )}
                </div>
                <span
                  className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500"
                  title="Online"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-sans text-xl sm:text-2xl font-black tracking-tight text-[#111827] uppercase">
                    {role === "tailor"
                      ? tailorData?.name || (profile?.firstName ? `${profile.firstName}'s Atelier` : "Master Tailor Atelier")
                      : role === "business"
                      ? businessProfile?.companyName || (profile?.firstName ? `${profile.firstName}'s Enterprise` : "B2B Commercial Enterprise")
                      : displayName.toUpperCase()}
                  </h1>

                  {/* Role Badge */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fdf2f4] border border-[#f5d0d6] px-2.5 py-0.5 text-xs font-semibold text-[#8f2338]">
                    {role === "tailor" ? (
                      <>
                        <Scissors size={12} /> <span>Tailor Studio</span>
                      </>
                    ) : role === "business" ? (
                      <>
                        <Building2 size={12} /> <span>Business Enterprise</span>
                      </>
                    ) : (
                      <>
                        <User size={12} /> <span>Customer</span>
                      </>
                    )}
                  </span>

                  {/* Verified Badge */}
                  {role === "tailor" ? (
                    tailorData?.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        <ShieldCheck size={13} /> {t("verification.verifiedBadge", "Verified Studio ✓")}
                      </span>
                    ) : tailorData?.verificationStatus === "pending" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                        <Clock3 size={13} /> {t("verification.pendingBadge", "Verification Under Review ⏳")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                        <AlertCircle size={13} /> {t("verification.unverifiedBadge", "Unverified Studio ⚠️")}
                      </span>
                    )
                  ) : role === "business" ? (
                    businessProfile?.verificationStatus === "verified" || businessProfile?.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        <ShieldCheck size={13} /> <span>Verified Enterprise ✓</span>
                      </span>
                    ) : businessProfile?.verificationStatus === "pending" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                        <Clock3 size={13} /> <span>GSTIN Audit In Progress ⏳</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                        <AlertCircle size={13} /> <span>GSTIN Unverified ⚠️</span>
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      <Check size={12} className="text-emerald-700 stroke-[3]" />
                      <span>{t("dashboardPage.verified", "Verified")}</span>
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs sm:text-sm text-stone-500 line-clamp-1 max-w-lg">
                  {role === "tailor"
                    ? `${tailorData?.owner || profile?.firstName || "Master Artisan"} · ${tailorData?.city || "Jaipur"}, ${tailorData?.area || "Rajasthan"} · ${tailorData?.experience || 5} years experience`
                    : role === "business"
                    ? `${businessProfile?.businessType || "B2B Commercial Procurement"} · ${businessProfile?.city || "Jaipur, India"} · ${businessProfile?.gstin ? `GSTIN: ${businessProfile.gstin}` : "GSTIN Compliance Pending"}`
                    : profile?.bio ||
                      t(
                        "pages.customerSubtitle",
                        "Track your tailoring requests and previous orders."
                      )}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="relative z-10 flex flex-wrap items-center gap-2.5 self-start md:self-center">
              {role === "tailor" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditStudioOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition"
                  >
                    <Pencil size={13} className="text-stone-600" />
                    <span>{t("dashboardPage.editStudio", "Edit Studio & Rates")}</span>
                  </button>

                  {!tailorData?.verified && tailorData?.verificationStatus !== "pending" && (
                    <button
                      type="button"
                      onClick={() => setIsApplyVerificationOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                    >
                      <ShieldCheck size={14} />
                      <span>{t("verification.applyButton", "Apply for Verification")}</span>
                    </button>
                  )}

                  {tailorData?.verified && tailorData?._id && (
                    <Link
                      to={`/tailors/${encodeURIComponent(tailorData._id)}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                    >
                      <ExternalLink size={13} />
                      <span>{t("dashboardPage.viewPublicStudio", "View Public Studio")}</span>
                    </Link>
                  )}
                </>
              ) : role === "business" ? (
                <>
                  <button
                    type="button"
                    onClick={handleOpenCreateBulk}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                  >
                    <Plus size={14} />
                    <span>Post Requirement</span>
                  </button>

                  <Link
                    to="/bulk"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition"
                  >
                    <Layers size={13} className="text-stone-600" />
                    <span>Tender Marketplace</span>
                  </Link>

                  {businessProfile?.verificationStatus !== "verified" && !businessProfile?.verified && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("verification")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-[#8f2338] shadow-2xs hover:bg-rose-100 transition"
                    >
                      <ShieldCheck size={13} />
                      <span>Audit Verification</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition"
                  >
                    <Pencil size={13} className="text-stone-600" />
                    <span>{t("dashboardPage.editProfile", "Edit Profile")}</span>
                  </button>

                  <Link
                    to="/find-tailors"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                  >
                    <Search size={13} />
                    <span>{t("dashboardPage.findTailors", "Find Tailors")}</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* =========================================================
              TABS NAVIGATION BAR
          ========================================================== */}
          <nav className="relative z-10 mt-6 flex items-center gap-1.5 overflow-x-auto border-t border-stone-100 pt-3 text-xs scrollbar-thin">
            {(role === "tailor"
              ? [
                  { id: "overview", label: t("tailorDashboard.tabOverview", "Studio Command Center"), icon: Activity, count: null },
                  { id: "orders", label: t("tailorDashboard.tabOrders", "Client Orders & Quotes"), icon: ShoppingBag, count: tailorRequests.length },
                  { id: "studio", label: t("tailorDashboard.tabStudio", "Studio Profile & Rate Card"), icon: Scissors, count: null },
                  { id: "bulk", label: t("tailorDashboard.tabBulk", "B2B Bulk Jobs"), icon: Building2, count: tailorBulkFeed.length },
                  { id: "profile", label: t("dashboardPage.profileSettings", "Account & Settings"), icon: Sliders, count: null },
                ]
              : role === "business"
              ? [
                  { id: "overview", label: "Enterprise Overview", icon: Building2, count: null },
                  { id: "bulk", label: "Procurement & RFQs", icon: Layers, count: businessRequests.length },
                  { id: "verification", label: "GSTIN Compliance Audit", icon: ShieldCheck, count: null },
                  { id: "orders", label: "Production Orders", icon: ShoppingBag, count: orders.length },
                  { id: "profile", label: "Company Profile", icon: Settings, count: null },
                ]
              : [
                  { id: "overview", label: t("dashboardPage.overview", "Overview"), icon: Home, count: null },
                  { id: "orders", label: t("dashboardPage.orders", "Orders"), icon: ShoppingBag, count: orders.length },
                  { id: "measurements", label: t("dashboardPage.measurements", "Measurements"), icon: Tag, count: measurements.length },
                  { id: "saved", label: t("dashboardPage.savedTailors", "Saved Tailors"), icon: Bookmark, count: savedTailors.length },
                  { id: "profile", label: t("dashboardPage.profileSettings", "Profile & Settings"), icon: Settings, count: null },
                ]
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 font-bold transition-all ${
                    isActive
                      ? "bg-[#8f2338] text-white shadow-xs font-bold"
                      : "bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                        isActive
                          ? "bg-[#761c30] text-rose-100"
                          : "bg-rose-50 text-[#8f2338]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </section>

        {globalError && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-800"
          >
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{globalError}</span>
          </div>
        )}

        {/* =========================================================
            CUSTOMER OVERVIEW: PIXEL-PERFECT UI MOCKUP (SMOOTH & RESPONSIVE)
        ========================================================== */}
        {role !== "tailor" && role !== "business" && activeTab === "overview" ? (
          <div className="mt-6 space-y-6">
            {/* =====================================================
                ROW 1: 4 COLS (Account Overview) + 8 COLS (Active Stitching + 4 Stat Highlights)
            ====================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* LEFT: Account Overview Card (4 cols) */}
              <div className="lg:col-span-4 flex flex-col">
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fdf2f4] text-[#8f2338]">
                          <FileText size={16} />
                        </div>
                        <h2 className="font-sans text-base font-bold text-stone-900">
                          {t("dashboardPage.accountOverview", "Account Overview")}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditProfileOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#8f2338] hover:underline"
                      >
                        <Pencil size={12} /> {t("dashboardPage.edit", "Edit")}
                      </button>
                    </div>

                    <ul className="mt-4 space-y-3.5 text-xs text-stone-600">
                      <li className="flex items-center gap-2.5">
                        <Mail size={15} className="text-stone-400 shrink-0" />
                        <span className="truncate">{profile?.email || "indonesiaraj09@gmail.com"}</span>
                      </li>

                      <li className="flex items-center gap-2.5">
                        <Phone size={15} className="text-stone-400 shrink-0" />
                        <span>{profile?.phone || "6268893387"}</span>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <MapPin size={15} className="text-[#8f2338] shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">
                          {profile?.location?.label || "Jaipur, Jaipur Municipal Corporation, Jaipur Tehsil, Jaipur, Rajasthan, 302001, India"}
                        </span>
                      </li>

                      <li className="flex items-center gap-2.5">
                        <Globe size={15} className="text-stone-400 shrink-0" />
                        <span>
                          {t("dashboardPage.language", "Language")}:{" "}
                          <strong className="text-stone-800">
                            {profile?.preferredLanguage === "hi" ? "हिन्दी (Hindi)" : "English"}
                          </strong>
                        </span>
                      </li>

                      <li className="flex items-center gap-2.5">
                        <Calendar size={15} className="text-stone-400 shrink-0" />
                        <span>
                          {t("dashboardPage.joined", "Joined")}:{" "}
                          <strong className="text-stone-800">
                            {profile?.createdAt
                              ? new Date(profile.createdAt).toLocaleDateString()
                              : "6/10/2026"}
                          </strong>
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 border-t border-stone-100 pt-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-xs font-bold text-stone-700">
                        {t("dashboardPage.searchPreferences", "Search Preferences")}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsEditProfileOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#8f2338] hover:underline"
                      >
                        <Pencil size={12} /> {t("dashboardPage.edit", "Edit")}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-xl border border-stone-200 bg-[#fdfbf9] px-3 py-1.5 text-stone-700 font-medium">
                        📍 {profile?.searchPreferences?.radiusKm || 100} {t("dashboardPage.kmRadius", "km radius")}
                      </span>
                      <span className="rounded-xl border border-stone-200 bg-[#fdfbf9] px-3 py-1.5 text-stone-700 font-medium">
                        ⚡ {t("dashboardPage.sort", "Sort")}: {profile?.searchPreferences?.sortBy || "recommended"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Active Stitching Progress + 4 Stat Cards (8 cols) */}
              <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                {/* Active Stitching Progress Card */}
                <div className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fdf2f4] text-[#8f2338]">
                        <Package size={16} />
                      </div>
                      <h2 className="font-sans text-base font-bold text-stone-900">
                        {t("dashboardPage.activeStitching", "Active Stitching Progress")}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("orders")}
                      className="text-xs font-bold text-[#8f2338] hover:underline"
                    >
                      {t("dashboardPage.viewAll", "View All")} ({orders.length}) →
                    </button>
                  </div>

                  {displayOrder ? (
                    <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Garment Swatch / Thumbnail */}
                      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-[#fdf2f4] p-2 flex items-center justify-center shrink-0 border border-rose-100 overflow-hidden">
                        <img
                          src={displayOrder.image || "/assets/kurta.png"}
                          alt={displayOrder.garment || "Garment"}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/assets/kurta.png";
                          }}
                        />
                      </div>

                      {/* Order Details & Stepper */}
                      <div className="flex-1 w-full">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-bold text-stone-400">
                              #{displayOrder.id}
                            </p>
                            <h3 className="font-sans text-base font-bold text-stone-900">
                              {displayOrder.garment || displayOrder.category}
                            </h3>
                            <p className="text-xs text-stone-600 mt-0.5">
                              <span className="font-semibold text-[#8f2338]">Studio {displayOrder.tailorName || "Artisan Studio"}</span>
                              {displayOrder.area && (
                                <>
                                  <span className="text-stone-400 mx-1.5">·</span>
                                  <span className="inline-flex items-center gap-1 text-stone-500">
                                    <MapPin size={11} className="text-[#8f2338]" /> {displayOrder.area}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>

                          <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-[#8f2338] shrink-0">
                            {displayOrder.status || "Request Sent"}
                          </span>
                        </div>

                        {/* Stepper with connecting line */}
                        <div className="relative mt-4 pt-1 pb-1">
                          <div className="absolute top-[10px] left-[8%] right-[8%] h-[2px] bg-stone-200 -z-0">
                            <div
                              className="h-full bg-[#8f2338] transition-all duration-500"
                              style={{
                                width:
                                  displayOrder.status === "Completed"
                                    ? "100%"
                                    : displayOrder.status === "Ready for Pickup"
                                    ? "66%"
                                    : "33%",
                              }}
                            />
                          </div>

                          <div className="relative z-10 flex items-start justify-between text-center">
                            {/* Node 1: Order Placed */}
                            <div className="flex flex-col items-center">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8f2338] text-white text-[10px] font-bold shadow-xs">
                                <Check size={11} className="stroke-[3]" />
                              </div>
                              <p className="mt-1 text-[11px] font-bold text-stone-900">Order Placed</p>
                              <p className="text-[10px] text-stone-400">{displayOrder.createdAt ? new Date(displayOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Recent"}</p>
                            </div>

                            {/* Node 2: In Progress */}
                            <div className="flex flex-col items-center">
                              <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${["In Production", "Ready for Pickup", "Completed"].includes(displayOrder.status) ? "border-[#8f2338] bg-[#8f2338] text-white" : "border-stone-300 bg-white"}`}>
                                {["In Production", "Ready for Pickup", "Completed"].includes(displayOrder.status) && <Check size={11} />}
                              </div>
                              <p className="mt-1 text-[11px] font-bold text-stone-800">In Progress</p>
                              <p className="text-[10px] text-stone-400">-</p>
                            </div>

                            {/* Node 3: Ready for Pickup */}
                            <div className="flex flex-col items-center">
                              <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${["Ready for Pickup", "Completed"].includes(displayOrder.status) ? "border-[#8f2338] bg-[#8f2338] text-white" : "border-stone-300 bg-white"}`} />
                              <p className="mt-1 text-[11px] font-medium text-stone-500">Ready for Pickup</p>
                              <p className="text-[10px] text-stone-400">-</p>
                            </div>

                            {/* Node 4: Completed */}
                            <div className="flex flex-col items-center">
                              <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${displayOrder.status === "Completed" ? "border-emerald-600 bg-emerald-600 text-white" : "border-stone-300 bg-white"}`} />
                              <p className="mt-1 text-[11px] font-medium text-stone-500">Completed</p>
                              <p className="text-[10px] text-stone-400">-</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 py-8 text-center rounded-2xl border border-dashed border-stone-200">
                      <ShoppingBag size={28} className="mx-auto text-stone-300 mb-2" />
                      <p className="text-xs font-bold text-stone-700">
                        {isHi ? "कोई सक्रिय सिलाई ऑर्डर नहीं है" : "No active custom orders"}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {isHi ? "अपने सटीक नाप के लिए आस-पास के दर्जी खोजें।" : "Find tailors nearby to place custom stitching requests."}
                      </p>
                      <Link
                        to="/find-tailors"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e]"
                      >
                        <Search size={12} />
                        <span>{isHi ? "दर्जी खोजें" : "Find Tailors"}</span>
                      </Link>
                    </div>
                  )}

                  {/* Quote and Details footer */}
                  {displayOrder && (
                    <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                      <span className="font-semibold text-stone-700">
                        {t("dashboardPage.quote", "Quote")}: <strong className="text-stone-900">₹{displayOrder.quotePrice || displayOrder.price || 0}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedOrderDetails(displayOrder)}
                        className="font-bold text-[#8f2338] hover:underline"
                      >
                        {t("dashboardPage.detailsAndActions", "Details & Actions →")}
                      </button>
                    </div>
                  )}
                </div>

                {/* 4 Stat Highlights in a Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {/* Stat 1: Active Orders */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className="rounded-2xl border border-stone-200 bg-white p-3.5 text-left transition hover:border-[#8f2338]/40 hover:shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fdf2f4] text-[#8f2338]">
                        <ShoppingBag size={15} />
                      </div>
                      <svg className="h-5 w-9 text-rose-500" viewBox="0 0 36 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M2 15 Q 10 18, 18 10 T 34 4" />
                      </svg>
                    </div>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      {t("dashboardPage.activeOrders", "Active Orders")}
                    </p>
                    <p className="font-sans text-2xl font-bold text-stone-900">
                      {activeOrdersCount}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      {activeOrdersCount === 0 ? "No ongoing orders" : `${activeOrdersCount} ongoing`}
                    </p>
                  </button>

                  {/* Stat 2: Quotes Ready */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className="rounded-2xl border border-stone-200 bg-white p-3.5 text-left transition hover:border-amber-400 hover:shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fef9c3] text-[#b45309]">
                        <Tag size={15} />
                      </div>
                      <svg className="h-5 w-9 text-amber-500" viewBox="0 0 36 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M2 16 Q 10 10, 20 14 T 34 6" />
                      </svg>
                    </div>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      {t("dashboardPage.quotesReady", "Quotes Ready")}
                    </p>
                    <p className="font-sans text-2xl font-bold text-stone-900">
                      {quotesCount}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Awaiting your response
                    </p>
                  </button>

                  {/* Stat 3: Fit Profiles */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("measurements")}
                    className="rounded-2xl border border-stone-200 bg-white p-3.5 text-left transition hover:border-emerald-400 hover:shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#059669]">
                        <FileText size={15} />
                      </div>
                      <svg className="h-5 w-9 text-emerald-500" viewBox="0 0 36 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M2 14 Q 12 18, 20 10 T 34 4" />
                      </svg>
                    </div>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      {t("dashboardPage.fitProfiles", "Fit Profiles")}
                    </p>
                    <p className="font-sans text-2xl font-bold text-stone-900">
                      {measurements.length}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Saved in vault
                    </p>
                  </button>

                  {/* Stat 4: Saved Studios */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("saved")}
                    className="rounded-2xl border border-stone-200 bg-white p-3.5 text-left transition hover:border-rose-400 hover:shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fdf2f4] text-[#8f2338]">
                        <Heart size={15} />
                      </div>
                      <svg className="h-5 w-9 text-rose-500" viewBox="0 0 36 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M2 14 Q 10 6, 20 14 T 34 8" />
                      </svg>
                    </div>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      {t("dashboardPage.savedStudios", "Saved Studios")}
                    </p>
                    <p className="font-sans text-2xl font-bold text-stone-900">
                      {savedTailors.length}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      {savedTailors.length === 0 ? "No saved ateliers" : `${savedTailors.length} bookmarked`}
                    </p>
                  </button>
                </div>
              </div>
            </div>

            {/* =====================================================
                ROW 2: 3 EQUAL COLUMNS ACROSS FULL WIDTH
            ====================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Card 1: Fit Profiles */}
              <div className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fdf2f4] text-[#8f2338]">
                        <Ruler size={14} />
                      </div>
                      <h3 className="font-sans text-sm font-bold text-stone-900">
                        {t("dashboardPage.fitProfiles", "Fit Profiles")}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenCreateMeasurement}
                      className="text-xs font-bold text-[#8f2338] hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> {t("dashboardPage.add", "Add")}
                    </button>
                  </div>

                  {measurements.length === 0 ? (
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-xs text-stone-500 leading-relaxed max-w-[190px]">
                        {t(
                          "dashboardPage.noMeasurementsHelp",
                          "No saved measurements yet. Save your fit profile once to reuse across orders."
                        )}
                      </p>
                      <div className="h-24 w-24 shrink-0 flex items-center justify-center overflow-hidden rounded-2xl bg-amber-50/50 p-1 border border-stone-100">
                        <img
                          src="/assets/mannequin_fit_vault.jpg"
                          alt="Fit profile"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {measurements.slice(0, 2).map((m) => (
                        <div
                          key={m._id}
                          className="rounded-xl border border-stone-200 bg-[#fdfbf9] p-2.5 text-xs flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-stone-900">{m.name}</p>
                            <p className="text-[11px] text-stone-500">{m.garment}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenEditMeasurement(m)}
                            className="text-stone-400 hover:text-stone-700 p-1"
                          >
                            <Pencil size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={handleOpenCreateMeasurement}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                  >
                    <span>{t("dashboardPage.addFitProfile", "Add Fit Profile")} →</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Saved Studios */}
              <div className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fdf2f4] text-[#8f2338]">
                        <Bookmark size={14} />
                      </div>
                      <h3 className="font-sans text-sm font-bold text-stone-900">
                        {t("dashboardPage.savedStudios", "Saved Studios")}
                      </h3>
                    </div>
                    <Link
                      to="/my-tailors"
                      className="text-xs font-bold text-[#8f2338] hover:underline flex items-center gap-1"
                    >
                      {t("dashboardPage.viewAll", "View All")} →
                    </Link>
                  </div>

                  {displaySavedStudio ? (
                    <div className="mt-4 rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 transition hover:border-[#8f2338]/30">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <TailorAvatar
                            image={displaySavedStudio.image || displaySavedStudio.heroImage || displaySavedStudio.avatar}
                            name={displaySavedStudio.name}
                            size="md"
                            rounded="rounded-2xl"
                            alt={displaySavedStudio.name || "Studio"}
                          />
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-1">
                              {displaySavedStudio.name}
                            </h4>
                            <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} className="text-[#8f2338]" />
                              {displaySavedStudio.area || displaySavedStudio.city || "Local Atelier"}
                            </p>
                            <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                              <Star size={10} className="fill-amber-400 text-amber-500" />
                              <span>{displaySavedStudio.rating ? Number(displaySavedStudio.rating).toFixed(1) : "New"}</span>
                            </div>
                          </div>
                        </div>

                        <Heart size={16} className="text-[#8f2338] fill-[#8f2338] shrink-0 mt-1" />
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Link
                          to={
                            displaySavedStudio._id
                              ? `/tailors/${encodeURIComponent(displaySavedStudio._id)}`
                              : "/find-tailors"
                          }
                          className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 border border-stone-200 rounded-xl px-3 py-1.5 hover:bg-stone-50 transition"
                        >
                          <span>{t("dashboardPage.viewStudio", "View Studio")} →</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 py-8 text-center rounded-2xl border border-dashed border-stone-200">
                      <Bookmark size={28} className="mx-auto text-stone-300 mb-2" />
                      <p className="text-xs font-bold text-stone-700">
                        {isHi ? "कोई सहेजा गया दर्जी नहीं" : "No saved studios yet"}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {isHi ? "मनपसंद स्टूडियो को बुकमार्क करें।" : "Bookmark favorite ateliers on the map to find them here."}
                      </p>
                      <Link
                        to="/find-tailors"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e]"
                      >
                        <Search size={12} />
                        <span>{isHi ? "दर्जी खोजें" : "Explore Studios"}</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Quick Actions */}
              <div className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fdf2f4] text-[#8f2338]">
                      <Sparkles size={14} />
                    </div>
                    <h3 className="font-sans text-sm font-bold text-stone-900">
                      {t("dashboardPage.quickActions", "Quick Actions")}
                    </h3>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {/* Action 1: Find Tailors */}
                    <Link
                      to="/find-tailors"
                      className="group flex items-center justify-between rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3 transition hover:border-[#8f2338]/40 hover:bg-white shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Search size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900 group-hover:text-[#8f2338] transition">
                            {t("dashboardPage.findTailorsNearYou", "Find Tailors Near You")}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {t("dashboardPage.exploreStudiosSub", "Explore verified studios in your area")}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-stone-400 group-hover:text-[#8f2338] transition" />
                    </Link>

                    {/* Action 2: Manage Measurements */}
                    <button
                      type="button"
                      onClick={handleOpenCreateMeasurement}
                      className="group flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3 text-left transition hover:border-[#8f2338]/40 hover:bg-white shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                          <Ruler size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900 group-hover:text-[#8f2338] transition">
                            {t("dashboardPage.manageMeasurements", "Manage Measurements")}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {t("dashboardPage.manageMeasurementsSub", "Save and edit your fit profile")}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-stone-400 group-hover:text-[#8f2338] transition" />
                    </button>

                    {/* Action 3: Browse Categories */}
                    <Link
                      to="/find-tailors"
                      className="group flex items-center justify-between rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3 transition hover:border-[#8f2338]/40 hover:bg-white shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#8f2338]">
                          <Package size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900 group-hover:text-[#8f2338] transition">
                            {t("dashboardPage.browseCategories", "Browse Categories")}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {t("dashboardPage.browseCategoriesSub", "Explore garments and alteration services")}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-stone-400 group-hover:text-[#8f2338] transition" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================
              STANDARD TWO-COLUMN LAYOUT FOR TAILOR & OTHER TABS
          ========================================================== */
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* =======================================================
              LEFT SIDEBAR: USER PROFILE & QUICK STATS (4 COLS)
          ======================================================== */}
          <aside className="lg:col-span-4 space-y-5">
            {role === "tailor" ? (
              <>
                {/* Tailor Studio Profile Summary Card */}
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8f2338]">
                      {t("tailorDashboard.studioCardTitle", "Studio Atelier Profile")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditStudioOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#8f2338] hover:underline"
                    >
                      <Pencil size={12} /> {t("dashboardPage.edit", "Edit")}
                    </button>
                  </div>

                  {tailorData?.description && (
                    <p className="mt-3 text-xs sm:text-sm text-stone-700 italic border-l-2 border-[#8f2338] pl-3 py-0.5">
                      "{tailorData.description}"
                    </p>
                  )}

                  <ul className="mt-4 space-y-2.5 text-xs text-stone-600">
                    <li className="flex items-center gap-2.5">
                      <Scissors size={14} className="text-[#8f2338] shrink-0" />
                      <span>
                        {t("tailorDashboard.masterArtisan", "Master Artisan")}:{" "}
                        <strong className="text-stone-800">{tailorData?.owner || profile?.firstName || "Master Tailor"}</strong>
                      </span>
                    </li>

                    <li className="flex items-center gap-2.5">
                      <Tag size={14} className="text-stone-400 shrink-0" />
                      <span>
                        {t("tailorDashboard.startingRate", "Base Starting Rate")}:{" "}
                        <strong className="text-[#8f2338]">{money(tailorData?.minPrice ?? 0)}</strong>
                      </span>
                    </li>

                    <li className="flex items-center gap-2.5">
                      <Clock3 size={14} className="text-stone-400 shrink-0" />
                      <span>
                        {t("dashboardPage.experience", "Experience")}:{" "}
                        <strong className="text-stone-800">{tailorData?.experience !== undefined ? `${tailorData.experience} Years` : "—"}</strong>
                      </span>
                    </li>

                    <li className="flex items-center gap-2.5">
                      <Phone size={14} className="text-stone-400 shrink-0" />
                      <span>{tailorData?.phone || profile?.phone || t("dashboardPage.noPhone", "No phone added")}</span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <MapPin size={14} className="text-[#8f2338] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {[tailorData?.area, tailorData?.city, tailorData?.state].filter(Boolean).join(", ") || t("dashboardPage.locationNotSet", "Location not set")}
                      </span>
                    </li>
                  </ul>

                  {/* Specialties Pills */}
                  {tailorData?.categories?.length > 0 && (
                    <div className="mt-4 border-t border-stone-100 pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                        {t("dashboardPage.specialties", "Specialties")}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {tailorData.categories.map((cat) => (
                          <span
                            key={cat}
                            className="rounded-lg bg-rose-50 border border-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-900"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Verification & Discovery Ranking Booster Card */}
                {tailorData?.verified ? (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        {t("tailorDashboard.verifiedStudioStatus", "Verified Studio Status")}
                      </span>
                      <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                        100% {t("tailorDashboard.score", "Score")}
                      </span>
                    </div>

                    <div className="flex items-start gap-3.5 pt-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-bold text-stone-900">
                          {tailorData?.name || "Verified Master Studio"}
                        </h4>
                        <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                          {t("tailorDashboard.verifiedActiveText", "Your workshop profile is 100% verified and active. Your studio enjoys priority top placement on Find Tailors and full access to B2B commercial orders.")}
                        </p>
                      </div>
                    </div>

                    {tailorData?._id && (
                      <div className="pt-2 border-t border-emerald-100/60">
                        <Link
                          to={`/tailors/${encodeURIComponent(tailorData._id)}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8f2338] hover:underline"
                        >
                          <span>{t("dashboardPage.viewStudio", "View Public Studio Profile")}</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-500" />
                        {t("tailorDashboard.rankingBoosterTitle", "Discovery Ranking Booster")}
                      </span>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {tailorChecklist.score}% {t("tailorDashboard.score", "Score")}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-stone-500 mb-1">
                        <span>{t("tailorDashboard.profileCompleteness", "Search Listing Strength")}</span>
                        <span className="font-bold text-stone-800">{tailorChecklist.completedCount} of {tailorChecklist.totalCount} completed</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#8f2338] to-emerald-500 transition-all duration-500"
                          style={{ width: `${tailorChecklist.score}%` }}
                        />
                      </div>
                    </div>

                    {/* 5-Step Checklist */}
                    <ul className="space-y-2.5 text-xs">
                      {tailorChecklist.steps.map((step) => (
                        <li key={step.id} className="flex items-start gap-2.5">
                          {step.done ? (
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-stone-300 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className={`font-semibold ${step.done ? "text-stone-800" : "text-stone-500"}`}>
                              {step.title}
                            </p>
                            <p className="text-[11px] text-stone-400 line-clamp-1">{step.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Explanation Notice */}
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-stone-800 leading-relaxed">
                      💡 <strong>{t("tailorDashboard.trendTipHeading", "How to Trend on Find Tailors")}:</strong>{" "}
                      {t(
                        "tailorDashboard.trendTipDesc",
                        "Verified studios with complete rate cards and workshop GPS rank #1 in customer search results and receive up to 5× more quote inquiries."
                      )}
                    </div>

                    {/* Call to action */}
                    {!tailorData?.verified && (
                      <button
                        type="button"
                        onClick={() => setIsApplyVerificationOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                      >
                        <ShieldCheck size={14} />
                        <span>{t("verification.applyButton", "Apply for Verification")}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Tailor Quick Activity Metrics */}
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    {t("tailorDashboard.studioMetrics", "Studio Performance Highlights")}
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("orders");
                        setTailorOrdersFilter("needsQuote");
                      }}
                      className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-left hover:border-[#8f2338]/40 hover:bg-white transition"
                    >
                      <p className="text-[10px] font-bold text-stone-400 uppercase">{t("tailorDashboard.needsQuote", "Pending Quotes")}</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-[#8f2338]">
                        {tailorPendingQuotesCount}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("orders");
                        setTailorOrdersFilter("inProduction");
                      }}
                      className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-left hover:border-blue-400 hover:bg-white transition"
                    >
                      <p className="text-[10px] font-bold text-stone-400 uppercase">{t("tailorDashboard.inProduction", "In Production")}</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-blue-800">
                        {tailorInProductionCount}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("orders");
                        setTailorOrdersFilter("readyOrDone");
                      }}
                      className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-left hover:border-emerald-400 hover:bg-white transition"
                    >
                      <p className="text-[10px] font-bold text-stone-400 uppercase">{t("tailorDashboard.completed", "Completed Jobs")}</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-emerald-800">
                        {tailorCompletedCount}
                      </p>
                    </button>

                    <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-left">
                      <p className="text-[10px] font-bold text-stone-400 uppercase">{t("tailorDashboard.revenue", "Studio Revenue")}</p>
                      <p className="mt-1 font-serif text-xl font-bold text-[#8f2338] truncate">
                        {money(tailorRevenue)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : role === "business" ? (
              <>
                {/* Enterprise Corporate Profile Card */}
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-[#8f2338]">
                        <Building2 size={16} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8f2338]">
                        Enterprise Entity
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("verification")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#8f2338] hover:underline"
                    >
                      <Pencil size={12} /> Edit / Verify
                    </button>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      {businessProfile?.companyName || (profile?.firstName ? `${profile.firstName}'s Enterprise` : "Unregistered Enterprise")}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {businessProfile?.businessType || "B2B Procurement Entity"}
                    </p>
                  </div>

                  {/* GSTIN Badge & Identification */}
                  <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">GSTIN Identifier</span>
                      {businessProfile?.verificationStatus === "verified" || businessProfile?.verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      ) : businessProfile?.verificationStatus === "pending" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                          <Clock3 size={12} /> Audit Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                          <AlertCircle size={12} /> Unverified
                        </span>
                      )}
                    </div>
                    <p className="font-mono font-bold text-stone-800 text-xs tracking-wider">
                      {businessProfile?.gstin || "NOT PROVIDED"}
                    </p>
                    {businessProfile?.panNumber && (
                      <p className="text-[11px] text-stone-500">
                        PAN: <strong className="font-mono text-stone-700">{businessProfile.panNumber}</strong>
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2.5 text-xs text-stone-600">
                    <li className="flex items-center gap-2.5">
                      <User size={14} className="text-stone-400 shrink-0" />
                      <span>Officer: <strong className="text-stone-800">{businessProfile?.contactPerson || profile?.firstName || "Authorized Signatory"}</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Phone size={14} className="text-stone-400 shrink-0" />
                      <span>{businessProfile?.contactPhone || profile?.phone || "No phone added"}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Mail size={14} className="text-stone-400 shrink-0" />
                      <span className="truncate">{profile?.email || "—"}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <MapPin size={14} className="text-[#8f2338] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {[businessProfile?.address, businessProfile?.city, businessProfile?.state, businessProfile?.pincode].filter(Boolean).join(", ") || "Corporate HQ Address Not Configured"}
                      </span>
                    </li>
                  </ul>

                  {/* Audit Quick Action */}
                  {businessProfile?.verificationStatus !== "verified" && !businessProfile?.verified && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("verification")}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                    >
                      <ShieldCheck size={14} />
                      <span>Complete GSTIN Audit</span>
                    </button>
                  )}
                </div>

                {/* B2B Procurement Activity Metrics */}
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Procurement Highlights
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("bulk")}
                      className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-left hover:border-[#8f2338]/40 hover:bg-white transition"
                    >
                      <p className="text-[10px] font-bold text-stone-400 uppercase">Published RFQs</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-[#8f2338]">
                        {businessRequests.length}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("bulk")}
                      className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-left hover:border-emerald-400 hover:bg-white transition"
                    >
                      <p className="text-[10px] font-bold text-stone-400 uppercase">Quotes Received</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-emerald-800">
                        {businessRequests.reduce((acc, r) => acc + (r.quotes?.length || 0), 0)}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("orders")}
                      className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-left hover:border-blue-400 hover:bg-white transition"
                    >
                      <p className="text-[10px] font-bold text-stone-400 uppercase">Active Orders</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-stone-800">
                        {orders.length}
                      </p>
                    </button>

                    <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-left">
                      <p className="text-[10px] font-bold text-stone-400 uppercase">Audit Status</p>
                      <p className={`mt-1 font-sans text-xs font-black uppercase truncate ${
                        businessProfile?.verificationStatus === "verified" || businessProfile?.verified
                          ? "text-emerald-700"
                          : businessProfile?.verificationStatus === "pending"
                          ? "text-amber-700"
                          : "text-rose-700"
                      }`}>
                        {businessProfile?.verificationStatus || "Unverified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* B2B Compliance Strength Booster */}
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-500" />
                      Compliance Strength
                    </span>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {businessChecklist.score}% Score
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-stone-500 mb-1">
                      <span>Verification Progress</span>
                      <span className="font-bold text-stone-800">{businessChecklist.completedCount} of {businessChecklist.totalCount} completed</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8f2338] to-emerald-500 transition-all duration-500"
                        style={{ width: `${businessChecklist.score}%` }}
                      />
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs">
                    {businessChecklist.steps.map((step) => (
                      <li key={step.id} className="flex items-start gap-2.5">
                        {step.done ? (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-stone-300 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className={`font-semibold ${step.done ? "text-stone-800" : "text-stone-500"}`}>
                            {step.title}
                          </p>
                          <p className="text-[11px] text-stone-400 line-clamp-1">{step.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-stone-800 leading-relaxed">
                    💡 <strong>B2B Marketplace Policy:</strong> Verified business profiles with verified GSTIN credentials receive faster responses and competitive bids from top-tier tailors.
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Customer Profile Overview Card */}
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8f2338]">
                      {t("dashboardPage.accountOverview", "Account Overview")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditProfileOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#8f2338] hover:underline"
                    >
                      <Pencil size={12} /> {t("dashboardPage.edit", "Edit")}
                    </button>
                  </div>

                  {profile?.bio && (
                    <p className="mt-3 text-xs sm:text-sm text-stone-700 italic border-l-2 border-[#8f2338] pl-3 py-0.5">
                      "{profile.bio}"
                    </p>
                  )}

                  <ul className="mt-4 space-y-2.5 text-xs text-stone-600">
                    <li className="flex items-center gap-2.5">
                      <Mail size={14} className="text-stone-400 shrink-0" />
                      <span className="truncate">{profile?.email || "—"}</span>
                    </li>

                    <li className="flex items-center gap-2.5">
                      <Phone size={14} className="text-stone-400 shrink-0" />
                      <span>{profile?.phone || t("dashboardPage.noPhone", "No phone added")}</span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <MapPin size={14} className="text-[#8f2338] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {profile?.location?.label || t("dashboardPage.noLocation", "No location saved")}
                      </span>
                    </li>

                    <li className="flex items-center gap-2.5">
                      <Globe size={14} className="text-stone-400 shrink-0" />
                      <span>
                        {t("dashboardPage.language", "Language")}:{" "}
                        <strong className="text-stone-800">
                          {profile?.preferredLanguage === "hi" ? "हिन्दी (Hindi)" : "English"}
                        </strong>
                      </span>
                    </li>

                    <li className="flex items-center gap-2.5">
                      <Calendar size={14} className="text-stone-400 shrink-0" />
                      <span>
                        {t("dashboardPage.joined", "Joined")}:{" "}
                        <strong className="text-stone-800">
                          {profile?.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString()
                            : t("dashboardPage.activeMember", "Active Member")}
                        </strong>
                      </span>
                    </li>
                  </ul>

                  <div className="mt-5 border-t border-stone-100 pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      {t("dashboardPage.searchPreferences", "Search Preferences")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                      <span className="rounded-xl border border-stone-200 bg-[#fdfbf9] px-2.5 py-1 text-stone-700 font-medium">
                        📍 {profile?.searchPreferences?.radiusKm || 10} {t("dashboardPage.kmRadius", "km radius")}
                      </span>
                      <span className="rounded-xl border border-stone-200 bg-[#fdfbf9] px-2.5 py-1 text-stone-700 font-medium">
                        ⚡ {t("dashboardPage.sort", "Sort")}: {profile?.searchPreferences?.sortBy || "Recommended"}
                      </span>
                    </div>

                    {profile?.searchPreferences?.categories?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {profile.searchPreferences.categories.map((cat) => (
                          <span
                            key={cat}
                            className="rounded-lg bg-rose-50 border border-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-900"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Activity Highlights */}
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    {t("dashboardPage.activityHighlights", "Activity Highlights")}
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("orders")}
                      className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-left hover:border-[#8f2338]/40 hover:bg-white transition"
                    >
                      <p className="text-[10px] font-bold text-stone-400 uppercase">{t("dashboardPage.activeOrders", "Active Orders")}</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-[#8f2338]">
                        {activeOrdersCount}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("orders")}
                      className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-left hover:border-[#8f2338]/40 hover:bg-white transition"
                    >
                      <p className="text-[10px] font-bold text-stone-400 uppercase">{t("dashboardPage.quotesReady", "Quotes Ready")}</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-[#8f2338]">
                        {quotesCount}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("measurements")}
                      className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-left hover:border-[#8f2338]/40 hover:bg-white transition"
                    >
                      <p className="text-[10px] font-bold text-stone-400 uppercase">{t("dashboardPage.fitProfiles", "Fit Profiles")}</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-stone-800">
                        {measurements.length}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("saved")}
                      className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 text-left hover:border-[#8f2338]/40 hover:bg-white transition"
                    >
                      <p className="text-[10px] font-bold text-stone-400 uppercase">{t("dashboardPage.savedStudios", "Saved Studios")}</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-stone-800">
                        {savedTailors.length}
                      </p>
                    </button>
                  </div>
                </div>
              </>
            )}
          </aside>

          {/* =======================================================
              RIGHT MAIN AREA: DYNAMIC GITHUB-STYLE WORKSPACE (8 COLS)
          ======================================================== */}
          <div className="lg:col-span-8 space-y-6">
            {role === "tailor" && (
              <>
                {/* -------------------------------------------------
                    TAILOR TAB 1: OVERVIEW (STUDIO COCKPIT & ACTIONS)
                -------------------------------------------------- */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* 1. Studio Verification Booster Banner */}
                    {tailorData?.verified ? (
                      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white p-6 sm:p-7 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                              <ShieldCheck size={26} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="font-serif text-lg sm:text-xl font-bold text-emerald-950">
                                  {tailorData.name || "Master Tailor Atelier"}
                                </h2>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                  ✓ {t("verification.verifiedBadge", "Verified Studio")}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-emerald-800 mt-1 max-w-xl">
                                {t("tailorDashboard.verifiedTrendingNotice", "Your atelier is officially verified by platform administration and actively trending on Find Tailors (/find-tailors).")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsEditStudioOpen(true)}
                              className="rounded-xl border border-emerald-300 bg-white px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-2xs hover:bg-emerald-50 transition"
                            >
                              <Pencil size={12} className="inline mr-1" />
                              <span>{t("dashboardPage.editStudio", "Edit Studio & Rates")}</span>
                            </button>
                            {tailorData?._id && (
                              <Link
                                to={`/tailors/${encodeURIComponent(tailorData._id)}`}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-900 transition"
                              >
                                <span>{t("dashboardPage.viewPublicStudio", "Live Listing")}</span>
                                <ExternalLink size={12} />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : tailorData?.verificationStatus === "pending" ? (
                      <div className="rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-50/80 to-white p-6 sm:p-7 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8f2338] text-white shadow-md">
                              <Clock3 size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                                  {tailorData?.name || "Tailor Studio"}
                                </h2>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#8f2338] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                  ⏳ {t("verification.pendingBadge", "Verification Under Review")}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                                {t("tailorDashboard.pendingReviewNotice", "Your studio verification application is being evaluated by MeraTailor administrators. Once approved, you will rank and appear in customer search results.")}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsEditStudioOpen(true)}
                            className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-[#8f2338] shadow-2xs hover:bg-rose-50 transition"
                          >
                            <Pencil size={12} className="inline mr-1" />
                            <span>{t("dashboardPage.editStudio", "Edit Studio Details")}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-50 via-orange-50/40 to-white p-6 sm:p-7 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8f2338] text-white shadow-md">
                              <AlertCircle size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="font-serif text-lg sm:text-xl font-bold text-rose-950">
                                  {tailorData?.name || "Unverified Tailor Studio"}
                                </h2>
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-900 uppercase tracking-wider">
                                  {t("verification.unverifiedBadge", "Unverified Studio")}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-rose-800 mt-1 max-w-xl">
                                {t("tailorDashboard.unverifiedNotice", "To protect customers, only verified tailors appear in search and discovery on Find Tailors (/find-tailors). Complete your studio profile and apply for verification.")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsEditStudioOpen(true)}
                              className="rounded-xl border border-rose-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-800 shadow-2xs hover:bg-rose-50 transition"
                            >
                              <Pencil size={12} className="inline mr-1" />
                              <span>{t("dashboardPage.editStudio", "Edit Profile")}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsApplyVerificationOpen(true)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                            >
                              <ShieldCheck size={14} />
                              <span>{t("verification.applyButton", "Apply for Verification")}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. Public Studio Card Preview & Discovery Rank */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Public Card Replica Preview */}
                      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8f2338] bg-[#f7eee5] px-2.5 py-1 rounded-lg">
                              {t("tailorDashboard.livePublicPreview", "Live Directory Preview")}
                            </span>
                            <span className="text-xs font-semibold text-stone-400">
                              /find-tailors
                            </span>
                          </div>

                          <div className="mt-4 rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-serif text-base font-bold text-stone-900">
                                  {tailorData?.name || "Master Atelier Studio"}
                                </h3>
                                <p className="text-xs text-stone-500 mt-0.5">
                                  {tailorData?.owner || profile?.firstName || "Master Tailor"} · {tailorData?.city || "Jaipur"}, {tailorData?.area || ""}
                                </p>
                              </div>
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900">
                                ★ {tailorData?.rating ? Number(tailorData.rating).toFixed(1) : "New"} {tailorData?.reviews > 0 && <span className="text-stone-400 font-normal">({tailorData.reviews})</span>}
                              </span>
                            </div>

                            <p className="mt-2.5 text-xs text-stone-600 line-clamp-2">
                              {tailorData?.description || t("tailorDashboard.defaultBio", "Bespoke handcrafted tailoring, custom garments, and precision alterations.")}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-1">
                              {(tailorData?.categories?.length > 0 ? tailorData.categories : []).map((cat) => (
                                <span key={cat} className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                                  {cat}
                                </span>
                              ))}
                              {(!tailorData?.categories || tailorData.categories.length === 0) && (
                                <span className="text-[10px] text-stone-400 italic">No specialties listed</span>
                              )}
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-3 text-xs">
                              <div>
                                <span className="text-stone-400 text-[10px] uppercase font-bold block">{t("dashboardPage.startingFrom", "Starting from")}</span>
                                <strong className="text-sm font-extrabold text-[#8f2338]">
                                  {money(tailorData?.minPrice ?? 0)}
                                </strong>
                              </div>
                              {tailorData?._id && (
                                <Link
                                  to={`/tailors/${encodeURIComponent(tailorData._id)}`}
                                  className="rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-stone-800"
                                >
                                  {t("dashboardPage.viewStudio", "View Studio")} →
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="mt-3 text-[11px] text-stone-500 text-center">
                          {t("tailorDashboard.previewHelp", "This is exactly how potential customers see your atelier in search results.")}
                        </p>
                      </div>

                      {/* Studio Discovery Checklist Card */}
                      {tailorData?.verified ? (
                        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                              <div className="flex items-center gap-2">
                                <ShieldCheck size={18} className="text-emerald-600" />
                                <h3 className="font-serif text-base font-bold text-stone-900">
                                  {t("tailorDashboard.rankingStrength", "Discovery Ranking Strength")}
                                </h3>
                              </div>
                              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                                100%
                              </span>
                            </div>

                            <div className="mt-4 flex items-start gap-3.5">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                                <CheckCircle2 size={20} />
                              </div>
                              <div>
                                <h4 className="font-serif text-base font-bold text-emerald-950">
                                  Top Search Visibility Active
                                </h4>
                                <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                                  All studio profile details, service rate cards, workshop location, and artisan verification credentials are confirmed. Customers in your service radius find your atelier at the top of results.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs">
                            <span className="text-emerald-800 font-medium">All 5 milestones complete</span>
                            <button
                              type="button"
                              onClick={() => setIsEditStudioOpen(true)}
                              className="font-bold text-[#8f2338] hover:underline"
                            >
                              {t("tailorDashboard.editAllFields", "Edit Studio Profile")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                              <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-[#8f2338]" />
                                <h3 className="font-serif text-base font-bold text-stone-900">
                                  {t("tailorDashboard.rankingStrength", "Discovery Ranking Strength")}
                                </h3>
                              </div>
                              <span className="text-xs font-extrabold text-[#8f2338] bg-[#f7eee5] px-2.5 py-0.5 rounded-lg">
                                {tailorChecklist.score}%
                              </span>
                            </div>

                            {/* Progress Meter */}
                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-100">
                              <div
                                className="h-full bg-gradient-to-r from-rose-400 to-[#8f2338] transition-all duration-700"
                                style={{ width: `${tailorChecklist.score}%` }}
                              />
                            </div>

                            <div className="mt-4 space-y-2.5">
                              {tailorChecklist.steps.map((step) => (
                                <div
                                  key={step.id}
                                  className={`flex items-center justify-between rounded-xl p-2.5 transition text-xs ${
                                    step.done ? "bg-emerald-50/50 border border-emerald-100" : "bg-stone-50 border border-stone-200"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    {step.done ? (
                                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full border-2 border-stone-300 shrink-0" />
                                    )}
                                    <div>
                                      <p className={`font-bold ${step.done ? "text-emerald-950 line-through opacity-80" : "text-stone-800"}`}>
                                        {step.title}
                                      </p>
                                      <p className="text-[10px] text-stone-500">{step.desc}</p>
                                    </div>
                                  </div>

                                  {!step.done && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (step.id === "verified") setIsApplyVerificationOpen(true);
                                        else setIsEditStudioOpen(true);
                                      }}
                                      className="text-[11px] font-bold text-[#8f2338] hover:underline shrink-0"
                                    >
                                      {t("tailorDashboard.completeStep", "Fix")} →
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                            <span className="text-stone-500">{tailorChecklist.completedCount} / {tailorChecklist.totalCount} completed</span>
                            <button
                              type="button"
                              onClick={() => setIsEditStudioOpen(true)}
                              className="font-bold text-[#8f2338] hover:underline"
                            >
                              {t("tailorDashboard.editAllFields", "Edit Studio Profile")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. Action Items: Urgent Quotations */}
                    <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f7eee5] text-[#8f2338]">
                            <ShoppingBag size={16} />
                          </span>
                          <div>
                            <h3 className="font-serif text-lg font-bold text-[#231b1a]">
                              {t("tailorDashboard.urgentQuotations", "Inquiries Awaiting Quotation")}
                            </h3>
                            <p className="text-xs text-stone-500">
                              {t("tailorDashboard.urgentQuotationsSub", "Respond quickly with price estimates to convert client inquiries into confirmed jobs.")}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setTailorOrdersFilter("needsQuote");
                            setActiveTab("orders");
                          }}
                          className="text-xs font-bold text-[#8f2338] hover:underline"
                        >
                          {t("dashboardPage.viewAll", "View All")} ({tailorPendingQuotesCount}) →
                        </button>
                      </div>

                      {tailorPendingQuotesCount === 0 ? (
                        <div className="py-8 text-center rounded-2xl border border-dashed border-stone-200">
                          <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                          <p className="font-serif text-sm font-bold text-stone-800">
                            {t("tailorDashboard.noPendingQuotes", "All caught up! No quotes pending.")}
                          </p>
                          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                            {tailorData?.verified
                              ? t("tailorDashboard.verifiedWaitingOrders", "Your studio is live! New customer orders will appear here in real-time.")
                              : t("tailorDashboard.getVerifiedTip", "Apply for verification to get listed in search results and receive more client quotes.")}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {tailorRequests
                            .filter((r) => r.status === "Request Sent")
                            .slice(0, 3)
                            .map((req) => (
                              <div
                                key={req.id || req._id}
                                className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 transition hover:bg-rose-50/70"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-bold text-[#8f2338]">#{req.id}</span>
                                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-[#8f2338] uppercase">
                                        Needs Quote
                                      </span>
                                    </div>
                                    <h4 className="font-serif text-base font-bold text-stone-900 mt-1">
                                      {req.quantity || 1} × {req.garment || req.category}
                                    </h4>
                                    <p className="text-xs text-stone-600 mt-0.5">
                                      {[req.color ? `Color: ${req.color}` : null, req.fabric ? `Fabric: ${req.fabric}` : null, req.deadline ? `Deadline: ${req.deadline}` : null].filter(Boolean).join(" · ")}
                                    </p>
                                    {req.notes && (
                                      <p className="text-xs text-stone-700 mt-1.5 italic bg-white p-2 rounded-lg border border-rose-200/60">
                                        "{req.notes}"
                                      </p>
                                    )}
                                  </div>

                                  {/* Quick Quote Form */}
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      const amt = quoteDrafts[req.id];
                                      if (!amt) return toast.error("Please enter a quote amount");
                                      handleTailorUpdateOrder(req, "quote", amt);
                                    }}
                                    className="flex items-center gap-2 mt-2 sm:mt-0"
                                  >
                                    <div className="relative">
                                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">₹</span>
                                      <input
                                        type="number"
                                        min="1"
                                        required
                                        value={quoteDrafts[req.id] ?? ""}
                                        onChange={(e) => setQuoteDrafts({ ...quoteDrafts, [req.id]: e.target.value })}
                                        placeholder="Quote amount"
                                        className="w-32 rounded-xl border border-stone-300 bg-white pl-6 pr-2.5 py-1.5 text-xs outline-none focus:border-[#8f2338]"
                                      />
                                    </div>
                                    <button
                                      disabled={actingId === req.id}
                                      className="rounded-xl bg-[#8f2338] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] disabled:opacity-60"
                                    >
                                      {actingId === req.id ? "…" : t("dashboardPage.sendQuote", "Send Quote")}
                                    </button>
                                  </form>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------
                    TAILOR TAB 2: ORDERS & QUOTES PIPELINE
                -------------------------------------------------- */}
                {activeTab === "orders" && (
                  <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                      <div>
                        <h2 className="font-serif text-xl font-bold text-[#231b1a]">
                          {t("tailorDashboard.ordersPipelineTitle", "Client Orders & Quotes Pipeline")}
                        </h2>
                        <p className="text-xs text-stone-500">
                          {t("tailorDashboard.ordersPipelineSubtitle", "Review client inquiries, submit price quotes, manage production milestones, and archive completed jobs.")}
                        </p>
                      </div>

                      <div className="relative">
                        <Search
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          value={tailorOrdersSearch}
                          onChange={(e) => setTailorOrdersSearch(e.target.value)}
                          placeholder={t("tailorDashboard.searchOrders", "Search client orders...")}
                          className="w-full sm:w-56 rounded-xl border border-stone-200 bg-[#fdfbf9] pl-8 pr-3 py-1.5 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                      {[
                        { id: "all", label: t("dashboardPage.filterAll", "All"), count: tailorRequests.length },
                        { id: "needsQuote", label: t("tailorDashboard.filterNeedsQuote", "Needs Quote"), count: tailorPendingQuotesCount },
                        { id: "quoted", label: t("tailorDashboard.filterQuoted", "Quoted / Awaiting Client"), count: tailorRequests.filter((r) => r.status === "Quote Received").length },
                        { id: "inProduction", label: t("dashboardPage.filterInProgress", "In Production"), count: tailorInProductionCount },
                        { id: "readyOrDone", label: t("dashboardPage.filterCompleted", "Ready / Completed"), count: tailorCompletedCount },
                        { id: "cancelled", label: t("tailorDashboard.filterCancelled", "Cancelled"), count: tailorRequests.filter((r) => r.status === "Cancelled").length },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => setTailorOrdersFilter(filter.id)}
                          className={`rounded-xl px-3 py-1.5 font-bold transition whitespace-nowrap ${
                            tailorOrdersFilter === filter.id
                              ? "bg-[#8f2338] text-white"
                              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          }`}
                        >
                          {filter.label} ({filter.count})
                        </button>
                      ))}
                    </div>

                    {/* Orders List */}
                    {filteredTailorRequests.length === 0 ? (
                      <div className="py-12 text-center rounded-2xl border border-dashed border-stone-200">
                        <ShoppingBag size={40} className="mx-auto text-stone-300 mb-3" />
                        <p className="font-serif text-base font-bold text-stone-800">
                          {t("tailorDashboard.noMatchingOrders", "No client orders found in this category")}
                        </p>
                        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                          {tailorData?.verified
                            ? t("tailorDashboard.verifiedWaitingOrders", "Your studio is live! New customer orders will appear here in real-time.")
                            : t("tailorDashboard.applyVerificationTip", "Apply for studio verification to appear on Find Tailors and start receiving orders.")}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredTailorRequests.map((req) => (
                          <article
                            key={req.id || req._id}
                            className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 sm:p-5 transition hover:border-stone-300 shadow-2xs"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex items-start gap-3.5">
                                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-[#fdf2f4] border border-rose-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                  <img
                                    src={req.image || "/assets/kurta.png"}
                                    alt={req.garment || req.category || "Order"}
                                    className="h-full w-full object-contain"
                                    onError={(e) => {
                                      e.currentTarget.src = "/assets/kurta.png";
                                    }}
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-[#8f2338]">
                                      #{req.id}
                                    </span>
                                    <span className="h-1 w-1 rounded-full bg-stone-300" />
                                    <span className="text-xs text-stone-400">
                                      {new Date(req.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <h3 className="font-serif text-base font-bold text-stone-900 mt-0.5">
                                    {req.quantity || 1} × {req.garment || req.category}
                                  </h3>
                                  <p className="text-xs text-stone-600 mt-1">
                                    {[req.color ? `Color: ${req.color}` : null, req.fabric ? `Fabric: ${req.fabric}` : null, req.deadline ? `Due: ${req.deadline}` : null].filter(Boolean).join(" · ")}
                                  </p>
                                {req.notes && (
                                  <p className="text-xs text-stone-600 mt-2 bg-white p-2.5 rounded-xl border border-stone-100">
                                    <strong className="text-stone-700">{t("dashboardPage.notes", "Customer Notes")}:</strong> {req.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                              <div className="text-right">
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  req.status === "Completed"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : req.status === "Cancelled"
                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                    : req.status === "In Production"
                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                    : "bg-rose-50 text-[#8f2338] border border-rose-200"
                                }`}>
                                  {req.status}
                                </span>
                                {req.quotePrice != null && (
                                  <p className="mt-1 text-xs font-bold text-[#8f2338]">
                                    {t("dashboardPage.quoted", "Quoted")}: {money(req.quotePrice)}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Tailor Actions by Status */}
                            {req.status === "Request Sent" && (
                              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 border-t border-stone-200 pt-3">
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const amt = quoteDrafts[req.id];
                                    if (!amt) return toast.error("Please enter quote amount");
                                    handleTailorUpdateOrder(req, "quote", amt);
                                  }}
                                  className="flex-1 flex items-end gap-2"
                                >
                                  <label className="flex-1 text-xs font-semibold text-stone-700">
                                    {t("dashboardPage.quoteTotal", "Send Price Quote (₹)")}
                                    <input
                                      type="number"
                                      min="1"
                                      required
                                      value={quoteDrafts[req.id] ?? ""}
                                      onChange={(e) =>
                                        setQuoteDrafts({ ...quoteDrafts, [req.id]: e.target.value })
                                      }
                                      placeholder="e.g. 1200"
                                      className="mt-1 block w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#8f2338]"
                                    />
                                  </label>
                                  <button
                                    disabled={actingId === req.id}
                                    className="rounded-xl bg-[#8f2338] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] disabled:opacity-60"
                                  >
                                    {actingId === req.id ? "Sending…" : t("dashboardPage.sendQuote", "Send Quote")}
                                  </button>
                                </form>

                                <button
                                  type="button"
                                  disabled={actingId === req.id}
                                  onClick={() => handleTailorDeclineOrder(req)}
                                  className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                                >
                                  {t("dashboardPage.declineRequest", "Decline Request")}
                                </button>
                              </div>
                            )}

                            {req.status === "Quote Received" && (
                              <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3 text-xs text-stone-500">
                                <span>⏳ {t("dashboardPage.waitingCustomerAccept", "Price quote sent. Waiting for customer confirmation.")}</span>
                                <button
                                  type="button"
                                  disabled={actingId === req.id}
                                  onClick={() => handleTailorDeclineOrder(req)}
                                  className="text-xs font-bold text-rose-600 hover:underline"
                                >
                                  {t("dashboardPage.cancelQuote", "Cancel Quote / Decline")}
                                </button>
                              </div>
                            )}

                            {req.status === "Accepted" && (
                              <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-3">
                                <span className="text-xs font-semibold text-emerald-800">
                                  ✓ {t("dashboardPage.customerAcceptedQuote", "Customer accepted quote. Ready to begin work.")}
                                </span>
                                <button
                                  type="button"
                                  disabled={actingId === req.id}
                                  onClick={() => handleTailorUpdateOrder(req, "status", "In Production")}
                                  className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-stone-800"
                                >
                                  {actingId === req.id ? "Updating…" : t("dashboardPage.startProduction", "Start Production →")}
                                </button>
                              </div>
                            )}

                            {req.status === "In Production" && (
                              <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-3">
                                <span className="text-xs font-semibold text-blue-800">
                                  🧵 {t("dashboardPage.garmentInProduction", "Garment is currently in production.")}
                                </span>
                                <button
                                  type="button"
                                  disabled={actingId === req.id}
                                  onClick={() => handleTailorUpdateOrder(req, "status", "Ready for Pickup")}
                                  className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
                                >
                                  {actingId === req.id ? "Updating…" : t("dashboardPage.markReady", "Mark Ready for Pickup ✓")}
                                </button>
                              </div>
                            )}

                            {req.status === "Ready for Pickup" && (
                              <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-3">
                                <span className="text-xs font-semibold text-emerald-800">
                                  📦 {t("dashboardPage.readyAwaitingDelivery", "Ready for customer collection or delivery.")}
                                </span>
                                <button
                                  type="button"
                                  disabled={actingId === req.id}
                                  onClick={() => handleTailorUpdateOrder(req, "status", "Completed")}
                                  className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-stone-800"
                                >
                                  {actingId === req.id ? "Completing…" : t("dashboardPage.markCompleted", "Mark Completed 🎉")}
                                </button>
                              </div>
                            )}

                            {(req.status === "Completed" || req.status === "Cancelled") && (
                              <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3 text-xs text-stone-500">
                                <span>{req.status === "Completed" ? "🎉 Order fulfilled successfully." : "Order was declined or cancelled."}</span>
                                <button
                                  type="button"
                                  disabled={actingId === req.id}
                                  onClick={() => handleTailorDeleteOrder(req)}
                                  className="text-xs font-bold text-stone-400 hover:text-rose-600 hover:underline"
                                >
                                  {t("dashboardPage.archiveOrder", "Archive Order")}
                                </button>
                              </div>
                            )}
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* -------------------------------------------------
                    TAILOR TAB 3: STUDIO PROFILE & RATE CARD
                -------------------------------------------------- */}
                {activeTab === "studio" && (
                  <div className="space-y-6">
                    {/* Studio Profile Overview */}
                    <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                        <div className="flex items-center gap-3.5">
                          <TailorAvatar
                            image={tailorData?.image || profile?.avatar || profile?.imageUrl || user?.imageUrl}
                            name={tailorData?.name || profile?.firstName || "Studio"}
                            size="lg"
                            rounded="rounded-2xl"
                            alt={tailorData?.name || "Studio"}
                          />
                          <div>
                            <h2 className="font-serif text-xl font-bold text-[#231b1a]">
                              {tailorData?.name || "My Tailoring Studio"}
                            </h2>
                            <p className="text-xs text-stone-500">
                              {tailorData?.owner || profile?.firstName} · {tailorData?.city || "Jaipur"}, {tailorData?.area || ""}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditStudioOpen(true)}
                          className="rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e]"
                        >
                          <Pencil size={12} className="inline mr-1" />
                          <span>{t("dashboardPage.editDetails", "Edit Profile & Rates")}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="bg-[#fdfbf9] p-4 rounded-2xl border border-stone-200">
                          <p className="text-stone-400 uppercase font-bold text-[10px]">{t("dashboardPage.experience", "Craftsmanship Experience")}</p>
                          <p className="text-base font-bold text-stone-900 mt-1">{tailorData?.experience !== undefined ? `${tailorData.experience} ${t("dashboardPage.years", "Years")}` : "—"}</p>
                        </div>
                        <div className="bg-[#fdfbf9] p-4 rounded-2xl border border-stone-200">
                          <p className="text-stone-400 uppercase font-bold text-[10px]">{t("dashboardPage.startingPrice", "Base Starting Rate")}</p>
                          <p className="text-base font-bold text-[#8f2338] mt-1">{money(tailorData?.minPrice ?? 0)}</p>
                        </div>
                        <div className="bg-[#fdfbf9] p-4 rounded-2xl border border-stone-200">
                          <p className="text-stone-400 uppercase font-bold text-[10px]">{t("dashboardPage.contactPhone", "Studio Phone")}</p>
                          <p className="text-base font-bold text-stone-900 mt-1">{tailorData?.phone || "—"}</p>
                        </div>
                      </div>

                      {tailorData?.description && (
                        <div className="rounded-2xl bg-[#fdfbf9] border border-stone-200 p-4">
                          <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">{t("tailorDashboard.aboutStudio", "About Atelier & Story")}</p>
                          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                            {tailorData.description}
                          </p>
                        </div>
                      )}

                      {/* Specialties */}
                      {tailorData?.categories?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-stone-400 uppercase mb-2">{t("dashboardPage.specialties", "Garment Specialties")}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {tailorData.categories.map((cat) => (
                              <span
                                key={cat}
                                className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-900"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Services & Rate Card Table */}
                    <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-stone-900">
                            {t("dashboardPage.rateCardServices", "Rate Card & Service Menu")}
                          </h3>
                          <p className="text-xs text-stone-500">
                            {t("tailorDashboard.rateCardSub", "Displayed to prospective clients to provide transparent upfront pricing.")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditStudioOpen(true)}
                          className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-bold text-[#8f2338] hover:bg-stone-100"
                        >
                          + {t("dashboardPage.manageServices", "Manage Services")}
                        </button>
                      </div>

                      {(!tailorData?.services || tailorData.services.length === 0) ? (
                        <p className="text-xs text-stone-500 py-6 text-center">
                          {t("dashboardPage.noServices", "No services configured yet. Click 'Manage Services' to add your rate card.")}
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs sm:text-sm">
                            <thead>
                              <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase text-[10px]">
                                <th className="pb-3">{t("dashboardPage.serviceName", "Service")}</th>
                                <th className="pb-3">{t("dashboardPage.startingFrom", "Starting Price")}</th>
                                <th className="pb-3 text-right">{t("dashboardPage.turnaroundTime", "Turnaround")}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {tailorData.services.map((srv, idx) => (
                                <tr key={idx} className="py-3">
                                  <td className="py-3 font-semibold text-stone-800">{srv.name}</td>
                                  <td className="py-3 font-bold text-[#8f2338]">{money(srv.price)}</td>
                                  <td className="py-3 text-right text-stone-500">{srv.days} {t("dashboardPage.days", "days")}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------
                    TAILOR TAB 4: B2B BULK REQUIREMENTS FEED
                -------------------------------------------------- */}
                {activeTab === "bulk" && (
                  <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                    {/* 1. CONTRACTS WON / AWARDED TENDERS SECTION */}
                    {tailorAwardedTenders.length > 0 && (
                      <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white p-5 sm:p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                              <Award size={20} />
                            </span>
                            <div>
                              <h3 className="font-serif text-lg font-bold text-emerald-950">
                                Won Tender Contracts ({tailorAwardedTenders.length})
                              </h3>
                              <p className="text-xs text-emerald-700">
                                Institutional supply agreements awarded directly to your bespoke atelier.
                              </p>
                            </div>
                          </div>
                          <Link
                            to="/bulk"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition"
                          >
                            <span>Manage in B2B Hub</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {tailorAwardedTenders.map((contract) => (
                            <div
                              key={contract._id}
                              className="rounded-2xl border border-emerald-200/90 bg-white p-4 shadow-2xs hover:shadow-md transition"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-900 uppercase">
                                    <CheckCircle2 size={11} />
                                    <span>Awarded & Locked</span>
                                  </span>
                                  <h4 className="mt-2 font-serif text-base font-bold text-stone-900">
                                    {contract.title || `${contract.quantity} Units ${contract.category}`}
                                  </h4>
                                  <p className="text-xs text-stone-600 font-medium mt-0.5 flex items-center gap-1.5">
                                    <Building2 size={13} className="text-stone-400" />
                                    <span>{contract.organisation}</span>
                                  </p>
                                </div>

                                <div className="text-right">
                                  <span className="font-mono text-base font-black text-emerald-800 block">
                                    {contract.quantity?.toLocaleString()} pcs
                                  </span>
                                  <span className="text-[11px] text-stone-500 font-medium">
                                    Timeline: {contract.timeline || "30 Days"}
                                  </span>
                                </div>
                              </div>

                              <p className="mt-2.5 text-xs text-stone-600 line-clamp-2 leading-relaxed bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
                                {contract.requirement}
                              </p>

                              <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                                <span>City: <strong className="text-stone-800">{contract.city || "Jaipur"}</strong></span>
                                <Link
                                  to="/bulk"
                                  className="text-[#8f2338] font-bold hover:underline inline-flex items-center gap-1"
                                >
                                  <span>View RFP</span>
                                  <ChevronRight size={12} />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                      <div>
                        <h2 className="font-serif text-xl font-bold text-stone-900">
                          {t("dashboardPage.bulkFeedTitle", "Institutional & Corporate Bulk Demands")}
                        </h2>
                        <p className="text-xs text-stone-500">
                          {t("dashboardPage.bulkFeedSubtitle", "Browse live uniform, corporate apparel, and batch tailoring requirements posted by verified businesses.")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to="/bulk"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
                        >
                          <span>Explore All in B2B Hub</span>
                          <ArrowRight size={13} />
                        </Link>
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
                          {tailorBulkFeed.length} {t("dashboardPage.liveJobs", "Live Jobs")}
                        </span>
                      </div>
                    </div>

                    {tailorBulkFeed.length === 0 ? (
                      <div className="py-12 text-center rounded-2xl border border-dashed border-stone-200">
                        <Building2 size={36} className="mx-auto text-stone-300 mb-2" />
                        <p className="font-serif text-base font-bold text-stone-800">
                          {t("dashboardPage.noBulkJobs", "No open corporate requirements right now.")}
                        </p>
                        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                          {t("tailorDashboard.bulkJobsHelp", "When businesses post large uniform or batch production requirements, they will appear here.")}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tailorBulkFeed.map((job) => (
                          <article
                            key={job._id}
                            className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 sm:p-5 hover:border-[#8f2338]/30 transition"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-[#8f2338] uppercase">
                                  {job.status || "submitted"}
                                </span>
                                <h4 className="font-serif text-base font-bold text-stone-900 mt-1.5">
                                  {job.organisation}
                                </h4>
                                <p className="text-xs sm:text-sm text-stone-700 mt-1">
                                  {job.requirement}
                                </p>
                              </div>

                              <div className="text-right">
                                <span className="font-serif text-lg font-bold text-[#8f2338]">
                                  {job.quantity} {t("dashboardPage.units", "units")}
                                </span>
                                <p className="text-xs text-stone-500">
                                  {t("dashboardPage.timeline", "Timeline")}: {job.timeline || "30 days"}
                                </p>
                              </div>
                            </div>
                            <p className="mt-3 text-[11px] text-stone-400 border-t border-stone-100 pt-2">
                              {t("dashboardPage.postedOn", "Posted")}: {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* -------------------------------------------------
                    TAILOR TAB 5: ACCOUNT SETTINGS & GPS LOCATION
                -------------------------------------------------- */}
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    {/* Personal Account Information */}
                    <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                        <div>
                          <h2 className="font-serif text-xl font-bold text-[#231b1a]">
                            {t("dashboardPage.personalProfileTitle", "Personal Profile Details")}
                          </h2>
                          <p className="text-xs text-stone-500">
                            {t("dashboardPage.personalProfileSubtitle", "View your registered credentials, contact information, and preferences.")}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsEditProfileOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                        >
                          <Pencil size={13} />
                          <span>{t("dashboardPage.editProfile", "Edit Profile")}</span>
                        </button>
                      </div>

                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                        <div className="rounded-2xl bg-[#fdfbf9] border border-stone-200 p-4">
                          <p className="text-[10px] font-bold uppercase text-stone-400">{t("dashboardPage.firstName", "First Name")}</p>
                          <p className="font-bold text-stone-900 mt-0.5">
                            {profile?.firstName || "—"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#fdfbf9] border border-stone-200 p-4">
                          <p className="text-[10px] font-bold uppercase text-stone-400">{t("dashboardPage.lastName", "Last Name")}</p>
                          <p className="font-bold text-stone-900 mt-0.5">
                            {profile?.lastName || "—"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#fdfbf9] border border-stone-200 p-4">
                          <p className="text-[10px] font-bold uppercase text-stone-400">{t("dashboardPage.emailAddress", "Email Address")}</p>
                          <p className="font-bold text-stone-900 mt-0.5 truncate">
                            {profile?.email || "—"}
                          </p>
                          <span className="text-[10px] text-stone-400">{t("dashboardPage.securedViaClerk", "Secured via Clerk")}</span>
                        </div>

                        <div className="rounded-2xl bg-[#fdfbf9] border border-stone-200 p-4">
                          <p className="text-[10px] font-bold uppercase text-stone-400">{t("dashboardPage.phoneNumber", "Phone Number")}</p>
                          <p className="font-bold text-stone-900 mt-0.5">
                            {profile?.phone || t("dashboardPage.notConfigured", "Not configured")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Workshop Geolocation & GPS Search Manager */}
                    <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2">
                          <MapPin size={18} className="text-[#8f2338]" />
                          <h2 className="font-serif text-lg font-bold text-[#231b1a]">
                            {t("tailorDashboard.workshopLocationTitle", "Workshop Geolocation & Search Discovery")}
                          </h2>
                        </div>
                        {locBusy && (
                          <span className="text-xs font-semibold text-stone-400 animate-pulse">
                            {t("dashboardPage.updatingLocation", "Updating location…")}
                          </span>
                        )}
                      </div>

                      <div className="rounded-2xl bg-[#fdfbf9] border border-stone-200 p-4">
                        <p className="text-[10px] font-bold uppercase text-stone-400">{t("tailorDashboard.workshopAddress", "Workshop Operating Address")}</p>
                        <p className="mt-1 font-semibold text-stone-900 text-xs sm:text-sm">
                          {profile?.location?.label || tailorData?.city || t("dashboardPage.noLocation", "No location saved yet. Use GPS or search below.")}
                        </p>
                        {profile?.location?.coordinates && (
                          <p className="text-[11px] text-stone-500 mt-1">
                            {t("dashboardPage.gpsCoordinates", "GPS Coordinates")}: {profile.location.coordinates[1]?.toFixed(4)},{" "}
                            {profile.location.coordinates[0]?.toFixed(4)}
                          </p>
                        )}
                      </div>

                      {/* Geolocation trigger & Search Input */}
                      <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                        <button
                          type="button"
                          disabled={locBusy}
                          onClick={handleUseCurrentLocation}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition disabled:opacity-50"
                        >
                          <MapPin size={13} className="text-[#8f2338]" />
                          <span>{t("dashboardPage.useCurrentGPS", "Use Current GPS")}</span>
                        </button>

                        <form
                          onSubmit={handleSearchLocation}
                          className="flex-1 flex items-center gap-2"
                        >
                          <input
                            value={placeQuery}
                            onChange={(e) => setPlaceQuery(e.target.value)}
                            placeholder={t("dashboardPage.searchPlacePlaceholder", "Search city, area, or PIN code...")}
                            className="flex-1 rounded-xl border border-stone-200 bg-[#fdfbf9] px-3.5 py-2 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                          />
                          <button
                            type="submit"
                            disabled={locBusy || !placeQuery.trim()}
                            className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 disabled:opacity-50"
                          >
                            {t("dashboardPage.update", "Update")}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* =========================================================
                CUSTOMER & BUSINESS WORKSPACE (IF NOT TAILOR ROLE)
            ========================================================== */}
            {role !== "tailor" && (
              <>
                {/* =====================================================
                    TAB 1: OVERVIEW (PINNED CARDS & RECENT ACTIVITY)
                ====================================================== */}
                {activeTab === "overview" && (
                  role === "business" ? (
                    <div className="space-y-6">
                      {/* 1. Enterprise Verification Alert Banner */}
                      {businessProfile?.verificationStatus === "verified" || businessProfile?.verified ? (
                        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white p-6 sm:p-7 shadow-xs">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                                <ShieldCheck size={26} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h2 className="font-serif text-lg sm:text-xl font-bold text-emerald-950">
                                    {businessProfile?.companyName || "Verified Enterprise Account"}
                                  </h2>
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                    ✓ Verified GSTIN
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-emerald-800 mt-1 max-w-xl">
                                  Your enterprise compliance credentials have been authenticated. You have full access to publish bulk requirements, manage RFQs, and receive quotations from vetted artisan tailors.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleOpenCreateBulk}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-900 transition"
                              >
                                <Plus size={14} />
                                <span>Post Requirement</span>
                              </button>
                              <Link
                                to="/bulk"
                                className="rounded-xl border border-emerald-300 bg-white px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-2xs hover:bg-emerald-50 transition"
                              >
                                Marketplace Feed
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : businessProfile?.verificationStatus === "pending" ? (
                        <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50/80 via-yellow-50/40 to-white p-6 sm:p-7 shadow-xs">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
                                <Clock3 size={24} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                                    {businessProfile?.companyName || "Commercial Enterprise"}
                                  </h2>
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                    ⏳ Audit In Progress
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                                  Your GSTIN ({businessProfile?.gstin || "submitted"}) and business profile documents are currently under administrative review. Once verified, your bulk postings will immediately appear live for tailor bidding.
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setActiveTab("verification")}
                              className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-900 shadow-2xs hover:bg-amber-50 transition"
                            >
                              Review Verification Form
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-50 via-orange-50/40 to-white p-6 sm:p-7 shadow-xs">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8f2338] text-white shadow-md">
                                <AlertCircle size={24} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h2 className="font-serif text-lg sm:text-xl font-bold text-rose-950">
                                    GSTIN Verification Required
                                  </h2>
                                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-900 uppercase tracking-wider">
                                    ⚠️ Unverified Entity
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-rose-800 mt-1 max-w-xl">
                                  Under platform standards, only verified business accounts with approved GSTIN credentials can post bulk tender requirements. Submit your enterprise details to enable RFQ posting.
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setActiveTab("verification")}
                              className="rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                            >
                              Submit GSTIN Audit Now
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2. Enterprise Procurement Metrics */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs">
                          <div className="flex items-center justify-between text-stone-400">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Active RFQs</span>
                            <Layers size={16} className="text-[#8f2338]" />
                          </div>
                          <p className="mt-2 font-serif text-3xl font-bold text-stone-900">
                            {businessRequests.length}
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">Tenders created</p>
                        </div>

                        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs">
                          <div className="flex items-center justify-between text-stone-400">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Quotes Received</span>
                            <Tag size={16} className="text-emerald-600" />
                          </div>
                          <p className="mt-2 font-serif text-3xl font-bold text-emerald-800">
                            {businessRequests.reduce((acc, r) => acc + (r.quotes?.length || 0), 0)}
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">Tailor proposals</p>
                        </div>

                        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs">
                          <div className="flex items-center justify-between text-stone-400">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Production Orders</span>
                            <ShoppingBag size={16} className="text-blue-600" />
                          </div>
                          <p className="mt-2 font-serif text-3xl font-bold text-stone-900">
                            {orders.length}
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">Commercial batches</p>
                        </div>

                        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs">
                          <div className="flex items-center justify-between text-stone-400">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Audit Status</span>
                            <ShieldCheck size={16} className="text-stone-500" />
                          </div>
                          <p className={`mt-2 font-sans text-lg font-black uppercase truncate ${
                            businessProfile?.verificationStatus === "verified" || businessProfile?.verified
                              ? "text-emerald-700"
                              : businessProfile?.verificationStatus === "pending"
                              ? "text-amber-700"
                              : "text-rose-700"
                          }`}>
                            {businessProfile?.verificationStatus || "Unverified"}
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">GSTIN compliance</p>
                        </div>
                      </div>

                      {/* 3. Recent Bulk RFQs & Tender Activity */}
                      <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                          <div>
                            <h2 className="font-serif text-lg font-bold text-[#231b1a]">
                              Recent Bulk Requirements & RFQs
                            </h2>
                            <p className="text-xs text-stone-500">
                              Your published procurement requests and submitted tailor quotations.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleOpenCreateBulk}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                            >
                              <Plus size={14} />
                              <span>Post Requirement</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab("bulk")}
                              className="text-xs font-bold text-[#8f2338] hover:underline"
                            >
                              View All ({businessRequests.length}) →
                            </button>
                          </div>
                        </div>

                        {businessRequests.length === 0 ? (
                          <div className="py-10 text-center space-y-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 mx-auto">
                              <Layers size={22} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-stone-800">No Bulk Requirements Published Yet</p>
                              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-0.5">
                                Publish your bulk apparel specifications, corporate uniforms, or batch production tenders to receive bids from verified tailors.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleOpenCreateBulk}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                            >
                              <Plus size={14} />
                              <span>Create First Tender</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3.5">
                            {businessRequests.slice(0, 3).map((bReq) => {
                              const quotesCount = bReq.quotes?.length || 0;
                              return (
                                <article
                                  key={bReq._id}
                                  className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 sm:p-5 hover:border-stone-300 transition"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-serif text-base font-bold text-stone-900">
                                        {bReq.title || bReq.organisation}
                                      </h3>
                                      <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-[#8f2338] capitalize">
                                        {bReq.status || "open"}
                                      </span>
                                      {bReq.category && (
                                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                                          {bReq.category}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                        quotesCount > 0
                                          ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                                          : "bg-stone-100 text-stone-600"
                                      }`}>
                                        <Tag size={11} />
                                        <span>{quotesCount} {quotesCount === 1 ? "Quote" : "Quotes"}</span>
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() => setActiveTab("bulk")}
                                        className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-bold text-stone-700 hover:bg-stone-50"
                                      >
                                        Manage
                                      </button>
                                    </div>
                                  </div>

                                  <p className="mt-2 text-xs sm:text-sm text-stone-700 line-clamp-2">
                                    {bReq.requirement || bReq.notes}
                                  </p>

                                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-stone-500 border-t border-stone-100 pt-2.5">
                                    <span>Quantity: <strong className="text-stone-800">{bReq.quantity} units</strong></span>
                                    {bReq.unitBudget && (
                                      <span>Budget: <strong className="text-stone-800">{money(bReq.unitBudget)} / unit</strong></span>
                                    )}
                                    <span>Timeline: <strong className="text-stone-800">{bReq.timeline || "30 days"}</strong></span>
                                    <span>City: <strong className="text-stone-800">{bReq.city || "Pan-India"}</strong></span>
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* 4. Enterprise B2B Procurement Protocol */}
                      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-3">
                        <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                          <Info size={16} className="text-[#8f2338]" />
                          Platform B2B Tender Protocol & Guidelines
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-600">
                          <div className="rounded-2xl border border-stone-100 bg-[#fdfbf9] p-3.5 space-y-1">
                            <p className="font-bold text-stone-800">1. Publish Requirement</p>
                            <p className="text-stone-500 text-[11px]">Specify target quantity, fabric expectations, required unit budget, and turnaround window.</p>
                          </div>
                          <div className="rounded-2xl border border-stone-100 bg-[#fdfbf9] p-3.5 space-y-1">
                            <p className="font-bold text-stone-800">2. Review Tailor Quotes</p>
                            <p className="text-stone-500 text-[11px]">Vetted tailors submit price breakdowns, production capacity, and sample offers directly.</p>
                          </div>
                          <div className="rounded-2xl border border-stone-100 bg-[#fdfbf9] p-3.5 space-y-1">
                            <p className="font-bold text-stone-800">3. Award & Production</p>
                            <p className="text-stone-500 text-[11px]">Inspect physical sample piece, approve final contract, and monitor staged delivery milestones.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                {/* Active Stitching Progress / Pinned Order */}
                <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f7eee5] text-[#8f2338]">
                        <Package size={16} />
                      </span>
                      <h2 className="font-serif text-lg font-bold text-[#231b1a]">
                        {t("dashboardPage.activeStitching", "Active Stitching Progress")}
                      </h2>
                    </div>
                    {orders.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("orders")}
                        className="text-xs font-bold text-[#8f2338] hover:underline"
                      >
                        {t("dashboardPage.viewAll", "View All")} ({orders.length}) →
                      </button>
                    )}
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-8 text-center">
                      <ShoppingBag size={32} className="mx-auto text-stone-300 mb-2" />
                      <p className="text-xs sm:text-sm font-semibold text-stone-700">
                        {t("dashboardPage.noActiveOrders", "No active orders right now")}
                      </p>
                      <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                        {t("dashboardPage.noActiveOrdersHelp", "Ready to stitch something custom? Search verified tailors in your radius.")}
                      </p>
                      <Link
                        to="/find-tailors"
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                      >
                        <Search size={13} />
                        <span>{t("dashboardPage.findTailorsNearMe", "Find Tailors Near Me")}</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 transition hover:border-[#8f2338]/30 hover:bg-white"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-[11px] font-bold text-stone-400">
                                #{order.id}
                              </span>
                              <h3 className="font-serif text-sm font-bold text-stone-900">
                                {order.quantity || 1} × {order.garment || order.category}
                              </h3>
                              <p className="text-xs text-stone-500">
                                {t("dashboardPage.studio", "Studio:")} <strong>{order.tailorName || "Master Tailor"}</strong>
                              </p>
                            </div>

                            <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-[#8f2338]">
                              {order.status || "Request Sent"}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                            <div
                              className="h-full bg-[#8f2338] transition-all duration-500"
                              style={{
                                width: `${orderProgressPercent[order.status] || 25}%`,
                              }}
                            />
                          </div>

                          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                            <span className="text-stone-500">
                              {order.quotePrice != null
                                ? `${t("dashboardPage.quote", "Quote")}: ${money(order.quotePrice)}`
                                : order.price != null
                                ? `${t("dashboardPage.est", "Est")}: ${money(order.price)}`
                                : t("dashboardPage.awaitingQuote", "Awaiting quote")}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderDetails(order)}
                              className="font-bold text-[#8f2338] hover:underline"
                            >
                              {t("dashboardPage.detailsAndActions", "Details & Actions →")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Shortcuts Grid (GitHub Pinned Repos Style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pinned Fit Profiles */}
                  <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Ruler size={14} className="text-[#8f2338]" /> {t("dashboardPage.fitProfiles", "Fit Profiles")}
                      </span>
                      <button
                        type="button"
                        onClick={handleOpenCreateMeasurement}
                        className="text-xs font-bold text-[#8f2338] hover:underline flex items-center gap-1"
                      >
                        <Plus size={12} /> {t("dashboardPage.add", "Add")}
                      </button>
                    </div>

                    {measurements.length === 0 ? (
                      <p className="text-xs text-stone-500 py-2">
                        {t("dashboardPage.noMeasurementsHelp", "No saved measurements yet. Save your fit profile once to reuse across orders.")}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {measurements.slice(0, 2).map((m) => (
                          <div
                            key={m._id}
                            className="rounded-xl border border-stone-200 bg-[#fdfbf9] p-2.5 text-xs flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-stone-900">{m.name}</p>
                              <p className="text-[11px] text-stone-500">{m.garment}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenEditMeasurement(m)}
                              className="text-stone-400 hover:text-stone-700 p-1"
                            >
                              <Pencil size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pinned Saved Tailors */}
                  <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Bookmark size={14} className="text-[#8f2338]" /> {t("dashboardPage.savedStudios", "Saved Studios")}
                      </span>
                      <Link
                        to="/my-tailors"
                        className="text-xs font-bold text-[#8f2338] hover:underline"
                      >
                        {t("dashboardPage.viewAll", "View All")} →
                      </Link>
                    </div>

                    {savedTailors.length === 0 ? (
                      <p className="text-xs text-stone-500 py-2">
                        {t("dashboardPage.noSavedTailorsHelp", "Bookmark your favorite tailors from the discovery map to find them here.")}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {savedTailors.slice(0, 2).map((studio) => (
                          <div
                            key={studio._id || studio.id}
                            className="rounded-xl border border-stone-200 bg-[#fdfbf9] p-2.5 text-xs flex items-center justify-between"
                          >
                            <div className="truncate pr-2">
                              <p className="font-bold text-stone-900 truncate">{studio.name}</p>
                              <p className="text-[11px] text-stone-500 truncate">{studio.area || studio.city}</p>
                            </div>
                            <Link
                              to={`/tailors/${encodeURIComponent(studio._id || studio.id)}`}
                              className="shrink-0 text-xs font-bold text-[#8f2338] hover:underline"
                            >
                              {t("dashboardPage.viewStudio", "View Studio")} →
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

            {/* =====================================================
                TAB 2: ORDERS (FULL CRUD & FILTERING)
            ====================================================== */}
            {activeTab === "orders" && (
              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#231b1a]">
                      {t("dashboardPage.myOrdersTitle", "My Tailoring Orders")}
                    </h2>
                    <p className="text-xs text-stone-500">
                      {t("dashboardPage.myOrdersSubtitle", "Manage order quotes, track production milestones, and delete pre-production requests.")}
                    </p>
                  </div>

                  <div className="relative">
                    <Search
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      value={ordersSearch}
                      onChange={(e) => setOrdersSearch(e.target.value)}
                      placeholder={t("dashboardPage.searchOrdersPlaceholder", "Search orders...")}
                      className="w-full sm:w-48 rounded-xl border border-stone-200 bg-[#fdfbf9] pl-8 pr-3 py-1.5 text-xs outline-none focus:border-[#8f2338]"
                    />
                  </div>
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                  {[
                    { id: "all", label: t("dashboardPage.filterAll", "All"), count: orders.length },
                    { id: "active", label: t("dashboardPage.filterInProgress", "In Progress"), count: activeOrdersCount },
                    { id: "quotes", label: t("dashboardPage.filterQuotesReady", "Quotes Ready"), count: quotesCount },
                    { id: "completed", label: t("dashboardPage.filterCompleted", "Completed"), count: completedOrdersCount },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setOrdersStatusFilter(filter.id)}
                      className={`rounded-xl px-3 py-1.5 font-bold transition ${
                        ordersStatusFilter === filter.id
                          ? "bg-[#8f2338] text-white shadow-xs"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border border-dashed border-stone-200">
                    <ShoppingBag size={36} className="mx-auto text-stone-300 mb-2" />
                    <p className="font-sans text-base font-bold text-stone-800">
                      {t("dashboardPage.noMatchingOrders", "No matching orders found")}
                    </p>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      {t("dashboardPage.noMatchingOrdersHelp", "Explore local tailors to place a new tailoring request.")}
                    </p>
                    <Link
                      to="/find-tailors"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                    >
                      {t("dashboardPage.findTailors", "Find Tailors")}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      const isPreProduction = ["Request Sent", "Quote Received"].includes(
                        order.status
                      );
                      return (
                        <article
                          key={order.id}
                          className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 sm:p-5 transition hover:border-[#8f2338]/40 hover:bg-white"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3.5">
                              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-[#fdf2f4] border border-rose-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                <img
                                  src={order.image || "/assets/kurta.png"}
                                  alt={order.garment || order.category || "Order"}
                                  className="h-full w-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.src = "/assets/kurta.png";
                                  }}
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-stone-400">
                                    #{order.id}
                                  </span>
                                  <span className="h-1 w-1 rounded-full bg-stone-300" />
                                  <span className="text-xs text-stone-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <h3 className="mt-1 font-sans text-base font-bold text-stone-900">
                                  {order.quantity || 1} × {order.garment || order.category}
                                </h3>
                                <p className="text-xs text-stone-600 mt-0.5">
                                  {t("dashboardPage.studio", "Studio:")} <strong>{order.tailorName || "Master Studio"}</strong>
                                  {order.color ? ` · Color: ${order.color}` : ""}
                                  {order.fabric ? ` · Fabric: ${order.fabric}` : ""}
                                </p>
                              </div>
                            </div>

                            <span className="self-start sm:self-center rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-[#8f2338]">
                              {order.status || "Request Sent"}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                            <div
                              className="h-full bg-[#8f2338] transition-all duration-500"
                              style={{
                                width: `${orderProgressPercent[order.status] || 25}%`,
                              }}
                            />
                          </div>

                          {/* Footer and Actions */}
                          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-200 pt-3">
                            <div className="text-xs">
                              <span className="text-stone-500">{t("dashboardPage.totalPrice", "Total Price")}: </span>
                              <strong className="text-sm font-extrabold text-[#8f2338]">
                                {order.quotePrice != null
                                  ? money(order.quotePrice)
                                  : order.price != null
                                  ? money(order.price)
                                  : t("dashboardPage.awaitingReview", "Awaiting Review")}
                              </strong>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {order.status === "Quote Received" && (
                                <button
                                  type="button"
                                  disabled={actingId === order.id}
                                  onClick={() => handleAcceptQuote(order.id)}
                                  className="inline-flex items-center gap-1 rounded-xl bg-[#8f2338] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#781c2e] shadow-xs disabled:opacity-60 transition"
                                >
                                  <Check size={13} />
                                  <span>
                                    {actingId === order.id ? t("dashboardPage.accepting", "Accepting…") : t("dashboardPage.acceptQuote", "Accept Quote")}
                                  </span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedOrderDetails(order)}
                                className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                              >
                                {t("dashboardPage.viewDetails", "View Details")}
                              </button>

                              {/* CRUD Delete Button for pre-production orders */}
                              {isPreProduction && (
                                <button
                                  type="button"
                                  disabled={actingId === order.id}
                                  onClick={() => setConfirmDeleteOrder(order)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                                  title={t("dashboardPage.deleteRequest", "Delete Request")}
                                >
                                  <Trash2 size={12} className="text-rose-600" />
                                  <span>{t("dashboardPage.delete", "Delete")}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* =====================================================
                TAB 3: MEASUREMENTS (FULL CRUD)
            ====================================================== */}
            {activeTab === "measurements" && (
              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <h2 className="font-sans text-xl font-bold text-[#231b1a]">
                      {t("dashboardPage.savedMeasurementsTitle", "Saved Measurement Profiles")}
                    </h2>
                    <p className="text-xs text-stone-500">
                      {t("dashboardPage.savedMeasurementsSubtitle", "Save body measurement profiles once and attach them seamlessly to any tailor request.")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenCreateMeasurement}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                  >
                    <Plus size={14} />
                    <span>{t("dashboardPage.addProfile", "Add Profile")}</span>
                  </button>
                </div>

                {filteredMeasurements.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border border-dashed border-stone-200">
                    <Ruler size={36} className="mx-auto text-stone-300 mb-2" />
                    <p className="font-serif text-base font-bold text-stone-800">
                      {t("dashboardPage.noMeasurementsTitle", "No measurement profiles yet")}
                    </p>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      {t("dashboardPage.noMeasurementsDesc", "Create your first fit profile (Chest, Waist, Shoulders, Length) to speed up orders.")}
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenCreateMeasurement}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                    >
                      <Plus size={13} />
                      <span>{t("dashboardPage.createFitProfile", "Create Fit Profile")}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredMeasurements.map((meas) => (
                      <article
                        key={meas._id}
                        className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 sm:p-5 flex flex-col justify-between hover:border-[#8f2338]/40 hover:bg-white transition"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="rounded-lg bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-[#8f2338]">
                              {meas.garment || "Custom"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditMeasurement(meas)}
                                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                                title={t("dashboardPage.edit", "Edit")}
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMeasurement(meas._id)}
                                className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                                title={t("dashboardPage.delete", "Delete")}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <h3 className="mt-2 font-sans text-base font-bold text-stone-900">
                            {meas.name}
                          </h3>

                          {/* Values Grid */}
                          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-stone-600">
                            {measurementFields
                              .filter((f) => meas.values?.[f] != null)
                              .map((f) => (
                                <div
                                  key={f}
                                  className="rounded-lg bg-white border border-stone-200 p-1.5 text-center"
                                >
                                  <span className="block text-[10px] uppercase font-bold text-stone-400">
                                    {f}
                                  </span>
                                  <strong className="text-stone-800">
                                    {meas.values[f]} cm
                                  </strong>
                                </div>
                              ))}
                          </div>
                        </div>

                        <p className="mt-4 text-[11px] text-stone-400 border-t border-stone-100 pt-2">
                          {t("dashboardPage.updated", "Updated")}: {new Date(meas.updatedAt || meas.createdAt).toLocaleDateString()}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* =====================================================
                TAB 4: SAVED TAILORS (FULL CRUD)
            ====================================================== */}
            {activeTab === "saved" && (
              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <h2 className="font-sans text-xl font-bold text-[#231b1a]">
                      {t("dashboardPage.savedTailorsTitle", "Saved Tailor Studios")}
                    </h2>
                    <p className="text-xs text-stone-500">
                      {t("dashboardPage.savedTailorsSubtitle", "Your bookmarked local artisans and alteration experts.")}
                    </p>
                  </div>
                  <Link
                    to="/find-tailors"
                    className="text-xs font-bold text-[#8f2338] hover:underline"
                  >
                    {t("dashboardPage.discoverMore", "Discover More →")}
                  </Link>
                </div>

                {savedTailors.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border border-dashed border-stone-200">
                    <Bookmark size={36} className="mx-auto text-stone-300 mb-2" />
                    <p className="font-sans text-base font-bold text-stone-800">
                      {t("dashboardPage.noSavedTailorsTitle", "No saved tailors yet")}
                    </p>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      {t("dashboardPage.noSavedTailorsDesc", "Explore the tailor directory and tap \"Save Tailor\" to keep them in your collection.")}
                    </p>
                    <Link
                      to="/find-tailors"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                    >
                      {t("dashboardPage.findTailors", "Find Tailors")}
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedTailors.map((tailor) => {
                      const tId = tailor._id || tailor.id;
                      return (
                        <article
                          key={tId}
                          className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 sm:p-5 flex flex-col justify-between hover:border-[#8f2338]/40 hover:bg-white transition"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <TailorAvatar
                                  image={tailor.image || tailor.heroImage || tailor.avatar}
                                  name={tailor.name}
                                  size="md"
                                  rounded="rounded-2xl"
                                  alt={tailor.name || "Studio"}
                                />
                                <div>
                                  <h3 className="font-sans text-base font-bold text-stone-900 line-clamp-1">
                                    {tailor.name}
                                  </h3>
                                  <p className="text-xs text-stone-500 mt-0.5">
                                    {[tailor.area, tailor.city].filter(Boolean).join(", ") ||
                                      "Jaipur, India"}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                disabled={actingId === tId}
                                onClick={() => handleUnsaveTailor(tId)}
                                className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 shrink-0"
                                title={t("dashboardPage.delete", "Delete")}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            {/* Categories */}
                            {tailor.categories?.length > 0 && (
                              <div className="mt-2.5 flex flex-wrap gap-1">
                                {tailor.categories.slice(0, 3).map((c) => (
                                  <span
                                    key={c}
                                    className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700"
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-3 text-xs">
                            <span className="font-bold text-[#8f2338]">
                              {t("dashboardPage.starting", "Starting")} ₹{tailor.minPrice || 299}
                            </span>
                            <div className="flex items-center gap-2">
                              {tailor.phone && (
                                <a
                                  href={`tel:${tailor.phone}`}
                                  className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100"
                                >
                                  {t("dashboardPage.call", "Call")}
                                </a>
                              )}
                              <Link
                                to={`/tailors/${encodeURIComponent(tId)}`}
                                className="rounded-lg bg-stone-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-stone-800"
                              >
                                {t("dashboardPage.viewStudio", "View Studio")}
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* =====================================================
                TAB 5: PROFILE & LOCATION SETTINGS (CLEAN LAYOUT)
            ====================================================== */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Profile Information Display */}
                <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="h-14 w-14 rounded-full bg-[#fceeed] border border-rose-100 overflow-hidden shrink-0 flex items-center justify-center text-lg font-bold text-[#8f2338]">
                        {(profile?.avatar || profile?.imageUrl || user?.imageUrl) ? (
                          <img
                            src={profile?.avatar || profile?.imageUrl || user?.imageUrl}
                            alt={profile?.firstName || "Profile"}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          (profile?.firstName?.[0] || "U").toUpperCase()
                        )}
                      </div>
                      <div>
                        <h2 className="font-sans text-xl font-bold text-[#231b1a]">
                          {t("dashboardPage.personalProfileTitle", "Personal Profile Details")}
                        </h2>
                        <p className="text-xs text-stone-500">
                          {t("dashboardPage.personalProfileSubtitle", "View your registered credentials, contact information, and preferences.")}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditProfileOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                    >
                      <Pencil size={13} />
                      <span>{t("dashboardPage.editProfile", "Edit Profile")}</span>
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="rounded-2xl bg-[#fdfbf9] border border-stone-200 p-4">
                      <p className="text-[10px] font-bold uppercase text-stone-400">{t("dashboardPage.firstName", "First Name")}</p>
                      <p className="font-bold text-stone-900 mt-0.5">
                        {profile?.firstName || "—"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fdfbf9] border border-stone-200 p-4">
                      <p className="text-[10px] font-bold uppercase text-stone-400">{t("dashboardPage.lastName", "Last Name")}</p>
                      <p className="font-bold text-stone-900 mt-0.5">
                        {profile?.lastName || "—"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fdfbf9] border border-stone-200 p-4">
                      <p className="text-[10px] font-bold uppercase text-stone-400">{t("dashboardPage.emailAddress", "Email Address")}</p>
                      <p className="font-bold text-stone-900 mt-0.5 truncate">
                        {profile?.email || "—"}
                      </p>
                      <span className="text-[10px] text-stone-400">{t("dashboardPage.securedViaClerk", "Secured via Clerk")}</span>
                    </div>

                    <div className="rounded-2xl bg-[#fdfbf9] border border-stone-200 p-4">
                      <p className="text-[10px] font-bold uppercase text-stone-400">{t("dashboardPage.phoneNumber", "Phone Number")}</p>
                      <p className="font-bold text-stone-900 mt-0.5">
                        {profile?.phone || t("dashboardPage.notConfigured", "Not configured")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location & GPS Search Manager */}
                <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-[#8f2338]" />
                      <h2 className="font-sans text-lg font-bold text-[#231b1a]">
                        {t("dashboardPage.savedLocationTitle", "Saved Location & Search Area")}
                      </h2>
                    </div>
                    {locBusy && (
                      <span className="text-xs font-semibold text-stone-400 animate-pulse">
                        {t("dashboardPage.updatingLocation", "Updating location…")}
                      </span>
                    )}
                  </div>

                  <div className="rounded-2xl bg-[#fdfbf9] border border-stone-200 p-4">
                    <p className="text-[10px] font-bold uppercase text-stone-400">{t("dashboardPage.currentSavedAddress", "Current Saved Address")}</p>
                    <p className="mt-1 font-semibold text-stone-900 text-xs sm:text-sm">
                      {profile?.location?.label || t("dashboardPage.noLocation", "No location saved yet. Use GPS or search below.")}
                    </p>
                    {profile?.location?.coordinates && (
                      <p className="text-[11px] text-stone-500 mt-1">
                        {t("dashboardPage.gpsCoordinates", "GPS Coordinates")}: {profile.location.coordinates[1]?.toFixed(4)},{" "}
                        {profile.location.coordinates[0]?.toFixed(4)}
                      </p>
                    )}
                  </div>

                  {/* Geolocation trigger & Search Input */}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <button
                      type="button"
                      disabled={locBusy}
                      onClick={handleUseCurrentLocation}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition disabled:opacity-50"
                    >
                      <MapPin size={13} className="text-[#8f2338]" />
                      <span>{t("dashboardPage.useCurrentGPS", "Use Current GPS")}</span>
                    </button>

                    <form
                      onSubmit={handleSearchLocation}
                      className="flex-1 flex items-center gap-2"
                    >
                      <input
                        value={placeQuery}
                        onChange={(e) => setPlaceQuery(e.target.value)}
                        placeholder={t("dashboardPage.searchPlacePlaceholder", "Search city, area, or PIN code...")}
                        className="flex-1 rounded-xl border border-stone-200 bg-[#fdfbf9] px-3.5 py-2 text-xs outline-none focus:border-[#8f2338] focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={locBusy || !placeQuery.trim()}
                        className="rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white hover:bg-[#781c2e] transition disabled:opacity-50"
                      >
                        {t("dashboardPage.update", "Update")}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* =====================================================
                TAB 7: BULK REQUIREMENTS & RFQs (IF BUSINESS ROLE)
            ====================================================== */}
            {role === "business" && activeTab === "bulk" && (
              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                {/* Status banner */}
                {businessProfile?.verificationStatus !== "verified" && !businessProfile?.verified && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle size={18} className="text-[#8f2338] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#8f2338]">
                          GSTIN Verification Required for Posting Tenders
                        </p>
                        <p className="text-[11px] text-stone-600 mt-0.5">
                          In accordance with commercial platform policy, only verified businesses can create new bulk requirements.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("verification")}
                      className="shrink-0 rounded-xl bg-[#8f2338] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#781c2e] transition"
                    >
                      Audit Verification →
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#231b1a]">
                      Enterprise Bulk Requirements & RFQs
                    </h2>
                    <p className="text-xs text-stone-500">
                      Manage batch orders, corporate apparel tenders, and tailor quotations.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/bulk"
                      className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 transition"
                    >
                      Browse Marketplace
                    </Link>
                    <button
                      type="button"
                      onClick={handleOpenCreateBulk}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                    >
                      <Plus size={14} />
                      <span>Post Requirement</span>
                    </button>
                  </div>
                </div>

                {businessRequests.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 mx-auto">
                      <Layers size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-800">No Bulk Requirements Submitted</p>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto mt-0.5">
                        Post your specifications for corporate uniforms, institutional bulk wear, or batch apparel production to receive quotes from master tailors.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenCreateBulk}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                    >
                      <Plus size={14} />
                      <span>Post Requirement</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {businessRequests.map((bReq) => {
                      const quotes = bReq.quotes || [];
                      return (
                        <article
                          key={bReq._id}
                          className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 sm:p-5 flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-serif text-base font-bold text-stone-900">
                                  {bReq.title || bReq.organisation}
                                </h3>
                                <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-[#8f2338] capitalize">
                                  {bReq.status || "open"}
                                </span>
                                {bReq.category && (
                                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
                                    {bReq.category}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditBulk(bReq)}
                                  className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200/50"
                                  title="Edit requirement"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBulk(bReq._id)}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                                  title="Delete requirement"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            <p className="mt-2 text-xs sm:text-sm text-stone-700">
                              {bReq.requirement || bReq.notes}
                            </p>

                            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-stone-500">
                              <span>Volume: <strong className="text-stone-800">{bReq.quantity} units</strong></span>
                              {bReq.unitBudget && (
                                <span>Unit Budget: <strong className="text-stone-800">{money(bReq.unitBudget)}</strong></span>
                              )}
                              <span>Timeline: <strong className="text-stone-800">{bReq.timeline || "30 days"}</strong></span>
                              <span>Location: <strong className="text-stone-800">{bReq.city || "Pan-India"}</strong></span>
                            </div>
                          </div>

                          {/* Quotations Sub-Section */}
                          <div className="border-t border-stone-200/80 pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                                <Tag size={13} className="text-[#8f2338]" />
                                Master Tailor Quotations ({quotes.length})
                              </span>
                              <span className="text-[11px] text-stone-400">
                                {quotes.length === 0 ? "Awaiting tailor bids" : `${quotes.length} bids submitted`}
                              </span>
                            </div>

                            {quotes.length === 0 ? (
                              <p className="text-xs text-stone-400 italic bg-white p-3 rounded-xl border border-stone-100 text-center">
                                No tailor quotations received yet. Your tender is live on the marketplace feed for verified tailors to quote.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {quotes.map((q, idx) => (
                                  <div
                                    key={q._id || idx}
                                    className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-bold text-stone-900">
                                          {q.tailorName || "Master Artisan Atelier"}
                                        </p>
                                        {q.tailorVerified && (
                                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                                            ✓ Verified
                                          </span>
                                        )}
                                        {q.tailorCity && (
                                          <span className="text-[11px] text-stone-500">
                                            📍 {q.tailorCity}
                                          </span>
                                        )}
                                      </div>
                                      {q.notes && (
                                        <p className="mt-1 text-stone-600 italic text-[11px]">
                                          "{q.notes}"
                                        </p>
                                      )}
                                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-stone-500">
                                        <span>Turnaround: <strong>{q.leadTimeDays || 15} days</strong></span>
                                        <span>Sample: <strong>{q.sampleOffered ? "Available" : "On Request"}</strong></span>
                                        {q.tailorPhone && (
                                          <span>Phone: <strong>{q.tailorPhone}</strong></span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="sm:text-right shrink-0">
                                      <p className="text-[11px] text-stone-500">Unit Bid</p>
                                      <p className="font-serif text-base font-bold text-[#8f2338]">
                                        {money(q.pricePerUnit || 0)}
                                      </p>
                                      {q.totalAmount && (
                                        <p className="text-[10px] text-stone-400">
                                          Total: {money(q.totalAmount)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <p className="text-[11px] text-stone-400 border-t border-stone-100 pt-2">
                            Posted: {new Date(bReq.createdAt).toLocaleDateString()}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* =====================================================
                TAB 8: GSTIN COMPLIANCE & BUSINESS VERIFICATION
            ====================================================== */}
            {role === "business" && activeTab === "verification" && (
              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs space-y-6">
                {/* Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      businessProfile?.verificationStatus === "verified" || businessProfile?.verified
                        ? "bg-emerald-100 text-emerald-800"
                        : businessProfile?.verificationStatus === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-[#8f2338]"
                    }`}>
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-bold text-[#231b1a]">
                        GSTIN Compliance & Commercial Entity Audit
                      </h2>
                      <p className="text-xs text-stone-500">
                        Official enterprise accreditation for issuing bulk apparel tenders and RFQs.
                      </p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    businessProfile?.verificationStatus === "verified" || businessProfile?.verified
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : businessProfile?.verificationStatus === "pending"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-rose-100 text-rose-800 border border-rose-300"
                  }`}>
                    {businessProfile?.verificationStatus === "verified" || businessProfile?.verified ? (
                      <>
                        <ShieldCheck size={13} />
                        <span>VERIFIED ENTERPRISE</span>
                      </>
                    ) : businessProfile?.verificationStatus === "pending" ? (
                      <>
                        <Clock3 size={13} />
                        <span>AUDIT UNDER REVIEW</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={13} />
                        <span>UNVERIFIED - ACTION REQUIRED</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Status Guidance Banner */}
                {businessProfile?.verificationStatus === "verified" || businessProfile?.verified ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 size={16} /> Enterprise Credentials Fully Authenticated
                    </p>
                    <p className="text-emerald-800 text-[11px] leading-relaxed">
                      Your legal trade entity and GSTIN ({businessProfile?.gstin}) have been successfully audited by MeraTailor administrative compliance. You can publish unlimited bulk tender requirements on the platform.
                    </p>
                  </div>
                ) : businessProfile?.verificationStatus === "pending" ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-800">
                      <Clock3 size={16} /> Audit Submission Under Active Evaluation
                    </p>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      Your credentials have been submitted for compliance verification. The administrator will review your GSTIN and business details against the platform registry. Review is typically completed within 2–4 business hours.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-rose-800">
                      <AlertCircle size={16} /> Mandatory Verification Policy
                    </p>
                    <p className="text-rose-800 text-[11px] leading-relaxed">
                      To safeguard marketplace integrity and protect artisan tailors against spam, only businesses with an authenticated 15-character GSTIN can publish bulk requirements. Please complete the registration form below.
                    </p>
                  </div>
                )}

                {/* Compliance Form */}
                <form onSubmit={handleSaveBusinessVerification} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                    {/* Legal Company Name */}
                    <div className="space-y-1">
                      <label className="block font-bold text-stone-700">
                        Legal Organization / Company Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        required
                        value={businessVerifyForm.companyName}
                        onChange={(e) => setBusinessVerifyForm({ ...businessVerifyForm, companyName: e.target.value })}
                        placeholder="e.g. Apex Hospitality Group Ltd."
                        className="w-full rounded-xl border border-stone-200 p-2.5 text-xs outline-none focus:border-[#8f2338] focus:bg-white bg-[#fdfbf9]"
                      />
                    </div>

                    {/* 15-Digit GSTIN */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-stone-700">
                          15-Digit GSTIN Number <span className="text-rose-600">*</span>
                        </label>
                        {businessVerifyForm.gstin && (
                          <span className={`text-[10px] font-bold ${
                            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(businessVerifyForm.gstin.trim())
                              ? "text-emerald-700"
                              : "text-rose-600"
                          }`}>
                            {/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(businessVerifyForm.gstin.trim())
                              ? "✓ Standard Format Valid"
                              : "Format: 15-char standard GSTIN"}
                          </span>
                        )}
                      </div>
                      <input
                        required
                        maxLength={15}
                        value={businessVerifyForm.gstin}
                        onChange={(e) => setBusinessVerifyForm({ ...businessVerifyForm, gstin: e.target.value.toUpperCase() })}
                        placeholder="e.g. 08AAAAA0000A1Z5"
                        className="w-full font-mono uppercase rounded-xl border border-stone-200 p-2.5 text-xs outline-none focus:border-[#8f2338] focus:bg-white bg-[#fdfbf9]"
                      />
                    </div>

                    {/* Industry Sector */}
                    <div className="space-y-1">
                      <label className="block font-bold text-stone-700">
                        Primary Procurement Sector <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={businessVerifyForm.businessType}
                        onChange={(e) => setBusinessVerifyForm({ ...businessVerifyForm, businessType: e.target.value })}
                        className="w-full rounded-xl border border-stone-200 p-2.5 text-xs outline-none focus:border-[#8f2338] focus:bg-white bg-[#fdfbf9]"
                      >
                        <option value="Corporate Enterprise & Office Apparel">Corporate Enterprise & Office Apparel</option>
                        <option value="School & University Uniforms">School & University Uniforms</option>
                        <option value="Hospitality, Hotels & Linens">Hospitality, Hotels & Linens</option>
                        <option value="Retail Fashion Label & Private Brand">Retail Fashion Label & Private Brand</option>
                        <option value="Hospital & Healthcare Scrubs">Hospital & Healthcare Scrubs</option>
                        <option value="Security Agency Uniforms">Security Agency Uniforms</option>
                        <option value="Event Production & Promotional Apparel">Event Production & Promotional Apparel</option>
                        <option value="Other Commercial Entity">Other Commercial Entity</option>
                      </select>
                    </div>

                    {/* PAN Number */}
                    <div className="space-y-1">
                      <label className="block font-bold text-stone-700">
                        Company PAN Number (Optional)
                      </label>
                      <input
                        maxLength={10}
                        value={businessVerifyForm.panNumber}
                        onChange={(e) => setBusinessVerifyForm({ ...businessVerifyForm, panNumber: e.target.value.toUpperCase() })}
                        placeholder="e.g. AAAAA0000A"
                        className="w-full font-mono uppercase rounded-xl border border-stone-200 p-2.5 text-xs outline-none focus:border-[#8f2338] focus:bg-white bg-[#fdfbf9]"
                      />
                    </div>

                    {/* Authorized Contact Officer */}
                    <div className="space-y-1">
                      <label className="block font-bold text-stone-700">
                        Authorized Procurement Officer <span className="text-rose-600">*</span>
                      </label>
                      <input
                        required
                        value={businessVerifyForm.contactPerson}
                        onChange={(e) => setBusinessVerifyForm({ ...businessVerifyForm, contactPerson: e.target.value })}
                        placeholder="e.g. Vikramaditya Rathore (Chief Buyer)"
                        className="w-full rounded-xl border border-stone-200 p-2.5 text-xs outline-none focus:border-[#8f2338] focus:bg-white bg-[#fdfbf9]"
                      />
                    </div>

                    {/* Contact Phone */}
                    <div className="space-y-1">
                      <label className="block font-bold text-stone-700">
                        Officer Direct Telephone <span className="text-rose-600">*</span>
                      </label>
                      <input
                        required
                        value={businessVerifyForm.contactPhone}
                        onChange={(e) => setBusinessVerifyForm({ ...businessVerifyForm, contactPhone: e.target.value })}
                        placeholder="+91 98290 12345"
                        className="w-full rounded-xl border border-stone-200 p-2.5 text-xs outline-none focus:border-[#8f2338] focus:bg-white bg-[#fdfbf9]"
                      />
                    </div>

                    {/* Official Website */}
                    <div className="space-y-1">
                      <label className="block font-bold text-stone-700">
                        Corporate Website (Optional)
                      </label>
                      <input
                        value={businessVerifyForm.website}
                        onChange={(e) => setBusinessVerifyForm({ ...businessVerifyForm, website: e.target.value })}
                        placeholder="https://example.com"
                        className="w-full rounded-xl border border-stone-200 p-2.5 text-xs outline-none focus:border-[#8f2338] focus:bg-white bg-[#fdfbf9]"
                      />
                    </div>

                    {/* City & State */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block font-bold text-stone-700">
                          City <span className="text-rose-600">*</span>
                        </label>
                        <input
                          required
                          value={businessVerifyForm.city}
                          onChange={(e) => setBusinessVerifyForm({ ...businessVerifyForm, city: e.target.value })}
                          placeholder="Jaipur"
                          className="w-full rounded-xl border border-stone-200 p-2.5 text-xs outline-none focus:border-[#8f2338] focus:bg-white bg-[#fdfbf9]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-stone-700">
                          State <span className="text-rose-600">*</span>
                        </label>
                        <input
                          required
                          value={businessVerifyForm.state}
                          onChange={(e) => setBusinessVerifyForm({ ...businessVerifyForm, state: e.target.value })}
                          placeholder="Rajasthan"
                          className="w-full rounded-xl border border-stone-200 p-2.5 text-xs outline-none focus:border-[#8f2338] focus:bg-white bg-[#fdfbf9]"
                        />
                      </div>
                    </div>

                    {/* Full HQ Address */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="block font-bold text-stone-700">
                        Registered Corporate Address <span className="text-rose-600">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={businessVerifyForm.address}
                        onChange={(e) => setBusinessVerifyForm({ ...businessVerifyForm, address: e.target.value })}
                        placeholder="Plot / Suite Number, Commercial Complex, Sector, Industrial Area"
                        className="w-full rounded-xl border border-stone-200 p-2.5 text-xs outline-none focus:border-[#8f2338] focus:bg-white bg-[#fdfbf9]"
                      />
                    </div>
                  </div>

                  {/* Submission Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100 pt-4">
                    <p className="text-[11px] text-stone-500">
                      Submitting updates your legal identity and initiates an administrator audit.
                    </p>

                    <button
                      type="submit"
                      disabled={isBusinessVerificationSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8f2338] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition disabled:opacity-50"
                    >
                      <ShieldCheck size={14} />
                      <span>
                        {isBusinessVerificationSubmitting
                          ? "Submitting for Administrative Audit..."
                          : businessProfile?.verificationStatus === "verified" || businessProfile?.verified
                          ? "Update Verified Credentials"
                          : "Submit for Administrative Verification"}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
        </div>
      )}

        {/* =========================================================
            MODAL 1: EDIT PROFILE (CLEAN FORM MODAL)
        ========================================================== */}
        {isEditProfileOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget && actingId !== "profile") {
                setIsEditProfileOpen(false);
              }
            }}
          >
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-7 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7eee5] text-[#8f2338]">
                    <Pencil size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#231b1a]">
                      {t("dashboardPage.editProfileTitle", "Edit Profile & Preferences")}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {t("dashboardPage.editProfileSubtitle", "Update your name, bio, contact, and search filters.")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-5 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block font-semibold text-stone-700">
                    {t("dashboardPage.firstName", "First Name")}
                    <input
                      required
                      value={profileForm.firstName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, firstName: e.target.value })
                      }
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    />
                  </label>
                  <label className="block font-semibold text-stone-700">
                    {t("dashboardPage.lastName", "Last Name")}
                    <input
                      value={profileForm.lastName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, lastName: e.target.value })
                      }
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    />
                  </label>
                </div>

                <label className="block font-semibold text-stone-700">
                  {t("dashboardPage.bioLabel", "Bio / Short Statement")}
                  <textarea
                    rows={2}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder={t("dashboardPage.bioPlaceholder", "Tell tailors about your style or tailoring requirements...")}
                    className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block font-semibold text-stone-700">
                    {t("dashboardPage.phoneNumber", "Phone Number")}
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, phone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    />
                  </label>

                  <label className="block font-semibold text-stone-700">
                    {t("dashboardPage.prefLangLabel", "Preferred Language")}
                    <select
                      value={profileForm.preferredLanguage}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, preferredLanguage: e.target.value })
                      }
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block font-semibold text-stone-700">
                    {t("dashboardPage.searchRadiusLabel", "Search Radius")}
                    <select
                      value={profileForm.radiusKm}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, radiusKm: Number(e.target.value) })
                      }
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    >
                      {[2, 5, 10, 20, 50, 100].map((n) => (
                        <option key={n} value={n}>
                          {n} {t("dashboardPage.kmRadius", "km radius")}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block font-semibold text-stone-700">
                    {t("dashboardPage.defaultSortingLabel", "Default Sorting")}
                    <select
                      value={profileForm.sortBy}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, sortBy: e.target.value })
                      }
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="distance">Distance</option>
                      <option value="rating">Rating</option>
                      <option value="price">Price</option>
                    </select>
                  </label>
                </div>

                {/* Categories checkbox */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    {t("dashboardPage.preferredCategoriesLabel", "Preferred Clothing Specialties")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => {
                      const isSelected = profileForm.categories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setProfileForm({
                              ...profileForm,
                              categories: isSelected
                                ? profileForm.categories.filter((c) => c !== cat)
                                : [...profileForm.categories, cat],
                            });
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            isSelected
                              ? "bg-[#8f2338] text-white"
                              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-stone-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-bold text-stone-700 hover:bg-stone-50"
                  >
                    {t("dashboardPage.cancel", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={actingId === "profile"}
                    className="rounded-xl bg-[#8f2338] px-5 py-2 font-bold text-white shadow-xs hover:bg-[#781c2e] disabled:opacity-60 transition"
                  >
                    {actingId === "profile" ? t("dashboardPage.saving", "Saving…") : t("dashboardPage.saveChanges", "Save Changes")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 2: CREATE / EDIT MEASUREMENT (CRUD)
        ========================================================== */}
        {isMeasurementModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget && actingId !== "measurement") {
                setIsMeasurementModalOpen(false);
              }
            }}
          >
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-7 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-[#8f2338]">
                    <Ruler size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      {editingMeasurementId ? t("dashboardPage.editFitProfile", "Edit Fit Profile") : t("dashboardPage.newFitProfile", "New Fit Profile")}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {t("dashboardPage.fitProfileSubtitle", "Enter body measurements in centimeters (cm).")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMeasurementModalOpen(false)}
                  className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveMeasurement} className="mt-5 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block font-semibold text-stone-700">
                    {t("dashboardPage.profileName", "Profile Name")}
                    <input
                      required
                      placeholder={t("dashboardPage.profileNamePlaceholder", "e.g. My Formal Fit")}
                      value={editingMeasurement.name}
                      onChange={(e) =>
                        setEditingMeasurement({ ...editingMeasurement, name: e.target.value })
                      }
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    />
                  </label>

                  <label className="block font-semibold text-stone-700">
                    {t("dashboardPage.garmentType", "Garment Type")}
                    <select
                      value={editingMeasurement.garment}
                      onChange={(e) =>
                        setEditingMeasurement({ ...editingMeasurement, garment: e.target.value })
                      }
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    >
                      {garmentPresets.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Measurement Fields Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {measurementFields.map((field) => (
                    <label key={field} className="block font-semibold text-stone-700 capitalize">
                      {field} (cm)
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="e.g. 98"
                        value={editingMeasurement.values[field] ?? ""}
                        onChange={(e) =>
                          setEditingMeasurement({
                            ...editingMeasurement,
                            values: {
                              ...editingMeasurement.values,
                              [field]: e.target.value,
                            },
                          })
                        }
                        className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-stone-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsMeasurementModalOpen(false)}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-bold text-stone-700 hover:bg-stone-50"
                  >
                    {t("dashboardPage.cancel", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={actingId === "measurement"}
                    className="rounded-xl bg-[#8f2338] px-5 py-2 font-bold text-white shadow-xs hover:bg-[#781c2e] disabled:opacity-60 transition"
                  >
                    {actingId === "measurement" ? t("dashboardPage.saving", "Saving…") : t("dashboardPage.saveProfile", "Save Profile")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 3: VIEW ORDER DETAILS (WITH DELETE & ACCEPT)
        ========================================================== */}
        {selectedOrderDetails && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedOrderDetails(null);
            }}
          >
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-7 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-[#8f2338]">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      {selectedOrderDetails.quantity || 1} ×{" "}
                      {selectedOrderDetails.garment || selectedOrderDetails.category}
                    </h3>
                    <p className="text-xs text-stone-500">
                      #{selectedOrderDetails.id}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-4 text-xs sm:text-sm">
                <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-stone-400">{t("dashboardPage.currentStatus", "Current Status")}</p>
                    <p className="font-bold text-stone-900 mt-0.5">
                      {selectedOrderDetails.status || "Request Sent"}
                    </p>
                  </div>
                  <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-[#8f2338]">
                    {t("dashboardPage.activeOrder", "Active Order")}
                  </span>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-stone-400">{t("dashboardPage.studio", "Tailor Studio")}</p>
                  <p className="font-bold text-stone-900">
                    {selectedOrderDetails.tailorName || "Master Studio"}
                  </p>
                  {selectedOrderDetails.tailorPhone && (
                    <p className="text-xs text-stone-500">
                      {t("dashboardPage.phoneNumber", "Phone")}: {selectedOrderDetails.tailorPhone}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-stone-200 bg-[#fdfbf9] p-3">
                    <p className="text-[10px] font-bold text-stone-400 uppercase">{t("dashboardPage.color", "Color")}</p>
                    <p className="font-semibold text-stone-800">
                      {selectedOrderDetails.color || "As selected"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-[#fdfbf9] p-3">
                    <p className="text-[10px] font-bold text-stone-400 uppercase">{t("dashboardPage.fabric", "Fabric")}</p>
                    <p className="font-semibold text-stone-800">
                      {selectedOrderDetails.fabric || "Customer provided"}
                    </p>
                  </div>
                </div>

                {selectedOrderDetails.notes && (
                  <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5">
                    <p className="text-[10px] font-bold text-stone-400 uppercase">{t("dashboardPage.notes", "Notes")}</p>
                    <p className="mt-1 text-xs text-stone-700">{selectedOrderDetails.notes}</p>
                  </div>
                )}

                <div className="rounded-2xl border border-stone-200 bg-[#fbf7f2] p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-stone-600">{t("dashboardPage.totalPriceOrQuote", "Total Price / Final Quote")}</p>
                    <p className="text-lg font-extrabold text-stone-900">
                      {selectedOrderDetails.quotePrice != null
                        ? money(selectedOrderDetails.quotePrice)
                        : selectedOrderDetails.price != null
                        ? money(selectedOrderDetails.price)
                        : t("dashboardPage.awaitingStudioQuote", "Awaiting Studio Quote")}
                    </p>
                  </div>

                  {selectedOrderDetails.status === "Quote Received" && (
                    <button
                      type="button"
                      disabled={actingId === selectedOrderDetails.id}
                      onClick={() => handleAcceptQuote(selectedOrderDetails.id)}
                      className="rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                    >
                      {actingId === selectedOrderDetails.id ? t("dashboardPage.accepting", "Accepting…") : t("dashboardPage.acceptQuote", "Accept Quote")}
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Footer with Delete Pre-Production Button */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-4">
                {["Request Sent", "Quote Received"].includes(selectedOrderDetails.status) ? (
                  <button
                    type="button"
                    disabled={actingId === selectedOrderDetails.id}
                    onClick={() => {
                      setConfirmDeleteOrder(selectedOrderDetails);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    <Trash2 size={13} className="text-rose-600" />
                    <span>{t("dashboardPage.deleteRequest", "Delete Request")}</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  {t("dashboardPage.close", "Close")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 4: DELETE ORDER CONFIRMATION
        ========================================================== */}
        {confirmDeleteOrder && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget && actingId !== confirmDeleteOrder.id) {
                setConfirmDeleteOrder(null);
              }
            }}
          >
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-rose-100 transition-all sm:p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mb-4">
                <Trash2 size={22} />
              </div>

              <h3 className="font-serif text-lg font-bold text-stone-900">
                {t("dashboardPage.deleteOrderHeading", { id: confirmDeleteOrder.id, defaultValue: `Delete Order #${confirmDeleteOrder.id}?` })}
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                {t(
                  "orderFlow.deleteOrderConfirm",
                  "Are you sure you want to delete this order request? Since it is before the production stage, it will be permanently deleted for both you and the tailor studio."
                )}
              </p>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={actingId === confirmDeleteOrder.id}
                  onClick={() => setConfirmDeleteOrder(null)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  {t("dashboardPage.keepOrder", "Keep Order")}
                </button>
                <button
                  type="button"
                  disabled={actingId === confirmDeleteOrder.id}
                  onClick={() => handleDeleteOrder(confirmDeleteOrder.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  <span>{actingId === confirmDeleteOrder.id ? t("dashboardPage.deleting", "Deleting…") : t("dashboardPage.yesDeleteOrder", "Yes, Delete Order")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 5: CREATE / EDIT BULK REQUIREMENT (BUSINESS)
        ========================================================== */}
        {isBulkModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget && actingId !== "bulk") {
                setIsBulkModalOpen(false);
              }
            }}
          >
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-7 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-[#8f2338]">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      {editingBulkId ? t("dashboardPage.editBulkTitle", "Edit Bulk Requirement") : t("dashboardPage.postBulkTitle", "Post Bulk Requirement")}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {t("dashboardPage.bulkSubtitleModal", "Submit institutional apparel & uniform specifications.")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveBulk} className="mt-5 space-y-4 text-xs sm:text-sm">
                <label className="block font-semibold text-stone-700">
                  {t("dashboardPage.orgNameLabel", "Organization / Company Name")}
                  <input
                    required
                    value={bulkForm.organisation}
                    onChange={(e) => setBulkForm({ ...bulkForm, organisation: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                  />
                </label>

                <label className="block font-semibold text-stone-700">
                  {t("dashboardPage.reqDescLabel", "Requirement Description")}
                  <textarea
                    rows={3}
                    required
                    placeholder={t("dashboardPage.reqDescPlaceholder", "e.g. 100 sets of bespoke staff blazers with customized embroidery...")}
                    value={bulkForm.requirement}
                    onChange={(e) => setBulkForm({ ...bulkForm, requirement: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block font-semibold text-stone-700">
                    {t("dashboardPage.quantityUnitsLabel", "Quantity (Units)")}
                    <input
                      type="number"
                      min="1"
                      required
                      value={bulkForm.quantity}
                      onChange={(e) => setBulkForm({ ...bulkForm, quantity: e.target.value })}
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    />
                  </label>

                  <label className="block font-semibold text-stone-700">
                    {t("dashboardPage.reqTimelineLabel", "Required Timeline")}
                    <input
                      value={bulkForm.timeline}
                      onChange={(e) => setBulkForm({ ...bulkForm, timeline: e.target.value })}
                      placeholder={t("dashboardPage.reqTimelinePlaceholder", "e.g. 30 days")}
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    />
                  </label>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-stone-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-bold text-stone-700 hover:bg-stone-50"
                  >
                    {t("dashboardPage.cancel", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={actingId === "bulk"}
                    className="rounded-xl bg-[#8f2338] px-5 py-2 font-bold text-white shadow-xs hover:bg-[#781c2e] disabled:opacity-60 transition"
                  >
                    {actingId === "bulk" ? t("dashboardPage.saving", "Saving…") : t("dashboardPage.submitRequirement", "Submit Requirement")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 6: APPLY FOR STUDIO VERIFICATION (TAILOR)
        ========================================================== */}
        {isApplyVerificationOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget && actingId !== "applyVerification") {
                setIsApplyVerificationOpen(false);
              }
            }}
          >
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-7 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      {t("verification.applyTitle", "Apply for Tailor Studio Verification")}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {t("verification.applySubtitle", "Get verified by admin to appear on the public Find Tailors directory.")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsApplyVerificationOpen(false)}
                  className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleApplyVerification} className="mt-5 space-y-4 text-xs sm:text-sm">
                <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-3.5 space-y-1">
                  <p className="text-[10px] font-bold text-stone-400 uppercase">{t("verification.studioDetails", "Studio Details")}</p>
                  <p className="font-bold text-stone-900">{tailorData?.name || "My Tailor Studio"}</p>
                  <p className="text-xs text-stone-600">
                    {tailorData?.owner || profile?.firstName} · {tailorData?.city || "Jaipur"}, {tailorData?.area || ""} · {tailorData?.experience || 5} {t("dashboardPage.yearsExp", "years experience")}
                  </p>
                </div>

                <label className="block font-semibold text-stone-700">
                  {t("verification.adminNotesLabel", "Message / Portfolio Details for Platform Administrator")}
                  <textarea
                    rows={4}
                    required
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder={t(
                      "verification.notesPlaceholder",
                      "Tell the admin about your shop address, years in the trade, craftsmanship specialties, and workshop setup..."
                    )}
                    className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                  />
                </label>

                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-stone-800">
                  💡 {t(
                    "verification.guideline",
                    "Once approved by the MeraTailor administration, your atelier will immediately be visible to thousands of customers looking for nearby tailors."
                  )}
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-stone-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsApplyVerificationOpen(false)}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-bold text-stone-700 hover:bg-stone-50"
                  >
                    {t("dashboardPage.cancel", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={actingId === "applyVerification" || !verificationNotes.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-5 py-2 font-bold text-white shadow-xs hover:bg-[#781c2e] disabled:opacity-60 transition"
                  >
                    <ShieldCheck size={14} />
                    <span>{actingId === "applyVerification" ? t("dashboardPage.submitting", "Submitting…") : t("verification.submitApplication", "Submit Application")}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 7: EDIT STUDIO PROFILE & RATE CARD (TAILOR)
        ========================================================== */}
        {isEditStudioOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget && actingId !== "studio") {
                setIsEditStudioOpen(false);
              }
            }}
          >
            <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-7 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-[#8f2338]">
                    <Scissors size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      {t("tailorStudio.editTitle", "Edit Studio Profile & Rate Card")}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {t("tailorStudio.editSubtitle", "Update your shop branding, contact info, pricing, and service offerings.")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditStudioOpen(false)}
                  className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveStudio} className="mt-5 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block font-semibold text-stone-700">
                    {t("tailorStudio.nameLabel", "Studio / Atelier Name")}
                    <input
                      required
                      value={tailorStudioForm.name}
                      onChange={(e) => setTailorStudioForm({ ...tailorStudioForm, name: e.target.value })}
                      placeholder="e.g. Royal Jaipur Tailors"
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    />
                  </label>

                  <label className="block font-semibold text-stone-700">
                    {t("tailorStudio.ownerLabel", "Master Artisan / Owner Name")}
                    <input
                      required
                      value={tailorStudioForm.owner}
                      onChange={(e) => setTailorStudioForm({ ...tailorStudioForm, owner: e.target.value })}
                      placeholder="e.g. Master Ramesh Kumar"
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="block font-semibold text-stone-700">
                    {t("dashboardPage.phoneNumber", "Contact Phone")}
                    <input
                      type="tel"
                      value={tailorStudioForm.phone}
                      onChange={(e) => setTailorStudioForm({ ...tailorStudioForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    />
                  </label>

                  <label className="block font-semibold text-stone-700">
                    {t("tailorStudio.cityLabel", "City")}
                    <input
                      required
                      value={tailorStudioForm.city}
                      onChange={(e) => setTailorStudioForm({ ...tailorStudioForm, city: e.target.value })}
                      placeholder="Jaipur"
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    />
                  </label>

                  <label className="block font-semibold text-stone-700">
                    {t("tailorStudio.areaLabel", "Neighbourhood / Area")}
                    <input
                      value={tailorStudioForm.area}
                      onChange={(e) => setTailorStudioForm({ ...tailorStudioForm, area: e.target.value })}
                      placeholder="e.g. C-Scheme / Mansarovar"
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block font-semibold text-stone-700">
                    {t("dashboardPage.experience", "Experience (Years)")}
                    <input
                      type="number"
                      min="0"
                      value={tailorStudioForm.experience}
                      onChange={(e) => setTailorStudioForm({ ...tailorStudioForm, experience: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    />
                  </label>

                  <label className="block font-semibold text-stone-700">
                    {t("dashboardPage.startingPrice", "Base Starting Price (₹)")}
                    <input
                      type="number"
                      min="0"
                      value={tailorStudioForm.minPrice}
                      onChange={(e) => setTailorStudioForm({ ...tailorStudioForm, minPrice: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                    />
                  </label>
                </div>

                <label className="block font-semibold text-stone-700">
                  {t("tailorStudio.descriptionLabel", "Studio Bio / About")}
                  <textarea
                    rows={2}
                    value={tailorStudioForm.description}
                    onChange={(e) => setTailorStudioForm({ ...tailorStudioForm, description: e.target.value })}
                    placeholder="Describe your craftsmanship, heritage, and fitting guarantee..."
                    className="mt-1 block w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-[#8f2338]"
                  />
                </label>

                {/* Specialties / Categories */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    {t("tailorStudio.specialtiesLabel", "Tailoring Specialties")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Shirt", "Pants", "Dress", "Suit", "Ethnic Wear", "Alteration", "Blouse", "Sherwani", "Kurti"].map((cat) => {
                      const isSelected = tailorStudioForm.categories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setTailorStudioForm({
                              ...tailorStudioForm,
                              categories: isSelected
                                ? tailorStudioForm.categories.filter((c) => c !== cat)
                                : [...tailorStudioForm.categories, cat],
                            });
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            isSelected
                              ? "bg-[#8f2338] text-white font-bold"
                              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Services & Rate Card Builder */}
                <div className="border-t border-stone-100 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-semibold text-stone-700">
                      {t("tailorStudio.servicesMenuLabel", "Services & Price List")}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setTailorStudioForm({
                          ...tailorStudioForm,
                          services: [
                            ...tailorStudioForm.services,
                            { name: "New Stitching Service", price: 499, days: 5 },
                          ],
                        });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#8f2338] hover:underline"
                    >
                      <Plus size={12} /> {t("tailorStudio.addService", "Add Service")}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {tailorStudioForm.services.map((srv, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-[#fdfbf9] p-2 rounded-xl border border-stone-200">
                        <input
                          required
                          value={srv.name}
                          onChange={(e) => {
                            const newServices = [...tailorStudioForm.services];
                            newServices[idx].name = e.target.value;
                            setTailorStudioForm({ ...tailorStudioForm, services: newServices });
                          }}
                          placeholder="Service Name (e.g. Formal Suit Fitting)"
                          className="flex-2 rounded-lg border border-stone-200 bg-white p-1.5 text-xs outline-none focus:border-[#8f2338]"
                        />
                        <div className="flex-1 flex items-center gap-1">
                          <span className="text-stone-400 text-xs">₹</span>
                          <input
                            type="number"
                            min="0"
                            required
                            value={srv.price}
                            onChange={(e) => {
                              const newServices = [...tailorStudioForm.services];
                              newServices[idx].price = Number(e.target.value);
                              setTailorStudioForm({ ...tailorStudioForm, services: newServices });
                            }}
                            className="w-full rounded-lg border border-stone-200 bg-white p-1.5 text-xs outline-none focus:border-[#8f2338]"
                          />
                        </div>
                        <div className="flex-1 flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            required
                            value={srv.days}
                            onChange={(e) => {
                              const newServices = [...tailorStudioForm.services];
                              newServices[idx].days = Number(e.target.value);
                              setTailorStudioForm({ ...tailorStudioForm, services: newServices });
                            }}
                            className="w-full rounded-lg border border-stone-200 bg-white p-1.5 text-xs outline-none focus:border-[#8f2338]"
                          />
                          <span className="text-stone-400 text-[11px]">d</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTailorStudioForm({
                              ...tailorStudioForm,
                              services: tailorStudioForm.services.filter((_, i) => i !== idx),
                            });
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-stone-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditStudioOpen(false)}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-bold text-stone-700 hover:bg-stone-50"
                  >
                    {t("dashboardPage.cancel", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={actingId === "studio"}
                    className="rounded-xl bg-[#8f2338] px-5 py-2 font-bold text-white shadow-xs hover:bg-[#781c2e] disabled:opacity-60 transition"
                  >
                    {actingId === "studio" ? t("dashboardPage.saving", "Saving…") : t("tailorStudio.saveStudio", "Save Studio & Rate Card")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
