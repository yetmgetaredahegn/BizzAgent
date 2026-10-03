"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { LogoMark } from "@/components/ds/logo";
import { LanguageMenu } from "@/components/shell/switchers";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";

import { onboardingStore } from "./state";

export function stepsFor(path: string | null): string[] {
  if (path === "partner") return ["", "phone", "path", "form", "interview"];
  if (path === "business" || path === "collective") return ["", "phone", "path", "form", "interview", "context", "review"];
  return ["", "phone", "path", "interview", "context", "review"];
}

/** Full-screen onboarding frame: one question per screen, a progress row and always a way out. */
export function OnboardingFrame({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const state = useStore(onboardingStore);
  const steps = stepsFor(state.path);
  const current = pathname.replace(/^\/start\/?/, "").split("/")[0];
  const index = Math.max(steps.indexOf(current), 0);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 pt-4 tablet:px-6">
        <Link href="/" aria-label="BizzAgent">
          <LogoMark size={34} />
        </Link>
        <div className="flex items-center gap-2">
          <span className="num text-xs text-muted" aria-label={t("ob.step", { n: index + 1, m: steps.length })}>
            {t("ob.step", { n: index + 1, m: steps.length })}
          </span>
          <LanguageMenu />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-2xl gap-1.5 px-4 pt-3 tablet:px-6" aria-hidden>
        {steps.map((step, i) => (
          <span key={step} className={cn("h-1 flex-1 rounded-full", i <= index ? "bg-stamp" : "bg-line")} />
        ))}
      </div>
      <main id="main" className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 tablet:px-6 tablet:py-12">
        {children}
      </main>
    </div>
  );
}
