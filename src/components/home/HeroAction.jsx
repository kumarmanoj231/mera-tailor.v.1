import React from "react";

const HeroAction = ({
  icon,
  label,
}) => {
  return (
    <div
      className="
        flex
        min-w-0
        flex-col
        items-center
        justify-center
        gap-1
        rounded-xl
        bg-[#f7eee3]
        px-1
        py-2
        select-none
      "
    >
      <div
        className="
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-lg
          bg-white
          text-[#8f2338]
          shadow-xs
        "
      >
        {icon}
      </div>

      <span
        className="
          truncate
          text-[clamp(.48rem,1.3vw,.56rem)]
          font-semibold
          text-[#4c4140]
        "
      >
        {label}
      </span>
    </div>
  );
};

export default HeroAction;