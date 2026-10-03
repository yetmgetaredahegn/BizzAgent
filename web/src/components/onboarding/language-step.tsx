"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

import { api } from "@/api";
import { Composer } from "@/components/ds/composer";
import { setLang } from "@/components/language";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/format";
import { speak } from "@/lib/speech";
import type { Lang } from "@/lib/types";

import { parseLanguageIntent } from "./state";

const TILES: { lang: Lang; native: string; sample: string }[] = [
  { lang: "am", native: "አማርኛ", sample: "ሰላም" },
  { lang: "om", native: "Afaan Oromoo", sample: "Akkam" },
  { lang: "en", native: "English", sample: "Hello" },
];

export function LanguageStep() {
  const { t, lang } = useI18n();
  const router = useRouter();

  function choose(next: Lang) {
    setLang(next);
    void api.updateLanguage(next);
    router.push("/start/phone");
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[clamp(1.75rem,6vw,2.5rem)] leading-tight font-bold">{t("ob.lang.title")}</h1>
        <p className="text-muted">{t("ob.lang.sub")}</p>
      </div>
      <div role="radiogroup" aria-label={t("ob.lang.title")} className="flex flex-col gap-3">
        {TILES.map((tile) => (
          <div
            key={tile.lang}
            className={cn("rounded-sheet flex min-h-20 items-center justify-between gap-3 bg-surface p-3 pl-5 ring-1", lang === tile.lang ? "ring-2 ring-stamp" : "ring-line")}
          >
            <button
              type="button"
              role="radio"
              aria-checked={lang === tile.lang}
              lang={tile.lang}
              onClick={() => choose(tile.lang)}
              className="min-touch flex-1 py-2 text-left font-display text-[1.6rem] font-bold"
            >
              {tile.native}
            </button>
            <button
              type="button"
              onClick={() => speak(tile.sample, tile.lang)}
              aria-label={`${t("action.listen")}: ${tile.native}`}
              className="min-touch grid size-12 shrink-0 place-items-center rounded-full ring-1 ring-line-strong hover:bg-ink/5"
            >
              <Play className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
      <div>
        <p className="num mb-2 text-xs tracking-wide text-muted uppercase">{t("ob.lang.say")}</p>
        <Composer
          sample="Afaan Oromoo"
          placeholder="አማርኛ · Afaan Oromoo · English"
          onSend={(text) => {
            const detected = parseLanguageIntent(text);
            if (detected) choose(detected);
          }}
        />
      </div>
    </>
  );
}
