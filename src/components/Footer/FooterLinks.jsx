import React from "react";
import { useTranslation } from "react-i18next";

import FooterLink from "./FooterLink";

const FooterLinks = () => {
  const { t } = useTranslation();

  return (
    <div
      className="
        min-w-0
        text-center
        sm:text-left
      "
    >
      <h3
        className="
          text-sm
          font-semibold
          text-gray-950
        "
      >
        {t("footer.quickLinks")}
      </h3>

      <div className="mt-4 space-y-2">
        {/* HOME */}

        <FooterLink
          to="/"
          label={t("navbar.home")}
        />

        {/* FIND TAILORS */}

        <FooterLink
          to="/find-tailors"
          label={t("navbar.findTailors")}
        />

        

        {/* HOW IT WORKS */}

        <FooterLink
          to="/how-it-works"
          label={t("navbar.howItWorks")}
        />
      </div>
    </div>
  );
};

export default FooterLinks;