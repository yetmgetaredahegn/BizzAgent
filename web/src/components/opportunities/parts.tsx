"use client";

import { CircleHelp, CircleX, ShieldCheck } from "lucide-react";

import type { Opportunity, PipelineStage } from "@/api";
import { DualDate } from "@/components/ds/format-parts";
import { Tag } from "@/components/ds/tag";
import { useI18n, useMsg, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";

/** Eligibility is a state with an icon and a label, never colour alone. */
export function EligibilityChip({ eligibility }: { eligibility: Opportunity["eligibility"] }) {
  const { t } = useI18n();
  const msg = useMsg();
  const Icon = eligibility.state === "eligible" ? ShieldCheck : eligibility.state === "likely" ? CircleHelp : CircleX;
  const tone = eligibility.state === "eligible" ? "text-established" : eligibility.state === "likely" ? "text-unverified" : "text-contradictory";
  return (
    <span className="flex flex-col gap-0.5">
      <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", tone)}>
        <Icon className="size-4" aria-hidden /> {t(`opp.elig.${eligibility.state}` as MessageId)}
      </span>
      {eligibility.state === "likely" && eligibility.confirm.length > 0 && (
        <span className="text-sm text-muted">{t("opp.confirm", { what: eligibility.confirm.map((c) => msg(c)).join(", ") })}</span>
      )}
      {eligibility.state === "not" && eligibility.reasons[0] && <span className="text-sm text-muted">{msg(eligibility.reasons[0])}</span>}
    </span>
  );
}

export function DeadlineLine({ opportunity }: { opportunity: Opportunity }) {
  const { t } = useI18n();
  if (!opportunity.deadline) return <span className="text-sm text-muted">{t("opp.rolling")}</span>;
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span className="text-muted">{t("opp.deadline")}</span>
      <DualDate iso={opportunity.deadline} className="font-semibold" />
      {opportunity.closingSoon && <Tag highlight>{t("opp.closingSoon")}</Tag>}
    </span>
  );
}

export function StageSelect({ value, onChange, className }: { value: PipelineStage | null; onChange: (stage: PipelineStage | null) => void; className?: string }) {
  const { t } = useI18n();
  return (
    <label className={cn("flex items-center gap-2 text-sm", className)}>
      <span className="text-muted">{t("opp.move")}</span>
      <select
        value={value ?? ""}
        onChange={(event) => onChange((event.target.value || null) as PipelineStage | null)}
        className="h-11 rounded-stamp bg-surface px-2 ring-1 ring-line-strong"
      >
        {value === null && <option value="">–</option>}
        {(["found", "shortlisted", "preparing", "submitted", "outcome"] as const).map((stage) => (
          <option key={stage} value={stage}>
            {t(`pipe.${stage}` as MessageId)}
          </option>
        ))}
        {value !== null && <option value="">{t("opp.remove")}</option>}
      </select>
    </label>
  );
}
