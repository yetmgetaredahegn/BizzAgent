import { describe, expect, it } from "vitest";

import { analyzePack } from "./analyze";
import { findContradictions } from "./contradictions";
import { emptyApplication, emptyImpact } from "./fixtures/build";
import { REVIEW_BATCH, almaz, hiwot, nahom } from "./fixtures";
import { abay, bishoftu, direTej, dorze, mojo } from "./fixtures/batch";
import { FORM_FIELDS } from "./form-schema";
import { CRITERIA, GRID_VARIANTS } from "./grid";
import type { ApplicationPack } from "./types";

function blankPack(): ApplicationPack {
  return {
    id: "blank",
    kind: "live",
    language: "en",
    data: emptyApplication(),
    licence: { licence_number: null, registration_date: null, valid_until: null, business_activity: null },
    context: { region: null, town: null, sector_category: null, prior_funding_same_intervention: null },
    impact: emptyImpact(),
    provenance: {},
  };
}

describe("grid", () => {
  it("each variant's weights sum to 100", () => {
    for (const variant of Object.values(GRID_VARIANTS)) {
      const sum = CRITERIA.reduce((total, c) => total + variant.weights[c.id], 0);
      expect(sum).toBe(100);
    }
  });

  it("the innovation grid weighs uniqueness twice as heavily", () => {
    expect(GRID_VARIANTS.innovation.weights.uniqueness).toBe(
      2 * GRID_VARIANTS.standard.weights.uniqueness,
    );
  });
});

describe("evaluate", () => {
  it("never scores a criterion whose inputs are missing", () => {
    const { evaluation } = analyzePack(blankPack());
    for (const criterion of evaluation.criteria) {
      expect(criterion.rating).toBeNull();
      expect(criterion.points).toBeNull();
      expect(criterion.state).toBe("not_scored");
    }
    expect(evaluation.total).toBe(0);
    expect(evaluation.eligibility).toBe("pending");
  });

  it("scores unverified inputs only provisionally", () => {
    const { evaluation } = analyzePack(nahom);
    const growth = evaluation.criteria.find((c) => c.id === "growth");
    expect(growth?.state).toBe("provisional");
    expect(evaluation.provisionalPoints).toBeGreaterThan(0);
  });

  it("routes services to the innovation grid and shows the other score", () => {
    const { evaluation } = analyzePack(nahom);
    expect(evaluation.variant).toBe("innovation");
    expect(evaluation.otherVariant.id).toBe("standard");
    expect(evaluation.otherVariant.total).not.toBe(evaluation.total);
  });

  it("flags provisional routing when the sector is not in the list", () => {
    const { evaluation } = analyzePack(hiwot);
    expect(evaluation.variantConfirmed).toBe(false);
  });

  it("names the exclusion factor that ends an application", () => {
    const tej = analyzePack(direTej).evaluation;
    expect(tej.eligibility).toBe("excluded");
    expect(tej.exclusions.find((c) => c.id === "excluded_activity")?.outcome).toBe("fail");

    const expired = analyzePack(dorze).evaluation;
    expect(expired.eligibility).toBe("excluded");
    expect(expired.exclusions.find((c) => c.id === "licence_validity")?.outcome).toBe("fail");
  });

  it("leaves eligibility pending when a gate check cannot be established", () => {
    const { evaluation } = analyzePack(bishoftu);
    expect(evaluation.eligibility).toBe("pending");
    expect(evaluation.gate.find((c) => c.id === "years")?.outcome).toBe("unknown");
    expect(evaluation.siteVisitQuestions.length).toBeGreaterThan(0);
  });
});

describe("contradictions", () => {
  it("licence date against years in operation", () => {
    expect(findContradictions(nahom).map((c) => c.kind)).toContain("licence_vs_years");
  });

  it("ownership percentages that do not sum", () => {
    expect(findContradictions(hiwot).map((c) => c.kind)).toContain("ownership_sum");
  });

  it("capacity checkbox against an empty machinery table", () => {
    expect(findContradictions(mojo).map((c) => c.kind)).toContain("results_vs_equipment");
  });

  it("more women than employees", () => {
    expect(findContradictions(abay).map((c) => c.kind)).toContain("employee_split");
  });

  it("finds nothing in a consistent application", () => {
    expect(findContradictions(almaz)).toHaveLength(0);
  });

  it("marks involved fields contradictory and holds their criteria", () => {
    const analysis = analyzePack(hiwot);
    expect(analysis.fields["company_profile.ownership"].status).toBe("contradictory");
  });
});

describe("gaps", () => {
  it("lists every required field that is missing", () => {
    for (const pack of REVIEW_BATCH) {
      const analysis = analyzePack(pack);
      const gapKeys = new Set(analysis.gaps.map((g) => g.key));
      for (const field of FORM_FIELDS) {
        if (field.required && analysis.fields[field.key].status === "missing") {
          expect(gapKeys.has(field.key)).toBe(true);
        }
      }
    }
  });

  it("says what each gap needs and from whom", () => {
    const { gaps } = analyzePack(almaz);
    const email = gaps.find((g) => g.key === "company_profile.email");
    expect(email?.priority).toBe("blocking");
    expect(email?.required_evidence).toBeTruthy();
    expect(email?.provider).toBe("Applicant");
  });

  it("never treats an empty value as established", () => {
    const pack = blankPack();
    pack.provenance["company_profile.email"] = { status: "established", source: "licence" };
    expect(analyzePack(pack).fields["company_profile.email"].status).toBe("missing");
  });
});

describe("demo batch", () => {
  it("has twelve applications with unique ids", () => {
    expect(REVIEW_BATCH).toHaveLength(12);
    expect(new Set(REVIEW_BATCH.map((p) => p.id)).size).toBe(12);
  });
});
