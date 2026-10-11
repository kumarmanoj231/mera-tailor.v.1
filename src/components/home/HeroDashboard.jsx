import React from "react";

import {
  Heart,
  Scissors,
  CheckCircle2,
  Star,
  ChevronRight,
  Clock3,
  Bookmark,
  Ruler,
  PackageCheck,
  MessageCircle,
  Phone,
} from "lucide-react";

import { useTranslation } from "react-i18next";
import HeroAction from "./HeroAction";

const HeroDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full select-none">
      <div
        className="
          rounded-[24px]
          border
          border-white/90
          bg-[#fffdf9]/98
          p-3.5
          shadow-[0_24px_60px_rgba(50,30,20,0.22)]

          sm:p-4
        "
      >
        {/* =====================================================
            DASHBOARD HEADER
        ====================================================== */}

        <div className="flex items-center justify-between px-1 pb-3">
          <div className="flex items-center gap-2.5">
            {/* Logo */}
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-[#8f2338]
                text-white
                shadow-xs
              "
            >
              <Scissors size={18} />
            </div>

            {/* Title */}
            <div>
              <p
                className="
                  text-[clamp(.55rem,1.2vw,.62rem)]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-[#928981]
                "
              >
                {t("home.yourTailorLabel")}
              </p>

              <h3
                className="
                  mt-0.5
                  font-serif
                  text-[clamp(1.25rem,3vw,1.5rem)]
                  font-semibold
                  leading-none
                  text-[#171c2d]
                "
              >
                {t("home.myTailor")}
              </h3>
            </div>
          </div>

          {/* Favourite */}
          <span
            aria-hidden="true"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-[#f8eee8]
              text-[#8f2338]
            "
          >
            <Heart
              size={15}
              fill="currentColor"
            />
          </span>
        </div>

        {/* =====================================================
            TAILOR PROFILE
        ====================================================== */}

        <div
          className="
            rounded-[18px]
            border
            border-[#eee5dc]
            bg-white
            p-3.5
          "
        >
          <div className="flex items-center gap-3">
            {/* Tailor image */}
            <div
              className="
                relative
                h-14
                w-14
                shrink-0
                overflow-hidden
                rounded-xl
                bg-[#f2e4d1]
              "
            >
              <img
                src="/assets/tailor-character.png"
                alt=""
                className="
                  h-full
                  w-full
                  object-cover
                  object-top
                "
              />

              {/* Online / verified indicator */}
              <span
                className="
                  absolute
                  bottom-0
                  right-0
                  flex
                  h-4
                  w-4
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-white
                  bg-emerald-500
                "
              >
                <CheckCircle2
                  size={8}
                  className="text-white"
                />
              </span>
            </div>

            {/* Tailor information */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h4
                  className="
                    truncate
                    text-[clamp(.72rem,1.8vw,.8rem)]
                    font-bold
                    text-[#202538]
                  "
                >
                  {t("home.tailorName")}
                </h4>

                <CheckCircle2
                  size={11}
                  className="shrink-0 text-[#8f2338]"
                />
              </div>

              <p
                className="
                  mt-0.5
                  truncate
                  text-[clamp(.58rem,1.4vw,.64rem)]
                  text-[#777b84]
                "
              >
                {t("home.tailorSpeciality")}
              </p>

              <div className="mt-1 flex items-center gap-2">
                {/* Rating */}
                <span
                  className="
                    flex
                    items-center
                    gap-1
                    text-[clamp(.55rem,1.3vw,.62rem)]
                    font-bold
                    text-[#c68635]
                  "
                >
                  <Star
                    size={9}
                    fill="currentColor"
                  />

                  4.9
                </span>

                <span className="text-[8px] text-[#aaa39c]">
                  •
                </span>

                {/* Location */}
                <span
                  className="
                    text-[clamp(.55rem,1.3vw,.62rem)]
                    text-[#777b84]
                  "
                >
                  {t("home.nearYou")}
                </span>
              </div>
            </div>

            <ChevronRight
              size={16}
              className="shrink-0 text-[#827b76]"
            />
          </div>

          {/* =================================================
              QUICK ACTIONS (NON-CLICKABLE PREVIEW)
          ================================================= */}

          <div className="mt-3 grid grid-cols-4 gap-1.5">
            <HeroAction
              icon={<Ruler size={14} />}
              label={t("home.measurements")}
            />

            <HeroAction
              icon={<PackageCheck size={14} />}
              label={t("home.myOrders")}
            />

            <HeroAction
              icon={<MessageCircle size={14} />}
              label={t("home.chat")}
            />

            <HeroAction
              icon={<Phone size={14} />}
              label={t("home.call")}
            />
          </div>
        </div>

        {/* =====================================================
            CURRENT ORDER
        ====================================================== */}

        <div
          className="
            mt-2.5
            rounded-[18px]
            border
            border-[#eee5dc]
            bg-[#fffdf9]
            p-3.5
          "
        >
          {/* Order heading */}
          <div className="flex items-center justify-between">
            <div>
              <p
                className="
                  text-[clamp(.55rem,1.2vw,.62rem)]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[#99918b]
                "
              >
                {t("home.currentOrder")}
              </p>

              <h4
                className="
                  mt-1
                  text-[clamp(.68rem,1.6vw,.75rem)]
                  font-bold
                  text-[#222638]
                "
              >
                {t("home.orderName")}
              </h4>
            </div>

            <ChevronRight
              size={15}
              className="text-[#77716d]"
            />
          </div>

          {/* Order progress */}
          <div className="mt-3 flex items-center gap-2.5">
            {/* Kurta image */}
            <div
              className="
                h-11
                w-11
                shrink-0
                overflow-hidden
                rounded-lg
                bg-[#f4e8dc]
              "
            >
              <img
                src="/assets/kurta.png"
                alt=""
                className="
                  h-full
                  w-full
                  object-contain
                  p-1
                "
              />
            </div>

            {/* Progress */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="
                    truncate
                    text-[clamp(.58rem,1.4vw,.64rem)]
                    font-semibold
                    text-[#343746]
                  "
                >
                  {t("home.stitching")}
                </span>

                <span
                  className="
                    text-[clamp(.58rem,1.4vw,.64rem)]
                    font-bold
                    text-[#343746]
                  "
                >
                  70%
                </span>
              </div>

              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-emerald-100/80">
                <div className="h-full w-[70%] rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>

          {/* Order footer */}
          <div
            className="
              mt-3
              flex
              items-center
              justify-between
              gap-3
              text-[clamp(.55rem,1.3vw,.62rem)]
              text-[#77716d]
            "
          >
            {/* Ready date */}
            <span className="flex min-w-0 items-center gap-1 truncate">
              <Clock3
                size={10}
                className="shrink-0"
              />

              {t("home.readyDate")}
            </span>

            {/* View order (Non-link preview indicator) */}
            <span
              className="
                flex
                shrink-0
                items-center
                gap-0.5
                font-bold
                text-[#8f2338]
              "
            >
              {t("home.viewOrder")}

              <ChevronRight size={10} />
            </span>
          </div>
        </div>

        {/* =====================================================
            FAVOURITE TAILOR
        ====================================================== */}

        <div
          className="
            mt-2.5
            flex
            items-center
            gap-3
            rounded-[15px]
            bg-[#f9eddb]
            px-3
            py-2.5
          "
        >
          {/* Bookmark icon */}
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-white
              text-[#8f2338]
              shadow-xs
            "
          >
            <Bookmark
              size={14}
              fill="currentColor"
            />
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p
              className="
                truncate
                text-[clamp(.58rem,1.4vw,.64rem)]
                font-bold
                text-[#4b352d]
              "
            >
              {t("home.saveFavourite")}
            </p>

            <p
              className="
                mt-0.5
                truncate
                text-[clamp(.52rem,1.25vw,.58rem)]
                text-[#83766d]
              "
            >
              {t("home.buildPersonalList")}
            </p>
          </div>

          <ChevronRight
            size={14}
            className="shrink-0 text-[#77685f]"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroDashboard;
