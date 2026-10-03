"use client";

import { useRouter } from "next/navigation";

import type { WorkspaceType } from "@/api";
import { useI18n, type MessageId } from "@/i18n";

import { patchOnboarding } from "./state";

const PATHS: WorkspaceType[] = ["explorer", "team", "business", "collective", "partner"];

export function PathStep() {
  const { t } = useI18n();
  const router = useRouter();

  function choose(path: WorkspaceType) {
    patchOnboarding({ path, legalForm: undefined, partnerKind: undefined });
    router.push(path === "explorer" || path === "team" ? "/start/interview" : "/start/form");
  }

  return (
    <>
      <h1 className="font-display text-[clamp(1.75rem,6vw,2.5rem)] leading-tight font-bold">{t("ob.path.title")}</h1>
      <div role="radiogroup" aria-label={t("ob.path.title")} className="flex flex-col gap-3">
        {PATHS.map((path) => (
          <button
            key={path}
            type="button"
            role="radio"
            aria-checked={false}
            onClick={() => choose(path)}
            className="rounded-sheet min-touch flex flex-col items-start gap-0.5 bg-surface p-4 text-left ring-1 ring-line transition-shadow hover:shadow-sheet hover:ring-line-strong"
          >
            <span className="font-display text-lg font-semibold">{t(`ob.path.${path}` as MessageId)}</span>
            <span className="text-sm text-muted">{t(`ob.path.${path}.d` as MessageId)}</span>
          </button>
        ))}
      </div>
    </>
  );
}
