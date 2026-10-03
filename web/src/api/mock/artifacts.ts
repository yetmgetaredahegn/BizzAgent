/*
 * Artifact details for the demo workspaces. Every business, person, competitor
 * and document here is fictional and marked as demo data. Numbers shown to
 * users are computed with lib/calc; research and legal rows carry a citation or
 * say that no verified answer exists (docs/design/ux-spec.md §7).
 */

import { breakEven, cashFlow, grossMargin, markup, marketSize, sumCosts, weightedScore, type CalcResult } from "@/lib/calc";
import type { FieldStatus } from "@/lib/types";

import type { ArtifactDetail, ArtifactSummary, CalcResultDto, ChecklistItem, Citation, FieldRow, Msg } from "../contract";
import { daysFromToday } from "./clock";
import type { WsSeed } from "./seed/workspaces";

const m = (id: string, vars?: Msg["vars"]): Msg => ({ id, vars });
const dto = (r: CalcResult): CalcResultDto => ({ value: r.value, unit: r.unit, steps: r.steps, warnings: r.warnings });

const DEMO = (title: string, origin: string): Citation => ({ title, origin, retrieved: daysFromToday(-3), demo: true, verified: false });
const NO_CITATION = null;

function item(id: string, text: string, status: FieldStatus = "unverified", citation: Citation | null = NO_CITATION, done = false): ChecklistItem {
  return { id, text: m(text), done, status, citation };
}

function profile(ws: WsSeed): FieldRow[] {
  const { flags, profile: p } = ws;
  const rows: FieldRow[] = [
    { key: m("pf.business"), value: ws.name, status: flags.licencePhoto ? "established" : "unverified", source: m(flags.licencePhoto ? "src.licence" : "src.said") },
    { key: m("pf.town"), value: p.town, status: flags.licencePhoto ? "established" : "unverified", source: m(flags.licencePhoto ? "src.licence" : "src.said") },
    { key: m("pf.sector"), value: p.sector, status: "unverified", source: m("src.said") },
  ];
  if (p.staff != null) rows.push({ key: m("pf.staff"), value: p.women ? m("pf.staffWomen", { n: p.staff, w: p.women }) : String(p.staff), status: flags.ledgerBacked ? "established" : "unverified", source: m(flags.ledgerBacked ? "src.ledger" : "src.said") });
  if (p.years != null) rows.push({ key: m("pf.years"), value: String(p.years), status: "unverified", source: m("src.said") });
  rows.push({
    key: m("pf.legalForm"),
    value: ws.legalForm ? m(`ob.form.${ws.legalForm}`) : m("pf.notChosen"),
    status: ws.legalForm ? (flags.legalFormChosen ? "established" : "unverified") : "missing",
    source: ws.legalForm ? m(flags.legalFormChosen ? "src.licence" : "src.said") : undefined,
  });
  rows.push({ key: m("pf.licence"), value: flags.licencePhoto ? m("pf.licenceRead") : m("pf.licenceNone"), status: flags.licencePhoto ? "established" : "missing" });
  if (ws.id === "almaz-spices") {
    rows.push({ key: m("pf.machinery"), value: m("pf.machineryNone"), status: "missing" });
    rows.push({ key: m("pf.owners"), value: "Almaz 60% · Dawit 50%", status: "contradictory", source: m("src.ownersConflict") });
  }
  return rows;
}

type ArtifactBaseKeys = { kind: unknown; id: unknown; title: unknown; version: unknown; updatedAt: unknown; completeness: unknown; stamps: unknown; producedBy: unknown };
type Body<K extends ArtifactDetail["kind"]> = Omit<Extract<ArtifactDetail, { kind: K }>, keyof ArtifactBaseKeys>;

function financeBody(ws: WsSeed): Body<"finance"> {
  const ledger = ws.flags.ledgerBacked;
  const src = m(ledger ? "src.ledger" : "src.said");
  const status: FieldStatus = ledger ? "established" : "unverified";
  if (ws.id === "meron-garments") {
    const price = 380;
    const cost = 262;
    const months = [
      { inflow: 612_000, outflow: 548_000 },
      { inflow: 575_000, outflow: 560_000 },
      { inflow: 640_000, outflow: 571_000 },
      { inflow: 598_000, outflow: 582_000 },
      { inflow: 655_000, outflow: 590_000 },
      { inflow: 690_000, outflow: 604_000 },
    ];
    const cf = cashFlow(420_000, months);
    const names = ["Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit"];
    return {
      inputs: [
        { label: m("fin.price"), value: price, unit: "birr", status, source: src },
        { label: m("fin.cost"), value: cost, unit: "birr", status, source: src },
        { label: m("fin.fixed"), value: 95_000, unit: "birr", status, source: src },
        { label: m("fin.opening"), value: 420_000, unit: "birr", status, source: src },
      ],
      results: [
        { id: "margin", label: m("fin.r.margin"), calc: dto(grossMargin(price, cost)) },
        { id: "breakEven", label: m("fin.r.breakEven"), calc: dto(breakEven(95_000, price, cost)) },
        { id: "cash", label: m("fin.r.cash"), calc: dto(cf) },
      ],
      whatIf: { price, cost },
      cashFlow: months.map((mo, i) => ({ month: names[i], inflow: mo.inflow, outflow: mo.outflow, balance: cf.balances[i] })),
    };
  }
  if (ws.id === "abel-studio") {
    const price = 45_000;
    const cost = 28_000;
    return {
      inputs: [
        { label: m("fin.projectPrice"), value: price, unit: "birr", status, source: src },
        { label: m("fin.projectCost"), value: cost, unit: "birr", status, source: src },
      ],
      results: [
        { id: "margin", label: m("fin.r.margin"), calc: dto(grossMargin(price, cost)) },
        { id: "markup", label: m("fin.r.markup"), calc: dto(markup(price, cost)) },
      ],
      whatIf: { price, cost },
    };
  }
  const price = 150;
  const cost = 102;
  return {
    inputs: [
      { label: m("fin.price"), value: price, unit: "birr", status: "unverified", source: m("src.said") },
      { label: m("fin.cost"), value: cost, unit: "birr", status: "unverified", source: m("src.said") },
    ],
    results: [
      { id: "margin", label: m("fin.r.margin"), calc: dto(grossMargin(price, cost)) },
      { id: "markup", label: m("fin.r.markup"), calc: dto(markup(price, cost)) },
    ],
    whatIf: { price, cost },
  };
}

function ideaBody(ws: WsSeed, version: number): Body<"idea"> {
  const kuri = ws.id === "kuri-team";
  const v1 = kuri
    ? {
        oneLiner: "Food delivery in Adama.",
        customer: "People who order lunch.",
        problem: "Lunch takes long to get.",
        solution: "A delivery app.",
        alternatives: "Walking to the restaurant.",
      }
    : {
        oneLiner: "Maths help for students.",
        customer: "Students.",
        problem: "Maths is hard.",
        solution: "Tutoring by voice.",
        alternatives: "Private tutors.",
      };
  const v2 = kuri
    ? {
        oneLiner: "Lunch from small Adama restaurants to office workers in 30 minutes, ordered by voice or text.",
        customer: "Office workers in central Adama who eat lunch at their desk.",
        problem: "Walking to a restaurant and queuing takes 40 minutes of a one-hour break.",
        solution: "Riders collect orders from partner restaurants; customers order in Amharic or Afaan Oromo.",
        alternatives: "Walking to the restaurant, or asking a colleague to bring food.",
      }
    : {
        oneLiner: "Evening maths practice by voice for grade 9 students, in Amharic.",
        customer: "Grade 9 students whose parents cannot afford a private tutor.",
        problem: "Students fall behind in maths and have nobody to ask in the evening.",
        solution: "A voice tutor that explains one problem at a time and checks the answer.",
        alternatives: "Private tutors, school clubs, and video lessons that need data.",
      };
  const v3 = { ...v2, oneLiner: "Lunch from Adama restaurants to office workers in 30 minutes, ordered by voice or text, paid by mobile money." };
  const all = [v1, v2, v3].slice(0, version);
  return { versions: all.map((fields, i) => ({ n: i + 1, approved: i + 1 < version || (kuri && i + 1 === version), fields })) };
}

function legalBody(): Body<"legal"> {
  return {
    form: "plc",
    reasons: [m("lg.reason.owners", { n: 3 }), m("lg.reason.investor"), m("lg.reason.risk")],
    steps: [
      item("l1", "lg.step.memorandum", "unverified", DEMO("Registration overview (draft entry)", "knowledge · et.registration.overview"), true),
      item("l2", "lg.step.name"),
      item("l3", "lg.step.chamber"),
      item("l4", "lg.step.licence"),
      item("l5", "lg.step.tin"),
      item("l6", "lg.step.shareholders"),
    ],
  };
}

function launchBody(): Body<"launch"> {
  return {
    legal: [item("a1", "ln.legal.prereg"), item("a2", "ln.legal.payments"), item("a3", "ln.legal.privacy")],
    technical: [
      item("t1", "ln.tech.domain", "established", null, true),
      item("t2", "ln.tech.hosting", "unverified", null, true),
      item("t3", "ln.tech.privacyPage"),
      item("t4", "ln.tech.terms"),
      item("t5", "ln.tech.payments"),
      item("t6", "ln.tech.analytics"),
      item("t7", "ln.tech.stores"),
    ],
  };
}

function validationBody(): Body<"validation"> {
  return {
    assumptions: [
      { id: "s1", text: "Office workers will pay Br 25 extra for delivery.", impact: 5, uncertainty: 4, confidence: "assumed", experiment: "Ask 10 office workers to pre-order a lunch for Br 25 extra." },
      { id: "s2", text: "Five restaurants will prepare orders on time.", impact: 4, uncertainty: 3, confidence: "assumed", experiment: "Run one lunch hour with two restaurants and time every order." },
      { id: "s3", text: "A rider can make 6 deliveries in a lunch hour.", impact: 4, uncertainty: 2, confidence: "tested" },
      { id: "s4", text: "Customers are happy to order in Afaan Oromo or Amharic.", impact: 3, uncertainty: 2, confidence: "tested" },
      { id: "s5", text: "Mobile-money payment is trusted by the restaurants.", impact: 3, uncertainty: 4, confidence: "assumed" },
    ],
    interviews: [
      { id: "i1", who: "Office worker, bank", learned: "Would order twice a week if it arrives in 30 minutes." },
      { id: "i2", who: "Restaurant owner", learned: "Worried about cash handling; prefers a daily payout." },
      { id: "i3", who: "Office worker, school", learned: "Price matters more than speed." },
    ],
  };
}

function marketBody(ws: WsSeed): Body<"market"> {
  const kenya = ws.id === "meron-garments";
  const inputs = kenya
    ? [
        { label: m("mk.buyers.kenya"), value: 40_000, unit: "count" as const },
        { label: m("mk.share"), value: 5, unit: "percent" as const },
        { label: m("mk.price.kenya"), value: 900, unit: "birr" as const },
      ]
    : [
        { label: m("mk.buyers.pay"), value: 12_000, unit: "count" as const },
        { label: m("mk.share"), value: 8, unit: "percent" as const },
        { label: m("mk.price.pay"), value: 6_500, unit: "birr" as const },
      ];
  return {
    market: kenya ? "Kenya school uniforms" : "Mobile-payments tooling",
    sizing: dto(marketSize(inputs[0].value, inputs[1].value, inputs[2].value)),
    sizingInputs: inputs,
    competitors: kenya
      ? [
          { name: "Northfield Uniforms (demo)", reach: "global", note: "Large exporter; sells in bulk to school chains.", citation: DEMO("Demo listing: Northfield Uniforms", "demo.example · listing-1") },
          { name: "Coastline Textile Group (demo)", reach: "global", note: "Regional supplier with its own retail outlets.", citation: DEMO("Demo listing: Coastline Textile", "demo.example · listing-2") },
          { name: "Nairobi Stitch Co. (demo)", reach: "local", note: "Local tailor cooperative; strong with small schools.", citation: DEMO("Demo listing: Nairobi Stitch Co.", "demo.example · listing-3") },
          { name: "Rift Valley Uniforms (demo)", reach: "local", note: "Family-run maker selling by order.", citation: DEMO("Demo listing: Rift Valley Uniforms", "demo.example · listing-4") },
        ]
      : [
          { name: "GlobalPay Kit (demo)", reach: "global", note: "Payments SDK with English documentation only.", citation: DEMO("Demo listing: GlobalPay Kit", "demo.example · listing-5") },
          { name: "SwiftCheckout (demo)", reach: "global", note: "Card-focused; no local mobile-money integration.", citation: DEMO("Demo listing: SwiftCheckout", "demo.example · listing-6") },
          { name: "Habesha Pay Tools (demo)", reach: "local", note: "Local integration; limited developer support.", citation: DEMO("Demo listing: Habesha Pay Tools", "demo.example · listing-7") },
        ],
    gaps: [
      { dimension: m("mk.gap.language"), note: kenya ? "Local suppliers quote in English and Swahili." : "Global kits document only in English." },
      { dimension: m("mk.gap.payments"), note: kenya ? "Small schools pay by mobile money." : "Local mobile money is not covered by global kits." },
      { dimension: m("mk.gap.price"), note: kenya ? "Global suppliers need large minimum orders." : "Global kits price in dollars." },
      { dimension: m("mk.gap.distribution"), note: kenya ? "Few suppliers reach schools outside Nairobi." : "Support hours do not match local business hours." },
    ],
  };
}

function entryBody(): Body<"entry"> {
  const rubric = [
    { criterion: m("en.demand"), weight: 25, score: 4, status: "unverified" as const },
    { criterion: m("en.competition"), weight: 20, score: 3, status: "unverified" as const },
    { criterion: m("en.logistics"), weight: 20, score: 3, status: "unverified" as const },
    { criterion: m("en.regulation"), weight: 15, score: 2, status: "missing" as const },
    { criterion: m("en.price"), weight: 10, score: 4, status: "unverified" as const },
    { criterion: m("en.fit"), weight: 10, score: 4, status: "unverified" as const },
  ];
  const costs = sumCosts([
    { label: "en.cost.samples", amount: 38_000 },
    { label: "en.cost.freight", amount: 54_000 },
    { label: "en.cost.agent", amount: 60_000 },
    { label: "en.cost.travel", amount: 48_000 },
  ]);
  return {
    market: "Kenya",
    rubric,
    attractiveness: dto(weightedScore(rubric.map((r) => ({ label: r.criterion.id, weight: r.weight, score: r.score })))),
    entryMode: { id: "agent", reasons: [m("en.mode.r1"), m("en.mode.r2"), m("en.mode.r3")] },
    costToEnter: dto(costs),
    breakEven: dto(breakEven(costs.value, 380, 262)),
    requirements: [
      { text: m("en.req.permit"), citation: NO_CITATION },
      { text: m("en.req.standards"), citation: NO_CITATION },
      { text: m("en.req.origin"), citation: NO_CITATION },
    ],
  };
}

function acceleratorBody(): Body<"accelerator"> {
  return {
    programme: "Addis Launchpad (demo)",
    deadline: daysFromToday(19),
    questions: [
      {
        id: "q1",
        prompt: "What does your company do?",
        limit: 300,
        draft: "We build payment integrations for Ethiopian online shops, so a shop can accept mobile money and bank payments with one setup.",
        claims: [{ label: "Business profile", kind: "profile" }],
      },
      {
        id: "q2",
        prompt: "What traction do you have?",
        limit: 500,
        draft: "Two paying studio clients and a three-year track record as a one-member PLC. Revenue figures come from our ledger.",
        claims: [
          { label: "Pricing and cash flow", kind: "finance" },
          { label: "Business profile", kind: "profile" },
        ],
      },
      {
        id: "q3",
        prompt: "Who are your competitors and why will you win?",
        limit: 400,
        draft: "Global kits document only in English and skip local mobile money. We integrate local providers and support businesses in Amharic.",
        claims: [{ label: "Market report", kind: "market" }],
      },
      { id: "q4", prompt: "What will you do with the programme?", limit: 300, draft: "", claims: [] },
    ],
  };
}

function explainerBody(): Body<"explainer"> {
  return {
    document: "Factory lease agreement (fictional sample)",
    summary: m("ex.summary"),
    clauses: [
      { id: "c1", page: 1, quote: "The Lessee shall pay Br 48,000 on the first day of each month.", kind: "money", explanation: m("ex.c1"), redFlag: false },
      { id: "c2", page: 1, quote: "The lease begins on 1 Meskerem 2018 and runs for three years.", kind: "date", explanation: m("ex.c2"), redFlag: false, action: "calendar" },
      { id: "c3", page: 2, quote: "Unless either party gives 60 days written notice, this lease renews for a further year.", kind: "term", explanation: m("ex.c3"), redFlag: true, action: "calendar" },
      { id: "c4", page: 2, quote: "The Lessor may end this lease at any time with 15 days notice. The Lessee may not.", kind: "risk", explanation: m("ex.c4"), redFlag: true, action: "expert" },
      { id: "c5", page: 3, quote: "The Lessee shall repair all damage, however caused, at its own cost.", kind: "obligation", explanation: m("ex.c5"), redFlag: true, action: "expert" },
      { id: "c6", page: 3, quote: "The Lessee shall insure the machinery and give the Lessor a copy each year.", kind: "obligation", explanation: m("ex.c6"), redFlag: false, action: "task" },
    ],
  };
}

function hiringBody(): Body<"hiring"> {
  const rubric = [
    { criterion: m("hr.c.sewing"), weight: 40 },
    { criterion: m("hr.c.lead"), weight: 25 },
    { criterion: m("hr.c.quality"), weight: 20 },
    { criterion: m("hr.c.shifts"), weight: 15 },
  ];
  const mk = (id: string, name: string, scores: number[], quotes: string[]) => ({
    id,
    name,
    criteria: rubric.map((r, i) => ({ ...r, score: scores[i], quote: quotes[i] })),
  });
  return {
    role: "Production supervisor",
    jd: {
      en: "Lead a sewing line of 12 people. Plan the day's output, check quality before packing, and report weekly to the factory manager. Full time, day shift.",
      am: "የ12 ሰዎችን የስፌት መስመር ይመራሉ። የዕለቱን ምርት ያቅዳሉ፣ ከማሸጋቸው በፊት ጥራትን ይፈትሻሉ፣ በየሳምንቱ ለፋብሪካ ሥራ አስኪያጁ ሪፖርት ያደርጋሉ። የሙሉ ጊዜ፣ የቀን ፈረቃ።",
      om: "Sarara hodhaa namoota 12 geggeessa. Oomisha guyyaa karoorfata, osoo hin maxxanfatin dura qulqullina ilaala, torbee torbeedhaan bulchaa warshaatiif gabaasa. Yeroo guutuu, sa'aatii guyyaa.",
    },
    candidates: [
      mk("k1", "Hanna", [5, 4, 4, 5], ["Led a line of 15 for four years.", "Trained six new sewers.", "Checked every batch against the sample.", "Can work mornings."]),
      mk("k2", "Tesfaye", [4, 2, 4, 5], ["Ten years on the sewing floor.", "No team lead role yet.", "Spot-checks finished garments.", "Can work mornings."]),
      mk("k3", "Birtukan", [3, 4, 3, 3], ["Three years in a small tailor shop.", "Managed a team of five.", "Checks stitching by eye.", "Prefers afternoons."]),
    ],
  };
}

function growthBody(): Body<"growth"> {
  const margin = grossMargin(380, 262).value;
  return {
    objectives: [
      {
        id: "o1",
        title: m("gr.o1"),
        kpis: [
          { label: m("gr.k.margin"), value: margin, unit: "percent", basis: "ledger" },
          { label: m("gr.k.revenue"), value: 690_000, unit: "birr", basis: "ledger" },
          { label: m("gr.k.exportShare"), value: 20, unit: "percent", basis: "target" },
        ],
        initiatives: [m("gr.i.kenya"), m("gr.i.trade")],
      },
      {
        id: "o2",
        title: m("gr.o2"),
        kpis: [
          { label: m("gr.k.staff"), value: 25, unit: "count", basis: "ledger" },
          { label: m("gr.k.output"), value: 30, unit: "percent", basis: "target" },
        ],
        initiatives: [m("gr.i.supervisor"), m("gr.i.training")],
      },
    ],
  };
}

/** Builds the detail view of an artifact from its summary; unknown combinations fall back to the profile. */
export function buildDetail(ws: WsSeed, summary: ArtifactSummary): ArtifactDetail {
  const base = {
    id: summary.id,
    title: summary.title,
    version: summary.version,
    updatedAt: summary.updatedAt,
    completeness: summary.completeness,
    stamps: summary.stamps,
    producedBy: summary.producedBy,
  };
  switch (summary.kind) {
    case "profile":
      return { ...base, kind: "profile", rows: profile(ws) };
    case "finance":
      return { ...base, kind: "finance", ...financeBody(ws) };
    case "idea":
      return { ...base, kind: "idea", ...ideaBody(ws, summary.version) };
    case "legal":
      return { ...base, kind: "legal", ...legalBody() };
    case "launch":
      return { ...base, kind: "launch", ...launchBody() };
    case "validation":
      return { ...base, kind: "validation", ...validationBody() };
    case "market":
      return { ...base, kind: "market", ...marketBody(ws) };
    case "entry":
      return { ...base, kind: "entry", ...entryBody() };
    case "accelerator":
      return { ...base, kind: "accelerator", ...acceleratorBody() };
    case "explainer":
      return { ...base, kind: "explainer", ...explainerBody() };
    case "hiring":
      return { ...base, kind: "hiring", ...hiringBody() };
    case "growth":
      return { ...base, kind: "growth", ...growthBody() };
    case "proposal":
      return {
        ...base,
        kind: "proposal",
        funder: ws.flags.funderName,
        call: summary.title,
        provisionalScore: null,
        gaps: summary.stamps.missing + summary.stamps.contradictory,
        submitted: false,
        href: `/w/${ws.id}/funding/${ws.id === "almaz-spices" ? "almaz" : ws.id}`,
      };
  }
}
