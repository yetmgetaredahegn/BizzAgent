"use client";

import { ArrowRight, CircleCheck, LoaderCircle, Mic, Send, Volume2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AudioRecorder, type Recording } from "@/components/funding/audio-recorder";
import { useLang, useT } from "@/components/language";
import { useWorkspace } from "@/components/shell/workspace-context";
import { LogoMark } from "@/components/site/brand";
import { Button, ButtonLink } from "@/components/ui/button";
import { Callout, Card, Container, Eyebrow } from "@/components/ui/primitives";
import { ScoreBar } from "@/components/ui/score";
import { StatusBadge } from "@/components/ui/status-badge";
import { ApiError, questionAudioUrl, startInterview, submitInterviewAnswer } from "@/lib/api";
import { FIELD_BY_KEY } from "@/lib/form-schema";
import { INTERVIEW_FIELD_KEYS } from "@/lib/live-pack";
import { liveSessionStore, useStore } from "@/lib/store";

function Bubble({ from, children }: { from: "bizzagent" | "you"; children: React.ReactNode }) {
  const t = useT();
  if (from === "bizzagent") {
    return (
      <div className="flex gap-3">
        <LogoMark className="size-8 shrink-0" />
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface px-4 py-3 text-[15px] shadow-card ring-1 ring-line">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-row-reverse gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink-600 text-[11px] font-bold text-white">
        {t("interview.you")}
      </span>
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-ink-600 px-4 py-3 text-[15px] text-white">{children}</div>
    </div>
  );
}

export function InterviewScreen() {
  const t = useT();
  const { workspace } = useWorkspace();
  const root = `/w/${workspace.id}/funding`;
  const lang = useLang();
  const session = useStore(liveSessionStore);
  const [busy, setBusy] = useState<"idle" | "starting" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState<Recording | null>(null);

  if (!session) {
    return (
      <Container className="py-16">
        <Card className="mx-auto max-w-lg p-8 text-center">
          <Mic className="mx-auto size-8 text-brand-600" aria-hidden />
          <h1 className="mt-4 text-2xl font-bold">Start with your photos</h1>
          <p className="mt-2 text-muted">The interview begins after the licence and workshop photos are checked.</p>
          <ButtonLink href={`${root}/new`} className="mt-6">
            Go to step 1 <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </Card>
      </Container>
    );
  }

  const interview = session.interview;
  const fieldIds = Object.keys(INTERVIEW_FIELD_KEYS);
  const completed = interview?.completed_fields.length ?? 0;
  const done = Boolean(interview && !interview.current_question);
  const audio = interview ? questionAudioUrl(interview.audio_url, interview.history.length) : null;

  async function begin() {
    setBusy("starting");
    setError(null);
    try {
      const state = await startInterview();
      liveSessionStore.set((s) => (s ? { ...s, interview: state } : s));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start the interview.");
    } finally {
      setBusy("idle");
    }
  }

  async function send() {
    if (!interview || !recording) return;
    setBusy("sending");
    setError(null);
    try {
      const response = await submitInterviewAnswer(interview, recording.blob, recording.filename);
      liveSessionStore.set((s) => (s ? { ...s, interview: response.state, lastTranscript: response.transcript } : s));
      URL.revokeObjectURL(recording.url);
      setRecording(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send the answer.");
    } finally {
      setBusy("idle");
    }
  }

  return (
    <Container className="py-10 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div lang={lang}>
          <Eyebrow>{t("interview.eyebrow")}</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t("interview.title")}</h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-muted">{t("interview.subtitle")}</p>
          <Callout tone="info" className="mt-5">{t("interview.englishNote")}</Callout>

          <div className="mt-8 space-y-4" aria-live="polite">
            {interview?.history.map((turn, index) => (
              <div key={index} className="space-y-3">
                <Bubble from="bizzagent">{turn.question}</Bubble>
                <Bubble from="you">“{turn.transcript}”</Bubble>
              </div>
            ))}

            {interview?.current_question && (
              <Bubble from="bizzagent">
                <p className="text-xs font-semibold text-brand-700">
                  {t("interview.question")} {completed + 1} / {fieldIds.length}
                </p>
                <p className="mt-1 font-medium text-ink">{interview.current_question.question}</p>
                {audio && (
                  <div className="mt-3 flex items-center gap-2">
                    <Volume2 className="size-4 shrink-0 text-subtle" aria-hidden />
                    <audio key={audio} controls src={audio} className="h-9 w-full" />
                  </div>
                )}
              </Bubble>
            )}

            {done && (
              <Card className="p-6 text-center">
                <CircleCheck className="mx-auto size-8 text-emerald-600" aria-hidden />
                <p className="mt-3 text-lg font-bold">{t("interview.done")}</p>
                <ButtonLink href={`${root}/live/pack`} className="mt-5">
                  {t("interview.build")} <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
              </Card>
            )}
          </div>

          {!interview && (
            <Button size="lg" className="mt-6" onClick={begin} disabled={busy !== "idle"}>
              {busy === "starting" ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Mic className="size-5" aria-hidden />}
              {t("interview.start")}
            </Button>
          )}

          {interview?.current_question && (
            <div className="mt-6 space-y-3">
              <AudioRecorder
                value={recording}
                onChange={setRecording}
                disabled={busy !== "idle"}
                labels={{
                  record: t("interview.record"),
                  stop: t("interview.stop"),
                  retake: t("interview.retake"),
                  upload: t("interview.upload"),
                }}
              />
              {recording && (
                <Button size="lg" className="w-full sm:w-auto" onClick={send} disabled={busy !== "idle"}>
                  {busy === "sending" ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Send className="size-5" aria-hidden />}
                  {busy === "sending" ? t("interview.sending") : t("interview.send")}
                </Button>
              )}
            </div>
          )}

          {error && (
            <Callout tone="error" title="Something went wrong" className="mt-6">
              {error}{" "}
              <Link href={`${root}/almaz/pack`} className="font-semibold underline">Explore a demo case</Link> while the service is unavailable.
            </Callout>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <p className="text-xs font-bold tracking-wider text-subtle uppercase">What BizzAgent has heard</p>
            <div className="mt-3 flex items-center gap-3">
              <ScoreBar value={completed} max={fieldIds.length} />
              <span className="text-sm font-semibold whitespace-nowrap tabular-nums">
                {completed}/{fieldIds.length}
              </span>
            </div>
            <ul className="mt-5 space-y-3">
              {fieldIds.map((id) => {
                const key = INTERVIEW_FIELD_KEYS[id];
                const heard = interview?.completed_fields.includes(id);
                return (
                  <li key={id} className="flex items-center justify-between gap-3 text-sm">
                    <span className={heard ? "font-medium text-ink" : "text-muted"}>{FIELD_BY_KEY[key]?.label}</span>
                    <StatusBadge status={heard ? "unverified" : "missing"} size="xs" localized />
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-subtle" lang="en">
              Spoken answers stay “unverified” until a document backs them. The rest of the form is
              listed as gaps in your pack.
            </p>
            {interview && (
              <ButtonLink href={`${root}/live/pack`} variant="secondary" size="sm" className="mt-4 w-full">
                View pack so far
              </ButtonLink>
            )}
          </Card>
        </aside>
      </div>
    </Container>
  );
}
