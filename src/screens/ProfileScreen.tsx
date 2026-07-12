import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PROFILES, loadLastProfileId, setActiveProfile } from "../profiles";

interface Props {
  onSelect: () => void;
}

export default function ProfileScreen({ onSelect }: Props) {
  const [lastId, setLastId] = useState<string | null>(null);

  useEffect(() => {
    loadLastProfileId().then(setLastId);
  }, []);

  async function choose(id: string) {
    await setActiveProfile(id);
    onSelect();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who is practicing?</Text>
      {PROFILES.map((p) => (
        <TouchableOpacity key={p.id} style={styles.card} onPress={() => choose(p.id)}>
          <Text style={styles.emoji}>{p.emoji}</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{p.title}</Text>
            <Text style={styles.cardSubtitle}>{p.subtitle}</Text>
            {lastId === p.id && <Text style={styles.lastUsed}>Last used</Text>}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: { color: "#f8fafc", fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 12 },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  emoji: { fontSize: 40 },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "700" },
  cardSubtitle: { color: "#94a3b8", fontSize: 13 },
  lastUsed: { color: "#38bdf8", fontSize: 11, fontWeight: "700", marginTop: 2 },
});
