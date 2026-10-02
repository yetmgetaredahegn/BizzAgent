"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/api";
import { EvidenceStamp } from "@/components/ds/evidence-stamp";
import { StageStatus } from "@/components/ds/states";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useStore } from "@/lib/store";

import { onboardingStore, parseCount, patchOnboarding } from "./state";

export function ReviewStep() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const state = useStore(onboardingStore);
  const [creating, setCreating] = useState(false);

  function toggle(id: string) {
    patchOnboarding({ candidates: state.candidates.map((c) => (c.id === id ? { ...c, removed: !c.removed } : c)) });
  }

  async function finish() {
    setCreating(true);
    const path = state.path ?? "business";
    await api.createAccount({
      phone: state.phone,
      language: lang,
      path,
      name: state.facts.name,
      legalForm: state.legalForm,
      partnerKind: state.partnerKind,
      profile: {
        business: state.facts.business,
        activity: state.facts.activity,
        town: state.facts.town,
        staff: state.facts.staff ? parseCount(state.facts.staff) : undefined,
      },
    });
    router.push("/w/you-ws");
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[clamp(1.75rem,6vw,2.5rem)] leading-tight font-bold">{t("ob.rev.title")}</h1>
        <p className="text-muted">{t("ob.rev.sub")}</p>
      </div>

      {state.candidates.length === 0 ? (
        <p className="text-muted">{t("ob.rev.none")}</p>
      ) : (
        <ul className="ledger-rule rounded-sheet bg-surface px-4 ring-1 ring-line">
          {state.candidates.map((c) => (
            <li key={c.id} className="flex flex-col gap-2 py-3 tablet:flex-row tablet:items-center tablet:justify-between">
              <span className={c.removed ? "text-muted line-through" : ""}>
                {c.text}
                <span className="mt-1 block">
                  <EvidenceStamp status="unverified" source={t("ob.rev.source")} />
                  <span className="num ml-2 text-xs text-muted">{t("ob.rev.source")}</span>
                </span>
              </span>
              <Button size="sm" variant="secondary" onClick={() => toggle(c.id)} className="w-fit">
                {c.removed ? t("ob.rev.keep") : t("ob.rev.remove")}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {creating ? (
        <StageStatus text={t("ob.creating")} />
      ) : (
        <Button size="lg" onClick={finish} className="w-full tablet:w-fit">
          {t("ob.rev.finish")}
        </Button>
      )}
    </>
  );
}
