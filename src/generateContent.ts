// Generates fresh, personalised practice content with the Claude API:
// shadowing sentences dense in the sounds the accent check keeps flagging,
// and business scenarios aimed at executive presence for a product director.
// Falls back to the static content lists when unconfigured or on any failure.
import Anthropic from "@anthropic-ai/sdk";
import { ShadowingItem, ScenarioItem } from "./types";

const ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY?.trim();

export function isGenerationConfigured(): boolean {
  return Boolean(ANTHROPIC_KEY);
}

export interface GeneratedContent {
  shadowing: ShadowingItem[];
  scenarios: ScenarioItem[];
}

export async function generateSessionContent(
  weakPhonemes: string[]
): Promise<GeneratedContent | null> {
  if (!ANTHROPIC_KEY) return null;

  const phonemeNote =
    weakPhonemes.length > 0
      ? `The learner's pronunciation assessment repeatedly flags these IPA phonemes as their weakest: ${weakPhonemes
          .map((p) => `/${p}/`)
          .join(", ")}. Make the shadowing sentences unusually dense in words containing these sounds, and mention them in the tips.`
      : "No phoneme history yet — cover a broad mix of typically difficult American English sounds (/ɹ/, /θ/, /ð/, /æ/, flapped /t/).";

  const prompt = `You create practice content for a business-English coaching app. The learner is a Product Director working on American pronunciation and executive presence.

${phonemeNote}

Generate exactly this JSON (no markdown fences, no commentary):
{
  "shadowing": [
    { "text": "...", "tip": "..." },
    { "text": "...", "tip": "..." },
    { "text": "...", "tip": "..." }
  ],
  "scenarios": [
    { "context": "...", "prompt": "...", "weakPhrase": "...", "strongPhrase": "..." },
    { "context": "...", "prompt": "...", "weakPhrase": "...", "strongPhrase": "..." },
    { "context": "...", "prompt": "...", "weakPhrase": "...", "strongPhrase": "..." }
  ]
}

Requirements:
- Shadowing sentences: 10–16 words, natural senior-leadership register a Product Director would actually say (roadmap trade-offs, stakeholder alignment, executive updates, vision, prioritisation). Each tip: one short line on stress, rhythm, reductions, or the flagged sounds (use IPA where helpful).
- Scenarios: product-leadership situations that build executive presence (board updates, saying no to a VP, defending a roadmap cut, handling an escalation, communicating strategy). "context" sets the scene in one sentence; "prompt" is the instruction to the learner; "weakPhrase" shows hedged, low-presence wording; "strongPhrase" shows confident, concise, executive wording (one or two sentences).
- Vary content on every call; avoid clichés like "circle back" or "move the needle".`;

  try {
    const client = new Anthropic({
      apiKey: ANTHROPIC_KEY,
      dangerouslyAllowBrowser: true,
    });

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content
      .filter((b): b is { type: "text"; text: string } & typeof b => b.type === "text")
      .map((b) => b.text)
      .join("");

    // Tolerate accidental code fences around the JSON.
    const jsonText = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
    const parsed = JSON.parse(jsonText);

    const shadowing: ShadowingItem[] = (parsed.shadowing ?? [])
      .filter((s: any) => typeof s?.text === "string" && s.text.length > 0)
      .slice(0, 3)
      .map((s: any, i: number) => ({
        id: `gen-sh-${Date.now()}-${i}`,
        text: s.text,
        tip: typeof s.tip === "string" ? s.tip : "",
      }));

    const scenarios: ScenarioItem[] = (parsed.scenarios ?? [])
      .filter(
        (s: any) =>
          typeof s?.prompt === "string" && typeof s?.strongPhrase === "string" && s.strongPhrase.length > 0
      )
      .slice(0, 3)
      .map((s: any, i: number) => ({
        id: `gen-sc-${Date.now()}-${i}`,
        context: typeof s.context === "string" ? s.context : "",
        prompt: s.prompt,
        weakPhrase: typeof s.weakPhrase === "string" ? s.weakPhrase : "",
        strongPhrase: s.strongPhrase,
      }));

    if (shadowing.length < 3 || scenarios.length < 3) {
      console.warn("Generated content incomplete, falling back to static lists");
      return null;
    }

    return { shadowing, scenarios };
  } catch (e) {
    console.warn("Content generation failed, falling back to static lists:", e);
    return null;
  }
}
