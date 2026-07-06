export type DrillType = "shadowing" | "scenario";

export interface ShadowingItem {
  id: string;
  text: string;
  tip: string;
}

export interface ScenarioItem {
  id: string;
  prompt: string;
  weakPhrase: string;
  strongPhrase: string;
  context: string;
}

export interface ScoreBreakdown {
  accuracy: number;
  fluency: number;
  completeness: number;
  prosody: number;
}

export interface AccentIssue {
  phoneme: string; // IPA symbol
  word: string; // example word from the recording
  accuracy: number; // 0-100
  tip: string;
}

export interface RoundResult {
  type: DrillType;
  itemId: string;
  targetText: string;
  heardText: string;
  score: number;
  feedback: string;
  attempts: number;
  stars: number;
  breakdown?: ScoreBreakdown;
  accentIssues?: AccentIssue[];
}

export interface SessionRecord {
  id: string;
  dateISO: string;
  durationSec: number;
  rounds: RoundResult[];
  averageScore: number;
  totalStars: number;
  maxStars: number;
}
