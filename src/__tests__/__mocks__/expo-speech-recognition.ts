export const ExpoSpeechRecognitionModule = {
  isRecognitionAvailable: jest.fn().mockReturnValue(true),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  start: jest.fn(),
  stop: jest.fn(),
};
export const useSpeechRecognitionEvent = jest.fn();
