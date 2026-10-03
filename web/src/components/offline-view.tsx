"use client";

import { WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

/** The /offline page: what still works, and a retry. */
export function OfflineView() {
  const { t } = useI18n();
  return (
    <main className="grid flex-1 place-items-center px-4 py-20">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <WifiOff className="size-10 text-stamp" aria-hidden />
        <h1 className="font-display text-3xl font-bold">{t("off.title")}</h1>
        <p className="text-muted">{t("off.body")}</p>
        <Button className="mt-3" onClick={() => window.location.reload()}>
          {t("off.retry")}
        </Button>
      </div>
    </main>
  );
}
