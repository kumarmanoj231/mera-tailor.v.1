import React from "react";
import { createPortal } from "react-dom";

import {
  ArrowRight,
  MapPin,
  Search,
  Mic,
  ShieldCheck,
  Star,
  Navigation,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { parseVoiceRequest } from "../../utils/voiceRequest";
import useGeminiTranscription from "../../hooks/useGeminiTranscription";

import HeroDashboard from "./HeroDashboard";

const HeroSection = ({ onSignUp }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSignedIn, getToken, openSignUp } = useAuth();

  const [location, setLocation] = React.useState(null);
  const [locationLoading, setLocationLoading] = React.useState(false);
  const [locationError, setLocationError] = React.useState("");
  const [voiceOpen, setVoiceOpen] = React.useState(false);
  const [voiceText, setVoiceText] = React.useState("");
  const [voiceError, setVoiceError] = React.useState("");
  const { startRecording, stopRecording, cancel: cancelVoice, isRecording, isTranscribing, error: transcriptionError } = useGeminiTranscription(setVoiceText);

  const [showVoiceHelp, setShowVoiceHelp] = React.useState(false);
  const voiceHelpTimeoutRef = React.useRef(null);

  // Auto-show voice coachmark once for 6 seconds on initial mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowVoiceHelp(true);
      voiceHelpTimeoutRef.current = setTimeout(() => {
        setShowVoiceHelp(false);
      }, 6000);
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (voiceHelpTimeoutRef.current) clearTimeout(voiceHelpTimeoutRef.current);
    };
  }, []);

  const handleVoiceButtonMouseEnter = () => {
    if (voiceHelpTimeoutRef.current) clearTimeout(voiceHelpTimeoutRef.current);
    setShowVoiceHelp(true);
  };

  const handleVoiceButtonMouseLeave = () => {
    voiceHelpTimeoutRef.current = setTimeout(() => {
      setShowVoiceHelp(false);
    }, 3000);
  };

  const closeVoiceAssistant = () => { setVoiceOpen(false); cancelVoice(); };
  React.useEffect(() => {
    if (!voiceOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeVoiceAssistant();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [voiceOpen]);

  const parsedPreview = React.useMemo(() => {
    return voiceText.trim() ? parseVoiceRequest(voiceText) : null;
  }, [voiceText]);

  const continueWithVoiceRequest = (event) => {
    if (event) event.preventDefault();
    const request = parseVoiceRequest(voiceText);
    if (!request.text) return;
    sessionStorage.setItem("meratailor.voice-request", JSON.stringify(request));
    closeVoiceAssistant();

    // Construct rich URL params so FindTailors immediately filters & sorts
    const params = new URLSearchParams();
    params.set("source", "voice");
    if (request.category) params.set("category", request.category);
    if (request.garment) params.set("search", request.garment);
    else if (request.text) params.set("search", request.text);
    if (request.radiusKm) params.set("radius", String(request.radiusKm));
    if (request.location) params.set("area", request.location);

    navigate(`/find-tailors?${params.toString()}`);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t("home.locationNotSupported"));
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Unable to retrieve address");
          }

          const data = await response.json();
          const address = data.address || {};

          setLocation({
            latitude,
            longitude,
            accuracyMeters: position.coords.accuracy,
            address: data.display_name || "",
            pincode:
              address.postcode ||
              t("home.notAvailable"),
            locality:
              address.suburb ||
              address.neighbourhood ||
              address.city_district ||
              address.village ||
              address.town ||
              "",
            city:
              address.city ||
              address.town ||
              address.municipality ||
              address.county ||
              "",
            state: address.state || "",
            country: address.country || "",
          });
        } catch (error) {
          console.error(
            "Reverse geocoding error:",
            error
          );

          setLocationError(
            t("home.locationDetected")
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);

        switch (error.code) {
          case 1:
            setLocationError(
              t("home.locationPermission")
            );
            break;

          case 2:
            setLocationError(
              t("home.locationUnavailable")
            );
            break;

          case 3:
            setLocationError(
              t("home.locationTimeout")
            );
            break;

          default:
            setLocationError(
              t("home.locationError")
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  };

  const saveLocationForSearch = async () => {
    if (!location) return;
    const searchLocationData = {
      latitude: location.latitude,
      longitude: location.longitude,
      label: [location.locality, location.city, location.state].filter(Boolean).join(", "),
    };
    sessionStorage.setItem("meratailor.search-location", JSON.stringify(searchLocationData));

    if (isSignedIn) {
      try {
        const token = await getToken();
        await fetch("/api/me/location", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
            label: searchLocationData.label,
            source: "browser",
            accuracyMeters: location.accuracyMeters,
            consent: true,
          }),
        });
      } catch {
        // Continue to search even if backend sync fails
      }
    }
    navigate("/find-tailors");
  };

  return (
    <section className="relative isolate overflow-hidden border-b border-[#eadfd4] bg-[#f8efe3]">
      {/* Background */}
      <div className="absolute inset-0 -z-20">
        <img
          src="/assets/hero-background.png"
          alt=""
          className="
            h-full
            w-full
            object-cover
            object-[68%_center]
            sm:object-[65%_center]
            lg:object-center
          "
        />
      </div>

      {/* Readability overlay */}
      <div
        className="
          absolute
          inset-0
          -z-10
          bg-[linear-gradient(90deg,rgba(255,250,244,.97)_0%,rgba(255,250,244,.90)_34%,rgba(255,250,244,.55)_58%,rgba(255,250,244,.12)_100%)]
          sm:bg-[linear-gradient(90deg,rgba(255,250,244,.96)_0%,rgba(255,250,244,.82)_38%,rgba(255,250,244,.28)_72%,rgba(255,250,244,.04)_100%)]
        "
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#6c3826]/15 via-transparent to-transparent" />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div
          className="
            flex
            min-h-[760px]
            flex-col
            items-center
            justify-center
            gap-8
            py-10

            sm:min-h-[800px]
            sm:gap-10

            lg:min-h-[700px]
            lg:flex-row
            lg:items-center
            lg:justify-center
            lg:gap-8
            lg:py-12

            xl:gap-14
          "
        >
          {/* LEFT */}
          <div
            className="
              relative
              z-20
              flex
              w-full
              max-w-[650px]
              flex-col
              items-center
              text-center

              lg:max-w-[590px]
              lg:items-start
              lg:text-left
            "
          >
            {/* Location */}
            <button
              type="button"
              onClick={detectLocation}
              disabled={locationLoading}
              className="
                inline-flex
                max-w-full
                items-center
                gap-2
                rounded-full
                border
                border-[#e6d5c2]
                bg-white/92
                px-3.5
                py-2
                text-[clamp(.68rem,1.4vw,.78rem)]
                font-semibold
                text-[#7f293b]
                shadow-[0_5px_18px_rgba(70,45,30,0.08)]
                transition
                hover:bg-white
                disabled:cursor-wait
                disabled:opacity-70
              "
            >
              <MapPin
                size={14}
                strokeWidth={2.5}
                className="shrink-0"
              />

              <span>
                {locationLoading
                  ? t("home.detectingLocation")
                  : t("home.location")}
              </span>
            </button>

            {/* Brand */}
            <h1
              className="
                mt-5
                w-full
                font-serif
                text-[clamp(3.15rem,10vw,6.25rem)]
                font-semibold
                leading-[0.88]
                tracking-[-0.055em]
                text-[#10182d]

                sm:mt-6

                lg:text-[clamp(4rem,6vw,5.9rem)]
              "
            >
              <span className="block">
                {t("home.brand")}
              </span>
            </h1>

            {/* Tagline */}
            <h2
              className="
                mt-5
                max-w-[620px]
                font-serif
                text-[clamp(1.25rem,3.5vw,2rem)]
                font-semibold
                leading-[1.12]
                tracking-[-0.025em]
                text-[#825326]
              "
            >
              {t("home.tagline")}
            </h2>

            {/* Description */}
            <p
              className="
                mx-auto
                mt-4
                max-w-[560px]
                text-[clamp(.84rem,1.8vw,.98rem)]
                leading-6
                text-[#4f5667]

                sm:leading-7

                lg:mx-0
              "
            >
              {t("home.description")}
            </p>

            {/* CTA */}
            <div
              className="
                mt-7
                flex
                w-full
                max-w-[560px]
                flex-col
                gap-3

                sm:flex-row
                sm:justify-center

                lg:justify-start
              "
            >
              <Link
                to="/find-tailors"
                className="
                  group
                  inline-flex
                  min-h-12
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#8f2338]
                  px-5
                  text-[clamp(.78rem,1.7vw,.88rem)]
                  font-bold
                  text-white
                  shadow-[0_10px_25px_rgba(143,35,56,0.22)]
                  transition
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-[#761c30]
                "
              >
                <Search size={17} />

                {t("home.findTailors")}

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => { setVoiceOpen(true); setVoiceError(""); setShowVoiceHelp(false); }}
                  onMouseEnter={handleVoiceButtonMouseEnter}
                  onMouseLeave={handleVoiceButtonMouseLeave}
                  className="
                    inline-flex
                    min-h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-[#ded5cc]
                    bg-white/95
                    px-5
                    text-[clamp(.78rem,1.7vw,.88rem)]
                    font-bold
                    text-[#252b3a]
                    shadow-[0_6px_18px_rgba(60,45,35,0.08)]
                    transition
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-white
                  "
                >
                  <Mic
                    size={17}
                    className="text-[#8f2338]"
                  />

                  {t("home.tellUsNeed")}
                </button>

                {/* Floating Coachmark Tooltip / Hover Modal */}
                {showVoiceHelp && (
                  <div
                    role="tooltip"
                    className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 w-72 rounded-2xl bg-[#1e293b] text-white p-3 shadow-xl border border-slate-700/60 text-xs animate-in fade-in zoom-in-95 duration-200"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                        <span>AI Voice Assistant</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowVoiceHelp(false); }}
                        className="text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] leading-tight text-slate-200">
                      Speak in <strong>Hindi or English</strong> — e.g. <em>"Red bridal lehenga in 5 days"</em> or <em>"2 shirts Raja Park"</em>!
                    </p>
                    {/* Tooltip triangle pointer */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#1e293b] border-r border-b border-slate-700/60" />
                  </div>
                )}
              </div>
            </div>

            {/* Trust */}
            <div
              className="
                mt-6
                flex
                w-full
                flex-wrap
                items-center
                justify-center
                gap-x-5
                gap-y-3
                text-[clamp(.68rem,1.5vw,.78rem)]
                text-[#5d6270]

                lg:justify-start
              "
            >
              <span className="inline-flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="shrink-0 text-[#8f2338]"
                />

                {t("home.verifiedTailors")}
              </span>

              <span className="hidden h-4 w-px bg-[#ddd4ca] sm:block" />

              <span className="inline-flex items-center gap-2">
                <Star
                  size={15}
                  fill="currentColor"
                  className="shrink-0 text-[#d28b24]"
                />

                {t("home.rating")}
              </span>
            </div>

            {/* Location result */}
            {location && (
              <div
                className="
                  mx-auto
                  mt-5
                  inline-flex
                  max-w-full
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-[#e5d8cb]
                  bg-white/95
                  px-3.5
                  py-2.5
                  text-left
                  text-[clamp(.68rem,1.4vw,.76rem)]
                  text-[#625d59]
                  shadow-sm

                  lg:mx-0
                "
              >
                <Navigation
                  size={14}
                  className="shrink-0 text-[#8f2338]"
                />

                <div className="min-w-0">
                  <p className="font-semibold text-[#322a27]">
                    {location.locality ||
                      location.city ||
                      location.address}
                  </p>

                  {location.pincode && (
                  <p className="mt-0.5 text-[#85807b]">
                      {location.pincode}
                    </p>
                  )}
                </div>
                <button type="button" onClick={saveLocationForSearch} className="ml-2 shrink-0 rounded-lg bg-[#8f2338] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#781c2e]" aria-label="Search Near This Location">
                  {t("home.findTailors") || "Find Tailors"} →
                </button>
              </div>
            )}

            {locationError && (
              <p className="mt-3 text-[clamp(.68rem,1.4vw,.76rem)] font-medium text-[#8f2338]">
                {locationError}
              </p>
            )}
          </div>

          {/* RIGHT */}
          <div
            className="
              relative
              z-20
              flex
              w-full
              max-w-[500px]
              items-center
              justify-center
              lg:max-w-[470px]
              xl:max-w-[490px]
            "
          >
            <HeroDashboard
              isSignedIn={isSignedIn}
              onSignUp={onSignUp}
            />
          </div>
        </div>
      </div>
      {voiceOpen && createPortal((
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs" onMouseDown={(event) => { if (event.target === event.currentTarget) closeVoiceAssistant(); }}>
          <form onSubmit={continueWithVoiceRequest} role="dialog" aria-modal="true" aria-labelledby="voice-request-title" className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl transition-all sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Mic size={18} />
                </span>
                <div>
                  <h2 id="voice-request-title" className="text-lg font-bold text-slate-900">{t("home.voiceTitle")}</h2>
                  <p className="text-xs text-slate-500">{t("home.voiceAutoLanguage")}</p>
                </div>
              </div>
              <button type="button" onClick={closeVoiceAssistant} aria-label={t("home.voiceClose")} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700">×</button>
            </div>

            <div className="mt-4">
              <label className="sr-only" htmlFor="voice-request-text">{t("home.voiceRequestLabel")}</label>
              <div className="relative">
                <textarea
                  id="voice-request-text"
                  value={voiceText}
                  onChange={(event) => setVoiceText(event.target.value)}
                  rows={3}
                  placeholder={t("home.voicePlaceholder")}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#8f2338] focus:bg-white focus:ring-2 focus:ring-rose-100"
                />
                {voiceText && (
                  <button
                    type="button"
                    onClick={() => setVoiceText("")}
                    className="absolute right-3 top-3 text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    {t("home.voiceClear", "Clear")}
                  </button>
                )}
              </div>
            </div>

            {/* Live Parsed Requirements Preview */}
            {parsedPreview && parsedPreview.text && (
              <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    {t("home.voiceUnderstood", "Understood Requirements:")}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    {t("home.voiceAiReady", "✓ AI Ready")}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {parsedPreview.garment && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs border border-emerald-200/60">
                      ✨ {parsedPreview.garment}
                    </span>
                  )}
                  {parsedPreview.category && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs border border-emerald-200/60">
                      📂 {parsedPreview.category}
                    </span>
                  )}
                  {parsedPreview.color && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs border border-emerald-200/60">
                      🎨 {parsedPreview.color}
                    </span>
                  )}
                  {parsedPreview.fabric && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs border border-emerald-200/60">
                      🧵 {parsedPreview.fabric}
                    </span>
                  )}
                  {parsedPreview.quantity > 1 && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs border border-emerald-200/60">
                      🔢 Qty: {parsedPreview.quantity}
                    </span>
                  )}
                  {parsedPreview.deadlineDays && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-xs border border-emerald-200/60">
                      ⚡ {parsedPreview.deadlineDays} Day{parsedPreview.deadlineDays > 1 ? "s" : ""}
                    </span>
                  )}
                  {parsedPreview.location && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs border border-emerald-200/60">
                      📍 {parsedPreview.location}
                    </span>
                  )}
                  {parsedPreview.radiusKm && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs border border-emerald-200/60">
                      🎯 {parsedPreview.radiusKm} km radius
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quick sample prompt chips if input is empty */}
            {!voiceText && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-slate-500">
                  {t("home.voiceQuickIdeas", "Quick ideas (Hindi / English):")}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {[
                    "Red bridal lehenga in 5 days",
                    "Jaipur Raja Park me 2 shirts",
                    "Urgent blouse alteration today",
                    "3-piece formal suit within 10 km",
                  ].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setVoiceText(sample)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:border-[#8f2338] hover:bg-rose-50 hover:text-[#8f2338]"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(voiceError || transcriptionError) && (
              <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-800">
                {voiceError || transcriptionError}
              </p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                aria-pressed={isRecording}
                className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                  isRecording
                    ? "border-rose-300 bg-rose-50 text-rose-800 animate-pulse ring-2 ring-rose-200"
                    : "border-slate-200 bg-slate-50 text-[#8f2338] hover:bg-rose-50/50"
                }`}
              >
                <Mic size={17} className={isRecording ? "animate-bounce" : ""} />
                {isRecording ? t("home.voiceStop") : isTranscribing ? t("home.voiceTranscribing") : t("home.voiceSpeak")}
              </button>
              <button
                type="submit"
                disabled={!voiceText.trim() || isRecording || isTranscribing}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#8f2338] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#781c2e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{t("home.voiceContinue")}</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {isRecording && (
              <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-rose-50/80 py-2">
                <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                <p aria-live="polite" className="text-xs font-semibold text-rose-700">
                  {t("home.voiceRecording")}
                </p>
              </div>
            )}

            <details className="mt-3 text-[11px] text-slate-400">
              <summary className="cursor-pointer hover:text-slate-600">{t("home.voicePrivacyShort")}</summary>
              <p className="mt-1 leading-4 text-slate-500">{t("home.voicePrivacy")}</p>
            </details>
          </form>
        </div>
      ), document.body)}
    </section>
  );
};

export default HeroSection;
