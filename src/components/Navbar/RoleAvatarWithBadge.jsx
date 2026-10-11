import React from "react";
import { UserButton } from "@clerk/react";
import { ShieldCheck, Scissors, Building2, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

/**
 * Role Metadata matching the reference design in media_1791350084896.png:
 * 1. Customer: Blue ring, Blue round badge with User icon
 * 2. Tailor: Purple ring, Purple round badge with Scissors icon
 * 3. Business: Orange ring, Orange round badge with Building icon
 * 4. Admin: Green ring, Green round badge with ShieldCheck icon
 */
export const getRoleMeta = (role, t) => {
  const normRole = (role || "customer").toLowerCase();
  switch (normRole) {
    case "admin":
      return {
        label: t ? t("navbar.admin", "Admin") : "Admin",
        sublabel: "Master Administrator",
        icon: ShieldCheck,
        // Green ring & green badge as in image 4
        ringClass: "ring-2 ring-[#16a34a] ring-offset-2 ring-offset-white",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        cornerBg: "bg-[#16a34a] text-white",
        dotColor: "bg-[#16a34a]",
        defaultAvatar: "/assets/roles/admin.png",
      };
    case "tailor":
      return {
        label: t ? t("navbar.tailor", "Tailor") : "Tailor",
        sublabel: "Master Atelier",
        icon: Scissors,
        // Purple ring & purple badge as in image 2
        ringClass: "ring-2 ring-[#9333ea] ring-offset-2 ring-offset-white",
        badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
        cornerBg: "bg-[#9333ea] text-white",
        dotColor: "bg-[#9333ea]",
        defaultAvatar: "/assets/roles/tailor.png",
      };
    case "business":
      return {
        label: t ? t("navbar.business", "Business") : "Business",
        sublabel: "B2B Procurement",
        icon: Building2,
        // Orange ring & orange badge as in image 3
        ringClass: "ring-2 ring-[#ea580c] ring-offset-2 ring-offset-white",
        badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
        cornerBg: "bg-[#ea580c] text-white",
        dotColor: "bg-[#ea580c]",
        defaultAvatar: "/assets/roles/business.png",
      };
    case "customer":
    default:
      return {
        label: t ? t("navbar.customer", "Customer") : "Customer",
        sublabel: "Bespoke Shopper",
        icon: UserRound,
        // Blue ring & blue badge as in image 1
        ringClass: "ring-2 ring-[#2563eb] ring-offset-2 ring-offset-white",
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
        cornerBg: "bg-[#2563eb] text-white",
        dotColor: "bg-[#2563eb]",
        defaultAvatar: "/assets/roles/customer.png",
      };
  }
};

/**
 * Avatar with role-based colored circular ring and pinned corner role icon
 * (No text badges in the navbar)
 */
export default function RoleAvatarWithBadge({
  role = "customer",
  size = "md", // "sm" | "md" | "lg"
  showPill = false,
  afterSignOutUrl = "/",
}) {
  const { t } = useTranslation();
  const { isSignedIn, user, profile } = useAuth();
  const meta = getRoleMeta(role, t);
  const IconComponent = meta.icon;

  const sizeClasses = {
    sm: {
      avatarBox: "h-8 w-8",
      cornerBadge: "h-4 w-4 -bottom-0.5 -right-0.5 ring-[1.5px]",
      iconSize: 9,
    },
    md: {
      avatarBox: "h-9 w-9",
      cornerBadge: "h-4.5 w-4.5 -bottom-0.5 -right-0.5 ring-2",
      iconSize: 10,
    },
    lg: {
      avatarBox: "h-12 w-12",
      cornerBadge: "h-5 w-5 -bottom-0.5 -right-0.5 ring-2",
      iconSize: 12,
    },
  }[size] || {
    avatarBox: "h-9 w-9",
    cornerBadge: "h-4.5 w-4.5 -bottom-0.5 -right-0.5 ring-2",
    iconSize: 10,
  };

  const avatarSrc = user?.imageUrl || profile?.avatar || meta.defaultAvatar;

  return (
    <div className="flex items-center gap-2">
      {/* Role Pill - hidden in navbar */}
      {showPill && (
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-xs ${meta.badgeBg}`}
          title={`Active Role: ${meta.label}`}
        >
          <IconComponent size={11} strokeWidth={2.5} />
          <span>{meta.label}</span>
        </span>
      )}

      <div className="relative inline-flex items-center shrink-0">
        {/* Circular Ring Wrapper matching reference image */}
        <div className={`rounded-full p-[2px] transition ${meta.ringClass}`}>
          {isSignedIn ? (
            <UserButton
              afterSignOutUrl={afterSignOutUrl}
              appearance={{
                elements: {
                  rootBox: "rounded-full",
                  userButtonTrigger: "rounded-full focus:outline-none focus:ring-0",
                  avatarBox: `${sizeClasses.avatarBox} rounded-full overflow-hidden shadow-xs`,
                  userButtonAvatarBox: `${sizeClasses.avatarBox} rounded-full overflow-hidden`,
                  userButtonAvatarImage: "rounded-full object-cover",
                },
              }}
            />
          ) : (
            <img
              src={avatarSrc}
              alt={meta.label}
              className={`${sizeClasses.avatarBox} rounded-full object-cover shadow-xs`}
            />
          )}
        </div>

        {/* Pinned Corner Role Badge */}
        <div
          className={`absolute ${sizeClasses.cornerBadge} flex items-center justify-center rounded-full ring-white shadow-md pointer-events-none ${meta.cornerBg}`}
          title={`Role: ${meta.label}`}
          aria-label={`Role: ${meta.label}`}
        >
          <IconComponent size={sizeClasses.iconSize} strokeWidth={2.6} />
        </div>
      </div>
    </div>
  );
}
