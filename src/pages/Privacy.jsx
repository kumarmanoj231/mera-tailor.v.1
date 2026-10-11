import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Eye,
  MapPin,
  Mic,
  Trash2,
  HelpCircle,
  Mail,
  ArrowLeft,
  ChevronRight,
  Printer,
  Sparkles,
  Server,
  UserCheck,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Phone,
  Scale,
  Award,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Privacy() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === "hi";

  const [activeSection, setActiveSection] = useState("info-collected");
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  function handlePrint() {
    window.print();
  }

  // Bilingual Data in Brossard Editorial Format
  const content = {
    breadcrumb: isHi ? "होम / कानूनी और नीतियां / गोपनीयता नीति" : "Home / Legal & Policies / Privacy Policy",
    eyebrow: isHi ? "डेटा सुरक्षा और DPDP अनुपालन" : "DATA PROTECTION & DPDP COMPLIANCE",
    version: isHi ? "संस्करण 2.4 · अक्टूबर 2026" : "v2.4 · October 2026",
    title: isHi
      ? "गोपनीयता नीति और डेटा सुरक्षा अधिकार"
      : "Privacy Policy & Data Protection Rights",
    subtitle: isHi
      ? "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP Act, भारत) के पूर्ण अनुपालन के साथ आपकी व्यक्तिगत जानकारी और नाप वॉल्ट की सुरक्षा।"
      : "Full compliance with India's Digital Personal Data Protection Act (DPDP Act 2023) ensuring total confidentiality of your personal measurements and tailoring records.",
    printBtn: isHi ? "नीति प्रिंट करें" : "Print Policy",
    backHomeBtn: isHi ? "होम पेज" : "Back to Home",
    commitmentsTitle: isHi ? "हमारे 4 मुख्य गोपनीयता सिद्धांत" : "Our 4 Core Privacy Principles",
    commitments: [
      {
        num: "01",
        title: isHi ? "100% शून्य डेटा बिक्री" : "Zero Data Selling",
        desc: isHi
          ? "हम आपका व्यक्तिगत डेटा, नाप या फोन नंबर कभी भी किसी तीसरे पक्ष या विज्ञापन नेटवर्क को नहीं बेचते।"
          : "We never monetize, rent, or sell your personal details, measurements, or contact info to any ad brokers.",
      },
      {
        num: "02",
        title: isHi ? "एन्क्रिप्टेड नाप वॉल्ट" : "Encrypted Fit Vault",
        desc: isHi
          ? "आपके शरीर के सभी नाप सुरक्षित AES-256 एन्क्रिप्शन के साथ केवल आपके अधिकृत टेलर के साथ साझा होते हैं।"
          : "Your anatomical fit measurements (cm) are AES-256 encrypted and accessible only to tailors you authorize.",
      },
      {
        num: "03",
        title: isHi ? "अस्थायी वॉइस प्रोसेसिंग" : "Ephemeral Voice AI",
        desc: isHi
          ? "Gemini AI वॉइस सर्च केवल परिधान खोज के समय संसाधित होता है और कभी स्थायी रूप से रिकॉर्ड नहीं होता।"
          : "AI voice inputs in Hindi/English are transcribed on-the-fly with Gemini and discarded immediately after.",
      },
      {
        num: "04",
        title: isHi ? "1-क्लिक डेटा विलोपन" : "1-Click Full Erasure",
        desc: isHi
          ? "आप किसी भी समय अपने सभी नाप रिकॉर्ड और खाता इतिहास को स्थायी रूप से हटाने का अनुरोध कर सकते हैं।"
          : "You hold the unreserved legal right to export, edit, or permanently erase your profile and records anytime.",
      },
    ],
    highlightBannerTitle: isHi ? "आपकी निजता और गरिमा हमारी सर्वोच्च प्राथमिकता है" : "Your Privacy & Bodily Dignity Are Paramount",
    highlightBannerText: isHi
      ? "MeraTailor पर जब आप नाप दर्ज करते हैं, तो वह आपकी डिजिटल धरोहर है। हम केवल वही जानकारी एकत्र करते हैं जो आपके परिधान को उत्तम फिट बनाने और डिलीवरी सुनिश्चित करने के लिए आवश्यक है।"
      : "At MeraTailor, your custom dimensions are your private asset. We collect only what is strictly required to tailor your perfect fit and execute prompt doorstep delivery.",
    tableOfContentsTitle: isHi ? "विषय सूची (अनुभाग)" : "Table of Contents",
    sidebarQuickTitle: isHi ? "त्वरित गोपनीयता अधिकार" : "Key Privacy Rights",
    sidebarQuickPoints: [
      isHi ? "बिना अनुमति के कोई तृतीय-पक्ष विज्ञापन ट्रैकिंग नहीं" : "Zero third-party cross-site advertising trackers",
      isHi ? "टेलर केवल सक्रिय ऑर्डर के दौरान नाप देख सकते हैं" : "Tailors access fit data strictly during active orders",
      isHi ? "DPDP अधिनियम 2023 के तहत पूर्ण डेटा पोर्टेबिलिटी" : "Full data portability under India DPDP Act 2023",
      isHi ? "शिकायत निवारण अधिकारी से सीधा संपर्क" : "Direct access to designated Grievance Officer",
    ],
    officerTitle: isHi ? "डेटा संरक्षण अधिकारी से संपर्क करें" : "Data Protection Officer",
    officerDesc: isHi
      ? "डेटा संशोधन, विलोपन या किसी भी गोपनीयता प्रश्न के लिए हमारे नोडल अधिकारी से सीधे संपर्क करें।"
      : "For inquiries regarding personal data access, rectification, or complete account purge, contact our Grievance Desk.",
    officerBtn: isHi ? "सहायता डेस्क से संपर्क करें" : "Contact Grievance Desk",
    wasHelpful: isHi ? "क्या यह नीति विवरण स्पष्ट और उपयोगी था?" : "Was this privacy policy clear & helpful?",
    thankFeedback: isHi ? "आपकी प्रतिक्रिया के लिए धन्यवाद!" : "Thank you for your feedback!",
    yes: isHi ? "हाँ" : "Yes",
    no: isHi ? "नहीं" : "No",
    sections: [
      {
        id: "info-collected",
        num: "01",
        title: isHi ? "1. हम कौन सा डेटा एकत्र करते हैं" : "1. Information We Collect",
        badge: isHi ? "डेटा संग्रह" : "Data Collection",
        content: isHi
          ? `हम MeraTailor प्लेटफ़ॉर्म के निर्बाध संचालन के लिए निम्नलिखित आवश्यक डेटा एकत्र करते हैं:

• व्यक्तिगत पहचान: नाम, ईमेल पता, मोबाइल नंबर और डिलीवरी पता (Clerk और सुरक्षित डेटाबेस द्वारा प्रबंधित)।
• शरीर का नाप (Measurement Vault): सीना, कमर, हिप, लंबाई, कंधा, आस्तीन आदि (सेंटीमीटर में)।
• भौगोलिक स्थान (Geo-Location): आपके आस-पास के 5-50 किमी दायरे में दर्जी खोजने के लिए जीपीएस निर्देशांक (केवल उपयोगकर्ता की अनुमति पर)।
• वॉइस सर्च डेटा: सर्च बार में AI वॉइस इनपुट (Gemini API द्वारा टेक्स्ट में परिवर्तित कर तुरंत हटा दिया जाता है)।
• ऑर्डर इतिहास और कोटेशन: परिधान विनिर्देश, कपड़े का प्रकार, सिलाई स्थिति और कारीगर के साथ संचार।`
          : `We collect strictly the minimal necessary data to deliver bespoke tailoring services across India:

• Account Identity: Name, verified email address, mobile phone number, and delivery street address (secured via Clerk Auth & encrypted MongoDB).
• Measurement Vault: Physical body measurements (Chest, Waist, Hip, Shoulder, Sleeve, Inseam in cm) provided directly by you or via a tailor measuring visit.
• Geolocation Coordinates: Approximate or precise GPS location used solely to compute tailor distance (5–50 km radius search) with explicit browser permission.
• Voice Intent Queries: Short audio spoken into the search bar, transcribed transiently via Google Gemini and never retained permanently.
• Transactional Records: Garment specifications, fabric photos, artisan quotes, live stitching telemetry, and invoice records.`,
      },
      {
        id: "how-we-use",
        num: "02",
        title: isHi ? "2. हम आपके डेटा का उपयोग कैसे करते हैं" : "2. How We Utilize Your Data",
        badge: isHi ? "डेटा उपयोग" : "Usage Scope",
        content: isHi
          ? `आपका डेटा केवल निम्नलिखित वैधानिक उद्देश्यों के लिए उपयोग किया जाता है:

1. परफेक्ट फिटिंग: आपके चयनित मास्टर दर्जी को आपके परिधान की कटाई और सिलाई के लिए नाप उपलब्ध कराना।
2. आर्डर स्थिति सूचनाएं: व्हाट्सएप, एसएमएस और इन-ऐप नोटिफिकेशन द्वारा कटाई, सिलाई और डिलीवरी की लाइव स्थिति भेजना।
3. स्थानीय कारीगर मिलान: आपके निकटतम सत्यापित और अत्यधिक रेटिंग वाले टेलर्स को प्राथमिकता के आधार पर प्रदर्शित करना।
4. विवाद समाधान: सिलाई में किसी भी प्रकार की त्रुटि होने पर नाप वॉल्ट के आधार पर निष्पक्ष समाधान उपलब्ध कराना।`
          : `We utilize your information solely for functional service fulfillment:

1. Precision Fitting: Transmitting your measurement vault parameters directly to the workshop cutting table for bespoke apparel fabrication.
2. Real-Time Telemetry & Tracking: Providing instant order updates (Cutting, Needlework, Ironing, Dispatch) via in-app feeds, SMS, and WhatsApp alerts.
3. Geo-Proximity Matching: Powering the Leaflet interactive map engine to surface certified master tailors within your immediate radius.
4. Quality & Dispute Resolution: Reviewing recorded measurement snapshots in cases where free fitting alterations or re-tailoring is requested.`,
      },
      {
        id: "data-sharing",
        num: "03",
        title: isHi ? "3. डेटा साझाकरण और तृतीय पक्ष नीतियां" : "3. Data Sharing & Third Parties",
        badge: isHi ? "साझाकरण" : "Data Sharing",
        content: isHi
          ? `MeraTailor किसी भी सूरत में आपका व्यक्तिगत डेटा बाहरी विपणन कंपनियों को नहीं बेचता है। डेटा साझाकरण केवल निम्नलिखित तक सीमित है:

• अधिकृत मास्टर टेलर: केवल आपके द्वारा चुने गए दर्जी को ऑर्डर पूरा करने के लिए आपका नाम, नाप और परिधान विवरण मिलता है।
• डिलीवरी भागीदार: तैयार कपड़े आपके घर तक पहुंचाने के लिए केवल आपका नाम, पता और फोन नंबर साझा किया जाता है।
• सुरक्षित अवसंरचना भागीदार: Clerk (प्रमाणीकरण), Cloudinary (कपड़े की फोटो सुरक्षा), और Google Gemini (वॉइस इनपुट)। ये सभी अंतरराष्ट्रीय सुरक्षा मानकों से प्रमाणित हैं।`
          : `We strictly limit data disclosure to essential operational partners:

• Selected Master Tailors: The specific artisan you hire receives access to your measurement profile strictly during active garment production.
• Logistics & Courier Partners: Delivery agents receive your dispatch address and phone number solely for doorstep package handover.
• Cloud & Security Providers: Clerk (Auth), Cloudinary (Image Hosting), MongoDB Atlas (Encrypted Database), and Google Gemini (Voice Intent Processing). All partners are SOC2 / ISO-27001 certified.`,
      },
      {
        id: "measurement-vault",
        num: "04",
        title: isHi ? "4. डिजिटल नाप वॉल्ट की सुरक्षा" : "4. Security of Your Measurement Vault",
        badge: isHi ? "वॉल्ट सुरक्षा" : "Vault Encryption",
        content: isHi
          ? `MeraTailor का डिजिटल नाप वॉल्ट विशेष सुरक्षा प्रोटोकॉल द्वारा संरक्षित है:

• डेटा एन्क्रिप्शन: आपके शरीर के नाप डेटाबेस में AES-256 बिट एन्क्रिप्शन के साथ संग्रहीत होते हैं।
• भूमिका-आधारित पहुंच (RBAC): ग्राहक अपनी नाप प्रोफ़ाइल को कभी भी संपादित या हटा सकते हैं। कोई अन्य उपयोगकर्ता आपकी नाप नहीं देख सकता।
• डोरस्टेप नाप गोपनीयता: जब टेलर आपके घर नाप लेने आता है, तो वह सीधे आपके खाते में नाप दर्ज करता है, जिसका भौतिक रिकॉर्ड नहीं रखा जाता।`
          : `Your custom sizing profile is treated with medical-grade digital confidentiality:

• Field-Level Encryption: Measurement dimensions (cm) are stored using AES-256 encryption at rest and TLS 1.3 in transit.
• Role-Based Access Control (RBAC): Only your authenticated account holds write permissions over your fit profile. Unrelated users cannot discover your dimensions.
• Digital-First Measuring: Visiting master tailors submit measurements directly through their portal, ensuring zero physical paper cards get misplaced.`,
      },
      {
        id: "user-rights",
        num: "05",
        title: isHi ? "5. आपके कानूनी अधिकार (DPDP अधिनियम 2023)" : "5. Your Legal Rights (DPDP Act 2023)",
        badge: isHi ? "उपयोगकर्ता अधिकार" : "Legal Rights",
        content: isHi
          ? `भारतीय डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम के अंतर्गत आपके पास निम्नलिखित पूर्ण अधिकार हैं:

1. डेटा की समीक्षा का अधिकार: अपने खाते में सुरक्षित सभी डेटा का विवरण कभी भी देखना।
2. सुधार का अधिकार: किसी भी गलत या पुराने नाप, पते या फोन नंबर को तुरंत अपडेट करना।
3. डेटा विलोपन का अधिकार (Right to Erasure): अपना खाता और सभी संबंधित डेटाबेस रिकॉर्ड 1-क्लिक में हमेशा के लिए हटाना।
4. सहमति वापस लेना: किसी भी समय मार्केटिंग संदेशों या जीपीएस अनुमति को वापस लेना।`
          : `Under India's Digital Personal Data Protection Act (DPDP Act 2023), you hold unconditional sovereignty over your data:

1. Right to Access & Summary: Inspect all personal records, measurement revisions, and order histories stored on the platform.
2. Right to Correction: Freely rectify inaccurate measurements, delivery locations, or billing details from your dashboard.
3. Right to Erasure (Data Purge): Permanently remove your account, measurement vault, and order files with immediate database deletion.
4. Right of Grievance Redressal: Receive an official resolution from our designated Data Protection Officer within 7 business days.`,
      },
      {
        id: "grievance",
        num: "06",
        title: isHi ? "6. शिकायत निवारण और संपर्क सूत्र" : "6. Grievance Officer & Contact",
        badge: isHi ? "शिकायत निवारण" : "Grievance Officer",
        content: isHi
          ? `गोपनीयता या डेटा अधिकारों से संबंधित किसी भी प्रश्न या शिकायत के लिए हमारे नियुक्त नोडल अधिकारी से संपर्क करें:

• पद: डेटा संरक्षण एवं शिकायत अधिकारी (Data Protection Officer)
• कंपनी: MeraTailor Technologies Private Limited
• पता: एम.आई. रोड, जयपुर, राजस्थान - 302001, भारत
• ईमेल: privacy@meratailor.com / support@meratailor.com
• कार्य समय: सोमवार से शनिवार, प्रातः 10:00 बजे से सायं 6:00 बजे तक (IST)`
          : `In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines) and DPDP Act 2023, contact our Grievance Officer:

• Officer Designation: Data Protection & Grievance Officer
• Entity: MeraTailor Technologies Private Limited
• Address: M.I. Road, Jaipur, Rajasthan - 302001, India
• Email: privacy@meratailor.com · grievances@meratailor.com
• Operational Hours: Monday to Saturday, 10:00 AM to 6:00 PM IST
• Response SLA: Official acknowledgement within 24 hours, complete redressal within 7 working days.`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#111827] selection:bg-[#8f2338] selection:text-white">
      <Navbar />

      <main className="pb-20">
        {/* =========================================================
            1. BROSSARD-STYLE ARTICLE HEADER
        ========================================================== */}
        <div className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <Link to="/" className="hover:text-stone-900">MeraTailor</Link>
              <span>/</span>
              <span>{content.breadcrumb}</span>
            </div>

            {/* Category Pill Tag & Updated Date */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                  {content.eyebrow}
                </span>
                <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-[#8f2338]">
                  {content.version}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition"
                >
                  <Printer size={14} />
                  <span>{content.printBtn}</span>
                </button>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
                >
                  <ArrowLeft size={14} />
                  <span>{content.backHomeBtn}</span>
                </Link>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="mt-5 font-sans text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl lg:text-5xl leading-tight max-w-4xl">
              {content.title}
            </h1>

            {/* Introductory Paragraph */}
            <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed max-w-3xl">
              {content.subtitle}
            </p>
          </div>
        </div>

        {/* =========================================================
            2. KEY COMMITMENTS / PRINCIPLES HERO GRID
        ========================================================== */}
        <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-stone-100 pb-4 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <ShieldCheck size={18} />
              </div>
              <h2 className="font-sans text-lg font-bold text-[#111827]">
                {content.commitmentsTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {content.commitments.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-5 transition hover:border-[#8f2338]/40 hover:shadow-xs"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-[#8f2338] text-xs font-bold mb-3 font-mono">
                    {item.num}
                  </div>
                  <h3 className="font-sans text-sm font-bold text-[#111827]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-stone-800 flex items-start gap-3">
              <Sparkles size={18} className="text-[#8f2338] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#8f2338]">
                  {content.highlightBannerTitle}
                </p>
                <p className="mt-1 text-stone-700 leading-relaxed">
                  {content.highlightBannerText}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* =========================================================
            3. BROSSARD TWO-COLUMN LAYOUT: CONTENT + STICKY SIDEBAR
        ========================================================== */}
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
            {/* Left Column (8 cols): Structured Policy Sections */}
            <div className="lg:col-span-8 space-y-6">
              {content.sections.map((sec) => (
                <article
                  key={sec.id}
                  id={sec.id}
                  className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs scroll-mt-24 transition hover:border-[#8f2338]/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-xs font-mono font-bold text-[#8f2338]">
                        {sec.num}
                      </span>
                      <h2 className="font-sans text-lg font-bold text-[#111827] sm:text-xl">
                        {sec.title}
                      </h2>
                    </div>
                    <span className="rounded-full bg-stone-100 px-3 py-0.5 text-[11px] font-semibold text-stone-600">
                      {sec.badge}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line space-y-3 font-normal">
                    {sec.content}
                  </div>
                </article>
              ))}

              {/* Bottom Footer Notice */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 text-center text-xs text-stone-500 shadow-2xs">
                <p className="font-medium text-stone-700">
                  © {new Date().getFullYear()} MeraTailor Technologies Private Limited.
                </p>
                <p className="mt-1">
                  Compliant with Digital Personal Data Protection Act (DPDP Act 2023, India) · Registered Intermediary Platform
                </p>
                <p className="mt-1 text-[11px] text-stone-400">
                  Jaipur, Rajasthan, 302001, India
                </p>
              </div>
            </div>

            {/* Right Column (4 cols): Sticky Sidebar */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              {/* Table of Contents Navigation */}
              <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                  {content.tableOfContentsTitle}
                </p>
                <nav className="space-y-1 text-xs">
                  {content.sections.map((sec) => {
                    const isActive = activeSection === sec.id;
                    return (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        onClick={() => setActiveSection(sec.id)}
                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 font-semibold transition ${
                          isActive
                            ? "bg-[#8f2338] text-white font-bold shadow-xs"
                            : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                        }`}
                      >
                        <span className="truncate">
                          <span className="font-mono text-[10px] opacity-70 mr-2">{sec.num}</span>
                          {sec.title}
                        </span>
                        <ChevronRight size={13} className={isActive ? "opacity-100" : "opacity-40"} />
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Key Highlights Points Card */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                <h3 className="font-sans text-sm font-bold text-stone-900 border-b border-stone-100 pb-3">
                  {content.sidebarQuickTitle}
                </h3>
                <ul className="space-y-2.5 text-xs text-stone-600">
                  {content.sidebarQuickPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Data Protection Officer Contact Card */}
              <div className="rounded-3xl border border-stone-200 bg-[#fdfbf9] p-6 text-xs text-stone-600 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <ShieldCheck size={16} className="text-emerald-700" />
                  <span>{content.officerTitle}</span>
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  {content.officerDesc}
                </p>
                <Link
                  to="/contact"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8f2338] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#761c30] transition"
                >
                  <Mail size={14} />
                  <span>{content.officerBtn}</span>
                </Link>
              </div>

              {/* Interactive Feedback Widget */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs text-center">
                <p className="text-xs font-bold text-stone-800">
                  {content.wasHelpful}
                </p>

                {feedbackGiven ? (
                  <div className="mt-3 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800">
                    ✓ {content.thankFeedback}
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFeedbackGiven("yes")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-bold text-stone-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 transition"
                    >
                      <ThumbsUp size={13} />
                      <span>{content.yes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeedbackGiven("no")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-bold text-stone-700 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-800 transition"
                    >
                      <ThumbsDown size={13} />
                      <span>{content.no}</span>
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
