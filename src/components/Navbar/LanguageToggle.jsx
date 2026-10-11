import React from "react";

const LanguageToggle = ({
  language,
  onChange,
  mobile = false,
}) => {
  const isHindi = language === "hi";

  return (
    <div
      className={`
        flex items-center
        rounded-full
        border border-emerald-100
        bg-emerald-50
        p-0.5

        ${mobile ? "text-xs" : "text-[11px]"}
      `}
    >
      <button
        type="button"
        onClick={() => onChange("hi")}
        className={`
          min-w-[46px]
          rounded-full
          px-2.5 py-1.5
          font-semibold
          transition-all duration-200

          ${
            isHindi
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-emerald-700 hover:bg-emerald-100"
          }
        `}
      >
        हिन्दी
      </button>

      <button
        type="button"
        onClick={() => onChange("en")}
        className={`
          min-w-[34px]
          rounded-full
          px-2.5 py-1.5
          font-semibold
          transition-all duration-200

          ${
            !isHindi
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-emerald-700 hover:bg-emerald-100"
          }
        `}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;