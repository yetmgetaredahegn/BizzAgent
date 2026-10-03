"use client";

import { Info, Quote, TriangleAlert } from "lucide-react";

import { FieldValue } from "@/components/pack/field-value";
import { Card } from "@/components/ui/primitives";
import { STATUS_STYLE, StatusBadge } from "@/components/ui/status-badge";
import type { PackAnalysis } from "@/lib/analyze";
import { SECTIONS, fieldsInSection, type FormSection } from "@/lib/form-schema";
import { cn } from "@/lib/format";
import { SOURCE_LABELS } from "@/lib/gaps";
import type { ResolvedField } from "@/lib/resolve";

const WIDE_KINDS = new Set(["growth", "team", "equipment", "jobs", "products", "results", "longtext", "consultants", "milestones"]);

export function FieldRow({ entry, localized }: { entry: ResolvedField; localized?: boolean }) {
  const { field, value, status, provenance, contradiction } = entry;
  const wide = WIDE_KINDS.has(field.kind);
  const source = provenance?.source ? SOURCE_LABELS[provenance.source] : null;

  return (
    <div id={`field-${field.key}`} className="scroll-mt-28 px-5 py-4 sm:px-6">
      <div className={cn("grid gap-x-6 gap-y-2", !wide && "sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto]", wide && "sm:grid-cols-[minmax(0,1fr)_auto]")}>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-muted">
            {field.label}
            {!field.required && <span className="ml-1.5 text-xs font-normal text-subtle">(optional)</span>}
          </p>
        </div>
        {!wide && (
          <div className="min-w-0 break-words">
            <FieldValue kind={field.kind} value={value} />
          </div>
        )}
        <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
          <StatusBadge status={status} localized={localized} size="xs" />
          {source && status !== "missing" && <span className="text-[11px] text-subtle">{source}</span>}
        </div>
      </div>

      {wide && (
        <div className="mt-3 min-w-0">
          <FieldValue kind={field.kind} value={value} />
        </div>
      )}

      {contradiction ? (
        <p className="mt-3 flex gap-2 rounded-lg bg-rose-50 px-3 py-2 text-[13px] text-rose-800 ring-1 ring-rose-200">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            <span className="font-semibold">{contradiction.title}.</span> {contradiction.detail}
          </span>
        </p>
      ) : (
        (provenance?.evidence || provenance?.note) && (
          <div className="mt-2 space-y-1 text-[13px] text-muted">
            {provenance.evidence && status !== "missing" && (
              <p className="flex gap-2">
                <Quote className="mt-0.5 size-3.5 shrink-0 text-subtle" aria-hidden />
                <span>{provenance.evidence}</span>
              </p>
            )}
            {provenance.note && (
              <p className="flex gap-2">
                <Info className="mt-0.5 size-3.5 shrink-0 text-subtle" aria-hidden />
                <span>{provenance.note}</span>
              </p>
            )}
          </div>
        )
      )}
    </div>
  );
}

function SectionCard({
  section,
  analysis,
  onlyAttention,
  localized,
}: {
  section: FormSection;
  analysis: PackAnalysis;
  onlyAttention: boolean;
  localized?: boolean;
}) {
  const entries = fieldsInSection(section.id).map((field) => analysis.fields[field.key]);
  const shown = onlyAttention ? entries.filter((e) => e.status !== "established") : entries;
  if (shown.length === 0) return null;

  return (
    <Card id={`section-${section.id}`} className="scroll-mt-28 overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-line bg-paper/60 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid h-7 min-w-9 place-items-center rounded-lg bg-ink-600 px-2 text-xs font-bold text-white">
            {section.id === "licence" ? "ID" : section.id === "impact" ? "IP" : section.id}
          </span>
          <div className="min-w-0">
            <h2 className="font-bold text-ink">{section.title}</h2>
            <p className="text-sm text-muted">{section.summary}</p>
          </div>
        </div>
        <div className="hidden shrink-0 items-center gap-1 pt-1.5 sm:flex" aria-label="Field statuses">
          {entries.map((e) => (
            <span key={e.field.key} title={`${e.field.label}: ${e.status}`} className={cn("size-2 rounded-full", STATUS_STYLE[e.status].dot)} />
          ))}
        </div>
      </div>
      <div className="divide-y divide-line">
        {shown.map((entry) => (
          <FieldRow key={entry.field.key} entry={entry} localized={localized} />
        ))}
      </div>
    </Card>
  );
}

export function PackSections({
  analysis,
  onlyAttention = false,
  localized,
  includeImpact = false,
}: {
  analysis: PackAnalysis;
  onlyAttention?: boolean;
  localized?: boolean;
  includeImpact?: boolean;
}) {
  const parts = [
    { id: "evidence", title: "Documents" },
    { id: "applicant", title: "Part 1 · Applicant description" },
    { id: "intervention", title: "Part 2 · Intervention request" },
    ...(includeImpact ? [{ id: "impact", title: "ImpactProtocol" }] : []),
  ];
  return (
    <div className="space-y-10">
      {parts.map((part) => (
        <section key={part.id} aria-label={part.title} className="space-y-4">
          <h2 className="text-xs font-bold tracking-[0.14em] text-subtle uppercase">{part.title}</h2>
          {SECTIONS.filter((s) => s.part === part.id).map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              analysis={analysis}
              onlyAttention={onlyAttention}
              localized={localized}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
