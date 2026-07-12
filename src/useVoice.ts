import { useCallback, useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { speakWithAzure } from "./azurePronunciation";
import { getActiveProfile } from "./profiles";

// On Linux/ChromeOS, the browser's default speechSynthesis voice is often an
// espeak-ng variant — including literal novelty effects like a whisper voice —
// instead of a normal clear voice. Picking a real en-US voice explicitly avoids
// that "someone whispering in my ear" sound.
const cachedVoiceIds: Record<string, string | null> = {};

async function loadVoices(): Promise<Speech.Voice[]> {
  const first = await Speech.getAvailableVoicesAsync();
  if (first.length > 0) return first;
  // On web, voices can load asynchronously after the page loads.
  if (typeof window !== "undefined" && (window as any).speechSynthesis) {
    await new Promise<void>((resolve) => {
      const synth = (window as any).speechSynthesis;
      const timer = setTimeout(resolve, 500);
      synth.addEventListener(
        "voiceschanged",
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true }
      );
    });
    return Speech.getAvailableVoicesAsync();
  }
  return first;
}

async function pickClearVoice(locale: string): Promise<string | undefined> {
  if (locale in cachedVoiceIds) return cachedVoiceIds[locale] ?? undefined;
  try {
    const voices = await loadVoices();
    const lang = locale.toLowerCase();
    const primary = lang.split("-")[0];
    const exact = voices.filter((v) => v.language?.toLowerCase().startsWith(lang));
    const candidates = exact.length > 0 ? exact : voices.filter((v) => v.language?.toLowerCase().startsWith(primary));
    const isBad = (name: string) => /whisper|espeak|robot|novelty/i.test(name);
    const good =
      candidates.find((v) => v.quality === Speech.VoiceQuality.Enhanced && !isBad(v.name)) ??
      candidates.find((v) => /google/i.test(v.name) && !isBad(v.name)) ??
      candidates.find((v) => !isBad(v.name));
    cachedVoiceIds[locale] = good?.identifier ?? null;
  } catch {
    cachedVoiceIds[locale] = null;
  }
  return cachedVoiceIds[locale] ?? undefined;
}

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const resolveRef = useRef<((text: string) => void) | null>(null);
  const transcriptRef = useRef("");

  useSpeechRecognitionEvent("start", () => {
    setError(null);
    setIsListening(true);
  });
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    if (resolveRef.current) {
      resolveRef.current(transcriptRef.current);
      resolveRef.current = null;
    }
  });
  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results[0]?.transcript ?? "";
    transcriptRef.current = text;
    setTranscript(text);
  });
  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);
    setError(
      event.error === "not-allowed"
        ? "Microphone access was blocked. Allow microphone access for this site and try again."
        : event.error === "service-not-allowed"
        ? "Safari's speech service blocked this request. Make sure Dictation is enabled (Settings > General > Keyboard > Enable Dictation) and that you're tapping Start recording directly, not after the prompt finishes speaking."
        : event.error === "no-speech"
        ? "No speech detected. Try speaking louder or check your microphone."
        : `Speech recognition error: ${event.error}`
    );
    if (resolveRef.current) {
      resolveRef.current(transcriptRef.current);
      resolveRef.current = null;
    }
  });

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise(async (resolve) => {
      setIsSpeaking(true);

      // Prefer Azure neural TTS — far more natural than the browser's
      // built-in speechSynthesis voices. Falls back to expo-speech below
      // if Azure isn't configured or the request fails.
      const azure = speakWithAzure(text);
      if (azure) {
        try {
          await azure;
          setIsSpeaking(false);
          resolve();
          return;
        } catch (e) {
          console.warn("Azure TTS failed, falling back to browser voice:", e);
        }
      }

      const locale = getActiveProfile().locale;
      const voice = await pickClearVoice(locale);
      Speech.speak(text, {
        language: locale,
        voice,
        rate: 0.95,
        pitch: 1.0,
        volume: 1.0,
        onDone: () => {
          setIsSpeaking(false);
          resolve();
        },
        onStopped: () => {
          setIsSpeaking(false);
          resolve();
        },
        onError: () => {
          setIsSpeaking(false);
          resolve();
        },
      });
    });
  }, []);

  const listen = useCallback((timeoutMs = 8000): Promise<string> => {
    setTranscript("");
    transcriptRef.current = "";
    setError(null);
    return new Promise(async (resolve) => {
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setError("Speech recognition isn't supported in this browser. Try Safari or Chrome.");
        resolve("");
        return;
      }
      const perms = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perms.granted) {
        setError("Microphone access was blocked. Allow microphone access for this site and try again.");
        resolve("");
        return;
      }
      // Safari rejects SpeechRecognition.start() with "service-not-allowed" if its
      // audio session is still tied up with text-to-speech playback, even after
      // the TTS "done" callback has fired. Force-stop TTS and give the audio
      // session a moment to release before requesting the microphone.
      Speech.stop();
      await new Promise((r) => setTimeout(r, 350));
      resolveRef.current = resolve;
      ExpoSpeechRecognitionModule.start({
        lang: getActiveProfile().locale,
        interimResults: true,
        continuous: false,
      });
      setTimeout(() => {
        ExpoSpeechRecognitionModule.stop();
      }, timeoutMs);
    });
  }, []);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  useEffect(() => {
    return () => {
      Speech.stop();
      ExpoSpeechRecognitionModule.stop();
    };
  }, []);

  return { speak, listen, stopListening, isListening, isSpeaking, transcript, error };
}
