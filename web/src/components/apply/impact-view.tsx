"use client";

import { Info, MapPin, Target, Users } from "lucide-react";
import type { ReactNode } from "react";

import { useCase } from "@/components/apply/case-context";
import { PageTitle } from "@/components/ui/page-title";
import { Card } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatETB } from "@/lib/format";
import type { ResolvedField } from "@/lib/resolve";
import { parseSdg } from "@/lib/sdg";

function Block({ entry, title, icon, children }: { entry: ResolvedField; title: string; icon?: ReactNode; children: ReactNode }) {
  const note = entry.status === "missing" ? entry.provenance?.note ?? entry.field.needs : entry.provenance?.note;
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-subtle uppercase">
          {icon}
          {title}
        </p>
        <StatusBadge status={entry.status} size="xs" localized />
      </div>
      <div className="mt-3">{entry.status === "missing" ? <p className="text-sm text-subtle italic">Not drafted yet.</p> : children}</div>
      {note && (
        <p className="mt-3 flex gap-2 text-[13px] text-muted">
          <Info className="mt-0.5 size-3.5 shrink-0 text-subtle" aria-hidden />
          {note}
        </p>
      )}
    </Card>
  );
}

export function ImpactView() {
  const { pack, analysis } = useCase();
  const f = (key: string) => analysis.fields[`impact.${key}`];
  const impact = pack.impact;

  return (
    <div>
      <PageTitle
        title="ImpactProtocol draft"
        lead="A project page drafted from the applicant's own words. Every line stays a draft until the applicant has heard it and approved it."
      />

      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-navy-700 via-navy-800 to-brand-800 p-6 text-white shadow-lift sm:p-8">
        <div className="grid-texture absolute inset-0 opacity-15" aria-hidden />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">ImpactProtocol · draft</span>
            {impact.sector ? (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">{impact.sector}</span>
            ) : (
              <span className="rounded-full bg-saffron-400/20 px-3 py-1 text-xs font-semibold text-saffron-100 ring-1 ring-saffron-300/40">
                Sector not in the list: flagged
              </span>
            )}
          </div>
          <h3 className="mt-4 max-w-2xl text-2xl leading-snug font-bold text-balance sm:text-3xl">
            {impact.title ?? <span className="text-white/50 italic">Title not drafted yet</span>}
          </h3>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden /> {impact.location ?? "Location not established"}
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="size-4" aria-hidden /> Target {formatETB(impact.funding_target_etb)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Block entry={f("title")} title="Title">
          <p className="font-semibold">{impact.title}</p>
        </Block>
        <Block entry={f("sector")} title="Sector">
          <p className="font-semibold">{impact.sector}</p>
        </Block>
        <Block entry={f("funding_target_etb")} title="Funding target">
          <p className="text-2xl font-bold tabular-nums">{formatETB(impact.funding_target_etb)}</p>
          {f("funding_target_etb").provenance?.evidence && (
            <p className="mt-1 text-sm text-muted">{f("funding_target_etb").provenance?.evidence}</p>
          )}
        </Block>
        <Block entry={f("location")} title="Location" icon={<MapPin className="size-3.5" aria-hidden />}>
          <p className="font-semibold">{impact.location}</p>
        </Block>
      </div>

      <div className="mt-4 space-y-4">
        <Block entry={f("sdgs")} title="Sustainable Development Goals, in plain words">
          <ul className="grid gap-3 sm:grid-cols-3">
            {impact.sdgs.map((label) => {
              const sdg = parseSdg(label);
              return (
                <li key={label} className="rounded-xl p-4 text-white" style={{ background: sdg?.color ?? "#64748b" }}>
                  <p className="text-3xl font-extrabold">{sdg?.number}</p>
                  <p className="mt-1 text-sm leading-tight font-bold">{sdg?.name ?? label}</p>
                  <p className="mt-2 text-sm leading-snug text-white/90">{sdg?.plain}</p>
                </li>
              );
            })}
          </ul>
        </Block>

        <div className="grid gap-4 lg:grid-cols-2">
          <Block entry={f("beneficiaries")} title="Beneficiaries" icon={<Users className="size-3.5" aria-hidden />}>
            <ul className="space-y-2">
              {impact.beneficiaries.map((b) => (
                <li key={b} className="flex gap-2 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </Block>
          <Block entry={f("milestones")} title="Milestones">
            <ol className="relative space-y-4 border-l-2 border-brand-200 pl-5">
              {impact.milestones.map((m) => (
                <li key={m.description} className="relative">
                  <span className="absolute top-1 -left-[27px] size-3 rounded-full bg-brand-500 ring-4 ring-surface" aria-hidden />
                  <p className="text-xs font-bold text-navy-600">{m.target}</p>
                  <p className="text-sm font-medium text-ink">{m.description}</p>
                </li>
              ))}
            </ol>
          </Block>
        </div>
      </div>
    </div>
  );
}
