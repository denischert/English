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

export interface RoundResult {
  type: DrillType;
  itemId: string;
  targetText: string;
  heardText: string;
  score: number;
  feedback: string;
}

export interface SessionRecord {
  id: string;
  dateISO: string;
  durationSec: number;
  rounds: RoundResult[];
  averageScore: number;
}
