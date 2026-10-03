"use client";

import { ButtonLink } from "@/components/ui/button";
import { LogoMark, PaperClip } from "@/components/ds/logo";
import { EvidenceStamp } from "@/components/ds/evidence-stamp";
import { useI18n, type MessageId } from "@/i18n";
import type { FieldStatus } from "@/lib/types";

import { PAGE_WIDTH } from "./header";

const LINES: { label: MessageId; sub: MessageId; status: FieldStatus }[] = [
  { label: "landing.rcpt.business", sub: "landing.rcpt.saidVoice", status: "unverified" },
  { label: "landing.rcpt.staff", sub: "landing.rcpt.saidVoice", status: "unverified" },
  { label: "landing.rcpt.licence", sub: "landing.rcpt.fromPhoto", status: "established" },
  { label: "landing.rcpt.margin", sub: "landing.rcpt.calc", status: "established" },
  { label: "landing.rcpt.machinery", sub: "landing.rcpt.askNext", status: "missing" },
];

/**
 * The hero receipt "prints" the voice note as lines of facts, each with its
 * evidence stamp. A paper clip holds the licence photo; the round seal is
 * stamped on the total. The print plays once; reduced motion shows it complete.
 */
function HeroReceipt() {
  const { t } = useI18n();
  return (
    <div className="relative mx-auto w-full max-w-[420px] min-[720px]:max-w-none laptop:ml-auto laptop:max-w-[520px]">
      <PaperClip className="absolute -top-6 right-5 z-20 h-14 w-6 drop-shadow-sm" />
      <div
        aria-hidden
        className="num rounded-stamp absolute -top-2.5 -right-2 z-10 flex h-14 w-20 rotate-6 flex-col gap-1 bg-copy-yellow p-1.5 text-[8px] text-muted ring-1 ring-line-strong"
      >
        <i className="block h-[3px] w-4/5 rounded bg-line-strong" />
        <i className="block h-[3px] w-3/5 rounded bg-line-strong" />
        <i className="block h-[3px] w-[70%] rounded bg-line-strong" />
        {t("landing.rcpt.photo")}
      </div>
      <div
        className="edge-torn-bottom-lg animate-print relative bg-surface px-4 pt-4 pb-14 tablet:px-5"
        style={{ filter: "drop-shadow(0 10px 18px rgb(22 23 34 / 0.12))" }}
      >
        <div className="num flex flex-wrap justify-between gap-x-3 gap-y-0.5 border-b border-dashed border-line-strong pr-20 pb-2.5 text-xs text-muted">
          <span>{t("landing.rcpt.head")}</span>
          <span>{t("landing.rcpt.voice")}</span>
        </div>
        <ul className="ledger-rule">
          {LINES.map((line) => (
            <li key={line.label} className="flex items-center justify-between gap-3 py-2">
              <span className="min-w-0 text-[14px] leading-snug font-semibold">
                {t(line.label)}
                <span className="num block text-[11px] font-normal text-muted">{t(line.sub)}</span>
              </span>
              <EvidenceStamp status={line.status} className="text-[12px]" />
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between border-t border-ink pt-2.5 pr-20 font-semibold">
          <span>{t("landing.rcpt.ready")}</span>
          <span className="num border-b-[3px] border-double border-ink">{t("landing.rcpt.total", { a: 3, b: 5 })}</span>
        </div>
      </div>
      <LogoMark
        variant="seal"
        size={88}
        className="absolute -right-1 -bottom-5 z-20 -rotate-12 opacity-90"
      />
    </div>
  );
}

export function Hero() {
  const { t } = useI18n();
  return (
    <section className={`${PAGE_WIDTH} grid items-center gap-10 pt-8 pb-14 min-[720px]:grid-cols-2 min-[720px]:gap-12 tablet:pt-12 laptop:pt-16 laptop:pb-20 laptop:gap-20`}>
      <div>
        <h1 className="font-display text-[clamp(2.4rem,9.5vw,4.75rem)] leading-[1.02] font-bold tracking-tight">
          {/* Each sentence on its own line, so the headline never breaks mid-sentence. */}
          {t("landing.h1")
            .split(/(?<=[.።])\s+/)
            .map((sentence) => (
              <span key={sentence} className="block">
                {sentence}
              </span>
            ))}
        </h1>
        <p className="mt-5 max-w-[34rem] text-lg text-muted laptop:text-xl">{t("landing.sub")}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/start" size="lg">
            {t("landing.cta.start")}
          </ButtonLink>
          <ButtonLink href="/p/highland" size="lg" variant="secondary">
            {t("landing.cta.partners")}
          </ButtonLink>
        </div>
      </div>
      <HeroReceipt />
    </section>
  );
}
