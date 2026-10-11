import React from "react";
import { Link } from "react-router-dom";

const FooterLink = ({ to, label }) => {
  return (
    <Link
      to={to}
      className="
        block
        text-center
        text-sm
        leading-6
        text-gray-500
        transition-colors
        duration-200
        hover:text-gray-950

        sm:text-left
      "
    >
      {label}
    </Link>
  );
};

export default FooterLink;