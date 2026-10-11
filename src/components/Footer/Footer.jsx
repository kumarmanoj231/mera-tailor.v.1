import React from "react";

import FooterBrand from "./FooterBrand";
import FooterLinks from "./FooterLinks";
import FooterForYou from "./FooterForYou";
import FooterContact from "./FooterContact";
import FooterBottom from "./FooterBottom";

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-100 bg-white">
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-5
          py-12
          sm:px-6
          sm:py-14
          lg:px-8
        "
      >
        <div
          className="
            grid
            grid-cols-1
            gap-10
            sm:grid-cols-2
            sm:gap-x-10
            sm:gap-y-12
            lg:grid-cols-4
            lg:gap-12
          "
        >
          <FooterBrand />

          <FooterLinks />

          <FooterForYou />

          <FooterContact />
        </div>

        <FooterBottom />
      </div>
    </footer>
  );
};

export default Footer;