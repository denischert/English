import {
  isAzurePronunciationConfigured,
  startPronunciationAssessment,
  feedbackFromAssessment,
  accentIssuesFromAssessment,
  PronunciationAssessment,
} from "../azurePronunciation";
import { mockSdkResult, ResultReason } from "./__mocks__/speech-sdk";

// ── helpers ──────────────────────────────────────────────────────────────────

function makeAssessment(overrides: Partial<PronunciationAssessment> = {}): PronunciationAssessment {
  return {
    accuracyScore: 85,
    fluencyScore: 80,
    completenessScore: 100,
    prosodyScore: 75,
    pronScore: 82,
    words: [],
    ...overrides,
  };
}

// ── isAzurePronunciationConfigured ───────────────────────────────────────────

describe("isAzurePronunciationConfigured", () => {
  it("returns false when env vars are absent", () => {
    expect(isAzurePronunciationConfigured()).toBe(false);
  });
});

// ── startPronunciationAssessment ─────────────────────────────────────────────

describe("startPronunciationAssessment", () => {
  it("returns null when Azure is not configured", () => {
    const result = startPronunciationAssessment("hello");
    expect(result).toBeNull();
  });

  it("returns null on NoMatch via mock", () => {
    mockSdkResult({ reason: ResultReason.NoMatch });
    const { SpeechRecognizer } = require("./__mocks__/speech-sdk");
    const rec = new SpeechRecognizer({}, {});
    let resolvedValue: any = "unset";
    rec.recognizeOnceAsync((r: any) => { resolvedValue = r; }, () => {});
    expect(resolvedValue.reason).toBe(ResultReason.NoMatch);
  });

  it("invokes the success callback with the mocked result", () => {
    mockSdkResult({ reason: ResultReason.RecognizedSpeech, privJson: null });
    const { SpeechRecognizer } = require("./__mocks__/speech-sdk");
    const rec = new SpeechRecognizer({}, {});
    let called = false;
    rec.recognizeOnceAsync((r: any) => { called = true; }, () => {});
    expect(called).toBe(true);
  });
});

// ── feedbackFromAssessment ────────────────────────────────────────────────────

describe("feedbackFromAssessment", () => {
  it("gives 'Excellent' verdict for score >= 90", () => {
    const fb = feedbackFromAssessment(makeAssessment({ pronScore: 93 }));
    expect(fb).toContain("Excellent");
  });

  it("gives 'Good' verdict for score 75-89", () => {
    const fb = feedbackFromAssessment(makeAssessment({ pronScore: 82 }));
    expect(fb).toContain("Good pronunciation");
  });

  it("gives 'Decent' verdict for score 55-74", () => {
    const fb = feedbackFromAssessment(makeAssessment({ pronScore: 65 }));
    expect(fb).toContain("Decent attempt");
  });

  it("gives 'Keep practising' verdict for score < 55", () => {
    const fb = feedbackFromAssessment(makeAssessment({ pronScore: 40 }));
    expect(fb).toContain("Keep practising");
  });

  it("lists mispronounced words sorted worst-first", () => {
    const fb = feedbackFromAssessment(makeAssessment({
      pronScore: 70,
      words: [
        { word: "leverage", accuracyScore: 60, errorType: "Mispronunciation" },
        { word: "quarterly", accuracyScore: 35, errorType: "Mispronunciation" },
        { word: "the", accuracyScore: 98, errorType: "None" },
      ],
    }));
    expect(fb).toContain("Mispronounced");
    expect(fb.indexOf('"quarterly"')).toBeLessThan(fb.indexOf('"leverage"'));
  });

  it("reports dropped words", () => {
    const fb = feedbackFromAssessment(makeAssessment({
      pronScore: 70,
      words: [{ word: "loop", accuracyScore: 0, errorType: "Omission" }],
    }));
    expect(fb).toContain("Dropped word");
    expect(fb).toContain('"loop"');
  });

  it("reports inserted words", () => {
    const fb = feedbackFromAssessment(makeAssessment({
      pronScore: 70,
      words: [{ word: "um", accuracyScore: 0, errorType: "Insertion" }],
    }));
    expect(fb).toContain("Extra word");
    expect(fb).toContain('"um"');
  });

  it("adds fluency tip when fluencyScore < 70", () => {
    const fb = feedbackFromAssessment(makeAssessment({ pronScore: 80, fluencyScore: 55 }));
    expect(fb).toContain("Fluency is low");
  });

  it("adds mild fluency tip when fluencyScore is 70-84", () => {
    const fb = feedbackFromAssessment(makeAssessment({ pronScore: 80, fluencyScore: 75 }));
    expect(fb).toContain("smoother");
  });

  it("adds completeness tip when completenessScore < 80", () => {
    const fb = feedbackFromAssessment(makeAssessment({ pronScore: 80, completenessScore: 60 }));
    expect(fb).toContain("full sentence");
  });

  it("adds prosody tip when prosodyScore < 60", () => {
    const fb = feedbackFromAssessment(makeAssessment({ pronScore: 80, prosodyScore: 45 }));
    expect(fb).toContain("intonation");
  });

  it("omits fluency/completeness/prosody tips when scores are good", () => {
    const fb = feedbackFromAssessment(makeAssessment({
      pronScore: 92,
      fluencyScore: 90,
      completenessScore: 100,
      prosodyScore: 85,
      words: [],
    }));
    expect(fb).not.toContain("Fluency");
    expect(fb).not.toContain("full sentence");
    expect(fb).not.toContain("intonation");
  });
});

// ── accentIssuesFromAssessment ───────────────────────────────────────────────

describe("accentIssuesFromAssessment", () => {
  it("returns empty array when all phonemes score above threshold", () => {
    const issues = accentIssuesFromAssessment(makeAssessment({
      words: [{
        word: "thanks",
        accuracyScore: 95,
        errorType: "None",
        phonemes: [
          { phoneme: "θ", accuracyScore: 92 },
          { phoneme: "æ", accuracyScore: 95 },
        ],
      }],
    }));
    expect(issues).toEqual([]);
  });

  it("flags low-scoring phonemes worst-first with a tip", () => {
    const issues = accentIssuesFromAssessment(makeAssessment({
      words: [{
        word: "right",
        accuracyScore: 60,
        errorType: "None",
        phonemes: [
          { phoneme: "ɹ", accuracyScore: 40 },
          { phoneme: "θ", accuracyScore: 65 },
          { phoneme: "t", accuracyScore: 95 },
        ],
      }],
    }));
    expect(issues.length).toBe(2);
    expect(issues[0].phoneme).toBe("ɹ");
    expect(issues[0].accuracy).toBe(40);
    expect(issues[0].word).toBe("right");
    expect(issues[0].tip).toContain("American R");
    expect(issues[1].phoneme).toBe("θ");
  });

  it("averages the same phoneme across words and reports the worst word", () => {
    const issues = accentIssuesFromAssessment(makeAssessment({
      words: [
        {
          word: "right", accuracyScore: 80, errorType: "None",
          phonemes: [{ phoneme: "ɹ", accuracyScore: 70 }],
        },
        {
          word: "quarter", accuracyScore: 60, errorType: "None",
          phonemes: [{ phoneme: "ɹ", accuracyScore: 30 }],
        },
      ],
    }));
    expect(issues.length).toBe(1);
    expect(issues[0].accuracy).toBe(50); // (70+30)/2
    expect(issues[0].word).toBe("quarter"); // where it scored worst
  });

  it("ignores omitted and inserted words", () => {
    const issues = accentIssuesFromAssessment(makeAssessment({
      words: [{
        word: "loop", accuracyScore: 0, errorType: "Omission",
        phonemes: [{ phoneme: "l", accuracyScore: 0 }],
      }],
    }));
    expect(issues).toEqual([]);
  });

  it("limits to 5 issues", () => {
    const phonemes = ["ɹ", "θ", "ð", "æ", "ɪ", "ʌ", "w"].map((p) => ({ phoneme: p, accuracyScore: 20 }));
    const issues = accentIssuesFromAssessment(makeAssessment({
      words: [{ word: "x", accuracyScore: 20, errorType: "None", phonemes }],
    }));
    expect(issues.length).toBe(5);
  });

  it("provides a default tip for unmapped phonemes", () => {
    const issues = accentIssuesFromAssessment(makeAssessment({
      words: [{
        word: "x", accuracyScore: 50, errorType: "None",
        phonemes: [{ phoneme: "ʔ", accuracyScore: 50 }],
      }],
    }));
    expect(issues[0].tip.length).toBeGreaterThan(0);
  });
});
