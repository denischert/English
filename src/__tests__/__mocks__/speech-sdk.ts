export enum ResultReason {
  RecognizedSpeech = 0,
  NoMatch = 1,
  Canceled = 2,
}

export enum PronunciationAssessmentGradingSystem { HundredMark = 1 }
export enum PronunciationAssessmentGranularity { Phoneme = 1 }

export const AudioStreamFormat = {
  getWaveFormatPCM: jest.fn(() => ({})),
};

export const AudioInputStream = {
  createPushStream: jest.fn(() => ({
    write: jest.fn(),
    close: jest.fn(),
  })),
};

export const AudioConfig = {
  fromStreamInput: jest.fn(() => ({})),
};

export class SpeechConfig {
  speechRecognitionLanguage = "";
  static fromSubscription = jest.fn(() => new SpeechConfig());
}

export class PronunciationAssessmentConfig {
  enableProsodyAssessment = false;
  applyTo = jest.fn();
  constructor(
    public referenceText: string,
    public gradingSystem: any,
    public granularity: any,
    public enableMiscue: boolean
  ) {}
}

// Default mock result — tests can override via mockSdkResult()
let _mockResult: any = {
  reason: ResultReason.RecognizedSpeech,
  privJson: JSON.stringify({
    NBest: [{
      Words: [
        { Word: "thanks", PronunciationAssessment: { AccuracyScore: 95, ErrorType: "None" } },
        { Word: "for", PronunciationAssessment: { AccuracyScore: 90, ErrorType: "None" } },
        { Word: "flagging", PronunciationAssessment: { AccuracyScore: 45, ErrorType: "Mispronunciation" } },
        { Word: "this", PronunciationAssessment: { AccuracyScore: 88, ErrorType: "None" } },
      ],
    }],
  }),
};

export function mockSdkResult(result: any) {
  _mockResult = result;
}

export class PronunciationAssessmentResult {
  accuracyScore = 82;
  fluencyScore = 78;
  completenessScore = 100;
  pronunciationScore = 80;
  detailResult = { Words: [] };

  static fromResult = jest.fn(() => new PronunciationAssessmentResult());
}

export class SpeechRecognizer {
  constructor(public speechConfig: any, public audioConfig: any) {}
  recognizeOnceAsync = jest.fn((onSuccess: (r: any) => void, onError: (e: any) => void) => {
    onSuccess(_mockResult);
  });
  close = jest.fn();
}
