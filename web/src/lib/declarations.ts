/*
 * Three of the fifteen declarations, explained in plain language.
 *
 * ILLUSTRATIVE wording: replace the official text with the declarations
 * from the sequa form. The Amharic and Afaan Oromo explanations are a first
 * draft for native-speaker review.
 */

import type { DeclarationId, Lang } from "./types";

export interface Declaration {
  id: DeclarationId;
  official: string;
  title: Record<Lang, string>;
  plain: Record<Lang, string>;
}

export const TOTAL_DECLARATIONS = 15;

export const DECLARATIONS: Declaration[] = [
  {
    id: "truthful",
    official:
      "I declare that the information provided in this application is true, complete and accurate to the best of my knowledge.",
    title: {
      en: "Everything I told you is true",
      am: "የሰጠሁት መረጃ ሁሉ እውነት ነው",
      om: "Odeeffannoon ani kenne hundi dhugaa dha",
    },
    plain: {
      en: "What you said about your business, your sales, your workers and your licence must be true. If you do not know something, it is better to say “I don't know” than to guess. False information can cancel the grant, and you may have to pay the money back.",
      am: "ስለ ንግድዎ፣ ስለ ሽያጭዎ፣ ስለ ሠራተኞችዎ እና ስለ ፈቃድዎ የተናገሩት እውነት መሆን አለበት። አንድ ነገር ካላወቁ ከመገመት ይልቅ «አላውቅም» ማለት ይሻላል። የተሳሳተ መረጃ ድጋፉን ሊያሰርዝ ይችላል፤ ገንዘቡንም እንዲመልሱ ሊጠየቁ ይችላሉ።",
      om: "Waan waa'ee daldala keessanii, gurgurtaa, hojjettootaa fi hayyama keessanii dubbattan dhugaa ta'uu qaba. Yoo waan tokko hin beekne, tilmaamuu irra “hin beeku” jechuu wayya. Odeeffannoon sobaa deeggarsa haquu danda'a; maallaqa deebisuunis isin irra ga'uu danda'a.",
    },
  },
  {
    id: "verification",
    official:
      "I agree that the programme and its representatives may visit my business premises and inspect documents to verify the information provided.",
    title: {
      en: "You may visit and check",
      am: "መጥተው ማየት እና ማረጋገጥ ይችላሉ",
      om: "Dhuftanii ilaaluu fi mirkaneessuu dandeessu",
    },
    plain: {
      en: "Someone from the programme may come to your workshop, look at your machines and ask to see papers such as your licence or your sales book. You can tell them which days suit you.",
      am: "ከፕሮግራሙ የመጣ ሰው ወደ ሥራ ቦታዎ መጥቶ ማሽኖችዎን ሊያይ እና እንደ ንግድ ፈቃድ ወይም የሽያጭ መዝገብ ያሉ ወረቀቶችን ሊጠይቅ ይችላል። የሚመችዎትን ቀን መናገር ይችላሉ።",
      om: "Namni sagantaa irraa dhufe bakka hojii keessanii dhufee maashinoota keessan ilaaluu fi waraqaalee akka hayyama daldalaa ykn galmee gurgurtaa gaafachuu danda'a. Guyyaa isiniif mijatu himuu dandeessu.",
    },
  },
  {
    id: "no_double_funding",
    official:
      "I declare that the proposed intervention is not financed, fully or partly, by another donor, bank or public programme.",
    title: {
      en: "No one else is paying for the same thing",
      am: "ለአንድ ነገር ሁለት ጊዜ ድጋፍ አልወስድም",
      om: "Wanta tokkoof yeroo lama deeggarsa hin fudhadhu",
    },
    plain: {
      en: "If another organisation or a bank is already paying for the same machine or the same training, you must tell us. You cannot be paid twice for the same thing. Other support for different things is fine.",
      am: "ሌላ ድርጅት ወይም ባንክ ለዚሁ ማሽን ወይም ለዚሁ ሥልጠና አስቀድሞ እየከፈለ ከሆነ ሊነግሩን ይገባል። ለአንድ ነገር ሁለት ጊዜ ክፍያ መቀበል አይቻልም። ለሌሎች ነገሮች የሚገኝ ድጋፍ ችግር የለውም።",
      om: "Yoo dhaabbanni biraa ykn baankiin maashinii kanaaf ykn leenjii kanaaf duraan kaffalaa jiraate, nuuf himuu qabdu. Wanta tokkoof yeroo lama kaffaltii fudhachuun hin danda'amu. Deeggarsi wantoota biraaf argamu rakkoo hin qabu.",
    },
  },
];
