/*
 * Plain-language definitions for TermTooltip. These are general concept
 * definitions only. Anything about Ethiopian law (what a PLC is under the
 * Commercial Code, thresholds, fees) comes from a cited country-pack entry,
 * never from here. Amharic and Afaan Oromo text is a draft pending native review;
 * a missing translation falls back to English with a notice.
 */

import type { Lang } from "./types";

type Localised = Partial<Record<Lang, string>> & { en: string };
export interface GlossaryEntry {
  label: Localised;
  def: Localised;
}

export const GLOSSARY = {
  margin: {
    label: { en: "gross margin" },
    def: { en: "The part of the selling price left after the cost of making it. 32% means 32 birr kept from every 100 birr sold." },
  },
  markup: {
    label: { en: "markup" },
    def: { en: "What you add on top of your cost to set the price. A cost of 100 and a price of 150 is a markup of 50%." },
  },
  soleProprietorship: {
    label: { en: "sole proprietorship" },
    def: { en: "A business owned by one person, who answers personally for its debts. The legal meaning in Ethiopia is in the cited checklist." },
  },
  plc: {
    label: { en: "private limited company" },
    def: { en: "A company that is a legal entity separate from its owners. How it works in Ethiopia is explained, with sources, in the setup checklist." },
  },
  shareholder: {
    label: { en: "shareholder", am: "ባለአክሲዮን" },
    def: { en: "An owner of part of a company. The share they own shows how much of the company is theirs." },
  },
  netWorth: {
    label: { en: "net worth" },
    def: { en: "What you own minus what you owe." },
  },
  cashFlow: {
    label: { en: "cash flow" },
    def: { en: "The money coming in and going out of the business over time, month by month." },
  },
  grant: {
    label: { en: "grant" },
    def: { en: "Money given for a purpose that you do not have to pay back." },
  },
  declaration: {
    label: { en: "declaration" },
    def: { en: "A statement you sign to say something is true. Only you can tick it." },
  },
  tin: {
    label: { en: "TIN" },
    def: { en: "A tax identification number. What it is used for in Ethiopia is explained, with sources, in the setup checklist." },
  },
  evidence: {
    label: { en: "evidence" },
    def: { en: "A document, photo or number that shows a statement is true." },
  },
} satisfies Record<string, GlossaryEntry>;

export type TermId = keyof typeof GLOSSARY;
