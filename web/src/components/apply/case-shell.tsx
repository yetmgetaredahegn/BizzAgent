"use client";

import {
  ClipboardList,
  FileSearch,
  Gauge,
  ListChecks,
  Mic,
  ScrollText,
  Send,
  Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { CaseProvider, useCase, useCasePack } from "@/components/apply/case-context";
import { useT } from "@/components/language";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card, Container } from "@/components/ui/primitives";
import { STATUS_STYLE } from "@/components/ui/status-badge";
import { DECLARATIONS } from "@/lib/declarations";
import { DEMO_CASE_IDS, getDemoPack } from "@/lib/fixtures";
import { cn } from "@/lib/format";
import type { MessageKey } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/i18n";
import type { FieldStatus } from "@/lib/types";

export const STEPS: { id: string; key: MessageKey; Icon: typeof ClipboardList }[] = [
  { id: "pack", key: "step.pack", Icon: ClipboardList },
  { id: "gaps", key: "step.gaps", Icon: ListChecks },
  { id: "declarations", key: "step.declarations", Icon: ScrollText },
  { id: "score", key: "step.score", Icon: Gauge },
  { id: "impact", key: "step.impact", Icon: Target },
  { id: "submit", key: "step.submit", Icon: Send },
];

const CASE_LABELS: Record<string, string> = {
  almaz: "Almaz",
  nahom: "Nahom",
  hiwot: "Hiwot",
  live: "Your application",
};

export function CaseShell({ caseId, children }: { caseId: string; children: ReactNode }) {
  const { pack, analysis, session } = useCasePack(caseId);
  const pathname = usePathname();
  const step = pathname.split("/").pop() ?? "pack";

  if (!pack || !analysis) return <NoLiveCase />;

  return (
    <CaseProvider caseId={caseId} pack={pack} analysis={analysis} session={session}>
      <CaseHeader caseId={caseId} step={step} />
      <Container className="grid gap-8 py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-10">
        <StepNav caseId={caseId} step={step} />
        <div className="min-w-0">{children}</div>
      </Container>
    </CaseProvider>
  );
}

function CaseHeader({ caseId, step }: { caseId: string; step: string }) {
  const { pack } = useCase();
  const profile = pack.data.applicant.company_profile;
  const persona = pack.persona;
  const language = LANGUAGES.find((l) => l.id === pack.language);

  return (
    <div className="print-hidden border-b border-line bg-surface">
      <Container className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-navy-600 text-white">
            {caseId === "live" ? <Mic className="size-5" aria-hidden /> : (
              <span className="text-base font-bold">
                {persona?.name.split(" ").map((p) => p[0]).join("")}
              </span>
            )}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold sm:text-xl">
                {profile.company_name ?? "Your application"}
              </h1>
              <Badge tone={caseId === "live" ? "brand" : "saffron"}>
                {caseId === "live" ? "Live" : "Demo case"}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-sm text-muted">
              {persona ? `${persona.name} · ${persona.place}` : "Built from your voice interview"}
              {language && <> · spoke {language.english}</>}
            </p>
          </div>
        </div>
        <nav aria-label="Switch case" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
          {[...DEMO_CASE_IDS, "live"].map((id) => (
            <Link
              key={id}
              href={`/apply/${id}/${step}`}
              aria-current={id === caseId ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap ring-1 transition-colors",
                id === caseId
                  ? "bg-navy-600 text-white ring-navy-600"
                  : "bg-paper text-muted ring-line hover:text-ink",
              )}
            >
              {CASE_LABELS[id]}
            </Link>
          ))}
        </nav>
      </Container>
    </div>
  );
}

function StepNav({ caseId, step }: { caseId: string; step: string }) {
  const t = useT();
  const { analysis, declarations } = useCase();
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
    <aside className="print-hidden lg:sticky lg:top-24 lg:self-start">
      <nav
        aria-label="Application steps"
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0"
      >
        {STEPS.map(({ id, key, Icon }) => {
          const active = id === step;
          return (
            <Link
              key={id}
              href={`/apply/${caseId}/${id}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold ring-1 transition-colors lg:ring-0",
                active
                  ? "bg-navy-600 text-white ring-navy-600"
                  : "bg-surface text-muted ring-line hover:bg-navy-50/60 hover:text-ink lg:bg-transparent",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span>{t(key)}</span>
              {meta[id] && (
                <span
                  className={cn(
                    "ml-auto rounded-full px-2 py-0.5 text-[11px] tabular-nums",
                    active ? "bg-white/15 text-white" : "bg-paper text-subtle ring-1 ring-line",
                  )}
                >
                  {meta[id]}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Card className="mt-6 hidden p-4 lg:block">
        <p className="text-xs font-bold tracking-wider text-subtle uppercase">Evidence status</p>
        <ul className="mt-3 space-y-2">
          {(Object.keys(analysis.counts) as FieldStatus[]).map((status) => (
            <li key={status} className="flex items-center gap-2.5 text-sm">
              <span className={cn("size-2.5 rounded-full", STATUS_STYLE[status].dot)} aria-hidden />
              <span className="text-muted">{t(`status.${status}` as MessageKey)}</span>
              <span className="ml-auto font-semibold tabular-nums">{analysis.counts[status]}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-line" aria-hidden>
          {(Object.keys(analysis.counts) as FieldStatus[]).map((status) => (
            <span
              key={status}
              className={STATUS_STYLE[status].dot}
              style={{ width: `${(analysis.counts[status] / Object.keys(analysis.fields).length) * 100}%` }}
            />
          ))}
        </div>
      </Card>
    </aside>
  );
}

function NoLiveCase() {
  return (
    <Container className="py-20">
      <Card className="mx-auto max-w-xl p-8 text-center sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <FileSearch className="size-6" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-bold">No live application in this browser yet</h1>
        <p className="mt-3 text-muted">
          Start with two photos and a short voice interview, or open one of the demo cases to see a
          complete pack.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/apply">
            <Mic className="size-4" aria-hidden /> Start an application
          </ButtonLink>
          <ButtonLink href="/apply/almaz/pack" variant="secondary">
            Open Almaz&apos;s demo pack
          </ButtonLink>
        </div>
        <p className="mt-6 text-xs text-subtle">
          Demo cases: {DEMO_CASE_IDS.map((id) => getDemoPack(id)?.persona?.name).join(", ")}.
        </p>
      </Card>
    </Container>
  );
}
