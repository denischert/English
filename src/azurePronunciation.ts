// Uses the Azure Speech SDK (WebSocket-based) for pronunciation assessment.
// The SDK captures the microphone directly, which avoids all audio format
// conversion issues and bypasses the CORS restriction of the REST endpoint.
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

const AZURE_KEY = process.env.EXPO_PUBLIC_AZURE_SPEECH_KEY?.trim();
// Normalise to the programmatic region ID (lowercase, no spaces) in case the
// secret was set to the Azure display name e.g. "Switzerland North".
const AZURE_REGION = process.env.EXPO_PUBLIC_AZURE_SPEECH_REGION?.trim().toLowerCase().replace(/\s+/g, "");

export interface WordAssessment {
  word: string;
  accuracyScore: number;
  errorType: "None" | "Mispronunciation" | "Omission" | "Insertion" | string;
}

export interface PronunciationAssessment {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  pronScore: number;
  words: WordAssessment[];
}

export function isAzurePronunciationConfigured(): boolean {
  return Boolean(AZURE_KEY && AZURE_REGION);
}

// Returns a controller object immediately. The SDK starts listening from the
// mic right away; call stop() when the user has finished speaking to get the
// assessment result. This runs in parallel with the Web Speech API transcript.
export function startPronunciationAssessment(
  referenceText: string,
  deviceId?: string
): { stop: () => Promise<PronunciationAssessment | null> } | null {
  if (!AZURE_KEY || !AZURE_REGION) return null;

  console.log(`[Azure] key=${AZURE_KEY?.slice(0, 4)}*** region="${AZURE_REGION}"`);
  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
  speechConfig.speechRecognitionLanguage = "en-US";

  const pronunciationConfig = new SpeechSDK.PronunciationAssessmentConfig(
    referenceText,
    SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
    SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
    true // enableMiscue
  );
  pronunciationConfig.enableProsodyAssessment = true;

  const audioConfig = deviceId
    ? SpeechSDK.AudioConfig.fromMicrophoneInput(deviceId)
    : SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  pronunciationConfig.applyTo(recognizer);

  const resultPromise = new Promise<PronunciationAssessment | null>((resolve, reject) => {
    recognizer.recognizeOnceAsync(
      (result) => {
        recognizer.close();
        if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const pa = SpeechSDK.PronunciationAssessmentResult.fromResult(result);
          const detail = (result as any).privJson ? JSON.parse((result as any).privJson) : null;
          const words: WordAssessment[] = (
            detail?.NBest?.[0]?.Words ?? pa.detailResult?.Words ?? []
          ).map((w: any) => ({
            word: w.Word ?? w.word ?? "",
            accuracyScore: w.PronunciationAssessment?.AccuracyScore ?? w.accuracyScore ?? 0,
            errorType: w.PronunciationAssessment?.ErrorType ?? w.errorType ?? "None",
          }));
          resolve({
            accuracyScore: pa.accuracyScore,
            fluencyScore: pa.fluencyScore,
            completenessScore: pa.completenessScore,
            prosodyScore: (pa as any).prosodyScore ?? 0,
            pronScore: pa.pronunciationScore,
            words,
          });
        } else if (result.reason === SpeechSDK.ResultReason.NoMatch) {
          resolve(null);
        } else if (result.reason === SpeechSDK.ResultReason.Canceled) {
          const cancellation = SpeechSDK.CancellationDetails.fromResult(result);
          reject(new Error(
            `Azure canceled: ${SpeechSDK.CancellationReason[cancellation.reason]} — ${cancellation.errorDetails}`
          ));
        } else {
          reject(new Error(`Speech SDK recognition failed: ${SpeechSDK.ResultReason[result.reason]}`));
        }
      },
      (err) => {
        recognizer.close();
        reject(new Error(`Speech SDK error: ${err}`));
      }
    );
  });

  return {
    stop: () => {
      // recognizeOnceAsync stops automatically on silence; calling stop()
      // just signals end-of-speech so it doesn't wait for a timeout.
      try { recognizer.stopContinuousRecognitionAsync(); } catch {}
      return resultPromise;
    },
  };
}

export function feedbackFromAssessment(assessment: PronunciationAssessment): string {
  const lines: string[] = [];

  const pron = Math.round(assessment.pronScore);
  if (pron >= 90) {
    lines.push("Excellent pronunciation overall.");
  } else if (pron >= 75) {
    lines.push("Good pronunciation with a few areas to refine.");
  } else if (pron >= 55) {
    lines.push("Decent attempt — several sounds need work.");
  } else {
    lines.push("Keep practising — focus on the words highlighted below.");
  }

  const mispronounced = assessment.words.filter(
    (w) => w.errorType === "Mispronunciation" || (w.errorType === "None" && w.accuracyScore < 70)
  );
  const omitted = assessment.words.filter((w) => w.errorType === "Omission");
  const inserted = assessment.words.filter((w) => w.errorType === "Insertion");

  if (mispronounced.length > 0) {
    const worst = mispronounced
      .sort((a, b) => a.accuracyScore - b.accuracyScore)
      .slice(0, 4)
      .map((w) => `"${w.word}" (${Math.round(w.accuracyScore)}%)`)
      .join(", ");
    lines.push(`Mispronounced: ${worst}. Slow down and say each sound clearly.`);
  }

  if (omitted.length > 0) {
    const words = omitted.map((w) => `"${w.word}"`).join(", ");
    lines.push(`Dropped word${omitted.length > 1 ? "s" : ""}: ${words}. Make sure to say every word.`);
  }

  if (inserted.length > 0) {
    const words = inserted.map((w) => `"${w.word}"`).join(", ");
    lines.push(`Extra word${inserted.length > 1 ? "s" : ""} heard: ${words}. Stick to the target sentence.`);
  }

  if (assessment.fluencyScore < 70) {
    lines.push("Fluency is low — try to speak more smoothly without long pauses between words.");
  } else if (assessment.fluencyScore < 85) {
    lines.push("Fluency could be smoother — keep a steady rhythm as you speak.");
  }

  if (assessment.completenessScore < 80) {
    lines.push("You didn't say the full sentence — try to get through every word.");
  }

  if (assessment.prosodyScore < 60) {
    lines.push("Work on stress and intonation — vary your pitch to sound more natural.");
  }

  return lines.join("\n");
}
