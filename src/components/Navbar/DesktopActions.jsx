import React from "react";
import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import LanguageToggle from "./LanguageToggle";
import NavIconButton from "./NavIconButton";
import RoleAvatarWithBadge from "./RoleAvatarWithBadge";
import NotificationBell from "../notifications/NotificationBell";

const DesktopActions = ({
  language,
  onChangeLanguage,
  onSignUp,
  userRole,
}) => {
  const { t } = useTranslation();
  const { isSignedIn } = useAuth();

  const isRoleAdmin = userRole === "admin";
  const dashboardRoute = isRoleAdmin ? "/admin" : "/dashboard";
  const dashboardLabel = isRoleAdmin
    ? t("navbar.adminPortal", "Admin Portal")
    : t("navbar.dashboard", "Dashboard");

  return (
    <div className="hidden items-center gap-2 md:flex">
      {/* =====================================================
          LANGUAGE SELECTOR
      ====================================================== */}
      <LanguageToggle
        language={language}
        onChange={onChangeLanguage}
      />

      {/* =====================================================
          CUSTOMER SHORTCUTS: WISHLIST & ORDERS
      ====================================================== */}
      {isSignedIn && userRole === "customer" && (
        <div className="flex items-center gap-1 border-l border-stone-200/80 pl-2">
          <NavIconButton
            to="/my-tailors"
            label={t("navbar.myTailors", "Saved Tailors")}
            type="heart"
          />

          <NavIconButton
            to="/orders"
            label={t("navbar.orders", "My Orders")}
            type="orders"
          />
        </div>
      )}

      {/* =====================================================
          NOTIFICATION BELL (ALL ROLES & VISITORS)
      ====================================================== */}
      <div className="flex items-center border-l border-stone-200/80 pl-2">
        <NotificationBell />
      </div>

      {/* =====================================================
          AUTHENTICATED USER: DASHBOARD & AVATAR
      ====================================================== */}
      {isSignedIn ? (
        <div className="flex items-center gap-2 border-l border-stone-200/80 pl-2">
          {/* Single clean dashboard nav icon, dynamically linked to /admin for admin */}
          <NavIconButton
            to={dashboardRoute}
            label={dashboardLabel}
            type="dashboard"
          />

          {/* User profile badge matching reference image (no text badge) */}
          <div className="pl-0.5">
            <RoleAvatarWithBadge
              role={userRole}
              size="md"
              showPill={false}
              afterSignOutUrl="/"
            />
          </div>
        </div>
      ) : (
        /* ===================================================
           GUEST ACTIONS (GET STARTED)
        ==================================================== */
        <div className="flex items-center gap-2 border-l border-stone-200/80 pl-2">
          <button
            type="button"
            onClick={onSignUp}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#781c2e] active:scale-95 cursor-pointer"
          >
            <UserPlus size={14} />
            <span>{t("navbar.getStarted", "Get Started")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DesktopActions;
