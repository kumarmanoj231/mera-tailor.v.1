import React from "react";

const HowItWorksCard = ({
  number,
  step,
  title,
  text,
}) => {
  return (
    <div
      className="
        rounded-lg
        border-2
        border-[#dfcdb8]
        bg-[#fffefd]
        p-5
        shadow-[0_6px_18px_rgba(70,45,30,0.04)]
        transition
        duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_10px_24px_rgba(70,45,30,0.07)]

        sm:p-6
      "
    >
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold text-[#8f2338]">
          {number}
        </span>

        <span className="font-serif text-xs font-semibold text-[#51444a]">
          {step}
        </span>
      </div>

      <h3 className="mt-5 text-[13px] font-semibold leading-tight tracking-[-0.015em] text-[#2b211f] sm:text-sm">
        {title}
      </h3>

      <p className="mt-2 text-[11px] leading-5 text-[#756c67] sm:text-xs">
        {text}
      </p>
    </div>
  );
};

export default HowItWorksCard;