"use client";

import { ArrowRight, CircleCheck, CircleDashed, Download, Printer, Send, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useCase } from "@/components/funding/case-context";
import { FieldValue } from "@/components/pack/field-value";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { Callout, Card } from "@/components/ui/primitives";
import { DECLARATIONS } from "@/lib/declarations";
import { FORM_FIELDS, SECTIONS, fieldsInSection } from "@/lib/form-schema";
import { formatDate } from "@/lib/format";
import { GRID_VARIANTS } from "@/lib/grid";
import { downloadFile } from "@/lib/review";
import { reviewQueueStore } from "@/lib/store";

type ItemState = "done" | "open" | "warn";

function Item({ state, title, detail, href }: { state: ItemState; title: string; detail: string; href?: string }) {
  const Icon = state === "done" ? CircleCheck : state === "warn" ? TriangleAlert : CircleDashed;
  const color = state === "done" ? "text-emerald-600" : state === "warn" ? "text-rose-600" : "text-amber-600";
  return (
    <li className="flex gap-3 px-5 py-4 sm:px-6">
      <Icon className={`mt-0.5 size-5 shrink-0 ${color}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{detail}</p>
      </div>
      {href && state !== "done" && (
        <Link href={href} className="self-center text-sm font-semibold whitespace-nowrap text-brand-700 hover:text-brand-800">
          Fix <ArrowRight className="inline size-3.5" aria-hidden />
        </Link>
      )}
    </li>
  );
}

export function SubmitView() {
  const { caseId, pack, analysis, declarations, base, root } = useCase();
  const [sentId, setSentId] = useState<string | null>(null);

  const required = FORM_FIELDS.filter((f) => f.required);
  const missing = required.filter((f) => analysis.fields[f.key].status === "missing").length;
  const understood = DECLARATIONS.filter((d) => declarations[d.id]?.understood).length;
  const ticked = DECLARATIONS.filter((d) => declarations[d.id]?.applicantTickedAt).length;
  const allTicked = ticked === DECLARATIONS.length;
  const photos = Boolean(pack.documents?.licence_photo && pack.documents?.workshop_photo);
  const e = analysis.evaluation;
  const name = pack.persona?.name ?? "the applicant";

  function send() {
    const submittedAt = new Date().toISOString();
    const id = `sub-${caseId}-${Date.now().toString(36)}`;
    reviewQueueStore.set((queue) => [...queue.filter((p) => !p.id.startsWith(`sub-${caseId}-`)), { ...pack, id, submittedAt }]);
    setSentId(id);
  }

  function download() {
    const payload = { ...pack, declarations, exportedAt: new Date().toISOString() };
    const slug = (pack.data.applicant.company_profile.company_name ?? caseId).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    downloadFile(`bizzagent-${slug}.json`, JSON.stringify(payload, null, 2), "application/json");
  }

  return (
    <div>
      <div className="print-hidden">
        <PageTitle
          title="Ready to submit?"
          lead="Gaps do not block submission: the reviewer sees them, flagged. What must be true is that the applicant ticked every declaration herself."
        />

        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            <Item
              state={photos ? "done" : "open"}
              title="Licence and workshop photos"
              detail={photos ? "Both received and passed the document check." : "Photos missing or not checked."}
              href={`${root}/new`}
            />
            <Item
              state={missing === 0 ? "done" : "open"}
              title={`Required fields: ${required.length - missing} of ${required.length} filled`}
              detail={missing === 0 ? "Every required field has a value." : `${missing} still missing. They are flagged for the reviewer, never guessed.`}
              href={`${base}/gaps`}
            />
            <Item
              state={analysis.contradictions.length === 0 ? "done" : "warn"}
              title={analysis.contradictions.length === 0 ? "No contradictions" : `${analysis.contradictions.length} contradiction${analysis.contradictions.length > 1 ? "s" : ""} to explain`}
              detail={analysis.contradictions.map((c) => c.title).join("; ") || "Dates, ownership, machinery and staff counts agree."}
              href={`${base}/score`}
            />
            <Item
              state={understood === DECLARATIONS.length ? "done" : "open"}
              title={`Declarations explained: ${understood} of ${DECLARATIONS.length} understood`}
              detail="Understanding is recorded with language and time."
              href={`${base}/declarations`}
            />
            <Item
              state={allTicked ? "done" : "open"}
              title={`Declarations ticked by ${name}: ${ticked} of ${DECLARATIONS.length}`}
              detail="Only the applicant can tick. BizzAgent never does."
              href={`${base}/declarations`}
            />
            <Item
              state="done"
              title={`Provisional score: ${Math.round(e.total)} on the ${GRID_VARIANTS[e.variant].name.toLowerCase()}`}
              detail={`${Math.round(e.provisionalPoints)} points rest on the applicant's word; ${e.unscoredPoints} not scored yet.`}
              href={`${base}/score`}
            />
          </ul>
        </Card>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button onClick={send} disabled={!allTicked} size="lg">
            <Send className="size-4" aria-hidden /> Send to reviewer queue
          </Button>
          <Button variant="secondary" size="lg" onClick={download}>
            <Download className="size-4" aria-hidden /> Download pack (.json)
          </Button>
          <Button variant="secondary" size="lg" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden /> Print or save as PDF
          </Button>
        </div>
        {!allTicked && (
          <p className="mt-3 text-sm text-muted">
            Sending unlocks once {name} has ticked all {DECLARATIONS.length} declarations.
          </p>
        )}
        {sentId && (
          <Callout tone="success" title="Sent to the funder&apos;s review queue" className="mt-6">
            It now waits for the funder&apos;s reviewers. You cannot open their queue from here.
          </Callout>
        )}
        <p className="mt-6 text-xs text-subtle">
          The reviewer queue is kept in this browser for the demo; submission to the funder&apos;s own system is not connected yet.
        </p>
      </div>

      {/* Printed pack: hidden on screen, shown when printing */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">{pack.data.applicant.company_profile.company_name ?? "Application"}</h1>
        <p className="text-sm">
          BizzAgent application pack · provisional score {Math.round(e.total)} ({GRID_VARIANTS[e.variant].name}) · assessed{" "}
          {formatDate(e.assessedAsOf)}
        </p>
        {SECTIONS.map((section) => (
          <section key={section.id} className="mt-5 break-inside-avoid">
            <h2 className="border-b pb-1 text-base font-bold">
              {section.id === "licence" || section.id === "impact" ? section.title : `${section.id} ${section.title}`}
            </h2>
            {fieldsInSection(section.id).map((field) => {
              const entry = analysis.fields[field.key];
              return (
                <div key={field.key} className="mt-2 text-sm">
                  <p className="font-semibold">
                    {field.label} <span className="font-normal">[{entry.status}]</span>
                  </p>
                  <FieldValue kind={field.kind} value={entry.value} />
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}
