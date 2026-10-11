import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Layers,
  PlusCircle,
  CheckCircle2,
  ShieldCheck,
  Clock3,
  ArrowRight,
  FileSpreadsheet,
  Users,
  Award,
  Sparkles,
  PackageCheck,
  ChevronRight,
  Shirt,
  Briefcase,
  GraduationCap,
  Utensils,
  Stethoscope,
  HardHat,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

export default function BusinessHomeSection() {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === "hi";
  const { profile, user, getToken } = useAuth();
  const [myBulkOrders, setMyBulkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadBusinessData() {
      try {
        const token = await getToken();
        if (!token) {
          if (isMounted) setLoading(false);
          return;
        }

        const res = await fetch("/api/bulk-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.bulkOrders || data.requests || [];
          if (isMounted) setMyBulkOrders(list);
        }
      } catch (err) {
        console.warn("Error loading business home data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBusinessData();
    return () => {
      isMounted = false;
    };
  }, [getToken]);

  const businessName =
    profile?.businessProfile?.companyName ||
    profile?.businessName ||
    profile?.name ||
    user?.firstName ||
    (isHi ? "बिजनेस पार्टनर" : "Enterprise Partner");

  const bulkCategories = [
    {
      icon: <Briefcase size={22} className="text-blue-700" />,
      title: isHi ? "कॉर्पोरेट व ऑफिस यूनिफॉर्म" : "Corporate & Office Uniforms",
      desc: isHi ? "एग्जीक्यूटिव शर्ट, ट्राउज़र, ब्लेज़र और ब्रांडेड स्टाफ परिधान।" : "Executive shirts, trousers, custom blazers, and branded staff apparel.",
      tag: "50 - 5000+ pcs",
    },
    {
      icon: <GraduationCap size={22} className="text-emerald-700" />,
      title: isHi ? "स्कूल व कॉलेज यूनिफॉर्म" : "School & University Uniforms",
      desc: isHi ? "टिकाऊ सूती शर्ट, स्कर्ट, पिनाफोर, टाई, ब्लेज़र और स्पोर्ट्स किट।" : "Durable cotton shirts, skirts, pinafores, ties, blazers, and sports kits.",
      tag: "100 - 10,000+ pcs",
    },
    {
      icon: <Utensils size={22} className="text-amber-700" />,
      title: isHi ? "होटल व रेस्टोरेंट स्टाफ" : "Hospitality & Restaurant Staff",
      desc: isHi ? "शेफ जैकेट, एप्रन सेट, फ्रंट-डेस्क वास्कट और हाउसकीपिंग ड्रेस।" : "Chef jackets, apron sets, front-desk waistcoats, and housekeeping wear.",
      tag: "30 - 2000+ pcs",
    },
    {
      icon: <Stethoscope size={22} className="text-rose-700" />,
      title: isHi ? "हेल्थकेयर स्क्रब व लैब कोट" : "Healthcare Scrubs & Lab Coats",
      desc: isHi ? "एंटीमाइक्रोबियल डॉक्टर कोट, नर्स स्क्रब, रोगी गाउन और सर्जिकल ड्रेप।" : "Antimicrobial doctor coats, nurse scrubs, patient gowns, and surgical drapes.",
      tag: "50 - 3000+ pcs",
    },
    {
      icon: <HardHat size={22} className="text-orange-700" />,
      title: isHi ? "औद्योगिक सुरक्षा वर्कवियर" : "Industrial & Safety Workwear",
      desc: isHi ? "हाई-विजिबिलिटी बॉयलर सूट, सुरक्षा जैकेट, हेवी-ड्यूटी वर्क पैंट।" : "High-visibility boiler suits, safety jackets, heavy-duty work pants.",
      tag: "50 - 5000+ pcs",
    },
    {
      icon: <Shirt size={22} className="text-purple-700" />,
      title: isHi ? "बुटीक व प्राइवेट लेबल रन" : "Boutiques & Private Label Runs",
      desc: isHi ? "सटीक पैटर्न मेकिंग और फिनिशिंग के साथ छोटे डिजाइनर बैच।" : "Designer collection small batches with precise pattern making & finishing.",
      tag: "20 - 500+ pcs",
    },
  ];

  return (
    <div className="space-y-8 pb-16 pt-2">
      {/* =========================================================
          BROSSARD TOP BREADCRUMB NAVIGATION
      ========================================================== */}
      <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
        <Link to="/" className="hover:text-stone-900">MeraTailor</Link>
        <span>/</span>
        <span>{isHi ? "बिजनेस प्रोक्योरमेंट" : "Enterprise Procurement"}</span>
        <span>/</span>
        <span className="font-semibold text-stone-800">
          {isHi ? "थोक व बल्क हब" : "Bulk Manufacturing Hub"}
        </span>
      </div>

      {/* =========================================================
          1. BUSINESS PROCUREMENT HERO BANNER (BROSSARD THEME)
      ========================================================== */}
      <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-900">
                <Building2 size={14} className="text-blue-700" />
                <span>{isHi ? "बिजनेस खाता · कॉर्पोरेट प्रोक्योरमेंट हब" : "Enterprise Account · B2B Procurement Hub"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>{isHi ? "100% सत्यापित कार्यशाला नेटवर्क" : "100% Vetted Atelier Network"}</span>
              </span>
            </div>

            <h1 className="mt-3.5 font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#111827]">
              {isHi ? `स्वागत है, ${businessName}` : `Welcome, ${businessName}`}
            </h1>

            <p className="mt-1.5 text-xs sm:text-sm text-stone-600 max-w-2xl">
              {isHi
                ? "कॉर्पोरेट यूनिफॉर्म, शैक्षणिक परिधान और बुटीक गारमेंट बैच सीधे भारत भर की सत्यापित निर्माण कार्यशालाओं से पारदर्शी कोटेशन और माइलस्टोन ट्रैकिंग के साथ तैयार करवाएं।"
                : "Source bulk corporate uniforms, educational attire, and private-label garment batches directly from verified manufacturing ateliers across India with transparent bidding and milestone tracking."}
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/bulk"
                className="inline-flex items-center gap-2 rounded-xl bg-[#8f2338] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_4px_14px_rgba(143,35,56,0.22)] transition hover:bg-[#761c30] active:scale-95"
              >
                <PlusCircle size={16} />
                <span>{isHi ? "बल्क मांग पोस्ट करें (RFQ)" : "Post Bulk Requirement (RFQ)"}</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/bulk"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-stone-800 shadow-2xs transition hover:bg-stone-50 active:scale-95"
              >
                <Layers size={16} className="text-blue-700" />
                <span>{isHi ? "सक्रिय बैच ऑर्डर ट्रैक करें" : "Track Batch Orders"}</span>
              </Link>

              <Link
                to="/tailors"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-stone-800 shadow-2xs transition hover:bg-stone-50 active:scale-95"
              >
                <Users size={16} className="text-[#8f2338]" />
                <span>{isHi ? "निर्माता कार्यशालाएं देखें" : "Browse Manufacturing Ateliers"}</span>
              </Link>
            </div>
          </div>

          {/* Quick Procurement Snapshot Card */}
          <div className="w-full lg:max-w-xs shrink-0 rounded-2xl border border-stone-200 bg-[#fdfbf9] p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {isHi ? "B2B अवलोकन" : "Procurement Snapshot"}
              </span>
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                Enterprise
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">{isHi ? "सत्यापित कार्यशालाएं:" : "Vetted Ateliers:"}</span>
                <span className="font-bold text-emerald-700">100% Verified</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500">{isHi ? "जीएसटी इनवॉइसिंग:" : "GST Invoicing:"}</span>
                <span className="font-bold text-stone-900">{isHi ? "मानक अनुपालन" : "Included"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500">{isHi ? "सैंपल अनुमोदन:" : "Sample Review:"}</span>
                <span className="font-bold text-[#8f2338]">{isHi ? "उत्पादन से पहले" : "Pre-Production"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500">{isHi ? "सक्रिय पोस्टिंग:" : "Active RFQs:"}</span>
                <span className="font-extrabold text-stone-900">{myBulkOrders.length} RFQs</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200/80">
              <Link
                to="/bulk"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#8f2338] py-2 text-xs font-bold text-white hover:bg-[#761c30] transition shadow-xs"
              >
                <FileSpreadsheet size={14} />
                <span>{isHi ? "कॉर्पोरेट ऑर्डर प्रबंधित करें" : "Manage Bulk Orders"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Metrics Strip (Brossard 4-Card Grid) */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-stone-100 pt-5 sm:grid-cols-4">
          <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 transition hover:border-[#8f2338]/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">01</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {isHi ? "सक्रिय RFQ" : "Active RFQs"}
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-stone-900">{myBulkOrders.length}</p>
            <p className="mt-0.5 text-[11px] text-stone-500">
              {isHi ? "लाइव कॉर्पोरेट मांगें" : "Live batch postings"}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 transition hover:border-[#8f2338]/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">02</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {isHi ? "नेटवर्क कवरेज" : "Verified Hub"}
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-700">100%</p>
            <p className="mt-0.5 text-[11px] text-stone-500">
              {isHi ? "सत्यापित उत्पादक दर्जी" : "Vetted manufacturing tailors"}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 transition hover:border-[#8f2338]/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#8f2338] bg-rose-100 px-1.5 py-0.5 rounded">03</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {isHi ? "सैंपल गेटवे" : "Prototypes"}
              </span>
            </div>
            <p className="mt-2 text-lg font-extrabold truncate text-stone-900">
              {isHi ? "प्री-प्रोडक्शन" : "Pre-Approval"}
            </p>
            <p className="mt-0.5 text-[11px] text-stone-500">
              {isHi ? "पूर्ण बैच से पहले नमूना जांच" : "Sample review before cut"}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-4 transition hover:border-[#8f2338]/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">04</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {isHi ? "अनुपालन" : "GST Invoice"}
              </span>
            </div>
            <p className="mt-2 text-lg font-extrabold truncate text-stone-900">
              {isHi ? "100% इनवॉइसिंग" : "Compliance"}
            </p>
            <p className="mt-0.5 text-[11px] text-stone-500">
              {isHi ? "कॉर्पोरेट बिलिंग सपोर्ट" : "B2B accounting ready"}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. HOW BULK PROCUREMENT WORKS (4-STEP B2B WORKFLOW)
      ====================================================== */}
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-900">
            <Sparkles size={13} className="text-blue-700" />
            <span>{isHi ? "संरचित सोर्सिंग प्रक्रिया" : "Structured Sourcing Process"}</span>
          </div>
          <h2 className="mt-2 font-sans text-xl sm:text-2xl font-bold text-stone-900">
            {isHi ? "कॉर्पोरेट बैच सोर्सिंग कैसे काम करती है" : "How Corporate Batch Sourcing Works"}
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            {isHi
              ? "RFQ विनिर्देशों से लेकर अंतिम गुणवत्ता जांच और डिलीवरी तक।"
              : "From initial RFQ specification to final doorstep delivery with strict quality gates."}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-5 transition hover:border-[#8f2338]/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-800 font-bold text-xs">
              01
            </div>
            <h3 className="mt-3 font-bold text-stone-900 text-sm">
              {isHi ? "विनिर्देश व मात्रा पोस्ट करें" : "Post Specs & Quantity"}
            </h3>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              {isHi ? "परिधान प्रकार, पीस संख्या, कपड़ा विनिर्देश, बजट और डिलीवरी समय सीमा बताएं।" : "Specify garment category, piece count, fabric specifications, target budget, and required timeline."}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-5 transition hover:border-[#8f2338]/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-[#8f2338] font-bold text-xs">
              02
            </div>
            <h3 className="mt-3 font-bold text-stone-900 text-sm">
              {isHi ? "दर्जी बोलियों की तुलना करें" : "Compare Atelier Bids"}
            </h3>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              {isHi ? "सत्यापित कार्यशालाओं से प्रतिस्पर्धी कोटेशन प्राप्त करें और उनके पिछले काम की समीक्षा करें।" : "Receive competitive quotes from verified manufacturing workshops and review their past institutional work."}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-5 transition hover:border-[#8f2338]/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-800 font-bold text-xs">
              03
            </div>
            <h3 className="mt-3 font-bold text-stone-900 text-sm">
              {isHi ? "सैंपल गुणवत्ता अनुमोदन" : "Sample Quality Review"}
            </h3>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              {isHi ? "पूर्ण पैमाने पर सिलाई शुरू होने से पहले भौतिक प्रोटोटाइप या प्री-प्रोडक्शन सैंपल की पुष्टि करें।" : "Approve a physical prototype or pre-production sample before full factory cut-and-sew begins."}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-[#fdfbf9] p-5 transition hover:border-[#8f2338]/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
              04
            </div>
            <h3 className="mt-3 font-bold text-stone-900 text-sm">
              {isHi ? "डिलीवरी व जीएसटी बिलिंग" : "Delivery & GST Invoicing"}
            </h3>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              {isHi ? "पूर्ण जीएसटी अनुपालन इनवॉइस के साथ अपने कॉर्पोरेट पते पर पैकेज्ड कपड़े प्राप्त करें।" : "Receive batch packaged garments at your corporate doorstep with complete GST compliance invoices."}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          3. BULK CATEGORIES GRID
      ====================================================== */}
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-sans text-xl sm:text-2xl font-bold text-stone-900">
              {isHi ? "संस्थागत परिधान श्रेणियां" : "Institutional Garment Categories"}
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              {isHi ? "अनुभवी उत्पादन दर्जियों द्वारा निर्मित बड़े पैमाने के परिधान।" : "High-capacity production tailoring tailored for corporate, healthcare, and educational needs."}
            </p>
          </div>

          <Link
            to="/bulk"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#8f2338] px-4 py-2 text-xs font-bold text-white hover:bg-[#761c30] transition shadow-xs"
          >
            <span>{isHi ? "आवश्यकता पोस्ट करें" : "Post Requirement"}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bulkCategories.map((cat, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-[#fdfbf9] p-5 transition hover:border-[#8f2338]/40 hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-stone-200 shadow-2xs">
                    {cat.icon}
                  </div>
                  <span className="rounded-full bg-white border border-stone-200 px-2.5 py-0.5 text-[10px] font-bold text-stone-700">
                    {cat.tag}
                  </span>
                </div>

                <h3 className="mt-4 font-bold text-stone-900 text-sm">
                  {cat.title}
                </h3>
                <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80">
                <Link
                  to="/bulk"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#8f2338] hover:text-[#761c30]"
                >
                  <span>{isHi ? "कोटेशन प्राप्त करें →" : "Request Quotes →"}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
