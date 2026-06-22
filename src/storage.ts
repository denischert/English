import AsyncStorage from "@react-native-async-storage/async-storage";
import { SessionRecord } from "./types";

const SESSIONS_KEY = "bec_sessions_v1";

export async function getSessions(): Promise<SessionRecord[]> {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY);
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
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
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
