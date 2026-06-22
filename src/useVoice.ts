import { useCallback, useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

// On Linux/ChromeOS, the browser's default speechSynthesis voice is often an
// espeak-ng variant — including literal novelty effects like a whisper voice —
// instead of a normal clear voice. Picking a real en-US voice explicitly avoids
// that "someone whispering in my ear" sound.
let cachedVoiceId: string | null | undefined;

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

async function pickClearVoice(): Promise<string | undefined> {
  if (cachedVoiceId !== undefined) return cachedVoiceId ?? undefined;
  try {
    const voices = await loadVoices();
    const enUS = voices.filter((v) => v.language?.toLowerCase().startsWith("en-us"));
    const candidates = enUS.length > 0 ? enUS : voices.filter((v) => v.language?.toLowerCase().startsWith("en"));
    const isBad = (name: string) => /whisper|espeak|robot|novelty/i.test(name);
    const good =
      candidates.find((v) => v.quality === Speech.VoiceQuality.Enhanced && !isBad(v.name)) ??
      candidates.find((v) => /google/i.test(v.name) && !isBad(v.name)) ??
      candidates.find((v) => !isBad(v.name));
    cachedVoiceId = good?.identifier ?? null;
  } catch {
    cachedVoiceId = null;
  }
  return cachedVoiceId ?? undefined;
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
      const voice = await pickClearVoice();
      Speech.speak(text, {
        language: "en-US",
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
        lang: "en-US",
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
