import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { currentStreakWeeks, getSessions, sessionsThisWeek, totalStars } from "../storage";
import { getActiveProfile } from "../profiles";
import { tr } from "../i18n";
import { SessionRecord } from "../types";
import { scheduleWeeklyReminders } from "../notifications";

interface Props {
  onStartSession: () => void;
  onOpenSettings: () => void;
  onSwitchProfile: () => void;
}

export default function HomeScreen({ onStartSession, onOpenSettings, onSwitchProfile }: Props) {
  const profile = getActiveProfile();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [reminderOn, setReminderOn] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await getSessions();
    setSessions(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const weekCount = sessionsThisWeek(sessions);
  const streak = currentStreakWeeks(sessions);
  const goalMet = weekCount >= 3;
  const stars = totalStars(sessions);

  async function handleEnableReminders() {
    const ok = await scheduleWeeklyReminders(18, 0);
    if (ok) {
      setReminderOn(true);
      Alert.alert("Reminders set", "You'll get a nudge Mon/Wed/Fri at 6:00 PM.");
    } else {
      Alert.alert("Permission needed", "Enable notifications in Settings to get reminders.");
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.titleBox}>
          <Text style={styles.title}>{profile.emoji} {profile.title}</Text>
          <Text style={styles.subtitle}>{profile.subtitle}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.settingsButton} onPress={onSwitchProfile}>
            <Text style={styles.settingsButtonText}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton} onPress={onOpenSettings}>
            <Text style={styles.settingsButtonText}>⚙︎</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{weekCount}/3</Text>
          <Text style={styles.statLabel}>{tr().statSessions}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>{tr().statStreak}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>★ {stars}</Text>
          <Text style={styles.statLabel}>{tr().statStars}</Text>
        </View>
      </View>

      <View style={[styles.goalBanner, goalMet ? styles.goalMet : styles.goalPending]}>
        <Text style={styles.goalText}>
          {goalMet ? tr().goalMet : tr().goalPending(3 - weekCount)}
        </Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onStartSession}>
        <Text style={styles.primaryButtonText}>{tr().startSession}</Text>
      </TouchableOpacity>

      {!reminderOn && (
        <TouchableOpacity style={styles.secondaryButton} onPress={handleEnableReminders}>
          <Text style={styles.secondaryButtonText}>Remind me 3x/week</Text>
        </TouchableOpacity>
      )}

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>{tr().historyTitle}</Text>
      </View>
      {sessions.length === 0 && (
        <Text style={styles.emptyText}>{tr().emptyHistory}</Text>
      )}
      {sessions
        .slice()
        .reverse()
        .slice(0, 8)
        .map((s) => {
          const expanded = expandedId === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              style={styles.historyItem}
              onPress={() => setExpandedId(expanded ? null : s.id)}
            >
              <View style={styles.historyRow}>
                <Text style={styles.historyDate}>
                  {new Date(s.dateISO).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <View style={styles.historyRight}>
                  <Text style={styles.historyStars}>
                    ★ {s.totalStars}/{s.maxStars}
                  </Text>
                  <Text style={styles.historyScore}>{s.averageScore}/100</Text>
                </View>
              </View>
              {expanded && (
                <View style={styles.roundList}>
                  {s.rounds.map((r, i) => (
                    <View key={`${r.itemId}-${i}`} style={styles.roundRow}>
                      <Text style={styles.roundTarget} numberOfLines={1}>
                        {r.targetText}
                      </Text>
                      <Text style={styles.roundMeta}>
                        {"★".repeat(r.stars)}
                        {"☆".repeat(3 - r.stars)} · {r.score}/100 ·{" "}
                        {r.attempts === 1 ? tr().firstTryShort : tr().triesShort(r.attempts)}
                      </Text>
                      {r.breakdown && (
                        <View style={styles.roundBreakdown}>
                          <Text style={styles.roundBreakdownItem}>
                            {tr().accuracyShort} {r.breakdown.accuracy}/100
                          </Text>
                          <Text style={styles.roundBreakdownItem}>
                            {tr().fluencyShort} {r.breakdown.fluency}/100
                          </Text>
                          <Text style={styles.roundBreakdownItem}>
                            {tr().completenessShort} {r.breakdown.completeness}/100
                          </Text>
                          <Text style={styles.roundBreakdownItem}>
                            {tr().prosodyShort} {r.breakdown.prosody}/100
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 20, paddingTop: 60, gap: 14 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  titleBox: { flex: 1, paddingRight: 8 },
  headerButtons: { flexDirection: "row", gap: 8 },
  settingsButton: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsButtonText: { color: "#cbd5e1", fontSize: 18 },
  title: { color: "#f8fafc", fontSize: 26, fontWeight: "800" },
  subtitle: { color: "#94a3b8", fontSize: 14, marginBottom: 10 },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, backgroundColor: "#1e293b", borderRadius: 14, padding: 16, alignItems: "center" },
  statValue: { color: "#38bdf8", fontSize: 26, fontWeight: "800" },
  statLabel: { color: "#94a3b8", fontSize: 12, marginTop: 4, textAlign: "center" },
  goalBanner: { borderRadius: 12, padding: 12 },
  goalMet: { backgroundColor: "#14532d" },
  goalPending: { backgroundColor: "#1e293b" },
  goalText: { color: "#e2e8f0", fontSize: 13, textAlign: "center" },
  primaryButton: { backgroundColor: "#38bdf8", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 6 },
  primaryButtonText: { color: "#0f172a", fontWeight: "700", fontSize: 17 },
  secondaryButton: { borderColor: "#475569", borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  secondaryButtonText: { color: "#cbd5e1", fontWeight: "600" },
  historyHeader: { marginTop: 16 },
  historyTitle: { color: "#f8fafc", fontSize: 16, fontWeight: "700" },
  emptyText: { color: "#64748b", fontSize: 13 },
  historyItem: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  historyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  historyRight: { flexDirection: "row", gap: 12, alignItems: "center" },
  historyDate: { color: "#cbd5e1", fontSize: 14 },
  historyStars: { color: "#facc15", fontSize: 13, fontWeight: "700" },
  historyScore: { color: "#4ade80", fontSize: 14, fontWeight: "700" },
  roundList: { borderTopWidth: 1, borderTopColor: "#334155", paddingTop: 8, gap: 6 },
  roundRow: { gap: 2 },
  roundTarget: { color: "#e2e8f0", fontSize: 13 },
  roundMeta: { color: "#94a3b8", fontSize: 12 },
  roundBreakdown: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 },
  roundBreakdownItem: { color: "#64748b", fontSize: 11 },
});
