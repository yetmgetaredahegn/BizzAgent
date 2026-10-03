import { describe, expect, it } from "vitest";

import { CALLS_SEED, validatePublish } from "./partner";

describe("call versions", () => {
  it("every published version's weights add up to 100", () => {
    for (const calls of Object.values(CALLS_SEED)) {
      for (const call of calls) for (const v of call.versions) expect(Object.values(v.weights).reduce((t, w) => t + w, 0)).toBe(100);
    }
  });

  it("refuses to publish weights that do not add up to 100, or a bad date, or no language", () => {
    const ok = { impact: 30, viability: 20, team: 10, evidence: 25, feasibility: 15 };
    expect(validatePublish(ok, "2026-11-01", ["en"])).toBe("ok");
    expect(validatePublish({ ...ok, impact: 31 }, "2026-11-01", ["en"])).toBe("weights");
    expect(validatePublish({ ...ok, impact: -5, viability: 55 }, "2026-11-01", ["en"])).toBe("weights");
    expect(validatePublish(ok, "next week", ["en"])).toBe("deadline");
    expect(validatePublish(ok, "2026-11-01", [])).toBe("languages");
  });
});
