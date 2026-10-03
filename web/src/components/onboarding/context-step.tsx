"use client";

import { Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CarbonSheet } from "@/components/ds/carbon";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useStore } from "@/lib/store";

import { extractCandidates, onboardingStore, patchOnboarding } from "./state";

export function ContextStep() {
  const { t } = useI18n();
  const router = useRouter();
  const state = useStore(onboardingStore);
  const [text, setText] = useState(state.importText);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const prompt = t("ob.ctx.prompt");

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be refused; the prompt stays selectable on the page.
    }
  }

  function review() {
    const candidates = extractCandidates(text);
    if (candidates.length === 0) {
      setError(true);
      return;
    }
    patchOnboarding({ importText: text, candidates });
    router.push("/start/review");
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[clamp(1.75rem,6vw,2.5rem)] leading-tight font-bold">{t("ob.ctx.title")}</h1>
        <p className="text-muted">{t("ob.ctx.sub")}</p>
      </div>

      <ol className="flex flex-col gap-5">
        <li className="flex flex-col gap-2">
          <h2 className="font-semibold">{t("ob.ctx.step1")}</h2>
          <CarbonSheet role="file" edgeLabel="PROMPT">
            <p className="text-[15px] select-all">{prompt}</p>
            <Button size="sm" variant="secondary" onClick={copy} className="mt-3 w-fit">
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              {copied ? t("ob.ctx.copied") : t("ob.ctx.copy")}
            </Button>
          </CarbonSheet>
        </li>
        <li>
          <h2 className="font-semibold">{t("ob.ctx.step2")}</h2>
        </li>
        <li className="flex flex-col gap-2">
          <label htmlFor="import-text" className="font-semibold">
            {t("ob.ctx.step3")}
          </label>
          <textarea
            id="import-text"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError(false);
            }}
            rows={7}
            placeholder={t("ob.ctx.paste")}
            aria-invalid={error}
            aria-describedby={error ? "import-error" : undefined}
            className="rounded-sheet w-full bg-surface p-3 text-base ring-1 ring-line-strong outline-none focus:ring-2 focus:ring-stamp"
          />
          {error && (
            <p id="import-error" role="alert" className="text-sm text-contradictory">
              {t("ob.ctx.empty")}
            </p>
          )}
        </li>
      </ol>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={review}>
          {t("ob.ctx.review")}
        </Button>
        <Button size="lg" variant="ghost" onClick={() => router.push("/start/review")}>
          {t("ob.ctx.skip")}
        </Button>
      </div>
    </>
  );
}
