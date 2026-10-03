"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/api";
import { Composer, ReadBackCard } from "@/components/ds/composer";
import { EvidenceStamp } from "@/components/ds/evidence-stamp";
import { StageStatus } from "@/components/ds/states";
import { Button } from "@/components/ui/button";
import { useI18n, type MessageId } from "@/i18n";
import { useStore } from "@/lib/store";

import { onboardingStore, parseCount, patchOnboarding } from "./state";

const FIELDS = ["name", "business", "activity", "town", "staff", "need"] as const;
type Field = (typeof FIELDS)[number];

export function InterviewStep() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const state = useStore(onboardingStore);
  const isPartner = state.path === "partner";
  const questions = isPartner ? (["business"] as Field[]) : [...FIELDS];

  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const done = index >= questions.length;
  const field = questions[index];

  const qKey = (f: Field | undefined, suffix = "") =>
    (isPartner ? `ob.int.partner${suffix}` : `ob.int.q.${f}${suffix}`) as MessageId;

  function confirm() {
    if (!pending || !field) return;
    patchOnboarding({ facts: { ...state.facts, [field]: pending } });
    setPending(null);
    setIndex((i) => i + 1);
  }

  async function finishPartner() {
    setCreating(true);
    await api.createAccount({ phone: state.phone, language: lang, path: "partner", partnerKind: state.partnerKind, name: state.facts.business, profile: { business: state.facts.business } });
    router.push("/p/you-ws");
  }

  const readback = pending ? (field === "staff" ? t("ob.int.q.staff.readback", { text: pending }) : pending) : "";

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[clamp(1.75rem,6vw,2.5rem)] leading-tight font-bold">{isPartner ? t("ob.int.partner") : t("ob.int.title")}</h1>
        {!isPartner && <p className="text-muted">{t("ob.int.sub")}</p>}
      </div>

      {!done && field && (
        <section aria-live="polite" className="flex flex-col gap-4">
          {!isPartner && <p className="num text-xs tracking-wide text-muted uppercase">{t("ob.int.progress", { n: index + 1, m: questions.length })}</p>}
          <div className="rounded-sheet bg-surface p-4 ring-1 ring-line">
            <p className="font-display text-xl font-semibold">{t(qKey(field))}</p>
            {!isPartner && <p className="mt-1 text-sm text-muted">{t("ob.int.why", { why: t(qKey(field, ".why")) })}</p>}
          </div>
          {pending ? (
            <ReadBackCard text={readback} onYes={confirm} onFix={() => setPending(null)} />
          ) : (
            <Composer key={index} sample={t(qKey(field, ".sample"))} onSend={(text) => setPending(field === "staff" ? String(parseCount(text) ?? text) : text)} />
          )}
        </section>
      )}

      {FIELDS.some((f) => state.facts[f] && questions.indexOf(f) < index) && (
        <ul className="ledger-rule rounded-sheet bg-surface px-4 ring-1 ring-line">
          {questions.slice(0, index).map((f) => (
            <li key={f} className="flex items-center justify-between gap-3 py-2.5">
              <span className="min-w-0">
                <span className="num block text-xs text-muted">{t(qKey(f))}</span>
                <span className="font-semibold">{state.facts[f]}</span>
              </span>
              <EvidenceStamp status="unverified" source="said by voice or text" compact />
            </li>
          ))}
        </ul>
      )}

      {done && (
        <div className="flex flex-col gap-4">
          {!isPartner && <p className="text-lg">{t("ob.int.done")}</p>}
          {creating ? (
            <StageStatus text={t("ob.creating")} />
          ) : isPartner ? (
            <Button size="lg" onClick={finishPartner} className="w-full tablet:w-fit">
              {t("ob.rev.finish")}
            </Button>
          ) : (
            <Button size="lg" onClick={() => router.push("/start/context")} className="w-full tablet:w-fit">
              {t("action.continue")}
            </Button>
          )}
        </div>
      )}

      {!done && !isPartner && (
        <Link href="/start/context" className="w-fit text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline">
          {t("action.finishLater")}
        </Link>
      )}
    </>
  );
}
