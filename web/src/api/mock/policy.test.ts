import { describe, expect, it } from "vitest";

import { parseInstruction } from "./policy";

describe("parseInstruction", () => {
  it("turns an alert with a ceiling into a structured policy", () => {
    expect(parseInstruction("Alert me about grants for women-led agro-processing under Br 5M")).toEqual({
      ok: true,
      policy: { kind: "alert", what: "grants for women-led agro-processing", maxBirr: 5_000_000 },
    });
  });

  it("reads a draft rule and never turns it into a submit rule", () => {
    const result = parseInstruction("Auto-draft applications for matches above 80% fit, never submit");
    expect(result).toEqual({ ok: true, policy: { kind: "draft", minFit: 80 } });
  });

  it("reads a monthly credit budget", () => {
    expect(parseInstruction("Monthly budget 300 credits")).toEqual({ ok: true, policy: { kind: "budget", credits: 300 } });
    expect(parseInstruction("Spend at most 150 credits per month")).toEqual({ ok: true, policy: { kind: "budget", credits: 150 } });
  });

  it("says it did not understand rather than guessing", () => {
    expect(parseInstruction("Make me rich")).toEqual({ ok: false });
    expect(parseInstruction("draft above 400% fit")).toEqual({ ok: false });
  });
});
