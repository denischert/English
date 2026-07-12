import AsyncStorage from "@react-native-async-storage/async-storage";
import { SessionRecord } from "./types";
import { getActiveProfile } from "./profiles";

export async function getSessions(): Promise<SessionRecord[]> {
  const raw = await AsyncStorage.getItem(getActiveProfile().sessionsKey);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
}

export async function addSession(session: SessionRecord): Promise<void> {
  const sessions = await getSessions();
  sessions.push(session);
  await AsyncStorage.setItem(getActiveProfile().sessionsKey, JSON.stringify(sessions));
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function sessionsThisWeek(sessions: SessionRecord[]): number {
  const weekStart = startOfWeek(new Date()).getTime();
  return sessions.filter((s) => new Date(s.dateISO).getTime() >= weekStart).length;
}

export function totalStars(sessions: SessionRecord[]): number {
  return sessions.reduce((sum, s) => sum + s.totalStars, 0);
}

export function currentStreakWeeks(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0;
  const weekly = new Map<number, number>();
  for (const s of sessions) {
    const weekStart = startOfWeek(new Date(s.dateISO)).getTime();
    weekly.set(weekStart, (weekly.get(weekStart) ?? 0) + 1);
  }
  let streak = 0;
  let cursor = startOfWeek(new Date()).getTime();
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  while ((weekly.get(cursor) ?? 0) >= 3) {
    streak += 1;
    cursor -= WEEK_MS;
  }
  return streak;
}

// Phonemes that keep appearing in the accent check across recent sessions,
// most frequent first. Used to personalise generated practice sentences.
export function recentWeakPhonemes(sessions: SessionRecord[], limit = 4): string[] {
  const counts = new Map<string, number>();
  for (const s of sessions.slice(-10)) {
    for (const r of s.rounds) {
      for (const issue of r.accentIssues ?? []) {
        counts.set(issue.phoneme, (counts.get(issue.phoneme) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([phoneme]) => phoneme);
}
