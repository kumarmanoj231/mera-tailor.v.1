import React from "react";
import {
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

import { useTranslation } from "react-i18next";

const FooterContact = () => {
  const { t } = useTranslation();

  return (
    <div
      className="
        min-w-0
        text-center

        sm:col-span-2

        lg:col-span-1
        lg:text-left
      "
    >
      {/* HEADING */}

      <h3
        className="
          text-sm
          font-semibold
          text-gray-950
        "
      >
        {t("footer.getInTouch")}
      </h3>

      {/* SUPPORT TEXT */}

      <p
        className="
          mx-auto
          mt-4
          max-w-sm
          text-sm
          leading-6
          text-gray-500

          lg:mx-0
        "
      >
        {t("footer.support")}
      </p>

      {/* CONTACT DETAILS */}

      <div
        className="
          mx-auto
          mt-5
          flex
          max-w-sm
          flex-col
          items-center
          gap-4

          lg:mx-0
          lg:items-start
        "
      >
        {/* EMAIL */}

        <a
          href="mailto:support@meratailor.com"
          className="
            flex
            items-center
            justify-center
            gap-3
            text-sm
            text-gray-500
            transition-colors
            duration-200
            hover:text-gray-950

            lg:justify-start
          "
        >
          <Mail
            size={17}
            strokeWidth={1.7}
            className="
              shrink-0
              text-gray-400
            "
          />

          <span>
            support@meratailor.com
          </span>
        </a>

        {/* PHONE */}

        <a
          href="tel:+919829000000"
          className="
            flex
            items-center
            justify-center
            gap-3
            text-sm
            text-gray-500
            transition-colors
            duration-200
            hover:text-gray-950

            lg:justify-start
          "
        >
          <Phone
            size={17}
            strokeWidth={1.7}
            className="
              shrink-0
              text-gray-400
            "
          />

          <span>
            +91 98290 00000
          </span>
        </a>

        {/* LOCATION */}

        <div
          className="
            flex
            items-center
            justify-center
            gap-3
            text-center

            lg:items-start
            lg:justify-start
            lg:text-left
          "
        >
          <MapPin
            size={17}
            strokeWidth={1.7}
            className="
              shrink-0
              text-gray-400

              lg:mt-0.5
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
    </div>
  );
};

export default FooterContact;