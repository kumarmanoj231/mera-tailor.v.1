import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const FooterBottom = () => {
  const { t } = useTranslation();

  return (
    <div
      className="
        mt-10
        border-t
        border-gray-100
        pt-6

        sm:mt-12
        sm:pt-7
      "
    >
      <div
        className="
          flex
          flex-col
          items-center
          gap-4
          text-center

          sm:flex-row
          sm:justify-between
          sm:text-left
        "
      >
        {/* COPYRIGHT */}

        <div
          className="
            text-xs
            leading-5
            text-gray-400
            sm:text-sm
          "
        >
          © {new Date().getFullYear()} मेरा&nbsp;Tailor.{" "}
          {t("footer.rights")}
        </div>

        {/* MADE WITH */}

        <div
          className="
            text-xs
            leading-5
            text-gray-400
            sm:text-sm
          "
        >
          {t("footer.madeWith")}
        </div>

        {/* LEGAL */}

        <div
          className="
            flex
            items-center
            justify-center
            gap-5
          "
        >
          <Link
            to="/privacy"
            className="
              text-xs
              text-gray-400
              transition-colors
              duration-200
              hover:text-gray-950
              sm:text-sm
            "
          >
            {t("footer.privacy")}
          </Link>

          <Link
            to="/terms"
            className="
              text-xs
              text-gray-400
              transition-colors
              duration-200
              hover:text-gray-950
              sm:text-sm
            "
          >
            {t("footer.terms")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FooterBottom;