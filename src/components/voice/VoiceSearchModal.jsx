import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Mic, ArrowRight, X, Sparkles, Loader2, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { parseVoiceRequest } from "../../utils/voiceRequest";
import useGeminiTranscription from "../../hooks/useGeminiTranscription";

/**
 * Dedicated Voice Search Assistant Modal
 * Used uniformly across Home Page and Find Tailors Page.
 * Features:
 * - Live Speech Transcription (SpeechRecognition + MediaRecorder fallback)
 * - Local Parsing + Gemini AI fallback for advanced unmapped clothing categories
 * - Visual live preview of recognized category, garment, color, urgency, radius, and location
 * - One-click submission that auto-applies filters and sorts results
 */
export default function VoiceSearchModal({
  isOpen,
  onClose,
  onApply,
  initialText = "",
}) {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === "hi";

  const [voiceText, setVoiceText] = useState(initialText);
  const [voiceError, setVoiceError] = useState("");
  const [isInferringGemini, setIsInferringGemini] = useState(false);
  const [geminiInferred, setGeminiInferred] = useState(null);

  const {
    startRecording,
    stopRecording,
    cancel: cancelVoice,
    isRecording,
    isTranscribing,
    error: transcriptionError,
  } = useGeminiTranscription((transcript) => {
    setVoiceText(transcript);
  });

  // Reset or initialize when opened
  useEffect(() => {
    if (isOpen) {
      setVoiceText(initialText || "");
      setVoiceError("");
      setGeminiInferred(null);
      // Auto start recording when opened for quick hands-free interaction
      startRecording();
    } else {
      cancelVoice();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
        cancelVoice();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose, cancelVoice]);

  // 1. Local Rule-based Parse
  const localParsed = useMemo(() => {
    return voiceText.trim() ? parseVoiceRequest(voiceText) : null;
  }, [voiceText]);

  // 2. If user finished speaking/typing and category couldn't be detected locally, ask Gemini AI
  useEffect(() => {
    let active = true;
    if (!voiceText.trim() || isRecording || isTranscribing) {
      setGeminiInferred(null);
      return;
    }

    // Only query Gemini if local category wasn't identified
    if (localParsed && !localParsed.category && voiceText.trim().length > 3) {
      setIsInferringGemini(true);
      fetch("/api/voice/understand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: voiceText.trim() }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (active && data && data.category) {
            setGeminiInferred(data);
          }
        })
        .catch((err) => {
          console.warn("Gemini category inference error:", err);
        })
        .finally(() => {
          if (active) setIsInferringGemini(false);
        });
    } else {
      setGeminiInferred(null);
      setIsInferringGemini(false);
    }

    return () => {
      active = false;
    };
  }, [voiceText, isRecording, isTranscribing, localParsed]);

  // Merge local parsed and Gemini inferred results
  const effectiveRequest = useMemo(() => {
    if (!localParsed) return null;
    const merged = { ...localParsed };
    if (!merged.category && geminiInferred?.category) {
      merged.category = geminiInferred.category;
      if (!merged.garment && geminiInferred.garment) {
        merged.garment = geminiInferred.garment;
      }
      if (!merged.color && geminiInferred.color) {
        merged.color = geminiInferred.color;
      }
      if (geminiInferred.location && !merged.location) {
        merged.location = geminiInferred.location;
      }
      if (geminiInferred.suggestedRadiusKm && !merged.radiusKm) {
        merged.radiusKm = geminiInferred.suggestedRadiusKm;
      }
    }
    return merged;
  }, [localParsed, geminiInferred]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!voiceText.trim()) return;

    const finalReq = effectiveRequest || parseVoiceRequest(voiceText);
    onClose();
    cancelVoice();
    if (onApply) {
      onApply(finalReq);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          cancelVoice();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-modal-title"
        className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl transition-all sm:p-6 border border-stone-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-[#8f2338]">
              <Mic size={20} className={isRecording ? "animate-bounce" : ""} />
            </span>
            <div>
              <h2 id="voice-modal-title" className="text-lg font-bold text-stone-900">
                {t("home.voiceTitle", "Voice Atelier Assistant")}
              </h2>
              <p className="text-xs text-stone-500">
                {t("home.voiceAutoLanguage", "Speak in Hindi or English (Auto-detected)")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              cancelVoice();
            }}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Text Input Area */}
        <div className="mt-4">
          <div className="relative">
            <textarea
              id="voice-request-text"
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              rows={3}
              placeholder={
                isHi
                  ? "अपनी पसंद बताएं, जैसे: 'शादी के लिए लाल लहंगा 5 दिन में' या 'राजा पार्क में 2 फॉर्मल शर्ट्स'..."
                  : "Tell us what you need, e.g. 'Red bridal lehenga in 5 days' or '2 formal shirts near Raja Park'..."
              }
              className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50/50 p-3.5 text-sm leading-6 text-stone-900 outline-none transition focus:border-[#8f2338] focus:bg-white focus:ring-2 focus:ring-rose-100"
            />
            {voiceText && (
              <button
                type="button"
                onClick={() => setVoiceText("")}
                className="absolute right-3 top-3 text-xs font-semibold text-stone-400 hover:text-stone-600"
              >
                {t("home.voiceClear", "Clear")}
              </button>
            )}
          </div>
        </div>

        {/* Live Parsed Requirements Preview */}
        {effectiveRequest && effectiveRequest.text && (
          <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600" />
                <span>{t("home.voiceUnderstood", "Understood Requirements:")}</span>
              </span>
              {isInferringGemini ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 animate-pulse">
                  <Loader2 size={11} className="animate-spin" />
                  <span>Gemini AI Analyzing…</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  {geminiInferred?.category ? "✓ Gemini AI Classified" : "✓ AI Ready"}
                </span>
              )}
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {effectiveRequest.category && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#8f2338] shadow-2xs border border-rose-200">
                  📂 {effectiveRequest.category}
                </span>
              )}
              {effectiveRequest.garment && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-stone-800 shadow-2xs border border-stone-200">
                  ✨ {effectiveRequest.garment}
                </span>
              )}
              {effectiveRequest.color && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-stone-800 shadow-2xs border border-stone-200">
                  🎨 {effectiveRequest.color}
                </span>
              )}
              {effectiveRequest.fabric && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-stone-800 shadow-2xs border border-stone-200">
                  🧵 {effectiveRequest.fabric}
                </span>
              )}
              {effectiveRequest.quantity > 1 && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-stone-800 shadow-2xs border border-stone-200">
                  🔢 Qty: {effectiveRequest.quantity}
                </span>
              )}
              {effectiveRequest.deadlineDays && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-2xs border border-amber-200">
                  ⚡ {effectiveRequest.deadlineDays} Day{effectiveRequest.deadlineDays > 1 ? "s" : ""}
                </span>
              )}
              {effectiveRequest.location && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-stone-800 shadow-2xs border border-stone-200">
                  📍 {effectiveRequest.location}
                </span>
              )}
              {effectiveRequest.radiusKm && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-stone-800 shadow-2xs border border-stone-200">
                  🎯 {effectiveRequest.radiusKm} km radius
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Sample Prompts */}
        {!voiceText && (
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-stone-500">
              {t("home.voiceQuickIdeas", "Quick ideas (Hindi / English):")}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {[
                "Red bridal lehenga in 5 days",
                "Jaipur Raja Park me 2 shirts",
                "Urgent blouse alteration today",
                "3-piece formal suit within 10 km",
                "Sherwani for wedding ceremony",
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setVoiceText(sample)}
                  className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-700 transition hover:border-[#8f2338] hover:bg-rose-50 hover:text-[#8f2338]"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {(voiceError || transcriptionError) && (
          <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
            {voiceError || transcriptionError}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            aria-pressed={isRecording}
            className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
              isRecording
                ? "border-rose-300 bg-rose-50 text-rose-800 animate-pulse ring-2 ring-rose-200"
                : "border-stone-200 bg-stone-50 text-[#8f2338] hover:bg-rose-50/50"
            }`}
          >
            <Mic size={17} className={isRecording ? "animate-bounce" : ""} />
            {isRecording
              ? t("home.voiceStop", "Stop Recording")
              : isTranscribing
              ? t("home.voiceTranscribing", "Transcribing…")
              : t("home.voiceSpeak", "Tap to Speak")}
          </button>

          <button
            type="submit"
            disabled={!voiceText.trim() || isRecording || isTranscribing}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#8f2338] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#781c2e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{t("home.voiceContinue", "Apply & Filter")}</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Pulse Recording Indicator */}
        {isRecording && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-rose-50/80 py-2 border border-rose-100">
            <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
            <p aria-live="polite" className="text-xs font-semibold text-rose-700">
              {t("home.voiceRecording", "Listening… speak clearly into your microphone")}
            </p>
          </div>
        )}
      </form>
    </div>,
    document.body
  );
}
