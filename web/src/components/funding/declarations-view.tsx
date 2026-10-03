"use client";

import { Check, ChevronDown, Lock, MessageCircleQuestionMark } from "lucide-react";
import { useState } from "react";

import { useCase } from "@/components/funding/case-context";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { Card } from "@/components/ui/primitives";
import { DECLARATIONS, TOTAL_DECLARATIONS, type Declaration } from "@/lib/declarations";
import { cn, formatDateTime } from "@/lib/format";
import { LANGUAGES, translate, type MessageKey } from "@/lib/i18n";
import type { DeclarationRecord, Lang } from "@/lib/types";

function DeclarationCard({
  declaration,
  index,
  record,
  applicantName,
  lang,
  onUpdate,
}: {
  declaration: Declaration;
  index: number;
  record: DeclarationRecord | undefined;
  applicantName: string;
  lang: Lang;
  onUpdate: (patch: Partial<DeclarationRecord>) => void;
}) {
  const t = (key: MessageKey) => translate(lang, key);
  const understood = record?.understood;
  const question = record?.question;
  const ticked = Boolean(record?.applicantTickedAt);
  const recordedIn = LANGUAGES.find((l) => l.id === understood?.language)?.native;
  const checkboxId = `agree-${declaration.id}`;

  return (
    <Card className="overflow-hidden">
      <div className="p-6 sm:p-7" lang={lang}>
        <p className="text-xs font-bold tracking-wider text-subtle uppercase" lang="en">
          Declaration {index + 1} of {DECLARATIONS.length}
        </p>
        <h3 className="mt-2 text-xl font-bold text-ink">{declaration.title[lang]}</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{declaration.plain[lang]}</p>

        <details className="group mt-4 rounded-xl bg-paper px-4 py-3 ring-1 ring-line">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {t("decl.official")}
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-muted" lang="en">
            {declaration.official}
          </p>
        </details>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            variant={understood ? "secondary" : "primary"}
            onClick={() => onUpdate({ understood: { language: lang, at: new Date().toISOString() } })}
          >
            <Check className="size-4" aria-hidden />
            {t("decl.understood")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onUpdate({ question: { language: lang, at: new Date().toISOString() } })}
          >
            <MessageCircleQuestionMark className="size-4" aria-hidden />
            {t("decl.question")}
          </Button>
        </div>

        {understood && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
            <Check className="size-4 shrink-0" aria-hidden />
            {t("decl.recordedUnderstood")}
            <span className="ml-auto text-xs font-normal text-emerald-700/80">
              {recordedIn} · {formatDateTime(understood.at)}
            </span>
          </p>
        )}
        {question && (
          <p className="mt-2 flex items-center gap-2 rounded-xl bg-ink-50 px-4 py-2.5 text-sm font-semibold text-ink-800 ring-1 ring-ink-200">
            <MessageCircleQuestionMark className="size-4 shrink-0" aria-hidden />
            {t("decl.recordedQuestion")}
          </p>
        )}
      </div>

      <div
        className={cn(
          "flex items-start gap-3 border-t border-dashed px-6 py-4 sm:px-7",
          ticked ? "border-emerald-200 bg-emerald-50/60" : "border-line-strong bg-paper/70",
        )}
        lang={lang}
      >
        <input
          id={checkboxId}
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 accent-ink-600 disabled:cursor-not-allowed"
          checked={ticked}
          disabled={!understood}
          onChange={(event) =>
            onUpdate({ applicantTickedAt: event.target.checked ? new Date().toISOString() : undefined })
          }
        />
        <label htmlFor={checkboxId} className={cn("min-w-0", !understood && "cursor-not-allowed")}>
          <span className="font-semibold text-ink">{t("decl.agree")}</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-subtle">
            <Lock className="size-3 shrink-0" aria-hidden />
            {understood ? t("decl.onlyYou") : t("decl.tickLocked")}
          </span>
          {ticked && (
            <span className="mt-1 block text-xs text-emerald-700" lang="en">
              Ticked by {applicantName} · {formatDateTime(record?.applicantTickedAt)}
            </span>
          )}
        </label>
      </div>
    </Card>
  );
}

export function DeclarationsView() {
  const { pack, declarations, updateDeclaration } = useCase();
  // Explanations open in the applicant's own language; the tabs switch it.
  const [lang, setLang] = useState<Lang>(pack.language);
  const t = (key: MessageKey) => translate(lang, key);
  const understood = DECLARATIONS.filter((d) => declarations[d.id]?.understood).length;
  const ticked = DECLARATIONS.filter((d) => declarations[d.id]?.applicantTickedAt).length;
  const applicantName = pack.persona?.name ?? "the applicant";

  return (
    <div>
      <PageTitle title={<span lang={lang}>{t("decl.title")}</span>} lead={<span lang={lang}>{t("decl.subtitle")}</span>}>
        <div role="radiogroup" aria-label="Explanation language" className="flex gap-1 self-start rounded-full bg-surface p-1 ring-1 ring-line sm:self-auto">
          {LANGUAGES.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={option.id === lang}
              lang={option.id}
              onClick={() => setLang(option.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                option.id === lang ? "bg-ink-600 text-white" : "text-muted hover:text-ink",
              )}
            >
              {option.native}
            </button>
          ))}
        </div>
      </PageTitle>

      <div className="mb-8 grid grid-cols-2 gap-3">
        <Card className="p-4 sm:p-5">
          <p className="text-3xl font-bold tabular-nums">
            {understood}
            <span className="text-lg text-subtle">/{DECLARATIONS.length}</span>
          </p>
          <p className="mt-1 text-sm text-muted">explained and understood</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <p className="text-3xl font-bold tabular-nums">
            {ticked}
            <span className="text-lg text-subtle">/{DECLARATIONS.length}</span>
          </p>
          <p className="mt-1 text-sm text-muted">ticked by {applicantName}, never by BizzAgent</p>
        </Card>
      </div>

      <div className="space-y-5">
        {DECLARATIONS.map((declaration, index) => (
          <DeclarationCard
            key={declaration.id}
            declaration={declaration}
            index={index}
            record={declarations[declaration.id]}
            applicantName={applicantName}
            lang={lang}
            onUpdate={(patch) => updateDeclaration(declaration.id, patch)}
          />
        ))}
      </div>

      <p className="mt-8 text-sm leading-relaxed text-subtle">
        These are {DECLARATIONS.length} of the {TOTAL_DECLARATIONS} declarations in the form, with
        illustrative wording until the official text is loaded. The other{" "}
        {TOTAL_DECLARATIONS - DECLARATIONS.length} are explained with a field officer. The Amharic
        and Afaan Oromo explanations are a first draft awaiting review by native speakers.
      </p>
    </div>
  );
}
