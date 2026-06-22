import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useVoice } from "../useVoice";
import { buildSessionPlan, PlannedRound } from "../sessionPlan";
import { scoreScenario, scoreShadowing } from "../scoring";
import { RoundResult, SessionRecord } from "../types";
import { addSession } from "../storage";
import { startWavRecording, WavRecorder } from "../recordWav";
import { assessPronunciation, feedbackFromAssessment, isAzurePronunciationConfigured } from "../azurePronunciation";

type Phase = "idle" | "playing-target" | "ready" | "listening" | "feedback" | "done";

interface Props {
  onFinish: (record: SessionRecord) => void;
  onExit: () => void;
}

export default function SessionScreen({ onFinish, onExit }: Props) {
  const { speak, listen, stopListening, isSpeaking, isListening, transcript, error } = useVoice();
  const [plan] = useState<PlannedRound[]>(() => buildSessionPlan());
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [results, setResults] = useState<RoundResult[]>([]);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const startTimeRef = useRef(Date.now());
  const recorderRef = useRef<WavRecorder | null>(null);

  const round = plan[roundIndex];

  const targetText =
    round?.type === "shadowing"
      ? round.shadowing!.text
      : round?.scenario
      ? `Respond to: ${round.scenario.prompt}`
      : "";

  async function runRound() {
    if (!round) return;
    setPhase("playing-target");
    if (round.type === "shadowing") {
      await speak(round.shadowing!.text);
    } else {
      await speak(round.scenario!.prompt);
    }
    setPhase("ready");
  }

  // Started directly from the user's tap so browsers (Safari in particular)
  // treat the microphone request as coming from a real user gesture.
  async function startRecording() {
    if (!round) return;
    setPhase("listening");
    if (round.type === "shadowing") {
      if (isAzurePronunciationConfigured()) {
        try {
          recorderRef.current = await startWavRecording();
        } catch {
          recorderRef.current = null;
        }
      }
      const heard = await listen(30000);
      let score: number;
      let feedback: string;
      const recorder = recorderRef.current;
      recorderRef.current = null;
      let assessment = null;
      if (recorder) {
        try {
          const audio = await recorder.stop();
          assessment = await assessPronunciation(round.shadowing!.text, audio);
        } catch {
          assessment = null;
        }
      }
      if (assessment) {
        score = Math.round(assessment.pronScore);
        feedback = feedbackFromAssessment(assessment);
      } else {
        ({ score, feedback } = scoreShadowing(round.shadowing!.text, heard));
      }
      const result: RoundResult = {
        type: "shadowing",
        itemId: round.shadowing!.id,
        targetText: round.shadowing!.text,
        heardText: heard,
        score,
        feedback,
      };
      setLastResult(result);
      setResults((r) => [...r, result]);
      setPhase("feedback");
    } else {
      const heard = await listen(30000);
      const { score, feedback } = scoreScenario(round.scenario!.strongPhrase, heard);
      const result: RoundResult = {
        type: "scenario",
        itemId: round.scenario!.id,
        targetText: round.scenario!.strongPhrase,
        heardText: heard,
        score,
        feedback,
      };
      setLastResult(result);
      setResults((r) => [...r, result]);
      setPhase("feedback");
    }
  }

  useEffect(() => {
    startTimeRef.current = Date.now();
    runRound();
  }, []);

  async function handleNext() {
    if (roundIndex + 1 < plan.length) {
      setRoundIndex((i) => i + 1);
      setLastResult(null);
      setTimeout(runRound, 0);
    } else {
      const allResults = results;
      const avg =
        allResults.length > 0
          ? Math.round(allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length)
          : 0;
      const record: SessionRecord = {
        id: `${Date.now()}`,
        dateISO: new Date().toISOString(),
        durationSec: Math.round((Date.now() - startTimeRef.current) / 1000),
        rounds: allResults,
        averageScore: avg,
      };
      await addSession(record);
      setPhase("done");
      onFinish(record);
    }
  }

  if (!round) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.progress}>
        Round {roundIndex + 1} of {plan.length}
      </Text>

      {round.type === "shadowing" ? (
        <View style={styles.card}>
          <Text style={styles.label}>SHADOW THIS SENTENCE</Text>
          <Text style={styles.target}>{round.shadowing!.text}</Text>
          <Text style={styles.tip}>{round.shadowing!.tip}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>BUSINESS SCENARIO</Text>
          <Text style={styles.context}>{round.scenario!.context}</Text>
          <Text style={styles.target}>{round.scenario!.prompt}</Text>
        </View>
      )}

      <View style={styles.statusBox}>
        {phase === "playing-target" && (
          <>
            <ActivityIndicator />
            <Text style={styles.status}>Listen…</Text>
          </>
        )}
        {phase === "ready" && (
          <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
            <Text style={styles.recordButtonText}>Start recording</Text>
          </TouchableOpacity>
        )}
        {phase === "listening" && (
          <>
            <ActivityIndicator />
            <Text style={styles.status}>Your turn — speak now</Text>
            {!!transcript && <Text style={styles.transcript}>"{transcript}"</Text>}
            <TouchableOpacity style={styles.stopButton} onPress={stopListening}>
              <Text style={styles.stopButtonText}>Stop recording</Text>
            </TouchableOpacity>
          </>
        )}
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {phase === "feedback" && lastResult && (
        <View style={styles.feedbackCard}>
          <Text style={styles.scoreText}>{lastResult.score}/100</Text>
          <Text style={styles.heard}>You said: "{lastResult.heardText || "(nothing heard)"}"</Text>
          <Text style={styles.feedback}>{lastResult.feedback}</Text>

          <TouchableOpacity style={styles.secondaryButton} onPress={runRound}>
            <Text style={styles.secondaryButtonText}>Try again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>
              {roundIndex + 1 < plan.length ? "Next round" : "Finish session"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <Text style={styles.exitButtonText}>Exit session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 20, paddingTop: 60, gap: 16 },
  progress: { color: "#94a3b8", fontSize: 14, textAlign: "center" },
  card: { backgroundColor: "#1e293b", borderRadius: 16, padding: 20, gap: 8 },
  label: { color: "#38bdf8", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  context: { color: "#cbd5e1", fontSize: 14, fontStyle: "italic" },
  target: { color: "#f8fafc", fontSize: 20, fontWeight: "600", lineHeight: 28 },
  tip: { color: "#94a3b8", fontSize: 13 },
  statusBox: { alignItems: "center", gap: 8, minHeight: 60 },
  status: { color: "#e2e8f0", fontSize: 15 },
  transcript: { color: "#facc15", fontSize: 16, fontStyle: "italic", textAlign: "center" },
  recordButton: { backgroundColor: "#22c55e", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28 },
  recordButtonText: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
  stopButton: { backgroundColor: "#ef4444", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, marginTop: 8 },
  stopButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  errorText: { color: "#f87171", fontSize: 14, textAlign: "center", marginTop: 4 },
  feedbackCard: { backgroundColor: "#1e293b", borderRadius: 16, padding: 20, gap: 10 },
  scoreText: { color: "#4ade80", fontSize: 32, fontWeight: "800", textAlign: "center" },
  heard: { color: "#e2e8f0", fontSize: 15 },
  feedback: { color: "#cbd5e1", fontSize: 14, lineHeight: 20 },
  primaryButton: { backgroundColor: "#38bdf8", borderRadius: 12, padding: 14, alignItems: "center" },
  primaryButtonText: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
  secondaryButton: { borderColor: "#475569", borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  secondaryButtonText: { color: "#cbd5e1", fontWeight: "600" },
  exitButton: { alignItems: "center", padding: 12 },
  exitButtonText: { color: "#64748b", fontSize: 13 },
});
