import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, CircleHelp, ExternalLink, MapPin, Scissors, Search, ShoppingBag, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

const ROLE_STEPS = {
  customer: [
    { title: "Find a tailor", description: "Open Find Tailors. Search by city or area, pick a garment category, and browse the list or map.", href: "/find-tailors", screen: "/find-tailors", action: "Open Find Tailors", icon: MapPin },
    { title: "Compare a studio", description: "Open a studio profile to review its services, starting prices, location, and customer reviews.", href: "/find-tailors", screen: "/find-tailors", action: "Browse studios", icon: Search },
    { title: "Send an order request", description: "From the studio profile, choose a service, add garment details and measurements, review the request, then submit it.", href: "/find-tailors", screen: "/find-tailors", action: "Choose a tailor", icon: Scissors },
    { title: "Track your order", description: "Open Orders from the header or dashboard to see tailor replies and follow the order status.", href: "/orders", screen: "/orders", action: "View my orders", icon: ShoppingBag },
  ],
  tailor: [
    { title: "Set up your studio", description: "Open your Dashboard, choose Studio, and add your studio name, location, services, prices, and working details.", href: "/dashboard?tab=studio", screen: "/dashboard?tab=studio", action: "Open studio setup", icon: Store },
    { title: "Handle customer orders", description: "Open Client Orders to review requests, respond with a quote, and update work as it moves forward.", href: "/orders", screen: "/orders", action: "Open client orders", icon: ShoppingBag },
    { title: "Find bulk work", description: "Open B2B Bulk Jobs to review available business requirements and send a quote for work you can take.", href: "/bulk", screen: "/bulk", action: "Explore bulk jobs", icon: Scissors },
    { title: "Apply for verification", description: "When your studio details are ready, submit the verification application from your studio dashboard. An admin reviews it.", href: "/dashboard?tab=studio", screen: "/dashboard?tab=studio", action: "Open studio dashboard", icon: CheckCircle2 },
  ],
  business: [
    { title: "Complete your business profile", description: "Open your Dashboard and add your company, contact, and location details.", href: "/dashboard", screen: "/dashboard", action: "Open business dashboard", icon: Store },
    { title: "Post a bulk requirement", description: "Open Bulk Orders and create a requirement with garment details, quantity, delivery date, and any useful notes.", href: "/bulk", screen: "/bulk", action: "Open bulk orders", icon: Scissors },
    { title: "Review tailor quotes", description: "Return to your requirements to compare responses from tailors and select the quote that fits your needs.", href: "/bulk", screen: "/bulk", action: "Review requirements", icon: Search },
    { title: "Follow production", description: "Use Orders to keep track of awarded bulk work and its progress with the selected tailor.", href: "/orders", screen: "/orders", action: "Track bulk orders", icon: ShoppingBag },
  ],
};

const ROLE_LABELS = {
  customer: "Customer",
  tailor: "Tailor",
  business: "Business",
};

const HINDI_TIPS = {
  customer: ["खोज और श्रेणी चुनें, फिर स्टूडियो पर View information खोलें।", "सेवा चुनें और ऑर्डर चरण पूरे करें; पूछे जाने पर साइन इन करें।", "अनुरोध भेजने से पहले कपड़े, मात्रा और नाप जाँच लें।", "ऑर्डर कार्ड में अपडेट पढ़ें और दर्जी से संपर्क करें।"],
  tailor: ["सत्यापन के लिए आवेदन करने से पहले स्टूडियो विवरण सेव करें।", "नए अनुरोध और ग्राहक अपडेट Client Orders में मिलेंगे।", "कोटेशन भेजने से पहले आवश्यकता का विवरण देखें।", "एडमिन सत्यापन की समीक्षा करता है; इससे खाता भूमिका नहीं बदलती।"],
  business: ["व्यावसायिक सत्यापन प्रोफ़ाइल की समीक्षा है; इससे खाता भूमिका नहीं बदलती।", "दर्जी को सही कीमत देने के लिए आवश्यकता का पूरा विवरण दें।", "काम चुनने से पहले कोटेशन और समयसीमा की तुलना करें।", "कोटेशन चुनने के बाद Orders में काम की स्थिति देखें।"],
};

const HINDI_STEPS = {
  customer: [
    ["दर्जी खोजें", "Find Tailors खोलें। शहर या इलाका खोजें, कपड़े की श्रेणी चुनें और सूची या नक्शे में दर्जी देखें।", "दर्जी खोजें"],
    ["स्टूडियो की तुलना करें", "स्टूडियो प्रोफ़ाइल खोलकर सेवाएँ, शुरुआती कीमतें, स्थान और ग्राहक समीक्षाएँ देखें।", "स्टूडियो देखें"],
    ["ऑर्डर अनुरोध भेजें", "सेवा चुनें, कपड़े की जानकारी और नाप जोड़ें, अनुरोध जाँचें और फिर भेजें।", "दर्जी चुनें"],
    ["ऑर्डर की स्थिति देखें", "दर्जी के जवाब और ऑर्डर की प्रगति देखने के लिए Orders खोलें।", "मेरे ऑर्डर देखें"],
  ],
  tailor: [
    ["स्टूडियो सेट करें", "Dashboard में Studio खोलें और स्टूडियो का नाम, स्थान, सेवाएँ, कीमतें और काम की जानकारी जोड़ें।", "स्टूडियो सेटअप खोलें"],
    ["ग्राहक ऑर्डर संभालें", "अनुरोध देखें, कीमत बताएँ और काम की प्रगति अपडेट करने के लिए Client Orders खोलें।", "ग्राहक ऑर्डर खोलें"],
    ["थोक काम खोजें", "उपलब्ध व्यावसायिक आवश्यकताएँ देखने और कीमत भेजने के लिए B2B Bulk Jobs खोलें।", "थोक काम देखें"],
    ["सत्यापन के लिए आवेदन करें", "स्टूडियो विवरण पूरा होने पर डैशबोर्ड से आवेदन भेजें। एडमिन इसकी समीक्षा करेगा।", "स्टूडियो डैशबोर्ड खोलें"],
  ],
  business: [
    ["व्यावसायिक प्रोफ़ाइल भरें", "Business डैशबोर्ड खोलें और कंपनी, संपर्क तथा स्थान की जानकारी जोड़ें।", "व्यावसायिक डैशबोर्ड खोलें"],
    ["थोक आवश्यकता पोस्ट करें", "Bulk Orders में कपड़े, मात्रा, डिलीवरी तारीख और उपयोगी नोट्स जोड़ें।", "थोक ऑर्डर खोलें"],
    ["दर्जी के कोटेशन देखें", "जवाबों की तुलना करें और अपनी ज़रूरत के अनुसार कोटेशन चुनें।", "आवश्यकताएँ देखें"],
    ["काम की प्रगति देखें", "चुने गए दर्जी के साथ काम की प्रगति देखने के लिए Orders खोलें।", "थोक ऑर्डर ट्रैक करें"],
  ],
};

function ScreenPreview({ src, title, available, screenshot, onChooseRole, isHi }) {
  if (screenshot) {
    return (
      <figure className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <img src={screenshot} alt={screenshot.includes("customer-find-tailors") ? "Actual MeraTailor Find Tailors screen" : "Actual MeraTailor tailor profile and order screen"} className="block h-auto w-full" />
        <figcaption className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-stone-500">
          <span>{screenshot.includes("customer-find-tailors") ? (isHi ? "प्लेटफ़ॉर्म स्क्रीन · दर्जी खोजें" : "Actual platform screen · Find Tailors") : (isHi ? "प्लेटफ़ॉर्म स्क्रीन · स्टूडियो और ऑर्डर" : "Actual platform screen · Studio and order")}</span>
          <a href={src} className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#8f2338] hover:underline">{isHi ? "स्क्रीन खोलें" : "Open screen"} <ExternalLink size={12} /></a>
        </figcaption>
      </figure>
    );
  }

  if (!available) {
    return (
      <div className="grid min-h-[250px] place-items-center rounded-2xl bg-stone-100 px-6 py-8 text-center sm:min-h-[350px]">
        <div className="max-w-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#8f2338] shadow-sm"><CircleHelp size={22} /></div>
          <p className="mt-4 font-semibold text-stone-900">{isHi ? `${title} खाते से साइन इन करके यह स्क्रीन देखें` : `Sign in as a ${title} to view this screen`}</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">{isHi ? "निजी डैशबोर्ड केवल उसी भूमिका वाले खाते में दिखाई देते हैं।" : "Screens from private dashboards are shown only to the matching account type."}</p>
          {onChooseRole && <button type="button" onClick={onChooseRole} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#8f2338] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#741b2d]">{isHi ? `${title} खाता बनाएँ` : `Create a ${title} account`} <ArrowRight size={15} /></button>}
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[190px] place-items-center rounded-2xl border border-stone-200 bg-white px-5 py-7 text-center shadow-sm sm:min-h-[250px]">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-[#8f2338]"><ExternalLink size={21} /></div>
        <p className="mt-3 text-sm font-semibold text-stone-900">{title} screen</p>
        <p className="mt-1 text-xs text-stone-500">{src}</p>
        <a href={src} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">Open this screen <ArrowRight size={15} /></a>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const { i18n } = useTranslation();
  const { isSignedIn, profile, user, openSignUp } = useAuth();
  const isHi = i18n.language === "hi";
  const accountRole = (profile?.role || user?.publicMetadata?.appRole || "customer").toLowerCase();
  const validAccountRole = ["customer", "tailor", "business"].includes(accountRole) ? accountRole : "customer";
  const [guideRole, setGuideRole] = useState(validAccountRole);
  const [sampleTailorId, setSampleTailorId] = useState("");

  useEffect(() => {
    setGuideRole(validAccountRole);
  }, [validAccountRole]);

  useEffect(() => {
    let active = true;
    fetch("/api/tailors?limit=1")
      .then(response => response.ok ? response.json() : [])
      .then(rows => {
        const id = Array.isArray(rows) ? rows[0]?._id || rows[0]?.id : "";
        if (active && id) setSampleTailorId(String(id));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const steps = useMemo(() => ROLE_STEPS[guideRole], [guideRole]);
  const canViewPrivateScreens = isSignedIn && validAccountRole === guideRole;
  const localeTitle = isHi ? "कैसे काम करता है" : "How it works";
  const guideRoleLabel = isHi ? ({ customer: "ग्राहक", tailor: "दर्जी", business: "व्यवसाय" }[guideRole]) : ROLE_LABELS[guideRole];

  return (
    <div className="min-h-screen bg-[#faf8f4] text-stone-900">
      <Navbar />
      <main>
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-9 sm:px-6 sm:pt-14 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8f2338]">{localeTitle}</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">{isHi ? "अपना अगला कदम आसानी से खोजें" : "Your next step, made simple"}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-stone-600">{isHi ? "अपनी भूमिका चुनें और प्लेटफ़ॉर्म पर दिए गए वास्तविक स्क्रीन व सीधे लिंक के साथ चरण-दर-चरण आगे बढ़ें।" : "Choose how you use MeraTailor and follow the exact screens and links to complete each task."}</p>
          </div>

          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm" role="tablist" aria-label="Choose a walkthrough">
            {Object.entries(ROLE_LABELS).map(([role, label]) => (
              <button key={role} id={`guide-tab-${role}`} type="button" role="tab" aria-selected={guideRole === role} aria-controls="guide-steps" onClick={() => setGuideRole(role)} className={`min-h-11 flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${guideRole === role ? "bg-[#8f2338] text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"}`}>
                {isHi ? ({ customer: "ग्राहक", tailor: "दर्जी", business: "व्यवसाय" }[role]) : label}
              </button>
            ))}
          </div>

          {isSignedIn && <p className="mt-3 text-center text-xs text-stone-500">{isHi ? (guideRole === validAccountRole ? "यह गाइड आपके वर्तमान खाते की भूमिका के अनुसार है।" : "यह केवल जानकारी के लिए गाइड है; इससे खाते की भूमिका नहीं बदलती।") : (guideRole === validAccountRole ? `Showing the guide for your ${ROLE_LABELS[validAccountRole].toLowerCase()} account.` : "This guide is for reference only and does not change your account role.")}</p>}
        </section>

        <section id="guide-steps" role="tabpanel" aria-labelledby={`guide-tab-${guideRole}`} className="mx-auto max-w-7xl space-y-7 px-4 pb-16 sm:space-y-9 sm:px-6 lg:px-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const stepCopy = isHi ? HINDI_STEPS[guideRole][index] : [step.title, step.description, step.action];
            let screen = step.screen;
            if (guideRole === "customer" && index > 0 && sampleTailorId) screen = `/tailors/${encodeURIComponent(sampleTailorId)}`;
            const needsRole = ["tailor", "business"].includes(guideRole) || (guideRole === "customer" && ["/orders"].includes(screen));
            const canPreview = !needsRole || canViewPrivateScreens;
            const screenshot = guideRole === "customer" && index === 0 ? "/guide/customer-find-tailors.png" : guideRole === "customer" && [1, 2].includes(index) ? "/guide/customer-studio-order.png" : null;
            const actionHref = guideRole === "customer" && [1, 2].includes(index) && sampleTailorId ? `/tailors/${encodeURIComponent(sampleTailorId)}` : step.href;
            return (
              <article key={`${guideRole}-${step.title}`} className="grid overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm lg:grid-cols-[0.78fr_1.22fr]">
                <div className="flex flex-col p-5 sm:p-8 lg:p-10">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-50 text-[#8f2338]"><Icon size={20} /></span>
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">{isHi ? `चरण ${index + 1} / ${steps.length}` : `Step ${index + 1} of ${steps.length}`}</span>
                  </div>
                  <h2 className="mt-5 font-serif text-2xl leading-snug sm:text-3xl">{stepCopy[0]}</h2>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{stepCopy[1]}</p>
                  <div className="mt-5 flex items-start gap-2 rounded-xl bg-stone-50 p-3 text-sm leading-6 text-stone-600">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={17} />
                    <span>{isHi ? HINDI_TIPS[guideRole][index] : guideRole === "customer" ? (index === 0 ? "Use the search and category controls, then open View information on a studio." : index === 1 ? "Choose a service and follow the on-screen order steps; sign in when asked." : index === 2 ? "Check the garment, quantity, and measurements before submitting your request." : "Use the order card to read updates and contact the tailor." ) : guideRole === "tailor" ? (index === 0 ? "Save your studio details before applying for verification." : index === 1 ? "New requests and customer updates are available from Client Orders." : index === 2 ? "Open a requirement to review details before sending a quote." : "Verification is reviewed by an administrator; it does not change your account role." ) : (index === 0 ? "Business verification is a profile review and does not change your account type." : index === 1 ? "Add enough detail for tailors to prepare accurate quotes." : index === 2 ? "Compare quote details and timelines before awarding work." : "Use your order list to follow work after you select a quote." )}</span>
                  </div>
                  <Link to={actionHref} className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-[#8f2338] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#741b2d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f2338]">
                    {stepCopy[2]}<ArrowRight size={16} />
                  </Link>
                </div>
                <div className="border-t border-stone-200 bg-stone-50 p-3 sm:p-5 lg:border-l lg:border-t-0">
                  <ScreenPreview src={screen} title={guideRoleLabel} available={canPreview} screenshot={screenshot} onChooseRole={!isSignedIn ? () => openSignUp?.(guideRole) : null} isHi={isHi} />
                </div>
              </article>
            );
          })}
        </section>

        <section className="border-t border-stone-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div><h2 className="font-serif text-2xl">{isHi ? "अभी भी मदद चाहिए?" : "Need a hand?"}</h2><p className="mt-1 text-sm text-stone-600">{isHi ? "सहायता टीम से संपर्क करें या अगले स्क्रीन पर जाएँ।" : "Contact support or go straight to the next screen."}</p></div>
            <div className="flex flex-wrap gap-2"><Link to="/contact" className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">{isHi ? "सहायता से संपर्क करें" : "Contact support"}</Link><Link to={guideRole === "customer" ? "/find-tailors" : guideRole === "tailor" ? "/dashboard?tab=studio" : "/bulk"} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#8f2338] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#741b2d]">{isHi ? "आगे बढ़ें" : "Continue"}<ArrowRight size={15} /></Link></div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
