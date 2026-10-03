"use client";

import { useCase } from "@/components/funding/case-context";
import {
  ContradictionList,
  CriteriaList,
  EligibilityPanel,
  GridNote,
  ScoreSummary,
  SiteVisitList,
} from "@/components/pack/evaluation";
import { PageTitle } from "@/components/ui/page-title";

export function ScoreView() {
  const { pack, analysis } = useCase();
  const name = pack.persona?.name.split(" ")[0];
  return (
    <div className="space-y-10">
      <PageTitle
        title="Provisional score"
        lead={`What a reviewer would see${name ? `, shown to ${name}` : ""} before submitting. Unverified inputs count provisionally; missing inputs are not scored rather than guessed.`}
      />
      <ScoreSummary evaluation={analysis.evaluation} />

      <section aria-labelledby="eligibility" className="space-y-4">
        <h3 id="eligibility" className="text-lg font-bold">Eligibility gate and exclusions</h3>
        <EligibilityPanel evaluation={analysis.evaluation} />
      </section>

      <section aria-labelledby="criteria" className="space-y-4">
        <h3 id="criteria" className="text-lg font-bold">Reasoning per criterion</h3>
        <CriteriaList evaluation={analysis.evaluation} />
      </section>

      <section aria-labelledby="contradictions" className="space-y-4">
        <h3 id="contradictions" className="text-lg font-bold">Self-contradictions</h3>
        <ContradictionList contradictions={analysis.contradictions} />
      </section>

      <SiteVisitList questions={analysis.evaluation.siteVisitQuestions} />
      <GridNote />
    </div>
  );
}
