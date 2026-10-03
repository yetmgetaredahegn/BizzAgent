import {
  ArrowRight,
  Camera,
  Check,
  FileCheck,
  Inbox,
  Lock,
  MessageCircleQuestionMark,
  Mic,
  Route,
  Scale,
  ScrollText,
  Smartphone,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/site/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card, Container, Eyebrow, SectionHeading } from "@/components/ui/primitives";
import { ScoreBar } from "@/components/ui/score";
import { StatusBadge } from "@/components/ui/status-badge";
import { analyzePack } from "@/lib/analyze";
import { DECLARATIONS } from "@/lib/declarations";
import { REVIEW_BATCH, almaz, hiwot, nahom } from "@/lib/fixtures";
import { formatDate } from "@/lib/format";
import { GRID_VARIANTS } from "@/lib/grid";
import { rankBatch } from "@/lib/review";
import type { ApplicationPack, FieldStatus } from "@/lib/types";

// ---------------------------------------------------------------------------
// Problem
// ---------------------------------------------------------------------------

const STATS = [
  { value: "18", label: "sub-questions", detail: "Five years of sales and jobs by gender and age, a management table, an organogram, a machinery list." },
  { value: "15", label: "declarations", detail: "Legal wording in a language many applicants do not read." },
  { value: "100", label: "points, 9 criteria", detail: "A weighted grid, with variants the applicant cannot see." },
  { value: "3", label: "exclusion factors", detail: "Any one of them ends the application on the spot." },
];

export function ProblemStrip() {
  return (
    <section className="relative bg-ink-950 text-white">
      <Container className="py-20 lg:py-24">
        <Reveal className="max-w-3xl">
          <Eyebrow className="text-brand-300">The problem</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            The money exists. The paperwork does not fit the people it is meant for.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            A workshop owner with a feature phone cannot do this alone, so she stays out. At the
            other end, a reviewer scores the whole batch by hand.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 80} className="h-full">
              <div className="h-full bg-ink-950 p-6">
                <p className="font-display text-5xl font-medium text-saffron-300">{stat.value}</p>
                <p className="mt-2 font-semibold">{stat.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{stat.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// How it works
// ---------------------------------------------------------------------------

const STEPS = [
  {
    Icon: Mic,
    title: "Speak",
    text: "Tell the story in Amharic, Afaan Oromo or English. A voice note forwarded on WhatsApp is enough.",
    output: "Transcript with its language",
  },
  {
    Icon: Camera,
    title: "Snap",
    text: "Two phone photos: the paper licence and the workshop. What the licence shows becomes evidence.",
    output: "Licence facts marked established",
  },
  {
    Icon: MessageCircleQuestionMark,
    title: "Clarify",
    text: "BizzAgent asks only for what is missing, one short spoken question at a time, and explains why.",
    output: "Targeted follow-up questions",
  },
  {
    Icon: FileCheck,
    title: "Submit",
    text: "A pack for sections 1.1–2.6, an ImpactProtocol draft, a provisional score and a gap list.",
    output: "Submission-ready pack",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20">
      <Container className="py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="Four steps from a spoken story to structured records."
            lead="The applicant talks. BizzAgent does the form. The language model understands the story; plain rules do the arithmetic, the eligibility gate and the scoring."
          />
        </Reveal>
        <div className="relative mt-14">
          <div className="absolute top-9 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-brand-200 via-ink-200 to-saffron-200 lg:block" aria-hidden />
          <ol className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ Icon, title, text, output }, index) => (
              <li key={title} className="h-full">
                <Reveal delay={index * 90} className="h-full">
                  <Card className="flex h-full flex-col p-6">
                    <div className="flex items-center justify-between">
                      <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-ink-600 text-white shadow-[0_10px_24px_-12px_rgb(29_66_138/0.8)]">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className="font-display text-3xl text-line-strong">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold">{title}</h3>
                    <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{text}</p>
                    <p className="mt-5 flex items-center gap-1.5 border-t border-line pt-4 text-xs font-semibold text-brand-700">
                      <Check className="size-3.5" aria-hidden />
                      {output}
                    </p>
                  </Card>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Honesty
// ---------------------------------------------------------------------------

const STATUS_COPY: { status: FieldStatus; text: string }[] = [
  { status: "established", text: "Backed by a document or photo: the licence, a receipt, what the workshop shows." },
  { status: "unverified", text: "The applicant said it. Kept, scored provisionally, and queued for the site visit." },
  { status: "missing", text: "Nobody knows yet. Left empty, with what it needs and who can provide it." },
  { status: "contradictory", text: "Two pieces of evidence disagree. Both stay visible; a question is raised." },
];

export function Honesty() {
  const analysis = analyzePack(almaz);
  const rows = [
    "company_profile.company_name",
    "company_profile.number_of_years_in_operation",
    "company_overview.growth_indicators",
    "local_raw_material_percentage",
    "company_profile.email",
    "management.organogram",
  ].map((key) => analysis.fields[key]);
  const nahomContradiction = analyzePack(nahom).contradictions[0];

  return (
    <section id="honesty" className="scroll-mt-20 border-y border-line bg-surface">
      <Container className="grid gap-14 py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Evidence over guessing"
            title="Every field says where it came from, or that nobody knows yet."
            lead="The model interprets evidence. It never creates it. Nothing uncertain is quietly turned into a fact, and nothing missing is filled with a plausible guess."
          />
          <ul className="mt-8 space-y-4">
            {STATUS_COPY.map(({ status, text }) => (
              <li key={status} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                <StatusBadge status={status} className="w-fit sm:mt-0.5 sm:w-32 sm:justify-center" />
                <p className="text-[15px] leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line bg-paper px-5 py-3.5">
              <p className="text-sm font-semibold">Field ledger · Almaz Wolde Spice Mill</p>
              <Badge tone="brand">live from her pack</Badge>
            </div>
            <ul className="divide-y divide-line">
              {rows.map((row) => (
                <li key={row.field.key} className="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-1 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{row.field.label}</p>
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-muted">
                      {row.provenance?.evidence ?? row.provenance?.note ?? "Read from the licence photo."}
                    </p>
                  </div>
                  <StatusBadge status={row.status} size="xs" />
                </li>
              ))}
            </ul>
          </Card>
          {nahomContradiction && (
            <div className="mt-4 flex gap-3 rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-rose-600" aria-hidden />
              <div className="text-sm">
                <p className="font-semibold text-rose-800">Contradiction caught in Nahom&apos;s application</p>
                <p className="mt-1 leading-relaxed text-rose-900/80">{nahomContradiction.detail}</p>
                <p className="mt-1 leading-relaxed text-rose-900/80">
                  <span className="font-semibold">Site visit asks:</span> {nahomContradiction.question}
                </p>
              </div>
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Personas
// ---------------------------------------------------------------------------

const PERSONA_HELP: Record<string, string[]> = {
  almaz: [
    "Listens to the voice notes her son forwards, in Afaan Oromo",
    "Drafts an organogram from her team list for her to confirm",
    "Explains the declarations in Afaan Oromo and records that she understood",
  ],
  nahom: [
    "Flags his “about 40% a year” growth as unverified, not fact",
    "Routes him to the innovation grid and shows the standard score too",
    "Catches the licence date against “five years in operation”",
  ],
  hiwot: [
    "Explains each SDG in one plain line",
    "Turns her plan into dated milestones",
    "Flags that her sector is missing from the list instead of forcing one",
  ],
};

const AVATAR = {
  almaz: "from-saffron-400 to-saffron-600",
  nahom: "from-ink-400 to-ink-700",
  hiwot: "from-brand-400 to-brand-700",
} as Record<string, string>;

function PersonaCard({ pack, delay }: { pack: ApplicationPack; delay: number }) {
  const persona = pack.persona!;
  const analysis = analyzePack(pack);
  const firstName = persona.name.split(" ")[0];
  const blocking = analysis.gaps.filter((g) => g.priority === "blocking").length;
  return (
    <Reveal delay={delay} className="h-full">
      <Card className="flex h-full flex-col p-6">
        <div className="flex items-center gap-4">
          <span
            className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white ${AVATAR[pack.id]}`}
            aria-hidden
          >
            {persona.name.split(" ").map((p) => p[0]).join("")}
          </span>
          <div>
            <h3 className="text-lg font-bold">
              {persona.name}, {persona.age}
            </h3>
            <p className="text-sm text-muted">{persona.role}</p>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-ink-700">{persona.place}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-subtle">
          <Smartphone className="size-3.5" aria-hidden />
          {persona.device}
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{persona.story}</p>
        <p className="mt-5 text-xs font-bold tracking-wider text-brand-700 uppercase">What BizzAgent does</p>
        <ul className="mt-2 flex-1 space-y-2">
          {PERSONA_HELP[pack.id].map((line) => (
            <li key={line} className="flex gap-2 text-sm text-ink">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
        <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-paper p-3 text-center ring-1 ring-line">
          <div>
            <p className="text-lg font-bold tabular-nums">{Math.round(analysis.evaluation.total)}</p>
            <p className="text-[11px] text-subtle">provisional score</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">{blocking}</p>
            <p className="text-[11px] text-subtle">fields missing</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">{analysis.contradictions.length}</p>
            <p className="text-[11px] text-subtle">contradictions</p>
          </div>
        </div>
        <Link
          href={`/apply/${pack.id}/pack`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Open {firstName}&apos;s pack
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Card>
    </Reveal>
  );
}

export function Personas() {
  return (
    <section id="personas" className="scroll-mt-20">
      <Container className="py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Who it is for"
            title="Three applicants the current form leaves behind."
            lead="Each has a working demo pack you can open: the evidence, the gaps, the declarations, the provisional score."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {[almaz, nahom, hiwot].map((pack, index) => (
            <PersonaCard key={pack.id} pack={pack} delay={index * 90} />
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-subtle">All three are fictional, as in the challenge brief.</p>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Two paths
// ---------------------------------------------------------------------------

export function TwoPaths() {
  return (
    <section className="bg-surface">
      <Container className="py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Two ways in, one set of rules"
            title="Help the applicant. Help the reviewer. Connect both."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-800 p-8 text-white shadow-lift">
              <UserRound className="size-7 opacity-80" aria-hidden />
              <h3 className="mt-5 text-2xl font-bold">Applicant path</h3>
              <p className="mt-2 text-white/80">
                An intake agent between someone who talks and a system that takes structured records.
              </p>
              <ul className="mt-6 space-y-2.5 text-[15px]">
                {[
                  "Voice in Amharic, Afaan Oromo or English, plus two photos",
                  "Form sections 1.1–2.6 and an ImpactProtocol draft",
                  "Gap list: what is missing, what it needs, from whom",
                  "Three declarations explained, understanding recorded, never ticked",
                  "Provisional score and gaps before submitting",
                ].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <Check className="mt-1 size-4 shrink-0" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/apply" variant="light" className="mt-8">
                Start an application <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-ink-600 to-ink-950 p-8 text-white shadow-lift">
              <Inbox className="size-7 opacity-80" aria-hidden />
              <h3 className="mt-5 text-2xl font-bold">Reviewer path</h3>
              <p className="mt-2 text-white/80">
                Twelve applications in, a ranked shortlist out, with reasons a reviewer can defend.
              </p>
              <ul className="mt-6 space-y-2.5 text-[15px]">
                {[
                  "Routes each application to the right grid variant",
                  "Runs the eligibility gate and names any exclusion",
                  "Scores per criterion, with the reasoning written out",
                  "One paragraph of justification per company",
                  "Every self-contradiction and the site-visit questions",
                ].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <Check className="mt-1 size-4 shrink-0" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/review" variant="light" className="mt-8">
                Open the reviewer dashboard <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Declarations
// ---------------------------------------------------------------------------

export function DeclarationsSpotlight() {
  const declaration = DECLARATIONS[0];
  return (
    <section id="declarations" className="scroll-mt-20">
      <Container className="grid items-center gap-14 py-20 lg:grid-cols-2 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Declarations"
            title="We explain. You decide. We never tick."
            lead="Fifteen declarations stand between an applicant and the money. BizzAgent explains them in her language and records that she understood. The box stays empty until she ticks it herself."
          />
          <ul className="mt-8 space-y-3 text-[15px] text-muted">
            <li className="flex gap-3"><ScrollText className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />Plain-language explanation beside the official wording</li>
            <li className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />&ldquo;I understood&rdquo; is recorded with the language and time</li>
            <li className="flex gap-3"><Lock className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />No code path in BizzAgent ticks a declaration</li>
          </ul>
        </Reveal>
        <Reveal delay={120}>
          <Card className="relative p-6 sm:p-8" lang="om">
            <div className="flex items-center justify-between gap-3">
              <Badge tone="saffron">Afaan Oromoo</Badge>
              <span className="text-xs text-subtle" lang="en">1 of 3</span>
            </div>
            <h3 className="mt-4 text-xl font-bold">{declaration.title.om}</h3>
            <p className="mt-3 leading-relaxed text-muted">{declaration.plain.om}</p>
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
              <Check className="size-4" aria-hidden />
              Hubadheera
              <span className="ml-auto text-xs font-normal text-emerald-700/80" lang="en">recorded 10:42 · Afaan Oromoo</span>
            </div>
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-dashed border-line-strong p-4">
              <span className="mt-0.5 size-5 shrink-0 rounded-md border-2 border-line-strong bg-surface" aria-hidden />
              <div>
                <p className="font-semibold">Nan waliigala</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-subtle" lang="en">
                  <Lock className="size-3" aria-hidden /> Only Almaz can tick this box.
                </p>
              </div>
            </div>
          </Card>
        </Reveal>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Reviewer preview
// ---------------------------------------------------------------------------

export function ReviewerPreview() {
  const ranked = rankBatch(REVIEW_BATCH.map((pack) => ({ pack, source: "batch" as const })));
  const top = ranked.filter((r) => r.status === "shortlist");
  const excluded = ranked.filter((r) => r.status === "excluded").length;
  const contradictions = ranked.reduce((sum, r) => sum + r.analysis.contradictions.length, 0);
  const questions = ranked.reduce((sum, r) => sum + r.analysis.evaluation.siteVisitQuestions.length, 0);

  return (
    <section id="reviewers" className="scroll-mt-20 bg-ink-950 text-white">
      <Container className="grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:py-28">
        <Reveal>
          <Eyebrow className="text-brand-300">For reviewers</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            A ranking you can defend, not just a number.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            The same rules the applicant saw, applied to the whole batch: grid variant, eligibility
            gate, exclusions, per-criterion reasoning, and every place where an application
            contradicts itself.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-4">
            {[
              [String(ranked.length), "applications in"],
              [String(top.length), "on the shortlist"],
              [String(excluded), "excluded, reason named"],
              [String(contradictions), "contradictions caught"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-4xl text-saffron-300">{value}</dd>
                <dd className="mt-1 text-sm text-white/60">{label}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-white/50">{questions} site-visit questions drafted across the batch.</p>
          <ButtonLink href="/review" variant="light" className="mt-8">
            Open the reviewer dashboard <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </Reveal>

        <Reveal delay={120}>
          <div className="overflow-hidden rounded-2xl bg-white text-ink shadow-lift">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <p className="text-sm font-semibold">Shortlist · assessed {formatDate(ranked[0]?.analysis.evaluation.assessedAsOf)}</p>
              <Badge tone="navy"><Route className="size-3" aria-hidden /> grid routed per applicant</Badge>
            </div>
            <ol className="divide-y divide-line">
              {top.map(({ pack, analysis, rank }) => {
                const e = analysis.evaluation;
                return (
                  <li key={pack.id}>
                    <Link href={`/review/${pack.id}`} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-5 py-3 hover:bg-paper">
                      <span className="text-sm font-bold text-subtle tabular-nums">{rank}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{pack.data.applicant.company_profile.company_name}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <ScoreBar value={e.total} max={100} className="max-w-40" />
                          <span className="hidden text-xs text-subtle sm:inline">{GRID_VARIANTS[e.variant].name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {analysis.contradictions.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                            <TriangleAlert className="size-3.5" aria-hidden /> {analysis.contradictions.length}
                          </span>
                        )}
                        {e.eligibility === "pending" && <Badge tone="amber">verify</Badge>}
                        <span className="w-8 text-right text-base font-bold tabular-nums">{Math.round(e.total)}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Languages and phone
// ---------------------------------------------------------------------------

export function Languages() {
  return (
    <section id="languages" className="scroll-mt-20">
      <Container className="py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Built for the phone she already has"
            title="No app to install. No email needed. Her own language."
            lead="Almaz has a feature phone. Her son forwards her voice notes on WhatsApp. That is enough to start, and every question comes back as speech."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { word: "ሰላም", lang: "am", name: "Amharic", note: "Ge'ez script throughout the applicant screens" },
            { word: "Akkam", lang: "om", name: "Afaan Oromo", note: "Spoken answers transcribed and understood" },
            { word: "Hello", lang: "en", name: "English", note: "The pack is written for the funder in English" },
          ].map((item, index) => (
            <Reveal key={item.name} delay={index * 80}>
              <Card className="p-7 text-center">
                <p lang={item.lang} className="font-display text-5xl font-medium text-ink-700">{item.word}</p>
                <p className="mt-4 font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-muted">{item.note}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="pb-20 lg:pb-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-ink-700 px-6 py-14 text-center text-white shadow-lift sm:px-12">
            <div className="grid-texture absolute inset-0 opacity-20" aria-hidden />
            <div className="relative">
              <Scale className="mx-auto size-8 opacity-80" aria-hidden />
              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Complete, honest, and ready to defend.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                Start with a voice note and two photos, or open the reviewer dashboard with a batch of twelve.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <ButtonLink href="/apply" size="lg" variant="white">
                  <Mic className="size-5" aria-hidden /> Start an application
                </ButtonLink>
                <ButtonLink href="/review" size="lg" variant="light">
                  Reviewer dashboard <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
