import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AppMeta(){
  const location=useLocation();const {t,i18n}=useTranslation();
  useEffect(()=>{
    const routeTitles={"/":t("home.brand"),"/find-tailors":t("discovery.title"),"/bulk":t("portals.bulkTitle"),"/how-it-works":t("pages.howTitle"),"/orders":t("pages.ordersTitle"),"/my-orders":t("pages.ordersTitle"),"/my-tailors":t("pages.savedTitle"),"/contact":t("pages.contactTitle"),"/dashboard":t("portals.dashboard"),"/admin":t("portals.adminTitle")};
    const title=routeTitles[location.pathname]||"MeraTailor";const description=location.pathname==="/bulk"?t("portals.bulkIntro"):location.pathname==="/find-tailors"?t("discovery.intro"):t("home.description");
    document.title=`${title} | MeraTailor`;
    document.documentElement.lang=i18n.resolvedLanguage?.startsWith("hi")?"hi":"en";
    let meta=document.querySelector('meta[name="description"]');if(!meta){meta=document.createElement("meta");meta.name="description";document.head.appendChild(meta);}meta.content=description;
    let og=document.querySelector('meta[property="og:title"]');if(!og){og=document.createElement("meta");og.setAttribute("property","og:title");document.head.appendChild(og);}og.content=document.title;
  },[location.pathname,i18n.language,t]);
  return null;
}
