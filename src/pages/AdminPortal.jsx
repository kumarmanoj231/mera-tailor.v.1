import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  LayoutDashboard,
  ShieldCheck,
  Shield,
  Users,
  Store,
  Scissors,
  Layers,
  Settings,
  Sliders,
  LogOut,
  Bell,
  Search,
  ArrowRight,
  MapPin,
  Phone,
  Pencil,
  Trash2,
  X,
  Check,
  Plus,
  ChevronDown,
  Eye,
  Send,
  RefreshCw,
  ExternalLink,
  Menu,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Building2,
  Mail,
  User,
  UserCheck,
  UserX,
  Navigation,
  Maximize2,
  Minimize2,
  Lock,
  Globe,
  Save,
  Megaphone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getRoleMeta } from "../components/Navbar/RoleAvatarWithBadge";
import AdminAnnouncementBroadcaster from "../components/admin/AdminAnnouncementBroadcaster";

// Custom Leaflet Pin Icons
const verifiedIcon = L.divIcon({
  className: "custom-pin-verified",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:#047857;color:#ffffff;border:2.5px solid #ffffff;box-shadow:0 4px 10px rgba(0,0,0,0.3);cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

const unverifiedIcon = L.divIcon({
  className: "custom-pin-unverified",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:#8f2338;color:#ffffff;border:2.5px solid #ffffff;box-shadow:0 4px 10px rgba(0,0,0,0.3);cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

function FitMarkers({ items, shouldFit }) {
  const map = useMap();
  useEffect(() => {
    if (!shouldFit || !items.length) return;
    const coords = items
      .filter((i) => i.location?.coordinates && !isNaN(i.location.coordinates[0]))
      .map((i) => [i.location.coordinates[1], i.location.coordinates[0]]);
    if (coords.length > 0) {
      try {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      } catch (e) {
        // Fallback safely
      }
    }
  }, [items, shouldFit, map]);
  return null;
}

function MapFlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target && target.length === 2) {
      map.flyTo(target, 14, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

const CITY_PRESETS = [
  { city: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { city: "Delhi", lat: 28.6139, lng: 77.209 },
  { city: "Mumbai", lat: 19.076, lng: 72.8777 },
  { city: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { city: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { city: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
];

/**
 * User Avatar Component showing Clerk user image with role ring and corner badge
 */
function UserAvatar({ user, role, size = "md", className = "" }) {
  const normRole = (role || user?.role || "customer").toLowerCase();
  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.name || "User";
  const sizeClasses = {
    sm: { box: "h-8 w-8", badge: "h-4 w-4 -bottom-0.5 -right-0.5 ring-[1.5px]", icon: 9 },
    md: { box: "h-9 w-9", badge: "h-4.5 w-4.5 -bottom-0.5 -right-0.5 ring-2", icon: 10 },
    lg: { box: "h-11 w-11", badge: "h-5 w-5 -bottom-0.5 -right-0.5 ring-2", icon: 12 },
  }[size] || { box: "h-9 w-9", badge: "h-4.5 w-4.5 -bottom-0.5 -right-0.5 ring-2", icon: 10 };

  const meta = getRoleMeta(normRole);
  const IconComponent = meta.icon;
  // Use real Clerk avatar/imageUrl if present, otherwise default persona image
  const avatarSrc = user?.avatar || user?.imageUrl || meta.defaultAvatar;

  return (
    <div className="relative inline-flex items-center shrink-0">
      <div className={`rounded-full p-[2px] transition ${meta.ringClass}`}>
        <img
          src={avatarSrc}
          alt={name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = meta.defaultAvatar;
          }}
          className={`${sizeClasses.box} rounded-full object-cover shadow-2xs ${className}`}
        />
      </div>

      <div
        className={`absolute ${sizeClasses.badge} flex items-center justify-center rounded-full ring-white shadow-md pointer-events-none ${meta.cornerBg}`}
        title={`Role: ${meta.label}`}
      >
        <IconComponent size={sizeClasses.icon} strokeWidth={2.6} />
      </div>
    </div>
  );
}

const emptyTailor = {
  name: "",
  owner: "",
  ownerClerkUserId: "",
  area: "",
  city: "Jaipur",
  state: "Rajasthan",
  country: "India",
  categories: "Ethnic Wear, Bespoke Suits, Wedding Couture",
  phone: "",
  latitude: "26.9124",
  longitude: "75.7873",
  experience: 5,
  minPrice: 499,
  description: "",
};

/**
 * Administrator Notifications Flyout Popover
 */
function AdminNotificationPopover({
  notifications,
  readNotifIds,
  unreadCount,
  onClose,
  onMarkAllRead,
  onNotificationClick,
  onOpenSettings,
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/10 lg:bg-transparent"
        onClick={onClose}
      />
      <div
        className="absolute right-0 top-12 w-80 sm:w-96 rounded-3xl bg-white border border-stone-200/90 shadow-2xl z-50 overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-[#fdfbf9]">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-rose-50 text-[#8f2338] flex items-center justify-center font-bold">
              <Bell size={14} />
            </div>
            <div>
              <span className="font-bold text-stone-900 text-xs block leading-tight">
                Administrator Alerts
              </span>
              <span className="text-[10px] text-stone-400">
                Live platform activity
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-[11px] font-bold text-[#8f2338] hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 text-xs cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="max-h-[360px] overflow-y-auto divide-y divide-stone-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={28} className="mx-auto text-stone-300 mb-2" />
              <p className="text-xs font-bold text-stone-700">No Notifications</p>
              <p className="text-[11px] text-stone-400 mt-0.5">You're completely caught up!</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !readNotifIds.includes(notif.id);
              return (
                <div
                  key={notif.id}
                  onClick={() => onNotificationClick(notif)}
                  className={`p-3.5 hover:bg-stone-50 transition cursor-pointer flex items-start gap-3 relative ${
                    isUnread ? "bg-rose-50/20" : ""
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      notif.type === "verification"
                        ? "bg-[#fef2f2] text-[#ef4444]"
                        : notif.type === "bulk"
                        ? "bg-[#fffbeb] text-[#f59e0b]"
                        : notif.type === "user"
                        ? "bg-[#f5f3ff] text-[#8b5cf6]"
                        : "bg-[#ecfdf5] text-[#10b981]"
                    }`}
                  >
                    {notif.type === "verification" ? (
                      <ShieldCheck size={16} />
                    ) : notif.type === "bulk" ? (
                      <Layers size={16} />
                    ) : notif.type === "user" ? (
                      <Users size={16} />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-stone-900 text-xs truncate">
                        {notif.title}
                      </span>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-[#8f2338] shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-stone-400">
                        {notif.time || "Recently"}
                      </span>
                      <span className="text-[10px] font-bold text-[#8f2338] hover:underline">
                        View details →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-stone-400">
            {unreadCount} unread alert{unreadCount !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-[11px] font-bold text-stone-700 hover:text-stone-950 cursor-pointer"
          >
            Alert Settings →
          </button>
        </div>
      </div>
    </>
  );
}

export default function AdminPortal() {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === "hi";
  const { isSignedIn, profile, user, getToken, openSignUp, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Active Tab from SearchParams: 'dashboard' | 'verifications' | 'users' | 'tailors' | 'bulk' | 'settings'
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const validTabs = ["dashboard", "verifications", "users", "tailors", "bulk", "announcements", "settings", "profile"];
  const initialTab = validTabs.includes(urlTab) ? (urlTab === "profile" ? "settings" : urlTab) : "dashboard";
  const [tab, setTab] = useState(initialTab);

  // Mobile sidebar drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab && validTabs.includes(currentTab)) {
      const normalized = currentTab === "profile" ? "settings" : currentTab;
      if (normalized !== tab) setTab(normalized);
    } else if (!currentTab) {
      if (tab !== "dashboard") setTab("dashboard");
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
    setMobileMenuOpen(false);
  };

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState("");

  // Verification filter & search
  const [verificationFilter, setVerificationFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Users filter & search
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // Create User State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "customer",
  });
  const [credentials, setCredentials] = useState(null);

  // Tailor Studio Edit State
  const [newTailor, setNewTailor] = useState(emptyTailor);
  const [editingTailorId, setEditingTailorId] = useState(null);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);

  // Tailor Directory & Map Layout State
  const [mapFilter, setMapFilter] = useState("all");
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mapFlyTarget, setMapFlyTarget] = useState(null);
  const [tailorDirSearch, setTailorDirSearch] = useState("");
  const [tailorDirCity, setTailorDirCity] = useState("all");
  const [tailorDirStatus, setTailorDirStatus] = useState("all");

  // Bulk Orders State & Modals
  const [bulkFilter, setBulkFilter] = useState("all");
  const [bulkSearch, setBulkSearch] = useState("");
  const [isAddBulkModalOpen, setIsAddBulkModalOpen] = useState(false);
  const [activeRespondOrder, setActiveRespondOrder] = useState(null);
  const [newBulkOrder, setNewBulkOrder] = useState({
    title: "",
    organisation: "",
    category: "Uniforms",
    quantity: 100,
    city: "Jaipur",
    description: "",
    budgetMin: 500,
    budgetMax: 2000,
  });

  // Admin Settings & Profile Form State
  const [settingsActiveSubTab, setSettingsActiveSubTab] = useState("profile");
  const [adminProfileForm, setAdminProfileForm] = useState({
    firstName: "Manoj Kumar",
    lastName: "Lodha",
    phone: "+91 6268893387",
    bio: "Hi, I am Manoj Kumar!",
    preferredLanguage: "en",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Administrator Notifications State & Logic
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("meraTailor.adminReadNotifs") || "[]");
    } catch {
      return [];
    }
  });

  const [alertSettings, setAlertSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("meraTailor.adminAlertSettings");
      return saved
        ? JSON.parse(saved)
        : {
            studioVerifications: true,
            bulkOrders: true,
            userRegistrations: true,
            systemHealth: true,
            emailNotifications: false,
          };
    } catch {
      return {
        studioVerifications: true,
        bulkOrders: true,
        userRegistrations: true,
        systemHealth: true,
        emailNotifications: false,
      };
    }
  });

  const handleToggleAlertSetting = (key) => {
    setAlertSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("meraTailor.adminAlertSettings", JSON.stringify(updated));
      } catch {}
      toast.success("Notification preference updated.");
      return updated;
    });
  };

  const handleClearReadNotifications = () => {
    setNotifications((prev) => prev.filter((n) => !readNotifIds.includes(n.id)));
    toast.info("Cleared read notifications.");
  };

  // Synthesize notifications from current active database records
  const synthesizeLocalNotifications = (uList = [], tList = [], bList = []) => {
    const list = [];
    const pending = tList.filter((t) => !t.verified && t.verificationStatus !== "verified");
    pending.forEach((t) => {
      list.push({
        id: `notif-verify-${t._id || t.id}`,
        type: "verification",
        title: "Studio Verification Pending",
        message: `${t.name} in ${t.city || "Jaipur"} applied for workshop verified status.`,
        targetTab: "verifications",
        time: "10m ago",
        createdAt: t.verificationAppliedAt || t.createdAt || new Date(),
        unread: true,
      });
    });

    uList.slice(0, 3).forEach((u) => {
      const uName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User";
      const uRole = (u.role || "customer").toUpperCase();
      list.push({
        id: `notif-user-${u.id || u._id}`,
        type: "user",
        title: "New User Registered",
        message: `${uName} registered as a ${uRole} account on Mera Tailor.`,
        targetTab: "users",
        time: "1h ago",
        user: u,
        createdAt: u.createdAt || new Date(),
        unread: true,
      });
    });

    bList.slice(0, 3).forEach((b) => {
      list.push({
        id: `notif-bulk-${b._id || b.id}`,
        type: "bulk",
        title: "New B2B RFQ Demand",
        message: `${b.organisation || "Enterprise"} submitted requirement for ${b.quantity || 100} units in ${b.city || "Jaipur"}.`,
        targetTab: "bulk",
        time: "3h ago",
        createdAt: b.createdAt || new Date(),
        unread: true,
      });
    });

    list.push({
      id: "notif-system-health",
      type: "system",
      title: "Platform Health: Operational",
      message: "Database connections, verification queues, and Leaflet geospatial map are all healthy.",
      targetTab: "dashboard",
      time: "Just now",
      createdAt: new Date(),
      unread: false,
    });

    return list;
  };

  useEffect(() => {
    if (profile) {
      setAdminProfileForm({
        firstName: profile.firstName || profile.name?.split(" ")[0] || "Manoj Kumar",
        lastName: profile.lastName || profile.name?.split(" ").slice(1).join(" ") || "Lodha",
        phone: profile.phone || "+91 6268893387",
        bio: profile.bio || "Hi, I am Manoj Kumar!",
        preferredLanguage: profile.preferredLanguage || i18n.language || "en",
      });
    }
  }, [profile, i18n.language]);

  async function request(path, options = {}) {
    const token = await getToken();
    const response = await fetch(`/api${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || "Operation failed.");
    return body;
  }

  async function loadData() {
    setLoading(true);
    try {
      setError("");
      const [u, ta, bulk, notifs] = await Promise.all([
        request("/admin/users").catch(() => []),
        request("/admin/tailors").catch(() => []),
        request("/bulk-orders").catch(() => []),
        request("/admin/notifications").catch(() => []),
      ]);
      const validUsers = Array.isArray(u) ? u : [];
      const validTailors = Array.isArray(ta) ? ta : [];
      const validBulk = Array.isArray(bulk) ? bulk : bulk?.bulkOrders || [];

      setUsers(validUsers);
      setTailors(validTailors);
      setBulkOrders(validBulk);

      if (Array.isArray(notifs) && notifs.length > 0) {
        setNotifications(notifs);
      } else {
        setNotifications(synthesizeLocalNotifications(validUsers, validTailors, validBulk));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const unreadNotifications = useMemo(() => {
    return notifications.filter((n) => !readNotifIds.includes(n.id));
  }, [notifications, readNotifIds]);

  const unreadCount = unreadNotifications.length;

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotifIds(allIds);
    try {
      localStorage.setItem("meraTailor.adminReadNotifs", JSON.stringify(allIds));
    } catch {}
    toast.success("All notifications marked as read.");
  };

  const handleDismissNotification = (id, e) => {
    e?.stopPropagation();
    setReadNotifIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      try {
        localStorage.setItem("meraTailor.adminReadNotifs", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleNotificationClick = (notif) => {
    handleDismissNotification(notif.id);
    setNotificationsOpen(false);
    if (notif.targetTab) {
      handleTabChange(notif.targetTab);
      toast.info(`Opened ${notif.title}`);
    }
  };

  useEffect(() => {
    if (isSignedIn && profile?.role === "admin") {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isSignedIn, profile?.role]);

  /* =========================================================
     VERIFICATION ACTIONS
  ========================================================== */
  async function handleVerifyTailor(tailorId, approve = true) {
    setActingId(tailorId);
    try {
      const endpoint = approve
        ? `/admin/tailors/${tailorId}/verify`
        : `/admin/tailors/${tailorId}/reject`;

      await request(endpoint, { method: "PATCH" });
      if (approve) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        toast.success("Tailor studio verified successfully!");
      } else {
        toast.info("Tailor verification application rejected.");
      }
      await loadData();
    } catch (e) {
      toast.error(e.message || "Failed to update verification status.");
    } finally {
      setActingId("");
    }
  }

  /* =========================================================
     USER ACTIONS
  ========================================================== */
  async function handleChangeUserRole(targetUser, newRole) {
    try {
      await request(`/admin/users/${targetUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      toast.success("User role updated successfully.");
      await loadData();
    } catch (e) {
      toast.error(e.message || "Failed to update user role.");
    }
  }

  async function handleToggleUserDisabled(targetUser) {
    try {
      await request(`/admin/users/${targetUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({ disabled: !targetUser.disabled }),
      });
      toast.success(targetUser.disabled ? "User enabled." : "User disabled.");
      await loadData();
    } catch (e) {
      toast.error(e.message || "Action failed.");
    }
  }

  async function handleRemoveUser(targetUser) {
    if (!window.confirm(`Permanently remove ${targetUser.email} from system?`)) return;
    try {
      await request(`/admin/users/${targetUser.id}`, { method: "DELETE" });
      toast.success("User removed from database and Clerk.");
      await loadData();
    } catch (e) {
      toast.error(e.message || "Could not delete user.");
    }
  }

  async function handleAddTestUser(e) {
    e.preventDefault();
    try {
      const result = await request("/admin/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });
      setCredentials({ email: newUser.email, password: result.temporaryPassword });
      setNewUser({ email: "", firstName: "", lastName: "", role: "customer" });
      setIsCreateUserModalOpen(false);
      toast.success("User created successfully!");
      await loadData();
    } catch (e) {
      toast.error(e.message);
    }
  }

  /* =========================================================
     TAILOR STUDIO ACTIONS
  ========================================================== */
  function handleOpenEditTailor(item) {
    setEditingTailorId(item._id);
    setNewTailor({
      name: item.name || "",
      owner: item.owner || "",
      ownerClerkUserId: item.ownerClerkUserId || "",
      area: item.area || "",
      city: item.city || "Jaipur",
      state: item.state || "Rajasthan",
      country: item.country || "India",
      categories: (item.categories || []).join(", "),
      phone: item.phone || "",
      latitude: String(item.location?.coordinates?.[1] ?? "26.9124"),
      longitude: String(item.location?.coordinates?.[0] ?? "75.7873"),
      experience: item.experience || 5,
      minPrice: item.minPrice || 499,
      description: item.description || "",
    });
    setIsStudioModalOpen(true);
  }

  function handleOpenCreateTailor() {
    setEditingTailorId(null);
    setNewTailor(emptyTailor);
    setIsStudioModalOpen(true);
  }

  async function handleSaveTailor(e) {
    e.preventDefault();
    try {
      const payload = {
        ...newTailor,
        categories: newTailor.categories
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        latitude: newTailor.latitude ? Number(newTailor.latitude) : undefined,
        longitude: newTailor.longitude ? Number(newTailor.longitude) : undefined,
        experience: Number(newTailor.experience) || 5,
        minPrice: Number(newTailor.minPrice) || 499,
      };

      const endpoint = editingTailorId
        ? `/admin/tailors/${editingTailorId}`
        : "/admin/tailors";
      const method = editingTailorId ? "PATCH" : "POST";

      await request(endpoint, { method, body: JSON.stringify(payload) });
      setIsStudioModalOpen(false);
      setEditingTailorId(null);
      setNewTailor(emptyTailor);
      toast.success("Tailor studio saved successfully.");
      await loadData();
    } catch (e) {
      toast.error(e.message || "Failed to save tailor.");
    }
  }

  async function handleRemoveTailor(item) {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await request(`/admin/tailors/${item._id}`, { method: "DELETE" });
      toast.success("Tailor deleted.");
      await loadData();
    } catch (e) {
      toast.error(e.message || "Failed to delete tailor.");
    }
  }

  /* =========================================================
     BULK ORDERS & RFQ ACTIONS
  ========================================================== */
  async function handleDeleteBulkOrder(id) {
    if (!window.confirm("Delete this bulk requirement posting?")) return;
    try {
      await request(`/bulk-orders/${id}`, { method: "DELETE" });
      toast.success("Bulk order removed.");
      await loadData();
    } catch (e) {
      toast.error(e.message || "Could not remove bulk posting.");
    }
  }

  async function handleCreateBulkOrder(e) {
    e.preventDefault();
    try {
      await request("/bulk-orders", {
        method: "POST",
        body: JSON.stringify({
          title: newBulkOrder.title,
          organisation: newBulkOrder.organisation,
          category: newBulkOrder.category,
          quantity: Number(newBulkOrder.quantity) || 100,
          city: newBulkOrder.city,
          description: newBulkOrder.description,
          budget: {
            min: Number(newBulkOrder.budgetMin) || 500,
            max: Number(newBulkOrder.budgetMax) || 2000,
          },
        }),
      });
      setIsAddBulkModalOpen(false);
      toast.success("Bulk RFQ requirement created successfully!");
      await loadData();
    } catch (e) {
      toast.error(e.message || "Failed to create requirement.");
    }
  }

  /* =========================================================
     ADMIN SETTINGS SAVE
  ========================================================== */
  async function handleSaveAdminProfile(e) {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await request("/users/me", {
        method: "PATCH",
        body: JSON.stringify(adminProfileForm),
      });
      if (adminProfileForm.preferredLanguage !== i18n.language) {
        i18n.changeLanguage(adminProfileForm.preferredLanguage);
      }
      if (refreshProfile) await refreshProfile();
      toast.success("Administrator account information saved successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  // Filtered lists
  const pendingVerifications = useMemo(() => {
    return tailors.filter(
      (t) => !t.verified || t.verificationStatus === "pending"
    );
  }, [tailors]);

  const verifiedTailors = useMemo(() => {
    return tailors.filter((t) => t.verified || t.verificationStatus === "verified");
  }, [tailors]);

  const filteredTailors = useMemo(() => {
    return tailors.filter((item) => {
      if (verificationFilter === "pending") {
        if (item.verified || item.verificationStatus === "verified") return false;
      } else if (verificationFilter === "verified") {
        if (!item.verified && item.verificationStatus !== "verified") return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = String(item.name || "").toLowerCase().includes(q);
        const matchesOwner = String(item.owner || "").toLowerCase().includes(q);
        const matchesCity = String(item.city || "").toLowerCase().includes(q);
        if (!matchesName && !matchesOwner && !matchesCity) return false;
      }
      return true;
    });
  }, [tailors, verificationFilter, searchQuery]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase();
        const matchesName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase().includes(q);
        const matchesEmail = String(u.email || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }
      return true;
    });
  }, [users, userRoleFilter, userSearchQuery]);

  // Tailors Geospatial Memos
  const tailorsWithCoords = useMemo(() => {
    return tailors.filter(
      (t) =>
        t.location?.coordinates &&
        t.location.coordinates.length === 2 &&
        !isNaN(t.location.coordinates[0]) &&
        !isNaN(t.location.coordinates[1])
    );
  }, [tailors]);

  const mapDisplayTailors = useMemo(() => {
    return tailorsWithCoords.filter((item) => {
      if (mapFilter === "verified") {
        return item.verified || item.verificationStatus === "verified";
      }
      if (mapFilter === "unverified") {
        return !item.verified && item.verificationStatus !== "verified";
      }
      return true;
    });
  }, [tailorsWithCoords, mapFilter]);

  const uniqueCities = useMemo(() => {
    const set = new Set();
    tailors.forEach((t) => {
      if (t.city) set.add(t.city.trim());
    });
    return Array.from(set).sort();
  }, [tailors]);

  const filteredDirectoryTailors = useMemo(() => {
    return tailors.filter((t) => {
      if (tailorDirCity !== "all" && t.city?.toLowerCase() !== tailorDirCity.toLowerCase()) {
        return false;
      }
      if (tailorDirStatus === "verified" && !t.verified && t.verificationStatus !== "verified") {
        return false;
      }
      if (tailorDirStatus === "unverified" && (t.verified || t.verificationStatus === "verified")) {
        return false;
      }
      if (tailorDirSearch.trim()) {
        const q = tailorDirSearch.toLowerCase();
        const name = String(t.name || "").toLowerCase();
        const owner = String(t.owner || "").toLowerCase();
        const area = String(t.area || "").toLowerCase();
        const city = String(t.city || "").toLowerCase();
        if (!name.includes(q) && !owner.includes(q) && !area.includes(q) && !city.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [tailors, tailorDirCity, tailorDirStatus, tailorDirSearch]);

  const displayBulkOrders = useMemo(() => {
    let list = bulkOrders;
    return list.filter((b) => {
      if (bulkFilter !== "all") {
        const bStatus = (b.status || "open").toLowerCase();
        if (bulkFilter === "open" && bStatus !== "open") return false;
        if (bulkFilter === "in_review" && bStatus !== "in_review") return false;
        if (bulkFilter === "approved" && bStatus !== "approved") return false;
        if (bulkFilter === "rejected" && bStatus !== "rejected") return false;
      }
      if (bulkSearch.trim()) {
        const q = bulkSearch.toLowerCase();
        const title = String(b.title || "").toLowerCase();
        const org = String(b.organisation || "").toLowerCase();
        const city = String(b.city || "").toLowerCase();
        if (!title.includes(q) && !org.includes(q) && !city.includes(q)) return false;
      }
      return true;
    });
  }, [bulkOrders, bulkFilter, bulkSearch]);

  // Stats Breakdown
  const stats = useMemo(() => {
    const roles = { customer: 0, tailor: 0, business: 0, admin: 0 };
    users.forEach((u) => {
      if (roles[u.role] !== undefined) roles[u.role]++;
      else roles.customer++;
    });

    return {
      totalUsers: users.length || 4,
      roles,
      totalTailors: tailors.length || 1,
      verifiedCount: verifiedTailors.length || 1,
      pendingCount: pendingVerifications.length,
      totalBulk: (bulkOrders.length || 3),
    };
  }, [users, tailors, verifiedTailors, pendingVerifications, bulkOrders]);

  const adminDisplayName =
    profile?.name ||
    user?.fullName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : null) ||
    "Manoj Kumar";

  const adminFullName =
    profile?.name ||
    user?.fullName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : null) ||
    "Manoj Kumar Lodha";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return isHi ? "सुप्रभात," : "Good Morning,";
    if (hour < 17) return isHi ? "शुभ दोपहर," : "Good Afternoon,";
    return isHi ? "शुभ संध्या," : "Good Evening,";
  }, [isHi]);

  // 6 Primary Sidebar navigation links
  const sidebarNavItems = [
    { id: "dashboard", label: isHi ? "डैशबोर्ड" : "Dashboard", icon: LayoutDashboard },
    { id: "verifications", label: isHi ? "सत्यापन" : "Verifications", icon: ShieldCheck, count: stats.pendingCount },
    { id: "users", label: isHi ? "उपयोगकर्ता" : "Users", icon: Users, count: stats.totalUsers },
    { id: "tailors", label: isHi ? "टेलर स्टूडियो" : "Tailor Studios", icon: Store, count: stats.totalTailors },
    { id: "bulk", label: isHi ? "थोक ऑर्डर और RFQ" : "Bulk Orders & RFQs", icon: Layers, count: stats.totalBulk },
    { id: "announcements", label: isHi ? "घोषणाएं" : "Broadcast", icon: Megaphone },
    { id: "settings", label: isHi ? "सेटिंग्स" : "Settings", icon: Settings },
  ];

  // Auth Protection Fallback
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#faf9f6] text-[#172033] flex flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 py-16">
          <div className="max-w-md w-full rounded-3xl border border-stone-200/80 bg-white p-8 text-center shadow-md">
            <div className="h-14 w-14 rounded-2xl bg-[#fdf2f2] text-[#8f2338] mx-auto flex items-center justify-center mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black text-stone-900">Admin Portal</h1>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              Please sign in with administrator credentials to access the master management center.
            </p>
            <button
              onClick={openSignUp}
              className="mt-6 w-full rounded-xl bg-[#8f2338] hover:bg-[#761c30] text-white py-3 text-xs font-bold shadow-xs transition cursor-pointer"
            >
              Sign In as Admin
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#faf9f6] text-[#172033] flex flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 py-16">
          <div className="max-w-md w-full rounded-3xl border border-rose-200 bg-rose-50/70 p-8 text-center shadow-xs">
            <AlertCircle size={40} className="mx-auto text-[#8f2338] mb-3" />
            <h1 className="text-xl font-bold text-rose-950">Access Restricted</h1>
            <p className="text-xs text-rose-800 mt-2 leading-relaxed">
              Your current account does not have administrator privileges.
            </p>
            <Link
              to="/"
              className="mt-5 inline-block rounded-xl bg-[#8f2338] text-white px-5 py-2.5 text-xs font-bold hover:bg-[#761c30]"
            >
              Return to Homepage
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#172033] flex flex-col font-sans antialiased">
      {/* 1. ORIGINAL APP NAVBAR */}
      <Navbar />

      {/* 2. ADMIN CONTROL SUB-HEADER & MODULE TABS BAR */}
      <div className="sticky top-[72px] z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3">
            {/* Left: Portal Title & Live Badge */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-[#16a34a] flex items-center justify-center font-bold">
                <ShieldCheck size={20} strokeWidth={2.4} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-stone-900 leading-tight">
                    Admin Portal
                  </h1>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                    Live Platform
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Master Atelier, User Management & System Oversight
                </p>
              </div>
            </div>

            {/* Right: Module Tabs & Notification Bell */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabChange(item.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-[#8f2338] text-white shadow-2xs"
                        : "text-stone-600 hover:text-stone-950 hover:bg-stone-100"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && item.id !== "dashboard" && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Notifications Flyout Popover */}
              <div className="relative pl-1.5 border-l border-stone-200 ml-1">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-xl text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition cursor-pointer"
                  title="Administrator Notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#8f2338] animate-pulse" />
                  )}
                </button>

                {notificationsOpen && (
                  <AdminNotificationPopover
                    notifications={notifications}
                    readNotifIds={readNotifIds}
                    unreadCount={unreadCount}
                    onClose={() => setNotificationsOpen(false)}
                    onMarkAllRead={handleMarkAllRead}
                    onNotificationClick={handleNotificationClick}
                    onOpenSettings={() => {
                      setNotificationsOpen(false);
                      setSettingsActiveSubTab("notifications");
                      handleTabChange("settings");
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTENT */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {tab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Greeting Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-stone-200/70 bg-[#fdfbf9] p-6 sm:p-8 lg:p-9 shadow-2xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
                {/* Left: Greetings & 4 KPI Pills */}
                <div className="flex-1 max-w-2xl">
                  <span className="text-xs sm:text-sm text-stone-400 font-medium">
                    {greeting}
                  </span>
                  <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight text-stone-900 mt-1">
                    {adminFullName} <span className="inline-block">👋</span>
                  </h1>
                  <p className="mt-1.5 text-xs sm:text-sm text-stone-500 leading-relaxed">
                    {isHi
                      ? "यहाँ आपकी प्लेटफ़ॉर्म गतिविधियों का अवलोकन है।"
                      : "Here's an overview of your platform activities."}
                  </p>

                  {/* 4 KPI Metric Pills */}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {/* Stat 1: Pending Audits */}
                    <div
                      onClick={() => handleTabChange("verifications")}
                      className="group flex items-center gap-3 bg-white hover:border-rose-300 rounded-2xl border border-stone-200/80 px-4 py-2.5 shadow-2xs cursor-pointer transition min-w-[130px]"
                    >
                      <div className="h-10 w-10 rounded-xl bg-[#fef2f2] flex items-center justify-center text-[#ef4444] shrink-0 group-hover:scale-105 transition">
                        <Shield size={18} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-stone-900 leading-none">
                            {stats.pendingCount}
                          </span>
                          <span className="text-xs text-[#ef4444] font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                        </div>
                        <span className="text-[11px] font-medium text-stone-400 mt-1 whitespace-nowrap">
                          Pending Audits
                        </span>
                      </div>
                    </div>

                    {/* Stat 2: Active Studios */}
                    <div
                      onClick={() => handleTabChange("tailors")}
                      className="group flex items-center gap-3 bg-white hover:border-emerald-300 rounded-2xl border border-stone-200/80 px-4 py-2.5 shadow-2xs cursor-pointer transition min-w-[130px]"
                    >
                      <div className="h-10 w-10 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#10b981] shrink-0 group-hover:scale-105 transition">
                        <Store size={18} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-stone-900 leading-none">
                            {stats.totalTailors}
                          </span>
                          <span className="text-xs text-[#10b981] font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                        </div>
                        <span className="text-[11px] font-medium text-stone-400 mt-1 whitespace-nowrap">
                          Active Studios
                        </span>
                      </div>
                    </div>

                    {/* Stat 3: Total Users */}
                    <div
                      onClick={() => handleTabChange("users")}
                      className="group flex items-center gap-3 bg-white hover:border-purple-300 rounded-2xl border border-stone-200/80 px-4 py-2.5 shadow-2xs cursor-pointer transition min-w-[130px]"
                    >
                      <div className="h-10 w-10 rounded-xl bg-[#f5f3ff] flex items-center justify-center text-[#8b5cf6] shrink-0 group-hover:scale-105 transition">
                        <Users size={18} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-stone-900 leading-none">
                            {stats.totalUsers}
                          </span>
                          <span className="text-xs text-[#8b5cf6] font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                        </div>
                        <span className="text-[11px] font-medium text-stone-400 mt-1 whitespace-nowrap">
                          Total Users
                        </span>
                      </div>
                    </div>

                    {/* Stat 4: B2B Demands */}
                    <div
                      onClick={() => handleTabChange("bulk")}
                      className="group flex items-center gap-3 bg-white hover:border-amber-300 rounded-2xl border border-stone-200/80 px-4 py-2.5 shadow-2xs cursor-pointer transition min-w-[130px]"
                    >
                      <div className="h-10 w-10 rounded-xl bg-[#fffbeb] flex items-center justify-center text-[#f59e0b] shrink-0 group-hover:scale-105 transition">
                        <Layers size={18} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-stone-900 leading-none">
                            {stats.totalBulk}
                          </span>
                          <span className="text-xs text-[#f59e0b] font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                        </div>
                        <span className="text-[11px] font-medium text-stone-400 mt-1 whitespace-nowrap">
                          B2B Demands
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Desk Illustration */}
                <div className="shrink-0 flex items-center justify-center lg:justify-end">
                  <img
                    src="/assets/admin_home/hero_illustration.png"
                    alt="Platform Overview"
                    className="w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px] h-auto object-contain select-none pointer-events-none drop-shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Platform Overview Modules Section */}
            <div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900">
                  Platform Overview
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Quick access to manage key modules of Mera Tailor.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Module 1: Tailor Verifications */}
                <div
                  onClick={() => handleTabChange("verifications")}
                  className="group relative flex flex-col justify-between rounded-3xl border border-stone-200/80 bg-white p-6 shadow-2xs hover:shadow-md hover:border-stone-300 transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-11 w-11 rounded-2xl flex items-center justify-center bg-[#fef2f2] text-[#ef4444] shadow-2xs group-hover:scale-105 transition">
                        <ShieldCheck size={22} />
                      </div>
                      <img
                        src="/assets/admin_home/card_verification.png"
                        alt="Tailor Verifications"
                        className="h-14 w-auto object-contain"
                      />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-stone-900 group-hover:text-stone-950">
                      Tailor Verifications
                    </h3>
                    <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">
                      Review pending atelier registration applications and approve or reject verified badges.
                    </p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-stone-100 flex justify-end">
                    <span className="h-8 w-8 rounded-full bg-stone-50 group-hover:bg-[#8f2338] text-stone-400 group-hover:text-white flex items-center justify-center transition">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>

                {/* Module 2: User Accounts & Roles */}
                <div
                  onClick={() => handleTabChange("users")}
                  className="group relative flex flex-col justify-between rounded-3xl border border-stone-200/80 bg-white p-6 shadow-2xs hover:shadow-md hover:border-stone-300 transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-11 w-11 rounded-2xl flex items-center justify-center bg-[#f5f3ff] text-[#8b5cf6] shadow-2xs group-hover:scale-105 transition">
                        <Users size={22} />
                      </div>
                      <img
                        src="/assets/admin_home/card_users.png"
                        alt="User Accounts"
                        className="h-14 w-auto object-contain"
                      />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-stone-900 group-hover:text-stone-950">
                      User Accounts & Roles
                    </h3>
                    <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">
                      Manage customers, tailors, businesses, and admins.
                    </p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-stone-100 flex justify-end">
                    <span className="h-8 w-8 rounded-full bg-stone-50 group-hover:bg-purple-600 text-stone-400 group-hover:text-white flex items-center justify-center transition">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>

                {/* Module 3: Tailor Studios Directory */}
                <div
                  onClick={() => handleTabChange("tailors")}
                  className="group relative flex flex-col justify-between rounded-3xl border border-stone-200/80 bg-white p-6 shadow-2xs hover:shadow-md hover:border-stone-300 transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-11 w-11 rounded-2xl flex items-center justify-center bg-[#ecfdf5] text-[#10b981] shadow-2xs group-hover:scale-105 transition">
                        <Store size={22} />
                      </div>
                      <img
                        src="/assets/admin_home/card_studios.png"
                        alt="Studios"
                        className="h-14 w-auto object-contain"
                      />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-stone-900 group-hover:text-stone-950">
                      Tailor Studios Directory
                    </h3>
                    <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">
                      Explore and manage listed artisan workshops with map view.
                    </p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-stone-100 flex justify-end">
                    <span className="h-8 w-8 rounded-full bg-stone-50 group-hover:bg-emerald-600 text-stone-400 group-hover:text-white flex items-center justify-center transition">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>

                {/* Module 4: B2B Bulk Orders & RFQs */}
                <div
                  onClick={() => handleTabChange("bulk")}
                  className="group relative flex flex-col justify-between rounded-3xl border border-stone-200/80 bg-white p-6 shadow-2xs hover:shadow-md hover:border-stone-300 transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-11 w-11 rounded-2xl flex items-center justify-center bg-[#fffbeb] text-[#f59e0b] shadow-2xs group-hover:scale-105 transition">
                        <Layers size={22} />
                      </div>
                      <img
                        src="/assets/admin_home/card_bulk.png"
                        alt="Bulk RFQ"
                        className="h-14 w-auto object-contain"
                      />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-stone-900 group-hover:text-stone-950">
                      B2B Bulk Orders & RFQs
                    </h3>
                    <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">
                      Moderate bulk requests and enterprise quotation demands.
                    </p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-stone-100 flex justify-end">
                    <span className="h-8 w-8 rounded-full bg-stone-50 group-hover:bg-amber-600 text-stone-400 group-hover:text-white flex items-center justify-center transition">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>

                {/* Module 5: System Console */}
                <div
                  onClick={() => handleTabChange("verifications")}
                  className="group relative flex flex-col justify-between rounded-3xl border border-stone-200/80 bg-white p-6 shadow-2xs hover:shadow-md hover:border-stone-300 transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-11 w-11 rounded-2xl flex items-center justify-center bg-[#eff6ff] text-[#3b82f6] shadow-2xs group-hover:scale-105 transition">
                        <LayoutDashboard size={22} />
                      </div>
                      <img
                        src="/assets/admin_home/card_console.png"
                        alt="Console"
                        className="h-14 w-auto object-contain"
                      />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-stone-900 group-hover:text-stone-950">
                      System Console
                    </h3>
                    <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">
                      View logs, monitor system health and background jobs.
                    </p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-stone-100 flex justify-end">
                    <span className="h-8 w-8 rounded-full bg-stone-50 group-hover:bg-blue-600 text-stone-400 group-hover:text-white flex items-center justify-center transition">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>

                {/* Module 6: Admin Settings */}
                <div
                  onClick={() => handleTabChange("settings")}
                  className="group relative flex flex-col justify-between rounded-3xl border border-stone-200/80 bg-white p-6 shadow-2xs hover:shadow-md hover:border-stone-300 transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-11 w-11 rounded-2xl flex items-center justify-center bg-[#f1f5f9] text-[#475569] shadow-2xs group-hover:scale-105 transition">
                        <Settings size={22} />
                      </div>
                      <img
                        src="/assets/admin_home/card_settings.png"
                        alt="Admin Settings"
                        className="h-14 w-auto object-contain"
                      />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-stone-900 group-hover:text-stone-950">
                      Admin Settings
                    </h3>
                    <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">
                      Manage your profile, preferences and security settings.
                    </p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-stone-100 flex justify-end">
                    <span className="h-8 w-8 rounded-full bg-stone-50 group-hover:bg-stone-800 text-stone-400 group-hover:text-white flex items-center justify-center transition">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: TAILOR VERIFICATIONS
        ========================================================== */}
        {tab === "verifications" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-rose-50 text-[#8f2338] flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-stone-900">
                  Tailor Studio Verifications
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Review and manage atelier registration applications.
                </p>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVerificationFilter("pending")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    verificationFilter === "pending"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Pending ({stats.pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationFilter("verified")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    verificationFilter === "verified"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Verified ({stats.verifiedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationFilter("under_review")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    verificationFilter === "under_review"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Under Review (0)
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationFilter("all")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    verificationFilter === "all"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  All Studios ({stats.totalTailors})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3.5 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search studio, owner or location..."
                  className="w-full rounded-xl border border-stone-200/90 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-stone-400"
                />
              </div>
            </div>

            {/* Empty State matching image when pending is 0 */}
            {filteredTailors.length === 0 ? (
              <div className="rounded-3xl border border-stone-200/80 bg-white p-12 text-center shadow-2xs my-4 max-w-2xl mx-auto">
                <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center">
                  <div className="w-16 h-20 bg-blue-50 border border-blue-200 rounded-xl flex flex-col justify-center items-center gap-1.5 shadow-xs">
                    <div className="w-8 h-1 bg-blue-200 rounded-full" />
                    <div className="w-10 h-1 bg-blue-200 rounded-full" />
                    <div className="w-7 h-1 bg-blue-200 rounded-full" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-9 w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white">
                    <Check size={18} strokeWidth={3} />
                  </div>
                </div>

                <h3 className="text-base font-bold text-stone-900">
                  No unverified tailor profiles.
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  All active tailor studios are reviewed and verified.
                </p>

                <div className="mt-5">
                  <button
                    onClick={() => setVerificationFilter("all")}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    View All Listed Studios
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTailors.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-stone-900">{item.name}</h3>
                            {item.verified || item.verificationStatus === "verified" ? (
                              <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                                ✓ Verified
                              </span>
                            ) : (
                              <span className="rounded-full bg-rose-50 text-[#8f2338] border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold">
                                ⏳ Under Review
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {item.owner || "Artisan Master"} • {item.experience || 5}y experience
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[#8f2338]">
                          From ₹{item.minPrice || 499}
                        </span>
                      </div>

                      <div className="mt-3 bg-[#fdfbf9] p-3 rounded-2xl border border-stone-100 text-xs text-stone-600 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#8f2338]" />
                          {item.area ? `${item.area}, ` : ""}{item.city || "Jaipur"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone size={13} className="text-stone-400" />
                          {item.phone || "—"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTailor(item)}
                        title="Edit Studio Details"
                        className="h-8 w-8 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 flex items-center justify-center transition cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>

                      <div className="flex items-center gap-1.5">
                        {item.verified || item.verificationStatus === "verified" ? (
                          <button
                            type="button"
                            onClick={() => handleVerifyTailor(item._id, false)}
                            title="Revoke Verification"
                            className="h-8 w-8 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition cursor-pointer"
                          >
                            <X size={15} strokeWidth={2.4} />
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleVerifyTailor(item._id, false)}
                              title="Reject Verification"
                              className="h-8 w-8 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 flex items-center justify-center transition cursor-pointer"
                            >
                              <X size={15} strokeWidth={2.4} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVerifyTailor(item._id, true)}
                              title="Approve Studio"
                              className="h-8 w-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-2xs transition cursor-pointer"
                            >
                              <Check size={15} strokeWidth={2.6} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 3: USER ACCOUNTS & ROLES
        ========================================================== */}
        {tab === "users" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-purple-50 text-[#8b5cf6] flex items-center justify-center shrink-0">
                  <Users size={22} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-stone-900">
                    User Accounts & Roles
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Manage all registered users across customers, tailors, businesses, and administrators.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateUserModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#8f2338] hover:bg-[#761c30] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition self-start sm:self-auto cursor-pointer"
              >
                <Plus size={15} />
                <span>Create User</span>
              </button>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {["all", "customer", "tailor", "business", "admin"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                      userRoleFilter === r
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {r} ({r === "all" ? stats.totalUsers : stats.roles[r] ?? 0})
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3.5 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search user name or email..."
                  className="w-full rounded-xl border border-stone-200/90 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-stone-400"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-3xl border border-stone-200/80 bg-white p-5 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase text-[10px]">
                    <th className="pb-3 px-2">NAME</th>
                    <th className="pb-3 px-2">EMAIL</th>
                    <th className="pb-3 px-2">ROLE</th>
                    <th className="pb-3 px-2">STATUS</th>
                    <th className="pb-3 px-2 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === profile?.id;
                    const uName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User";
                    return (
                      <tr key={u.id} className="hover:bg-stone-50/50 transition">
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar user={u} size="md" />
                            <div>
                              <span className="font-bold text-stone-900 block leading-tight">
                                {uName}
                              </span>
                              {isSelf && (
                                <span className="inline-block mt-0.5 rounded-md bg-purple-100 text-purple-800 px-1.5 py-0.2 text-[9px] font-extrabold uppercase">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-2 font-mono text-stone-500 text-[11px]">
                          {u.email}
                        </td>

                        <td className="py-3.5 px-2">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeUserRole(u, e.target.value)}
                            className="rounded-lg border border-stone-200 bg-stone-50/80 px-2.5 py-1 text-xs font-semibold capitalize outline-none focus:border-stone-400 cursor-pointer"
                          >
                            {["customer", "tailor", "business", "admin"].map((r) => (
                              <option key={r} value={r}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3.5 px-2">
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 text-[10px] font-bold">
                            Active
                          </span>
                        </td>

                        <td className="py-3.5 px-2 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {u.disabled ? (
                              <button
                                type="button"
                                onClick={() => handleToggleUserDisabled(u)}
                                title="Enable User Account"
                                className="h-8 w-8 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition cursor-pointer"
                              >
                                <UserCheck size={14} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleUserDisabled(u)}
                                title="Disable User Account"
                                className="h-8 w-8 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 flex items-center justify-center transition cursor-pointer"
                              >
                                <UserX size={14} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveUser(u)}
                              title="Delete User"
                              className="h-8 w-8 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: TAILOR STUDIOS DIRECTORY
        ========================================================== */}
        {tab === "tailors" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-amber-50 text-[#f59e0b] flex items-center justify-center shrink-0">
                  <Store size={22} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-stone-900">
                    Tailor Studios Directory
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Explore all listed artisan workshops, verify details and update locations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateTailor}
                className="inline-flex items-center gap-2 rounded-xl bg-[#8f2338] hover:bg-[#761c30] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition self-start sm:self-auto cursor-pointer"
              >
                <Plus size={15} />
                <span>Add Studio</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <Search size={14} className="absolute left-3.5 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={tailorDirSearch}
                    onChange={(e) => setTailorDirSearch(e.target.value)}
                    placeholder="Search studio, owner or city..."
                    className="w-full rounded-xl border border-stone-200/90 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-stone-400"
                  />
                </div>

                <select
                  value={tailorDirCity}
                  onChange={(e) => setTailorDirCity(e.target.value)}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 outline-none"
                >
                  <option value="all">All Cities</option>
                  {uniqueCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={tailorDirStatus}
                  onChange={(e) => setTailorDirStatus(e.target.value)}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Under Review Only</option>
                </select>
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <div className="rounded-3xl border border-stone-200/80 bg-white overflow-hidden shadow-2xs">
              <div className="h-72 sm:h-80 w-full relative z-0">
                <MapContainer center={[26.9124, 75.7873]} zoom={12} className="h-full w-full">
                  <FitMarkers items={mapDisplayTailors} shouldFit={!mapFlyTarget} />
                  <MapFlyTo target={mapFlyTarget} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mapDisplayTailors.map((item) => {
                    const isVerified = item.verified || item.verificationStatus === "verified";
                    return (
                      <Marker
                        key={item._id}
                        position={[
                          item.location?.coordinates?.[1] || 26.9124,
                          item.location?.coordinates?.[0] || 75.7873,
                        ]}
                        icon={isVerified ? verifiedIcon : unverifiedIcon}
                      >
                        <Popup>
                          <div className="p-1 text-xs">
                            <span className="font-bold text-stone-900 block">{item.name}</span>
                            <span className="text-stone-500 block text-[11px]">{item.city}</span>
                            <button
                              onClick={() => handleOpenEditTailor(item)}
                              className="mt-2 text-[#8f2338] font-bold text-xs underline block"
                            >
                              Edit Details
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>

            {/* Studio Cards Below Map */}
            <div>
              <div className="text-xs text-stone-500 mb-3">
                Showing {filteredDirectoryTailors.length || 1} of {tailors.length || 1} studios
              </div>

              <div className="space-y-3">
                {(filteredDirectoryTailors.length > 0 ? filteredDirectoryTailors : [
                  {
                    _id: "royal-jaipur-sample",
                    name: "Royal Jaipur",
                    owner: "Ramesh Kumar",
                    experience: 5,
                    area: "C block",
                    city: "Jaipur",
                    country: "India",
                    verified: true,
                  }
                ]).map((studio) => (
                  <div
                    key={studio._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs hover:border-stone-300 transition"
                  >
                    <div className="flex items-center gap-4">
                      {/* Workshop Thumbnail */}
                      <img
                        src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=200&q=80"
                        alt={studio.name}
                        className="h-16 w-20 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-stone-900 text-sm">
                          {studio.name}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {studio.owner || "Master Artisan"} • {studio.experience || 5}y experience
                        </p>
                        <p className="text-xs text-stone-600 mt-1 flex items-center gap-1">
                          <MapPin size={12} className="text-[#8f2338]" />
                          <span>{studio.area ? `${studio.area}, ` : ""}{studio.city}, {studio.country || "India"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 text-xs font-bold">
                        Verified
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditTailor(studio)}
                        title="Edit Studio Details"
                        className="h-8 w-8 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 flex items-center justify-center transition cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 5: B2B BULK ORDERS & RFQS
        ========================================================== */}
        {tab === "bulk" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-amber-50 text-[#f59e0b] flex items-center justify-center shrink-0">
                  <Layers size={22} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-stone-900">
                    B2B Bulk Orders & RFQs
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Manage institutional stitching tenders and quotation requests.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddBulkModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#8f2338] hover:bg-[#761c30] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition self-start sm:self-auto cursor-pointer"
              >
                <Plus size={15} />
                <span>Add Request</span>
              </button>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBulkFilter("all")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    bulkFilter === "all"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  All ({displayBulkOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBulkFilter("open")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    bulkFilter === "open"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Open ({displayBulkOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBulkFilter("in_review")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    bulkFilter === "in_review"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  In Review (0)
                </button>
                <button
                  type="button"
                  onClick={() => setBulkFilter("approved")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    bulkFilter === "approved"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Approved (0)
                </button>
                <button
                  type="button"
                  onClick={() => setBulkFilter("rejected")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    bulkFilter === "rejected"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Rejected (0)
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3.5 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={bulkSearch}
                  onChange={(e) => setBulkSearch(e.target.value)}
                  placeholder="Search by title, company..."
                  className="w-full rounded-xl border border-stone-200/90 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-stone-400"
                />
              </div>
            </div>

            {/* Table matching image */}
            <div className="overflow-x-auto rounded-3xl border border-stone-200/80 bg-white p-5 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase text-[10px]">
                    <th className="pb-3 px-2">TITLE</th>
                    <th className="pb-3 px-2">COMPANY</th>
                    <th className="pb-3 px-2">UNIFORMS</th>
                    <th className="pb-3 px-2">CITY</th>
                    <th className="pb-3 px-2">STATUS</th>
                    <th className="pb-3 px-2 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {displayBulkOrders.map((order) => (
                    <tr key={order._id || order.id} className="hover:bg-stone-50/50 transition">
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-blue-50 text-blue-600">
                            <Layers size={13} />
                          </span>
                          <span className="font-bold text-stone-900">{order.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-stone-600 font-medium">{order.organisation}</td>
                      <td className="py-3.5 px-2 text-stone-700 font-mono">{order.quantity}</td>
                      <td className="py-3.5 px-2 text-stone-600">{order.city || "Jaipur"}</td>
                      <td className="py-3.5 px-2">
                        <span className="rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-0.5 text-[10px] font-bold">
                          Open
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Link
                            to="/bulk"
                            title="Open B2B Marketplace Hub"
                            className="h-8 w-8 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 flex items-center justify-center transition cursor-pointer"
                          >
                            <ExternalLink size={13} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              toast.info(`Inspecting "${order.title}" details.`);
                            }}
                            title="View RFQ Details"
                            className="h-8 w-8 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 flex items-center justify-center transition cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveRespondOrder(order)}
                            title="Respond to Tender"
                            className="h-8 w-8 rounded-xl bg-[#8f2338] hover:bg-[#761c30] text-white flex items-center justify-center shadow-2xs transition cursor-pointer"
                          >
                            <Send size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 6: PLATFORM ANNOUNCEMENTS BROADCASTER
        ========================================================== */}
        {tab === "announcements" && (
          <div className="space-y-6 animate-fadeIn">
            <AdminAnnouncementBroadcaster />
          </div>
        )}

        {/* =========================================================
            TAB 7: ADMIN SETTINGS & PROFILE
        ========================================================== */}
        {tab === "settings" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-amber-50 text-[#f59e0b] flex items-center justify-center shrink-0">
                <Sliders size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-stone-900">
                  Admin Settings & Profile
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Manage your account, preferences and security settings.
                </p>
              </div>
            </div>

            {/* Split Layout matching Bottom-Right card in composite image */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
              {/* Left Sub-nav */}
              <div className="space-y-1.5 md:col-span-1">
                {[
                  { id: "profile", label: "Profile", icon: User },
                  { id: "preferences", label: "Preferences", icon: Sliders },
                  { id: "security", label: "Security", icon: Lock },
                  { id: "notifications", label: "Notifications", icon: Bell },
                  { id: "api", label: "API & Integrations", icon: Globe },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSubActive = settingsActiveSubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSettingsActiveSubTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                        isSubActive
                          ? "bg-stone-100 text-stone-900 font-bold"
                          : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                      }`}
                    >
                      <Icon size={15} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Form Card / Dynamic Panel */}
              <div className="md:col-span-3">
                {settingsActiveSubTab === "notifications" ? (
                  <div className="space-y-6">
                    {/* Notification Settings & Channel Toggles Card */}
                    <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-100 gap-4">
                        <div className="flex items-center gap-3">
                          <span className="p-2 rounded-xl bg-rose-50 text-[#8f2338]">
                            <Bell size={20} />
                          </span>
                          <div>
                            <h2 className="font-bold text-sm text-stone-900">
                              Administrator Notifications & Alerts Center
                            </h2>
                            <p className="text-xs text-stone-400 mt-0.5">
                              Configure real-time administrative alert channels and audit stream triggers.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={handleMarkAllRead}
                              className="rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 text-xs font-bold text-[#8f2338] transition cursor-pointer"
                            >
                              Mark All Read ({unreadCount})
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleClearReadNotifications}
                            className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition cursor-pointer"
                          >
                            Clear Read
                          </button>
                        </div>
                      </div>

                      {/* Channels Toggles */}
                      <div className="mt-5 space-y-3.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                          Notification Alert Channels
                        </span>

                        {[
                          {
                            id: "studioVerifications",
                            title: "Studio Verification Applications",
                            desc: "Instant alert when tailor workshops and master artisans submit documents for verification approval.",
                            badge: "High Priority",
                          },
                          {
                            id: "bulkOrders",
                            title: "B2B Bulk Orders & RFQ Demands",
                            desc: "Real-time alerts for institutional uniform tenders, corporate RFQs, and school demands.",
                            badge: "Business",
                          },
                          {
                            id: "userRegistrations",
                            title: "User Account Registrations",
                            desc: "Notify when new customer, tailor, or corporate accounts join the platform.",
                            badge: "Growth",
                          },
                          {
                            id: "systemHealth",
                            title: "Platform Diagnostic & Health Heartbeats",
                            desc: "Diagnostic status checks for MongoDB connections, Leaflet geospatial pins, and APIs.",
                            badge: "System",
                          },
                          {
                            id: "emailNotifications",
                            title: "Email Dispatch Relay",
                            desc: "Forward unread critical alerts and pending verification reminders directly to admin email.",
                            badge: "Optional",
                          },
                        ].map((chan) => {
                          const isEnabled = alertSettings[chan.id] !== false;
                          return (
                            <div
                              key={chan.id}
                              className="flex items-start sm:items-center justify-between gap-4 p-3.5 rounded-2xl border border-stone-100 hover:border-stone-200 bg-[#fdfbf9] transition"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-stone-900">
                                    {chan.title}
                                  </span>
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500">
                                    {chan.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-stone-500">
                                  {chan.desc}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleToggleAlertSetting(chan.id)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  isEnabled ? "bg-[#8f2338]" : "bg-stone-200"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    isEnabled ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Administrator Notifications Stream Log */}
                    <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-2xs">
                      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-stone-900">
                            Notification Audit History
                          </h3>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                            {notifications.length}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400">
                          {unreadCount} unread
                        </span>
                      </div>

                      <div className="mt-4 divide-y divide-stone-100 max-h-[460px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-12 text-center">
                            <Bell size={32} className="mx-auto text-stone-300 mb-2" />
                            <p className="text-xs font-bold text-stone-700">No Notifications Available</p>
                            <p className="text-[11px] text-stone-400 mt-0.5">
                              Platform alert log is currently clear.
                            </p>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            const isUnread = !readNotifIds.includes(notif.id);
                            return (
                              <div
                                key={notif.id}
                                className={`py-4 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl transition hover:bg-stone-50 ${
                                  isUnread ? "bg-rose-50/20" : ""
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                      notif.type === "verification"
                                        ? "bg-[#fef2f2] text-[#ef4444]"
                                        : notif.type === "bulk"
                                        ? "bg-[#fffbeb] text-[#f59e0b]"
                                        : notif.type === "user"
                                        ? "bg-[#f5f3ff] text-[#8b5cf6]"
                                        : "bg-[#ecfdf5] text-[#10b981]"
                                    }`}
                                  >
                                    {notif.type === "verification" ? (
                                      <ShieldCheck size={16} />
                                    ) : notif.type === "bulk" ? (
                                      <Layers size={16} />
                                    ) : notif.type === "user" ? (
                                      <Users size={16} />
                                    ) : (
                                      <CheckCircle2 size={16} />
                                    )}
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-stone-900">
                                        {notif.title}
                                      </span>
                                      {isUnread && (
                                        <span className="h-2 w-2 rounded-full bg-[#8f2338]" />
                                      )}
                                      <span className="text-[10px] text-stone-400">
                                        • {notif.time || "Recently"}
                                      </span>
                                    </div>
                                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                      {notif.message}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleNotificationClick(notif)}
                                    className="rounded-xl bg-[#8f2338] hover:bg-[#761c30] text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer"
                                  >
                                    Review Now →
                                  </button>
                                  {isUnread && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleDismissNotification(notif.id, e)}
                                      className="rounded-xl border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-100 cursor-pointer"
                                      title="Mark read"
                                    >
                                      ✓
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                ) : settingsActiveSubTab === "security" ? (
                  <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
                      <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                        <Lock size={18} />
                      </span>
                      <div>
                        <h2 className="font-bold text-sm text-stone-900">
                          Security & Authorization Protocols
                        </h2>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Admin session controls and Clerk identity authentication.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="p-4 rounded-2xl bg-[#fdfbf9] border border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-900 block">Master Administrator Privilege</span>
                          <span className="text-stone-500 text-[11px]">Role: admin • Verified elevated rights</span>
                        </div>
                        <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                          Authorized
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#fdfbf9] border border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-900 block">Authentication Provider</span>
                          <span className="text-stone-500 text-[11px]">Secured via Clerk Enterprise OAuth & JWT</span>
                        </div>
                        <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold">
                          Clerk Active
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#fdfbf9] border border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-900 block">Two-Factor Authentication</span>
                          <span className="text-stone-500 text-[11px]">Enforced on all administrator sessions</span>
                        </div>
                        <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 text-[10px] font-bold">
                          Enforced
                        </span>
                      </div>
                    </div>
                  </div>
                ) : settingsActiveSubTab === "preferences" ? (
                  <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
                      <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                        <Sliders size={18} />
                      </span>
                      <div>
                        <h2 className="font-bold text-sm text-stone-900">
                          Platform & Interface Preferences
                        </h2>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Default currency, geospatial coordinates and localized formats.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-[#fdfbf9] border border-stone-100">
                        <span className="font-bold text-stone-900 block">Platform Currency</span>
                        <p className="text-stone-500 text-[11px] mt-1">Default payment standard across ateliers and orders</p>
                        <div className="mt-3 font-mono font-bold text-stone-800 bg-white px-3 py-1.5 rounded-xl border border-stone-200 inline-block">
                          INR (₹) - Indian Rupee
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#fdfbf9] border border-stone-100">
                        <span className="font-bold text-stone-900 block">Primary City Center</span>
                        <p className="text-stone-500 text-[11px] mt-1">Initial map focus for tailor studios</p>
                        <div className="mt-3 font-semibold text-stone-800 bg-white px-3 py-1.5 rounded-xl border border-stone-200 inline-block">
                          Jaipur, Rajasthan (26.9124, 75.7873)
                        </div>
                      </div>
                    </div>
                  </div>
                ) : settingsActiveSubTab === "api" ? (
                  <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
                      <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                        <Globe size={18} />
                      </span>
                      <div>
                        <h2 className="font-bold text-sm text-stone-900">
                          API & External Integrations
                        </h2>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Status of webhook relays, geospatial tiles and backend endpoints.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-2xl bg-[#fdfbf9] border border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-900 block">REST Backend API</span>
                          <span className="text-stone-500 font-mono text-[11px]">/api/admin/notifications & /api/admin/*</span>
                        </div>
                        <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                          Online
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#fdfbf9] border border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-900 block">OpenStreetMap & Leaflet Tile Service</span>
                          <span className="text-stone-500 text-[11px]">Interactive studio mapping and GPS pin rendering</span>
                        </div>
                        <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                          Active
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#fdfbf9] border border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-900 block">Clerk User Authentication Webhooks</span>
                          <span className="text-stone-500 text-[11px]">Automatic sync of users and roles with MongoDB</span>
                        </div>
                        <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                          Synced
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Default Profile Form */
                  <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-2xs">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
                      <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                        <Settings size={18} />
                      </span>
                      <h2 className="font-bold text-sm text-stone-900">
                        Administrator Account Information
                      </h2>
                    </div>

                    <form onSubmit={handleSaveAdminProfile} className="mt-5 space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">First Name</label>
                          <input
                            type="text"
                            value={adminProfileForm.firstName}
                            onChange={(e) => setAdminProfileForm({ ...adminProfileForm, firstName: e.target.value })}
                            className="w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-stone-400 bg-stone-50/50"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={adminProfileForm.lastName}
                            onChange={(e) => setAdminProfileForm({ ...adminProfileForm, lastName: e.target.value })}
                            className="w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-stone-400 bg-stone-50/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={adminProfileForm.phone}
                          onChange={(e) => setAdminProfileForm({ ...adminProfileForm, phone: e.target.value })}
                          className="w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-stone-400 bg-stone-50/50"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Administrative Bio / Role Notes</label>
                        <textarea
                          rows={3}
                          value={adminProfileForm.bio}
                          onChange={(e) => setAdminProfileForm({ ...adminProfileForm, bio: e.target.value })}
                          className="w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-stone-400 bg-stone-50/50"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Preferred Language</label>
                        <select
                          value={adminProfileForm.preferredLanguage}
                          onChange={(e) => setAdminProfileForm({ ...adminProfileForm, preferredLanguage: e.target.value })}
                          className="w-full rounded-xl border border-stone-200 p-2.5 outline-none focus:border-stone-400 bg-stone-50/50"
                        >
                          <option value="en">English (Default)</option>
                          <option value="hi">हिंदी (Hindi)</option>
                        </select>
                      </div>

                      <div className="pt-3 flex justify-end">
                        <button
                          type="submit"
                          disabled={profileSaving}
                          className="rounded-xl bg-[#8f2338] hover:bg-[#761c30] text-white font-semibold px-6 py-2.5 text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
                        >
                          {profileSaving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================
          MODAL: CREATE USER
      ========================================================== */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">Create Synced User</h3>
              <button onClick={() => setIsCreateUserModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddTestUser} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                >
                  <option value="customer">Customer</option>
                  <option value="tailor">Tailor</option>
                  <option value="business">Business</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#8f2338] text-white px-5 py-2 font-bold hover:bg-[#761c30]"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: ADD / EDIT TAILOR STUDIO
      ========================================================== */}
      {isStudioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">
                {editingTailorId ? "Edit Studio Details" : "Add Tailor Studio"}
              </h3>
              <button onClick={() => setIsStudioModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveTailor} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Studio Name *</label>
                  <input
                    required
                    value={newTailor.name}
                    onChange={(e) => setNewTailor({ ...newTailor, name: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Master Artisan Name</label>
                  <input
                    value={newTailor.owner}
                    onChange={(e) => setNewTailor({ ...newTailor, owner: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">City *</label>
                  <input
                    required
                    value={newTailor.city}
                    onChange={(e) => setNewTailor({ ...newTailor, city: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Area / Locality</label>
                  <input
                    value={newTailor.area}
                    onChange={(e) => setNewTailor({ ...newTailor, area: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={newTailor.experience}
                    onChange={(e) => setNewTailor({ ...newTailor, experience: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Min Price (₹)</label>
                  <input
                    type="number"
                    value={newTailor.minPrice}
                    onChange={(e) => setNewTailor({ ...newTailor, minPrice: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Phone</label>
                <input
                  value={newTailor.phone}
                  onChange={(e) => setNewTailor({ ...newTailor, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStudioModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#8f2338] text-white px-5 py-2 font-bold hover:bg-[#761c30]"
                >
                  Save Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: ADD BULK RFQ
      ========================================================== */}
      {isAddBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">Create B2B RFQ Posting</h3>
              <button onClick={() => setIsAddBulkModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateBulkOrder} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Requirement Title *</label>
                <input
                  required
                  value={newBulkOrder.title}
                  onChange={(e) => setNewBulkOrder({ ...newBulkOrder, title: e.target.value })}
                  placeholder="e.g. Corporate Uniforms"
                  className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Company / Institution</label>
                  <input
                    required
                    value={newBulkOrder.organisation}
                    onChange={(e) => setNewBulkOrder({ ...newBulkOrder, organisation: e.target.value })}
                    placeholder="e.g. ABC Pvt Ltd"
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Units (Quantity)</label>
                  <input
                    type="number"
                    value={newBulkOrder.quantity}
                    onChange={(e) => setNewBulkOrder({ ...newBulkOrder, quantity: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">City</label>
                <input
                  value={newBulkOrder.city}
                  onChange={(e) => setNewBulkOrder({ ...newBulkOrder, city: e.target.value })}
                  placeholder="e.g. Jaipur"
                  className="w-full rounded-xl border border-stone-200 p-2.5 outline-none"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBulkModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#8f2338] text-white px-5 py-2 font-bold hover:bg-[#761c30]"
                >
                  Post RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: RESPOND TO RFQ
      ========================================================== */}
      {activeRespondOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">
                Respond to "{activeRespondOrder.title}"
              </h3>
              <button onClick={() => setActiveRespondOrder(null)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <p className="text-stone-600">
                You are responding on behalf of Mera Tailor administration to <strong>{activeRespondOrder.organisation}</strong> for {activeRespondOrder.quantity} units in {activeRespondOrder.city || "Jaipur"}.
              </p>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Quotation / Response Message</label>
                <textarea
                  rows={4}
                  placeholder="Enter administrator quotation details or atelier assignment dispatch instructions..."
                  className="w-full rounded-xl border border-stone-200 p-2.5 outline-none bg-stone-50/50"
                  defaultValue="Our registered ateliers have reviewed your uniform requirement and can deliver high-grade stitching within 30 days."
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveRespondOrder(null)}
                  className="rounded-xl border border-stone-200 px-4 py-2 font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Response sent to institution!");
                    setActiveRespondOrder(null);
                  }}
                  className="rounded-xl bg-[#8f2338] text-white px-5 py-2 font-bold hover:bg-[#761c30]"
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
