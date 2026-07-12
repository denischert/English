import { ScenarioItem, ShadowingItem } from "../types";

// 100 German practice sentences for a young handball player, covering
// training with the coach, in-game talk with teammates, fair exchanges with
// opponents, and speaking with the referee. Tips are in simple English and
// target typical German pronunciation difficulties: the ich/ach sounds /ç/
// /x/, rounded ü/ö, the German R /ʁ/, Z as /ts/, W as /v/, sch/st/sp,
// the äu/eu 'oy' sound, ei as 'eye', final devoicing, and vowel length.
export const HANDBALL_SHADOWING: ShadowingItem[] = [
  // ── Training: talking with the coach ──────────────────────────────────────
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
  {
    id: "hb-21",
    text: "Trainer, ich fühle mich fit genug für die erste Mannschaft.",
    tip: "'fühle' — long rounded 'ü'; 'genug' ends in a /k/ sound (final devoicing).",
  },
  {
    id: "hb-22",
    text: "Kann ich beim nächsten Spiel von Anfang an spielen?",
    tip: "'nächsten' with soft /ç/; stress 'Anfang' on the first syllable.",
  },
  {
    id: "hb-23",
    text: "Welche Fehler habe ich im letzten Spiel gemacht?",
    tip: "'Fehler' — long 'e' /eː/, ending in the relaxed /ɐ/, almost 'ah'.",
  },
  {
    id: "hb-24",
    text: "Ich arbeite zu Hause zusätzlich an meiner Sprungkraft.",
    tip: "/ts/ twice: 'zu' and 'zusätzlich'; 'Sprungkraft' starts /ʃp/ — 'shprung'.",
  },
  {
    id: "hb-25",
    text: "Mir fällt das Fangen mit der linken Hand noch schwer.",
    tip: "'fällt' — short 'ä' like 'e' in 'bed'; 'schwer' = /ʃveːɐ/, W as V.",
  },
  {
    id: "hb-26",
    text: "Sollen wir heute mehr an der Wurftechnik arbeiten?",
    tip: "'Wurftechnik' — W as V; 'Technik' = /tɛçnɪk/ with soft /ç/; German R in 'arbeiten'.",
  },
  {
    id: "hb-27",
    text: "Ich trinke genug Wasser vor und nach dem Training.",
    tip: "'Wasser' = /vasɐ/ — W as V, double S sharp; 'vor' with a long 'o'.",
  },
  {
    id: "hb-28",
    text: "Das Auslaufen am Ende hilft gegen Muskelkater.",
    tip: "'Auslaufen' — 'au' like 'ow' in 'cow'; 'Muskelkater' ends /ɐ/.",
  },
  {
    id: "hb-29",
    text: "Ich habe die Taktik für das Wochenende verstanden.",
    tip: "'Taktik' — both Ts crisp; stress the first syllable.",
  },
  {
    id: "hb-30",
    text: "Können wir das Kreuzen zwischen Rückraum Mitte und Links üben?",
    tip: "'Kreuzen' — 'eu' is 'oy'; /ts/ in the middle; 'zwischen' starts /tsv/.",
  },
  // ── In the game: talking to teammates ──────────────────────────────────────
  {
    id: "hb-31",
    text: "Hier, ich bin frei, spiel den Ball rüber!",
    tip: "'Hier' = /hiːɐ/; 'rüber' — rounded 'ü', German R at the start.",
  },
  {
    id: "hb-32",
    text: "Achtung, der Kreisläufer steht hinter dir!",
    tip: "'Achtung' — hard /x/ like clearing your throat softly; /ŋ/ at the end.",
  },
  {
    id: "hb-33",
    text: "Gut gemacht, genau so machen wir weiter!",
    tip: "'gemacht' — hard /x/ before the final 't'; 'weiter' ends /ɐ/.",
  },
  {
    id: "hb-34",
    text: "Wechsel! Ich gehe raus, du kommst rein.",
    tip: "'Wechsel' = /vɛksəl/ — 'chs' sounds like 'x'; W as V.",
  },
  {
    id: "hb-35",
    text: "Langsam machen, wir haben Zeit für einen guten Abschluss.",
    tip: "'Zeit' — /ts/ start, 'ei' like 'eye'; 'Abschluss' with sharp double S.",
  },
  {
    id: "hb-36",
    text: "Pass auf die Nummer sieben auf, sie wirft sehr stark.",
    tip: "'sieben' — long 'ie' /iː/; 'wirft' with the German R.",
  },
  {
    id: "hb-37",
    text: "Rückzug, alle schnell zurück in die Abwehr!",
    tip: "'Rückzug' — two rounded 'ü's, /ts/ in the middle; final 'g' sounds like /k/.",
  },
  {
    id: "hb-38",
    text: "Ich decke die Mitte, du nimmst den Halblinken.",
    tip: "'Mitte' — short 'i', crisp double T; 'Halblinken' — light German L.",
  },
  {
    id: "hb-39",
    text: "Kopf hoch, den nächsten Wurf machst du rein!",
    tip: "'hoch' — long 'o' then hard /x/; 'nächsten' with soft /ç/.",
  },
  {
    id: "hb-40",
    text: "Super Parade! So halten wir das Spiel offen.",
    tip: "'Parade' — stress on 'ra'; 'Spiel' starts /ʃp/ — 'shpeel'.",
  },
  {
    id: "hb-41",
    text: "Spiel schneller ab, sonst läuft die Zeit ab!",
    tip: "'läuft' — 'äu' is 'oy'; 'Zeit' with /ts/ and 'eye'.",
  },
  {
    id: "hb-42",
    text: "Ich laufe den Gegenstoß, gib mir den langen Pass!",
    tip: "'Gegenstoß' — long 'o' before sharp 'ß'; 'gib' ends like /p/.",
  },
  {
    id: "hb-43",
    text: "Bleib ruhig, wir holen das Tor wieder auf.",
    tip: "'ruhig' — long 'u', ends in soft /ç/: /ʁuːɪç/; 'wieder' with long 'ie'.",
  },
  {
    id: "hb-44",
    text: "Stellt den Block, ich übernehme den Schützen!",
    tip: "'Schützen' — /ʃ/ then rounded short 'ü' then /ts/; light L in 'Stellt' — /ʃt/ start!",
  },
  {
    id: "hb-45",
    text: "Guter Assist, dein Anspiel an den Kreis war perfekt.",
    tip: "'Anspiel' — /ʃp/ in the middle; 'Kreis' — 'ei' like 'eye'.",
  },
  {
    id: "hb-46",
    text: "Wir spielen jetzt sieben gegen sechs, Torwart raus!",
    tip: "'sechs' = /zɛks/ — 'chs' as 'x'; 'jetzt' — /ts/ cluster, take it slow.",
  },
  {
    id: "hb-47",
    text: "Noch zwei Minuten, volle Konzentration bis zum Schluss!",
    tip: "'zwei' — /tsv/ start, 'ei' as 'eye'; 'Schluss' with sharp double S.",
  },
  {
    id: "hb-48",
    text: "Ich habe den Siebenmeter verworfen, der nächste sitzt.",
    tip: "'verworfen' — two German Rs, W as V; 'sitzt' — /ts/ before final 't'.",
  },
  {
    id: "hb-49",
    text: "Deine Abwehrarbeit heute macht den Unterschied.",
    tip: "'Unterschied' — /ʃ/ in the middle, long 'ie' at the end, final 'd' as /t/.",
  },
  {
    id: "hb-50",
    text: "Lass uns die erste Welle schneller laufen als bisher.",
    tip: "'Welle' — W as V, light double L; 'bisher' — stress 'her' with long 'e'.",
  },
  {
    id: "hb-51",
    text: "Ich bin angeschlagen, kannst du für mich weiterspielen?",
    tip: "'angeschlagen' — /ʃl/ in the middle; /ŋ/ twice, no released G.",
  },
  {
    id: "hb-52",
    text: "Nach vorne schauen, das Spiel ist noch nicht vorbei!",
    tip: "'schauen' — /ʃ/ then 'ow'; 'nicht' with soft /ç/; 'vorbei' ends 'eye'.",
  },
  {
    id: "hb-53",
    text: "Dein Sperren am Kreis öffnet mir den Wurfweg.",
    tip: "'öffnet' — short rounded 'ö'; 'Wurfweg' — both Ws as V, final 'g' as /k/.",
  },
  {
    id: "hb-54",
    text: "Wir ziehen das Tempo an, die sind schon müde.",
    tip: "'ziehen' — /ts/ then long 'ie'; 'müde' — long rounded 'ü'.",
  },
  {
    id: "hb-55",
    text: "Übernimm du den Siebenmeter, du bist heute sicherer.",
    tip: "'Übernimm' — long 'ü' start; 'sicherer' — soft /ç/, ends relaxed /ɐ/.",
  },
  // ── Talking to opponents (fair play) ───────────────────────────────────────
  {
    id: "hb-56",
    text: "Gutes Spiel, eure Abwehr war heute richtig stark.",
    tip: "'eure' — 'eu' is 'oy'; 'richtig' — soft /ç/ twice, ends /ç/.",
  },
  {
    id: "hb-57",
    text: "Alles gut bei dir? Das war kein Foul mit Absicht.",
    tip: "'Absicht' — soft /ç/ before final 't'; 'Foul' like English 'foul'.",
  },
  {
    id: "hb-58",
    text: "Entschuldigung, ich wollte dich nicht am Arm treffen.",
    tip: "'wollte' — W as V, light double L; 'dich' and 'nicht' with soft /ç/.",
  },
  {
    id: "hb-59",
    text: "Glückwunsch zum Sieg, ihr wart die bessere Mannschaft.",
    tip: "'Glückwunsch' — rounded short 'ü', /ʃ/ ending; 'Sieg' — long 'ie', final 'g' as /k/.",
  },
  {
    id: "hb-60",
    text: "Starker Wurf, den konnte unser Torwart nicht halten.",
    tip: "'Starker' — /ʃt/ start; German R; ends relaxed /ɐ/.",
  },
  {
    id: "hb-61",
    text: "Kannst du mir den Ball bitte kurz zurückgeben?",
    tip: "'zurückgeben' — /ts/ start, two rounded 'ü's; 'bitte' crisp double T.",
  },
  {
    id: "hb-62",
    text: "Wir sehen uns im Rückspiel, dann sind wir besser vorbereitet.",
    tip: "'Rückspiel' — rounded 'ü', /ʃp/; 'vorbereitet' — German R twice.",
  },
  {
    id: "hb-63",
    text: "Respekt, euer Torwart hat unglaublich gehalten heute.",
    tip: "'Respekt' — German R, crisp final 't'; 'unglaublich' ends soft /ç/.",
  },
  {
    id: "hb-64",
    text: "Euer Kreisläufer ist kaum zu verteidigen, stark gespielt.",
    tip: "'äu' in 'Kreisläufer' is 'oy'; 'verteidigen' — 'ei' as 'eye', ends in a clear '-gen'.",
  },
  {
    id: "hb-65",
    text: "Faires Spiel von euch, so macht Handball Spaß.",
    tip: "'Faires' like 'fair' + es; 'Spaß' — /ʃp/ start, long 'a', sharp 'ß'.",
  },
  // ── Talking to the referee ─────────────────────────────────────────────────
  {
    id: "hb-66",
    text: "Schiedsrichter, war das nicht ein Stürmerfoul?",
    tip: "'Schiedsrichter' — /ʃ/ start, soft /ç/ in 'richter'; 'Stürmerfoul' — /ʃt/, rounded 'ü'.",
  },
  {
    id: "hb-67",
    text: "Entschuldigung, dürfen wir kurz wechseln, bevor es weitergeht?",
    tip: "'dürfen' — rounded 'ü'; 'wechseln' — 'chs' as 'x', W as V.",
  },
  {
    id: "hb-68",
    text: "Ich habe den Ball zuerst berührt, das war Einwurf für uns.",
    tip: "'zuerst' — /ts/ start; 'berührt' — long rounded 'ü' + German R together.",
  },
  {
    id: "hb-69",
    text: "War das Zeitspiel? Wir haben doch angegriffen.",
    tip: "'Zeitspiel' — /ts/, 'eye', then /ʃp/; 'angegriffen' — /ŋ/, crisp double F.",
  },
  {
    id: "hb-70",
    text: "Danke, Schiedsrichter, das war eine faire Entscheidung.",
    tip: "'Entscheidung' — /ʃ/ in the middle, 'ei' as 'eye', /ŋ/ ending.",
  },
  {
    id: "hb-71",
    text: "Wie lange läuft die Zeitstrafe gegen unsere Nummer vier?",
    tip: "'läuft' — 'oy'; 'Zeitstrafe' — /ts/ then /ʃt/ in the middle.",
  },
  {
    id: "hb-72",
    text: "Entschuldigung, das Foul war nicht absichtlich, es tut mir leid.",
    tip: "'absichtlich' — two soft /ç/ sounds; 'leid' — 'eye', final 'd' as /t/.",
  },
  {
    id: "hb-73",
    text: "Dürfte ich fragen, warum der Treffer nicht zählt?",
    tip: "'Dürfte' — rounded 'ü'; 'zählt' — /ts/ start, long 'ä'.",
  },
  {
    id: "hb-74",
    text: "Der Ball war hinter der Linie, das war ein Tor.",
    tip: "'hinter' ends /ɐ/; 'Linie' = /liːniə/ — three syllables; long 'o' in 'Tor'.",
  },
  {
    id: "hb-75",
    text: "Verstanden, wir stellen die Abwehr weiter zurück.",
    tip: "'Verstanden' — German R after 'Ve'; 'zurück' — /ts/, two rounded 'ü's.",
  },
  // ── Before, during and after the game ─────────────────────────────────────
  {
    id: "hb-76",
    text: "Lasst uns gemeinsam warm machen, das Spiel beginnt gleich.",
    tip: "'gemeinsam' — 'ei' as 'eye'; 'gleich' ends soft /ç/.",
  },
  {
    id: "hb-77",
    text: "Heute gewinnen wir, wenn jeder für den anderen kämpft.",
    tip: "'gewinnen' — W as V; 'jeder' starts like English 'y'; 'kämpft' — /mpft/ cluster.",
  },
  {
    id: "hb-78",
    text: "Ich bin nervös, aber Nervosität bedeutet, dass es mir wichtig ist.",
    tip: "'nervös' — German R, long rounded 'ö'; 'wichtig' — two soft /ç/ sounds.",
  },
  {
    id: "hb-79",
    text: "Gib mir ein Zeichen, wenn du den Kempa-Trick spielen willst.",
    tip: "'Zeichen' — /ts/, 'eye', soft /ç/; light L in 'willst'.",
  },
  {
    id: "hb-80",
    text: "Die erste Halbzeit war schwach, jetzt zeigen wir unser wahres Gesicht.",
    tip: "'Halbzeit' — /ts/ in the middle; 'Gesicht' ends soft /ç/ + 't'.",
  },
  {
    id: "hb-81",
    text: "Trinkt alle etwas in der Pause, die zweite Hälfte wird hart.",
    tip: "'Hälfte' — short 'ä'; 'zweite' — /tsv/ then 'eye'.",
  },
  {
    id: "hb-82",
    text: "Unser Rückraum muss mehr Druck auf die Abwehr machen.",
    tip: "'Druck' — German R after D, short 'u'; 'Rückraum' — 'ü' then 'ow'.",
  },
  {
    id: "hb-83",
    text: "Bleibt geduldig, die Lücke in der Abwehr kommt bestimmt.",
    tip: "'geduldig' ends soft /ç/; 'Lücke' — short rounded 'ü', light L.",
  },
  {
    id: "hb-84",
    text: "Nach dem Abpfiff geben wir jedem Gegner die Hand.",
    tip: "'Abpfiff' — the /pf/ sound twice: one quick 'p-into-f'.",
  },
  {
    id: "hb-85",
    text: "Wir haben verdient gewonnen, aber bleiben bescheiden.",
    tip: "'verdient' — German R, long 'ie'; 'bescheiden' — /ʃ/, 'eye'.",
  },
  {
    id: "hb-86",
    text: "Die Niederlage tut weh, aber wir lernen daraus.",
    tip: "'Niederlage' — long 'ie', ends /ə/; 'daraus' — stress 'raus'.",
  },
  {
    id: "hb-87",
    text: "Mein Ziel ist es, diese Saison fünfzig Tore zu werfen.",
    tip: "'Ziel' — /ts/ + long 'ie'; 'fünfzig' — rounded 'ü', ends soft /ç/.",
  },
  {
    id: "hb-88",
    text: "Das Auswärtsspiel am Samstag wird unser schwerstes Spiel.",
    tip: "'Auswärtsspiel' — 'ow', then 'ä', then /ʃp/; take the compound slowly.",
  },
  {
    id: "hb-89",
    text: "Ich wärme mich immer gründlich auf, um Verletzungen zu vermeiden.",
    tip: "'gründlich' — rounded 'ü', ends soft /ç/; 'Verletzungen' — /ts/ + /ŋ/.",
  },
  {
    id: "hb-90",
    text: "Unsere Fans haben uns heute richtig nach vorne getragen.",
    tip: "'richtig' — soft /ç/ twice; 'getragen' — German R after T.",
  },
  {
    id: "hb-91",
    text: "Der Zeitnehmer zeigt an, dass noch dreißig Sekunden bleiben.",
    tip: "'Zeitnehmer' — /ts/ + 'eye'; 'dreißig' — German R, 'eye', ends soft /ç/.",
  },
  {
    id: "hb-92",
    text: "Ich spiele lieber Rückraum links, weil ich rechts werfe.",
    tip: "'lieber' — long 'ie', ends /ɐ/; 'rechts' — soft /ç/ + 's'.",
  },
  {
    id: "hb-93",
    text: "Beim Anwurf stehen wir alle in der eigenen Hälfte.",
    tip: "'Anwurf' — W as V; 'eigenen' — 'eye' start; short 'ä' in 'Hälfte'.",
  },
  {
    id: "hb-94",
    text: "Passt auf die schnelle Mitte auf, direkt nach unserem Tor!",
    tip: "'Passt' — sharp double S; 'direkt' — crisp final 't'; German R twice.",
  },
  {
    id: "hb-95",
    text: "Unser Trainer sagt, Abwehr gewinnt Meisterschaften.",
    tip: "'Meisterschaften' — 'eye', then /ʃ/, ends '-ten'; W as V in 'gewinnt'.",
  },
  {
    id: "hb-96",
    text: "Ich trainiere dreimal pro Woche plus ein Spiel am Wochenende.",
    tip: "'trainiere' — German R twice, ends /ə/; 'Woche' — W as V, hard /x/.",
  },
  {
    id: "hb-97",
    text: "Nach zwei Schritten muss ich prellen oder abspielen.",
    tip: "'Schritten' — /ʃʁ/ cluster: 'sh' straight into German R; 'prellen' — light double L.",
  },
  {
    id: "hb-98",
    text: "Der Kempa-Trick klappt nur, wenn das Timing perfekt ist.",
    tip: "'klappt' — crisp double P + T; 'perfekt' — German R, clean final 't'.",
  },
  {
    id: "hb-99",
    text: "Ich möchte später einmal in der Bundesliga spielen.",
    tip: "'möchte' — rounded 'ö' + soft /ç/; 'Bundesliga' — stress 'Bun', light L.",
  },
  {
    id: "hb-100",
    text: "Egal wie das Spiel ausgeht, wir geben niemals auf.",
    tip: "'Egal' — long 'a', light L; 'niemals' — long 'ie', light L; 'ausgeht' — 'ow'.",
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
  {
    id: "hbs-7",
    context: "Der Schiedsrichter hat gegen dich ein Foul gepfiffen, das du anders gesehen hast.",
    prompt: "Sprich respektvoll mit dem Schiedsrichter über die Entscheidung.",
    weakPhrase: "Das war nie im Leben ein Foul, echt jetzt!",
    strongPhrase:
      "Entschuldigung, Schiedsrichter, darf ich kurz fragen? Ich habe zuerst den Ball gespielt. Ich akzeptiere aber Ihre Entscheidung.",
  },
  {
    id: "hbs-8",
    context: "Ein Mitspieler hat einen wichtigen Wurf verworfen und ist frustriert.",
    prompt: "Baue deinen Mitspieler wieder auf.",
    weakPhrase: "Ja, das war halt echt schlecht geworfen.",
    strongPhrase:
      "Kopf hoch, das passiert jedem. Deine Würfe haben uns hierher gebracht — den nächsten machst du rein.",
  },
  {
    id: "hbs-9",
    context: "Nach dem Spiel gibst du dem gegnerischen Kapitän die Hand.",
    prompt: "Gratuliere dem Gegner fair zum Sieg.",
    weakPhrase: "Ihr hattet halt Glück heute, egal.",
    strongPhrase:
      "Glückwunsch zum Sieg, ihr habt stark gespielt. Wir freuen uns auf das Rückspiel.",
  },
  {
    id: "hbs-10",
    context: "Der Trainer stellt dich vor die Wahl zwischen zwei Positionen für das Turnier.",
    prompt: "Sage dem Trainer klar, welche Position du bevorzugst und warum.",
    weakPhrase: "Mir egal, mach du einfach, keine Ahnung.",
    strongPhrase:
      "Ich spiele lieber Linksaußen, weil ich im Tempogegenstoß meine Schnelligkeit einsetzen kann. Dort helfe ich dem Team am meisten.",
  },
];
