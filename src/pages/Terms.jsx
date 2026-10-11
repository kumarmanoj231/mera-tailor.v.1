import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Printer,
  Sparkles,
  HelpCircle,
  Mail,
  Building,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  FileText,
  AlertCircle,
  Scissors,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Terms() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === "hi";

  const [activeSection, setActiveSection] = useState("acceptance");
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  function handlePrint() {
    window.print();
  }

  // Bilingual Data in Brossard Editorial Format
  const content = {
    breadcrumb: isHi ? "होम / कानूनी और नीतियां / नियम और शर्तें" : "Home / Legal & Policies / Terms of Service",
    eyebrow: isHi ? "कानूनी सेवा अनुबंध और नियम" : "LEGAL & SERVICE AGREEMENT",
    version: isHi ? "संस्करण 2.4 · अक्टूबर 2026" : "v2.4 · October 2026",
    title: isHi
      ? "सेवा की शर्तें और प्लेटफ़ॉर्म अनुबंध"
      : "Terms of Service & Platform Agreement",
    subtitle: isHi
      ? "MeraTailor प्लेटफ़ॉर्म का उपयोग करने, सिलाई ऑर्डर देने और कारीगर सेवाओं के लिए स्पष्ट, न्यायसंगत और कानूनी शर्तें।"
      : "The binding operating terms governing customer commissions, master tailor workshops, corporate B2B RFQs, and quality guarantees on MeraTailor.",
    printBtn: isHi ? "नियम प्रिंट करें" : "Print Terms",
    backHomeBtn: isHi ? "होम पेज" : "Back to Home",
    principlesTitle: isHi ? "हमारे 4 मुख्य परिचालन सिद्धांत" : "Our 4 Core Operating Principles",
    principles: [
      {
        num: "01",
        title: isHi ? "सीधा कारीगर संबंध" : "Direct Tailor Access",
        desc: isHi
          ? "ग्राहक और मास्टर दर्जी के बीच बिना किसी छुपे कमीशन के सीधा पारदर्शी संवाद और कोटेशन।"
          : "Direct, transparent communication and itemized quotations directly with your chosen atelier.",
      },
      {
        num: "02",
        title: isHi ? "सिलाई पूर्व निःशुल्क रद्दीकरण" : "Pre-Cut Zero Fee Cancel",
        desc: isHi
          ? "कपड़े की कटाई शुरू होने से पहले 100% शून्य रद्दीकरण शुल्क के साथ ऑर्डर वापस लेने का अधिकार।"
          : "Full entitlement to cancel any commission before physical cutting starts with zero cancellation fees.",
      },
      {
        num: "03",
        title: isHi ? "परफेक्ट फिट गारंटी" : "Guaranteed Perfect Fit",
        desc: isHi
          ? "यदि नाप के अनुसार फिटिंग में त्रुटि होती है, तो दर्जी द्वारा निःशुल्क ऑल्टरेशन का वादा।"
          : "Complimentary alteration guarantee if the delivered garment deviates from recorded vault dimensions.",
      },
      {
        num: "04",
        title: isHi ? "सत्यापित कार्यशाला बैज" : "Verified Atelier Badges",
        desc: isHi
          ? "सभी टेलर्स की कार्यशाला, अनुभव और कौशल का कड़ा ऑडिट करने के बाद ही बैज प्रदान किया जाता है।"
          : "Rigorous verification of workshop authenticity, craft specialty, and background before listing.",
      },
    ],
    highlightBannerTitle: isHi ? "पारदर्शी और निष्पक्ष सिलाई सेवा अनुबंध" : "Fair, Ethical & Transparent Craftsmanship",
    highlightBannerText: isHi
      ? "MeraTailor केवल एक मध्यस्थ तकनीक मंच नहीं है, बल्कि स्थानीय भारतीय दर्जी समुदाय और ग्राहकों के बीच विश्वास का सेतु है। हम हर सिलाई प्रक्रिया में पूर्ण पारदर्शिता सुनिश्चित करते हैं।"
      : "MeraTailor bridges tradition with modern technology. Our terms protect both customer satisfaction and artisan dignity with clear milestone tracking and upfront pricing.",
    tableOfContentsTitle: isHi ? "विषय सूची (अनुभाग)" : "Table of Contents",
    sidebarQuickTitle: isHi ? "मुख्य कानूनी सारांश" : "Key Legal Takeaways",
    sidebarQuickPoints: [
      isHi ? "कटाई से पहले 100% निःशुल्क रद्दीकरण" : "100% Free cancellation prior to fabric cutting",
      isHi ? "डिजिटल नाप वॉल्ट के आधार पर फिटिंग वारंटी" : "Fit warranty based on stored measurement vault",
      isHi ? "सभी टेलर्स स्थानीय स्तर पर सत्यापित" : "All listed tailors are audited & verified",
      isHi ? "जयपुर, भारत के न्यायालयों का विशेष अधिकार क्षेत्र" : "Exclusive jurisdiction in Jaipur, India",
    ],
    legalDeskTitle: isHi ? "कानूनी अनुपालन डेस्क" : "Legal & Compliance Desk",
    legalDeskDesc: isHi
      ? "संविदात्मक नियमों, थोक बी2बी अनुबंधों या विवाद समाधान के लिए हमारे कानूनी दल से संपर्क करें।"
      : "For B2B manufacturing contracts, trademark inquiries, or dispute arbitration, contact our legal counsel.",
    legalDeskBtn: isHi ? "कानूनी डेस्क से संपर्क करें" : "Contact Legal Desk",
    wasHelpful: isHi ? "क्या ये शर्तें स्पष्ट और समझने योग्य थीं?" : "Were these terms clear & understandable?",
    thankFeedback: isHi ? "आपकी प्रतिक्रिया के लिए धन्यवाद!" : "Thank you for your feedback!",
    yes: isHi ? "हाँ" : "Yes",
    no: isHi ? "नहीं" : "No",
    sections: [
      {
        id: "acceptance",
        num: "01",
        title: isHi ? "1. शर्तों की स्वीकृति और खाता पात्रता" : "1. Acceptance of Terms & Eligibility",
        badge: isHi ? "पात्रता" : "Eligibility",
        content: isHi
          ? `MeraTailor प्लेटफ़ॉर्म (वेबसाइट और मोबाइल सेवाओं) का उपयोग करके आप इन सेवा शर्तों से कानूनी रूप से बाध्य होने की सहमति देते हैं:

• पात्रता: प्लेटफ़ॉर्म का उपयोग करने के लिए आपकी आयु कम से कम 18 वर्ष या कानूनी रूप से सक्षम होनी चाहिए।
• खाता सुरक्षा: आप अपने लॉगिन क्रेडेंशियल्स (Clerk ऑथेंटिकेशन) की गोपनीयता बनाए रखने के लिए पूरी तरह उत्तरदायी हैं।
• सटीक जानकारी: ग्राहक और टेलर दोनों को अपनी प्रोफ़ाइल, संपर्क नंबर और पते की सत्यता सुनिश्चित करनी होगी।`
          : `By accessing or using the MeraTailor platform, web portals, and associated services, you agree to be bound by this Agreement:

• User Capacity: You must be at least 18 years of age or possess legal capacity under the Indian Contract Act, 1872.
• Account Security: You are solely responsible for maintaining authentication credentials and managing measurement vault permissions.
• Accurate Information: Users and artisans agree to provide verifiable profile data, genuine phone numbers, and authentic location coordinates.`,
      },
      {
        id: "orders-quotations",
        num: "02",
        title: isHi ? "2. सिलाई ऑर्डर और पारदर्शी कोटेशन" : "2. Custom Orders & Upfront Quotations",
        badge: isHi ? "कोटेशन और मूल्य" : "Pricing & Quotes",
        content: isHi
          ? `MeraTailor पर ऑर्डर देने की प्रक्रिया निम्नलिखित नियमों के अधीन है:

• पारदर्शी कोटेशन: टेलर द्वारा दिया गया कोटेशन कपड़े की सिलाई, अस्तर (lining), बटन और डिलीवरी का स्पष्ट विवरण प्रस्तुत करता है।
• मूल्य निर्धारण: कोई भी छुपा हुआ सेवा शुल्क नहीं लिया जाता है। सहमति के बाद तय कीमत ही अंतिम होती है।
• विशेष डिजाइन आवश्यकताएं: यदि ग्राहक सिलाई शुरू होने के बाद अतिरिक्त कढ़ाई, लेस या पैटर्न बदलने का अनुरोध करता है, तो टेलर अतिरिक्त शुल्क और समय मांग सकता है।`
          : `Garment commissions placed on MeraTailor adhere to standard custom craftsmanship workflows:

• Itemized Pricing: Tailors provide upfront quotations outlining base stitch fees, lining materials, embellishments, and delivery milestones.
• No Hidden Markups: Pricing agreed upon quotation acceptance is binding. MeraTailor does not impose unexpected service surcharges.
• Design Modifications: Scope modifications requested after workshop intake (e.g., altered necklines, additional embroidery) may incur proportional fee and timeline adjustments.`,
      },
      {
        id: "measurement-fit",
        num: "03",
        title: isHi ? "3. नाप की सटीकता और परफेक्ट फिट गारंटी" : "3. Measurement Accuracy & Fit Guarantee",
        badge: isHi ? "नाप और फिटिंग" : "Fit Guarantee",
        content: isHi
          ? `हमारा लक्ष्य हर ग्राहक को मनपसंद और सटीक फिटिंग उपलब्ध कराना है:

• डिजिटल नाप वॉल्ट: ग्राहक द्वारा वॉल्ट में दर्ज किए गए नाप के आधार पर ही दर्जी कपड़े की कटाई करेगा।
• डोरस्टेप नाप सेवा: यदि ग्राहक ने दर्जी को घर बुलाकर नाप दिलवाया है, तो नाप की सटीकता की पूरी जिम्मेदारी संबंधित दर्जी की होगी।
• निःशुल्क ऑल्टरेशन वारंटी: यदि तैयार परिधान ग्राहक द्वारा दिए गए नाप से 1.5 सेमी से अधिक भिन्न होता है, तो दर्जी 7 दिनों के भीतर बिना किसी अतिरिक्त शुल्क के निःशुल्क ऑल्टरेशन (सिलाई सुधार) प्रदान करेगा।`
          : `We hold master craftsmanship to the highest standards of anatomical precision:

• Stored Vault Dimensions: Tailors construct patterns matching the centimeter dimensions recorded in your active fit vault at the time of order confirmation.
• Doorstep Measurement Visits: When a tailor performs an on-site physical measuring consultation, the artisan assumes full technical responsibility for sizing fidelity.
• Free Alteration Warranty: Should a delivered garment deviate from confirmed vault dimensions by more than 1.5 cm, the tailor will execute a complimentary fit correction within 7 days.`,
      },
      {
        id: "cancellation-refunds",
        num: "04",
        title: isHi ? "4. सिलाई पूर्व निःशुल्क रद्दीकरण और रिफंड" : "4. Pre-Cutting Cancellation & Refunds",
        badge: isHi ? "रद्दीकरण नीति" : "Cancellation",
        content: isHi
          ? `MeraTailor ग्राहकों को लचीलापन और सुरक्षा प्रदान करता है:

• कटाई पूर्व 100% निःशुल्क रद्दीकरण: जब तक दर्जी कपड़े की कटाई (Fabric Cutting) शुरू नहीं करता, ग्राहक कभी भी 1-क्लिक में बिना किसी शुल्क के ऑर्डर रद्द कर सकता है।
• कपड़ा कटने के बाद: एक बार कटाई शुरू होने और स्टेटस 'In Cutting' में जाने के बाद कपड़े के नुकसान के कारण ऑर्डर रद्द नहीं किया जा सकता।
• कपड़ा क्षति या अनुपयुक्तता: यदि टेलर की लापरवाही से ग्राहक का कपड़ा खराब होता है, तो टेलर को कपड़े का उचित मूल्य या प्रतिस्थापन प्रदान करना होगा।`
          : `We provide industry-leading consumer flexibility before physical fabric transformation occurs:

• 100% Free Pre-Production Cancellation: Customers may cancel any commissioned order at zero financial penalty before the workshop logs the 'Cutting' stage.
• Post-Cutting Stage: Once cloth cutting has commenced and fabric is permanently sheared, cancellation is strictly unavailable due to custom bespoke material consumption.
• Fabric Protection: In the rare event of artisan negligence causing fabric damage, the workshop is obligated to provide fair material compensation or replacement.`,
      },
      {
        id: "b2b-bulk",
        num: "05",
        title: isHi ? "5. B2B कॉर्पोरेट और थोक आदेश" : "5. B2B Corporate Procurement & RFQs",
        badge: isHi ? "B2B थोक" : "Bulk Orders",
        content: isHi
          ? `व्यवसायों, स्कूलों और संस्थाओं के लिए थोक परिधान सिलाई के विशेष नियम:

• कोटेशन का दायरा: थोक अनुरोध (RFQs) में न्यूनतम 50 इकाइयों की संख्या, कपड़े का जीएसएम, और बैच डिलीवरी तिथियां स्पष्ट होनी चाहिए।
• नमूना स्वीकृति (Sampling): बड़े पैमाने पर उत्पादन से पहले एक भौतिक मास्टर सैंपल स्वीकृत किया जाना अनिवार्य है।
• डिलीवरी और जीएसटी: सभी B2B लेनदेन के लिए वैध जीएसटी चालान और अनुबंधित आपूर्ति तिथियां लागू होंगी।`
          : `Corporate entities, educational institutions, and uniform buyers procuring bulk garment lots agree to:

• RFQ Specifics: Bulk postings require explicit specifications including batch quantity (50+ units), fabric GSM weight, delivery deadlines, and sizing distribution.
• Master Sample Approval: Large-scale batch cutting begins only after customer written sign-off on a physical prototype sample.
• GST Compliance: All B2B transactions are accompanied by valid tax invoices under Indian GST regulations.`,
      },
      {
        id: "disputes-jurisdiction",
        num: "06",
        title: isHi ? "6. विवाद समाधान और शासी कानून (जयपुर, भारत)" : "6. Dispute Resolution & Jurisdiction",
        badge: isHi ? "शासी कानून" : "Governing Law",
        content: isHi
          ? `यह अनुबंध भारतीय कानून के अनुसार शासित और व्याख्यायित किया जाएगा:

• मध्यस्थता और सौहार्दपूर्ण समाधान: किसी भी विवाद की स्थिति में दोनों पक्ष पहले MeraTailor सहायता डेस्क के माध्यम से सौहार्दपूर्ण समाधान का प्रयास करेंगे।
• अनन्य अधिकार क्षेत्र: यदि कोई विवाद अनसुलझा रहता है, तो उसका अनन्य क्षेत्राधिकार केवल जयपुर, राजस्थान, भारत की अदालतों के पास होगा।
• संपर्क: किसी भी कानूनी नोटिस के लिए legal@meratailor.com पर संपर्क करें।`
          : `This Agreement and any disputes arising hereunder are governed strictly by the laws of India:

• Amicable Resolution: Disputed claims between customers and workshops must first be submitted to MeraTailor Dispute Mediation for resolution within 14 days.
• Exclusive Jurisdiction: All legal proceedings, arbitration, or suits shall fall under the exclusive jurisdiction of the competent courts in Jaipur, Rajasthan, India.
• Formal Notices: Legal communications must be served to legal@meratailor.com or addressed to our corporate office in Jaipur.`,
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
                <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-[#8f2338]">
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
            2. KEY PRINCIPLES HERO GRID
        ========================================================== */}
        <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-stone-100 pb-4 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#8f2338]">
                <Scale size={18} />
              </div>
              <h2 className="font-sans text-lg font-bold text-[#111827]">
                {content.principlesTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {content.principles.map((item, idx) => (
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
            {/* Left Column (8 cols): Structured Terms Sections */}
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
                  © {new Date().getFullYear()} MeraTailor Technologies Private Limited. All Rights Reserved.
                </p>
                <p className="mt-1">
                  Registered Intermediary Platform under the Information Technology Act, 2000 & Consumer Protection (E-Commerce) Rules, 2020.
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

              {/* Legal Desk Contact Card */}
              <div className="rounded-3xl border border-stone-200 bg-[#fdfbf9] p-6 text-xs text-stone-600 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <Building size={16} className="text-[#8f2338]" />
                  <span>{content.legalDeskTitle}</span>
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  {content.legalDeskDesc}
                </p>
                <Link
                  to="/contact"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8f2338] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#761c30] transition"
                >
                  <Mail size={14} />
                  <span>{content.legalDeskBtn}</span>
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
