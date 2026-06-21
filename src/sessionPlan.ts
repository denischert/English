import { SHADOWING_ITEMS } from "./content/shadowing";
import { SCENARIO_ITEMS } from "./content/scenarios";
import { DrillType, ScenarioItem, ShadowingItem } from "./types";

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
export function buildSessionPlan(): PlannedRound[] {
  const shadowing = pickRandom(SHADOWING_ITEMS, 3);
  const scenarios = pickRandom(SCENARIO_ITEMS, 3);
  const plan: PlannedRound[] = [];
  for (let i = 0; i < 3; i++) {
    plan.push({ type: "shadowing", shadowing: shadowing[i] });
    plan.push({ type: "scenario", scenario: scenarios[i] });
  }
  return plan;
}
