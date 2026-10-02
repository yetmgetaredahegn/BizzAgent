/*
 * Prototype text-to-speech. Uses the browser's speech synthesis when it has a
 * voice for the language; otherwise does nothing. Production uses the speech
 * adapters (docs/i18n/LANGUAGE_SUPPORT.md §5), which are verified per language.
 */

import type { Lang } from "./types";

const BCP47: Record<Lang, string> = { en: "en-US", am: "am-ET", om: "om-ET" };

export function canSpeak(lang: Lang): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  return window.speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith(BCP47[lang].slice(0, 2)));
}

export function speak(text: string, lang: Lang): boolean {
  if (!canSpeak(lang)) return false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = BCP47[lang];
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}
