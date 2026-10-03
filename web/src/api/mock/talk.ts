/*
 * Scripted conversations for the prototype (Talk). Each topic is a small state
 * machine: the agent asks, the user answers by voice or text, the agent reads
 * the value back, and only then does it enter the sheet. Numbers come from
 * lib/calc; the agent never states a result it did not compute. Where there is
 * no verified source (legal forms, import requirements) it says so.
 */

import { grossMargin } from "@/lib/calc";
import { parseCount } from "@/components/onboarding/state";

import type { CalcResultDto, Conversation, ConversationEvent, InboxItem, Msg, Pending, Sheet, SheetIdea, TalkTopic } from "../contract";
import type { ConvRecord } from "./db";

export interface TalkEnv {
  credits: () => number;
  debit: (credits: number) => void;
  addInbox: (item: InboxItem) => void;
  /** Called when an idea version is approved; returns the version number saved. */
  saveIdea: () => number;
  saveMarket: (market: string, credits: number) => void;
}

const STARTERS: TalkTopic[] = ["numbers", "idea", "setup", "entry"];

const INTENTS: [RegExp, TalkTopic][] = [
  [/margin|profit|price|cost|ትርፍ|ወጪ|ዋጋ|bu'aa|baasii|gatii/i, "numbers"],
  [/idea|ሀሳብ|yaada/i, "idea"],
  [/plc|sole|legal|regist|licen|ፈቃድ|ሕግ|ምዝገባ|seera|galmee|bifa/i, "setup"],
  [/export|market|kenya|ገበያ|ኬንያ|gabaa|alergii|keeniyaa/i, "entry"],
];

function routeIntent(text: string): TalkTopic | null {
  return INTENTS.find(([pattern]) => pattern.test(text))?.[1] ?? null;
}

function parseNumber(text: string): number | null {
  const cleaned = text.replace(/,/g, "");
  const match = cleaned.match(/\d+(?:\.\d+)?/);
  if (match) return Number(match[0]);
  return parseCount(text) ?? null;
}

const say = (c: Conversation, msg: Msg) => c.turns.push({ id: `t${c.turns.length}`, role: "agent", msg });
const stage = (c: Conversation, msg: Msg) => c.turns.push({ id: `t${c.turns.length}`, role: "stage", msg });

function ask(rec: ConvRecord, step: string, field: string, key: string, withWhy = true) {
  rec.internal.step = step;
  say(rec.conv, { id: key });
  const pending: Pending = {
    kind: "ask",
    prompt: { id: key },
    why: withWhy ? { id: `${key}.why` } : undefined,
    sample: { id: `${key}.sample` },
    field,
  };
  rec.conv.pending = pending;
}

function choice(rec: ConvRecord, step: string, options: { id: string; label: Msg; href?: string }[]) {
  rec.internal.step = step;
  rec.conv.pending = { kind: "choice", options };
}

const starters = () => [
  ...STARTERS.map((t) => ({ id: t, label: { id: `talk.starter.${t}` } })),
  { id: "human", label: { id: "talk.starter.human" } },
];

export function newConversation(id: string, workspaceId: string, topic: TalkTopic): ConvRecord {
  const rec: ConvRecord = {
    conv: { id, workspaceId, topic: "general", turns: [], pending: null, sheet: null, sheetVersion: 0, canUndo: false },
    internal: { step: "start", data: {} },
    history: [],
  };
  if (topic === "general") {
    say(rec.conv, { id: "talk.general.greet" });
    choice(rec, "general", starters());
  } else {
    startTopic(rec, topic, false);
  }
  return rec;
}

function setSheet(rec: ConvRecord, sheet: Sheet) {
  rec.conv.sheet = sheet;
  rec.conv.sheetVersion += 1;
}

function startTopic(rec: ConvRecord, topic: TalkTopic, announce = true) {
  rec.conv.topic = topic;
  rec.internal.data = {};
  if (announce && topic !== "general") say(rec.conv, { id: "talk.route", vars: { skill: `@talk.skill.${topic}` } });
  if (topic === "numbers") ask(rec, "price", "price", "talk.num.priceQ");
  if (topic === "idea") ask(rec, "idea", "idea", "talk.idea.q");
  if (topic === "setup") ask(rec, "owners", "owners", "talk.setup.intro", false);
  if (topic === "entry") ask(rec, "market", "market", "talk.entry.q");
}

function marginSheet(rec: ConvRecord) {
  const d = rec.internal.data as { price: number; cost: number; whatIfPrice?: number };
  const base = toDto(grossMargin(d.price, d.cost));
  const whatIf = d.whatIfPrice ? { price: d.whatIfPrice, result: toDto(grossMargin(d.whatIfPrice, d.cost)) } : undefined;
  setSheet(rec, { kind: "margin", inputs: { price: d.price, cost: d.cost }, base, whatIf });
}

const toDto = (r: ReturnType<typeof grossMargin>): CalcResultDto => ({ value: r.value, unit: r.unit, steps: r.steps, warnings: r.warnings });

function ideaSheet(rec: ConvRecord, approved: boolean, version: number): SheetIdea {
  const d = rec.internal.data as Record<string, string | undefined>;
  return {
    kind: "idea",
    version,
    approved,
    fields: [
      { key: "oneLiner", value: d.idea ?? null, status: d.idea ? "unverified" : "missing" },
      { key: "customer", value: d.customer ?? null, status: d.customer ? "unverified" : "missing" },
      { key: "problem", value: d.problem ?? null, status: d.problem ? "unverified" : "missing" },
      { key: "solution", value: d.solution ?? null, status: d.solution ? "unverified" : "missing" },
      { key: "alternatives", value: null, status: "missing" },
    ],
  };
}

function snapshot(rec: ConvRecord) {
  rec.history.push({ conv: structuredClone(rec.conv), internal: structuredClone(rec.internal) });
}

function readback(rec: ConvRecord, next: string, field: string, text: Msg | string) {
  rec.internal.step = next;
  rec.conv.pending = { kind: "readback", text, field };
}

/** Applies one user event to a conversation. */
export function handleEvent(rec: ConvRecord, event: ConversationEvent, env: TalkEnv): void {
  const c = rec.conv;
  const d = rec.internal.data as Record<string, unknown>;

  if (event.type === "undo") {
    const previous = rec.history.pop();
    if (previous) {
      rec.conv = previous.conv;
      rec.internal = previous.internal;
      say(rec.conv, { id: "talk.undone" });
    }
    rec.conv.canUndo = rec.history.length > 0;
    return;
  }

  const wasCost = rec.conv.pending?.kind === "cost";
  if (!wasCost) snapshot(rec);

  // ---- free text and choices ------------------------------------------------
  if (event.type === "text") {
    c.turns.push({ id: `t${c.turns.length}`, role: "user", text: event.text, via: event.via });
  }

  const step = rec.internal.step;

  if (step === "general" || (c.topic === "general" && event.type === "text")) {
    if (event.type === "choose") {
      if (event.id === "human") {
        say(c, { id: "talk.human" });
        c.pending = null;
      } else startTopic(rec, event.id as TalkTopic);
    } else if (event.type === "text") {
      const topic = routeIntent(event.text);
      if (topic) startTopic(rec, topic);
      else {
        say(c, { id: "talk.idk" });
        choice(rec, "general", starters());
      }
    }
    finish(rec);
    return;
  }

  // ---- read-back answers ------------------------------------------------------
  if (c.pending?.kind === "readback") {
    const field = c.pending.field;
    if (event.type === "fix") {
      const prompt = askKeyFor(rec, field);
      ask(rec, stepForField(field), field, prompt.key, prompt.why);
    } else if (event.type === "confirm") {
      confirmField(rec, field, env);
    }
    finish(rec);
    return;
  }

  // ---- answers to questions ---------------------------------------------------
  if (c.pending?.kind === "ask" && event.type === "text") {
    const field = c.pending.field;
    const isNumeric = field === "price" || field === "cost" || field === "whatIf";
    if (isNumeric) {
      const n = parseNumber(event.text);
      if (n == null || n <= 0) {
        say(c, { id: "talk.notANumber" });
        const prompt = askKeyFor(rec, field);
        c.pending = { kind: "ask", prompt: { id: prompt.key }, why: prompt.why ? { id: `${prompt.key}.why` } : undefined, sample: { id: `${prompt.key}.sample` }, field };
        finish(rec);
        return;
      }
      d[`pending_${field}`] = n;
      readback(rec, rec.internal.step, field, { id: "talk.num.rb", vars: { n } });
    } else {
      d[`pending_${field}`] = event.text;
      readback(rec, rec.internal.step, field, event.text);
    }
    finish(rec);
    return;
  }

  // ---- choices inside a topic ------------------------------------------------
  if (c.pending?.kind === "choice" && event.type === "choose") {
    chooseInTopic(rec, event.id, env);
    finish(rec);
    return;
  }

  // ---- paid action -----------------------------------------------------------
  if (c.pending?.kind === "cost") {
    const market = String(d.market ?? "");
    if (event.type === "costCancel") {
      say(c, { id: "talk.entry.cancelled" });
      c.pending = null;
    } else if (event.type === "costConfirm") {
      const credits = 21;
      env.debit(credits);
      stage(c, { id: "talk.stage.entry1", vars: { market } });
      stage(c, { id: "talk.stage.entry2" });
      setSheet(rec, {
        kind: "entry",
        market,
        rows: [
          { key: "entry.mode", value: { id: "entry.mode.v" }, status: "unverified" },
          { key: "entry.attr", value: { id: "entry.attr.v", vars: { n: 64 } }, status: "established" },
          { key: "entry.req", value: { id: "entry.req.v" }, status: "missing" },
          { key: "entry.cost", value: { id: "entry.cost.v", vars: { cost: "1,240,000", m: 14 } }, status: "unverified" },
        ],
        competitors: [
          { name: "Global player A (demo)", reach: "global", source: "example.org · retrieved 30 Sep 2026" },
          { name: "Local maker B (demo)", reach: "local", source: "user said" },
        ],
      });
      say(c, { id: "talk.entry.result", vars: { market, credits } });
      env.saveMarket(market, credits);
      c.pending = null;
      rec.history = []; // a charged action cannot be undone
    }
    finish(rec);
  }
}

function finish(rec: ConvRecord) {
  rec.conv.canUndo = rec.history.length > 0;
}

function stepForField(field: string): string {
  return field === "whatIf" ? "whatIf" : field;
}

function askKeyFor(rec: ConvRecord, field: string): { key: string; why: boolean } {
  const map: Record<string, [string, boolean]> = {
    price: ["talk.num.priceQ", true],
    cost: ["talk.num.costQ", true],
    whatIf: ["talk.num.whatifQ", false],
    idea: ["talk.idea.q", true],
    customer: ["talk.idea.customerQ", false],
    problem: ["talk.idea.problemQ", false],
    solution: ["talk.idea.addQ", false],
    owners: ["talk.setup.intro", false],
    market: ["talk.entry.q", true],
  };
  void rec;
  const [key, why] = map[field] ?? ["talk.idk", false];
  return { key, why };
}

function confirmField(rec: ConvRecord, field: string, env: TalkEnv) {
  const c = rec.conv;
  const d = rec.internal.data as Record<string, unknown>;
  const value = d[`pending_${field}`];
  d[field === "whatIf" ? "whatIfPrice" : field] = value;

  if (field === "price") return ask(rec, "cost", "cost", "talk.num.costQ");
  if (field === "cost") {
    stage(c, { id: "talk.stage.margin" });
    marginSheet(rec);
    const base = (c.sheet as { base: CalcResultDto }).base;
    say(c, { id: "talk.num.result", vars: { pct: base.value } });
    say(c, { id: "talk.num.next" });
    return choice(rec, "numbersNext", [
      { id: "whatif", label: { id: "talk.num.whatif" } },
      { id: "statement", label: { id: "talk.num.statement" }, href: "money/import" },
    ]);
  }
  if (field === "whatIf") {
    marginSheet(rec);
    const sheet = c.sheet as { base: CalcResultDto; whatIf?: { price: number; result: CalcResultDto } };
    say(c, { id: "talk.num.whatifResult", vars: { price: sheet.whatIf?.price ?? 0, pct: sheet.whatIf?.result.value ?? 0, base: sheet.base.value } });
    return choice(rec, "numbersNext", [{ id: "statement", label: { id: "talk.num.statement" }, href: "money/import" }]);
  }
  if (field === "idea") return ask(rec, "customer", "customer", "talk.idea.customerQ", false);
  if (field === "customer") return ask(rec, "problem", "problem", "talk.idea.problemQ", false);
  if (field === "problem" || field === "solution") {
    stage(c, { id: "talk.stage.idea" });
    setSheet(rec, ideaSheet(rec, false, (d.version as number) ?? 1));
    say(c, { id: field === "solution" ? "talk.idea.updated" : "talk.idea.result" });
    if (field === "solution") return choice(rec, "ideaNext", [{ id: "approve", label: { id: "talk.idea.approve" } }]);
    return choice(rec, "ideaNext", [
      { id: "approve", label: { id: "talk.idea.approve" } },
      { id: "add", label: { id: "talk.idea.add" } },
    ]);
  }
  if (field === "owners") {
    d.owners = value;
    say(c, { id: "talk.setup.noSource" });
    say(c, { id: "talk.setup.can" });
    setSheet(rec, { kind: "advisor", owners: String(value), questions: [1, 2, 3, 4].map((n) => ({ id: `sheet.advisor.q${n}` })) });
    return choice(rec, "setupNext", [
      { id: "advisor", label: { id: "talk.setup.advisor" } },
    ]);
  }
  if (field === "market") {
    d.market = value;
    const market = String(value);
    c.pending = {
      kind: "cost",
      estimate: { action: { id: "talk.entry.cost", vars: { market } }, creditsMin: 18, creditsMax: 24, balanceAfter: env.credits() - 24, capRemaining: 300 },
    };
    rec.internal.step = "cost";
  }
}

function chooseInTopic(rec: ConvRecord, id: string, env: TalkEnv) {
  const c = rec.conv;
  const d = rec.internal.data as Record<string, unknown>;
  if (rec.internal.step === "numbersNext" && id === "whatif") return ask(rec, "whatIf", "whatIf", "talk.num.whatifQ", false);
  if (rec.internal.step === "ideaNext" && id === "add") return ask(rec, "solution", "solution", "talk.idea.addQ", false);
  if (rec.internal.step === "ideaNext" && id === "approve") {
    const version = env.saveIdea();
    d.version = version;
    setSheet(rec, ideaSheet(rec, true, version));
    say(c, { id: "talk.idea.saved", vars: { n: version } });
    c.pending = null;
    return;
  }
  if (rec.internal.step === "setupNext" && id === "advisor") {
    env.addInbox({
      id: `i-advisor-${Date.now()}`,
      type: "approval",
      kind: "advisor",
      title: { id: "inbox.advisor.title" },
      why: { id: "inbox.advisor.why" },
      evidence: [{ label: `Number of owners: ${d.owners}`, status: "unverified" }],
      undoMinutes: 60,
      status: "pending",
    });
    say(c, { id: "talk.setup.advisorSent" });
    c.pending = null;
  }
}
