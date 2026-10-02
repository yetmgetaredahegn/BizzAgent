"use client";

import { useCallback } from "react";

import { useLang } from "@/components/language";
import type { Lang } from "@/lib/types";

import { account } from "./messages/account";
import { artifacts } from "./messages/artifacts";
import { common } from "./messages/common";
import { home } from "./messages/home";
import { inbox } from "./messages/inbox";
import { missions } from "./messages/missions";
import { money } from "./messages/money";
import { landing } from "./messages/landing";
import { onboarding } from "./messages/onboarding";
import { opps } from "./messages/opps";
import { shell } from "./messages/shell";
import { talk } from "./messages/talk";
import { trust } from "./messages/trust";

const AREAS = [common, landing, shell, home, onboarding, talk, inbox, missions, artifacts, opps, trust, money, account];

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;
export type MessageId = keyof UnionToIntersection<(typeof AREAS)[number]["en"]>;

const TABLE: Record<Lang, Record<string, string>> = { en: {}, am: {}, om: {} };
for (const area of AREAS) {
  for (const lang of ["en", "am", "om"] as const) Object.assign(TABLE[lang], area[lang]);
}

export type Vars = Record<string, string | number>;

export function translate(lang: Lang, id: MessageId, vars?: Vars): string {
  const raw = TABLE[lang][id] ?? TABLE.en[id] ?? id;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = vars[key];
    if (value === undefined) return `{${key}}`;
    // "@talk.skill.numbers" means: translate that message and insert it.
    if (typeof value === "string" && value.startsWith("@")) return translate(lang, value.slice(1) as MessageId);
    return String(value);
  });
}

export function useI18n() {
  const lang = useLang();
  const t = useCallback((id: MessageId, vars?: Vars) => translate(lang, id, vars), [lang]);
  return { t, lang };
}

/** Translates a `Msg` (message id + variables) returned by the API. */
export function useMsg() {
  const { t } = useI18n();
  return useCallback(
    (msg: { id: string; vars?: Vars } | string) => (typeof msg === "string" ? msg : t(msg.id as MessageId, msg.vars)),
    [t],
  );
}

export const ALL_AREAS = AREAS;
