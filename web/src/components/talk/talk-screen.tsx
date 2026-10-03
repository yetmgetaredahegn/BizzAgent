"use client";

import { Undo2, Volume2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { api, type Conversation, type ConversationEvent, type Msg, type TalkTopic, type Turn } from "@/api";
import { Composer, ReadBackCard } from "@/components/ds/composer";
import { CostTicket } from "@/components/ds/cost-ticket";
import { StageStatus } from "@/components/ds/states";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button } from "@/components/ui/button";
import { useI18n, useMsg } from "@/i18n";
import { cn } from "@/lib/format";
import { speak } from "@/lib/speech";

import { SheetView } from "./sheets";

const TOPICS: TalkTopic[] = ["general", "numbers", "idea", "setup", "entry"];

function AgentBubble({ text, lang }: { text: string; lang: "en" | "am" | "om" }) {
  const { t } = useI18n();
  return (
    <div className="rounded-sheet flex max-w-[92%] items-start gap-2 bg-surface px-3 py-2.5 ring-1 ring-line">
      <p className="min-w-0 flex-1 text-[15px]" lang={lang}>
        {text}
      </p>
      <button
        type="button"
        onClick={() => speak(text, lang)}
        aria-label={`${t("action.listen")}: ${text}`}
        className="min-touch -my-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink"
      >
        <Volume2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function TurnView({ turn, lang, isLastStage }: { turn: Turn; lang: "en" | "am" | "om"; isLastStage: boolean }) {
  const msg = useMsg();
  if (turn.role === "agent") return <AgentBubble text={msg(turn.msg)} lang={lang} />;
  if (turn.role === "user")
    return (
      <p className="max-w-[92%] self-end rounded-sheet px-3 py-2 text-[15px] ring-1 ring-line-strong" lang={lang}>
        {turn.text}
      </p>
    );
  return isLastStage ? (
    <StageStatus text={msg(turn.msg)} />
  ) : (
    <p className="num text-sm text-muted">{msg(turn.msg)}</p>
  );
}

export function TalkScreen() {
  const { t, lang } = useI18n();
  const msg = useMsg();
  const { workspace } = useWorkspace();
  const params = useSearchParams();
  const requested = params.get("topic");
  const topic: TalkTopic = TOPICS.includes(requested as TalkTopic) ? (requested as TalkTopic) : "general";

  const [conv, setConv] = useState<Conversation | null>(null);
  const [tab, setTab] = useState<"talk" | "sheet">("talk");
  const [seen, setSeen] = useState(0);
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const startedFor = useRef<string>("");

  const key = `${workspace.id}:${topic}`;
  useEffect(() => {
    if (startedFor.current === key) return;
    startedFor.current = key;
    let alive = true;
    api.startConversation(workspace.id, topic).then((c) => alive && setConv(c));
    return () => {
      alive = false;
      // Strict mode runs effects twice in development; allow the second run to start again.
      startedFor.current = "";
    };
  }, [key, workspace.id, topic]);

  const send = useCallback(
    async (event: ConversationEvent) => {
      if (!conv) return;
      setBusy(true);
      const next = await api.sendEvent(conv.id, event);
      setConv(next);
      setBusy(false);
    },
    [conv],
  );

  const turnCount = conv?.turns.length ?? 0;
  useEffect(() => {
    end.current?.scrollIntoView?.({ block: "end" });
  }, [turnCount, conv?.pending?.kind]);

  const sheetChanged = !!conv && conv.sheetVersion > seen && tab === "talk";
  const showSheet = () => {
    setTab("sheet");
    if (conv) setSeen(conv.sheetVersion);
  };

  const pending = conv?.pending ?? null;
  const lastStageIndex = conv ? conv.turns.map((x) => x.role).lastIndexOf("stage") : -1;

  const conversationPane = (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1 pb-2" role="log" aria-live="polite" aria-label={t("talk.tab.talk")}>
        {conv?.turns.map((turn, i) => <TurnView key={turn.id} turn={turn} lang={lang} isLastStage={i === lastStageIndex && i === conv.turns.length - 1} />)}
        {pending?.kind === "choice" && (
          <div className="flex flex-wrap gap-2 pt-1">
            {pending.options.map((option) =>
              option.href ? (
                <Link key={option.id} href={`/w/${workspace.id}/${option.href}`} className="min-touch inline-flex items-center rounded-full px-4 text-sm font-semibold ring-1 ring-line-strong hover:bg-ink/5">
                  {msg(option.label)}
                </Link>
              ) : (
                <Button key={option.id} variant="secondary" size="sm" disabled={busy} onClick={() => send({ type: "choose", id: option.id })}>
                  {msg(option.label)}
                </Button>
              ),
            )}
          </div>
        )}
        <div ref={end} />
      </div>

      <div className="flex flex-col gap-2 border-t border-line pt-3">
        {pending?.kind === "ask" && pending.why && <p className="text-sm text-muted">{msg(pending.why)}</p>}
        {pending?.kind === "readback" && (
          <ReadBackCard text={msg(pending.text)} onYes={() => send({ type: "confirm" })} onFix={() => send({ type: "fix" })} />
        )}
        {pending?.kind === "cost" && (
          <CostTicket
            estimate={{ ...pending.estimate, action: msg(pending.estimate.action) }}
            onConfirm={() => send({ type: "costConfirm" })}
            onCancel={() => send({ type: "costCancel" })}
          />
        )}
        {(pending?.kind === "ask" || (pending === null && conv?.topic === "general") || (pending?.kind === "choice" && conv?.topic === "general")) && (
          <Composer
            key={pending?.kind === "ask" ? pending.field : "free"}
            sample={pending?.kind === "ask" && pending.sample ? msg(pending.sample as Msg) : undefined}
            disabled={busy || !conv}
            onSend={(text, via) => send({ type: "text", text, via })}
          />
        )}
        {pending === null && conv && conv.topic !== "general" && (
          <Link href={`/w/${workspace.id}/talk`} className="w-fit text-sm font-semibold text-stamp hover:underline">
            {t("talk.starters")}…
          </Link>
        )}
        {conv?.canUndo && (
          <button
            type="button"
            onClick={() => send({ type: "undo" })}
            className="min-touch inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
          >
            <Undo2 className="size-4" aria-hidden /> {t("talk.undo")}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem-5rem)] w-full max-w-[1440px] flex-col px-3 pt-3 tablet:h-[calc(100dvh-3.5rem)] tablet:px-6 laptop:grid laptop:grid-cols-[minmax(22rem,26rem)_minmax(0,1fr)] laptop:gap-6 laptop:px-9 laptop:pt-5">
      {/* Below laptop: tabs. Laptop and up: the ledger spread, conversation beside the sheet. */}
      <div role="tablist" aria-label="Talk" className="mb-3 flex gap-1 self-start rounded-full p-0.5 ring-1 ring-line-strong laptop:hidden">
        {(["talk", "sheet"] as const).map((id) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => (id === "sheet" ? showSheet() : setTab("talk"))}
            className={cn("min-touch relative rounded-full px-4 text-sm font-semibold", tab === id ? "bg-stamp text-on-stamp" : "text-muted")}
          >
            {t(id === "talk" ? "talk.tab.talk" : "talk.tab.sheet")}
            {id === "sheet" && sheetChanged && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-meskel" aria-label="•" />}
          </button>
        ))}
      </div>

      <section aria-label={t("talk.tab.talk")} className={cn("min-h-0 flex-1 flex-col", tab === "talk" ? "flex" : "hidden", "laptop:flex")}>
        {conversationPane}
      </section>
      <section
        aria-label={t("talk.tab.sheet")}
        className={cn("min-h-0 flex-1 overflow-y-auto pb-6", tab === "sheet" ? "block" : "hidden", "laptop:block laptop:rounded-sheet laptop:bg-paper laptop:p-1")}
      >
        <SheetView sheet={conv?.sheet ?? null} />
      </section>
    </div>
  );
}
