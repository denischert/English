// Uses the Azure Speech SDK (WebSocket-based) for pronunciation assessment.
// The REST short-audio endpoint blocks browser fetch with CORS; the SDK
// bypasses this by using WebSockets and runs fine in a browser context.
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

const AZURE_KEY = process.env.EXPO_PUBLIC_AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.EXPO_PUBLIC_AZURE_SPEECH_REGION;

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

export async function assessPronunciation(
  referenceText: string,
  audio: Blob
): Promise<PronunciationAssessment | null> {
  if (!AZURE_KEY || !AZURE_REGION) return null;

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
  speechConfig.speechRecognitionLanguage = "en-US";

  const pronunciationConfig = new SpeechSDK.PronunciationAssessmentConfig(
    referenceText,
    SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
    SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
    true // enableMiscue
  );
  pronunciationConfig.enableProsodyAssessment = true;

  // Write ALL audio into the push stream before starting recognition to avoid
  // a race where recognizeOnceAsync returns NoMatch on an empty stream.
  const pushStream = SpeechSDK.AudioInputStream.createPushStream(
    SpeechSDK.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1)
  );
  const buf = await audio.arrayBuffer();
  // Skip the 44-byte WAV header; the push stream expects raw PCM samples.
  pushStream.write(buf.slice(44));
  pushStream.close();

  const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(pushStream);
  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  pronunciationConfig.applyTo(recognizer);

  return new Promise((resolve, reject) => {
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
