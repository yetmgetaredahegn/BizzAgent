"use client";

import { ArrowRight, Camera, FileText, LoaderCircle, Lock, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FileDrop, type PickedFile } from "@/components/apply/file-drop";
import { setLang, useLang, useT } from "@/components/language";
import { Button, ButtonLink } from "@/components/ui/button";
import { Callout, Card, Container, Eyebrow } from "@/components/ui/primitives";
import { ApiError, processApplication } from "@/lib/api";
import { DEMO_CASE_IDS, getDemoPack } from "@/lib/fixtures";
import { cn } from "@/lib/format";
import { LANGUAGES } from "@/lib/i18n";
import { declarationStore, liveSessionStore, useStore } from "@/lib/store";

async function sampleFile(path: string, name: string): Promise<PickedFile> {
  const response = await fetch(path);
  const blob = await response.blob();
  const file = new File([blob], name, { type: blob.type || "image/jpeg" });
  return { file, url: URL.createObjectURL(file) };
}

export function IntakeScreen() {
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const session = useStore(liveSessionStore);
  const [licence, setLicence] = useState<PickedFile | null>(null);
  const [workshop, setWorkshop] = useState<PickedFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSamples() {
    setError(null);
    const [l, w] = await Promise.all([
      sampleFile("/samples/licence-sample.jpg", "licence-sample.jpg"),
      sampleFile("/samples/workshop-sample.jpg", "workshop-sample.jpg"),
    ]);
    if (licence) URL.revokeObjectURL(licence.url);
    if (workshop) URL.revokeObjectURL(workshop.url);
    setLicence(l);
    setWorkshop(w);
  }

  async function submit() {
    if (!licence || !workshop) return;
    setBusy(true);
    setError(null);
    try {
      const response = await processApplication(licence.file, workshop.file);
      // The check reports only which files passed; no applicant data.
      liveSessionStore.set({
        language: lang,
        startedAt: new Date().toISOString(),
        documents: {
          licence: response.files.license,
          workshop: response.files.workshop,
          checked: true,
        },
        interview: null,
        lastTranscript: null,
      });
      declarationStore.set((book) => ({ ...book, live: {} }));
      router.push("/apply/interview");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong while checking the documents.");
      setBusy(false);
    }
  }

  return (
    <Container className="py-10 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div lang={lang}>
          <Eyebrow>{t("intake.eyebrow")}</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t("intake.title")}</h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-muted">{t("intake.subtitle")}</p>

          {session && (
            <Callout tone="info" title="You have an application in progress" className="mt-6">
              <div className="mt-2 flex flex-wrap gap-2">
                <ButtonLink href="/apply/interview" size="sm">Continue the interview</ButtonLink>
                <ButtonLink href="/apply/live/pack" size="sm" variant="secondary">View the pack</ButtonLink>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    liveSessionStore.set(null);
                    declarationStore.set((book) => ({ ...book, live: {} }));
                  }}
                >
                  <RotateCcw className="size-4" aria-hidden /> Start over
                </Button>
              </div>
            </Callout>
          )}

          <section className="mt-10" aria-labelledby="language-choice">
            <h2 id="language-choice" className="font-semibold text-ink">{t("intake.language")}</h2>
            <div role="radiogroup" aria-labelledby="language-choice" className="mt-3 grid gap-3 sm:grid-cols-3">
              {LANGUAGES.map((option) => {
                const active = option.id === lang;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setLang(option.id)}
                    className={cn(
                      "rounded-2xl px-5 py-4 text-left ring-2 transition-colors",
                      active ? "bg-ink-600 text-white ring-ink-600" : "bg-surface text-ink ring-line hover:ring-ink-200",
                    )}
                  >
                    <span lang={option.id} className="block text-lg font-bold">{option.native}</span>
                    <span className={cn("text-xs", active ? "text-white/70" : "text-subtle")} lang="en">{option.english}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-10 grid gap-6 sm:grid-cols-2" aria-label="Photos">
            <FileDrop
              id="licence"
              icon={<FileText className="size-4 text-ink-600" aria-hidden />}
              label={t("intake.licence")}
              hint={t("intake.licenceHint")}
              value={licence}
              onChange={setLicence}
              pickLabel={t("intake.pick")}
              replaceLabel={t("intake.replace")}
            />
            <FileDrop
              id="workshop"
              icon={<Camera className="size-4 text-ink-600" aria-hidden />}
              label={t("intake.workshop")}
              hint={t("intake.workshopHint")}
              value={workshop}
              onChange={setWorkshop}
              pickLabel={t("intake.pick")}
              replaceLabel={t("intake.replace")}
            />
          </section>

          <button
            type="button"
            onClick={loadSamples}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            <Sparkles className="size-4" aria-hidden /> {t("intake.samples")}
          </button>

          {error && (
            <Callout tone="error" title="The documents could not be checked" className="mt-6">
              <p>{error}</p>
              <p className="mt-2">
                No backend running?{" "}
                <Link href="/apply/almaz/pack" className="font-semibold underline">
                  Explore a demo case
                </Link>{" "}
                instead.
              </p>
            </Callout>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" onClick={submit} disabled={!licence || !workshop || busy}>
              {busy ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <ArrowRight className="size-5" aria-hidden />}
              {busy ? t("intake.checking") : t("intake.submit")}
            </Button>
            <p className="flex items-center gap-1.5 text-xs text-subtle" lang="en">
              <Lock className="size-3.5" aria-hidden /> Photos go only to the BizzAgent service to be checked.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="p-6">
            <p className="text-xs font-bold tracking-wider text-subtle uppercase">What happens next</p>
            <ol className="mt-4 space-y-4 text-sm">
              {[
                ["Document check", "The licence photo is read to confirm it is a business licence."],
                ["Voice interview", "Short spoken questions. Answer by recording or upload a WhatsApp voice note."],
                ["Your pack", "Every answer is kept with its source. What is still missing is listed, never guessed."],
              ].map(([title, text], index) => (
                <li key={title} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{index + 1}</span>
                  <div>
                    <p className="font-semibold text-ink">{title}</p>
                    <p className="text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
          <Card className="p-6">
            <p className="text-xs font-bold tracking-wider text-subtle uppercase">Or explore a finished pack</p>
            <ul className="mt-3 divide-y divide-line">
              {DEMO_CASE_IDS.map((id) => {
                const pack = getDemoPack(id);
                return (
                  <li key={id}>
                    <Link href={`/apply/${id}/pack`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-brand-700">
                      <span>
                        <span className="block font-semibold">{pack?.persona?.name}</span>
                        <span className="text-xs text-subtle">{pack?.persona?.role}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
