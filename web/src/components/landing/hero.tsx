import { ArrowRight, AudioLines, Mic, Play, Scale, ShieldCheck } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { ScoreRing } from "@/components/ui/score";
import { StatusBadge } from "@/components/ui/status-badge";
import { analyzePack } from "@/lib/analyze";
import { almaz } from "@/lib/fixtures";
import { cn, formatCompactETB } from "@/lib/format";
import { GRID_VARIANTS } from "@/lib/grid";
import type { FieldStatus } from "@/lib/types";

const WAVE = [5, 9, 14, 8, 17, 11, 6, 13, 18, 9, 15, 7, 12, 16, 8, 11, 5, 14, 9, 6, 12, 8];

export function Hero() {
  const analysis = analyzePack(almaz);
  const growth = almaz.data.applicant.company_overview.growth_indicators;

  return (
    <section className="relative overflow-hidden">
      <div
        className="grid-texture absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
        aria-hidden
      />
      <div className="absolute -top-48 -left-40 size-[38rem] rounded-full bg-brand-300/25 blur-3xl" aria-hidden />
      <div className="absolute top-24 -right-40 size-[32rem] rounded-full bg-ink-300/20 blur-3xl" aria-hidden />

      <Container className="relative grid items-center gap-12 pt-12 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pt-20 lg:pb-28">
        <div>
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-card ring-1 ring-line">
            <span className="size-1.5 rounded-full bg-brand-500" />
            For Ethiopian small businesses and the people who fund them
          </div>

          <h1 className="animate-fade-up mt-6 text-[2.55rem] leading-[1.04] font-extrabold tracking-tight text-balance text-ink [animation-delay:80ms] sm:text-6xl lg:text-[4.05rem]">
            From a voice note to a{" "}
            <span className="font-display font-medium text-brand-600 italic">fundable</span>{" "}
            proposal.
          </h1>

          <p className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted [animation-delay:160ms]">
            BizzAgent listens in Amharic, Afaan Oromo or English, reads a paper licence and a
            workshop photo, and builds a complete, honest funding application.{" "}
            <strong className="font-semibold text-ink">
              Every field it cannot establish is flagged, never guessed.
            </strong>
          </p>

          <div className="animate-fade-up mt-5 space-y-1 text-[15px] text-ink-700/80 [animation-delay:220ms]">
            <p lang="am">ከድምፅ መልዕክት እስከ ሊደገፍ የሚችል ማመልከቻ።</p>
            <p lang="om">Ergaa sagalee irraa hanga iyyata deeggarsa argachuu danda&apos;utti.</p>
          </div>

          <div className="animate-fade-up mt-8 flex flex-col gap-3 [animation-delay:280ms] sm:flex-row">
            <ButtonLink href="/apply" size="lg">
              <Mic className="size-5" aria-hidden />
              Start with your voice
            </ButtonLink>
            <ButtonLink href="/apply/almaz/pack" size="lg" variant="secondary">
              See Almaz&apos;s pack
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>

          <ul className="animate-fade-up mt-10 grid gap-3 text-sm text-muted [animation-delay:340ms] sm:grid-cols-3">
            <li className="flex items-start gap-2">
              <AudioLines className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              Works from a forwarded WhatsApp voice note
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              Every field shows its source, or that nobody knows yet
            </li>
            <li className="flex items-start gap-2">
              <Scale className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              Reviewers get a ranking they can defend
            </li>
          </ul>
        </div>

        <HeroVisual
          total={analysis.evaluation.total}
          variant={GRID_VARIANTS[analysis.evaluation.variant].name}
          salesFrom={growth[0]?.sales_etb ?? null}
          salesTo={growth[growth.length - 1]?.sales_etb ?? null}
          salesYears={`${growth[0]?.year}–${String(growth[growth.length - 1]?.year).slice(2)}`}
          completeness={Math.round(analysis.completeness * 100)}
          blocking={analysis.gaps.filter((gap) => gap.priority === "blocking").length}
        />
      </Container>
    </section>
  );
}

function FieldChip({
  section,
  label,
  value,
  status,
  source,
  className,
}: {
  section: string;
  label: string;
  value: string;
  status: FieldStatus;
  source: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-surface/95 p-3.5 shadow-lift ring-1 ring-line backdrop-blur sm:absolute sm:w-[13.5rem]",
        className,
      )}
    >
      <p className="text-[11px] font-semibold text-subtle">
        <span className="font-bold text-ink-600">{section}</span> · {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-ink">{value}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <StatusBadge status={status} size="xs" />
        <span className="truncate text-[11px] text-subtle">{source}</span>
      </div>
    </div>
  );
}

function HeroVisual({
  total,
  variant,
  salesFrom,
  salesTo,
  salesYears,
  completeness,
  blocking,
}: {
  total: number;
  variant: string;
  salesFrom: number | null;
  salesTo: number | null;
  salesYears: string;
  completeness: number;
  blocking: number;
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-[520px] sm:h-[600px]"
      aria-label="Illustration: a forwarded voice note becomes form fields, each with its evidence status"
      role="img"
    >
      <div className="pointer-events-none absolute top-24 left-40 hidden h-[340px] w-56 rounded-full bg-brand-200/40 blur-3xl sm:block" aria-hidden />

      {/* Phone */}
      <div className="relative mx-auto w-[262px] rounded-[2.6rem] bg-ink p-2.5 shadow-lift sm:absolute sm:top-2 sm:left-0 sm:mx-0">
        <div className="overflow-hidden rounded-[2.1rem] bg-[#efe9df]">
          <div className="flex items-center gap-2.5 bg-ink-800 px-4 pt-7 pb-3 text-white">
            <div className="grid size-8 place-items-center rounded-full bg-brand-500 text-xs font-bold">DT</div>
            <div className="min-w-0">
              <p className="text-sm leading-tight font-semibold">Dawit (Almaz&apos;s son)</p>
              <p className="text-[11px] text-white/60">forwarded to BizzAgent</p>
            </div>
          </div>
          <div className="space-y-3 px-3 pt-4 pb-6">
            <div className="w-[92%] rounded-2xl rounded-tl-sm bg-white p-2.5 shadow-sm">
              <p className="text-[10px] text-subtle italic">Forwarded · Afaan Oromoo</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
                  <Play className="ml-0.5 size-3.5 fill-current" aria-hidden />
                </span>
                <div className="flex h-7 flex-1 items-center gap-[2px]">
                  {WAVE.map((height, index) => (
                    <span
                      key={index}
                      className="animate-wave w-[3px] origin-center rounded-full bg-brand-600/70"
                      style={{ height: `${height + 4}px`, animationDelay: `${(index % 7) * 110}ms` }}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-1 text-right text-[10px] text-subtle">3:12</p>
            </div>
            <div className="w-[92%] rounded-2xl rounded-tl-sm bg-white p-2.5 text-[12px] leading-snug text-ink shadow-sm">
              <p className="text-[10px] text-subtle italic">Forwarded · 2 photos</p>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                <div className="grid h-14 place-items-center rounded-lg bg-saffron-100 text-[10px] font-semibold text-saffron-700">Licence</div>
                <div className="grid h-14 place-items-center rounded-lg bg-brand-100 text-[10px] font-semibold text-brand-800">Workshop</div>
              </div>
            </div>
            <div className="ml-auto w-[88%] rounded-2xl rounded-tr-sm bg-brand-50 p-2.5 text-[12px] leading-snug text-ink shadow-sm ring-1 ring-brand-100">
              <p className="text-[10px] font-semibold text-brand-700">BizzAgent</p>
              Thank you, Almaz. One question: what protects your workers from chilli dust today?
            </div>
            <div className="ml-auto w-[80%] rounded-2xl rounded-tr-sm bg-brand-50 p-2.5 text-[12px] leading-snug text-ink shadow-sm ring-1 ring-brand-100">
              Your pack is {completeness}% filled. {blocking} answers still missing.
            </div>
          </div>
        </div>
      </div>

      {/* Evidence chips: stacked under the phone on small screens, beside it from sm up */}
      <div className="mt-6 space-y-3 sm:mt-0 sm:space-y-0">
        <FieldChip
          className="sm:animate-float sm:top-10 sm:right-0"
          section="1.1"
          label="Company name"
          value="Almaz Wolde Spice Mill"
          status="established"
          source="licence photo"
        />
        <FieldChip
          className="sm:animate-float-slow sm:top-[12.5rem] sm:right-6 sm:[animation-delay:1.2s]"
          section="1.2"
          label={`Sales ${salesYears}`}
          value={`${formatCompactETB(salesFrom)} → ${formatCompactETB(salesTo)}`}
          status="unverified"
          source="her voice note"
        />
        <FieldChip
          className="sm:animate-float sm:top-[23rem] sm:right-0 sm:[animation-delay:0.6s]"
          section="1.6"
          label="Organogram"
          value="Not drawn yet"
          status="missing"
          source="ask Almaz"
        />
        <div className="flex items-center gap-3 rounded-2xl bg-ink-950 p-3 pr-5 text-white shadow-lift sm:animate-float-slow sm:absolute sm:right-10 sm:bottom-0 sm:[animation-delay:2s]">
          <div className="rounded-full bg-white p-0.5">
            <ScoreRing value={total} size={58} stroke={6} className="text-[9px]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-white/60 uppercase">Provisional score</p>
            <p className="text-sm font-semibold">{variant} · reasons per criterion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
