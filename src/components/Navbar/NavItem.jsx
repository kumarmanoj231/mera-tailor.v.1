import React from "react";
import { NavLink } from "react-router-dom";

const NavItem = ({ to, label, icon }) => {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `
          flex items-center gap-1.5
          rounded-full px-3.5 py-2
          text-xs sm:text-sm font-semibold
          transition-all duration-200
          ${
            isActive
              ? "bg-[#8f2338]/10 text-[#8f2338]"
              : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
          }
        `
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default NavItem;