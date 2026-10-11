import React, { useState } from "react";
import { Scissors } from "lucide-react";

/**
 * TailorAvatar: Reusable, standardized tailor profile image component.
 *
 * Rules:
 * 1. Attempts to render the authentic tailor / artisan image (from Clerk or database).
 * 2. If the image is missing, empty, or fails to load, gracefully displays a neutral avatar with
 *    the artisan's uppercase initials (or a neutral atelier icon), NEVER another person's photo.
 * 3. Does not use static stock/seed images as fallbacks.
 */
export default function TailorAvatar({
  image,
  name = "Tailor Studio",
  size = "md",
  className = "",
  rounded = "rounded-xl",
  aspectRatio = "aspect-square",
  alt,
}) {
  const [hasError, setHasError] = useState(false);

  // Compute initials (up to 2 letters)
  const initials = React.useMemo(() => {
    if (!name || typeof name !== "string") return "TS";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "TS";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [name]);

  // Size mapping
  const sizeClasses = {
    xs: "h-8 w-8 text-xs",
    sm: "h-10 w-10 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-16 w-16 text-lg",
    "2xl": "h-20 w-20 text-xl",
    banner: "h-44 sm:h-auto sm:w-56 text-2xl",
    hero: "h-64 sm:h-72 w-full text-3xl",
    custom: "",
  }[size] || "h-12 w-12 text-sm";

  const showImage = Boolean(image && !hasError && typeof image === "string" && image.trim());

  return (
    <div
      className={`relative shrink-0 overflow-hidden flex items-center justify-center bg-[#f7eee5] text-[#8f2338] font-bold select-none border border-stone-200/80 ${rounded} ${aspectRatio} ${sizeClasses} ${className}`}
    >
      {showImage ? (
        <img
          src={image}
          alt={alt || name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#fcf2e8] to-[#f5e3d3] text-[#8f2338]">
          {initials ? (
            <span className="tracking-wider font-extrabold uppercase">{initials}</span>
          ) : (
            <Scissors size={18} className="text-[#8f2338]/70" />
          )}
        </div>
      )}
    </div>
  );
}
