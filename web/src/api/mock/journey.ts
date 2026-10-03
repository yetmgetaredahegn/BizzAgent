/*
 * Journey planner (prototype copy of the pure rules that live in
 * backend/src/bizzagent/agents/journey.py). Next actions are deterministic:
 * driven by gaps, approvals and deadlines, at most 3, each with a reason.
 */

import type { LegalForm, NextAction, WorkspaceType } from "../contract";

export interface WsFlags {
  licencePhoto: boolean;
  ledgerBacked: boolean;
  statementImported: boolean;
  ideaClarified: boolean;
  legalFormChosen: boolean;
  interviewsDone: boolean;
  pendingApprovals: number;
  profileGaps: number;
  exportInterest: boolean;
  hiringDraft: boolean;
  acceleratorFit: boolean;
  readiness: number;
  funderName: string;
}

interface Rule {
  id: string;
  priority: number;
  when: (ws: { id: string; type: WorkspaceType; legalForm?: LegalForm }, f: WsFlags) => boolean;
  build: (id: string, f: WsFlags) => NextAction;
}

const isVenture = (type: WorkspaceType) => type !== "partner";
const isIdeaStage = (type: WorkspaceType) => type === "explorer" || type === "team";

const RULES: Rule[] = [
  {
    id: "approve",
    priority: 100,
    when: (_ws, f) => f.pendingApprovals > 0,
    build: (id, f) => ({
      id: "approve",
      title: { id: "act.approve", vars: { funder: f.funderName } },
      why: { id: "act.approve.why" },
      href: `/w/${id}/inbox`,
      skill: "funding",
      highlight: true,
    }),
  },
  {
    id: "licence",
    priority: 90,
    when: (ws, f) => ws.type === "business" && ws.legalForm !== "informal" && !f.licencePhoto,
    build: (id) => ({
      id: "licence",
      title: { id: "act.licence" },
      why: { id: "act.licence.why", vars: { n: 3, m: 2 } },
      href: `/w/${id}/funding/new`,
      skill: "funding",
    }),
  },
  {
    id: "clarify",
    priority: 90,
    when: (ws, f) => isIdeaStage(ws.type) && !f.ideaClarified,
    build: (id) => ({
      id: "clarify",
      title: { id: "act.clarify" },
      why: { id: "act.clarify.why" },
      href: `/w/${id}/talk?topic=idea`,
      skill: "idea",
    }),
  },
  {
    id: "hire",
    priority: 82,
    when: (_ws, f) => f.hiringDraft,
    build: (id) => ({
      id: "hire",
      title: { id: "act.hire" },
      why: { id: "act.hire.why" },
      href: `/w/${id}/team`,
      skill: "hiring",
    }),
  },
  {
    id: "interviews",
    priority: 85,
    when: (ws, f) => isIdeaStage(ws.type) && f.ideaClarified && !f.interviewsDone,
    build: (id) => ({
      id: "interviews",
      title: { id: "act.interviews" },
      why: { id: "act.interviews.why" },
      href: `/w/${id}/talk?topic=validation`,
      skill: "idea",
    }),
  },
  {
    id: "legalForm",
    priority: 80,
    when: (ws, f) => isIdeaStage(ws.type) && !f.legalFormChosen,
    build: (id) => ({
      id: "legalForm",
      title: { id: "act.legalForm" },
      why: { id: "act.legalForm.why" },
      href: `/w/${id}/talk?topic=setup`,
      skill: "setup",
    }),
  },
  {
    id: "accelerator",
    priority: 78,
    when: (_ws, f) => f.acceleratorFit,
    build: (id) => ({
      id: "accelerator",
      title: { id: "act.accelerator" },
      why: { id: "act.accelerator.why" },
      href: `/w/${id}/opportunities`,
      skill: "accelerator",
    }),
  },
  {
    id: "export",
    priority: 75,
    when: (_ws, f) => f.exportInterest,
    build: (id) => ({
      id: "export",
      title: { id: "act.export" },
      why: { id: "act.export.why" },
      href: `/w/${id}/talk?topic=entry`,
      skill: "entry",
    }),
  },
  {
    id: "margin",
    priority: 70,
    when: (ws, f) => ws.type === "business" && !f.ledgerBacked,
    build: (id) => ({
      id: "margin",
      title: { id: "act.margin" },
      why: { id: "act.margin.why" },
      href: `/w/${id}/talk?topic=numbers`,
      skill: "numbers",
    }),
  },
  {
    id: "statement",
    priority: 65,
    when: (ws, f) => ws.type === "business" && !f.statementImported,
    build: (id) => ({
      id: "statement",
      title: { id: "act.statement" },
      why: { id: "act.statement.why" },
      href: `/w/${id}/money/import`,
      skill: "money",
    }),
  },
  {
    id: "profile",
    priority: 60,
    when: (ws, f) => isVenture(ws.type) && f.profileGaps > 0,
    build: (id, f) => ({
      id: "profile",
      title: { id: "act.profile" },
      why: { id: "act.profile.why", vars: { n: f.profileGaps } },
      href: `/w/${id}/file`,
      skill: "concierge",
    }),
  },
  {
    id: "mission",
    priority: 50,
    when: (ws, f) => ws.type === "business" && f.readiness >= 40,
    build: (id, f) => ({
      id: "mission",
      title: { id: "act.mission" },
      why: { id: "act.mission.why", vars: { score: f.readiness } },
      href: `/w/${id}/missions`,
      skill: "missions",
    }),
  },
];

export function nextBestActions(
  ws: { id: string; type: WorkspaceType; legalForm?: LegalForm },
  flags: WsFlags,
  limit = 3,
): NextAction[] {
  return RULES.filter((rule) => rule.when(ws, flags))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
    .map((rule) => rule.build(ws.id, flags));
}
