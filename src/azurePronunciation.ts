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

// Returns a controller object immediately. The SDK listens to the microphone
// continuously — pauses in speech do NOT end the recording — until stop() is
// called, then resolves with the combined assessment of everything spoken.
export function startPronunciationAssessment(
  referenceText: string,
  deviceId?: string
): { stop: () => Promise<PronunciationAssessment | null> } | null {
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

  const audioConfig = deviceId
    ? SpeechSDK.AudioConfig.fromMicrophoneInput(deviceId)
    : SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  pronunciationConfig.applyTo(recognizer);

  // Continuous recognition emits one "recognized" event per speech segment
  // (a pause starts a new segment). Collect them all and merge on stop.
  const segments: PronunciationAssessment[] = [];
  let cancelError: Error | null = null;

  recognizer.recognized = (_sender, event) => {
    const result = event.result;
    if (result.reason !== SpeechSDK.ResultReason.RecognizedSpeech) return;
    const pa = SpeechSDK.PronunciationAssessmentResult.fromResult(result);
    const detail = (result as any).privJson ? JSON.parse((result as any).privJson) : null;
    const words: WordAssessment[] = (
      detail?.NBest?.[0]?.Words ?? pa.detailResult?.Words ?? []
    ).map((w: any) => ({
      word: w.Word ?? w.word ?? "",
      accuracyScore: w.PronunciationAssessment?.AccuracyScore ?? w.accuracyScore ?? 0,
      errorType: w.PronunciationAssessment?.ErrorType ?? w.errorType ?? "None",
    }));
    segments.push({
      accuracyScore: pa.accuracyScore,
      fluencyScore: pa.fluencyScore,
      completenessScore: pa.completenessScore,
      prosodyScore: (pa as any).prosodyScore ?? 0,
      pronScore: pa.pronunciationScore,
      words,
    });
  };

  recognizer.canceled = (_sender, event) => {
    if (event.reason === SpeechSDK.CancellationReason.Error) {
      cancelError = new Error(`Azure canceled: ${event.errorDetails}`);
    }
  };

  recognizer.startContinuousRecognitionAsync(
    () => {},
    (err) => {
      cancelError = new Error(`Speech SDK error: ${err}`);
    }
  );

  return {
    stop: () =>
      new Promise<PronunciationAssessment | null>((resolve, reject) => {
        recognizer.stopContinuousRecognitionAsync(
          () => {
            recognizer.close();
            if (cancelError) return reject(cancelError);
            resolve(mergeSegments(segments));
          },
          (err) => {
            recognizer.close();
            reject(new Error(`Speech SDK error: ${err}`));
          }
        );
      }),
  };
}

// Merges per-segment assessments into one. With a single segment (the normal
// case for one sentence) this returns it as-is; with several, scores are
// averaged weighted by word count and word lists concatenated.
function mergeSegments(segments: PronunciationAssessment[]): PronunciationAssessment | null {
  if (segments.length === 0) return null;
  if (segments.length === 1) return segments[0];

  const totalWords = segments.reduce((sum, s) => sum + Math.max(s.words.length, 1), 0);
  const weighted = (pick: (s: PronunciationAssessment) => number) =>
    segments.reduce((sum, s) => sum + pick(s) * Math.max(s.words.length, 1), 0) / totalWords;

  return {
    accuracyScore: weighted((s) => s.accuracyScore),
    fluencyScore: weighted((s) => s.fluencyScore),
    completenessScore: weighted((s) => s.completenessScore),
    prosodyScore: weighted((s) => s.prosodyScore),
    pronScore: weighted((s) => s.pronScore),
    words: segments.flatMap((s) => s.words),
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
