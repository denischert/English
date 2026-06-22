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
  const problemWords = assessment.words.filter((w) => w.errorType !== "None" || w.accuracyScore < 70);
  if (problemWords.length === 0) {
    return `Strong pronunciation — accuracy ${Math.round(assessment.accuracyScore)}, fluency ${Math.round(
      assessment.fluencyScore
    )}.`;
  }
  const flagged = problemWords
    .slice(0, 3)
    .map((w) => (w.errorType === "Omission" ? `"${w.word}" (dropped)` : `"${w.word}"`))
    .join(", ");
  return `Watch your pronunciation of ${flagged}. Accuracy ${Math.round(
    assessment.accuracyScore
  )}, fluency ${Math.round(assessment.fluencyScore)}.`;
}
