"use client";

import { AudioLines, Camera, FileText, ListFilter } from "lucide-react";
import { useState } from "react";

import { useCase } from "@/components/apply/case-context";
import { PackSections } from "@/components/pack/pack-sections";
import { PageTitle } from "@/components/ui/page-title";
import { Badge, Card } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/format";
import { LANGUAGES } from "@/lib/i18n";
import type { FieldStatus } from "@/lib/types";

export function PackView() {
  const { pack, analysis, session } = useCase();
  const [onlyAttention, setOnlyAttention] = useState(false);
  const voice = pack.voiceNote;
  const voiceLanguage = LANGUAGES.find((l) => l.id === voice?.language);
  const history = session?.interview?.history ?? [];

  return (
    <div>
      <PageTitle
        title="Application pack"
        lead="Sections 1.1 to 2.6 of the form, with the evidence behind every field. Nothing uncertain is presented as fact."
      >
        <button
          type="button"
          aria-pressed={onlyAttention}
          onClick={() => setOnlyAttention((v) => !v)}
          className={cn(
            "inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-semibold ring-1 transition-colors sm:self-auto",
            onlyAttention ? "bg-navy-600 text-white ring-navy-600" : "bg-surface text-ink ring-line-strong hover:bg-navy-50/60",
          )}
        >
          <ListFilter className="size-4" aria-hidden />
          {onlyAttention ? "Needs attention only" : "Show what needs attention"}
        </button>
      </PageTitle>

      <div className="mb-8 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-subtle uppercase">
            <AudioLines className="size-4 text-brand-600" aria-hidden />
            {voice ? "Voice note" : "Voice interview"}
          </div>
          {voice ? (
            <>
              <blockquote className="mt-3 font-display text-lg leading-relaxed text-ink italic">
                &ldquo;{voice.excerpt}&rdquo;
              </blockquote>
              <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-subtle">
                <Badge tone="brand">{voiceLanguage?.native}</Badge>
                {voice.duration}
                {voice.language !== "en" && <span>· translated excerpt</span>}
              </p>
            </>
          ) : history.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {history.slice(-3).map((turn, index) => (
                <li key={index} className="text-muted">
                  <span className="font-semibold text-ink">{turn.question}</span>
                  <br />“{turn.transcript}”
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No answers recorded yet.</p>
          )}
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold tracking-wider text-subtle uppercase">Evidence received</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li className="flex items-center gap-2.5">
              <FileText className="size-4 text-navy-600" aria-hidden />
              Licence photo
              <span className="ml-auto">
                <StatusBadge status={pack.documents?.licence_photo ? "established" : "missing"} size="xs" />
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Camera className="size-4 text-navy-600" aria-hidden />
              Workshop photo
              <span className="ml-auto">
                <StatusBadge status={pack.documents?.workshop_photo ? "established" : "missing"} size="xs" />
              </span>
            </li>
          </ul>
          <div className="mt-4 grid grid-cols-4 gap-1.5 border-t border-line pt-4 text-center">
            {(Object.keys(analysis.counts) as FieldStatus[]).map((status) => (
              <div key={status}>
                <p className="text-lg font-bold tabular-nums">{analysis.counts[status]}</p>
                <p className="text-[10px] leading-tight text-subtle capitalize">{status}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <PackSections analysis={analysis} onlyAttention={onlyAttention} localized />
    </div>
  );
}
