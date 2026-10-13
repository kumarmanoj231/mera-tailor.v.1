import React from "react";
import { Heart, ShoppingBag, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";

const NavIconButton = ({ to, label, type, icon, mobile = false, showLabel = false }) => {
  return (
    <NavLink
      to={to}
      aria-label={label}
      title={label}
      className={({ isActive }) =>
        `
          group relative flex items-center justify-center
          rounded-xl transition-all duration-200
          ${mobile ? "h-9 w-9" : showLabel ? "h-10 w-10 xl:h-auto xl:w-auto xl:gap-2 xl:px-3 xl:py-2" : "h-10 w-10"}
          ${
            isActive
              ? "bg-[#8f2338]/10 text-[#8f2338]"
              : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
          }
        `
      }
    >
      {icon ? (
        icon
      ) : type === "heart" ? (
        <Heart
          size={mobile ? 18 : 20}
          strokeWidth={1.8}
          className="transition group-hover:scale-110 group-hover:text-rose-600"
        />
      ) : type === "dashboard" ? (
        <LayoutDashboard
          size={mobile ? 18 : 20}
          strokeWidth={1.8}
          className="transition group-hover:scale-110 group-hover:text-[#8f2338]"
        />
      ) : (
        <ShoppingBag
          size={mobile ? 18 : 20}
          strokeWidth={1.8}
          className="transition group-hover:scale-110 group-hover:text-stone-950"
        />
      )}
      {showLabel && <span className="hidden text-xs font-semibold xl:inline">{label}</span>}
    </NavLink>
  );
};

export default NavIconButton;
