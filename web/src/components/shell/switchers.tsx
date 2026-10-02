"use client";

import { Check, ChevronDown, FlaskConical, Languages, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { api, type Persona, type WorkspaceSummary } from "@/api";
import { useQuery } from "@/api/use-query";
import { Popover } from "@/components/ds/popover";
import { Tag } from "@/components/ds/tag";
import { LANGUAGES } from "@/lib/i18n";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/format";
import { setLang } from "@/components/language";
import type { Lang } from "@/lib/types";

function homeFor(ws: WorkspaceSummary): string {
  return ws.type === "partner" ? `/p/${ws.id}` : `/w/${ws.id}`;
}

export function WorkspaceSwitcher({ current, all }: { current: WorkspaceSummary; all: WorkspaceSummary[] }) {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <Popover
      label={t("ws.switch")}
      align="left"
      className="min-w-0"
      trigger={
        <>
          <span className="min-w-0 text-left">
            <span className="block truncate font-display text-[15px] leading-tight font-semibold">{current.name}</span>
            <span className="num block text-[11px] leading-tight text-muted">{t(`ws.type.${current.type}`)}</span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden />
        </>
      }
    >
      {(close) => (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              close();
              router.push("/me/money");
            }}
            className="min-touch rounded-sheet flex items-center gap-2 bg-copy-yellow px-3 py-2 text-left text-sm font-semibold hover:brightness-95"
          >
            <Lock className="size-4" aria-hidden /> {t("ws.personal")}
          </button>
          {all.map((ws) => (
            <button
              key={ws.id}
              type="button"
              onClick={() => {
                close();
                router.push(homeFor(ws));
              }}
              className="min-touch rounded-sheet flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-ink/5"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold">{ws.name}</span>
                <Tag>{t(`ws.type.${ws.type}`)}</Tag>
              </span>
              {ws.id === current.id && <Check className="size-4 text-stamp" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}

/** Compact language menu for the shell header (the segmented switch is used on the landing page). */
export function LanguageMenu() {
  const { lang, t } = useI18n();
  const short: Record<Lang, string> = { en: "EN", am: "አማ", om: "OM" };
  return (
    <Popover
      label={`${t("action.open")}: ${LANGUAGES.find((l) => l.id === lang)?.native}`}
      trigger={
        <>
          <Languages className="size-4 text-muted" aria-hidden />
          <span className="text-sm font-semibold" lang={lang}>
            {short[lang]}
          </span>
        </>
      }
      panelClassName="tablet:w-56"
    >
      {(close) => (
        <ul role="radiogroup" className="flex flex-col gap-1">
          {LANGUAGES.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                role="radio"
                aria-checked={lang === option.id}
                lang={option.id}
                onClick={() => {
                  void api.updateLanguage(option.id);
                  setLang(option.id);
                  close();
                }}
                className={cn(
                  "min-touch rounded-sheet flex w-full items-center justify-between px-3 py-2 text-left font-semibold hover:bg-ink/5",
                  lang === option.id && "bg-ink/5",
                )}
              >
                {option.native}
                {lang === option.id && <Check className="size-4 text-stamp" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Popover>
  );
}

/** Prototype-only: switch between the demo personas. Not part of the product. */
export function PersonaSwitcher({ currentId }: { currentId: string }) {
  const router = useRouter();
  const { data: personas } = useQuery("personas", () => api.listPersonas());
  return (
    <Popover
      label="Prototype: switch demo persona"
      trigger={<FlaskConical className="size-5 text-muted" aria-hidden />}
      panelClassName="tablet:w-96"
    >
      {(close) => (
        <div className="flex flex-col gap-1">
          <p className="num px-3 pt-1 text-xs tracking-wide text-muted uppercase">Prototype · demo persona</p>
          {(personas ?? []).map((p: Persona) => (
            <button
              key={p.id}
              type="button"
              onClick={async () => {
                await api.setPersona(p.id);
                close();
                router.push(homeFor(p.workspaces[0]));
              }}
              className="min-touch rounded-sheet flex items-start justify-between gap-2 px-3 py-2 text-left hover:bg-ink/5"
            >
              <span className="min-w-0">
                <span className="block font-semibold">{p.name}</span>
                <span className="block text-xs text-muted">{p.blurb}</span>
              </span>
              {p.id === currentId && <Check className="mt-1 size-4 shrink-0 text-stamp" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}
