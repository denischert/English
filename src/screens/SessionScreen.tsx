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
import { scoreScenario, starsForAttempt } from "../scoring";
import { RoundResult, SessionRecord } from "../types";
import { addSession } from "../storage";
import {
  startPronunciationAssessment,
  feedbackFromAssessment,
  accentIssuesFromAssessment,
  isAzurePronunciationConfigured,
  PronunciationAssessment,
} from "../azurePronunciation";
import { getSelectedMicId } from "../audioDevices";

type Phase = "idle" | "playing-target" | "ready" | "listening" | "scoring" | "feedback" | "done";

interface Props {
  onFinish: (record: SessionRecord) => void;
  onExit: () => void;
}

export default function SessionScreen({ onFinish, onExit }: Props) {
  const { speak, listen, stopListening, error } = useVoice();
  const [plan] = useState<PlannedRound[]>(() => buildSessionPlan());
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [roundResults, setRoundResults] = useState<Record<number, RoundResult>>({});
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const startTimeRef = useRef(Date.now());
  const assessorRef = useRef<{ stop: () => Promise<PronunciationAssessment | null> } | null>(null);
  const attemptsRef = useRef<Record<number, number>>({});
  const [azureError, setAzureError] = useState<string | null>(null);

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
    setAzureError(null);
    attemptsRef.current[roundIndex] = (attemptsRef.current[roundIndex] ?? 0) + 1;
    const attempts = attemptsRef.current[roundIndex];
    if (round.type === "shadowing") {
      // Shadowing is scored exclusively by Azure pronunciation assessment.
      // Recording runs until the user presses "Stop recording" — pauses in
      // speech do not end it.
      if (!isAzurePronunciationConfigured()) {
        setAzureError("Azure Speech key/region not configured in this build.");
        return;
      }
      try {
        const micId = await getSelectedMicId();
        assessorRef.current = startPronunciationAssessment(round.shadowing!.text, micId ?? undefined);
        setPhase("listening");
      } catch (e) {
        console.error("Failed to start pronunciation assessment:", e);
        setAzureError(e instanceof Error ? e.message : String(e));
        assessorRef.current = null;
      }
    } else {
      // Scenario rounds record the same way as shadowing: continuous, with a
      // manual stop. Azure runs in unscripted mode (no reference text): it
      // transcribes for the phrasing score AND assesses pronunciation of
      // whatever was said.
      if (isAzurePronunciationConfigured()) {
        try {
          const micId = await getSelectedMicId();
          assessorRef.current = startPronunciationAssessment("", micId ?? undefined);
          setPhase("listening");
        } catch (e) {
          console.error("Failed to start speech capture:", e);
          setAzureError(e instanceof Error ? e.message : String(e));
          assessorRef.current = null;
        }
      } else {
        // Fallback: browser speech recognition (auto-stops on silence).
        setPhase("listening");
        const heard = await listen(30000);
        finishScenarioRound(heard, attempts, null);
      }
    }
  }

  // Ends a scenario recording; scores phrasing and attaches accent analysis.
  async function stopScenarioRecording() {
    const assessor = assessorRef.current;
    assessorRef.current = null;
    if (!assessor || !round) return;
    setPhase("scoring");
    const attempts = attemptsRef.current[roundIndex] ?? 1;
    let assessment: PronunciationAssessment | null = null;
    try {
      assessment = await assessor.stop();
    } catch (e) {
      console.error("Azure speech capture failed:", e);
      setAzureError(e instanceof Error ? e.message : String(e));
    }
    if (!assessment?.recognizedText) {
      if (!azureError) setAzureError("No speech detected — press Start recording and try again.");
      setPhase("ready");
      return;
    }
    finishScenarioRound(assessment.recognizedText, attempts, assessment);
  }

  function finishScenarioRound(heard: string, attempts: number, assessment: PronunciationAssessment | null) {
    if (!round) return;
    const { score, feedback } = scoreScenario(round.scenario!.strongPhrase, heard);
    const result: RoundResult = {
      type: "scenario",
      itemId: round.scenario!.id,
      targetText: round.scenario!.strongPhrase,
      heardText: heard,
      score,
      feedback,
      attempts,
      stars: starsForAttempt(score, attempts),
      breakdown: assessment
        ? {
            accuracy: Math.round(assessment.accuracyScore),
            fluency: Math.round(assessment.fluencyScore),
            completeness: Math.round(assessment.completenessScore),
            prosody: Math.round(assessment.prosodyScore),
          }
        : undefined,
      accentIssues: assessment ? accentIssuesFromAssessment(assessment) : undefined,
    };
    setLastResult(result);
    setRoundResults((r) => ({ ...r, [roundIndex]: result }));
    setPhase("feedback");
  }

  // Ends a shadowing recording and scores it with the Azure result.
  async function stopShadowingRecording() {
    const assessor = assessorRef.current;
    assessorRef.current = null;
    if (!assessor || !round) return;
    setPhase("scoring");
    const attempts = attemptsRef.current[roundIndex] ?? 1;
    let assessment = null;
    try {
      assessment = await assessor.stop();
    } catch (e) {
      console.error("Azure pronunciation assessment failed:", e);
      setAzureError(e instanceof Error ? e.message : String(e));
    }
    if (!assessment) {
      // No speech detected (or Azure failed) — let the user retry rather
      // than recording a meaningless score.
      if (!azureError) setAzureError("No speech detected — press Start recording and try again.");
      setPhase("ready");
      return;
    }
    const result: RoundResult = {
      type: "shadowing",
      itemId: round.shadowing!.id,
      targetText: round.shadowing!.text,
      heardText: "",
      score: Math.round(assessment.pronScore),
      feedback: feedbackFromAssessment(assessment),
      attempts,
      stars: starsForAttempt(Math.round(assessment.pronScore), attempts),
      breakdown: {
        accuracy: Math.round(assessment.accuracyScore),
        fluency: Math.round(assessment.fluencyScore),
        completeness: Math.round(assessment.completenessScore),
        prosody: Math.round(assessment.prosodyScore),
      },
      accentIssues: accentIssuesFromAssessment(assessment),
    };
    setLastResult(result);
    setRoundResults((r) => ({ ...r, [roundIndex]: result }));
    setPhase("feedback");
  }

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  // Re-runs whenever the round changes so it always plays the sentence for
  // the round that's current at the time this effect fires, never a stale
  // one captured by an earlier render's closure.
  useEffect(() => {
    runRound();
  }, [roundIndex]);

  async function handleNext() {
    if (roundIndex + 1 < plan.length) {
      setRoundIndex((i) => i + 1);
      setLastResult(null);
    } else {
      const allResults = plan.map((_, i) => roundResults[i]).filter((r): r is RoundResult => !!r);
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
        totalStars: allResults.reduce((sum, r) => sum + r.stars, 0),
        maxStars: plan.length * 3,
      };
      await addSession(record);
      setPhase("done");
      onFinish(record);
    }
  }

  if (!round) return null;

  const azureConfigured = isAzurePronunciationConfigured();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.progress}>
        Round {roundIndex + 1} of {plan.length}
      </Text>
      {!azureConfigured && (
        <Text style={styles.warnText}>
          ⚠️ Azure pronunciation scoring not active — check that AZURE_SPEECH_KEY and AZURE_SPEECH_REGION secrets are set in GitHub and the Actions build completed successfully.
        </Text>
      )}

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
            <Text style={styles.status}>Recording — speak, then press Stop when you're done</Text>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={
                round.type === "shadowing"
                  ? stopShadowingRecording
                  : assessorRef.current
                  ? stopScenarioRecording
                  : stopListening
              }
            >
              <Text style={styles.stopButtonText}>Stop recording</Text>
            </TouchableOpacity>
          </>
        )}
        {phase === "scoring" && (
          <>
            <ActivityIndicator />
            <Text style={styles.status}>Scoring your pronunciation…</Text>
          </>
        )}
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {!!azureError && (
          <Text style={styles.errorText}>Pronunciation assessment unavailable: {azureError}</Text>
        )}
      </View>

      {phase === "feedback" && lastResult && (
        <View style={styles.feedbackCard}>
          <Text style={styles.scoreText}>{lastResult.score}/100</Text>
          <Text style={styles.starsText}>{"★".repeat(lastResult.stars)}{"☆".repeat(3 - lastResult.stars)}</Text>
          <Text style={styles.attemptsText}>
            {lastResult.attempts === 1 ? "First try" : `Attempt ${lastResult.attempts}`}
          </Text>
          <Text style={styles.feedback}>{lastResult.feedback}</Text>

          {lastResult.breakdown && (
            <View style={styles.breakdownBox}>
              <Text style={styles.breakdownTitle}>Score breakdown</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Accuracy score</Text>
                <Text style={styles.breakdownValue}>{lastResult.breakdown.accuracy} / 100</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Fluency score</Text>
                <Text style={styles.breakdownValue}>{lastResult.breakdown.fluency} / 100</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Completeness score</Text>
                <Text style={styles.breakdownValue}>{lastResult.breakdown.completeness} / 100</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Prosody score</Text>
                <Text style={styles.breakdownValue}>{lastResult.breakdown.prosody} / 100</Text>
              </View>
            </View>
          )}

          {lastResult.accentIssues && lastResult.accentIssues.length > 0 && (
            <View style={styles.accentBox}>
              <Text style={styles.breakdownTitle}>American accent check</Text>
              <Text style={styles.accentIntro}>
                These sounds deviated most from the American English model:
              </Text>
              {lastResult.accentIssues.map((issue) => (
                <View key={issue.phoneme} style={styles.accentRow}>
                  <View style={styles.accentHeader}>
                    <Text style={styles.accentPhoneme}>/{issue.phoneme}/</Text>
                    <Text style={styles.accentMeta}>
                      in "{issue.word}" · {issue.accuracy}/100
                    </Text>
                    <TouchableOpacity
                      style={styles.listenButton}
                      onPress={() => speak(issue.word)}
                    >
                      <Text style={styles.listenButtonText}>▶ Listen</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.accentTip}>{issue.tip}</Text>
                </View>
              ))}
              <Text style={styles.accentIntro}>
                Tap ▶ Listen to hear each word, practice it aloud, then press Try again for the full sentence.
              </Text>
            </View>
          )}
          {lastResult.accentIssues && lastResult.accentIssues.length === 0 && lastResult.breakdown && (
            <View style={styles.accentBox}>
              <Text style={styles.breakdownTitle}>American accent check</Text>
              <Text style={styles.accentIntro}>
                All sounds matched the American English model closely — no accent issues detected in this sentence. 🎉
              </Text>
            </View>
          )}

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
  warnText: { color: "#fb923c", fontSize: 13, textAlign: "center", backgroundColor: "#431407", borderRadius: 8, padding: 10 },
  feedbackCard: { backgroundColor: "#1e293b", borderRadius: 16, padding: 20, gap: 10 },
  scoreText: { color: "#4ade80", fontSize: 32, fontWeight: "800", textAlign: "center" },
  starsText: { color: "#facc15", fontSize: 22, textAlign: "center", letterSpacing: 2 },
  attemptsText: { color: "#94a3b8", fontSize: 12, textAlign: "center", marginTop: -6 },
  breakdownBox: { backgroundColor: "#0f172a", borderRadius: 10, padding: 12, gap: 6, marginTop: 4 },
  breakdownTitle: { color: "#38bdf8", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between" },
  breakdownLabel: { color: "#cbd5e1", fontSize: 13 },
  breakdownValue: { color: "#f8fafc", fontSize: 13, fontWeight: "700" },
  accentBox: { backgroundColor: "#0f172a", borderRadius: 10, padding: 12, gap: 10, marginTop: 4 },
  accentIntro: { color: "#94a3b8", fontSize: 12 },
  accentRow: { gap: 3 },
  accentHeader: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  accentPhoneme: { color: "#facc15", fontSize: 16, fontWeight: "800" },
  accentMeta: { color: "#94a3b8", fontSize: 12, flex: 1 },
  listenButton: {
    backgroundColor: "#1e3a8a",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  listenButtonText: { color: "#93c5fd", fontSize: 12, fontWeight: "700" },
  accentTip: { color: "#cbd5e1", fontSize: 12, lineHeight: 17 },
  heard: { color: "#e2e8f0", fontSize: 15 },
  feedback: { color: "#cbd5e1", fontSize: 14, lineHeight: 22 },
  primaryButton: { backgroundColor: "#38bdf8", borderRadius: 12, padding: 14, alignItems: "center" },
  primaryButtonText: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
  secondaryButton: { borderColor: "#475569", borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  secondaryButtonText: { color: "#cbd5e1", fontWeight: "600" },
  exitButton: { alignItems: "center", padding: 12 },
  exitButtonText: { color: "#64748b", fontSize: 13 },
});
