"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { api, type ArtifactDetail } from "@/api";
import { CarbonSheet } from "@/components/ds/carbon";
import { Tag } from "@/components/ds/tag";
import { Button } from "@/components/ui/button";
import { useI18n, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";
import { diffWords } from "@/lib/diff";

type Idea = Extract<ArtifactDetail, { kind: "idea" }>;
const KEYS = ["oneLiner", "customer", "problem", "solution", "alternatives"] as const;

/** Added text is underlined and removed text is struck through, with hidden labels: never colour alone. */
function Diff({ before, after }: { before: string; after: string }) {
  const { t } = useI18n();
  return (
    <p className="leading-relaxed">
      {diffWords(before, after).map((part, i) =>
        part.type === "same" ? (
          <span key={i}>{part.text} </span>
        ) : part.type === "added" ? (
          <ins key={i} className="bg-meskel/40 text-ink underline decoration-2 underline-offset-2">
            <span className="sr-only">{t("idea.diff.added")}: </span>
            {part.text}{" "}
          </ins>
        ) : (
          <del key={i} className="text-muted line-through">
            <span className="sr-only">{t("idea.diff.removed")}: </span>
            {part.text}{" "}
          </del>
        ),
      )}
    </p>
  );
}

export function IdeaView({ wsId, artifact }: { wsId: string; artifact: Idea }) {
  const { t } = useI18n();
  const latest = artifact.versions[artifact.versions.length - 1].n;
  const [picked, setPicked] = useState<number | null>(null);
  const shown = artifact.versions.find((v) => v.n === (picked ?? latest)) ?? artifact.versions[artifact.versions.length - 1];
  const previous = artifact.versions.find((v) => v.n === shown.n - 1);
  const [showDiff, setShowDiff] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label={t("idea.versions")} className="flex gap-1 rounded-full p-0.5 ring-1 ring-line-strong">
          {artifact.versions.map((v) => (
            <button
              key={v.n}
              type="button"
              role="tab"
              aria-selected={v.n === shown.n}
              onClick={() => setPicked(v.n)}
              className={cn("min-touch num rounded-full px-4 text-sm font-semibold", v.n === shown.n ? "bg-stamp text-on-stamp" : "text-muted")}
            >
              {t("home.version", { n: v.n })}
            </button>
          ))}
        </div>
        {previous && (
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={showDiff} onChange={(event) => setShowDiff(event.target.checked)} className="size-5 accent-stamp" />
            {t("idea.showDiff", { n: previous.n })}
          </label>
        )}
      </div>

      <CarbonSheet role={shown.approved ? "original" : "draft"} edgeLabel={shown.approved ? undefined : t("sheet.idea.draft").split(":")[0].toUpperCase()} active>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tag highlight={!shown.approved}>{shown.approved ? t("sheet.idea.approved") : t("sheet.idea.draft")}</Tag>
          {!shown.approved && (
            <Button size="sm" onClick={() => void api.approveIdea(wsId, artifact.id, shown.n)}>
              <Check className="size-4" aria-hidden /> {t("idea.approve")}
            </Button>
          )}
        </div>
        <dl className="ledger-rule mt-3">
          {KEYS.map((key) => (
            <div key={key} className="grid gap-1 py-3 tablet:grid-cols-[10rem_minmax(0,1fr)] tablet:gap-4">
              <dt className="num text-xs tracking-wide text-muted uppercase">{t(`idea.${key}` as MessageId)}</dt>
              <dd>{previous && showDiff ? <Diff before={previous.fields[key]} after={shown.fields[key]} /> : shown.fields[key]}</dd>
            </div>
          ))}
        </dl>
      </CarbonSheet>
    </div>
  );
}
