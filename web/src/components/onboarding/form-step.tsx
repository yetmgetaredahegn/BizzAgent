"use client";

import { useRouter } from "next/navigation";

import type { LegalForm, PartnerKind } from "@/api";
import { TermTooltip } from "@/components/ds/term-tooltip";
import { useI18n, type MessageId } from "@/i18n";
import type { TermId } from "@/lib/glossary";
import { useStore } from "@/lib/store";

import { onboardingStore, patchOnboarding } from "./state";

const BUSINESS: LegalForm[] = ["informal", "sole_proprietorship", "one_member_plc", "plc", "share_company", "general_partnership", "limited_partnership", "other"];
const COLLECTIVE: LegalForm[] = ["cooperative", "association_cso", "ngo", "savings_group", "other"];
const PARTNER: PartnerKind[] = ["funder", "program", "support_org"];
const TERM: Partial<Record<LegalForm, TermId>> = { sole_proprietorship: "soleProprietorship", plc: "plc", one_member_plc: "plc" };

export function FormStep() {
  const { t } = useI18n();
  const router = useRouter();
  const state = useStore(onboardingStore);
  const path = state.path ?? "business";
  const options: (LegalForm | PartnerKind)[] = path === "partner" ? PARTNER : path === "collective" ? COLLECTIVE : BUSINESS;

  function choose(value: LegalForm | PartnerKind | "unsure") {
    if (path === "partner") patchOnboarding({ partnerKind: value as PartnerKind });
    else patchOnboarding({ legalForm: value === "unsure" ? "other" : (value as LegalForm) });
    router.push("/start/interview");
  }

  const titleKey = `ob.form.title.${path === "partner" ? "partner" : path === "collective" ? "collective" : "business"}` as MessageId;

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[clamp(1.75rem,6vw,2.5rem)] leading-tight font-bold">{t(titleKey)}</h1>
        <p className="text-muted">{t("ob.form.sub")}</p>
      </div>
      <div role="radiogroup" aria-label={t(titleKey)} className="flex flex-col gap-2">
        {options.map((option) => {
          const label = t(`ob.form.${option}` as MessageId);
          const term = TERM[option as LegalForm];
          return (
            <div key={option} className="rounded-sheet flex items-center justify-between gap-3 bg-surface p-1 pl-4 ring-1 ring-line">
              <span className="py-3 font-semibold">{term ? <TermTooltip term={term}>{label}</TermTooltip> : label}</span>
              <button
                type="button"
                role="radio"
                aria-checked={false}
                aria-label={label}
                onClick={() => choose(option)}
                className="min-touch rounded-sheet px-4 text-sm font-semibold text-stamp hover:bg-stamp/10"
              >
                {t("action.continue")}
              </button>
            </div>
          );
        })}
        {path !== "partner" && (
          <button
            type="button"
            onClick={() => choose("unsure")}
            className="min-touch rounded-sheet px-4 py-3 text-left font-semibold text-muted border border-dashed border-line-strong hover:text-ink"
          >
            {t("ob.form.unsure")}
          </button>
        )}
      </div>
      <p className="text-sm text-muted">{t("ob.form.note")}</p>
    </>
  );
}
