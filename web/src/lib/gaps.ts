/*
 * Gap list: every field that is not established, why, what it needs and
 * from whom. Shaped like the backend InformationGap so it can be swapped for
 * a server response later.
 */

import { SECTIONS, type Provider, type SectionId } from "./form-schema";
import type { ResolvedFields } from "./resolve";
import type { EvidenceSource, FieldStatus, InformationGap } from "./types";

export type GapPriority = "blocking" | "verify" | "optional";

export interface Gap extends InformationGap {
  key: string;
  label: string;
  section: SectionId;
  status: Exclude<FieldStatus, "established">;
  priority: GapPriority;
  provider: Provider;
  required_evidence: string;
}

export const SOURCE_LABELS: Record<EvidenceSource, string> = {
  applicant_voice: "voice note",
  applicant_followup: "follow-up answer",
  applicant_typed: "typed by applicant",
  licence: "licence photo",
  workshop_photo: "workshop photo",
  supporting_document: "supporting document",
  system_calculation: "calculated",
  draft_for_approval: "draft for approval",
};

const PRIORITY_ORDER: Record<GapPriority, number> = {
  blocking: 0,
  verify: 1,
  optional: 2,
};

const SECTION_ORDER = new Map(SECTIONS.map((section, index) => [section.id, index]));

export function buildGaps(fields: ResolvedFields): Gap[] {
  const gaps: Gap[] = [];

  for (const entry of Object.values(fields)) {
    const { field, status, provenance, contradiction } = entry;
    if (status === "established") continue;

    if (status === "contradictory" && contradiction) {
      gaps.push({
        key: field.key,
        field: field.key,
        label: field.label,
        section: field.section,
        status,
        priority: "blocking",
        reason: contradiction.detail,
        required_evidence: contradiction.question,
        provider: "Field officer (site visit)",
      });
      continue;
    }

    if (status === "missing") {
      gaps.push({
        key: field.key,
        field: field.key,
        label: field.label,
        section: field.section,
        status,
        priority: field.required ? "blocking" : "optional",
        reason:
          provenance?.note ??
          "Not mentioned in the voice note and not found on the documents.",
        required_evidence: field.needs,
        provider: field.provider,
      });
      continue;
    }

    // Unverified: stated by someone, not yet backed by a document.
    const source = provenance?.source ? SOURCE_LABELS[provenance.source] : "applicant";
    gaps.push({
      key: field.key,
      field: field.key,
      label: field.label,
      section: field.section,
      status: "unverified",
      priority: "verify",
      reason: provenance?.note ?? `Stated by the applicant (${source}) but not backed by a document yet.`,
      required_evidence: field.needs,
      provider: field.provider === "Applicant" ? "Field officer (site visit)" : field.provider,
    });
  }

  return gaps.sort(
    (a, b) =>
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
      (SECTION_ORDER.get(a.section) ?? 0) - (SECTION_ORDER.get(b.section) ?? 0),
  );
}
