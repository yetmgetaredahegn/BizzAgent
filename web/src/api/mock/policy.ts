/*
 * Standing instructions: plain words turned into a structured policy that is shown
 * back for confirmation and then enforced deterministically (prototype copy of
 * backend/src/bizzagent/agents/core/policy.py). The real parser lets a model propose a
 * policy and a validator accept or reject it; the prototype understands a few
 * English patterns and says so when it cannot.
 */

import type { ParsedInstruction } from "../contract";

const SCALE: Record<string, number> = { k: 1_000, thousand: 1_000, m: 1_000_000, million: 1_000_000 };

function amountOf(raw: string, unit?: string): number {
  const base = Number(raw.replace(/,/g, ""));
  return Number.isFinite(base) ? Math.round(base * (unit ? (SCALE[unit.toLowerCase()] ?? 1) : 1)) : NaN;
}

export function parseInstruction(text: string): ParsedInstruction {
  const input = text.trim();

  const budget = /budget[^\d]*(\d[\d,]*)\s*credits?/i.exec(input) ?? /(\d[\d,]*)\s*credits?\s*(?:a|per|each)\s*month/i.exec(input);
  if (budget) {
    const credits = amountOf(budget[1]);
    if (credits > 0) return { ok: true, policy: { kind: "budget", credits } };
  }

  const draft = /draft[^.]*?(?:above|over|more than)\s*(\d{1,3})\s*%/i.exec(input);
  if (draft) {
    const minFit = Number(draft[1]);
    if (minFit >= 1 && minFit <= 100) return { ok: true, policy: { kind: "draft", minFit } };
  }

  const alert = /(?:alert|tell|notify|warn)\s+me\s+(?:about|of|when there (?:is|are))\s+(.+?)(?:\s+(?:under|below|less than|up to)\s*(?:br|birr|etb)?\s*([\d,.]+)\s*(million|thousand|m|k)?)?\s*\.?$/i.exec(input);
  if (alert) {
    const what = alert[1].trim().replace(/\s+/g, " ");
    if (what.length >= 3) return { ok: true, policy: { kind: "alert", what, maxBirr: alert[2] ? amountOf(alert[2], alert[3]) : null } };
  }

  return { ok: false };
}
