"use client";

import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  ContradictionList,
  CriteriaList,
  EligibilityPanel,
  GridNote,
  ScoreSummary,
  SiteVisitList,
} from "@/components/pack/evaluation";
import { GapList } from "@/components/pack/gap-list";
import { PackSections } from "@/components/pack/pack-sections";
import { useRankedBatch } from "@/components/review/use-ranked";
import { useWorkspace } from "@/components/shell/workspace-context";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card, Container } from "@/components/ui/primitives";
import { cn, formatDateTime } from "@/lib/format";
import { placeName } from "@/lib/evaluate";
import { GRID_VARIANTS, SECTOR_LABELS } from "@/lib/grid";
import { LANGUAGES } from "@/lib/i18n";

const STATUS_LABEL = {
  shortlist: { label: "Shortlist", tone: "brand" as const },
  reserve: { label: "Reserve", tone: "navy" as const },
  excluded: { label: "Excluded", tone: "rose" as const },
};

export function ReviewDetail({ id }: { id: string }) {
  const { workspace } = useWorkspace();
  const base = `/p/${workspace.id}/review`;
  const { ranked } = useRankedBatch();
  const [tab, setTab] = useState<"assessment" | "application" | "gaps">("assessment");
  const index = ranked.findIndex((r) => r.pack.id === id);
  const item = ranked[index];

  if (!item) {
    return (
      <Container className="py-20">
        <Card className="mx-auto max-w-lg p-8 text-center">
          <h1 className="text-2xl font-bold">Application not found</h1>
          <p className="mt-2 text-muted">
            It may have been submitted or imported in another browser. Reviewer data is kept locally in this demo.
          </p>
          <ButtonLink href={base} className="mt-6">
            <ArrowLeft className="size-4" aria-hidden /> Back to the shortlist
          </ButtonLink>
        </Card>
      </Container>
    );
  }

  const { pack, analysis } = item;
  const e = analysis.evaluation;
  const profile = pack.data.applicant.company_profile;
  const status = STATUS_LABEL[item.status];
  const eligibleCount = ranked.filter((r) => r.rank != null).length;
  const previous = ranked[index - 1];
  const next = ranked[index + 1];
  const language = LANGUAGES.find((l) => l.id === pack.language);
  const owner = pack.persona?.name ?? pack.data.applicant.management.core_management_team[0]?.name;

  return (
    <div>
      <div className="border-b border-line bg-surface">
        <Container className="py-6">
          <Link href={base} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden /> Shortlist
          </Link>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={status.tone}>{status.label}</Badge>
                {item.rank != null && (
                  <span className="text-sm font-semibold text-muted">
                    Rank {item.rank} of {eligibleCount}
                  </span>
                )}
                {item.source === "submitted" && <Badge tone="saffron">Submitted from applicant path</Badge>}
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{profile.company_name ?? "Unnamed applicant"}</h1>
              <p className="mt-1 text-sm text-muted">
                {[owner, placeName(pack), pack.context.sector_category ? SECTOR_LABELS[pack.context.sector_category] : "sector not in list", language && `spoke ${language.english}`]
                  .filter(Boolean)
                  .join(" · ")}
                {pack.submittedAt && ` · submitted ${formatDateTime(pack.submittedAt)}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-4xl font-bold tabular-nums">{Math.round(e.total)}</p>
                <p className="text-xs text-subtle">{GRID_VARIANTS[e.variant].name}</p>
              </div>
            </div>
          </div>

          <div role="tablist" aria-label="Sections" className="no-scrollbar -mb-6 mt-6 flex gap-1 overflow-x-auto">
            {([
              ["assessment", "Assessment"],
              ["gaps", `Gaps (${analysis.gaps.length})`],
              ["application", "Application pack"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  "border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors",
                  tab === id ? "border-ink-600 text-ink-700" : "border-transparent text-muted hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-8 lg:py-10">
        {tab === "assessment" && (
          <div className="space-y-10">
            <Card className="relative overflow-hidden p-6 sm:p-8">
              <Quote className="absolute top-5 right-5 size-10 text-ink-100" aria-hidden />
              <p className="text-xs font-bold tracking-wider text-subtle uppercase">Justification</p>
              <p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink">{e.justification}</p>
            </Card>

            <ScoreSummary evaluation={e} audience="reviewer" />

            <div className="grid gap-6 lg:grid-cols-2">
              <section aria-labelledby="contradictions" className="space-y-4">
                <h2 id="contradictions" className="text-lg font-bold">Self-contradictions</h2>
                <ContradictionList contradictions={analysis.contradictions} />
              </section>
              <section aria-labelledby="visit" className="space-y-4">
                <h2 id="visit" className="text-lg font-bold">Site visit</h2>
                {e.siteVisitQuestions.length ? (
                  <SiteVisitList questions={e.siteVisitQuestions} />
                ) : (
                  <Card className="p-5 text-sm text-muted">No open questions.</Card>
                )}
              </section>
            </div>

            <section aria-labelledby="eligibility" className="space-y-4">
              <h2 id="eligibility" className="text-lg font-bold">Eligibility gate and exclusions</h2>
              <EligibilityPanel evaluation={e} />
            </section>

            <section aria-labelledby="criteria" className="space-y-4">
              <h2 id="criteria" className="text-lg font-bold">Reasoning per criterion</h2>
              <CriteriaList evaluation={e} />
            </section>
            <GridNote />
          </div>
        )}

        {tab === "gaps" && <GapList gaps={analysis.gaps} />}
        {tab === "application" && <PackSections analysis={analysis} includeImpact />}

        <nav aria-label="Other applications" className="mt-12 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
          {previous ? (
            <Link href={`${base}/${previous.pack.id}`} className="group rounded-2xl p-4 ring-1 ring-line hover:bg-surface">
              <span className="flex items-center gap-1.5 text-xs text-subtle"><ArrowLeft className="size-3.5" aria-hidden /> Previous</span>
              <span className="mt-1 block font-semibold group-hover:text-ink-700">{previous.pack.data.applicant.company_profile.company_name}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`${base}/${next.pack.id}`} className="group rounded-2xl p-4 text-right ring-1 ring-line hover:bg-surface">
              <span className="flex items-center justify-end gap-1.5 text-xs text-subtle">Next <ArrowRight className="size-3.5" aria-hidden /></span>
              <span className="mt-1 block font-semibold group-hover:text-ink-700">{next.pack.data.applicant.company_profile.company_name}</span>
            </Link>
          )}
        </nav>
      </Container>
    </div>
  );
}
