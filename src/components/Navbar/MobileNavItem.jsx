import React from "react";
import { NavLink } from "react-router-dom";

const MobileNavItem = ({
  to,
  label,
  icon,
  iconClassName = "",
  onClick,
}) => {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      onClick={onClick}
      className={({ isActive }) =>
        `
          flex items-center justify-center
          gap-3 rounded-xl px-4 py-3.5
          text-center text-sm font-medium
          transition-all duration-200

          ${
            isActive
              ? "bg-gray-950 text-white"
              : "text-gray-700 hover:bg-gray-50"
          }
        `
      }
    >
      {icon && (
        <span className={iconClassName}>
          {icon}
        </span>
      )}

      {label}
    </NavLink>
  );
};

export default MobileNavItem;