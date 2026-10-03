/*
 * Deterministic self-contradiction checks. Each finding names the fields
 * involved and the question a field officer should ask. A contradiction is
 * never resolved by picking one side: both values stay visible.
 */

import { ASSESSMENT_DATE } from "./grid";
import { formatDate } from "./format";
import { EXPECTED_RESULTS, type ApplicationPack } from "./types";

export type ContradictionKind =
  | "licence_vs_years"
  | "ownership_sum"
  | "results_vs_equipment"
  | "employee_split";

export interface Contradiction {
  id: string;
  kind: ContradictionKind;
  title: string;
  detail: string;
  fields: string[];
  question: string;
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

export function yearsBetween(fromIso: string, toIso: string): number {
  return (new Date(toIso).getTime() - new Date(fromIso).getTime()) / MS_PER_YEAR;
}

export function findContradictions(
  pack: ApplicationPack,
  asOf: string = ASSESSMENT_DATE,
): Contradiction[] {
  const found: Contradiction[] = [];
  const profile = pack.data.applicant.company_profile;
  const intervention = pack.data.intervention;

  // Licence date against claimed years in operation. One year of slack
  // covers rounding and the time it takes to register.
  const regDate = pack.licence.registration_date;
  const claimedYears = profile.number_of_years_in_operation;
  if (regDate && claimedYears != null) {
    const licenceYears = yearsBetween(regDate, asOf);
    if (claimedYears > licenceYears + 1) {
      found.push({
        id: "licence_vs_years",
        kind: "licence_vs_years",
        title: "Licence date vs years in operation",
        detail: `Licence registered ${formatDate(regDate)} (about ${Math.max(0, Math.round(licenceYears))} years ago), but the applicant says the business has run for ${claimedYears} years.`,
        fields: [
          "licence.registration_date",
          "company_profile.number_of_years_in_operation",
        ],
        question: `Did the business trade informally before registering in ${new Date(regDate).getUTCFullYear()}? Ask for any older receipts, a previous licence or kebele letter.`,
      });
    }
  }

  // Ownership percentages must add up to 100.
  const ownership = profile.ownership;
  if (ownership) {
    const total = ownership.women_percentage + ownership.men_percentage;
    if (Math.abs(total - 100) > 0.5) {
      found.push({
        id: "ownership_sum",
        kind: "ownership_sum",
        title: "Ownership does not add up",
        detail: `Women ${ownership.women_percentage}% + men ${ownership.men_percentage}% = ${total}%, not 100%.`,
        fields: ["company_profile.ownership"],
        question:
          "Who owns the business and in what shares? Check against the licence or the partnership agreement.",
      });
    }
  }

  // Capacity checkbox ticked with nothing in the machinery table.
  const wantsCapacity = intervention.expected_results.includes(
    EXPECTED_RESULTS.ENHANCING_PRODUCTION_CAPACITY,
  );
  if (wantsCapacity && intervention.equipment.length === 0) {
    found.push({
      id: "results_vs_equipment",
      kind: "results_vs_equipment",
      title: "Capacity result without machinery",
      detail:
        "'Enhancing production capacity' is ticked, but the machinery and equipment table is empty.",
      fields: ["intervention.expected_results", "intervention.equipment"],
      question:
        "What will increase production capacity if no equipment is requested? Either add the equipment or untick the result.",
    });
  }

  // Women or youth employees cannot exceed the total in any year.
  for (const row of pack.data.applicant.company_overview.growth_indicators) {
    const total = row.total_employees;
    if (total == null) continue;
    const overWomen = row.female_employees != null && row.female_employees > total;
    const overYouth =
      row.youth_employees_18_24 != null && row.youth_employees_18_24 > total;
    if (overWomen || overYouth) {
      const part = overWomen
        ? `${row.female_employees} women`
        : `${row.youth_employees_18_24} young employees`;
      found.push({
        id: `employee_split_${row.year}`,
        kind: "employee_split",
        title: `Employee split in ${row.year}`,
        detail: `${part} reported out of ${total} employees in total.`,
        fields: ["company_overview.growth_indicators"],
        question: `How many people worked in the business in ${row.year}, and how many were women and aged 18–24? Check the payroll.`,
      });
    }
  }

  return found;
}
