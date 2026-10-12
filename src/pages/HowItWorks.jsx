import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Ruler,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mic,
  Scissors,
  Building2,
  UserRound,
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  Layers,
  Phone,
  Check,
  FileText,
  Sliders,
  Award,
  Settings,
  Users,
  Database,
  MapPin,
  Star,
  BookOpen,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function HowItWorks() {
  const { i18n } = useTranslation();
  const { isSignedIn, profile, user, openSignUp } = useAuth();
  const isHi = i18n.language === "hi";

  // Current active role
  const currentRole = isSignedIn
    ? profile?.role || user?.publicMetadata?.appRole || "customer"
    : "customer";

  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  // Pure English & Pure Hindi Content with Brossard Design Layout
  const roleData = {
    customer: {
      bgImage: "/assets/hero-atelier.jpg",
      breadcrumb: isHi ? "होम / मार्गदर्शिका / ग्राहक यात्रा" : "Home / How It Works / Customer Journey",
      categoryTag: isHi ? "व्यक्तिगत सिलाई सेवा" : "Bespoke Custom Tailoring",
      updatedDate: isHi ? "अद्यतन: 2026" : "Updated: 2026",
      title: isHi
        ? "MeraTailor पर अपने मनपसंद कपड़े कैसे सिलवाएं"
        : "How to Get Custom Garments Stitched with MeraTailor",
      intro: isHi
        ? "आस-पास के सत्यापित मास्टर टेलर खोजें, अपना नाप डिजिटल वॉल्ट में सुरक्षित करें और घर बैठे परफेक्ट फिट कपड़े प्राप्त करें।"
        : "Find verified master tailors nearby, save body measurements once into your secure digital vault, and receive perfect-fitting garments at your doorstep.",
      primaryCta: {
        label: isHi ? "आस-पास के दर्जी खोजें" : "Find Tailors Nearby",
        link: "/find-tailors",
      },
      secondaryCta: {
        label: isHi ? "नाप वॉल्ट में सेव करें" : "Save Measurements in Vault",
        link: "/dashboard",
      },
      quickPoints: [
        isHi ? "AI वॉइस द्वारा सरल परिधान खोज" : "Bilingual AI voice search powered by Gemini",
        isHi ? "सेंटीमीटर में डिजिटल नाप प्रोफाइल" : "Persistent digital measurement vault in cm",
        isHi ? "सिलाई पूर्व 100% निःशुल्क रद्दीकरण" : "100% free pre-production cancellation guard",
        isHi ? "कारीगर से सीधी फोन बातचीत व सलाह" : "Direct phone connection with the master artisan",
      ],
      roadmapRows: [
        {
          num: "01",
          tag: isHi ? "चरण 1 · खोज और वॉइस" : "Step 1 · Search & Voice",
          title: isHi ? "AI वॉइस और जीपीएस दायरा खोज" : "AI Voice & Geo-Radius Tailor Search",
          desc: isHi
            ? "हिंदी या अंग्रेजी में बोलकर अपनी पसंद बताएं या 5–50 किमी के दायरे में रेटिंग और सत्यापित बैज वाले टेलर देखें।"
            : "Search verified local tailors by custom radius (5–50 km), or speak your request naturally in Hindi or English.",
          actionText: isHi ? "टेलर खोजें" : "Explore Tailors",
          link: "/find-tailors",
        },
        {
          num: "02",
          tag: isHi ? "चरण 2 · नाप प्रोफाइल" : "Step 2 · Measurements",
          title: isHi ? "डिजिटल नाप वॉल्ट में नाप सुरक्षित करें" : "Save Measurements in Digital Vault",
          desc: isHi
            ? "सेंटीमीटर में सीना, कमर, हिप, लंबाई आदि नाप एक बार सुरक्षित रखें या घर बैठे टेलर से नाप लेने का विकल्प चुनें।"
            : "Store your body measurements (Chest, Waist, Hip, Shoulder, Length) once in cm or opt for doorstep measuring.",
          actionText: isHi ? "नाप प्रोफाइल" : "Manage Fit Vault",
          link: "/dashboard",
        },
        {
          num: "03",
          tag: isHi ? "चरण 3 · पारदर्शी कोटेशन" : "Step 3 · Direct Quote",
          title: isHi ? "स्पष्ट और पारदर्शी कोटेशन प्राप्त करें" : "Receive Upfront Itemized Tailor Quotes",
          desc: isHi
            ? "टेलर द्वारा सीधे दी गई स्पष्ट कीमत, कपड़े की सलाह और डिलीवरी का समय बिना किसी बिचौलिए के प्राप्त करें।"
            : "Receive clear, upfront pricing submitted directly by the artisan with fabric guidance and estimated delivery date.",
          actionText: isHi ? "ऑर्डर प्रक्रिया" : "View Quotes",
          link: "/orders",
        },
        {
          num: "04",
          tag: isHi ? "चरण 4 · सिलाई ट्रैकिंग" : "Step 4 · Live Telemetry",
          title: isHi ? "कटाई से तैयार होने तक लाइव ट्रैकिंग" : "Follow Cutting & Stitching in Realtime",
          desc: isHi
            ? "कपड़े की कटाई, सिलाई, इस्त्री और गुणवत्ता जांच की हर स्थिति को वास्तविक समय में ट्रैक करें।"
            : "Follow your garment step-by-step from fabric cutting and needlework to ironing and final quality check.",
          actionText: isHi ? "ऑर्डर स्थिति" : "Track Orders",
          link: "/orders",
        },
        {
          num: "05",
          tag: isHi ? "चरण 5 · डिलीवरी" : "Step 5 · Doorstep Delivery",
          title: isHi ? "डोरस्टेप डिलीवरी और परफेक्ट फिट गारंटी" : "Doorstep Delivery & Guaranteed Fit",
          desc: isHi
            ? "तैयार कपड़े सीधे अपने पते पर पाएं, 100% परफेक्ट फिट गारंटी और कारीगर समीक्षा के साथ।"
            : "Receive your tailored garment ready to wear, backed by our complimentary alteration guarantee and artisan review.",
          actionText: isHi ? "समीक्षा और रेटिंग" : "Review Order",
          link: "/orders",
        },
      ],
      features: [
        {
          title: isHi ? "द्विभाषी AI वॉइस सर्च इंजन" : "Bilingual AI Voice Search Assistant",
          desc: isHi
            ? "Google Gemini द्वारा संचालित, अपनी आवाज में बोलकर कुर्ती, सूट, ब्लाउज आदि के विशेषज्ञ खोजें।"
            : "Speak naturally in Hindi, English, or Hinglish with Google Gemini intent extraction for instant matching.",
          status: isHi ? "सक्रिय" : "Active",
        },
        {
          title: isHi ? "1-टैप निःशुल्क रद्दीकरण सुरक्षा" : "Pre-Production Cancellation Guard",
          desc: isHi
            ? "कपड़े की कटाई शुरू होने से पहले किसी भी समय बिना किसी शुल्क के 1-क्लिक में ऑर्डर रद्द करें।"
            : "Cancel any request before physical cloth cutting commences with zero cancellation fees.",
          status: isHi ? "सुरक्षित" : "Guaranteed",
        },
        {
          title: isHi ? "टेलर से सीधी बातचीत" : "Direct Artisan Phone Calling",
          desc: isHi
            ? "बिना किसी बिचौलिए के सीधे मास्टर टेलर से फोन पर बात करें और डिजाइन व कपड़े की चर्चा करें।"
            : "Call your master tailor directly to discuss fabric texture, lining choices, and custom styling.",
          status: isHi ? "उपलब्ध" : "Available",
        },
        {
          title: isHi ? "सेंटीमीटर डिजिटल नाप वॉल्ट" : "Persistent Reusable Fit Profiles",
          desc: isHi
            ? "एक बार नाप दर्ज करें और भविष्य के हर सिलाई ऑर्डर में बिना दोबारा नाप दिए उपयोग करें।"
            : "Store body measurements once in centimeters to eliminate repetitive manual measuring forever.",
          status: isHi ? "सुरक्षित वॉल्ट" : "Secured",
        },
      ],
      faqs: [
        {
          q: isHi
            ? "AI वॉइस सर्च मेरी सिलाई आवश्यकता कैसे समझता है?"
            : "How does the AI voice assistant understand my tailoring request?",
          a: isHi
            ? "हमारा मॉडल आपकी आवाज से परिधान श्रेणी (जैसे कुर्ती, सूट, शर्ट), पसंदीदा रंग, आवश्यक समय और स्थान का तुरंत विश्लेषण करता है।"
            : "Our Google Gemini pipeline parses natural spoken voice in Hindi, English, and Hinglish to extract garment category, colors, required delivery dates, and search radius automatically.",
        },
        {
          q: isHi
            ? "क्या मैं ऑर्डर रद्द कर सकता हूँ?"
            : "Can I cancel an order if my schedule changes?",
          a: isHi
            ? "हाँ! जब तक ऑर्डर 'कोटेशन प्राप्त' चरण में है और कपड़े की कटाई शुरू नहीं हुई है, आप बिना किसी शुल्क के तुरंत रद्द कर सकते हैं।"
            : "Yes! While an order is in 'Request Sent' or 'Quote Received' stage before physical cloth cutting begins, you can cancel it with 1 tap at zero charge.",
        },
        {
          q: isHi
            ? "यदि मुझे अपना नाप लेना नहीं आता तो क्या करें?"
            : "What if I do not know how to measure myself?",
          a: isHi
            ? "आप ऑर्डर करते समय 'टेलर द्वारा नाप लें' चुन सकते हैं, जिससे कारीगर स्वयं आपका सटीक नाप लेंगे।"
            : "Simply select 'Measure with Tailor' during checkout to have the master tailor take your measurements in person at their workshop or during a doorstep session.",
        },
      ],
    },

    tailor: {
      bgImage: "/assets/hero-atelier.jpg",
      breadcrumb: isHi ? "होम / मार्गदर्शिका / टेलर पार्टनर" : "Home / How It Works / Tailor Partner",
      categoryTag: isHi ? "कारीगर व स्टूडियो सशक्तिकरण" : "Master Atelier & Studio Hub",
      updatedDate: isHi ? "अद्यतन: 2026" : "Updated: 2026",
      title: isHi
        ? "MeraTailor पर अपने टेलर स्टूडियो की कमाई और ग्राहक कैसे बढ़ाएं"
        : "How Tailors Grow Their Studio on MeraTailor",
      intro: isHi
        ? "अपनी दुकान को डिजिटल बनाएं, सत्यापन कराकर खोज में सबसे ऊपर आएं, और B2B थोक ऑर्डर लेकर आमदनी दोगुनी करें।"
        : "Digitize your tailoring workshop, gain verified atelier status to rank at the top of local customer searches, and double your earnings with B2B bulk contracts.",
      primaryCta: {
        label: isHi ? "स्टूडियो डैशबोर्ड खोलें" : "Open Studio Dashboard",
        link: "/dashboard",
      },
      secondaryCta: {
        label: isHi ? "B2B थोक मांग देखें" : "Browse B2B Bulk Demands",
        link: "/bulk",
      },
      quickPoints: [
        isHi ? "सत्यापित टेलर बैज से 5x अधिक ग्राहक" : "Verified Atelier badge for 5x more local search views",
        isHi ? "रिटेल + B2B थोक ऑर्डर की दोहरी आमदनी" : "Dual revenue: retail bespoke orders + B2B bulk contracts",
        isHi ? "पारदर्शी रेट कार्ड और 5-चरणीय पाइपलाइन" : "Public transparent rate card and 5-stage workflow pipeline",
        isHi ? "0% प्लेटफ़ॉर्म कमीशन - 100% कमाई आपकी" : "0% platform commission: keep 100% of your earnings",
      ],
      roadmapRows: [
        {
          num: "01",
          tag: isHi ? "चरण 1 · स्टूडियो सेटअप" : "Step 1 · Workshop Setup",
          title: isHi ? "स्टूडियो प्रोफ़ाइल और रेट कार्ड दर्ज करें" : "Workshop Setup & Public Rate Card",
          desc: isHi
            ? "दुकान का पता, अनुभव के वर्ष, विशेषज्ञता और मानक कीमतें (ब्लाउज, कुर्ता, सूट आदि) दर्ज करें।"
            : "List your workshop location, years of experience, garment specializations, and transparent service rate cards.",
          actionText: isHi ? "प्रोफ़ाइल भरें" : "Setup Studio",
          link: "/dashboard",
        },
        {
          num: "02",
          tag: isHi ? "चरण 2 · सत्यापन" : "Step 2 · Verification",
          title: isHi ? "सत्यापित टेलर बैज (Verified Atelier)" : "Verified Atelier Audit & Search Boost",
          desc: isHi
            ? "सत्यापन के लिए आवेदन करें। एडमिन जांच के बाद आपकी दुकान 'टेलर खोजें' में शीर्ष पर दिखेगी।"
            : "Submit credentials for verification to unlock the verified atelier badge and surge to the top of Find Tailors.",
          actionText: isHi ? "सत्यापन जांचें" : "Apply for Verification",
          link: "/dashboard",
        },
        {
          num: "03",
          tag: isHi ? "चरण 3 · दोहरी आमदनी" : "Step 3 · Dual Revenue",
          title: isHi ? "स्थानीय ऑर्डर और B2B थोक मांग" : "Fulfill Retail Orders & Bid on B2B Demands",
          desc: isHi
            ? "स्थानीय ग्राहकों से सीधे सिलाई ऑर्डर लें और स्कूलों, कंपनियों के बड़े B2B बैच पर बोली लगाएं।"
            : "Fulfill local bespoke orders while bidding on profitable institutional uniform and boutique batch production RFQs.",
          actionText: isHi ? "B2B बोर्ड" : "Explore Bulk Board",
          link: "/bulk",
        },
        {
          num: "04",
          tag: isHi ? "चरण 4 · कार्यप्रवाह" : "Step 4 · Pipeline",
          title: isHi ? "5-चरणीय स्टूडियो कार्यप्रवाह पाइपलाइन" : "5-Stage Studio Production Pipeline",
          desc: isHi
            ? "ऑर्डर का सरल प्रबंधन: पूछताछ → नाप → कटाई व सिलाई → गुणवत्ता जांच → डिलीवरी।"
            : "Organize client orders: Inquiries → Measurements → Cutting & Stitching → Quality Control → Ready.",
          actionText: isHi ? "ऑर्डर पाइपलाइन" : "Manage Orders",
          link: "/orders",
        },
        {
          num: "05",
          tag: isHi ? "चरण 5 · सीधी कमाई" : "Step 5 · Direct Payouts",
          title: isHi ? "100% सीधी कमाई और 5-स्टार साख" : "Direct Client Payouts & 5-Star Reputation",
          desc: isHi
            ? "बिना किसी प्लेटफ़ॉर्म कमीशन के पूरी कमाई रखें और ग्राहकों की 5-स्टार रेटिंग से ब्रांड बनाएं।"
            : "Receive client payments directly with zero platform cuts and collect reviews to build your artisan reputation.",
          actionText: isHi ? "डैशबोर्ड" : "View Earnings",
          link: "/dashboard",
        },
      ],
      features: [
        {
          title: isHi ? "सत्यापित स्टूडियो बैज व सर्च बूस्ट" : "Verified Atelier Badge & Search Ranking",
          desc: isHi
            ? "सत्यापित होने पर 5 गुना अधिक ग्राहक मिलते हैं और शहर की खोज में शीर्ष स्थान मिलता है।"
            : "Verified studios appear prominently at the top of local discovery maps and directory searches.",
          status: isHi ? "शीर्ष रैंकिंग" : "Top Tier",
        },
        {
          title: isHi ? "B2B थोक मांग बोर्ड पर बोली" : "B2B Bulk Job Demands & Bidding",
          desc: isHi
            ? "स्कूलों, कंपनियों और बुटीक के बड़े परिधान निर्माण ऑर्डरों पर अपनी बोली लगाएं।"
            : "Bid on corporate uniform batches and private label manufacturing contracts for year-round capacity.",
          status: isHi ? "खुला है" : "Open Access",
        },
        {
          title: isHi ? "सार्वजनिक डिजिटल रेट कार्ड" : "Public Studio Rate Card Manager",
          desc: isHi
            ? "ब्लाउज, कुर्ता, सूट और अल्टरेशन की कीमतें पारदर्शी रूप से ग्राहकों को दिखाएं।"
            : "Publish starting prices for Suits, Kurtas, Blouses, and Alterations to drive faster customer bookings.",
          status: isHi ? "सक्रिय" : "Active",
        },
        {
          title: isHi ? "0% प्लेटफ़ॉर्म कमीशन" : "100% Commission-Free Craftsmanship",
          desc: isHi
            ? "आपकी मेहनत की पूरी कमाई सीधे आपकी, बिना किसी प्लेटफ़ॉर्म कटौती के।"
            : "Keep every rupee of your retail craftsmanship earnings. MeraTailor charges zero platform commission.",
          status: isHi ? "100% आपकी" : "100% Direct",
        },
      ],
      faqs: [
        {
          q: isHi
            ? "सत्यापित टेलर बैज से मेरी दुकान को क्या लाभ होगा?"
            : "How does the Verified Atelier badge boost my workshop?",
          a: isHi
            ? "सत्यापित टेलर 'टेलर खोजें' मैप और लिस्ट में सबसे ऊपर दिखते हैं और उन्हें B2B थोक ऑर्डरों पर बोली लगाने का विशेष अधिकार मिलता है।"
            : "Verified ateliers receive verified trust badging, rank at the top of customer search, and gain exclusive rights to submit bids on B2B corporate contracts.",
        },
        {
          q: isHi
            ? "B2B थोक ऑर्डरों पर बोली कैसे लगाएं?"
            : "How do I quote on B2B bulk requirements?",
          a: isHi
            ? "डैशबोर्ड या नेवबार में 'B2B थोक मांग' पर जाएं, आवश्यकता की समीक्षा करें और अपनी दरें व समय सीमा भेजें।"
            : "Open the 'B2B Bulk Demands' tab in your dashboard, review open requirements (quantity, target budget, delivery deadline), and submit your competitive quote.",
        },
        {
          q: isHi
            ? "क्या MeraTailor सिलाई पर कोई कमीशन लेता है?"
            : "Does MeraTailor deduct commissions on retail orders?",
          a: isHi
            ? "नहीं! MeraTailor रिटेल टेलर ऑर्डरों पर 0% कमीशन लेता है, जिससे टेलर अपनी पूरी कमाई रख सकें।"
            : "No! MeraTailor charges 0% commission on retail client orders, ensuring artisans receive full compensation for their tailoring skills.",
        },
      ],
    },

    business: {
      bgImage: "/assets/hero-atelier.jpg",
      breadcrumb: isHi ? "होम / मार्गदर्शिका / कॉर्पोरेट सोर्सिंग" : "Home / How It Works / Corporate Sourcing",
      categoryTag: isHi ? "कॉर्पोरेट व संस्थागत परिधान" : "Corporate & Institutional Apparel",
      updatedDate: isHi ? "अद्यतन: 2026" : "Updated: 2026",
      title: isHi
        ? "व्यापारिक व थोक परिधान सोर्सिंग की कार्यप्रणाली"
        : "How Corporate Bulk Apparel Procurement Works",
      intro: isHi
        ? "कॉर्पोरेट यूनिफॉर्म, स्कूल ड्रेस और ब्रांडेड बैच सीधे भारत के सत्यापित टेलर कारखानों से प्रतिस्पर्धी बोलियों पर तैयार करवाएं।"
        : "Source corporate workwear, school uniforms, and private label garment runs directly from vetted manufacturing ateliers across India with milestone tracking and GST invoicing.",
      primaryCta: {
        label: isHi ? "थोक मांग (RFQ) पोस्ट करें" : "Post Bulk Requirement (RFQ)",
        link: "/bulk",
      },
      secondaryCta: {
        label: isHi ? "सक्रिय बैच ट्रैक करें" : "Track Active Batches",
        link: "/bulk",
      },
      quickPoints: [
        isHi ? "50 से 10,000+ पीस तक की थोक निर्माण क्षमता" : "Batch capacity ranging from 50 to 10,000+ pieces",
        isHi ? "सत्यापित कारखानों से प्रतिस्पर्धी थोक बोलियां" : "Competitive proposals from verified industrial workshops",
        isHi ? "थोक सिलाई से पहले अनिवार्य सैंपल अप्रूवल" : "Mandatory pre-production sample approval protocol",
        isHi ? "कॉर्पोरेट टैक्स छूट हेतु पूर्ण GST इनवॉइस" : "Full GST compliant commercial invoices for corporate tax POs",
      ],
      roadmapRows: [
        {
          num: "01",
          tag: isHi ? "चरण 1 · मांग पोस्ट" : "Step 1 · Post Specs",
          title: isHi ? "तकनीकी विवरण और मात्रा पोस्ट करें" : "Post Technical Specs & Quantities",
          desc: isHi
            ? "कपड़े की श्रेणी, मात्रा (50 से 10,000+ पीस), बजट और समय सीमा के साथ आवश्यकता पोस्ट करें।"
            : "Define garment category, volume count (50 - 10,000+ pcs), fabric specs, target budget, and required delivery date.",
          actionText: isHi ? "मांग पोस्ट करें" : "Post RFQ",
          link: "/bulk",
        },
        {
          num: "02",
          tag: isHi ? "चरण 2 · बोलियां" : "Step 2 · Bids",
          title: isHi ? "सत्यापित वर्कशॉप बोलियों की तुलना करें" : "Compare Verified Workshop Proposals",
          desc: isHi
            ? "विभिन्न निर्माण कारखानों से प्रतिस्पर्धी कीमतें और पिछले काम के नमूने देखकर तुलना करें।"
            : "Receive competitive proposals from manufacturing workshops and evaluate past institutional track records.",
          actionText: isHi ? "बोलियां देखें" : "Compare Bids",
          link: "/bulk",
        },
        {
          num: "03",
          tag: isHi ? "चरण 3 · सैंपल" : "Step 3 · Sample Gate",
          title: isHi ? "उत्पादन-पूर्व नमूना (Sample) स्वीकृति" : "Pre-Production Sample Quality Gate",
          desc: isHi
            ? "थोक सिलाई शुरू होने से पहले वास्तविक कपड़े के नमूने की जांच और गुणवत्ता की पुष्टि करें।"
            : "Inspect and approve a physical prototype or pre-production sample before full factory cut-and-sew begins.",
          actionText: isHi ? "सैंपल जांच" : "Sample Gate",
          link: "/bulk",
        },
        {
          num: "04",
          tag: isHi ? "चरण 4 · डिलीवरी" : "Step 4 · Delivery",
          title: isHi ? "समय पर डिलीवरी और GST इनवॉइस" : "Milestone Delivery & GST Invoicing",
          desc: isHi
            ? "सुरक्षित पैकिंग के साथ समय पर डिलीवरी और पूर्ण GST इनवॉइस प्राप्त करें।"
            : "Receive batch-packaged garments at your doorstep on schedule with complete GST compliance commercial invoices.",
          actionText: isHi ? "इनवॉइस ट्रैक करें" : "Track Delivery",
          link: "/bulk",
        },
      ],
      features: [
        {
          title: isHi ? "त्वरित थोक मांग (RFQ) पोस्टिंग" : "Instant B2B RFQ Specification Board",
          desc: isHi
            ? "मात्रा, बजट और समय सीमा के साथ कस्टम कपड़े की आवश्यकता तुरंत पोस्ट करें और बोलियां पाएं।"
            : "Post custom technical garment requirements with piece counts, budget range, fabric requirements, and timeline.",
          status: isHi ? "सक्रिय" : "Active",
        },
        {
          title: isHi ? "सत्यापित विनिर्माण टेलर नेटवर्क" : "Vetted Manufacturing Atelier Network",
          desc: isHi
            ? "औद्योगिक सिलाई मशीनों और बड़े पैमाने पर उत्पादन क्षमता वाले सत्यापित कारखाने।"
            : "Direct access to verified workshops equipped with heavy-duty machinery for high-volume uniform production.",
          status: isHi ? "जांचा गया" : "Verified",
        },
        {
          title: isHi ? "उत्पादन-पूर्व प्रोटोटाइप परीक्षण" : "Pre-Production Sample Quality Gate",
          desc: isHi
            ? "सिलाई और कपड़े की मजबूती की पुष्टि के लिए वास्तविक नमूने की जांच।"
            : "Mandatory sample approval protocol prevents production defects before bulk cut-and-sew commences.",
          status: isHi ? "अनिवार्य" : "Mandatory",
        },
        {
          title: isHi ? "GST प्रमाणित कॉर्पोरेट बिलिंग" : "GST Compliant Invoicing & PO Tracking",
          desc: isHi
            ? "संस्थागत टैक्स छूट और ऑडिट के लिए आधिकारिक GST इनवॉइस।"
            : "Formal commercial invoices, purchase order tracking, and institutional tax compliance for corporate accounting.",
          status: isHi ? "उपलब्ध" : "Compliant",
        },
      ],
      faqs: [
        {
          q: isHi
            ? "थोक ऑर्डर के लिए न्यूनतम मात्रा कितनी होनी चाहिए?"
            : "What is the minimum volume for a B2B bulk order?",
          a: isHi
            ? "बुटीक और डिजाइनर बैच के लिए 20 से 50 पीस, तथा स्कूल व कॉर्पोरेट यूनिफॉर्म के लिए 10,000+ पीस तक ऑर्डर दिए जा सकते हैं।"
            : "Bulk requirements generally start at 20 to 50 pieces for boutique runs, and can scale up to 10,000+ pieces for school uniforms and corporate workwear.",
        },
        {
          q: isHi
            ? "क्या थोक उत्पादन से पहले वास्तविक सैंपल देख सकते हैं?"
            : "Can we review a physical sample before mass production?",
          a: isHi
            ? "हाँ! हमारी प्रक्रिया में थोक सिलाई से पहले अनिवार्य सैंपल अप्रूवल चरण शामिल है।"
            : "Yes! Our 4-step procurement workflow includes a mandatory pre-production sample approval gate before full batch cutting starts.",
        },
        {
          q: isHi
            ? "क्या कॉर्पोरेट GST इनवॉइस मिलता है?"
            : "Are GST tax invoices provided for corporate accounting?",
          a: isHi
            ? "हाँ, सभी कॉर्पोरेट और संस्थागत ऑर्डरों के लिए पूर्ण GST इनवॉइस प्रदान किया जाता है।"
            : "Yes, verified manufacturing ateliers and our procurement operations provide full GST compliant invoices for all corporate orders.",
        },
      ],
    },

    admin: {
      bgImage: "/assets/admin_home/hero_illustration.png",
      breadcrumb: isHi ? "होम / मार्गदर्शिका / प्लेटफ़ॉर्म प्रशासन" : "Home / How It Works / Platform Administration",
      categoryTag: isHi ? "सिस्टम शासन व संचालन" : "Platform Governance & Security",
      updatedDate: isHi ? "अद्यतन: 2026" : "Updated: 2026",
      title: isHi
        ? "MeraTailor प्लेटफ़ॉर्म प्रशासन और नियंत्रण की कार्यप्रणाली"
        : "How MeraTailor Platform Administration Works",
      intro: isHi
        ? "टेलर सत्यापन की जांच, उपयोगकर्ता भूमिकाओं का प्रबंधन और B2B थोक ऑर्डर की निगरानी का केंद्रीय नियंत्रण केंद्र।"
        : "Master command center for reviewing tailor verification audits, managing synchronized user roles with Clerk Auth, and moderating commercial B2B demands.",
      primaryCta: {
        label: isHi ? "एडमिन पोर्टल खोलें" : "Open Admin Portal & Controls",
        link: "/admin",
      },
      secondaryCta: {
        label: isHi ? "B2B थोक मांग की निगरानी करें" : "Moderate Bulk Board",
        link: "/bulk",
      },
      quickPoints: [
        isHi ? "1-क्लिक टेलर सत्यापन स्वीकृति प्रणाली" : "1-Click tailor studio verification approval pipeline",
        isHi ? "Clerk और MongoDB के बीच लाइव सिंक" : "Realtime user identity and permission sync with Clerk Auth",
        isHi ? "इंटरएक्टिव लीफ़लेट मैप निर्देशांक नियंत्रण" : "Interactive Leaflet GPS map coordinates and studio management",
        isHi ? "प्लेटफ़ॉर्म सुरक्षा और B2B स्पैम रोकथाम" : "B2B bulk RFQ moderation and platform security governance",
      ],
      roadmapRows: [
        {
          num: "01",
          tag: isHi ? "चरण 1 · ऑडिट" : "Step 1 · Verification",
          title: isHi ? "टेलर सत्यापन ऑडिट और समीक्षा" : "Tailor Studio Verification Audits",
          desc: isHi
            ? "दुकान के क्रेडेंशियल्स, मैप स्थान की जांच करें और 1-क्लिक में सत्यापित बैज स्वीकृत करें।"
            : "Review workshop credentials, physical workshop photos, and approve verified atelier status in 1-click.",
          actionText: isHi ? "सत्यापन कतार" : "Audit Queue",
          link: "/admin",
        },
        {
          num: "02",
          tag: isHi ? "चरण 2 · भूमिकाएं" : "Step 2 · Roles Sync",
          title: isHi ? "उपयोगकर्ता भूमिका नियंत्रण और Clerk सिंक" : "User Role Governance & Clerk Sync",
          desc: isHi
            ? "ग्राहक, टेलर, व्यापार और एडमिन भूमिकाओं को Clerk और MongoDB के साथ तुरंत अपडेट करें।"
            : "Dynamically assign or revoke roles (Admin, Tailor, Customer, Business) with synchronized Clerk metadata.",
          actionText: isHi ? "उपयोगकर्ता सूची" : "Manage Users",
          link: "/admin",
        },
        {
          num: "03",
          tag: isHi ? "चरण 3 · मैप" : "Step 3 · Coordinates",
          title: isHi ? "स्टूडियो जीपीएस निर्देशांक और निर्देशिका" : "Studio Geolocation & Directory Control",
          desc: isHi
            ? "इंटरएक्टिव लीफ़लेट मैप पर स्टूडियो के सटीक जीपीएस निर्देशांक और श्रेणियां प्रबंधित करें।"
            : "Curate geographical coordinates, categories, and studio metadata on interactive Leaflet maps.",
          actionText: isHi ? "मैप नियंत्रण" : "Edit Map GPS",
          link: "/admin",
        },
        {
          num: "04",
          tag: isHi ? "चरण 4 · सुरक्षा" : "Step 4 · Moderation",
          title: isHi ? "B2B मांग निगरानी और सिस्टम सुरक्षा" : "B2B Demand Moderation & Security",
          desc: isHi
            ? "कॉर्पोरेट पोस्टिंग की जांच करें, स्पैम हटाएं और डेटाबेस की स्थिरता बनाए रखें।"
            : "Inspect corporate RFQs, prevent spam postings, and maintain high standards of platform security.",
          actionText: isHi ? "B2B निगरानी" : "Moderate B2B",
          link: "/bulk",
        },
      ],
      features: [
        {
          title: isHi ? "1-क्लिक टेलर सत्यापन स्वीकृति" : "1-Click Tailor Verification Approvals",
          desc: isHi
            ? "लंबित टेलर आवेदनों को 1-क्लिक में स्वीकृत करें और तुरंत खोज में लाइव करें।"
            : "Inspect workshop details and approve verified atelier badges with instant discovery publishing.",
          status: isHi ? "एडमिन" : "Admin Only",
        },
        {
          title: isHi ? "एकीकृत उपयोगकर्ता निर्देशिका" : "Unified User Directory & Role Assignment",
          desc: isHi
            ? "एडमिन, टेलर, ग्राहक और व्यापार खातों की भूमिकाएं वास्तविक समय में बदलें।"
            : "Dynamically manage synchronized user roles across Customer, Tailor, Business, and Admin.",
          status: isHi ? "सुरक्षित" : "Secured",
        },
        {
          title: isHi ? "इंटरएक्टिव लीफ़लेट मैप निर्देशांक" : "Interactive Leaflet Studio Map Controls",
          desc: isHi
            ? "अक्षांश-देशांतर, अनुभव, प्रारंभिक मूल्य और विशेषज्ञता श्रेणियां संपादित करें।"
            : "Edit tailor coordinates, experience years, starting prices, and specialization tags with live map preview.",
          status: isHi ? "सटीक" : "Precise",
        },
        {
          title: isHi ? "प्लेटफ़ॉर्म स्वास्थ्य और विश्लेषिकी" : "Platform KPIs & Telemetry Analytics",
          desc: isHi
            ? "कुल पंजीकृत उपयोगकर्ता, सत्यापित टेलर और सक्रिय थोक पोस्टिंग की निगरानी करें।"
            : "Real-time oversight over registered user counts, pending audits, and platform activity metrics.",
          status: isHi ? "लाइव" : "Live Health",
        },
      ],
      faqs: [
        {
          q: isHi
            ? "टेलर सत्यापन से ग्राहक खोज पर क्या असर पड़ता है?"
            : "How does tailor verification affect customer discovery?",
          a: isHi
            ? "एडमिन द्वारा स्वीकृत होते ही टेलर का स्टेटस 'Verified' हो जाता है और वह 'टेलर खोजें' निर्देशिका और मानचित्र में तुरंत दिखने लगता है।"
            : "Once an admin approves a workshop in the queue, the tailor's status becomes verified and they immediately surface on Find Tailors.",
        },
        {
          q: isHi
            ? "Clerk के साथ भूमिका सिंक कैसे होता है?"
            : "How does role synchronization work with Clerk?",
          a: isHi
            ? "जब एडमिन उपयोगकर्ता की भूमिका बदलता है, तो डेटा MongoDB और Clerk मेटाडेटा दोनों में तुरंत अपडेट हो जाता है।"
            : "When an admin updates a user role, the change is saved to MongoDB and mirrored in Clerk publicMetadata instantly.",
        },
        {
          q: isHi
            ? "यदि किसी टेलर का मैप मार्कर गलत है तो क्या करें?"
            : "Can admins edit studio coordinates if a map marker is inaccurate?",
          a: isHi
            ? "हाँ! एडमिन निर्देशिका टैब में किसी भी स्टूडियो का सटीक अक्षांश और देशांतर निर्देशांक संपादित कर सकते हैं।"
            : "Yes! Admins can open any tailor studio in the directory controls and update exact latitude and longitude coordinates.",
        },
      ],
    },
  };

  const current = roleData[currentRole] || roleData.customer;

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#111827] selection:bg-[#f59e0b] selection:text-stone-900">
      <Navbar />

      <main className="pb-20">
        {/* =========================================================
            1. BROSSARD-STYLE ARTICLE & HERO HEADER
        ========================================================== */}
        <div className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <Link to="/" className="hover:text-stone-900">MeraTailor</Link>
              <span>/</span>
              <span>{current.breadcrumb}</span>
            </div>

            {/* Category Pill Tag & Updated Date */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                {current.categoryTag}
              </span>
              <span className="rounded-full bg-rose-100/80 px-3 py-1 text-xs font-semibold text-[#8f2338]">
                {current.updatedDate}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl lg:text-5xl leading-tight max-w-4xl">
              {current.title}
            </h1>

            {/* Introductory Paragraph */}
            <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed max-w-3xl">
              {current.intro}
            </p>

            {/* Main Hero Visual Card with High-Visibility Minecraft Cutout Backdrop */}
            <div className="mt-8 relative overflow-hidden rounded-3xl border border-stone-200 bg-stone-900 shadow-md">
              <img
                src={current.bgImage}
                alt={current.title}
                className="h-[320px] sm:h-[440px] w-full object-cover object-center brightness-100 contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20" />
              
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur-md border border-white/20">
                  <Sparkles size={14} className="text-rose-300" />
                  <span>{current.categoryTag}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={current.primaryCta.link}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#8f2338] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#761c30] transition active:scale-95"
                  >
                    <span>{current.primaryCta.label}</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            2. BROSSARD TWO-COLUMN LAYOUT: CONTENT + QUICK GUIDE SIDEBAR
        ========================================================== */}
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Left Column: Step-by-Step Horizontal Action Row Cards */}
            <div className="lg:col-span-8 space-y-8">
              <div>
                <h2 className="font-sans text-2xl font-bold tracking-tight text-[#111827]">
                  {isHi ? "चरणबद्ध कार्यप्रणाली और निर्देश" : "Step-by-Step Execution Journey"}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {isHi ? "नीचे दिए गए चरणों के अनुसार अपनी सिलाई सेवा आसानी से पूरी करें:" : "Follow the structured stages below to complete your custom tailoring journey:"}
                </p>
              </div>

              {/* Horizontal Row Cards with Yellow Arrow Action Buttons */}
              <div className="space-y-4">
                {current.roadmapRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="group flex flex-col justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs transition hover:border-[#8f2338]/40 hover:shadow-md sm:flex-row sm:items-center"
                  >
                    <div className="max-w-lg">
                      <span className="inline-block rounded-md bg-stone-100 px-2.5 py-0.5 text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                        {row.tag}
                      </span>
                      <h3 className="mt-2 text-base sm:text-lg font-bold text-[#111827] group-hover:text-[#8f2338] transition-colors">
                        {row.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-stone-500 leading-relaxed">
                        {row.desc}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <span className="text-xs font-semibold text-stone-500 sm:hidden">{row.actionText}</span>
                      <Link
                        to={row.link}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8f2338] text-white shadow-xs transition group-hover:bg-[#761c30] group-hover:scale-105 active:scale-95"
                        aria-label={row.title}
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Features & Access Capabilities */}
              <div className="pt-6 border-t border-stone-200">
                <h2 className="font-sans text-xl font-bold tracking-tight text-[#111827]">
                  {isHi ? "उपलब्ध मुख्य सुविधाएं" : "Included Features & Capabilities"}
                </h2>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {current.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            ✓ {feat.status}
                          </span>
                        </div>
                        <h4 className="mt-3 font-bold text-[#111827] text-base">
                          {feat.title}
                        </h4>
                        <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Accordion */}
              <div className="pt-6 border-t border-stone-200">
                <h2 className="font-sans text-xl font-bold tracking-tight text-[#111827]">
                  {isHi ? "अक्सर पूछे जाने वाले प्रश्न" : "Frequently Asked Questions"}
                </h2>

                <div className="mt-4 space-y-3">
                  {current.faqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div
                        key={index}
                        className="overflow-hidden rounded-2xl border border-stone-200 bg-white transition shadow-2xs"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                          className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-[#111827] hover:bg-stone-50"
                        >
                          <span className="pr-4">{faq.q}</span>
                          {isOpen ? (
                            <ChevronUp size={16} className="text-[#8f2338] shrink-0" />
                          ) : (
                            <ChevronDown size={16} className="text-stone-400 shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="border-t border-stone-100 bg-stone-50/50 px-5 py-4 text-xs sm:text-sm leading-relaxed text-stone-600">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Guide & Action Panel */}
            <div className="lg:col-span-4 space-y-6">
              {/* Sticky Guide Card */}
              <div className="sticky top-24 space-y-6">
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
                  <h3 className="font-sans text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
                    {isHi ? "त्वरित बिंदु" : "Key Guide Highlights"}
                  </h3>

                  <ul className="mt-4 space-y-3 text-xs text-stone-600">
                    {current.quickPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-5 border-t border-stone-100 space-y-2.5">
                    <Link
                      to={current.primaryCta.link}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8f2338] py-3 text-xs font-bold text-white shadow-xs hover:bg-[#761c30] transition"
                    >
                      <span>{current.primaryCta.label}</span>
                      <ArrowRight size={14} />
                    </Link>

                    <Link
                      to={current.secondaryCta.link}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 transition"
                    >
                      <span>{current.secondaryCta.label}</span>
                    </Link>
                  </div>
                </div>

                {/* Interactive Feedback Widget */}
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs text-center">
                  <p className="text-xs font-bold text-stone-800">
                    {isHi
                      ? "क्या इस पृष्ठ ने आपकी सहायता की?"
                      : "Was this guide helpful to you?"}
                  </p>

                  {feedbackGiven ? (
                    <div className="mt-3 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800">
                      ✓ {isHi ? "आपकी प्रतिक्रिया के लिए धन्यवाद!" : "Thank you for your feedback!"}
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFeedbackGiven("yes")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-bold text-stone-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 transition"
                      >
                        <ThumbsUp size={13} />
                        <span>{isHi ? "हाँ" : "Yes"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFeedbackGiven("no")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-bold text-stone-700 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-800 transition"
                      >
                        <ThumbsDown size={13} />
                        <span>{isHi ? "नहीं" : "No"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
