"use client";

import { ChevronRight, Download, FileBraces, FileUp, RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ELIGIBILITY_BADGE } from "@/components/pack/evaluation";
import { useRankedBatch } from "@/components/review/use-ranked";
import { Button } from "@/components/ui/button";
import { Badge, Callout, Card, Container, Eyebrow } from "@/components/ui/primitives";
import { ScoreBar } from "@/components/ui/score";
import { REVIEW_BATCH, REVIEW_BATCH_NAME } from "@/lib/fixtures";
import { cn, formatDate } from "@/lib/format";
import { GRID_VARIANTS, SECTOR_LABELS, SHORTLIST_SIZE } from "@/lib/grid";
import {
  downloadFile,
  parseBatch,
  shortlistCsv,
  type RankedApplication,
  type ReviewStatus,
} from "@/lib/review";
import { importedBatchStore } from "@/lib/store";

const STATUS_BADGE: Record<ReviewStatus, { label: string; tone: "brand" | "navy" | "rose" }> = {
  shortlist: { label: "Shortlist", tone: "brand" },
  reserve: { label: "Reserve", tone: "navy" },
  excluded: { label: "Excluded", tone: "rose" },
};

type Filter = "all" | ReviewStatus;

function Flags({ item }: { item: RankedApplication }) {
  const contradictions = item.analysis.contradictions.length;
  const blocking = item.analysis.gaps.filter((g) => g.priority === "blocking").length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {contradictions > 0 && (
        <Badge tone="rose">
          <TriangleAlert className="size-3" aria-hidden /> {contradictions} contradiction{contradictions > 1 ? "s" : ""}
        </Badge>
      )}
      {blocking > 0 && <Badge tone="slate">{blocking} missing</Badge>}
      {item.source === "submitted" && <Badge tone="saffron">New · applicant</Badge>}
      {item.source === "imported" && <Badge tone="neutral">Imported</Badge>}
    </div>
  );
}

function companyMeta(item: RankedApplication) {
  const { pack } = item;
  const sector = pack.context.sector_category ? SECTOR_LABELS[pack.context.sector_category] : "Sector not in list";
  return [pack.context.town, sector].filter(Boolean).join(" · ");
}

const FACTOR_SHORT: Record<string, string> = {
  excluded_activity: "Excluded activity",
  licence_validity: "Licence expired",
  double_funding: "Funded elsewhere",
  years: "Under 1 year old",
  size: "Too large for MSME",
};

function failedFactor(item: RankedApplication): string {
  const e = item.analysis.evaluation;
  const failed = [...e.exclusions, ...e.gate].find((c) => c.outcome === "fail");
  return failed ? (FACTOR_SHORT[failed.id] ?? failed.label) : "Excluded";
}

export function ReviewDashboard() {
  const { ranked, imported } = useRankedBatch();
  const [filter, setFilter] = useState<Filter>("all");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const count = (status: ReviewStatus) => ranked.filter((r) => r.status === status).length;
  const shown = filter === "all" ? ranked : ranked.filter((r) => r.status === filter);
  const pending = ranked.filter((r) => r.analysis.evaluation.eligibility === "pending").length;
  const contradictions = ranked.reduce((sum, r) => sum + r.analysis.contradictions.length, 0);
  const assessed = ranked[0]?.analysis.evaluation.assessedAsOf;

  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      const { packs, rejected } = parseBatch(await file.text());
      if (packs.length === 0) throw new Error("No application in the file has the expected shape.");
      importedBatchStore.set(packs);
      setFilter("all");
      setMessage({
        tone: "success",
        text: `Imported ${packs.length} application${packs.length > 1 ? "s" : ""}${rejected ? `; ${rejected} rejected for missing application data` : ""}. Missing fields were left empty, not guessed.`,
      });
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Could not read the file." });
    }
  }

  return (
    <Container className="py-10 lg:py-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <Eyebrow>Reviewer path</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Ranked shortlist</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            {imported ? "Imported batch" : REVIEW_BATCH_NAME} · {ranked.length} applications · assessed as of {formatDate(assessed)}.
            Each is routed to its grid variant, run through the eligibility gate and the three exclusion
            factors, and scored per criterion with the reasoning written out.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:shrink-0 lg:flex-nowrap">
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-ink-600 px-4 text-sm font-semibold text-white hover:bg-ink-700">
            <FileUp className="size-4" aria-hidden /> Import batch
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => {
                importFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadFile("bizzagent-sample-batch.json", JSON.stringify(REVIEW_BATCH, null, 2), "application/json")}
          >
            <FileBraces className="size-4" aria-hidden /> Sample batch
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadFile("bizzagent-shortlist.csv", shortlistCsv(ranked), "text/csv")}
          >
            <Download className="size-4" aria-hidden /> Export CSV
          </Button>
          {imported && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                importedBatchStore.set(null);
                setMessage(null);
              }}
            >
              <RotateCcw className="size-4" aria-hidden /> Demo batch
            </Button>
          )}
        </div>
      </div>

      {message && (
        <Callout tone={message.tone} className="mt-6">
          {message.text}
        </Callout>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "Applications", value: ranked.length, tone: "text-ink" },
          { label: `Shortlist (capacity ${SHORTLIST_SIZE})`, value: count("shortlist"), tone: "text-brand-700" },
          { label: "Eligibility pending", value: pending, tone: "text-amber-600" },
          { label: "Excluded, reason named", value: count("excluded"), tone: "text-rose-600" },
          { label: "Contradictions caught", value: contradictions, tone: "text-rose-600" },
        ].map((tile) => (
          <Card key={tile.label} className="p-4">
            <p className={cn("text-3xl font-bold tabular-nums", tile.tone)}>{tile.value}</p>
            <p className="mt-1 text-xs leading-tight text-muted">{tile.label}</p>
          </Card>
        ))}
      </div>

      <div role="tablist" aria-label="Filter by status" className="no-scrollbar mt-8 flex gap-1 overflow-x-auto">
        {(["all", "shortlist", "reserve", "excluded"] as Filter[]).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            onClick={() => setFilter(id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ring-1 transition-colors",
              filter === id ? "bg-ink-600 text-white ring-ink-600" : "bg-surface text-muted ring-line hover:text-ink",
            )}
          >
            {id === "all" ? "All" : STATUS_BADGE[id].label}{" "}
            <span className="opacity-70">{id === "all" ? ranked.length : count(id)}</span>
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <Card className="mt-4 hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper/70 text-xs text-subtle">
            <tr>
              <th scope="col" className="w-14 py-3 pl-5 font-semibold">Rank</th>
              <th scope="col" className="py-3 font-semibold">Company</th>
              <th scope="col" className="py-3 font-semibold">Grid</th>
              <th scope="col" className="w-56 py-3 font-semibold">Score</th>
              <th scope="col" className="py-3 font-semibold">Status</th>
              <th scope="col" className="py-3 font-semibold">Flags</th>
              <th scope="col" className="w-10 py-3 pr-5"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((item) => {
              const e = item.analysis.evaluation;
              const status = STATUS_BADGE[item.status];
              const eligibility = ELIGIBILITY_BADGE[e.eligibility];
              return (
                <tr key={item.pack.id} className="group relative hover:bg-paper/70">
                  <td className="py-4 pl-5 text-base font-bold text-subtle tabular-nums">{item.rank ?? "—"}</td>
                  <td className="py-4 pr-4">
                    <Link href={`/review/${item.pack.id}`} className="font-semibold text-ink after:absolute after:inset-0 group-hover:text-ink-700">
                      {item.pack.data.applicant.company_profile.company_name ?? "Unnamed applicant"}
                    </Link>
                    <p className="text-xs text-subtle">{companyMeta(item)}</p>
                  </td>
                  <td className="py-4 pr-4 text-muted">
                    {GRID_VARIANTS[e.variant].name.replace(" grid", "")}
                    {!e.variantConfirmed && <span className="block text-xs text-amber-700">unconfirmed</span>}
                  </td>
                  <td className="py-4 pr-6">
                    <div className="flex items-center gap-3">
                      <ScoreBar value={e.total} max={100} tone={item.status === "excluded" ? "slate" : "brand"} />
                      <span className={cn("w-7 text-right text-base leading-none font-bold tabular-nums", item.status === "excluded" && "text-subtle")}>{Math.round(e.total)}</span>
                    </div>
                    <p className="mt-1 text-xs text-subtle">
                      {GRID_VARIANTS[e.otherVariant.id].name.replace(" grid", "")}: {Math.round(e.otherVariant.total)}
                    </p>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-col items-start gap-1">
                      <Badge tone={status.tone}>{status.label}</Badge>
                      {e.eligibility !== "eligible" && (
                        <span className={cn("text-xs", eligibility.tone === "rose" ? "text-rose-600" : "text-amber-700")}>
                          {e.eligibility === "excluded" ? failedFactor(item) : eligibility.label}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 pr-4"><Flags item={item} /></td>
                  <td className="py-4 pr-5 text-subtle"><ChevronRight className="size-4" aria-hidden /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Mobile cards */}
      <ul className="mt-4 space-y-3 md:hidden">
        {shown.map((item) => {
          const e = item.analysis.evaluation;
          const status = STATUS_BADGE[item.status];
          return (
            <li key={item.pack.id}>
              <Link href={`/review/${item.pack.id}`} className="block">
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 pt-0.5 text-base font-bold text-subtle tabular-nums">{item.rank ?? "—"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{item.pack.data.applicant.company_profile.company_name}</p>
                      <p className="text-xs text-subtle">{companyMeta(item)} · {GRID_VARIANTS[e.variant].name}</p>
                    </div>
                    <span className="text-xl font-bold tabular-nums">{Math.round(e.total)}</span>
                  </div>
                  <ScoreBar value={e.total} max={100} tone={item.status === "excluded" ? "slate" : "brand"} className="mt-3" />
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge tone={status.tone}>{status.label}</Badge>
                    <Flags item={item} />
                  </div>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-xs leading-relaxed text-subtle">
        Ranking uses the routed grid&apos;s total. Excluded applications are listed with the factor that
        ended them and do not enter the ranking. A contradiction never excludes on its own: it becomes a
        site-visit question. Grid and thresholds are illustrative until the funder&apos;s official grid is loaded.
      </p>
    </Container>
  );
}
