import type { LegalForm, PartnerKind, WorkspaceType } from "@/api";
import { createStore } from "@/lib/store";

export interface Candidate {
  id: string;
  text: string;
  removed: boolean;
}

export interface OnboardingState {
  phone: string;
  path: WorkspaceType | null;
  legalForm?: LegalForm;
  partnerKind?: PartnerKind;
  facts: { name?: string; business?: string; activity?: string; town?: string; staff?: string; need?: string };
  importText: string;
  candidates: Candidate[];
}

export const INITIAL: OnboardingState = { phone: "", path: null, facts: {}, importText: "", candidates: [] };

export const onboardingStore = createStore<OnboardingState>("bizzagent.onboarding", "session", INITIAL);

export function patchOnboarding(patch: Partial<OnboardingState>) {
  onboardingStore.set((previous) => ({ ...previous, ...patch }));
}

const WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20,
};

/** Prototype number parsing (digits and English words). Production uses i18n/numbers.py for am/om too. */
export function parseCount(text: string): number | undefined {
  const digits = text.match(/\d+/);
  if (digits) return Number(digits[0]);
  const word = text.toLowerCase().split(/\W+/).find((w) => w in WORDS);
  return word ? WORDS[word] : undefined;
}

/** Pulls plain statements out of text pasted from another assistant. */
export function extractCandidates(text: string): Candidate[] {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((line) => line.length > 6)
    .slice(0, 8)
    .map((line, i) => ({ id: `c${i}`, text: line, removed: false }));
}

/** Language chosen by voice or text: matches the language's own name. */
export function parseLanguageIntent(text: string): "en" | "am" | "om" | null {
  const lower = text.toLowerCase();
  if (/oromo|oromoo|afaan|ኦሮ/.test(lower)) return "om";
  if (/amharic|amarigna|amaaraa|አማር/.test(lower)) return "am";
  if (/english|እንግሊዝኛ|ingiliz|ingilif/.test(lower)) return "en";
  return null;
}
