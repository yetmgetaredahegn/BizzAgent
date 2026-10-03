/*
 * Fictional seeds for the wallet, team, consent and settings areas. The price
 * list, providers and amounts are invented for the prototype: real provider terms
 * and prices are TODO(source needed) until each payment adapter is verified.
 */

import type { AutonomySkill, ConsentGrant, Member, MemoryItem, NotificationSettings, TopUp, WalletView } from "../contract";
import { daysFromToday } from "./clock";

export const BIRR_PER_CREDIT = 4;

export const PRICE_LIST: WalletView["price"] = {
  version: "2026-10 (demo)",
  effective: daysFromToday(-2),
  birrPerCredit: BIRR_PER_CREDIT,
  items: [
    { action: { id: "price.voice" }, unit: { id: "price.unit.minute" }, credits: 1 },
    { action: { id: "price.explain" }, unit: { id: "price.unit.page" }, credits: 2 },
    { action: { id: "price.research" }, unit: { id: "price.unit.run" }, credits: 20 },
    { action: { id: "price.proposal" }, unit: { id: "price.unit.run" }, credits: 9 },
    { action: { id: "price.exportDoc" }, unit: { id: "price.unit.file" }, credits: 2 },
    { action: { id: "price.exportSheet" }, unit: { id: "price.unit.file" }, credits: 1 },
    { action: { id: "price.watch" }, unit: { id: "price.unit.week" }, credits: 1 },
  ],
};

export interface WalletState {
  cap: number;
  lowAlert: number;
  topups: TopUp[];
}

export const WALLET_SEED: Record<string, WalletState> = {
  almaz: { cap: 300, lowAlert: 20, topups: [{ id: "tu1", at: `${daysFromToday(-20)}T10:05:00`, provider: "telebirr", credits: 100, birr: 400 }] },
  meron: { cap: 600, lowAlert: 50, topups: [{ id: "tu1", at: `${daysFromToday(-14)}T09:30:00`, provider: "card", credits: 500, birr: 2000 }] },
  abel: { cap: 300, lowAlert: 30, topups: [{ id: "tu1", at: `${daysFromToday(-9)}T16:20:00`, provider: "chapa", credits: 200, birr: 800 }] },
  selam: { cap: 100, lowAlert: 10, topups: [] },
};

const member = (id: string, name: string, role: Member["role"], signatory: boolean, status: Member["status"] = "active"): Member => ({ id, name, role, signatory, status });

export const TEAM_SEED: Record<string, { members: Member[]; consents: ConsentGrant[] }> = {
  "almaz-spices": {
    members: [member("u1", "Almaz Wolde", "owner", true), member("u2", "Dawit Wolde", "helper", false)],
    consents: [
      {
        id: "c1",
        grantee: "Dawit Wolde",
        scope: { id: "consent.helper" },
        artifacts: ["Business profile", "Berbere margin"],
        expiresAt: daysFromToday(30),
        revoked: false,
        log: [
          { at: `${daysFromToday(-2)}T18:10:00`, what: { id: "consent.log.forward" } },
          { at: `${daysFromToday(-1)}T07:45:00`, what: { id: "consent.log.read" } },
        ],
      },
    ],
  },
  "meron-garments": {
    members: [
      member("u1", "Meron Tadesse", "owner", true),
      member("u2", "Kidus Alemu", "co_founder", true),
      member("u3", "Hana Bekele", "manager", false),
      member("u4", "Tigist Haile", "finance", false),
      member("u5", "Samuel Girma", "member", false, "invited"),
    ],
    consents: [
      {
        id: "c1",
        grantee: "Bridge Advisors (demo)",
        scope: { id: "consent.advisor" },
        artifacts: ["Growth plan 2019 EC"],
        expiresAt: daysFromToday(45),
        revoked: false,
        log: [{ at: `${daysFromToday(-5)}T11:00:00`, what: { id: "consent.log.comment" } }],
      },
    ],
  },
  "abel-studio": {
    members: [member("u1", "Abel Kebede", "owner", true)],
    consents: [
      {
        id: "c1",
        grantee: "Rift Angels (demo)",
        scope: { id: "consent.viewer" },
        artifacts: ["Mobile-payments tooling: market report"],
        expiresAt: daysFromToday(14),
        revoked: false,
        log: [{ at: `${daysFromToday(-3)}T14:20:00`, what: { id: "consent.log.read" } }],
      },
    ],
  },
  "selam-idea": { members: [member("u1", "Selam Mekonnen", "owner", true)], consents: [] },
  "kuri-team": {
    members: [member("u1", "Biruk Lemma", "owner", true), member("u2", "Lensa Tolera", "co_founder", true), member("u3", "Nardos Abebe", "co_founder", false)],
    consents: [],
  },
};

/** Skills a person can set an autonomy level for. Legal-adjacent and submitting skills stop below L3. */
export const AUTONOMY_SEED: AutonomySkill[] = [
  { id: "setup", level: 0, max: 2 },
  { id: "funding", level: 1, max: 2 },
  { id: "opportunities", level: 1, max: 3 },
  { id: "numbers", level: 1, max: 3 },
  { id: "market", level: 1, max: 3 },
  { id: "hiring", level: 1, max: 2 },
  { id: "money", level: 1, max: 3 },
];

const mem = (id: string, topic: MemoryItem["topic"], text: string, source: string, status: MemoryItem["status"], daysAgo: number): MemoryItem => ({
  id,
  topic,
  text,
  source: { id: source },
  status,
  learnedAt: daysFromToday(-daysAgo),
});

export const MEMORY_SEED: Record<string, MemoryItem[]> = {
  almaz: [
    mem("k1", "business", "I grind berbere and shiro in Bekoji and sell to shops in Bekoji and Asella.", "mem.src.interview", "unverified", 6),
    mem("k2", "people", "Eight people work with me, six of them women.", "mem.src.interview", "unverified", 6),
    mem("k3", "people", "My son Dawit helps me with phone and paperwork.", "mem.src.talk", "unverified", 4),
    mem("k4", "goals", "I want a second grinder because the first one overheats.", "mem.src.talk", "unverified", 4),
    mem("k5", "preferences", "I prefer Afaan Oromo for voice and Amharic for documents.", "mem.src.settings", "established", 6),
  ],
  meron: [
    mem("k1", "business", "We make school and hospital uniforms in Hawassa with 25 staff.", "mem.src.interview", "established", 20),
    mem("k2", "goals", "We want to sell uniforms in Kenya and hire a production supervisor.", "mem.src.talk", "unverified", 8),
    mem("k3", "people", "Kidus is my co-founder; Hana runs the factory floor.", "mem.src.talk", "unverified", 8),
    mem("k4", "preferences", "Send me a weekly summary on Sunday evening.", "mem.src.settings", "established", 12),
  ],
  abel: [
    mem("k1", "business", "I run a one-person software studio in Addis building payment tools.", "mem.src.interview", "established", 12),
    mem("k2", "goals", "I want to join an accelerator this year.", "mem.src.talk", "unverified", 7),
    mem("k3", "preferences", "Keep answers short and in English.", "mem.src.settings", "established", 12),
  ],
  selam: [
    mem("k1", "goals", "I want to teach maths by voice to grade 9 students.", "mem.src.interview", "unverified", 4),
    mem("k2", "preferences", "Amharic first, English for technical words.", "mem.src.settings", "established", 4),
  ],
};

export const NOTIFICATIONS_DEFAULT: NotificationSettings = { web: true, weekly: true, quiet: { from: "21:00", to: "07:00" } };

/** Pulls candidate memories out of text pasted from another assistant: one fact per line, labelled when it can be. */
export function candidatesFrom(text: string): { topic: MemoryItem["topic"]; text: string }[] {
  const topics: [RegExp, MemoryItem["topic"]][] = [
    [/^(goal|want|plan|aim)/i, "goals"],
    [/^(team|staff|people|partner|cofounder|co-founder|family)/i, "people"],
    [/^(prefer|language|style|tone)/i, "preferences"],
  ];
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s\-*•\d.)]+/, "").trim())
    .filter((line) => line.length >= 8 && line.length <= 240)
    .slice(0, 12)
    .map((line) => {
      const label = /^([A-Za-z ]{3,20}):\s*(.+)$/.exec(line);
      const body = label ? label[2] : line;
      const topic = topics.find(([pattern]) => pattern.test(label ? label[1] : line))?.[1] ?? "business";
      return { topic, text: body };
    });
}
