"use client";

import { Mic } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { api, type AcceleratorQuestion, type ArtifactDetail } from "@/api";
import { Composer } from "@/components/ds/composer";
import { DualDate } from "@/components/ds/format-parts";
import { Panel } from "@/components/ds/page";
import { Sheet } from "@/components/ds/sheet";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button } from "@/components/ui/button";
import { useI18n, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";

type Accelerator = Extract<ArtifactDetail, { kind: "accelerator" }>;

function QuestionCard({ wsId, artifactId, question }: { wsId: string; artifactId: string; question: AcceleratorQuestion }) {
  const { t } = useI18n();
  const [text, setText] = useState(question.draft);
  const [saved, setSaved] = useState(false);
  const over = text.length - question.limit;
  const id = `q-${question.id}`;
  return (
    <li className="rounded-sheet flex flex-col gap-2 bg-surface p-4 ring-1 ring-line">
      <label htmlFor={id} className="leading-snug font-semibold">
        {question.prompt}
      </label>
      <textarea
        id={id}
        value={text}
        rows={4}
        aria-invalid={over > 0}
        aria-describedby={`${id}-count`}
        placeholder={t("ac.empty")}
        onChange={(event) => {
          setText(event.target.value);
          setSaved(false);
        }}
        className={cn("rounded-stamp w-full bg-surface p-3 ring-1 focus-visible:ring-2", over > 0 ? "ring-contradictory focus-visible:ring-contradictory" : "ring-line-strong focus-visible:ring-stamp")}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id={`${id}-count`} className={cn("num text-xs", over > 0 ? "font-semibold text-contradictory" : "text-muted")} role={over > 0 ? "alert" : undefined}>
          {over > 0 ? t("ac.over", { n: over }) : t("ac.chars", { n: text.length, limit: question.limit })}
        </p>
        <span className="flex items-center gap-2">
          {saved && <span className="num text-xs text-established">{t("ac.saved")}</span>}
          <Button
            size="sm"
            variant="secondary"
            disabled={over > 0 || text === question.draft}
            onClick={async () => {
              await api.saveDraft(wsId, artifactId, question.id, text);
              setSaved(true);
            }}
          >
            {t("ac.save")}
          </Button>
        </span>
      </div>
      {question.claims.length > 0 && (
        <p className="text-sm text-muted">
          <span className="num mr-1.5 text-xs tracking-wide uppercase">{t("ac.traces")}</span>
          {question.claims.map((claim, i) => (
            <span key={claim.label}>
              {i > 0 && ", "}
              <Link href={`/w/${wsId}/file/${claim.kind}/${wsId}-${claim.kind}`} className="font-semibold text-stamp hover:underline">
                {claim.label}
              </Link>
            </span>
          ))}
        </p>
      )}
    </li>
  );
}

const MOCK_QUESTIONS = ["ac.mock.q1", "ac.mock.q2", "ac.mock.q3"] as const;

/** The mock interview checks length and facts only: deterministic, and honest that it is not a prediction. */
function MockInterview({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [answers, setAnswers] = useState<string[]>([]);
  const index = answers.length;
  const done = index >= MOCK_QUESTIONS.length;
  const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
  return (
    <Sheet open={open} onClose={onClose} title={t("ac.mock.title")}>
      <div className="flex flex-col gap-4">
        {!done ? (
          <>
            <p className="num text-xs text-muted">
              {index + 1} / {MOCK_QUESTIONS.length}
            </p>
            <p className="font-display text-xl font-semibold">{t(MOCK_QUESTIONS[index] as MessageId)}</p>
            <Composer placeholder={t("ac.mock.answer")} sample={t("ac.mock.sample")} onSend={(text) => setAnswers((a) => [...a, text])} />
          </>
        ) : (
          <>
            <h3 className="num text-xs tracking-wide text-muted uppercase">{t("ac.mock.feedback")}</h3>
            <ul className="ledger-rule">
              {MOCK_QUESTIONS.map((q, i) => {
                const lengthOk = words(answers[i]) >= 15 && words(answers[i]) <= 60;
                const numberOk = /\d/.test(answers[i]);
                return (
                  <li key={q} className="py-3">
                    <strong className="block">{t(q as MessageId)}</strong>
                    <span className="block text-sm text-muted">“{answers[i]}”</span>
                    <span className="num mt-1 flex flex-wrap gap-x-4 text-xs">
                      <span className={lengthOk ? "text-established" : "text-unverified"}>
                        {lengthOk ? "✓" : "✗"} {t("ac.mock.check.length")} ({words(answers[i])})
                      </span>
                      <span className={numberOk ? "text-established" : "text-unverified"}>
                        {numberOk ? "✓" : "✗"} {t("ac.mock.check.number")}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="text-sm text-muted">{t("ac.mock.note")}</p>
            <Button variant="secondary" className="w-fit" onClick={() => setAnswers([])}>
              {t("ac.mock.again")}
            </Button>
          </>
        )}
      </div>
    </Sheet>
  );
}

export function AcceleratorView({ artifact }: { wsId: string; artifact: Accelerator }) {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const [mock, setMock] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <dl className="flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <dt className="num text-xs tracking-wide text-muted uppercase">{t("ac.programme")}</dt>
              <dd className="font-semibold">{artifact.programme}</dd>
            </div>
            <div>
              <dt className="num text-xs tracking-wide text-muted uppercase">{t("ac.deadline")}</dt>
              <dd className="font-semibold">
                <DualDate iso={artifact.deadline} />
              </dd>
            </div>
          </dl>
          <Button variant="secondary" onClick={() => setMock(true)}>
            <Mic className="size-4" aria-hidden /> {t("ac.mock")}
          </Button>
        </div>
      </Panel>
      <ul className="flex flex-col gap-3">
        {artifact.questions.map((question) => (
          <QuestionCard key={question.id} wsId={workspace.id} artifactId={artifact.id} question={question} />
        ))}
      </ul>
      <MockInterview open={mock} onClose={() => setMock(false)} />
    </div>
  );
}
