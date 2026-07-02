/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "src/__tests__/tsconfig.json" }],
  },
  moduleNameMapper: {
    // Stub out React Native / Expo modules that don't run in Node
    "^react-native$": "<rootDir>/src/__tests__/__mocks__/react-native.ts",
    "^expo-speech$": "<rootDir>/src/__tests__/__mocks__/expo-speech.ts",
    "^expo-speech-recognition$": "<rootDir>/src/__tests__/__mocks__/expo-speech-recognition.ts",
    "^@react-native-async-storage/async-storage$": "<rootDir>/src/__tests__/__mocks__/async-storage.ts",
    "^microsoft-cognitiveservices-speech-sdk$":
      "<rootDir>/src/__tests__/__mocks__/speech-sdk.ts",
  },
};
