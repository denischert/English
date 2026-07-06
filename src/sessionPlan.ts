import { SHADOWING_ITEMS } from "./content/shadowing";
import { SCENARIO_ITEMS } from "./content/scenarios";
import { DrillType, ScenarioItem, ShadowingItem } from "./types";
import { generateSessionContent } from "./generateContent";
import { getSessions, recentWeakPhonemes } from "./storage";

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

  let generated = null;
  try {
    const sessions = await getSessions();
    generated = await generateSessionContent(recentWeakPhonemes(sessions));
  } catch {
    generated = null;
  }

  if (generated) {
    shadowing = generated.shadowing;
    scenarios = generated.scenarios;
  } else {
    shadowing = pickRandom(SHADOWING_ITEMS, 3);
    scenarios = pickRandom(SCENARIO_ITEMS, 3);
  }

  const plan: PlannedRound[] = [];
  for (let i = 0; i < 3; i++) {
    plan.push({ type: "shadowing", shadowing: shadowing[i] });
    plan.push({ type: "scenario", scenario: scenarios[i] });
  }
  return plan;
}
