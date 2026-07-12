// Uses the Azure Speech SDK (WebSocket-based) for pronunciation assessment.
// The SDK captures the microphone directly, which avoids all audio format
// conversion issues and bypasses the CORS restriction of the REST endpoint.
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { getActiveProfile } from "./profiles";
import { tr } from "./i18n";

const AZURE_KEY = process.env.EXPO_PUBLIC_AZURE_SPEECH_KEY?.trim();
// Normalise to the programmatic region ID (lowercase, no spaces) in case the
// secret was set to the Azure display name e.g. "Switzerland North".
const AZURE_REGION = process.env.EXPO_PUBLIC_AZURE_SPEECH_REGION?.trim().toLowerCase().replace(/\s+/g, "");

export interface PhonemeAssessment {
  phoneme: string; // IPA symbol, e.g. "ɹ", "θ", "æ"
  accuracyScore: number;
}

export interface WordAssessment {
  word: string;
  accuracyScore: number;
  errorType: "None" | "Mispronunciation" | "Omission" | "Insertion" | string;
  phonemes?: PhonemeAssessment[];
}

export interface PronunciationAssessment {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  pronScore: number;
  words: WordAssessment[];
  recognizedText: string;
}

export function isAzurePronunciationConfigured(): boolean {
  return Boolean(AZURE_KEY && AZURE_REGION);
}

// Returns a controller object immediately. The SDK listens to the microphone
// continuously — pauses in speech do NOT end the recording — until stop() is
// called, then resolves with the combined assessment of everything spoken.
// Pass an empty referenceText for unscripted mode: Azure then assesses the
// pronunciation of whatever was said (used by scenario rounds).
export function startPronunciationAssessment(
  referenceText: string,
  deviceId?: string
): { stop: () => Promise<PronunciationAssessment | null> } | null {
  if (!AZURE_KEY || !AZURE_REGION) return null;

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
  speechConfig.speechRecognitionLanguage = getActiveProfile().locale;

  const pronunciationConfig = new SpeechSDK.PronunciationAssessmentConfig(
    referenceText,
    SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
    SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
    // Miscue detection compares against the reference text, so it only makes
    // sense in scripted mode.
    referenceText.length > 0
  );
  pronunciationConfig.enableProsodyAssessment = true;
  // IPA phoneme symbols so accent feedback can name the exact sounds
  // that deviate from the American English reference model.
  pronunciationConfig.phonemeAlphabet = "IPA";

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
      phonemes: (w.Phonemes ?? []).map((p: any) => ({
        phoneme: p.Phoneme ?? "",
        accuracyScore: p.PronunciationAssessment?.AccuracyScore ?? 0,
      })),
    }));
    segments.push({
      accuracyScore: pa.accuracyScore ?? 0,
      fluencyScore: pa.fluencyScore ?? 0,
      // Unscripted mode has no reference to be complete against.
      completenessScore: pa.completenessScore ?? 100,
      prosodyScore: (pa as any).prosodyScore ?? 0,
      pronScore: pa.pronunciationScore ?? 0,
      words,
      recognizedText: result.text ?? "",
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
    recognizedText: segments.map((s) => s.recognizedText).filter(Boolean).join(" "),
  };
}

export function feedbackFromAssessment(assessment: PronunciationAssessment): string {
  const t = tr();
  const lines: string[] = [];

  const pron = Math.round(assessment.pronScore);
  if (pron >= 90) {
    lines.push(t.fbExcellent);
  } else if (pron >= 75) {
    lines.push(t.fbGood);
  } else if (pron >= 55) {
    lines.push(t.fbDecent);
  } else {
    lines.push(t.fbKeep);
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
    lines.push(t.fbMispronounced(worst));
  }

  if (omitted.length > 0) {
    const words = omitted.map((w) => `"${w.word}"`).join(", ");
    lines.push(t.fbDropped(words, omitted.length > 1));
  }

  if (inserted.length > 0) {
    const words = inserted.map((w) => `"${w.word}"`).join(", ");
    lines.push(t.fbExtra(words, inserted.length > 1));
  }

  if (assessment.fluencyScore < 70) {
    lines.push(t.fbFluencyLow);
  } else if (assessment.fluencyScore < 85) {
    lines.push(t.fbFluencyMid);
  }

  if (assessment.completenessScore < 80) {
    lines.push(t.fbCompleteness);
  }

  if (assessment.prosodyScore < 60) {
    lines.push(t.fbProsody);
  }

  return lines.join("\n");
}

// ── American accent analysis ─────────────────────────────────────────────────
// Azure scores every phoneme against its en-US (General American) acoustic
// model, so low-scoring phonemes are precisely the sounds that make speech
// sound non-American. This maps the most common trouble sounds to concrete
// articulation tips.

export interface AccentIssue {
  phoneme: string;
  word: string; // example word from this recording where it scored lowest
  accuracy: number; // 0-100, averaged across occurrences
  tip: string;
}

// Aggregates phoneme scores across the whole recording and returns the sounds
// that deviate most from the active profile's reference model, worst first.
export function accentIssuesFromAssessment(
  assessment: PronunciationAssessment,
  threshold = 80,
  limit = 5
): AccentIssue[] {
  const profile = getActiveProfile();
  const byPhoneme = new Map<string, { total: number; count: number; worstWord: string; worstScore: number }>();

  for (const w of assessment.words) {
    if (w.errorType === "Omission" || w.errorType === "Insertion") continue;
    for (const p of w.phonemes ?? []) {
      if (!p.phoneme) continue;
      const entry = byPhoneme.get(p.phoneme) ?? { total: 0, count: 0, worstWord: w.word, worstScore: 101 };
      entry.total += p.accuracyScore;
      entry.count += 1;
      if (p.accuracyScore < entry.worstScore) {
        entry.worstScore = p.accuracyScore;
        entry.worstWord = w.word;
      }
      byPhoneme.set(p.phoneme, entry);
    }
  }

  return [...byPhoneme.entries()]
    .map(([phoneme, e]) => ({
      phoneme,
      word: e.worstWord,
      accuracy: Math.round(e.total / e.count),
      tip: profile.phonemeTips[phoneme] ?? profile.defaultPhonemeTip,
    }))
    .filter((i) => i.accuracy < threshold)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit);
}

// ── Neural text-to-speech ────────────────────────────────────────────────────
// The same Azure key gives access to neural TTS voices, which sound far more
// natural than the browser's built-in speechSynthesis. Resolves when playback
// actually finishes (not merely when audio data has arrived).

export function speakWithAzure(text: string, rate = 0.95): Promise<void> | null {
  if (!AZURE_KEY || !AZURE_REGION) return null;

  const profile = getActiveProfile();
  return new Promise((resolve, reject) => {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_KEY!, AZURE_REGION!);
    speechConfig.speechSynthesisVoiceName = profile.ttsVoice;

    const player = new SpeechSDK.SpeakerAudioDestination();
    let synthesisOk = false;
    player.onAudioEnd = () => {
      if (synthesisOk) resolve();
    };

    const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

    // SSML so the speaking rate matches the pace used for shadowing practice.
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${profile.locale}">` +
      `<voice name="${profile.ttsVoice}"><prosody rate="${Math.round((rate - 1) * 100)}%">` +
      `${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}` +
      `</prosody></voice></speak>`;

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        synthesizer.close();
        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          // Audio data is fully buffered; onAudioEnd fires when playback ends.
          synthesisOk = true;
          // Safety net in case onAudioEnd never fires (some browsers).
          const remainingMs = Math.max(result.audioDuration / 10000, 0);
          setTimeout(resolve, remainingMs + 1500);
        } else {
          reject(new Error(`Azure TTS failed: ${SpeechSDK.ResultReason[result.reason]}`));
        }
      },
      (err) => {
        synthesizer.close();
        reject(new Error(`Azure TTS error: ${err}`));
      }
    );
  });
}

