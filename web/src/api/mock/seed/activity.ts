import type { ActivityEvent } from "../../contract";

import { daysFromToday } from "../clock";

const at = (daysAgo: number, time: string) => `${daysFromToday(-daysAgo)}T${time}:00`;

export const ACTIVITY_SEED: Record<string, ActivityEvent[]> = {
  "almaz-spices": [
    { id: "a1", at: at(6, "09:12"), agent: "concierge", action: { id: "ev.profileUpdated" }, sources: ["onboarding interview (voice)"], credits: 0 },
    { id: "a2", at: at(5, "10:40"), agent: "numbers", action: { id: "ev.marginCalculated" }, sources: ["your voice note: price and cost", "calculation: gross margin"], credits: 0 },
    { id: "a3", at: at(4, "15:03"), agent: "funding", action: { id: "ev.opportunitiesFound", vars: { n: 3 } }, sources: ["Highland Enterprise Fund call (platform)", "2 demo listings"], credits: 4, missionId: "m-almaz-funded" },
    { id: "a4", at: at(2, "11:20"), agent: "funding", action: { id: "ev.proposalDrafted" }, sources: ["your profile", "your voice notes"], credits: 9, missionId: "m-almaz-funded" },
    { id: "a5", at: at(1, "08:55"), agent: "concierge", action: { id: "ev.questionAsked" }, sources: ["gap list: machinery, organogram"], credits: 0, missionId: "m-almaz-funded" },
    { id: "a6", at: at(0, "07:30"), agent: "funding", action: { id: "ev.submissionPrepared" }, sources: ["proposal v2", "call configuration v3"], credits: 2, missionId: "m-almaz-funded" },
  ],
  "meron-garments": [
    { id: "a1", at: at(9, "14:10"), agent: "market", action: { id: "ev.marketResearched", vars: { market: "Kenya" } }, sources: ["5 sources (demo)", "knowledge pack: none yet"], credits: 21, missionId: "m-meron-market" },
    { id: "a2", at: at(6, "09:45"), agent: "numbers", action: { id: "ev.marginCalculated" }, sources: ["ledger: 6 months", "calculation: gross margin"], credits: 0 },
    { id: "a3", at: at(3, "16:00"), agent: "hiring", action: { id: "ev.jdDrafted" }, sources: ["your role description (voice)"], credits: 3, missionId: "m-meron-hire" },
    { id: "a4", at: at(1, "10:30"), agent: "market-entry", action: { id: "ev.submissionPrepared" }, sources: ["market report v2"], credits: 2, missionId: "m-meron-market" },
  ],
  "abel-studio": [
    { id: "a1", at: at(8, "10:00"), agent: "market", action: { id: "ev.marketResearched", vars: { market: "payments tooling" } }, sources: ["4 sources (demo)"], credits: 18 },
    { id: "a2", at: at(4, "13:20"), agent: "accelerator", action: { id: "ev.guideDrafted", vars: { programme: "Addis Launchpad" } }, sources: ["programme page (demo)", "your business profile"], credits: 7, missionId: "m-abel-accel" },
    { id: "a3", at: at(1, "09:00"), agent: "concierge", action: { id: "ev.questionAsked" }, sources: ["accelerator question: traction"], credits: 0, missionId: "m-abel-accel" },
  ],
  "selam-idea": [
    { id: "a1", at: at(3, "17:00"), agent: "idea", action: { id: "ev.ideaSaved", vars: { n: 2 } }, sources: ["your voice note (Amharic)"], credits: 0 },
    { id: "a2", at: at(6, "12:15"), agent: "launch", action: { id: "ev.checklistMade" }, sources: ["no verified source yet"], credits: 0 },
  ],
  "kuri-team": [
    { id: "a1", at: at(7, "11:00"), agent: "launch", action: { id: "ev.checklistMade" }, sources: ["no verified source yet"], credits: 0, missionId: "m-kuri-launch" },
    { id: "a2", at: at(2, "15:30"), agent: "idea", action: { id: "ev.ideaSaved", vars: { n: 3 } }, sources: ["team voice notes (3)"], credits: 0 },
  ],
};
