/**
 * Integration test script for the Azure Speech SDK pronunciation assessment.
 *
 * Usage:
 *   EXPO_PUBLIC_AZURE_SPEECH_KEY=<key> EXPO_PUBLIC_AZURE_SPEECH_REGION=<region> \
 *     npx ts-node scripts/test-azure-sdk.ts [path/to/recording.wav]
 *
 * If no WAV file is supplied, a synthetic 2-second sine-wave WAV is used.
 * For a meaningful pronunciation score, pass a real recording of yourself
 * saying the reference sentence below.
 */

import * as fs from "fs";
import * as path from "path";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

const AZURE_KEY = process.env.EXPO_PUBLIC_AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.EXPO_PUBLIC_AZURE_SPEECH_REGION;
const REFERENCE_TEXT = "Thanks for flagging this, I'll loop in the right people.";

// ── Synthetic WAV generator (silence / sine tone) ───────────────────────────

function generateSineWav(durationSec: number, sampleRate = 16000, freq = 440): Buffer {
  const numSamples = durationSec * sampleRate;
  const dataBytes = numSamples * 2; // 16-bit PCM
  const buf = Buffer.alloc(44 + dataBytes);

  // RIFF header
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataBytes, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);           // chunk size
  buf.writeUInt16LE(1, 20);            // PCM
  buf.writeUInt16LE(1, 22);            // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buf.writeUInt16LE(2, 32);            // block align
  buf.writeUInt16LE(16, 34);           // bits per sample
  buf.write("data", 36);
  buf.writeUInt32LE(dataBytes, 40);

  for (let i = 0; i < numSamples; i++) {
    const sample = Math.round(0.3 * 32767 * Math.sin(2 * Math.PI * freq * i / sampleRate));
    buf.writeInt16LE(sample, 44 + i * 2);
  }
  return buf;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!AZURE_KEY || !AZURE_REGION) {
    console.error("❌  Missing env vars: EXPO_PUBLIC_AZURE_SPEECH_KEY and/or EXPO_PUBLIC_AZURE_SPEECH_REGION");
    process.exit(1);
  }

  console.log(`🔑  Key: ${AZURE_KEY.slice(0, 4)}${"*".repeat(AZURE_KEY.length - 4)}`);
  console.log(`🌍  Region: ${AZURE_REGION}`);
  console.log(`📝  Reference: "${REFERENCE_TEXT}"\n`);

  // Load audio
  let wavBuffer: Buffer;
  const wavArg = process.argv[2];
  if (wavArg) {
    wavBuffer = fs.readFileSync(path.resolve(wavArg));
    console.log(`🎤  Using WAV file: ${wavArg} (${wavBuffer.byteLength} bytes)\n`);
  } else {
    wavBuffer = generateSineWav(2);
    console.log("🎵  No WAV file supplied — using a 2s synthetic sine tone.\n" +
      "    For a real pronunciation score, record yourself saying the sentence\n" +
      "    and pass the .wav path as the first argument.\n");
  }

  // Set up SDK
  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
  speechConfig.speechRecognitionLanguage = "en-US";

  const pronunciationConfig = new SpeechSDK.PronunciationAssessmentConfig(
    REFERENCE_TEXT,
    SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
    SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
    true
  );
  pronunciationConfig.enableProsodyAssessment = true;

  const pushStream = SpeechSDK.AudioInputStream.createPushStream(
    SpeechSDK.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1)
  );
  // Skip the 44-byte WAV header — push stream expects raw PCM
  pushStream.write(wavBuffer.buffer.slice(44));
  pushStream.close();

  const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(pushStream);
  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  pronunciationConfig.applyTo(recognizer);

  console.log("⏳  Sending to Azure...\n");

  await new Promise<void>((resolve, reject) => {
    recognizer.recognizeOnceAsync(
      (result) => {
        recognizer.close();
        if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const pa = SpeechSDK.PronunciationAssessmentResult.fromResult(result);
          const detail = (result as any).privJson ? JSON.parse((result as any).privJson) : null;
          const words = detail?.NBest?.[0]?.Words ?? [];

          console.log("✅  Assessment result:");
          console.log(`   Pronunciation score : ${pa.pronunciationScore}`);
          console.log(`   Accuracy            : ${pa.accuracyScore}`);
          console.log(`   Fluency             : ${pa.fluencyScore}`);
          console.log(`   Completeness        : ${pa.completenessScore}`);
          console.log(`   Prosody             : ${(pa as any).prosodyScore ?? "n/a"}\n`);

          if (words.length > 0) {
            console.log("   Word-level scores:");
            for (const w of words) {
              const acc = w.PronunciationAssessment?.AccuracyScore ?? "?";
              const err = w.PronunciationAssessment?.ErrorType ?? "None";
              const flag = err !== "None" ? ` ⚠️  ${err}` : "";
              console.log(`     "${w.Word}" — ${acc}%${flag}`);
            }
          }
          resolve();
        } else if (result.reason === SpeechSDK.ResultReason.NoMatch) {
          console.warn("⚠️  NoMatch — Azure could not detect speech in the audio.");
          console.warn("    Try passing a real WAV recording as the first argument.");
          resolve();
        } else {
          reject(new Error(`Recognition failed: ${SpeechSDK.ResultReason[result.reason]}`));
        }
      },
      (err) => {
        recognizer.close();
        reject(new Error(`SDK error: ${err}`));
      }
    );
  });
}

main().catch((e) => {
  console.error("❌ ", e.message);
  process.exit(1);
});
