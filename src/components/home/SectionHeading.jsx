import React from "react";

const SectionHeading = ({ children }) => {
  return (
    <h2
      className="
        text-center
        font-serif
        text-[clamp(1.55rem,4.5vw,2.35rem)]
        font-medium
        leading-tight
        tracking-[-0.035em]
        text-[#2b211f]

        sm:text-left
      "
    >
      {children}
    </h2>
  );
};

export default SectionHeading;