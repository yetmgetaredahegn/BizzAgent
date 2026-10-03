/*
 * Ethiopian (EC) <-> Gregorian (GC) conversion by Julian Day Number.
 * EC has 12 months of 30 days plus Pagume (5 days, 6 in a leap year). A year
 * is a leap year when year % 4 === 3. 1 Meskerem 2017 EC = 11 September 2024.
 */

import type { Lang } from "./types";

const EC_EPOCH_JDN = 1723856; // JDN of 1 Meskerem of year 0 EC (year 1 starts 365 days later)

export interface YMD {
  year: number;
  month: number;
  day: number;
}

export function gregorianToJdn({ year, month, day }: YMD): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

export function jdnToGregorian(jdn: number): YMD {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: 100 * b + d - 4800 + Math.floor(m / 10),
  };
}

export function ethiopianToJdn({ year, month, day }: YMD): number {
  return EC_EPOCH_JDN + 365 * year + Math.floor(year / 4) + 30 * (month - 1) + (day - 1);
}

export function jdnToEthiopian(jdn: number): YMD {
  const since = jdn - EC_EPOCH_JDN;
  const cycle = Math.floor(since / 1461);
  const r = since - cycle * 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  return {
    year: 4 * cycle + Math.floor(r / 365) - Math.floor(r / 1460),
    month: Math.floor(n / 30) + 1,
    day: (n % 30) + 1,
  };
}

export function toEthiopian(gregorian: YMD): YMD {
  return jdnToEthiopian(gregorianToJdn(gregorian));
}

export function toGregorian(ethiopian: YMD): YMD {
  return jdnToGregorian(ethiopianToJdn(ethiopian));
}

export function parseIsoDate(iso: string): YMD {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return { year, month, day };
}

export function isEthiopianLeapYear(year: number): boolean {
  return year % 4 === 3;
}

/** Month names. Oromo names are a draft pending native review. */
export const EC_MONTHS: Record<Lang, string[]> = {
  en: [
    "Meskerem",
    "Tikimt",
    "Hidar",
    "Tahsas",
    "Tir",
    "Yekatit",
    "Megabit",
    "Miazia",
    "Ginbot",
    "Sene",
    "Hamle",
    "Nehase",
    "Pagume",
  ],
  am: [
    "መስከረም",
    "ጥቅምት",
    "ኅዳር",
    "ታኅሣሥ",
    "ጥር",
    "የካቲት",
    "መጋቢት",
    "ሚያዝያ",
    "ግንቦት",
    "ሰኔ",
    "ሐምሌ",
    "ነሐሴ",
    "ጳጉሜን",
  ],
  om: [
    "Fuulbana",
    "Onkoloolessa",
    "Sadaasa",
    "Muddee",
    "Amajjii",
    "Guraandhala",
    "Bitootessa",
    "Ebla",
    "Caamsaa",
    "Waxabajjii",
    "Adoolessa",
    "Hagayya",
    "Qaammee",
  ],
};

const GC_MONTHS: Record<Lang, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  am: ["ጃንዩ", "ፌብሩ", "ማርች", "ኤፕሪ", "ሜይ", "ጁን", "ጁላ", "ኦገስ", "ሴፕቴ", "ኦክቶ", "ኖቬም", "ዲሴም"],
  om: ["Ama", "Gur", "Bit", "Ebl", "Cam", "Wax", "Ado", "Hag", "Ful", "Onk", "Sad", "Mud"],
};

export function formatEthiopian({ year, month, day }: YMD, lang: Lang): string {
  const suffix = lang === "am" ? "ዓ.ም" : "EC";
  return `${day} ${EC_MONTHS[lang][month - 1]} ${year} ${suffix}`;
}

export function formatGregorian({ year, month, day }: YMD, lang: Lang): string {
  return `${day} ${GC_MONTHS[lang][month - 1]} ${year}`;
}

export type DateOrder = "ec-first" | "gc-first";

/** "21 Meskerem 2019 EC · 1 Oct 2026" from an ISO (Gregorian) date. */
export function formatDual(iso: string, lang: Lang, order: DateOrder = "ec-first"): string {
  const gc = parseIsoDate(iso);
  const ec = toEthiopian(gc);
  const parts = [formatEthiopian(ec, lang), formatGregorian(gc, lang)];
  return (order === "ec-first" ? parts : parts.reverse()).join(" · ");
}
