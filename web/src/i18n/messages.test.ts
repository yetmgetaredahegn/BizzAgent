import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

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

  it("defines every key in one area only (a duplicate would silently override)", () => {
    const seen = new Map<string, number>();
    ALL_AREAS.forEach((area, index) => {
      for (const key of Object.keys(area.en)) {
        expect(seen.has(key), `${key} is defined in areas ${seen.get(key)} and ${index}`).toBe(false);
        seen.set(key, index);
      }
    });
  });

  it("has a message for every id the mock API and calculators refer to", () => {
    const known = new Set(ALL_AREAS.flatMap((area) => Object.keys(area.en)));
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.ts$/.test(name) && !/\.test\.ts$/.test(name)) files.push(path);
      }
    };
    walk(join(__dirname, "../api/mock"));
    files.push(join(__dirname, "../lib/calc.ts"));
    const patterns = [/\bm\("([a-z][\w.]*)"/g, /\{ id: "([a-z][\w]*\.[\w.]+)"/g, /label: "(calc\.[\w.]+)"/g, /push\("(calc\.[\w.]+)"/g];
    const missing: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const pattern of patterns) for (const match of source.matchAll(pattern)) if (!known.has(match[1])) missing.push(`${file.split("/src/")[1]}: ${match[1]}`);
    }
    expect(missing).toEqual([]);
  });
});
