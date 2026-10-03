"use client";

import { Play } from "lucide-react";

import { CarbonStack } from "@/components/ds/carbon";
import { CostTicket } from "@/components/ds/cost-ticket";
import { PaperClip } from "@/components/ds/logo";
import { Tag } from "@/components/ds/tag";
import { setLang } from "@/components/language";
import { ButtonLink } from "@/components/ui/button";
import { useI18n, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";
import { speak } from "@/lib/speech";
import type { Lang } from "@/lib/types";

import { PAGE_WIDTH } from "./header";

function Section({
  id,
  title,
  children,
  className,
}: {
  id?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line">
      <div className={cn(PAGE_WIDTH, "flex flex-col gap-6 py-10 tablet:py-14 laptop:py-16", className)}>
        {title && <h2 className="font-display text-[clamp(1.6rem,5vw,2.25rem)] leading-tight font-bold">{title}</h2>}
        {children}
      </div>
    </section>
  );
}

export function How() {
  const { t } = useI18n();
  const steps = [1, 2, 3] as const;
  return (
    <Section id="how" title={t("landing.how.title")}>
      <ol className="grid border-t-2 border-ink min-[720px]:grid-cols-3 min-[720px]:gap-8 min-[720px]:border-t-0">
        {steps.map((n) => (
          <li
            key={n}
            className="grid grid-cols-[2.75rem_minmax(0,1fr)] content-start gap-x-3 border-b border-line py-4 min-[720px]:grid-cols-1 min-[720px]:gap-y-2 min-[720px]:border-t-2 min-[720px]:border-b-0 min-[720px]:border-ink"
          >
            <span className="num text-xl font-semibold text-stamp">{n}</span>
            <div>
              <h3 className="font-display text-xl font-semibold">{t(`landing.how.${n}.t` as MessageId)}</h3>
              <p className="mt-1 text-muted">{t(`landing.how.${n}.d` as MessageId)}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Compare() {
  const { t } = useI18n();
  const rows = [1, 2, 3, 4] as const;
  const key = (n: number, c: "k" | "a" | "b") => t(`landing.cmp.${n}.${c}` as MessageId);
  return (
    <Section title={t("landing.cmp.title")}>
      <table className="hidden w-full border-collapse text-left tablet:table">
        <thead>
          <tr className="num text-xs tracking-wide text-muted uppercase">
            <th className="w-1/4 py-2 pr-4" />
            <th className="w-[37.5%] py-2 pr-4 font-semibold">{t("landing.cmp.col.chat")}</th>
            <th className="w-[37.5%] py-2 font-semibold text-stamp">{t("landing.cmp.col.biz")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n} className="border-t border-line align-top">
              <th scope="row" className="py-3.5 pr-4 font-semibold">
                {key(n, "k")}
              </th>
              <td className="py-3.5 pr-4 text-muted">{key(n, "a")}</td>
              <td className="py-3.5 font-semibold">{key(n, "b")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ledger-rule tablet:hidden">
        {rows.map((n) => (
          <div key={n} className="py-3.5">
            <h3 className="font-semibold">{key(n, "k")}</h3>
            <p className="mt-1 text-sm text-muted">
              <span className="num mr-1 text-xs uppercase">{t("landing.cmp.col.chat")}</span> {key(n, "a")}
            </p>
            <p className="mt-1 text-sm font-semibold">
              <span className="num mr-1 text-xs font-normal text-stamp uppercase">{t("landing.cmp.col.biz")}</span>{" "}
              {key(n, "b")}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Stories() {
  const { t } = useI18n();
  const stories = [1, 2, 3] as const;
  return (
    <Section title={t("landing.stories.title")}>
      <div className="grid gap-7 pt-3 min-[720px]:grid-cols-3 min-[720px]:gap-6">
        {stories.map((n) => (
          <article
            key={n}
            className={cn(
              "rounded-stamp relative flex flex-col gap-2 bg-surface px-4 pt-5 pb-4 ring-1 ring-line",
              n === 2 && "min-[720px]:rotate-[0.6deg]",
              n === 3 && "min-[720px]:-rotate-[0.5deg]",
            )}
          >
            <PaperClip className="absolute -top-3 left-4 h-9 w-4" />
            <h3 className="font-display text-lg font-semibold">{t(`landing.stories.${n}.n` as MessageId)}</h3>
            <p className="text-muted">{t(`landing.stories.${n}.t` as MessageId)}</p>
            <Tag className="mt-1">{t("tag.fictional")}</Tag>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function Partners() {
  const { t } = useI18n();
  return (
    <Section id="partners">
      <div className="grid items-center gap-8 min-[720px]:grid-cols-2 min-[720px]:gap-14">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-[clamp(1.6rem,5vw,2.25rem)] leading-tight font-bold">
            {t("landing.partners.title")}
          </h2>
          <p className="max-w-xl text-muted">{t("landing.partners.text")}</p>
          <ButtonLink href="/p/highland" variant="secondary" className="w-fit">
            {t("landing.partners.cta")}
          </ButtonLink>
        </div>
        <CarbonStack className="max-w-sm">
          <strong>{t("landing.partners.card")}</strong>
          <p className="mt-1 text-sm text-muted">{t("landing.partners.card2")}</p>
        </CarbonStack>
      </div>
    </Section>
  );
}

export function Pricing() {
  const { t } = useI18n();
  return (
    <Section id="pricing">
      <div className="grid items-center gap-8 min-[720px]:grid-cols-2 min-[720px]:gap-14">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-[clamp(1.6rem,5vw,2.25rem)] leading-tight font-bold">
            {t("landing.pricing.title")}
          </h2>
          <p className="max-w-xl text-muted">{t("landing.pricing.text")}</p>
        </div>
        <CostTicket
          className="max-w-md"
          estimate={{ action: t("landing.pricing.action"), creditsMin: 18, creditsMax: 24, balanceAfter: 176, capRemaining: 300 }}
        />
      </div>
    </Section>
  );
}

const TILES: { lang: Lang; native: string; sample: string }[] = [
  { lang: "am", native: "አማርኛ", sample: "ሰላም" },
  { lang: "om", native: "Afaan Oromoo", sample: "Akkam" },
  { lang: "en", native: "English", sample: "Hello" },
];

export function LanguageTiles() {
  const { t, lang } = useI18n();
  return (
    <Section title={t("landing.lang.title")}>
      <div className="grid gap-3 min-[720px]:grid-cols-3">
        {TILES.map((tile) => (
          <div
            key={tile.lang}
            className={cn(
              "rounded-sheet flex min-h-20 items-center justify-between gap-3 bg-surface p-4 ring-1",
              lang === tile.lang ? "ring-2 ring-stamp" : "ring-line",
            )}
          >
            <button
              type="button"
              onClick={() => setLang(tile.lang)}
              lang={tile.lang}
              aria-pressed={lang === tile.lang}
              className="min-touch flex-1 text-left font-display text-2xl font-bold"
            >
              {tile.native}
            </button>
            <button
              type="button"
              onClick={() => speak(tile.sample, tile.lang)}
              aria-label={`${t("action.listen")}: ${tile.native}`}
              className="min-touch grid size-11 shrink-0 place-items-center rounded-full ring-1 ring-line-strong hover:bg-ink/5"
            >
              <Play className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}
