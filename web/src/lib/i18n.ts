/*
 * Applicant-facing strings in English, Amharic and Afaan Oromo.
 *
 * The Amharic and Afaan Oromo text is a first draft and must be reviewed by
 * native speakers before it is shown to real applicants. Documents meant
 * for the funder (the pack, the score) stay in English.
 */

import type { FieldStatus, Lang } from "./types";

export const LANGUAGES: { id: Lang; native: string; english: string }[] = [
  { id: "en", native: "English", english: "English" },
  { id: "am", native: "አማርኛ", english: "Amharic" },
  { id: "om", native: "Afaan Oromoo", english: "Afaan Oromo" },
];

const en = {
  "status.established": "Established",
  "status.unverified": "Unverified",
  "status.missing": "Missing",
  "status.contradictory": "Contradictory",

  "step.pack": "Pack",
  "step.gaps": "Gaps",
  "step.declarations": "Declarations",
  "step.score": "Score",
  "step.impact": "Impact",
  "step.submit": "Submit",

  "intake.eyebrow": "Step 1 of 2",
  "intake.title": "Show us your business",
  "intake.subtitle": "Two photos from any phone. Then we talk: you answer out loud, in your language.",
  "intake.language": "Which language are you most comfortable in?",
  "intake.licence": "Photo of your business licence",
  "intake.licenceHint": "The paper licence, flat, with all four corners visible.",
  "intake.workshop": "Photo of your workshop",
  "intake.workshopHint": "Where the work happens: machines, products, people.",
  "intake.pick": "Take a photo or choose a file",
  "intake.replace": "Replace",
  "intake.samples": "Use sample photos",
  "intake.submit": "Check my documents",
  "intake.checking": "Checking your documents…",
  "intake.ok": "Documents received",
  "intake.next": "Start the voice interview",

  "interview.eyebrow": "Step 2 of 2",
  "interview.title": "Tell us about your business",
  "interview.subtitle": "Listen to each question and answer out loud. Short answers are fine. Say “I don't know” rather than guess.",
  "interview.start": "Start the interview",
  "interview.question": "Question",
  "interview.record": "Record answer",
  "interview.stop": "Stop",
  "interview.retake": "Record again",
  "interview.upload": "Or upload a voice note",
  "interview.send": "Send answer",
  "interview.sending": "Listening to your answer…",
  "interview.done": "That's everything for now.",
  "interview.build": "See my application pack",
  "interview.englishNote": "Questions are spoken in English for now. You can answer in Amharic, Afaan Oromo or English.",
  "interview.you": "You",

  "decl.title": "Three declarations, in your language",
  "decl.subtitle": "We explain what each one means. Only you decide whether to agree.",
  "decl.understood": "I understood",
  "decl.question": "I have a question",
  "decl.recordedUnderstood": "Understanding recorded",
  "decl.recordedQuestion": "Question recorded. An advisor will call you.",
  "decl.official": "Official wording",
  "decl.agree": "I agree",
  "decl.onlyYou": "Only you can tick this box. BizzAgent never ticks it for you.",
  "decl.tickLocked": "First tell us you understood.",
};

export type MessageKey = keyof typeof en;
type Messages = Record<MessageKey, string>;

const am: Messages = {
  "status.established": "የተረጋገጠ",
  "status.unverified": "ያልተረጋገጠ",
  "status.missing": "የጎደለ",
  "status.contradictory": "የሚጋጭ",

  "step.pack": "ማመልከቻ",
  "step.gaps": "ክፍተቶች",
  "step.declarations": "መግለጫዎች",
  "step.score": "ነጥብ",
  "step.impact": "ተጽዕኖ",
  "step.submit": "ማስገባት",

  "intake.eyebrow": "ደረጃ 1 ከ 2",
  "intake.title": "ንግድዎን ያሳዩን",
  "intake.subtitle": "ከማንኛውም ስልክ ሁለት ፎቶዎች። ከዚያ እናወራለን፤ በቋንቋዎ በድምፅ ይመልሳሉ።",
  "intake.language": "በየትኛው ቋንቋ መናገር ይመቸዎታል?",
  "intake.licence": "የንግድ ፈቃድዎ ፎቶ",
  "intake.licenceHint": "ወረቀቱ ተዘርግቶ፣ አራቱም ጠርዞች እንዲታዩ።",
  "intake.workshop": "የሥራ ቦታዎ ፎቶ",
  "intake.workshopHint": "ሥራው የሚሠራበት ቦታ፦ ማሽኖች፣ ምርቶች፣ ሰዎች።",
  "intake.pick": "ፎቶ ያንሱ ወይም ፋይል ይምረጡ",
  "intake.replace": "ቀይር",
  "intake.samples": "የናሙና ፎቶዎችን ተጠቀም",
  "intake.submit": "ሰነዶቼን አረጋግጥ",
  "intake.checking": "ሰነዶችዎ እየተረጋገጡ ነው…",
  "intake.ok": "ሰነዶችዎ ደርሰዋል",
  "intake.next": "የድምፅ ቃለ መጠይቁን ጀምር",

  "interview.eyebrow": "ደረጃ 2 ከ 2",
  "interview.title": "ስለ ንግድዎ ይንገሩን",
  "interview.subtitle": "እያንዳንዱን ጥያቄ ያዳምጡ እና በድምፅ ይመልሱ። አጭር መልስ በቂ ነው። ከመገመት «አላውቅም» ይበሉ።",
  "interview.start": "ቃለ መጠይቁን ጀምር",
  "interview.question": "ጥያቄ",
  "interview.record": "መልስ ይቅረጹ",
  "interview.stop": "አቁም",
  "interview.retake": "እንደገና ቅረጽ",
  "interview.upload": "ወይም የድምፅ መልዕክት ይጫኑ",
  "interview.send": "መልሱን ላክ",
  "interview.sending": "መልስዎን እያዳመጥን ነው…",
  "interview.done": "ለአሁን ይህ በቂ ነው።",
  "interview.build": "ማመልከቻዬን አሳየኝ",
  "interview.englishNote": "ጥያቄዎቹ ለጊዜው በእንግሊዝኛ ይነገራሉ። በአማርኛ፣ በአፋን ኦሮሞ ወይም በእንግሊዝኛ መመለስ ይችላሉ።",
  "interview.you": "እርስዎ",

  "decl.title": "ሦስት መግለጫዎች፣ በቋንቋዎ",
  "decl.subtitle": "የእያንዳንዱን ትርጉም እናብራራለን። ለመስማማት የሚወስኑት እርስዎ ብቻ ነዎት።",
  "decl.understood": "ተረድቻለሁ",
  "decl.question": "ጥያቄ አለኝ",
  "decl.recordedUnderstood": "መረዳትዎ ተመዝግቧል",
  "decl.recordedQuestion": "ጥያቄዎ ተመዝግቧል። አማካሪ ይደውልልዎታል።",
  "decl.official": "ይፋዊ ጽሑፍ",
  "decl.agree": "እስማማለሁ",
  "decl.onlyYou": "ይህን ሳጥን ምልክት ማድረግ የሚችሉት እርስዎ ብቻ ነዎት። BizzAgent በፍጹም ምልክት አያደርግልዎትም።",
  "decl.tickLocked": "መጀመሪያ እንደተረዱ ይንገሩን።",
};

const om: Messages = {
  "status.established": "Mirkanaa'e",
  "status.unverified": "Hin mirkanoofne",
  "status.missing": "Hin jiru",
  "status.contradictory": "Wal-faallessa",

  "step.pack": "Iyyata",
  "step.gaps": "Hanqinoota",
  "step.declarations": "Ibsa",
  "step.score": "Qabxii",
  "step.impact": "Dhiibbaa",
  "step.submit": "Galchi",

  "intake.eyebrow": "Tarkaanfii 1 kan 2",
  "intake.title": "Daldala keessan nutti argisiisaa",
  "intake.subtitle": "Bilbila kamiinuu suuraa lama. Achiin ni haasofna: afaan keessaniin sagaleen deebistu.",
  "intake.language": "Afaan kamiin dubbachuu isinitti tola?",
  "intake.licence": "Suuraa hayyama daldalaa keessanii",
  "intake.licenceHint": "Waraqaan diriirfamee, golgi afranuu akka mul'atan.",
  "intake.workshop": "Suuraa bakka hojii keessanii",
  "intake.workshopHint": "Bakka hojiin itti hojjetamu: maashinoota, oomishaalee, namoota.",
  "intake.pick": "Suuraa kaasaa ykn faayilii filadhaa",
  "intake.replace": "Jijjiiri",
  "intake.samples": "Suuraalee fakkeenyaa fayyadami",
  "intake.submit": "Sanadoota koo mirkaneessi",
  "intake.checking": "Sanadoonni keessan mirkanaa'aa jiru…",
  "intake.ok": "Sanadoonni keessan nu ga'aniiru",
  "intake.next": "Gaaffii sagalee jalqabi",

  "interview.eyebrow": "Tarkaanfii 2 kan 2",
  "interview.title": "Waa'ee daldala keessanii nutti himaa",
  "interview.subtitle": "Gaaffii tokkoon tokkoon dhaggeeffadhaa, sagaleen deebisaa. Deebiin gabaabaan ni ga'a. Tilmaamuu irra “hin beeku” jedhaa.",
  "interview.start": "Gaaffii jalqabi",
  "interview.question": "Gaaffii",
  "interview.record": "Deebii waraabi",
  "interview.stop": "Dhaabi",
  "interview.retake": "Irra deebi'ii waraabi",
  "interview.upload": "Ykn ergaa sagalee ol-fe'i",
  "interview.send": "Deebii ergi",
  "interview.sending": "Deebii keessan dhaggeeffachaa jirra…",
  "interview.done": "Amma kanaaf kanuma.",
  "interview.build": "Iyyata koo naaf agarsiisi",
  "interview.englishNote": "Gaaffiiwwan amma Afaan Ingiliziin dubbatamu. Afaan Amaaraa, Afaan Oromoo ykn Ingiliziin deebisuu dandeessu.",
  "interview.you": "Isin",

  "decl.title": "Ibsa sadii, afaan keessaniin",
  "decl.subtitle": "Hiika tokkoon tokkoo isaanii ni ibsina. Waliigaluu kan murteessu isin qofa.",
  "decl.understood": "Hubadheera",
  "decl.question": "Gaaffii qaba",
  "decl.recordedUnderstood": "Hubannoon keessan galmaa'eera",
  "decl.recordedQuestion": "Gaaffiin keessan galmaa'eera. Gorsaan isinii bilbila.",
  "decl.official": "Barreeffama seeraa",
  "decl.agree": "Nan waliigala",
  "decl.onlyYou": "Saanduqa kana mallattoo kan godhu isin qofa. BizzAgent gonkumaa isiniif hin godhu.",
  "decl.tickLocked": "Jalqaba akka hubattan nutti himaa.",
};

const MESSAGES: Record<Lang, Messages> = { en, am, om };

export function translate(lang: Lang, key: MessageKey): string {
  return MESSAGES[lang][key] ?? en[key];
}

export function statusKey(status: FieldStatus): MessageKey {
  return `status.${status}` as MessageKey;
}
