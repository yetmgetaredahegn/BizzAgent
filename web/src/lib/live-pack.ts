/*
 * Builds an application pack from a live session: the interview state the
 * backend returned plus the result of the document check.
 *
 * The mock application returned by POST /applications/process is
 * deliberately ignored. Only what the applicant actually said is used, and
 * it stays "unverified" until a document backs it.
 */

import { emptyApplication, emptyImpact, missing } from "./fixtures/build";
import { FORM_FIELDS } from "./form-schema";
import type { LiveSession } from "./store";
import type { ApplicationData, ApplicationPack, Provenance } from "./types";

/** Interview field names (backend ALLOWED_FIELDS) → form-schema keys. */
export const INTERVIEW_FIELD_KEYS: Record<string, string> = {
  company_name: "company_profile.company_name",
  type_of_business: "company_profile.type_of_business",
  description: "company_overview.description",
  address: "company_profile.address",
  number_of_years_in_operation: "company_profile.number_of_years_in_operation",
  funding_problem: "intervention.problem_description",
};

function withDefaults(data: ApplicationData | undefined): ApplicationData {
  const base = emptyApplication();
  if (!data) return base;
  return {
    applicant: {
      ...base.applicant,
      ...data.applicant,
      company_profile: { ...base.applicant.company_profile, ...data.applicant?.company_profile },
      company_overview: { ...base.applicant.company_overview, ...data.applicant?.company_overview },
      management: { ...base.applicant.management, ...data.applicant?.management },
    },
    intervention: { ...base.intervention, ...data.intervention },
    evidence: data.evidence ?? [],
  };
}

export function buildLivePack(session: LiveSession): ApplicationPack {
  const interview = session.interview;
  const data = withDefaults(interview?.application);
  const provenance: Record<string, Provenance> = {};

  for (const field of FORM_FIELDS) {
    if (field.section === "licence") {
      provenance[field.key] = missing(
        session.documents.checked
          ? "The licence photo passed the document check, but BizzAgent does not read its details yet."
          : "No licence photo has been checked.",
      );
    } else {
      provenance[field.key] = missing("The interview has not covered this yet.");
    }
  }

  for (const [interviewField, key] of Object.entries(INTERVIEW_FIELD_KEYS)) {
    const turns = interview?.history.filter((turn) => turn.field === interviewField) ?? [];
    const last = turns[turns.length - 1];
    if (!last) continue;
    provenance[key] = {
      status: "unverified",
      source: turns.length > 1 ? "applicant_followup" : "applicant_voice",
      evidence: `“${last.transcript}”`,
      note: "Stated by the applicant in the voice interview; not yet matched to a document.",
    };
  }

  const address = data.applicant.company_profile.address;
  const impact = emptyImpact();
  if (address) {
    impact.location = address;
    provenance["impact.location"] = {
      status: "unverified",
      source: "applicant_voice",
      note: "Taken from the address the applicant gave in the interview.",
    };
  }

  return {
    id: "live",
    kind: "live",
    language: session.language,
    data,
    licence: {
      licence_number: null,
      registration_date: null,
      valid_until: null,
      business_activity: null,
    },
    documents: { licence_photo: session.documents.checked, workshop_photo: true },
    context: {
      region: null,
      town: null,
      sector_category: null,
      prior_funding_same_intervention: null,
    },
    impact,
    provenance,
  };
}
