"use client";

import { ClipboardList, Gauge, ListChecks, ScrollText, Send, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { CaseProvider, useCase, useCasePack } from "@/components/funding/case-context";
import { useT } from "@/components/language";
import { StampRing } from "@/components/ds/evidence-stamp";
import { Page } from "@/components/ds/page";
import { EmptyState } from "@/components/ds/states";
import { Tag } from "@/components/ds/tag";
import { useWorkspace } from "@/components/shell/workspace-context";
import { ButtonLink } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { DECLARATIONS } from "@/lib/declarations";
import { cn } from "@/lib/format";
import type { MessageKey } from "@/lib/i18n";
import type { FieldStatus } from "@/lib/types";

export const STEPS: { id: string; key: MessageKey; Icon: typeof ClipboardList }[] = [
  { id: "pack", key: "step.pack", Icon: ClipboardList },
  { id: "gaps", key: "step.gaps", Icon: ListChecks },
  { id: "declarations", key: "step.declarations", Icon: ScrollText },
  { id: "score", key: "step.score", Icon: Gauge },
  { id: "impact", key: "step.impact", Icon: Target },
  { id: "submit", key: "step.submit", Icon: Send },
];

/** The funding module's frame: proposal title, the six steps and the evidence counts, inside the app shell. */
export function FundingShell({ caseId, children }: { caseId: string; children: ReactNode }) {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const { pack, analysis, session } = useCasePack(caseId);
  const pathname = usePathname();
  const step = pathname.split("/").pop() ?? "pack";
  const root = `/w/${workspace.id}/funding`;

  if (!pack || !analysis) {
    return (
      <Page>
        <EmptyState
          art="receipt"
          title={t("fund.nolive.title")}
          body={t("fund.nolive.body")}
          action={<ButtonLink href={`${root}/new`}>{t("fund.start")}</ButtonLink>}
        />
      </Page>
    );
  }

  const profile = pack.data.applicant.company_profile;
  return (
    <CaseProvider wsId={workspace.id} caseId={caseId} pack={pack} analysis={analysis} session={session}>
      <Page
        wide
        eyebrow={
          <Link href={root} className="hover:underline">
            ← {t("fund.title")}
          </Link>
        }
        title={profile.company_name ?? t("fund.yourApplication")}
        actions={<Tag highlight={caseId !== "live"}>{caseId === "live" ? t("fund.live") : t("fund.demo")}</Tag>}
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 laptop:grid-cols-[15rem_minmax(0,1fr)]">
          <StepNav step={step} />
          <div className="min-w-0">{children}</div>
        </div>
      </Page>
    </CaseProvider>
  );
}

function StepNav({ step }: { step: string }) {
  const t = useT();
  const { t: ti } = useI18n();
  const { analysis, declarations, base } = useCase();
  const understood = DECLARATIONS.filter((d) => declarations[d.id]?.understood).length;
  const blocking = analysis.gaps.filter((g) => g.priority === "blocking").length;
  const meta: Record<string, string> = {
    pack: `${Math.round(analysis.completeness * 100)}%`,
    gaps: String(analysis.gaps.length),
    declarations: `${understood}/${DECLARATIONS.length}`,
    score: String(Math.round(analysis.evaluation.total)),
    impact: "",
    submit: blocking ? `${blocking} left` : "",
  };

  return (
    <aside className="print-hidden min-w-0 laptop:sticky laptop:top-20 laptop:self-start">
      <nav aria-label={ti("fund.steps")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 laptop:mx-0 laptop:flex-col laptop:gap-1 laptop:overflow-visible laptop:px-0">
        {STEPS.map(({ id, key, Icon }) => {
          const active = id === step;
          return (
            <Link
              key={id}
              href={`${base}/${id}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "min-touch flex shrink-0 items-center gap-2.5 rounded-full px-4 text-sm font-semibold ring-1 transition-colors laptop:rounded-stamp laptop:ring-0",
                active ? "bg-stamp text-on-stamp ring-stamp" : "bg-surface text-muted ring-line-strong hover:text-ink laptop:bg-transparent",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span>{t(key)}</span>
              {meta[id] && <span className="num ml-auto text-xs opacity-80">{meta[id]}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-sheet mt-5 hidden bg-surface p-4 ring-1 ring-line laptop:block">
        <p className="num text-xs tracking-wide text-muted uppercase">{ti("fund.evidence")}</p>
        <ul className="mt-3 flex flex-col gap-2">
          {(Object.keys(analysis.counts) as FieldStatus[]).map((status) => (
            <li key={status} className="flex items-center gap-2.5 text-sm">
              <StampRing status={status} className="size-4" />
              <span className="text-muted">{ti(`status.${status}`)}</span>
              <span className="num ml-auto font-semibold">{analysis.counts[status]}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
