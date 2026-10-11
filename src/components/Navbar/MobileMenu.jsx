import React from "react";
import {
  Heart,
  LogIn,
  MapPin,
  ShoppingBag,
  UserPlus,
  LayoutDashboard,
  Shield,
  Sparkles,
  Layers,
  Scissors
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import MobileNavItem from "./MobileNavItem";
import LanguageToggle from "./LanguageToggle";
import RoleAvatarWithBadge, { getRoleMeta } from "./RoleAvatarWithBadge";

const MobileMenu = ({
  open,
  isHomePage,
  language,
  onChangeLanguage,
  onSignUp,
  onClose,
  userRole,
}) => {
  const { t } = useTranslation();
  const { isSignedIn, user, profile } = useAuth();
  const roleMeta = getRoleMeta(userRole, t);
  const RoleIcon = roleMeta.icon;

  return (
    <div
      className={`
        overflow-hidden border-t border-stone-200/80 bg-white transition-all duration-300 md:hidden
        ${open ? "max-h-[900px] opacity-100 shadow-xl" : "max-h-0 opacity-0"}
      `}
    >
      <div className="px-5 py-5 space-y-4">
        {/* =================================================
            PRIMARY NAVIGATION LINKS
        ================================================== */}
        <div className="space-y-1">
          {!isHomePage && (
            <MobileNavItem
              to="/"
              label={t("navbar.home", "Home")}
              onClick={onClose}
            />
          )}

          {/* HIDE FIND TAILORS FOR TAILOR; SHOW FOR OTHERS */}
          {userRole !== "tailor" && (
            <MobileNavItem
              to="/find-tailors"
              label={t("navbar.findTailors", "Find Tailors")}
              icon={<MapPin size={18} className="text-[#8f2338]" />}
              onClick={onClose}
            />
          )}

          {/* TAILOR SPECIFIC MOBILE NAV */}
          {userRole === "tailor" && (
            <>
              <MobileNavItem
                to="/orders"
                label={t("navbar.tailorOrders", "Client Orders")}
                icon={<Scissors size={18} className="text-[#8f2338]" />}
                onClick={onClose}
              />
              <MobileNavItem
                to="/bulk"
                label={t("navbar.bulkOpportunities", "B2B Bulk Jobs")}
                icon={<Layers size={18} className="text-[#8f2338]" />}
                onClick={onClose}
              />
            </>
          )}

          {(userRole === "business" || userRole === "admin") && (
            <MobileNavItem
              to="/bulk"
              label={t("navbar.bulk", "Bulk Orders")}
              icon={<Layers size={18} />}
              onClick={onClose}
            />
          )}

          <MobileNavItem
            to="/how-it-works"
            label={t("navbar.howItWorks", "How It Works")}
            icon={<Sparkles size={18} className="text-amber-500" />}
            onClick={onClose}
          />
        </div>

        {/* =================================================
            AUTHENTICATED USER SHORTCUTS
        ================================================== */}
        {isSignedIn ? (
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <RoleAvatarWithBadge
                role={userRole}
                size="lg"
                showPill={false}
                afterSignOutUrl="/"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="truncate text-sm font-bold text-stone-900">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "My Account"}
                  </p>
                </div>
                <p className="truncate text-xs text-stone-500 mt-0.5">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

            {/* CUSTOMER ONLY SHORTCUTS */}
            {userRole === "customer" && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200/60">
                <Link
                  to="/my-tailors"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white py-2 text-xs font-bold text-stone-700 shadow-xs hover:bg-stone-50"
                >
                  <Heart size={14} className="text-rose-600" />
                  <span>{t("navbar.myTailors", "Saved")}</span>
                </Link>

                <Link
                  to="/orders"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white py-2 text-xs font-bold text-stone-700 shadow-xs hover:bg-stone-50"
                >
                  <ShoppingBag size={14} />
                  <span>{t("navbar.orders", "Orders")}</span>
                </Link>
              </div>
            )}

            {/* SINGLE UNIFIED DASHBOARD / ADMIN PORTAL LINK */}
            <Link
              to={userRole === "admin" ? "/admin" : "/dashboard"}
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8f2338] hover:bg-[#781c2e] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition"
            >
              <LayoutDashboard size={15} />
              <span>
                {userRole === "admin"
                  ? t("navbar.adminPortal", "Admin Portal")
                  : t("navbar.dashboard", "Dashboard")}
              </span>
            </Link>
          </div>
        ) : (
          /* =================================================
              GUEST AUTHENTICATION ACTION BAR (GET STARTED)
          ================================================== */
          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onSignUp}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#8f2338] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] active:scale-95"
            >
              <UserPlus size={15} />
              <span>{t("navbar.getStarted", "Get Started")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
