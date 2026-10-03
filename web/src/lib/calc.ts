/*
 * Prototype calculators with step traces (prototype copy of
 * backend/src/bizzagent/calc). Numbers shown to users come only from here,
 * never from model text. Every result lists ordered steps, the inputs used and
 * warnings, so any figure can open its ReceiptTape.
 */

export type Op = "+" | "−" | "×" | "÷" | "=";

export interface CalcStep {
  /** Message id of the label, e.g. "calc.price". */
  label: string;
  op?: Op;
  value: number;
  /** Which input this line is (for the source link). */
  input?: string;
  /** Unit hint for formatting. */
  unit?: "birr" | "percent" | "count" | "months";
}

export interface CalcResult {
  value: number;
  unit: "birr" | "percent" | "count" | "months";
  steps: CalcStep[];
  warnings: string[];
}

const round = (n: number, places = 2) => Math.round(n * 10 ** places) / 10 ** places;

export function grossMargin(price: number, cost: number): CalcResult {
  const warnings: string[] = [];
  if (price <= 0) throw new Error("price must be above zero");
  if (cost > price) warnings.push("calc.warn.costAbovePrice");
  const profit = price - cost;
  const margin = (profit / price) * 100;
  return {
    value: round(margin, 1),
    unit: "percent",
    warnings,
    steps: [
      { label: "calc.price", value: price, input: "price", unit: "birr" },
      { label: "calc.cost", op: "−", value: cost, input: "cost", unit: "birr" },
      { label: "calc.profit", op: "=", value: profit, unit: "birr" },
      { label: "calc.divPrice", op: "÷", value: price, unit: "birr" },
      { label: "calc.margin", op: "=", value: round(margin, 1), unit: "percent" },
    ],
  };
}

export function markup(price: number, cost: number): CalcResult {
  if (cost <= 0) throw new Error("cost must be above zero");
  const profit = price - cost;
  const result = (profit / cost) * 100;
  return {
    value: round(result, 1),
    unit: "percent",
    warnings: [],
    steps: [
      { label: "calc.price", value: price, input: "price", unit: "birr" },
      { label: "calc.cost", op: "−", value: cost, input: "cost", unit: "birr" },
      { label: "calc.profit", op: "=", value: profit, unit: "birr" },
      { label: "calc.divCost", op: "÷", value: cost, unit: "birr" },
      { label: "calc.markup", op: "=", value: round(result, 1), unit: "percent" },
    ],
  };
}

export function breakEven(fixedCosts: number, price: number, variableCost: number): CalcResult {
  const contribution = price - variableCost;
  if (contribution <= 0) throw new Error("price must be above the variable cost");
  const units = Math.ceil(fixedCosts / contribution);
  return {
    value: units,
    unit: "count",
    warnings: [],
    steps: [
      { label: "calc.fixed", value: fixedCosts, input: "fixed", unit: "birr" },
      { label: "calc.contribution", op: "÷", value: contribution, unit: "birr" },
      { label: "calc.breakEven", op: "=", value: units, unit: "count" },
    ],
  };
}

export type LoanMethod = "flat" | "declining";

export interface LoanResult extends CalcResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  /** Effective annual rate, in percent. */
  effectiveAnnualRate: number;
}

/** Monthly rate i that makes the payment stream worth the principal (bisection). */
function monthlyRate(principal: number, payment: number, months: number): number {
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    const pv = mid === 0 ? payment * months : (payment * (1 - (1 + mid) ** -months)) / mid;
    if (pv > principal) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Loan repayment. "flat": interest = principal × yearly rate × years, spread
 * evenly. "declining": the yearly rate applies to the balance still owed.
 * The effective annual rate lets the two be compared like for like.
 */
export function loan(principal: number, yearlyRatePct: number, months: number, method: LoanMethod): LoanResult {
  const years = months / 12;
  let payment: number;
  if (method === "flat") {
    payment = (principal + principal * (yearlyRatePct / 100) * years) / months;
  } else {
    const i = yearlyRatePct / 100 / 12;
    payment = i === 0 ? principal / months : (principal * i) / (1 - (1 + i) ** -months);
  }
  const total = payment * months;
  const i = monthlyRate(principal, payment, months);
  const ear = ((1 + i) ** 12 - 1) * 100;
  const steps: CalcStep[] =
    method === "flat"
      ? [
          { label: "calc.principal", value: principal, input: "principal", unit: "birr" },
          { label: "calc.flatInterest", op: "+", value: round(principal * (yearlyRatePct / 100) * years), unit: "birr" },
          { label: "calc.totalPaid", op: "=", value: round(total), unit: "birr" },
          { label: "calc.divMonths", op: "÷", value: months, input: "months", unit: "months" },
          { label: "calc.monthly", op: "=", value: round(payment), unit: "birr" },
        ]
      : [
          { label: "calc.principal", value: principal, input: "principal", unit: "birr" },
          { label: "calc.monthlyRate", op: "×", value: round(yearlyRatePct / 12, 3), unit: "percent" },
          { label: "calc.monthly", op: "=", value: round(payment), unit: "birr" },
          { label: "calc.timesMonths", op: "×", value: months, input: "months", unit: "months" },
          { label: "calc.totalPaid", op: "=", value: round(total), unit: "birr" },
        ];
  return {
    value: round(payment),
    unit: "birr",
    steps: [...steps, { label: "calc.effective", op: "=", value: round(ear, 1), unit: "percent" }],
    warnings: [],
    monthlyPayment: round(payment),
    totalPaid: round(total),
    totalInterest: round(total - principal),
    effectiveAnnualRate: round(ear, 1),
  };
}

/** Month-by-month cash position from a starting balance and monthly in/out flows. */
export function cashFlow(opening: number, monthly: { inflow: number; outflow: number }[]): CalcResult & { balances: number[] } {
  let balance = opening;
  const balances = monthly.map(({ inflow, outflow }) => {
    balance += inflow - outflow;
    return balance;
  });
  const lowest = Math.min(...balances);
  return {
    value: balance,
    unit: "birr",
    balances,
    warnings: lowest < 0 ? ["calc.warn.cashNegative"] : [],
    steps: [
      { label: "calc.opening", value: opening, input: "opening", unit: "birr" },
      { label: "calc.inflows", op: "+", value: monthly.reduce((s, m) => s + m.inflow, 0), unit: "birr" },
      { label: "calc.outflows", op: "−", value: monthly.reduce((s, m) => s + m.outflow, 0), unit: "birr" },
      { label: "calc.closing", op: "=", value: balance, unit: "birr" },
    ],
  };
}

/** Top-down market size per year: buyers × share of them who would buy × price per buyer. */
export function marketSize(buyers: number, sharePct: number, pricePerBuyer: number): CalcResult {
  if (buyers < 0 || pricePerBuyer < 0) throw new Error("buyers and price must not be negative");
  if (sharePct < 0 || sharePct > 100) throw new Error("share must be between 0 and 100");
  const reachable = Math.round(buyers * (sharePct / 100));
  const size = reachable * pricePerBuyer;
  return {
    value: size,
    unit: "birr",
    warnings: [],
    steps: [
      { label: "calc.buyers", value: buyers, input: "buyers", unit: "count" },
      { label: "calc.sharePct", op: "×", value: sharePct, input: "share", unit: "percent" },
      { label: "calc.reachable", op: "=", value: reachable, unit: "count" },
      { label: "calc.pricePerBuyer", op: "×", value: pricePerBuyer, input: "price", unit: "birr" },
      { label: "calc.marketSize", op: "=", value: size, unit: "birr" },
    ],
  };
}

/** Weighted rubric score as a percent of the best possible: Σ weight × score ÷ Σ weight × max. */
export function weightedScore(rows: { weight: number; score: number; label: string }[], maxScore = 5): CalcResult {
  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
  if (totalWeight <= 0) throw new Error("weights must add up to more than zero");
  if (rows.some((row) => row.score < 0 || row.score > maxScore)) throw new Error("score outside the scale");
  const points = rows.reduce((sum, row) => sum + row.weight * row.score, 0);
  const percent = (points / (totalWeight * maxScore)) * 100;
  return {
    value: round(percent, 1),
    unit: "percent",
    warnings: [],
    steps: [
      ...rows.map((row, i) => ({ label: row.label, op: i === 0 ? undefined : ("+" as Op), value: row.weight * row.score, unit: "count" as const })),
      { label: "calc.pointsOf", op: "÷", value: totalWeight * maxScore, unit: "count" },
      { label: "calc.score", op: "=", value: round(percent, 1), unit: "percent" },
    ],
  };
}

/** Adds up cost lines (for the cost to enter a market or to start). */
export function sumCosts(lines: { label: string; amount: number }[], totalLabel = "calc.totalCost"): CalcResult {
  if (lines.some((line) => line.amount < 0)) throw new Error("costs must not be negative");
  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  return {
    value: total,
    unit: "birr",
    warnings: [],
    steps: [
      ...lines.map((line, i) => ({ label: line.label, op: i === 0 ? undefined : ("+" as Op), value: line.amount, unit: "birr" as const })),
      { label: totalLabel, op: "=", value: total, unit: "birr" },
    ],
  };
}

/** Profit and margin from money in and money out: (in − out) ÷ in. */
export function profitMargin(moneyIn: number, moneyOut: number): CalcResult {
  if (moneyIn <= 0) throw new Error("money in must be above zero");
  const profit = moneyIn - moneyOut;
  const margin = (profit / moneyIn) * 100;
  return {
    value: round(margin, 1),
    unit: "percent",
    warnings: moneyOut > moneyIn ? ["calc.warn.costAbovePrice"] : [],
    steps: [
      { label: "calc.moneyIn", value: moneyIn, input: "in", unit: "birr" },
      { label: "calc.moneyOut", op: "−", value: moneyOut, input: "out", unit: "birr" },
      { label: "calc.profit", op: "=", value: profit, unit: "birr" },
      { label: "calc.divMoneyIn", op: "÷", value: moneyIn, unit: "birr" },
      { label: "calc.margin", op: "=", value: round(margin, 1), unit: "percent" },
    ],
  };
}

/** What is left of an income after the budgeted expenses (negative means overspent). */
export function budgetLeft(income: number, expenses: { label: string; amount: number }[]): CalcResult {
  if (income < 0 || expenses.some((line) => line.amount < 0)) throw new Error("amounts must not be negative");
  const spent = expenses.reduce((sum, line) => sum + line.amount, 0);
  const left = income - spent;
  return {
    value: left,
    unit: "birr",
    warnings: left < 0 ? ["calc.warn.overBudget"] : [],
    steps: [
      { label: "calc.income", value: income, input: "income", unit: "birr" },
      ...expenses.map((line) => ({ label: line.label, op: "−" as Op, value: line.amount, unit: "birr" as const })),
      { label: "calc.left", op: "=", value: left, unit: "birr" },
    ],
  };
}

/** Months to reach a savings goal at a steady monthly amount, rounded up. */
export function savingsMonths(target: number, saved: number, monthly: number): CalcResult {
  if (monthly <= 0) throw new Error("monthly saving must be above zero");
  const remaining = Math.max(0, target - saved);
  const months = Math.ceil(remaining / monthly);
  return {
    value: months,
    unit: "months",
    warnings: [],
    steps: [
      { label: "calc.target", value: target, input: "target", unit: "birr" },
      { label: "calc.saved", op: "−", value: saved, input: "saved", unit: "birr" },
      { label: "calc.remaining", op: "=", value: remaining, unit: "birr" },
      { label: "calc.perMonth", op: "÷", value: monthly, input: "monthly", unit: "birr" },
      { label: "calc.months", op: "=", value: months, unit: "months" },
    ],
  };
}

/** Net worth: what you own minus what you owe. */
export function netWorth(assets: { label: string; amount: number }[], liabilities: { label: string; amount: number }[]): CalcResult {
  if (assets.some((a) => a.amount < 0) || liabilities.some((l) => l.amount < 0)) throw new Error("amounts must not be negative");
  const own = assets.reduce((sum, a) => sum + a.amount, 0);
  const owe = liabilities.reduce((sum, l) => sum + l.amount, 0);
  return {
    value: own - owe,
    unit: "birr",
    warnings: [],
    steps: [
      { label: "calc.assets", value: own, unit: "birr" },
      { label: "calc.liabilities", op: "−", value: owe, unit: "birr" },
      { label: "calc.netWorth", op: "=", value: own - owe, unit: "birr" },
    ],
  };
}
