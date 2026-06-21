import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { currentStreakWeeks, getSessions, sessionsThisWeek } from "../storage";
import { SessionRecord } from "../types";
import { scheduleWeeklyReminders } from "../notifications";

interface Props {
  onStartSession: () => void;
}

export default function HomeScreen({ onStartSession }: Props) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [reminderOn, setReminderOn] = useState(false);

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
      <Text style={styles.title}>Business English Coach</Text>
      <Text style={styles.subtitle}>American pronunciation & executive phrasing</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{weekCount}/3</Text>
          <Text style={styles.statLabel}>sessions this week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>week streak</Text>
        </View>
      </View>

      <View style={[styles.goalBanner, goalMet ? styles.goalMet : styles.goalPending]}>
        <Text style={styles.goalText}>
          {goalMet
            ? "Goal met this week. Great consistency!"
            : `${3 - weekCount} more session${3 - weekCount === 1 ? "" : "s"} to hit your weekly goal.`}
        </Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onStartSession}>
        <Text style={styles.primaryButtonText}>Start 10-min session</Text>
      </TouchableOpacity>

      {!reminderOn && (
        <TouchableOpacity style={styles.secondaryButton} onPress={handleEnableReminders}>
          <Text style={styles.secondaryButtonText}>Remind me 3x/week</Text>
        </TouchableOpacity>
      )}

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Recent sessions</Text>
      </View>
      {sessions.length === 0 && (
        <Text style={styles.emptyText}>No sessions yet. Start your first one above.</Text>
      )}
      {sessions
        .slice()
        .reverse()
        .slice(0, 8)
        .map((s) => (
          <View key={s.id} style={styles.historyItem}>
            <Text style={styles.historyDate}>
              {new Date(s.dateISO).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Text>
            <Text style={styles.historyScore}>{s.averageScore}/100</Text>
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 20, paddingTop: 60, gap: 14 },
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
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 12,
  },
  historyDate: { color: "#cbd5e1", fontSize: 14 },
  historyScore: { color: "#4ade80", fontSize: 14, fontWeight: "700" },
});
