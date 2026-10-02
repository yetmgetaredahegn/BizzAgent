"use client";

import { useCallback } from "react";

import { useLang } from "@/components/language";
import type { Lang } from "@/lib/types";

import { common } from "./messages/common";
import { home } from "./messages/home";
import { landing } from "./messages/landing";
import { onboarding } from "./messages/onboarding";
import { shell } from "./messages/shell";

const AREAS = [common, landing, shell, home, onboarding];

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
  return vars ? raw.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`)) : raw;
}

export function useI18n() {
  const lang = useLang();
  const t = useCallback((id: MessageId, vars?: Vars) => translate(lang, id, vars), [lang]);
  return { t, lang };
}

/** Translates a `Msg` (message id + variables) returned by the API. */
export function useMsg() {
  const { t } = useI18n();
  return useCallback((msg: { id: string; vars?: Vars }) => t(msg.id as MessageId, msg.vars), [t]);
}

export const ALL_AREAS = AREAS;
