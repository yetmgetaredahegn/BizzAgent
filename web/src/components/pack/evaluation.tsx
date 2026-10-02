import {
  CircleCheck,
  CircleQuestionMark,
  CircleX,
  ClipboardCheck,
  Route,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";

import { Badge, Callout, Card } from "@/components/ui/primitives";
import { ScoreBar, ScoreRing } from "@/components/ui/score";
import type { Contradiction } from "@/lib/contradictions";
import type { CheckResult, CriterionResult, CriterionState, Eligibility, Evaluation } from "@/lib/evaluate";
import { cn, formatDate } from "@/lib/format";
import { GRID_VARIANTS } from "@/lib/grid";

export const ELIGIBILITY_BADGE: Record<Eligibility, { label: string; tone: "green" | "amber" | "rose" }> = {
  eligible: { label: "Eligible", tone: "green" },
  pending: { label: "Eligibility pending", tone: "amber" },
  excluded: { label: "Excluded", tone: "rose" },
};

const STATE_BADGE: Record<CriterionState, { label: string; tone: "green" | "amber" | "slate" | "rose" }> = {
  scored: { label: "Scored", tone: "green" },
  provisional: { label: "Provisional", tone: "amber" },
  not_scored: { label: "Not scored", tone: "slate" },
  held: { label: "Held", tone: "rose" },
};

export function ScoreSummary({ evaluation, audience = "applicant" }: { evaluation: Evaluation; audience?: "applicant" | "reviewer" }) {
  const variant = GRID_VARIANTS[evaluation.variant];
  const other = GRID_VARIANTS[evaluation.otherVariant.id];
  const eligibility = ELIGIBILITY_BADGE[evaluation.eligibility];
  const ceiling = Math.round(evaluation.total + evaluation.unscoredPoints);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <Card className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center">
        <ScoreRing
          value={evaluation.total}
          size={148}
          label={audience === "applicant" ? "provisional" : "of 100"}
          tone={evaluation.eligibility === "excluded" ? "slate" : "brand"}
          className="shrink-0 text-[14px]"
        />
        <div className="min-w-0 text-center sm:text-left">
          <Badge tone={eligibility.tone}>{eligibility.label}</Badge>
          <p className="mt-3 text-sm leading-relaxed text-muted">{evaluation.eligibilityReason}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-left text-sm">
            <div className="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
              <dt className="text-xs text-amber-800">Provisional</dt>
              <dd className="text-lg font-bold text-amber-900 tabular-nums">{Math.round(evaluation.provisionalPoints)} pts</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <dt className="text-xs text-slate-600">Not scored</dt>
              <dd className="text-lg font-bold text-slate-700 tabular-nums">{evaluation.unscoredPoints} pts</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-subtle">
            Provisional points rest on the applicant&apos;s word.
            {evaluation.unscoredPoints > 0 && evaluation.eligibility !== "excluded" && <> Up to {ceiling} if the missing evidence arrives.</>}
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-subtle uppercase">
          <Route className="size-4 text-navy-600" aria-hidden /> Grid routing
        </div>
        <p className="mt-3 text-lg font-bold">{variant.name}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{evaluation.variantReason}</p>
        <div className="mt-5 space-y-3">
          {[
            { name: variant.name, total: evaluation.total, current: true },
            { name: other.name, total: evaluation.otherVariant.total, current: false },
          ].map((row) => (
            <div key={row.name}>
              <div className="flex items-center justify-between text-sm">
                <span className={cn(row.current ? "font-semibold text-ink" : "text-muted")}>
                  {row.name}
                  {row.current && <span className="ml-2 text-xs font-normal text-brand-700">applies</span>}
                </span>
                <span className="font-bold tabular-nums">{Math.round(row.total)}</span>
              </div>
              <ScoreBar value={row.total} max={100} tone={row.current ? "brand" : "slate"} className="mt-1.5" />
            </div>
          ))}
        </div>
        {!evaluation.variantConfirmed && (
          <p className="mt-4 flex gap-2 text-xs text-amber-800">
            <TriangleAlert className="size-3.5 shrink-0" aria-hidden /> A reviewer must confirm which grid applies.
          </p>
        )}
      </Card>
    </div>
  );
}

const OUTCOME_ICON = {
  pass: { Icon: CircleCheck, className: "text-emerald-600" },
  fail: { Icon: CircleX, className: "text-rose-600" },
  unknown: { Icon: CircleQuestionMark, className: "text-amber-600" },
};

function CheckList({ title, checks, exclusion }: { title: string; checks: CheckResult[]; exclusion?: boolean }) {
  const outcomeLabel = (check: CheckResult) =>
    exclusion
      ? check.outcome === "pass"
        ? "Not triggered"
        : check.outcome === "fail"
          ? "Triggered: application ends"
          : "Cannot be established yet"
      : check.outcome === "pass"
        ? "Passes"
        : check.outcome === "fail"
          ? "Fails"
          : "Cannot be established yet";

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line bg-paper/60 px-5 py-3">
        {exclusion ? <ShieldAlert className="size-4 text-rose-600" aria-hidden /> : <ClipboardCheck className="size-4 text-navy-600" aria-hidden />}
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <ul className="divide-y divide-line">
        {checks.map((check) => {
          const { Icon, className } = OUTCOME_ICON[check.outcome];
          return (
            <li key={check.id} className="flex gap-3 px-5 py-3.5">
              <Icon className={cn("mt-0.5 size-5 shrink-0", className)} aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{check.label}</p>
                <p className={cn("text-xs font-semibold", className)}>{outcomeLabel(check)}</p>
                <p className="mt-1 text-sm text-muted">{check.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function EligibilityPanel({ evaluation }: { evaluation: Evaluation }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CheckList title="Eligibility gate" checks={evaluation.gate} />
      <CheckList title="Exclusion factors" checks={evaluation.exclusions} exclusion />
    </div>
  );
}

function CriterionRow({ criterion }: { criterion: CriterionResult }) {
  const badge = STATE_BADGE[criterion.state];
  const tone =
    criterion.state === "scored" ? "brand" : criterion.state === "provisional" ? "amber" : criterion.state === "held" ? "rose" : "slate";
  return (
    <li className="px-5 py-4 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="font-semibold text-ink">{criterion.label}</p>
          <p className="text-xs text-subtle">{criterion.question}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={badge.tone}>{badge.label}</Badge>
          <p className="w-20 text-right text-sm tabular-nums">
            <span className="text-base font-bold text-ink">{criterion.points == null ? "—" : criterion.points}</span>
            <span className="text-subtle"> / {criterion.weight}</span>
          </p>
        </div>
      </div>
      <ScoreBar
        value={criterion.points}
        max={criterion.weight}
        tone={tone}
        hatched={criterion.state === "provisional"}
        className="mt-3"
      />
      <p className="mt-2.5 text-sm leading-relaxed text-muted">{criterion.reasoning}</p>
    </li>
  );
}

export function CriteriaList({ evaluation }: { evaluation: Evaluation }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-paper/60 px-5 py-3 sm:px-6">
        <p className="text-sm font-semibold">
          Nine criteria · {GRID_VARIANTS[evaluation.variant].name}
        </p>
        <p className="text-xs text-subtle">Assessed as of {formatDate(evaluation.assessedAsOf)}</p>
      </div>
      <ol className="divide-y divide-line">
        {evaluation.criteria.map((criterion) => (
          <CriterionRow key={criterion.id} criterion={criterion} />
        ))}
      </ol>
      <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-line bg-paper/60 px-5 py-3 text-xs text-subtle sm:px-6">
        <span><span className="font-semibold text-emerald-700">Scored</span>: inputs backed by documents</span>
        <span><span className="font-semibold text-amber-700">Provisional</span>: applicant&apos;s word, hatched</span>
        <span><span className="font-semibold text-slate-600">Not scored</span>: evidence missing</span>
        <span><span className="font-semibold text-rose-600">Held</span>: contradictory evidence</span>
      </div>
    </Card>
  );
}

export function SiteVisitList({ questions }: { questions: string[] }) {
  if (!questions.length) return null;
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ClipboardCheck className="size-4 text-navy-600" aria-hidden /> Open questions for the site visit
      </div>
      <ol className="mt-4 space-y-2.5">
        {questions.map((question, index) => (
          <li key={question} className="flex gap-3 text-sm leading-relaxed">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-navy-50 text-xs font-bold text-navy-700">{index + 1}</span>
            <span className="text-ink">{question}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function ContradictionList({ contradictions }: { contradictions: Contradiction[] }) {
  if (!contradictions.length) {
    return <Callout tone="success" title="No self-contradictions found">Licence dates, ownership, the machinery table and the staff split are consistent.</Callout>;
  }
  return (
    <div className="space-y-3">
      {contradictions.map((c) => (
        <div key={c.id} className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-200">
          <p className="flex items-center gap-2 font-semibold text-rose-800">
            <TriangleAlert className="size-4" aria-hidden /> {c.title}
          </p>
          <p className="mt-1.5 text-sm text-rose-900/80">{c.detail}</p>
          <p className="mt-2 text-sm text-rose-900">
            <span className="font-semibold">Ask:</span> {c.question}
          </p>
        </div>
      ))}
    </div>
  );
}

export function GridNote() {
  return (
    <p className="text-xs leading-relaxed text-subtle">
      Computed by deterministic rules, not by a language model. The grid, weights and thresholds are
      illustrative until sequa&apos;s official scoring grid is loaded.
    </p>
  );
}
