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
  const resolveRef = useRef<((text: string) => void) | null>(null);

  useSpeechRecognitionEvent("start", () => setIsListening(true));
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    if (resolveRef.current) {
      resolveRef.current(transcript);
      resolveRef.current = null;
    }
  });
  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results[0]?.transcript ?? "";
    setTranscript(text);
  });
  useSpeechRecognitionEvent("error", () => {
    setIsListening(false);
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
    return new Promise(async (resolve) => {
      const perms = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perms.granted) {
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

  return { speak, listen, stopListening, isListening, isSpeaking, transcript };
}
