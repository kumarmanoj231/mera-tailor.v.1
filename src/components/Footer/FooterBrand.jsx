import React from "react";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const FooterBrand = () => {
  const { t } = useTranslation();

  return (
    <div
      className="
        min-w-0
        text-center

        sm:col-span-2
        sm:text-left

        lg:col-span-1
      "
    >
      {/* BRAND */}

      <Link
        to="/"
        className="
          group
          inline-flex
          items-center
          justify-center
          gap-3

          sm:justify-start
        "
      >
        {/* LOGO */}

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-xl
            bg-[#fff7fb]
            transition-transform
            duration-200
            group-hover:scale-105
          "
        >
          <img
            src="/logo.png"
            alt="MeraTailor"
            className="
              h-10
              w-10
              object-contain
            "
          />
        </div>

        {/* NAME */}

        <div className="leading-none">
          <div
            className="
              text-xl
              font-bold
              tracking-tight
              text-gray-950
            "
          >
            मेरा&nbsp;
            <span className="text-gray-500">
              Tailor
            </span>
          </div>

          <p
            className="
              mt-1
              text-[8px]
              font-medium
              tracking-[0.16em]
              text-gray-400
            "
          >
            APNA TAILOR, AB AASANI SE
          </p>
        </div>
      </Link>

      {/* DESCRIPTION */}

      <p
        className="
          mx-auto
          mt-5
          max-w-sm
          text-sm
          leading-6
          text-gray-500

          sm:mx-0
        "
      >
        {t("footer.description")}
      </p>

      {/* LOCATION */}

      <div
        className="
          mt-5
          flex
          items-center
          justify-center
          gap-3

          sm:items-start
          sm:justify-start
        "
      >
        <MapPin
          size={17}
          strokeWidth={1.7}
          className="
            shrink-0
            text-gray-400

            sm:mt-0.5
          "
        />

        <span
          className="
            min-w-0
            text-sm
            leading-5
            text-gray-500
          "
        >
          {t("footer.location")}
        </span>
      </div>
    </div>
  );
};

export default FooterBrand;