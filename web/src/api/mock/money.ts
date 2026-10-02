/*
 * Ledger seeds, the statement-import rules and the personal-space seeds
 * (prototype copy of backend/src/bizzagent/imports and money). Every figure is
 * fictional. Category suggestions are plain keyword rules and are never saved
 * until the user confirms them; duplicates are skipped, never double counted.
 */

import { budgetLeft, netWorth, profitMargin, savingsMonths, sumCosts } from "@/lib/calc";

import type { CalcResultDto, ImportInput, ImportPreview, ImportRow, LedgerCategory, LedgerEntry, MoneyView, PersonalMoney } from "../contract";
import { daysFromToday } from "./clock";

const dto = (r: { value: number; unit: CalcResultDto["unit"]; steps: CalcResultDto["steps"]; warnings: string[] }): CalcResultDto => ({
  value: r.value,
  unit: r.unit,
  steps: r.steps,
  warnings: r.warnings,
});

function entry(id: string, daysAgo: number, description: string, amount: number, category: LedgerCategory, source: LedgerEntry["source"]): LedgerEntry {
  return { id, date: daysFromToday(-daysAgo), description, amount, category, source };
}

function meronLedger(): LedgerEntry[] {
  const months = [
    { inflow: 612_000, outflow: 548_000 },
    { inflow: 575_000, outflow: 560_000 },
    { inflow: 640_000, outflow: 571_000 },
    { inflow: 598_000, outflow: 582_000 },
    { inflow: 655_000, outflow: 590_000 },
    { inflow: 690_000, outflow: 604_000 },
  ];
  const out: LedgerEntry[] = [];
  months.forEach((m, i) => {
    const ago = (5 - i) * 30 + 8;
    const k = `m${i}`;
    out.push(entry(`${k}a`, ago, "School uniform order", m.inflow, "sales", "statement"));
    out.push(entry(`${k}b`, ago - 2, "Fabric and thread", -Math.round(m.outflow * 0.55), "materials", "statement"));
    out.push(entry(`${k}c`, ago - 4, "Wages", -Math.round(m.outflow * 0.35), "wages", "statement"));
    out.push(entry(`${k}d`, ago - 6, "Factory rent", -(m.outflow - Math.round(m.outflow * 0.55) - Math.round(m.outflow * 0.35)), "rent", "statement"));
  });
  return out;
}

export const LEDGER_SEED: Record<string, LedgerEntry[]> = {
  "almaz-spices": [
    entry("a1", 26, "Sold 20 kg berbere to a shop in Bekoji", 3000, "sales", "voice"),
    entry("a2", 21, "Bought chillies, 40 kg", -3600, "materials", "voice"),
    entry("a3", 18, "Sold shiro, 15 kg", 2250, "sales", "voice"),
    entry("a4", 12, "Paid two helpers", -2400, "wages", "voice"),
    entry("a5", 7, "Sold 30 kg berbere to a shop in Asella", 4500, "sales", "voice"),
    entry("a6", 3, "Transport to Asella", -400, "transport", "voice"),
  ],
  "meron-garments": meronLedger(),
  "abel-studio": [
    entry("b1", 55, "Client project: shop checkout", 45_000, "sales", "statement"),
    entry("b2", 52, "Contractor payment", -16_000, "wages", "statement"),
    entry("b3", 40, "Cloud hosting", -3_200, "utilities", "statement"),
    entry("b4", 31, "Client project: booking widget", 38_000, "sales", "statement"),
    entry("b5", 28, "Contractor payment", -14_000, "wages", "statement"),
    entry("b6", 20, "Office rent", -9_000, "rent", "statement"),
    entry("b7", 9, "Client project: payments tool", 52_000, "sales", "statement"),
    entry("b8", 6, "Contractor payment", -18_500, "wages", "statement"),
  ],
};

const monthLabel = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleString("en", { month: "short", timeZone: "UTC" });

export function moneyViewOf(entries: LedgerEntry[]): MoneyView {
  const order: string[] = [];
  const byMonth = new Map<string, { inflow: number; outflow: number }>();
  [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((e) => {
      const key = `${e.date.slice(0, 7)}`;
      if (!byMonth.has(key)) {
        byMonth.set(key, { inflow: 0, outflow: 0 });
        order.push(key);
      }
      const m = byMonth.get(key)!;
      if (e.amount >= 0) m.inflow += e.amount;
      else m.outflow += -e.amount;
    });
  const months = order.map((key) => ({ month: monthLabel(`${key}-01`), ...byMonth.get(key)! }));
  const kpis: MoneyView["kpis"] = [];
  if (months.length > 0) {
    const moneyIn = sumCosts(months.map((m) => ({ label: m.month, amount: m.inflow })), "calc.totalIn");
    const moneyOut = sumCosts(months.map((m) => ({ label: m.month, amount: m.outflow })), "calc.totalOut");
    kpis.push({ id: "in", label: { id: "mn.k.in" }, calc: dto(moneyIn) });
    kpis.push({ id: "out", label: { id: "mn.k.out" }, calc: dto(moneyOut) });
    if (moneyIn.value > 0) {
      const margin = profitMargin(moneyIn.value, moneyOut.value);
      kpis.push({ id: "profit", label: { id: "mn.k.profit" }, calc: { ...dto(margin), value: moneyIn.value - moneyOut.value, unit: "birr" } });
      kpis.push({ id: "margin", label: { id: "mn.k.margin" }, calc: dto(margin) });
    }
  }
  return { entries: [...entries].sort((a, b) => b.date.localeCompare(a.date)), months, kpis };
}

// ---- Statement import --------------------------------------------------------------

const RULES: [RegExp, LedgerCategory][] = [
  [/order|client|customer|sale|sold|invoice|payment from|received/i, "sales"],
  [/fabric|thread|chilli|chili|stock|material|supplier|grain|spice/i, "materials"],
  [/wage|salary|payroll|helper|contractor|staff/i, "wages"],
  [/rent|lease/i, "rent"],
  [/transport|fuel|taxi|bus|freight|delivery/i, "transport"],
  [/electric|power|water|internet|hosting|airtime|utility/i, "utilities"],
];

/** Suggests a category from the description and the sign; anything unrecognised is "other". */
export function suggestCategory(description: string, amount: number): LedgerCategory {
  const hit = RULES.find(([pattern]) => pattern.test(description));
  if (hit) {
    // Money in can only be a sale or other; money out can never be a sale.
    if (amount >= 0 && hit[1] !== "sales") return "other";
    if (amount < 0 && hit[1] === "sales") return "other";
    return hit[1];
  }
  return "other";
}

export const SAMPLE_STATEMENT_CSV = `Date,Details,Amount
${daysFromToday(-8)},School uniform order,690000
${daysFromToday(-28)},Fabric and thread,-332200
${daysFromToday(-12)},Mobile airtime top-up,-1500
${daysFromToday(-9)},Transport to the fair,-2800
${daysFromToday(-6)},Wages,-211400
${daysFromToday(-4)},Electricity,-4200
${daysFromToday(-2)},Payment from a new customer,25000
${daysFromToday(-1)},Unknown transfer,-900
`;

/** A small CSV reader: quotes, commas inside quotes and Windows line endings. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const flush = () => {
    row.push(cell.trim());
    cell = "";
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") flush();
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      flush();
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  flush();
  if (row.some((x) => x !== "")) rows.push(row);
  return rows;
}

const GUESS = {
  date: /^(date|day|when)/i,
  amount: /^(amount|value|sum|birr|etb)/i,
  description: /^(desc|detail|narr|memo|note|particular|counterparty)/i,
};

export function previewImport(existing: LedgerEntry[], input: ImportInput): ImportPreview {
  const text = input.kind === "sample" ? SAMPLE_STATEMENT_CSV : input.text;
  const rows = parseCsv(text);
  if (rows.length < 2) return { ok: false, reason: "empty", headers: rows[0] ?? [] };
  const headers = rows[0];
  const given = input.kind === "csv" ? input.columns : undefined;
  const find = (key: keyof typeof GUESS) => (given ? headers.indexOf(given[key]) : headers.findIndex((h) => GUESS[key].test(h)));
  const di = find("date");
  const ai = find("amount");
  const ni = find("description");
  if (di < 0 || ai < 0 || ni < 0) return { ok: false, reason: "columns", headers };
  const taken = new Set(existing.map((e) => `${e.date}|${e.amount}|${e.description.toLowerCase()}`));
  const seen = new Set<string>();
  const out: ImportRow[] = [];
  rows.slice(1).forEach((r, i) => {
    const amount = Number(String(r[ai]).replace(/[^\d.-]/g, ""));
    const date = r[di]?.slice(0, 10);
    if (!Number.isFinite(amount) || amount === 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) return;
    const description = r[ni] ?? "";
    const key = `${date}|${amount}|${description.toLowerCase()}`;
    out.push({ id: `imp${i}`, date, description, amount, category: suggestCategory(description, amount), duplicate: taken.has(key) || seen.has(key) });
    seen.add(key);
  });
  return out.length ? { ok: true, rows: out } : { ok: false, reason: "empty", headers };
}

// ---- Personal space ------------------------------------------------------------------

interface PersonalSeed {
  income: number;
  lines: { label: string; amount: number }[];
  goals: { id: string; title: string; target: number; saved: number; monthly: number }[];
  assets: { label: string; amount: number }[];
  liabilities: { label: string; amount: number }[];
  pay: number;
  checks: { id: string; done: boolean }[];
}

const CHECKS = ["pay", "account", "receipts", "loan"];

const PERSONAL_SEED: Record<string, PersonalSeed> = {
  almaz: {
    income: 6000,
    lines: [{ label: "Food", amount: 2400 }, { label: "School fees", amount: 1200 }, { label: "Transport", amount: 600 }, { label: "Health", amount: 500 }],
    goals: [{ id: "g1", title: "A second grinder", target: 60_000, saved: 15_000, monthly: 2_000 }],
    assets: [{ label: "Savings", amount: 15_000 }, { label: "Jewellery", amount: 20_000 }],
    liabilities: [{ label: "Equb contribution owed", amount: 4_000 }],
    pay: 5_000,
    checks: [{ id: "pay", done: false }, { id: "account", done: false }, { id: "receipts", done: true }, { id: "loan", done: false }],
  },
  meron: {
    income: 45_000,
    lines: [{ label: "Home", amount: 14_000 }, { label: "Food", amount: 9_000 }, { label: "Children", amount: 8_000 }, { label: "Transport", amount: 3_500 }],
    goals: [{ id: "g1", title: "House deposit", target: 600_000, saved: 210_000, monthly: 12_000 }],
    assets: [{ label: "Savings", amount: 210_000 }, { label: "Car", amount: 650_000 }],
    liabilities: [{ label: "Car loan", amount: 180_000 }],
    pay: 40_000,
    checks: [{ id: "pay", done: true }, { id: "account", done: true }, { id: "receipts", done: true }, { id: "loan", done: false }],
  },
  abel: {
    income: 28_000,
    lines: [{ label: "Rent", amount: 9_000 }, { label: "Food", amount: 6_000 }, { label: "Transport", amount: 2_000 }, { label: "Learning", amount: 1_500 }],
    goals: [{ id: "g1", title: "A new laptop", target: 55_000, saved: 18_000, monthly: 4_000 }],
    assets: [{ label: "Savings", amount: 18_000 }, { label: "Laptop", amount: 30_000 }],
    liabilities: [],
    pay: 28_000,
    checks: [{ id: "pay", done: true }, { id: "account", done: false }, { id: "receipts", done: false }, { id: "loan", done: true }],
  },
  selam: {
    income: 3_000,
    lines: [{ label: "Transport", amount: 900 }, { label: "Food", amount: 1_200 }, { label: "Data", amount: 400 }],
    goals: [{ id: "g1", title: "Start-up fund", target: 20_000, saved: 3_500, monthly: 600 }],
    assets: [{ label: "Savings", amount: 3_500 }],
    liabilities: [],
    pay: 0,
    checks: [],
  },
};

export function personalMoneyOf(personaId: string, businessProfit: number | null, done: Record<string, boolean>): PersonalMoney {
  const seed = PERSONAL_SEED[personaId] ?? PERSONAL_SEED.selam;
  return {
    budget: { income: seed.income, lines: seed.lines, left: dto(budgetLeft(seed.income, seed.lines.map((l) => ({ label: l.label, amount: l.amount })))) },
    goals: seed.goals.map((g) => ({ ...g, months: dto(savingsMonths(g.target, g.saved, g.monthly)) })),
    netWorth: { assets: seed.assets, liabilities: seed.liabilities, calc: dto(netWorth(seed.assets.map((a) => ({ label: a.label, amount: a.amount })), seed.liabilities.map((l) => ({ label: l.label, amount: l.amount })))) },
    ownersPay: { pay: seed.pay, businessProfit },
    separate: CHECKS.map((id) => ({ id, text: { id: `pm.sep.${id}` }, done: done[id] ?? seed.checks.find((c) => c.id === id)?.done ?? false })),
  };
}
