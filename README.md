# Business English Coach

A React Native (Expo) app for practicing American business English: pronunciation via shadowing drills, and executive phrasing via business scenario prompts. Designed for 10-minute sessions, 3x/week.

## How a session works

Each session is 6 rounds (~10 minutes), alternating:
- **Shadowing**: the app speaks a sentence (TTS), you repeat it, on-device speech recognition transcribes you, and you get a similarity score + pronunciation tip.
- **Scenario**: the app gives a business situation and prompt, you respond out loud, and you're scored on executive tone (filler words, decisiveness) with a stronger reference phrase shown.

Progress (sessions/week, streak) is stored locally on-device. You can enable Mon/Wed/Fri reminders from the home screen.

## Running it

This app uses native modules (`expo-speech`, `expo-speech-recognition`, `expo-notifications`) that require a custom dev client — it will **not** fully work in the plain Expo Go app or in a web browser (speech recognition is iOS/Android only).

### On macOS, to run on iOS Simulator or your iPhone:

```bash
npm install
npx expo prebuild --platform ios
npx expo run:ios
```

This builds a development client with the native speech modules and installs it on a connected device/simulator. For Android, use `npx expo run:android` instead.

### Day-to-day development

Once you've built and installed the dev client once on your device:

```bash
npx expo start
```

Scan the QR code with the camera app (it will open in your custom dev client, not Expo Go).

## Project structure

- `src/content/` — shadowing sentences and business scenario prompts
- `src/scoring.ts` — pronunciation similarity scoring and executive-tone scoring
- `src/sessionPlan.ts` — builds a randomized 6-round session
- `src/useVoice.ts` — wraps text-to-speech and speech recognition into `speak()`/`listen()`
- `src/storage.ts` — local session history, weekly goal, streak tracking
- `src/notifications.ts` — schedules Mon/Wed/Fri local reminders
- `src/screens/HomeScreen.tsx` — progress dashboard and session launcher
- `src/screens/SessionScreen.tsx` — the practice loop
