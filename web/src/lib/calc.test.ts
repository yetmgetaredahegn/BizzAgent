import { describe, expect, it } from "vitest";

import { breakEven, cashFlow, grossMargin, loan, markup, marketSize, sumCosts, weightedScore } from "./calc";

describe("calculators", () => {
  it("gross margin: (150 − 102) ÷ 150 = 32.0%", () => {
    const r = grossMargin(150, 102);
    expect(r.value).toBe(32);
    expect(r.steps.map((s) => s.value)).toEqual([150, 102, 48, 150, 32]);
    expect(r.warnings).toEqual([]);
  });

  it("warns when cost is above price and never exceeds 100%", () => {
    expect(grossMargin(100, 120).warnings).toContain("calc.warn.costAbovePrice");
    expect(grossMargin(100, 0).value).toBe(100);
  });

  it("markup: (150 − 102) ÷ 102 = 47.1%", () => {
    expect(markup(150, 102).value).toBe(47.1);
  });

  it("break-even rounds up to whole units", () => {
    // 10,000 fixed ÷ (150 − 102 = 48) = 208.33 → 209 units
    expect(breakEven(10_000, 150, 102).value).toBe(209);
  });

  it("flat loan: 100,000 at 12% flat for 12 months pays 9,333.33 a month", () => {
    const r = loan(100_000, 12, 12, "flat");
    expect(r.monthlyPayment).toBeCloseTo(9333.33, 2);
    expect(r.totalInterest).toBeCloseTo(12_000, 0);
  });

  it("declining loan: 100,000 at 12% a year for 12 months pays 8,884.88 a month", () => {
    const r = loan(100_000, 12, 12, "declining");
    expect(r.monthlyPayment).toBeCloseTo(8884.88, 2);
    // Declining balance at 12% nominal has an effective annual rate of 12.68%.
    expect(r.effectiveAnnualRate).toBeCloseTo(12.7, 1);
  });

  it("the same stated rate costs more as a flat loan than as declining balance", () => {
    const flat = loan(100_000, 12, 12, "flat");
    const declining = loan(100_000, 12, 12, "declining");
    expect(flat.effectiveAnnualRate).toBeGreaterThan(declining.effectiveAnnualRate);
    expect(flat.totalInterest).toBeGreaterThan(declining.totalInterest);
  });

  it("the effective rate makes the payment stream worth the principal", () => {
    const r = loan(250_000, 18, 24, "flat");
    const i = (1 + r.effectiveAnnualRate / 100) ** (1 / 12) - 1;
    const pv = (r.monthlyPayment * (1 - (1 + i) ** -24)) / i;
    expect(pv).toBeCloseTo(250_000, -2);
  });

  it("cash flow tracks the balance and warns when it goes negative", () => {
    const ok = cashFlow(1000, [
      { inflow: 500, outflow: 300 },
      { inflow: 400, outflow: 350 },
    ]);
    expect(ok.balances).toEqual([1200, 1250]);
    expect(ok.warnings).toEqual([]);
    expect(cashFlow(100, [{ inflow: 0, outflow: 500 }]).warnings).toContain("calc.warn.cashNegative");
  });

  it("market size: 40,000 buyers × 5% × Br 900 = Br 1,800,000", () => {
    const r = marketSize(40_000, 5, 900);
    expect(r.steps.map((step) => step.value)).toEqual([40_000, 5, 2_000, 900, 1_800_000]);
    expect(r.value).toBe(1_800_000);
    expect(() => marketSize(100, 120, 10)).toThrow();
  });

  it("weighted score: (30×4 + 20×3 + 50×5) ÷ (100×5) = 86.0%", () => {
    const r = weightedScore([
      { label: "a", weight: 30, score: 4 },
      { label: "b", weight: 20, score: 3 },
      { label: "c", weight: 50, score: 5 },
    ]);
    expect(r.value).toBe(86);
    expect(() => weightedScore([{ label: "a", weight: 1, score: 6 }])).toThrow();
  });

  it("sums cost lines and rejects negatives", () => {
    expect(sumCosts([{ label: "a", amount: 1000 }, { label: "b", amount: 250 }]).value).toBe(1250);
    expect(() => sumCosts([{ label: "a", amount: -1 }])).toThrow();
  });
});
