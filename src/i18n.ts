// Minimal UI localisation. Each profile declares its UI language: the
// business-English profile shows English, the German handball profile shows
// French (the learner's native language).
import { getActiveProfile } from "./profiles";

const en = {
  roundOf: (i: number, n: number) => `Round ${i} of ${n}`,
  shadowLabel: "SHADOW THIS SENTENCE",
  scenarioLabel: "BUSINESS SCENARIO",
  listenStatus: "Listen…",
  startRecording: "Start recording",
  recordingStatus: "Recording — speak, then press Stop when you're done",
  stopRecording: "Stop recording",
  scoringStatus: "Scoring your pronunciation…",
  preparing: "Preparing your personalised session…",
  firstTry: "First try",
  attemptN: (n: number) => `Attempt ${n}`,
  scoreBreakdown: "Score breakdown",
  accuracyScore: "Accuracy score",
  fluencyScore: "Fluency score",
  completenessScore: "Completeness score",
  prosodyScore: "Prosody score",
  listenWord: "▶ Listen",
  accentPracticeHint:
    "Tap ▶ Listen to hear each word, practice it aloud, then press Try again for the full sentence.",
  accentAllClear:
    "All sounds matched the native model closely — no pronunciation issues detected in this sentence. 🎉",
  tryAgain: "Try again",
  nextRound: "Next round",
  finishSession: "Finish session",
  exitSession: "Exit session",
  noSpeech: "No speech detected — press Start recording and try again.",
  assessmentUnavailable: "Pronunciation assessment unavailable",
  inWord: "in",
  // Coaching feedback
  fbExcellent: "Excellent pronunciation overall.",
  fbGood: "Good pronunciation with a few areas to refine.",
  fbDecent: "Decent attempt — several sounds need work.",
  fbKeep: "Keep practising — focus on the words highlighted below.",
  fbMispronounced: (list: string) => `Mispronounced: ${list}. Slow down and say each sound clearly.`,
  fbDropped: (list: string, plural: boolean) =>
    `Dropped word${plural ? "s" : ""}: ${list}. Make sure to say every word.`,
  fbExtra: (list: string, plural: boolean) =>
    `Extra word${plural ? "s" : ""} heard: ${list}. Stick to the target sentence.`,
  fbFluencyLow: "Fluency is low — try to speak more smoothly without long pauses between words.",
  fbFluencyMid: "Fluency could be smoother — keep a steady rhythm as you speak.",
  fbCompleteness: "You didn't say the full sentence — try to get through every word.",
  fbProsody: "Work on stress and intonation — vary your pitch to sound more natural.",
  // Scenario feedback
  scNothing: "I didn't catch a response. Try again and speak clearly.",
  scFiller: (filler: string, strong: string) =>
    `Try cutting filler words like "${filler}". Compare to: "${strong}"`,
  scNoMarkers: (strong: string) => `Good content. Make it sound more decisive, e.g.: "${strong}"`,
  scSolid: (strong: string) => `Solid phrasing. Reference: "${strong}"`,
  // Home screen
  statSessions: "sessions this week",
  statStreak: "week streak",
  statStars: "stars earned",
  goalMet: "Goal met this week. Great consistency!",
  goalPending: (n: number) => `${n} more session${n === 1 ? "" : "s"} to hit your weekly goal.`,
  startSession: "Start 10-min session",
  historyTitle: "Review past sessions",
  emptyHistory: "No sessions yet. Start your first one above.",
  firstTryShort: "1st try",
  triesShort: (n: number) => `${n} tries`,
  accuracyShort: "Accuracy",
  fluencyShort: "Fluency",
  completenessShort: "Completeness",
  prosodyShort: "Prosody",
  translationLabel: "Translation",
};

const fr: typeof en = {
  roundOf: (i: number, n: number) => `Manche ${i} sur ${n}`,
  shadowLabel: "RÉPÈTE CETTE PHRASE",
  scenarioLabel: "MISE EN SITUATION",
  listenStatus: "Écoute…",
  startRecording: "Commencer l'enregistrement",
  recordingStatus: "Enregistrement — parle, puis appuie sur Stop quand tu as fini",
  stopRecording: "Arrêter l'enregistrement",
  scoringStatus: "Évaluation de ta prononciation…",
  preparing: "Préparation de ta séance personnalisée…",
  firstTry: "Premier essai",
  attemptN: (n: number) => `Essai ${n}`,
  scoreBreakdown: "Détail du score",
  accuracyScore: "Précision",
  fluencyScore: "Fluidité",
  completenessScore: "Complétude",
  prosodyScore: "Intonation",
  listenWord: "▶ Écouter",
  accentPracticeHint:
    "Appuie sur ▶ Écouter pour entendre chaque mot, entraîne-toi à voix haute, puis appuie sur Réessayer pour la phrase complète.",
  accentAllClear:
    "Tous les sons correspondent bien au modèle natif — aucun problème de prononciation détecté dans cette phrase. 🎉",
  tryAgain: "Réessayer",
  nextRound: "Manche suivante",
  finishSession: "Terminer la séance",
  exitSession: "Quitter la séance",
  noSpeech: "Aucune parole détectée — appuie sur Commencer l'enregistrement et réessaie.",
  assessmentUnavailable: "Évaluation de la prononciation indisponible",
  inWord: "dans",
  fbExcellent: "Excellente prononciation dans l'ensemble.",
  fbGood: "Bonne prononciation, avec quelques points à améliorer.",
  fbDecent: "Bon essai — plusieurs sons demandent du travail.",
  fbKeep: "Continue à t'entraîner — concentre-toi sur les mots indiqués ci-dessous.",
  fbMispronounced: (list: string) =>
    `Mal prononcé : ${list}. Ralentis et articule bien chaque son.`,
  fbDropped: (list: string, plural: boolean) =>
    `Mot${plural ? "s" : ""} oublié${plural ? "s" : ""} : ${list}. Pense à dire chaque mot.`,
  fbExtra: (list: string, plural: boolean) =>
    `Mot${plural ? "s" : ""} en trop : ${list}. Tiens-toi à la phrase demandée.`,
  fbFluencyLow:
    "La fluidité est faible — essaie de parler plus régulièrement, sans longues pauses entre les mots.",
  fbFluencyMid: "La fluidité peut être plus régulière — garde un rythme constant.",
  fbCompleteness: "Tu n'as pas dit toute la phrase — essaie d'aller jusqu'au bout.",
  fbProsody: "Travaille l'accentuation et l'intonation — varie ta mélodie pour sonner plus naturel.",
  scNothing: "Je n'ai rien entendu. Réessaie en parlant clairement.",
  scFiller: (filler: string, strong: string) =>
    `Évite les mots de remplissage comme « ${filler} ». Compare avec : « ${strong} »`,
  scNoMarkers: (strong: string) =>
    `Bon contenu. Sois plus affirmé, par exemple : « ${strong} »`,
  scSolid: (strong: string) => `Très bonne formulation. Phrase de référence : « ${strong} »`,
  statSessions: "séances cette semaine",
  statStreak: "semaines d'affilée",
  statStars: "étoiles gagnées",
  goalMet: "Objectif de la semaine atteint. Belle régularité !",
  goalPending: (n: number) => `Encore ${n} séance${n === 1 ? "" : "s"} pour atteindre ton objectif.`,
  startSession: "Commencer une séance de 10 min",
  historyTitle: "Revoir les séances passées",
  emptyHistory: "Pas encore de séance. Commence ta première ci-dessus.",
  firstTryShort: "1er essai",
  triesShort: (n: number) => `${n} essais`,
  accuracyShort: "Précision",
  fluencyShort: "Fluidité",
  completenessShort: "Complétude",
  prosodyShort: "Intonation",
  translationLabel: "Traduction",
};

const LANGS = { en, fr };

export type UiLang = keyof typeof LANGS;

// Strings for the active profile's UI language.
export function tr(): typeof en {
  return LANGS[getActiveProfile().uiLang];
}
