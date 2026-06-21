import { useCallback, useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

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
    return new Promise((resolve) => {
      setIsSpeaking(true);
      Speech.speak(text, {
        language: "en-US",
        rate: 0.95,
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
