import { DrillType, ScenarioItem, ShadowingItem } from "./types";
import { generateSessionContent } from "./generateContent";
import { getSessions, recentWeakPhonemes } from "./storage";
import { getActiveProfile } from "./profiles";

export interface PlannedRound {
  type: DrillType;
  shadowing?: ShadowingItem;
  scenario?: ScenarioItem;
}

function pickRandom<T>(items: T[], count: number): T[] {
  const pool = [...items];
  const picked: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

// ~10 minutes: 3 shadowing drills + 3 scenario drills, alternating.
// Prefers freshly generated content personalised to the learner's weakest
// sounds and product-director role; falls back to the static lists when
// generation is unconfigured or fails.
export async function buildSessionPlan(): Promise<PlannedRound[]> {
  let shadowing: ShadowingItem[];
  let scenarios: ScenarioItem[];

  const profile = getActiveProfile();
  let generated = null;
  if (profile.allowGeneratedContent) {
    try {
      const sessions = await getSessions();
      generated = await generateSessionContent(recentWeakPhonemes(sessions));
    } catch {
      generated = null;
    }
  }

  if (generated) {
    shadowing = generated.shadowing;
    scenarios = generated.scenarios;
  } else {
    shadowing = pickRandom(profile.shadowing, profile.shadowingRounds);
    scenarios = pickRandom(profile.scenarios, profile.scenarioRounds);
  }

  // Interleave the two drill types; whichever list is longer fills the rest.
  const plan: PlannedRound[] = [];
  const rounds = Math.max(shadowing.length, scenarios.length);
  for (let i = 0; i < rounds; i++) {
    if (shadowing[i]) plan.push({ type: "shadowing", shadowing: shadowing[i] });
    if (scenarios[i]) plan.push({ type: "scenario", scenario: scenarios[i] });
  }
  return plan;
}
