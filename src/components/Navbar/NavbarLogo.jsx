import React from "react";
import { Link } from "react-router-dom";

const NavbarLogo = ({ mobile = false, onClick }) => {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="group flex shrink-0 items-center gap-2.5 transition active:scale-95"
    >
      <div
        className={`
          flex shrink-0 items-center justify-center
          overflow-hidden rounded-xl bg-[#fff7fb] border border-rose-100/60
          transition-transform duration-200 shadow-xs
          group-hover:scale-105
          ${mobile ? "h-9 w-9" : "h-10 w-10"}
        `}
      >
        <img
          src="/logo.png"
          alt="MeraTailor"
          className={mobile ? "h-8 w-8 object-contain" : "h-9 w-9 object-contain"}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      <div className="leading-none">
        <div
          className={`
            font-black tracking-tight text-stone-950
            ${mobile ? "text-[16px]" : "text-[18px]"}
          `}
        >
          मेरा&nbsp;
          <span className="text-[#8f2338]">Tailor</span>
        </div>

        <p
          className="
            mt-0.5 hidden text-[8px]
            font-bold tracking-[0.16em]
            text-stone-400 uppercase sm:block
          "
        >
          Bespoke Tailoring Platform
        </p>
      </div>
    </Link>
  );
};

export default NavbarLogo;