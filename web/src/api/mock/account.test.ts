import { describe, expect, it } from "vitest";

import { AUTONOMY_SEED, candidatesFrom } from "./account";

describe("memory import", () => {
  it("turns pasted lines into candidates, dropping noise, and never more than a dozen", () => {
    const text = "Goal: open a second shop in Adama next year\n- Team: two tailors and a cutter\nok\n" + "x".repeat(300) + "\n" + Array.from({ length: 20 }, (_, i) => `Fact number ${i} about the business`).join("\n");
    const out = candidatesFrom(text);
    expect(out[0]).toEqual({ topic: "goals", text: "open a second shop in Adama next year" });
    expect(out[1]).toEqual({ topic: "people", text: "two tailors and a cutter" });
    expect(out.length).toBeLessThanOrEqual(12);
    expect(out.every((c) => c.text.length >= 8 && c.text.length <= 240)).toBe(true);
  });
});

describe("autonomy limits", () => {
  it("never allows L3 for skills that sign, submit or give legal-adjacent steps", () => {
    for (const id of ["setup", "funding", "hiring"]) expect(AUTONOMY_SEED.find((s) => s.id === id)!.max).toBeLessThan(3);
  });

  it("starts every skill at a level it is allowed to have", () => {
    expect(AUTONOMY_SEED.every((s) => s.level <= s.max)).toBe(true);
  });
});
