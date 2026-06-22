import AsyncStorage from "@react-native-async-storage/async-storage";

const MIC_KEY = "bec_mic_device_v1";
const SPEAKER_KEY = "bec_speaker_device_v1";

export interface AudioDevice {
  deviceId: string;
  label: string;
}

function hasMediaDevices(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.enumerateDevices === "function"
  );
}

// Device labels are blank until the mic permission has been granted at least
// once, so callers should request getUserMedia before calling this.
export async function listAudioDevices(): Promise<{
  inputs: AudioDevice[];
  outputs: AudioDevice[];
}> {
  if (!hasMediaDevices()) return { inputs: [], outputs: [] };

  const devices = await navigator.mediaDevices.enumerateDevices();
  const inputs = devices
    .filter((d) => d.kind === "audioinput")
    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
  const outputs = devices
    .filter((d) => d.kind === "audiooutput")
    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Speaker ${i + 1}` }));

  return { inputs, outputs };
}

// Browsers only expose device labels after a getUserMedia call has been
// granted in this session, so this is a cheap way to "warm up" enumeration.
export async function requestMicAccess(): Promise<void> {
  if (!hasMediaDevices()) return;
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((t) => t.stop());
}

export async function getSelectedMicId(): Promise<string | null> {
  return AsyncStorage.getItem(MIC_KEY);
}

export async function setSelectedMicId(deviceId: string | null): Promise<void> {
  if (deviceId) {
    await AsyncStorage.setItem(MIC_KEY, deviceId);
  } else {
    await AsyncStorage.removeItem(MIC_KEY);
  }
}

export async function getSelectedSpeakerId(): Promise<string | null> {
  return AsyncStorage.getItem(SPEAKER_KEY);
}

export async function setSelectedSpeakerId(deviceId: string | null): Promise<void> {
  if (deviceId) {
    await AsyncStorage.setItem(SPEAKER_KEY, deviceId);
  } else {
    await AsyncStorage.removeItem(SPEAKER_KEY);
  }
}

// HTMLMediaElement.setSinkId lets you redirect <audio>/<video> playback to a
// chosen output device. It does NOT work for window.speechSynthesis (the API
// expo-speech uses on web) — no browser exposes a way to pick the output
// device for synthesized speech, so the "speaker" preference here only
// affects audio elements, not the spoken prompts themselves.
export function supportsSinkId(): boolean {
  return typeof document !== "undefined" && "setSinkId" in (document.createElement("audio") as any);
}
