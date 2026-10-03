import { findContradictions, type Contradiction } from "./contradictions";
import { evaluate, type Evaluation } from "./evaluate";
import { FORM_FIELDS } from "./form-schema";
import { buildGaps, type Gap } from "./gaps";
import { countStatuses, resolveFields, type ResolvedFields } from "./resolve";
import type { ApplicationPack, FieldStatus } from "./types";

export interface PackAnalysis {
  fields: ResolvedFields;
  counts: Record<FieldStatus, number>;
  contradictions: Contradiction[];
  gaps: Gap[];
  evaluation: Evaluation;
  /** Share of required fields that have a value (established or unverified). */
  completeness: number;
  /** Share of required fields that are established. */
  establishedShare: number;
}

export function analyzePack(pack: ApplicationPack): PackAnalysis {
  const contradictions = findContradictions(pack);
  const fields = resolveFields(pack, contradictions);
  const required = FORM_FIELDS.filter((f) => f.required);
  const filled = required.filter((f) => {
    const status = fields[f.key].status;
    return status === "established" || status === "unverified";
  }).length;
  const established = required.filter((f) => fields[f.key].status === "established").length;

  return {
    fields,
    counts: countStatuses(fields),
    contradictions,
    gaps: buildGaps(fields),
    evaluation: evaluate(pack, fields, contradictions),
    completeness: filled / required.length,
    establishedShare: established / required.length,
  };
}
