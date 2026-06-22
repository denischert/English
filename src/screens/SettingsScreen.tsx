import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  AudioDevice,
  getSelectedMicId,
  getSelectedSpeakerId,
  listAudioDevices,
  requestMicAccess,
  setSelectedMicId,
  setSelectedSpeakerId,
  supportsSinkId,
} from "../audioDevices";

interface Props {
  onClose: () => void;
}

export default function SettingsScreen({ onClose }: Props) {
  const [inputs, setInputs] = useState<AudioDevice[]>([]);
  const [outputs, setOutputs] = useState<AudioDevice[]>([]);
  const [micId, setMicId] = useState<string | null>(null);
  const [speakerId, setSpeakerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      await requestMicAccess();
      const devices = await listAudioDevices();
      setInputs(devices.inputs);
      setOutputs(devices.outputs);
      setMicId(await getSelectedMicId());
      setSpeakerId(await getSelectedSpeakerId());
      setError(null);
    } catch {
      setError("Couldn't access audio devices. Allow microphone access and try again.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function selectMic(deviceId: string | null) {
    setMicId(deviceId);
    await setSelectedMicId(deviceId);
  }

  async function selectSpeaker(deviceId: string | null) {
    setSpeakerId(deviceId);
    await setSelectedSpeakerId(deviceId);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Audio devices</Text>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <Text style={styles.sectionLabel}>MICROPHONE</Text>
      <Text style={styles.helpText}>Used to record your practice attempts.</Text>
      <DeviceOption label="System default" selected={micId === null} onPress={() => selectMic(null)} />
      {inputs.map((d) => (
        <DeviceOption
          key={d.deviceId}
          label={d.label}
          selected={micId === d.deviceId}
          onPress={() => selectMic(d.deviceId)}
        />
      ))}

      <Text style={[styles.sectionLabel, styles.sectionSpacing]}>SPEAKER</Text>
      <Text style={styles.helpText}>
        {supportsSinkId()
          ? "Used for playback. Note: this browser cannot redirect spoken prompts (text-to-speech) to a chosen output device — only your OS-level default output is used for those. This setting has no effect on this device."
          : "This browser doesn't support choosing an output device. Spoken prompts always play through your OS-level default output."}
      </Text>
      <DeviceOption label="System default" selected={speakerId === null} onPress={() => selectSpeaker(null)} />
      {outputs.map((d) => (
        <DeviceOption
          key={d.deviceId}
          label={d.label}
          selected={speakerId === d.deviceId}
          onPress={() => selectSpeaker(d.deviceId)}
        />
      ))}

      <TouchableOpacity style={styles.refreshButton} onPress={load}>
        <Text style={styles.refreshButtonText}>Refresh device list</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function DeviceOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.option, selected && styles.optionSelected]} onPress={onPress}>
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 20, paddingTop: 60, gap: 8 },
  title: { color: "#f8fafc", fontSize: 22, fontWeight: "800", marginBottom: 8 },
  sectionLabel: { color: "#38bdf8", fontSize: 12, fontWeight: "700", letterSpacing: 1, marginTop: 4 },
  sectionSpacing: { marginTop: 20 },
  helpText: { color: "#94a3b8", fontSize: 13, marginBottom: 6 },
  errorText: { color: "#f87171", fontSize: 14 },
  option: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  optionSelected: { borderColor: "#38bdf8" },
  optionText: { color: "#cbd5e1", fontSize: 14 },
  optionTextSelected: { color: "#f8fafc", fontWeight: "700" },
  refreshButton: { alignItems: "center", padding: 12, marginTop: 16 },
  refreshButtonText: { color: "#64748b", fontSize: 13 },
  closeButton: { backgroundColor: "#38bdf8", borderRadius: 12, padding: 14, alignItems: "center", marginTop: 8 },
  closeButtonText: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
});
