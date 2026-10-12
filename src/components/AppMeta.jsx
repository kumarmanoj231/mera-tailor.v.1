import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PRIVATE_PATHS = [
  "/admin",
  "/dashboard",
  "/orders",
  "/my-orders",
  "/my-tailors",
  "/bulk",
  "/onboarding",
];

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function AppMeta() {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    const routeTitles = {
      "/": t("home.brand"),
      "/find-tailors": t("discovery.title"),
      "/bulk": t("portals.bulkTitle"),
      "/how-it-works": t("pages.howTitle"),
      "/orders": t("pages.ordersTitle"),
      "/my-orders": t("pages.ordersTitle"),
      "/my-tailors": t("pages.savedTitle"),
      "/contact": t("pages.contactTitle"),
      "/dashboard": t("portals.dashboard"),
      "/admin": t("portals.adminTitle"),
      "/onboarding": t("authFlow.welcome", "Welcome to MeraTailor"),
    };
    const isPrivate = PRIVATE_PATHS.some((privatePath) =>
      path === privatePath || path.startsWith(`${privatePath}/`),
    );
    const title = routeTitles[path] || (path.startsWith("/tailors/") ? "Tailor profile" : "MeraTailor");
    const description = path === "/bulk"
      ? t("portals.bulkIntro")
      : path === "/find-tailors"
        ? t("discovery.intro")
        : t("home.description");
    const canonicalUrl = new URL(path, window.location.origin).href;
    const imageUrl = new URL("/assets/hero-atelier.jpg", window.location.origin).href;

    document.title = `${title} | MeraTailor`;
    document.documentElement.lang = i18n.resolvedLanguage?.startsWith("hi") ? "hi" : "en";
    setMeta("name", "description", description);
    setMeta("name", "robots", isPrivate ? "noindex, nofollow" : "index, follow");
    setMeta("property", "og:title", document.title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", imageUrl);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", document.title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", imageUrl);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    let structuredData = document.getElementById("meratailor-website-schema");
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.id = "meratailor-website-schema";
      structuredData.type = "application/ld+json";
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "MeraTailor",
      url: window.location.origin,
      inLanguage: ["en", "hi"],
      potentialAction: {
        "@type": "SearchAction",
        target: `${window.location.origin}/find-tailors?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    });
  }, [location.pathname, i18n.language, t]);

  return null;
}
