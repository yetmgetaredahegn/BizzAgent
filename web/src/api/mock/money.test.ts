import { describe, expect, it } from "vitest";

import { LEDGER_SEED, moneyViewOf, parseCsv, previewImport, suggestCategory } from "./money";

describe("statement import", () => {
  it("parses quoted cells and Windows line endings", () => {
    expect(parseCsv('a,b\r\n"x, y",2\r\n')).toEqual([["a", "b"], ["x, y", "2"]]);
  });

  it("suggests categories from plain keywords and never calls money out a sale", () => {
    expect(suggestCategory("School uniform order", 1000)).toBe("sales");
    expect(suggestCategory("Wages", -500)).toBe("wages");
    expect(suggestCategory("Client refund", -500)).toBe("other");
    expect(suggestCategory("Unknown transfer", -900)).toBe("other");
  });

  it("marks lines already in the ledger as duplicates and does not double count", () => {
    const existing = LEDGER_SEED["abel-studio"];
    const csv = `Date,Details,Amount\n${existing[0].date},${existing[0].description},${existing[0].amount}\n2026-09-30,New client payment,10000\n`;
    const preview = previewImport(existing, { kind: "csv", text: csv });
    expect(preview.ok).toBe(true);
    if (preview.ok) {
      expect(preview.rows.map((r) => r.duplicate)).toEqual([true, false]);
    }
  });

  it("asks for a column mapping when it cannot find the columns, and honours the user's choice", () => {
    const csv = "When2,Thing,Money\n2026-09-30,Test,100\n";
    expect(previewImport([], { kind: "csv", text: csv })).toEqual({ ok: false, reason: "columns", headers: ["When2", "Thing", "Money"] });
    const mapped = previewImport([], { kind: "csv", text: csv, columns: { date: "When2", amount: "Money", description: "Thing" } });
    expect(mapped.ok).toBe(true);
  });

  it("skips lines with no valid date or amount", () => {
    const preview = previewImport([], { kind: "csv", text: "Date,Details,Amount\nnot a date,x,5\n2026-09-30,y,abc\n" });
    expect(preview.ok).toBe(false);
  });
});

describe("ledger view", () => {
  it("adds up money in and out by month and gives profit with its steps", () => {
    const view = moneyViewOf(LEDGER_SEED["abel-studio"]);
    const inflow = view.months.reduce((t, m) => t + m.inflow, 0);
    expect(view.kpis.find((k) => k.id === "in")!.calc.value).toBe(inflow);
    expect(view.kpis.find((k) => k.id === "profit")!.calc.value).toBe(inflow - view.months.reduce((t, m) => t + m.outflow, 0));
  });

  it("shows no figures for an empty ledger instead of inventing them", () => {
    expect(moneyViewOf([]).kpis).toEqual([]);
  });
});
