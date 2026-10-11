import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const MAX_RECORDING_MS = 30_000;

export default function useGeminiTranscription(onTranscript) {
  const { t, i18n } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState("");

  const recorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const discardRef = useRef(false);
  const startGenerationRef = useRef(0);
  const transcriptCallbackRef = useRef(onTranscript);
  transcriptCallbackRef.current = onTranscript;

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const cancel = useCallback(() => {
    startGenerationRef.current += 1;
    discardRef.current = true;
    abortRef.current?.abort();
    abortRef.current = null;
    stopRecording();
    releaseStream();
    setIsRecording(false);
    setIsTranscribing(false);
  }, [releaseStream, stopRecording]);

  const startRecording = useCallback(async () => {
    setError("");
    discardRef.current = false;
    const startGeneration = ++startGenerationRef.current;

    // Check if browser has Web Speech Recognition (fastest, built-in, native audio pipeline)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = i18n.language === "hi" ? "hi-IN" : "en-IN";

        let capturedText = "";

        recognition.onstart = () => {
          if (startGeneration !== startGenerationRef.current) {
            recognition.stop();
            return;
          }
          setIsRecording(true);
        };

        recognition.onresult = (event) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            capturedText = currentTranscript.trim();
            transcriptCallbackRef.current?.(capturedText);
          }
        };

        recognition.onerror = async (speechError) => {
          console.warn("SpeechRecognition notice:", speechError.error);
          if (speechError.error === "not-allowed" || speechError.error === "service-not-allowed") {
            setIsRecording(false);
            setError(
              i18n.language === "hi"
                ? "माइक्रोफ़ोन बंद है। कृपया ब्राउज़र या Windows सेटिंग (Privacy & Security → Microphone) में माइक्रोफ़ोन चालू करें।"
                : "Microphone is blocked. Please allow microphone access in your browser address bar or Windows Settings (Privacy & Security → Microphone)."
            );
            return;
          }
          if (speechError.error === "no-speech") {
            return;
          }
          // Fallback to MediaRecorder + Gemini
          await fallbackMediaRecorder(startGeneration);
        };

        recognition.onend = () => {
          setIsRecording(false);
          clearTimeout(timerRef.current);
        };

        recognitionRef.current = recognition;
        recognition.start();

        timerRef.current = setTimeout(() => {
          stopRecording();
        }, MAX_RECORDING_MS);

        return;
      } catch (recInitError) {
        console.warn("SpeechRecognition init failed, falling back to Gemini MediaRecorder:", recInitError);
      }
    }

    // Fallback path: MediaRecorder + Gemini Interactions API
    await fallbackMediaRecorder(startGeneration);
  }, [i18n.language, releaseStream, stopRecording, t]);

  const fallbackMediaRecorder = async (startGeneration) => {
    if (!window.isSecureContext) {
      setError(t("home.voiceSecureContext"));
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError(t("home.voiceUnsupported"));
      return;
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (startGeneration !== startGenerationRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const supportedTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ];
      const mimeType = supportedTypes.find((type) => window.MediaRecorder.isTypeSupported?.(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        discardRef.current = true;
        clearTimeout(timerRef.current);
        releaseStream();
        setIsRecording(false);
        setError(t("home.voiceTryAgain"));
      };

      recorder.onstop = async () => {
        releaseStream();
        setIsRecording(false);
        if (discardRef.current) {
          chunksRef.current = [];
          return;
        }
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        if (!blob.size) {
          setError(t("home.voiceNoAudio"));
          return;
        }

        const abortController = new AbortController();
        abortRef.current = abortController;
        setIsTranscribing(true);
        try {
          const response = await fetch("/api/voice/transcribe", {
            method: "POST",
            headers: { "Content-Type": blob.type || "audio/webm" },
            body: blob,
            signal: abortController.signal,
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) {
            const errorKey = {
              GEMINI_NOT_CONFIGURED: "home.voiceGeminiNotConfigured",
              GEMINI_RATE_LIMITED: "home.voiceGeminiRateLimited",
              AUDIO_TOO_LARGE: "home.voiceAudioTooLarge",
              AUDIO_TYPE_UNSUPPORTED: "home.voiceAudioUnsupported",
              AUDIO_EMPTY: "home.voiceNoAudio",
              AUDIO_NOT_UNDERSTOOD: "home.voiceNoAudio",
              GEMINI_TRANSCRIPTION_FAILED: "home.voiceGeminiError",
            }[result.code];
            throw new Error(errorKey ? t(errorKey) : result.error || t("home.voiceGeminiError"));
          }
          if (!result.text?.trim()) throw new Error(t("home.voiceNoAudio"));
          transcriptCallbackRef.current?.(result.text.trim());
        } catch (transcriptionError) {
          if (transcriptionError.name !== "AbortError") {
            setError(transcriptionError.message || t("home.voiceGeminiError"));
          }
        } finally {
          if (abortRef.current === abortController) abortRef.current = null;
          setIsTranscribing(false);
        }
      };

      recorder.start(250);
      setIsRecording(true);
      timerRef.current = setTimeout(() => {
        setError(t("home.voiceMaxDuration"));
        stopRecording();
      }, MAX_RECORDING_MS);
    } catch (recordingError) {
      stream?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsRecording(false);

      if (recordingError.name === "NotAllowedError" || recordingError.name === "PermissionDeniedError") {
        setError(
          i18n.language === "hi"
            ? "माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र के एड्रेस बार (लॉक आइकन) या Windows सेटिंग्स (Privacy & Security → Microphone) में माइक्रोफ़ोन चालू करें।"
            : "Microphone access was denied. Please allow microphone access in your browser address bar (lock icon) or Windows Settings (Privacy & Security → Microphone)."
        );
      } else if (recordingError.name === "NotFoundError") {
        setError(t("home.voiceNoMicrophone"));
      } else if (recordingError.name === "NotReadableError") {
        setError(t("home.voiceMicBusy"));
      } else {
        setError(t("home.voiceTryAgain"));
      }
    }
  };

  useEffect(() => () => {
    startGenerationRef.current += 1;
    clearTimeout(timerRef.current);
    abortRef.current?.abort();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (recorderRef.current?.state === "recording") {
      discardRef.current = true;
      recorderRef.current.stop();
    }
    releaseStream();
  }, [releaseStream]);

  return {
    startRecording,
    stopRecording,
    cancel,
    isRecording,
    isTranscribing,
    error,
    clearError: () => setError(""),
  };
}
