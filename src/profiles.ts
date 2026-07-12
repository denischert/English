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
  // Rounds per session of each drill type. Scenario rounds (free responses)
  // suit the adult business profile; the kid's profile is repeat-and-check only.
  shadowingRounds: number;
  scenarioRounds: number;
  sessionsKey: string; // separate history per profile
  // Locale-specific vocabulary for the scenario phrasing heuristic
  strongMarkers: string[];
  fillerWords: string[];
  phonemeTips: Record<string, string>;
  defaultPhonemeTip: string;
  uiLang: "en" | "fr"; // language of scores, feedback, and UI labels
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
  "ç": "Le son doux « ich » : langue haute comme pour « i », puis souffle — ni « ch » français ni « k » (ich, nicht, möchte).",
  "x": "Le son dur « ach » : friction au fond de la gorge, comme la jota espagnole (noch, Woche, nach).",
  "ʏ": "Ü court (fünf, drücken) : comme le « u » français, court et net.",
  "yː": "Ü long (üben, über) : comme le « u » français mais tenu longtemps.",
  "œ": "Ö court (können) : comme le « eu » de « peur ».",
  "øː": "Ö long (schön) : comme le « eu » de « peu », tenu et stable.",
  "ʁ": "Le R allemand (Trainer, richtig) : au fond de la gorge, comme le R français mais plus doux.",
  "ɐ": "Le -er final (Spieler, Trainer) : un « a » relâché — le R disparaît presque en fin de mot.",
  "ts": "Le Z allemand (zusammen, zurück) : toujours « ts » comme dans « tsé-tsé » — jamais un Z français.",
  "v": "Le W allemand (Wurf, wie) : se prononce comme un V français — dents sur la lèvre inférieure.",
  "ʃ": "SCH (schnell, Schulter) : comme « ch » français. Attention : « st »/« sp » en début de mot = « cht »/« chp » : « Spiel » = « chpil ».",
  "pf": "PF (Pfosten, kämpft) : un « p » qui glisse directement dans un « f » — un seul son, pas deux syllabes.",
  "aː": "A long (klar) : ouvert et tenu — l'allemand distingue strictement voyelles courtes et longues.",
  "eː": "E long (gegen, zehn) : comme le « é » français, tendu et stable — sans glisser vers « eille ».",
  "oː": "O long (Tore, groß) : pur et arrondi, tenu — sans glisser comme le « o » anglais.",
  "l": "Le L allemand (Ball, spielen) : toujours léger, pointe de la langue aux dents — comme le L français.",
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
    shadowingRounds: 3,
    scenarioRounds: 3,
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
    uiLang: "en",
    allowGeneratedContent: true,
  },
  {
    id: "german-handball",
    name: "Handball",
    emoji: "🤾",
    title: "Handball-Deutsch",
    subtitle: "Allemand pour le handball : coach, équipe, arbitre",
    locale: "de-DE",
    ttsVoice: "de-DE-KatjaNeural",
    accentCheckTitle: "Bilan de prononciation allemande",
    accentCheckIntro: "Ces sons demandent le plus de travail par rapport à l'allemand natif :",
    shadowing: HANDBALL_SHADOWING,
    scenarios: HANDBALL_SCENARIOS,
    shadowingRounds: 6,
    scenarioRounds: 0,
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
    defaultPhonemeTip: "Réécoute le mot et imite le son lentement, puis dis le mot en entier.",
    uiLang: "fr",
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
