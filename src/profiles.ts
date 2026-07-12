// Two people share this app: Denis practices American business English, and
// his son practices German for handball training. A profile bundles the
// language, Azure voices, content lists, coaching vocabulary, and a separate
// session history for each of them.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScenarioItem, ShadowingItem } from "./types";
import { SHADOWING_ITEMS } from "./content/shadowing";
import { SCENARIO_ITEMS } from "./content/scenarios";
import { HANDBALL_SHADOWING, HANDBALL_SCENARIOS } from "./content/handball";

export interface Profile {
  id: string;
  name: string;
  emoji: string;
  title: string;
  subtitle: string;
  locale: string; // BCP-47, drives recognition + assessment + TTS fallback
  ttsVoice: string; // Azure neural voice
  accentCheckTitle: string;
  accentCheckIntro: string;
  shadowing: ShadowingItem[];
  scenarios: ScenarioItem[];
  sessionsKey: string; // separate history per profile
  // Locale-specific vocabulary for the scenario phrasing heuristic
  strongMarkers: string[];
  fillerWords: string[];
  phonemeTips: Record<string, string>;
  defaultPhonemeTip: string;
  // Personalised LLM generation only exists for the business-English profile
  allowGeneratedContent: boolean;
}

const AMERICAN_PHONEME_TIPS: Record<string, string> = {
  "ɹ": "The American R: curl the tongue tip back without touching the roof of the mouth, and keep it voiced at the ends of words (car, right, quarter).",
  "θ": "Unvoiced TH (think, through): put the tongue tip lightly between your teeth and blow air — avoid substituting /s/ or /t/.",
  "ð": "Voiced TH (this, the): tongue between teeth with voice on — avoid substituting /z/ or /d/.",
  "æ": "Flat A (cat, flag): open the jaw wide and spread the lips — noticeably more open than the European short 'a'.",
  "ɪ": "Short I (ship, bit): a relaxed, lax vowel — don't tense it into 'ee' (sheep).",
  "iː": "Long EE (sheep, team): tense and long — clearly distinct from short /ɪ/.",
  "ʌ": "The UH vowel (cup, done): central and relaxed, jaw slightly open — not 'ah' or 'oo'.",
  "ə": "Schwa (about, quarter): the most common American vowel — unstressed syllables should be short and totally relaxed.",
  "oʊ": "The O glide (go, loop): American 'o' is a diphthong — start at 'o' and glide to 'u'.",
  "eɪ": "The A glide (day, make): a diphthong — start at 'e' and glide to 'i'.",
  "w": "W (will, quarter): round the lips into a tight circle before releasing — don't let it become /v/.",
  "v": "V (very, five): top teeth on the bottom lip with voice — don't let it become /w/ or /f/.",
  "l": "American L: at the end of words (people, will) it's a 'dark L' — the back of the tongue rises while the tip touches the ridge.",
  "t": "American T: between vowels (better, meeting) it becomes a quick flap, almost a soft 'd' — a hard 't' there sounds British or non-native.",
  "h": "H (help, who): a light breath from the throat — don't drop it or make it too harsh.",
  "ŋ": "NG (flagging, meeting): the back of the tongue closes against the soft palate — no released 'g' or 'k' after it.",
  "dʒ": "J sound (just, manage): starts with a 'd' stop then 'zh' — keep it voiced.",
  "z": "Z (is, was, please): keep it voiced and buzzing — many speakers devoice it to /s/, which sounds non-native.",
};

const GERMAN_PHONEME_TIPS: Record<string, string> = {
  "ç": "The soft 'ich' sound: tongue high like saying 'ee', then breathe out — not 'sh' and not 'k' (ich, nicht, möchte).",
  "x": "The hard 'ach' sound: friction at the back of the throat, like a gentle gargle (noch, Woche, nach).",
  "ʏ": "Short Ü (fünf, drücken): say short 'i' but round your lips tightly.",
  "yː": "Long Ü (üben, über): say long 'ee' with fully rounded lips, and hold it.",
  "œ": "Short Ö (können, Wörter): say short 'e' with rounded lips.",
  "øː": "Long Ö (möchte... schön, Törchen): long 'ay' with rounded lips, held steady — no glide.",
  "ʁ": "German R (Trainer, richtig): made at the back of the throat, softer than rolling — almost like a light gargle.",
  "ɐ": "Final -er (Spieler, Trainer): a relaxed 'ah' — the R almost disappears at the end of words.",
  "ts": "German Z (zusammen, zurück): always 'ts' like in 'cats' — never a buzzing English Z.",
  "v": "German W (Wurf, wie): sounds like English V — teeth on lower lip.",
  "ʃ": "SCH (schnell, Schulter): like English 'sh' but with stronger lip rounding. Also 'st'/'sp' at word start: 'Spiel' = 'shpeel'.",
  "pf": "PF (Pfosten, kämpft): a quick 'p' that releases straight into 'f' — one sound, not two syllables.",
  "aː": "Long A (Trainer sagt: 'klar'): open and held — German distinguishes short and long vowels strictly.",
  "eː": "Long E (gegen, zehn): tense and steady like French 'é' — no glide into 'ay'.",
  "oː": "Long O (Tore, groß): pure and rounded, held steady — no glide like English 'oh-u'.",
  "l": "German L (Ball, spielen): always light, tongue tip at the teeth — never the dark English L.",
};

export const PROFILES: Profile[] = [
  {
    id: "english-business",
    name: "Denis",
    emoji: "🇺🇸",
    title: "Business English Coach",
    subtitle: "American pronunciation & executive phrasing",
    locale: "en-US",
    ttsVoice: "en-US-JennyNeural",
    accentCheckTitle: "American accent check",
    accentCheckIntro: "These sounds deviated most from the American English model:",
    shadowing: SHADOWING_ITEMS,
    scenarios: SCENARIO_ITEMS,
    sessionsKey: "bec_sessions_v1",
    strongMarkers: [
      "i'd like to",
      "i want to",
      "i'd recommend",
      "let's",
      "i'm concerned",
      "based on",
      "to summarize",
      "i can offer",
      "i understand",
      "here's",
      "i won't be able to",
      "i'll",
    ],
    fillerWords: ["um", "umm", "uh", "like", "maybe", "sorry", "just", "kinda", "gonna"],
    phonemeTips: AMERICAN_PHONEME_TIPS,
    defaultPhonemeTip:
      "Listen to the target sentence again and mimic this sound in isolation, then in the full word.",
    allowGeneratedContent: true,
  },
  {
    id: "german-handball",
    name: "Handball",
    emoji: "🤾",
    title: "Handball-Deutsch",
    subtitle: "German practice for talking with your coach",
    locale: "de-DE",
    ttsVoice: "de-DE-KatjaNeural",
    accentCheckTitle: "German pronunciation check",
    accentCheckIntro: "These sounds need the most work compared to native German:",
    shadowing: HANDBALL_SHADOWING,
    scenarios: HANDBALL_SCENARIOS,
    sessionsKey: "bec_sessions_de_v1",
    strongMarkers: [
      "ich möchte",
      "ich würde gerne",
      "entschuldigung",
      "danke für",
      "ich verstehe",
      "können sie",
      "ich arbeite daran",
      "trainer",
      "ich übernehme",
      "woran soll ich",
    ],
    fillerWords: ["äh", "ähm", "halt", "irgendwie", "vielleicht", "sorry", "keine ahnung", "oder so"],
    phonemeTips: GERMAN_PHONEME_TIPS,
    defaultPhonemeTip: "Listen to the word again and copy the sound slowly, then say the full word.",
    allowGeneratedContent: false,
  },
];

const PROFILE_KEY = "bec_profile_v1";

let activeProfile: Profile = PROFILES[0];

export function getActiveProfile(): Profile {
  return activeProfile;
}

export async function setActiveProfile(id: string): Promise<void> {
  const profile = PROFILES.find((p) => p.id === id);
  if (!profile) return;
  activeProfile = profile;
  try {
    await AsyncStorage.setItem(PROFILE_KEY, id);
  } catch {
    // non-fatal: profile just won't be preselected next launch
  }
}

// Restores the last-used profile so the picker can preselect it.
export async function loadLastProfileId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PROFILE_KEY);
  } catch {
    return null;
  }
}
