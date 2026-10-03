import { describe, expect, it } from "vitest";

import { evaluateOpportunity, CATALOGUE, rankOpportunities } from "./opportunities";
import { commonApplicationOf, readinessOf } from "./trust";
import { WORKSPACES } from "./seed/workspaces";

const ws = (id: string) => WORKSPACES.find((w) => w.id === id)!;
const opps = (id: string) => CATALOGUE.map((entry) => evaluateOpportunity(ws(id), entry, null));

describe("readiness", () => {
  it("is plain arithmetic: the parts add up to the score and never exceed their maximum", () => {
    for (const w of WORKSPACES) {
      const r = readinessOf(w);
      expect(r.score).toBe(r.components.reduce((t, c) => t + c.points, 0));
      for (const c of r.components) expect(c.points).toBeLessThanOrEqual(c.max);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });

  it("offers at most three actions, biggest gain first, and only ones that would raise the score", () => {
    const r = readinessOf(ws("almaz-spices"));
    expect(r.actions.length).toBeLessThanOrEqual(3);
    expect(r.actions.every((a) => a.raises > 0)).toBe(true);
    expect([...r.actions].sort((a, b) => b.raises - a.raises)).toEqual(r.actions);
  });

  it("scores a ledger-backed, registered business above one without evidence", () => {
    expect(readinessOf(ws("meron-garments")).score).toBeGreaterThan(readinessOf(ws("selam-idea")).score);
  });
});

describe("opportunity matching", () => {
  it("says 'likely' rather than 'eligible' when a fact is only the user's word", () => {
    const highland = opps("almaz-spices").find((o) => o.id === "highland-agro")!;
    expect(highland.eligibility.state).toBe("likely");
    expect(highland.eligibility.confirm.length).toBeGreaterThan(0);
  });

  it("is not eligible when a hard condition fails, and says why", () => {
    const angels = opps("almaz-spices").find((o) => o.id === "rift-angels")!;
    expect(angels.eligibility.state).toBe("not");
    expect(angels.eligibility.reasons.map((r) => r.id)).toContain("opp.not.ledger");
  });

  it("ranks a scam-flagged listing below every clean one", () => {
    const ranked = rankOpportunities(opps("meron-garments"));
    const firstFlagged = ranked.findIndex((o) => o.scam.length > 0);
    expect(ranked.slice(firstFlagged).every((o) => o.scam.length > 0)).toBe(true);
  });

  it("marks closing soon within 14 days and never for a rolling listing", () => {
    const list = opps("meron-garments");
    expect(list.find((o) => o.id === "sme-export-tender")!.closingSoon).toBe(true);
    expect(list.find((o) => o.id === "rift-angels")!.closingSoon).toBe(false);
  });
});

describe("common application", () => {
  it("only asks for fields some chosen call needs, and never includes a scam-flagged call", () => {
    const common = commonApplicationOf(ws("almaz-spices"), opps("almaz-spices"));
    expect(common.calls.find((c) => c.id === "quick-cash")).toBeUndefined();
    expect(common.fields.every((f) => f.requiredBy.length > 0)).toBe(true);
    expect(common.fields.every((f) => f.requiredBy.every((id) => common.calls.some((c) => c.id === id)))).toBe(true);
  });
});
