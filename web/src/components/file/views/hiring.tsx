"use client";

import { useState } from "react";

import type { ArtifactDetail, Lang } from "@/api";
import { Panel } from "@/components/ds/page";
import { Tag } from "@/components/ds/tag";
import { useI18n, useMsg } from "@/i18n";
import { weightedScore } from "@/lib/calc";
import { cn } from "@/lib/format";

import { SectionTitle } from "../parts";

type Hiring = Extract<ArtifactDetail, { kind: "hiring" }>;
const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "am", label: "አማርኛ" },
  { id: "om", label: "Afaan Oromoo" },
];

export function HiringView({ artifact }: { artifact: Hiring }) {
  const { t, lang } = useI18n();
  const msg = useMsg();
  const [jdLang, setJdLang] = useState<Lang>(lang);

  // Totals come from the rubric arithmetic, never from model text.
  const scored = artifact.candidates
    .map((candidate) => ({
      candidate,
      total: weightedScore(candidate.criteria.map((c) => ({ label: c.criterion.id, weight: c.weight, score: c.score }))).value,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-6">
      <Panel title={t("hr.jd")} aside={<Tag>{artifact.role}</Tag>}>
        <div role="tablist" aria-label={t("hr.jd")} className="mb-3 flex w-fit gap-1 rounded-full p-0.5 ring-1 ring-line-strong">
          {LANGS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={jdLang === option.id}
              onClick={() => setJdLang(option.id)}
              lang={option.id}
              className={cn("min-touch rounded-full px-3 text-sm font-semibold", jdLang === option.id ? "bg-stamp text-on-stamp" : "text-muted")}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p lang={jdLang}>{artifact.jd[jdLang]}</p>
        {jdLang !== "en" && <p className="mt-2 text-sm text-muted">{t("hr.draftNote")}</p>}
      </Panel>

      <section>
        <SectionTitle>{t("hr.candidates")}</SectionTitle>
        <p className="mb-3 text-sm text-muted">{t("hr.fair")}</p>
        <ul className="grid items-start gap-3 laptop:grid-cols-3">
          {scored.map(({ candidate, total }) => (
            <li key={candidate.id} className="rounded-sheet flex flex-col gap-2 bg-surface p-4 ring-1 ring-line">
              <div className="flex items-baseline justify-between gap-2">
                <strong className="font-display text-lg">{candidate.name}</strong>
                <span className="num font-semibold">{t("hr.total", { n: Math.round(total) })}</span>
              </div>
              <ul className="ledger-rule text-sm">
                {candidate.criteria.map((c, i) => (
                  <li key={i} className="py-2">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold">{msg(c.criterion)}</span>
                      <span className="num text-muted">
                        {c.score}/5 · {c.weight}
                      </span>
                    </span>
                    <span className="block text-muted">
                      <span className="sr-only">{t("hr.quote")}: </span>“{c.quote}”
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">{t("hr.human")}</p>
      </section>
    </div>
  );
}
