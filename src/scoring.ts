import { getActiveProfile } from "./profiles";

export const MASTERY_THRESHOLD = 80;

// Rewards getting pronunciation right with fewer retries: nailing it on the
// first try is worth more than grinding through several attempts.
export function starsForAttempt(score: number, attempts: number): number {
  if (score < MASTERY_THRESHOLD) return 0;
  if (attempts <= 1) return 3;
  if (attempts === 2) return 2;
  return 1;
}

function normalize(text: string): string {
  // Keep all unicode letters so German umlauts and ß survive.
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}' ]/gu, "")
    .trim();
}

function levenshtein(a: string[], b: string[]): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[a.length][b.length];
}

export function scoreShadowing(target: string, heard: string): {
  score: number;
  feedback: string;
} {
  const targetWords = normalize(target).split(/\s+/).filter(Boolean);
  const heardWords = normalize(heard).split(/\s+/).filter(Boolean);

  if (heardWords.length === 0) {
    return { score: 0, feedback: "I didn't catch that. Try speaking closer to the mic." };
  }

  const distance = levenshtein(targetWords, heardWords);
  const maxLen = Math.max(targetWords.length, heardWords.length, 1);
  const score = Math.max(0, Math.round((1 - distance / maxLen) * 100));

  let feedback: string;
  if (score >= 90) {
    feedback = "Excellent match. Your pronunciation and pacing sound clear.";
  } else if (score >= 70) {
    feedback = "Good attempt. A few words were off — slow down and stress the key words.";
  } else if (score >= 40) {
    feedback = "Partial match. Listen again and focus on word-by-word clarity.";
  } else {
    feedback = "Quite different from the target. Replay the audio and try again slowly.";
  }

  return { score, feedback };
}

export function scoreScenario(strongPhrase: string, heard: string): {
  score: number;
  feedback: string;
} {
  const heardNorm = normalize(heard);
  const heardWords = heardNorm.split(/\s+/).filter(Boolean);

  if (heardWords.length === 0) {
    return { score: 0, feedback: "I didn't catch a response. Try again and speak clearly." };
  }

  const profile = getActiveProfile();
  const markerHits = profile.strongMarkers.filter((m) => heardNorm.includes(normalize(m))).length;
  const fillerHits = profile.fillerWords.filter((f) =>
    f.includes(" ") ? heardNorm.includes(normalize(f)) : heardWords.includes(f)
  ).length;

  const lengthScore = Math.min(heardWords.length / 8, 1) * 40;
  const markerScore = Math.min(markerHits, 3) * 15;
  const fillerPenalty = Math.min(fillerHits, 4) * 8;

  const score = Math.max(0, Math.min(100, Math.round(lengthScore + markerScore + 45 - fillerPenalty)));

  let feedback: string;
  if (fillerHits > 0) {
    const filler = profile.fillerWords.find((f) =>
      f.includes(" ") ? heardNorm.includes(normalize(f)) : heardWords.includes(f)
    );
    feedback = `Try cutting filler words like "${filler}". Compare to: "${strongPhrase}"`;
  } else if (markerHits === 0) {
    feedback = `Good content. Make it sound more decisive, e.g.: "${strongPhrase}"`;
  } else {
    feedback = `Solid executive tone. Reference phrasing: "${strongPhrase}"`;
  }

  return { score, feedback };
}
