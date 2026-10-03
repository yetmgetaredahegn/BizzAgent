"use client";

import { Compass } from "lucide-react";

import { LogoMark } from "@/components/ds/logo";
import { ButtonLink } from "@/components/ui/button";
import { useI18n } from "@/i18n";

/** The 404: it says what happened and gives one way back. It never guesses where you meant to go. */
export function NotFoundView() {
  const { t } = useI18n();
  return (
    <main className="grid flex-1 place-items-center px-4 py-20">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <LogoMark size={44} className="text-stamp" />
        <Compass className="mt-4 size-9 text-stamp" aria-hidden />
        <h1 className="font-display text-3xl font-bold">{t("nf.title")}</h1>
        <p className="text-muted">{t("nf.body")}</p>
        <ButtonLink href="/" className="mt-3">
          {t("nf.home")}
        </ButtonLink>
      </div>
    </main>
  );
}
