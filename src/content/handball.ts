import { ScenarioItem, ShadowingItem } from "../types";

// German practice content for a young handball player: sentences he would
// actually say to his coach (Trainer) at practice and around games.
// Tips are in simple English and target typical German pronunciation
// difficulties: the ich/ach sounds, ü/ö, the German R, and vowel length.
export const HANDBALL_SHADOWING: ShadowingItem[] = [
  {
    id: "hb-1",
    text: "Trainer, können wir den Sprungwurf noch einmal üben?",
    tip: "Round your lips for 'ü' in 'üben' — say 'ee' with 'oo' lips.",
  },
  {
    id: "hb-2",
    text: "Ich habe verstanden, dass ich schneller zurücklaufen muss.",
    tip: "'Ich' is a soft sound /ç/, like a whispered 'yes' — not 'ish' or 'ick'.",
  },
  {
    id: "hb-3",
    text: "Soll ich heute im Angriff oder in der Abwehr spielen?",
    tip: "Stress 'Angriff' on the first syllable; 'Abwehr' has a long 'e': /apveːɐ/.",
  },
  {
    id: "hb-4",
    text: "Mein Wurf war heute besser als letzte Woche.",
    tip: "German 'W' sounds like English 'V': 'Wurf' = /vʊʁf/, 'Woche' = /vɔxə/.",
  },
  {
    id: "hb-5",
    text: "Entschuldigung, ich komme fünf Minuten später zum Training.",
    tip: "'ü' in 'fünf' is short; 'später' has a long 'ä' like the 'ai' in 'fair'.",
  },
  {
    id: "hb-6",
    text: "Können Sie mir zeigen, wie ich den Kreisläufer decke?",
    tip: "'Kreisläufer' — stress 'Kreis'; 'äu' sounds like 'oy' in 'boy'.",
  },
  {
    id: "hb-7",
    text: "Ich möchte am Wochenende beim Turnier mitspielen.",
    tip: "'möchte' — round lips for 'ö', soft 'ch' /ç/ after it.",
  },
  {
    id: "hb-8",
    text: "Der Torwart hat heute wirklich stark gehalten.",
    tip: "German R at the back of the throat in 'Torwart' and 'wirklich'.",
  },
  {
    id: "hb-9",
    text: "Ich glaube, unsere Abwehr muss enger zusammenstehen.",
    tip: "'z' in 'zusammen' is /ts/ — like 'ts' in 'cats', never English 'z'.",
  },
  {
    id: "hb-10",
    text: "Nach dem Training tut mir die Schulter ein bisschen weh.",
    tip: "'Schulter' starts with /ʃ/ 'sh'; 'bisschen' has the soft 'ch' /ç/.",
  },
  {
    id: "hb-11",
    text: "Wie viele Tore haben wir im letzten Spiel geworfen?",
    tip: "'Wie viele' — both start with /v/; long 'o' in 'Tore'.",
  },
  {
    id: "hb-12",
    text: "Ich passe den Ball schneller ab, wenn der Gegner drückt.",
    tip: "'drückt' — short 'ü' with rounded lips; crisp final 't'.",
  },
  {
    id: "hb-13",
    text: "Dürfen wir am Ende noch Siebenmeter werfen üben?",
    tip: "'Dürfen' and 'üben' both need rounded 'ü'; 'Siebenmeter' has a long 'ie' /iː/.",
  },
  {
    id: "hb-14",
    text: "Ich übernehme die Manndeckung gegen ihren besten Spieler.",
    tip: "Stress 'übernehme' on 'neh'; 'gegen' has a long first 'e'.",
  },
  {
    id: "hb-15",
    text: "Das Zusammenspiel mit dem Kreisläufer hat gut funktioniert.",
    tip: "/ts/ in 'Zusammenspiel'; stress 'funktioniert' on 'niert'.",
  },
  {
    id: "hb-16",
    text: "Trainer, welche Übung machen wir zum Aufwärmen?",
    tip: "'Übung' — long 'ü' at the start; 'Aufwärmen' has 'ä' like in 'fair'.",
  },
  {
    id: "hb-17",
    text: "Ich versuche, beim Tempogegenstoß schneller anzulaufen.",
    tip: "Break it down: Tempo-gegen-stoß. 'ß' is a sharp 's'; long 'o' before it.",
  },
  {
    id: "hb-18",
    text: "Unsere Mannschaft kämpft bis zur letzten Minute.",
    tip: "'kämpft' — 'ä' short, then the cluster /mpft/; take it slowly first.",
  },
  {
    id: "hb-19",
    text: "Beim nächsten Angriff spiele ich den Ball auf Rechtsaußen.",
    tip: "'nächsten' — soft 'ch' /ç/; 'Rechtsaußen' ends with a clear 'en'.",
  },
  {
    id: "hb-20",
    text: "Danke für das Training, ich habe heute viel gelernt.",
    tip: "'für' with rounded 'ü'; German R in 'gelernt'; 'viel' = /fiːl/ with long 'ie'.",
  },
];

export const HANDBALL_SCENARIOS: ScenarioItem[] = [
  {
    id: "hbs-1",
    context: "Du hast das Training verpasst und sprichst mit dem Trainer.",
    prompt: "Erkläre dem Trainer, warum du beim letzten Training gefehlt hast.",
    weakPhrase: "Ähm, ja, ich war halt nicht da, sorry.",
    strongPhrase:
      "Entschuldigung, dass ich am Dienstag gefehlt habe. Ich war krank, aber jetzt bin ich wieder fit und motiviert.",
  },
  {
    id: "hbs-2",
    context: "Du möchtest auf einer anderen Position spielen.",
    prompt: "Frage den Trainer, ob du eine neue Position ausprobieren darfst.",
    weakPhrase: "Kann ich vielleicht mal woanders spielen oder so?",
    strongPhrase:
      "Trainer, ich würde gerne einmal im Rückraum spielen. Was muss ich dafür noch verbessern?",
  },
  {
    id: "hbs-3",
    context: "Der Trainer hat deine Abwehrarbeit kritisiert.",
    prompt: "Reagiere auf die Kritik des Trainers.",
    weakPhrase: "Ja okay, mach ich halt irgendwie besser.",
    strongPhrase:
      "Danke für das Feedback. Ich verstehe, dass ich schneller zurücklaufen muss, und arbeite daran.",
  },
  {
    id: "hbs-4",
    context: "Du hast dich beim Training leicht verletzt.",
    prompt: "Sage dem Trainer, dass du Schmerzen hast.",
    weakPhrase: "Es tut irgendwie ein bisschen weh, aber egal.",
    strongPhrase:
      "Trainer, meine Schulter tut seit dem Wurftraining weh. Ich möchte lieber pausieren, bevor es schlimmer wird.",
  },
  {
    id: "hbs-5",
    context: "Vor einem wichtigen Spiel fragt der Trainer nach deiner Einschätzung.",
    prompt: "Sage dem Trainer, was du über den Gegner denkst.",
    weakPhrase: "Die sind halt gut, keine Ahnung, wird schwer.",
    strongPhrase:
      "Ihr Rückraum wirft sehr stark, aber ihre Abwehr ist langsam. Mit schnellen Gegenstößen haben wir eine gute Chance.",
  },
  {
    id: "hbs-6",
    context: "Du willst mehr Verantwortung im Team übernehmen.",
    prompt: "Frage den Trainer, wie du dem Team mehr helfen kannst.",
    weakPhrase: "Kann ich vielleicht mal mehr machen oder so?",
    strongPhrase:
      "Trainer, ich möchte mehr Verantwortung übernehmen. Woran soll ich arbeiten, um der Mannschaft noch mehr zu helfen?",
  },
];
