"use client";

import {
  Building,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Receipt,
  UserRound,
  Users,
} from "lucide-react";

import { Badge, Card } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";
import { sectionLabel, type Provider } from "@/lib/form-schema";
import type { Gap, GapPriority } from "@/lib/gaps";

const PROVIDER_ICON: Record<Provider, typeof UserRound> = {
  Applicant: UserRound,
  "Licence photo": FileText,
  "Bookkeeper or accountant": Receipt,
  "Supplier quote": Receipt,
  "Field officer (site visit)": ClipboardCheck,
  "Programme team": Building,
};

const PRIORITY_COPY: Record<GapPriority, { title: string; lead: string }> = {
  blocking: {
    title: "Needed before submission",
    lead: "Missing or contradictory. The form cannot be complete without these.",
  },
  verify: {
    title: "To verify on the site visit",
    lead: "Stated by the applicant and kept in the pack, but not yet backed by a document.",
  },
  optional: {
    title: "Optional",
    lead: "Sections the applicant may leave empty.",
  },
};

function GapCard({ gap, localized }: { gap: Gap; localized?: boolean }) {
  return (
    <li className="px-5 py-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold text-ink">{gap.label}</p>
        <Badge tone="neutral" className="font-medium">{sectionLabel(gap.section)}</Badge>
        <span className="ml-auto">
          <StatusBadge status={gap.status} localized={localized} size="xs" />
        </span>
      </div>
      <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[6rem_1fr]">
        <dt className="text-subtle">Why</dt>
        <dd className="text-muted">{gap.reason}</dd>
        <dt className="text-subtle">Needs</dt>
        <dd className="text-ink">{gap.required_evidence}</dd>
        <dt className="text-subtle">From</dt>
        <dd className="font-medium text-ink-700">{gap.provider}</dd>
      </dl>
    </li>
  );
}

function ProviderGroups({ gaps, localized }: { gaps: Gap[]; localized?: boolean }) {
  const groups = new Map<Provider, Gap[]>();
  for (const gap of gaps) groups.set(gap.provider, [...(groups.get(gap.provider) ?? []), gap]);
  return (
    <div className="space-y-4">
      {[...groups.entries()].map(([provider, items]) => {
        const Icon = PROVIDER_ICON[provider] ?? Users;
        return (
          <Card key={provider} className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line bg-paper/60 px-5 py-3 sm:px-6">
              <Icon className="size-4 text-ink-600" aria-hidden />
              <p className="text-sm font-semibold">From: {provider}</p>
              <Badge tone="navy" className="ml-auto">{items.length}</Badge>
            </div>
            <ul className="divide-y divide-line">
              {items.map((gap) => (
                <GapCard key={gap.key} gap={gap} localized={localized} />
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}

export function GapList({ gaps, localized }: { gaps: Gap[]; localized?: boolean }) {
  const byPriority = (priority: GapPriority) => gaps.filter((g) => g.priority === priority);
  const blocking = byPriority("blocking");
  const verify = byPriority("verify");
  const optional = byPriority("optional");

  return (
    <div className="space-y-10">
      <section aria-labelledby="gaps-blocking">
        <h3 id="gaps-blocking" className="text-lg font-bold">
          {PRIORITY_COPY.blocking.title} <span className="text-subtle">({blocking.length})</span>
        </h3>
        <p className="mt-1 mb-4 text-sm text-muted">{PRIORITY_COPY.blocking.lead}</p>
        {blocking.length ? (
          <ProviderGroups gaps={blocking} localized={localized} />
        ) : (
          <Card className="p-5 text-sm text-emerald-800">Nothing missing. Every required field has a value.</Card>
        )}
      </section>

      {verify.length > 0 && (
        <section aria-labelledby="gaps-verify">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
              <div>
                <h3 id="gaps-verify" className="text-lg font-bold">
                  {PRIORITY_COPY.verify.title} <span className="text-subtle">({verify.length})</span>
                </h3>
                <p className="mt-1 text-sm text-muted">{PRIORITY_COPY.verify.lead}</p>
              </div>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold ring-1 ring-line">
                <span className="group-open:hidden">Show</span>
                <span className="hidden group-open:inline">Hide</span>
                <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden />
              </span>
            </summary>
            <div className="mt-4">
              <ProviderGroups gaps={verify} localized={localized} />
            </div>
          </details>
        </section>
      )}

      {optional.length > 0 && (
        <section aria-labelledby="gaps-optional">
          <h3 id="gaps-optional" className="text-lg font-bold">
            {PRIORITY_COPY.optional.title} <span className="text-subtle">({optional.length})</span>
          </h3>
          <p className="mt-1 mb-4 text-sm text-muted">{PRIORITY_COPY.optional.lead}</p>
          <ProviderGroups gaps={optional} localized={localized} />
        </section>
      )}
    </div>
  );
}
