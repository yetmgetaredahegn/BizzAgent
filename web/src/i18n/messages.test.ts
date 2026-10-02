import { describe, expect, it } from "vitest";

import { ALL_AREAS } from "./index";

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("messages", () => {
  it("has the same keys in en, am and om, with no empty text and matching placeholders", () => {
    for (const area of ALL_AREAS) {
      const keys = Object.keys(area.en).sort();
      expect(Object.keys(area.am).sort()).toEqual(keys);
      expect(Object.keys(area.om).sort()).toEqual(keys);
      for (const key of keys) {
        for (const lang of ["en", "am", "om"] as const) {
          const text = (area[lang] as Record<string, string>)[key];
          expect(text.trim(), `${lang}:${key}`).not.toBe("");
          expect(placeholders(text), `${lang}:${key} placeholders`).toEqual(
            placeholders((area.en as Record<string, string>)[key]),
          );
        }
      }
    }
  });

  it("uses Ge'ez script for Amharic text (a wrong-script string is a bug)", () => {
    const latinOnly = /^[\x20-\x7E…·–—−÷×«»“”‘’]+$/;
    const allowedLatin = new Set(["landing.rcpt.head", "ec"]);
    for (const area of ALL_AREAS) {
      for (const [key, text] of Object.entries(area.am as Record<string, string>)) {
        if (allowedLatin.has(key)) continue;
        // Strings with no letters (e.g. "{n} / {m}") have no script to check.
        if (!/[A-Za-z\u1200-\u137F]/.test(text.replace(/\{\w+\}/g, ""))) continue;
        expect(latinOnly.test(text), `am:${key} looks Latin-only: ${text}`).toBe(false);
      }
    }
  });
});
