"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { useCase } from "@/components/funding/case-context";
import { GapList } from "@/components/pack/gap-list";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { Card } from "@/components/ui/primitives";

export function GapsView() {
  const { pack, analysis } = useCase();
  const [copied, setCopied] = useState(false);
  const gaps = analysis.gaps;
  const count = (priority: string) => gaps.filter((g) => g.priority === priority).length;

  const forApplicant = gaps.filter((g) => g.priority === "blocking" && g.provider === "Applicant");
  const name = pack.persona?.name.split(" ")[0];

  async function copyQuestions() {
    const text = [
      `Questions for ${name ?? "the applicant"} (BizzAgent):`,
      ...forApplicant.map((g, i) => `${i + 1}. ${g.label}: ${g.required_evidence}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <PageTitle
        title="Gap list"
        lead="Every field that is not established: why, what it needs, and who can provide it. Nothing on this list is filled in by guessing."
      >
        {forApplicant.length > 0 && (
          <Button variant="secondary" size="sm" onClick={copyQuestions} className="self-start sm:self-auto">
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? "Copied" : `Copy ${forApplicant.length} questions for ${name ?? "the applicant"}`}
          </Button>
        )}
      </PageTitle>

      <div className="mb-10 grid grid-cols-3 gap-3">
        {[
          { label: "Needed before submission", value: count("blocking"), tone: "text-rose-600" },
          { label: "To verify on site", value: count("verify"), tone: "text-amber-600" },
          { label: "Optional", value: count("optional"), tone: "text-subtle" },
        ].map((tile) => (
          <Card key={tile.label} className="p-4 sm:p-5">
            <p className={`text-3xl font-bold tabular-nums ${tile.tone}`}>{tile.value}</p>
            <p className="mt-1 text-xs leading-tight text-muted sm:text-sm">{tile.label}</p>
          </Card>
        ))}
      </div>

      <GapList gaps={gaps} localized />
    </div>
  );
}
