import type { Contradiction } from "./contradictions";
import { FORM_FIELDS, type FormField } from "./form-schema";
import { isEmpty } from "./format";
import type { ApplicationPack, FieldStatus, Provenance } from "./types";

export interface ResolvedField {
  field: FormField;
  value: unknown;
  status: FieldStatus;
  provenance?: Provenance;
  contradiction?: Contradiction;
}

export type ResolvedFields = Record<string, ResolvedField>;

/**
 * Decide each field's status. Precedence: a detected contradiction wins, an
 * empty value is always "missing" whatever the provenance says, and a value
 * without explicit provenance is "unverified" — never "established".
 */
export function resolveFields(
  pack: ApplicationPack,
  contradictions: Contradiction[],
): ResolvedFields {
  const byField = new Map<string, Contradiction>();
  for (const contradiction of contradictions) {
    for (const key of contradiction.fields) {
      if (!byField.has(key)) byField.set(key, contradiction);
    }
  }

  const resolved: ResolvedFields = {};
  for (const field of FORM_FIELDS) {
    const value = field.get(pack);
    const provenance = pack.provenance[field.key];
    const contradiction = byField.get(field.key);

    let status: FieldStatus;
    if (contradiction) status = "contradictory";
    else if (isEmpty(value)) status = "missing";
    else if (provenance && provenance.status !== "missing") status = provenance.status;
    else status = "unverified";

    resolved[field.key] = { field, value, status, provenance, contradiction };
  }
  return resolved;
}

export function countStatuses(fields: ResolvedFields): Record<FieldStatus, number> {
  const counts: Record<FieldStatus, number> = {
    established: 0,
    unverified: 0,
    missing: 0,
    contradictory: 0,
  };
  for (const entry of Object.values(fields)) counts[entry.status] += 1;
  return counts;
}
