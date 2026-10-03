/*
 * Funding readiness, the common application and the Passport (prototype copy of
 * backend/src/bizzagent/readiness and passport). All scores are plain arithmetic
 * over the workspace's facts and artifacts: nothing here comes from a model.
 */

import type { ArtifactSummary, CommonApplication, CommonField, Opportunity, OpportunityType, Readiness, ReadinessAction } from "../contract";
import type { WsSeed } from "./seed/workspaces";

const sum = (items: ArtifactSummary[], key: keyof ArtifactSummary["stamps"]) => items.reduce((total, a) => total + a.stamps[key], 0);

export function readinessOf(ws: WsSeed): Readiness {
  const arts = ws.artifacts;
  const est = sum(arts, "established");
  const total = est + sum(arts, "unverified") + sum(arts, "missing") + sum(arts, "contradictory");
  const missing = sum(arts, "missing");
  const contradictions = sum(arts, "contradictory");
  const completeness = arts.length ? arts.reduce((t, a) => t + a.completeness, 0) / arts.length : 0;
  const { flags } = ws;
  const isVenture = ws.type !== "partner";

  const evidence = total ? Math.round(30 * (est / total)) : 0;
  const ledger = (flags.ledgerBacked ? 15 : 0) + (flags.statementImported ? 10 : 0);
  const documents = (flags.licencePhoto ? 10 : 0) + Math.round(10 * completeness);
  const legal = flags.legalFormChosen ? 15 : 0;
  const consistency = Math.max(0, 10 - 5 * contradictions);

  const components: Readiness["components"] = [
    { id: "evidence", points: evidence, max: 30, note: { id: "rd.note.evidence", vars: { est, total } } },
    { id: "ledger", points: ledger, max: 25, note: { id: flags.ledgerBacked ? "rd.note.ledger" : "rd.note.noLedger" } },
    { id: "documents", points: documents, max: 20, note: { id: flags.licencePhoto ? "rd.note.docs" : "rd.note.noLicence" } },
    { id: "legal", points: legal, max: 15, note: { id: flags.legalFormChosen ? "rd.note.legal" : "rd.note.noLegal" } },
    { id: "consistency", points: consistency, max: 10, note: { id: contradictions ? "rd.note.contradictions" : "rd.note.consistent", vars: { n: contradictions } } },
  ];

  const base = `/w/${ws.id}`;
  const candidates: ReadinessAction[] = [];
  if (isVenture && !flags.ledgerBacked) candidates.push({ id: "statement", title: { id: "rd.act.statement" }, raises: 15, href: `${base}/money/import` });
  else if (isVenture && !flags.statementImported) candidates.push({ id: "statement", title: { id: "rd.act.statement" }, raises: 10, href: `${base}/money/import` });
  if (isVenture && !flags.licencePhoto) candidates.push({ id: "licence", title: { id: "rd.act.licence" }, raises: 10, href: `${base}/funding/new` });
  if (isVenture && !flags.legalFormChosen) candidates.push({ id: "legal", title: { id: "rd.act.legal" }, raises: 15, href: `${base}/talk?topic=setup` });
  if (contradictions > 0) candidates.push({ id: "contradictions", title: { id: "rd.act.contradictions", vars: { n: contradictions } }, raises: 5 * contradictions, href: `${base}/file/profile/${ws.id}-profile` });
  if (missing > 0 && total) candidates.push({ id: "missing", title: { id: "rd.act.missing", vars: { n: missing } }, raises: Math.min(10, Math.round(30 * (missing / total))), href: `${base}/talk` });
  if (completeness < 0.9 && arts.length) candidates.push({ id: "complete", title: { id: "rd.act.complete" }, raises: Math.round(10 * (0.9 - completeness)), href: `${base}/file` });

  const actions = candidates.filter((a) => a.raises > 0).sort((a, b) => b.raises - a.raises).slice(0, 3);
  const score = components.reduce((t, c) => t + c.points, 0);
  return { score, components, actions };
}

interface FieldDef {
  id: string;
  label: string;
  needs: OpportunityType[];
  /** Which artifact answers it, or a profile fact key. */
  from: { artifact: ArtifactSummary["kind"] } | { profile: string };
}

const FIELDS: FieldDef[] = [
  { id: "name", label: "ca.f.name", needs: ["grant_call", "accelerator", "tender", "loan_product", "fellowship", "investor"], from: { profile: "name" } },
  { id: "licence", label: "ca.f.licence", needs: ["grant_call", "tender", "loan_product"], from: { profile: "licence" } },
  { id: "legal", label: "ca.f.legal", needs: ["grant_call", "tender", "loan_product", "investor"], from: { profile: "legal" } },
  { id: "staff", label: "ca.f.staff", needs: ["grant_call", "loan_product"], from: { profile: "staff" } },
  { id: "finance", label: "ca.f.finance", needs: ["grant_call", "accelerator", "tender", "loan_product", "investor"], from: { artifact: "finance" } },
  { id: "impact", label: "ca.f.impact", needs: ["grant_call"], from: { artifact: "proposal" } },
  { id: "pitch", label: "ca.f.pitch", needs: ["accelerator"], from: { artifact: "accelerator" } },
  { id: "idea", label: "ca.f.idea", needs: ["fellowship"], from: { artifact: "idea" } },
];

export function commonApplicationOf(ws: WsSeed, calls: Opportunity[]): CommonApplication {
  const chosen = calls
    .filter((o) => o.eligibility.state !== "not" && o.scam.length === 0 && (["grant_call", "accelerator", "tender", "loan_product", "fellowship"] as OpportunityType[]).includes(o.type))
    .slice(0, 4);
  const { flags, profile } = ws;
  const profileStatus: Record<string, CommonField["status"]> = {
    name: flags.licencePhoto ? "established" : "unverified",
    licence: flags.licencePhoto ? "established" : "missing",
    legal: ws.legalForm ? (flags.legalFormChosen ? "established" : "unverified") : "missing",
    staff: profile.staff === undefined ? "missing" : flags.ledgerBacked ? "established" : "unverified",
  };
  const fields: CommonField[] = FIELDS.map((def) => {
    let status: CommonField["status"];
    let source: CommonField["source"];
    if ("profile" in def.from) {
      status = profileStatus[def.from.profile];
      source = { id: status === "established" ? (def.from.profile === "staff" ? "src.ledger" : "src.licence") : status === "missing" ? "ca.src.none" : "src.said" };
    } else {
      const artifactKind = def.from.artifact;
      const artifact = ws.artifacts.find((a) => a.kind === artifactKind);
      status = !artifact ? "missing" : artifact.stamps.missing + artifact.stamps.contradictory > 0 ? "unverified" : "established";
      source = artifact ? { id: "ca.src.artifact", vars: { v: artifact.title } } : { id: "ca.src.none" };
    }
    return { id: def.id, label: { id: def.label }, status, source, requiredBy: chosen.filter((o) => def.needs.includes(o.type)).map((o) => o.id) };
  }).filter((field) => field.requiredBy.length > 0);
  return { calls: chosen.map((o) => ({ id: o.id, title: o.title })), fields };
}
