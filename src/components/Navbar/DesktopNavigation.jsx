import React from "react";
import { MapPin, Sparkles, Layers, Scissors, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import NavItem from "./NavItem";

const DesktopNavigation = ({ isHomePage, userRole }) => {
  const { t } = useTranslation();

  return (
    <div className="hidden items-center gap-1 md:flex">
      {/* HOME (when not on home) */}
      {!isHomePage && (
        <NavItem
          to="/"
          label={t("navbar.home", "Home")}
        />
      )}

      {/* TAILOR-SPECIFIC NAVIGATION */}
      {userRole === "tailor" ? (
        <>
          <NavItem
            to="/orders"
            icon={<Scissors size={15} className="text-[#8f2338]" />}
            label={t("navbar.tailorOrders", "Client Orders")}
          />

          <NavItem
            to="/bulk"
            icon={<Layers size={15} className="text-[#8f2338]" />}
            label={t("navbar.bulkOpportunities", "B2B Bulk Jobs")}
          />
        </>
      ) : (
        /* CUSTOMER / BUSINESS / GUEST NAVIGATION */
        <>
          <NavItem
            to="/find-tailors"
            icon={<MapPin size={15} strokeWidth={1.8} />}
            label={t("navbar.findTailors", "Find Tailors")}
          />

          {(userRole === "business" || userRole === "admin") && (
            <NavItem
              to="/bulk"
              icon={<Layers size={15} />}
              label={t("navbar.bulk", "Bulk Orders")}
            />
          )}
        </>
      )}

      {/* HOW IT WORKS */}
      <NavItem
        to="/how-it-works"
        icon={<Sparkles size={15} className="text-amber-500" />}
        label={t("navbar.howItWorks", "How It Works")}
      />
    </div>
  );
};

export default DesktopNavigation;
