// Calls Azure AI Speech's short-audio REST endpoint with the
// Pronunciation-Assessment header, which scores accuracy/fluency/completeness
// at the phoneme level instead of just diffing transcript text.
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

  const config = {
    ReferenceText: referenceText,
    GradingSystem: "HundredMark",
    Granularity: "Phoneme",
    EnableMiscue: true,
    EnableProsodyAssessment: true,
  };
  const pronunciationHeader = btoa(JSON.stringify(config));

  const response = await fetch(
    `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_KEY,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        Accept: "application/json",
        "Pronunciation-Assessment": pronunciationHeader,
      },
      body: audio,
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Azure pronunciation assessment failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  const best = data?.NBest?.[0];
  if (!best?.PronunciationAssessment) return null;

  return {
    accuracyScore: best.PronunciationAssessment.AccuracyScore,
    fluencyScore: best.PronunciationAssessment.FluencyScore,
    completenessScore: best.PronunciationAssessment.CompletenessScore,
    prosodyScore: best.PronunciationAssessment.ProsodyScore ?? 0,
    pronScore: best.PronunciationAssessment.PronScore,
    words: (best.Words ?? []).map((w: any) => ({
      word: w.Word,
      accuracyScore: w.PronunciationAssessment?.AccuracyScore ?? 0,
      errorType: w.PronunciationAssessment?.ErrorType ?? "None",
    })),
  };
}

export function feedbackFromAssessment(assessment: PronunciationAssessment): string {
  const lines: string[] = [];

  // Overall verdict
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

  // Word-level issues
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

  // Fluency coaching
  if (assessment.fluencyScore < 70) {
    lines.push("Fluency is low — try to speak more smoothly without long pauses between words.");
  } else if (assessment.fluencyScore < 85) {
    lines.push("Fluency could be smoother — keep a steady rhythm as you speak.");
  }

  // Completeness
  if (assessment.completenessScore < 80) {
    lines.push("You didn't say the full sentence — try to get through every word.");
  }

  // Prosody (stress & intonation)
  if (assessment.prosodyScore < 60) {
    lines.push("Work on stress and intonation — vary your pitch to sound more natural.");
  }

  return lines.join("\n");
}
