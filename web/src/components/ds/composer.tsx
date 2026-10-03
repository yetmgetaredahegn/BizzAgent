"use client";

import { Mic, Send, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useI18n } from "@/i18n";
import { cn } from "@/lib/format";

import { Button } from "../ui/button";
import { StageStatus } from "./states";

type Phase = "idle" | "listening" | "transcribing" | "editing";

/**
 * Composer = VoicePill + text input. Push-to-talk records for real (to drive
 * the level meter from real input) but in the prototype nothing is uploaded:
 * a scripted sample transcript is offered for editing, then sent.
 */
export function Composer({
  onSend,
  sample,
  placeholder,
  disabled = false,
  className,
}: {
  onSend: (text: string, via: "voice" | "text") => void;
  /** The scripted transcript used in place of real speech recognition. */
  sample?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>("idle");
  const [text, setText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>(() => Array(10).fill(0.15));
  const [viaVoice, setViaVoice] = useState(false);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef<number | null>(null);
  const ctx = useRef<AudioContext | null>(null);

  const release = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    void ctx.current?.close();
    ctx.current = null;
  }, []);

  useEffect(() => release, [release]);

  async function start() {
    setNotice(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice(t("voice.unsupported"));
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;
      const audio = new AudioContext();
      ctx.current = audio;
      const analyser = audio.createAnalyser();
      analyser.fftSize = 64;
      audio.createMediaStreamSource(media).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        setLevels(Array.from({ length: 10 }, (_, i) => Math.max(0.12, (data[i + 1] ?? 0) / 255)));
        raf.current = requestAnimationFrame(tick);
      };
      tick();
      setPhase("listening");
    } catch {
      setNotice(t("voice.micDenied"));
    }
  }

  function stop() {
    release();
    setPhase("transcribing");
    setViaVoice(true);
    window.setTimeout(() => {
      setText(sample ?? "");
      setPhase("editing");
    }, 900);
  }

  function send() {
    const value = text.trim();
    if (!value) return;
    onSend(value, viaVoice ? "voice" : "text");
    setText("");
    setPhase("idle");
    setViaVoice(false);
  }

  const busy = phase === "listening" || phase === "transcribing";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {phase === "transcribing" && <StageStatus text={t("voice.transcribing")} />}
      {phase === "editing" && <p className="text-xs font-semibold text-muted">{t("voice.edit")}</p>}
      <div className="flex items-center gap-2 rounded-full bg-surface p-1.5 pr-2 ring-1 ring-line-strong focus-within:ring-2 focus-within:ring-stamp">
        <button
          type="button"
          onClick={phase === "listening" ? stop : start}
          disabled={disabled || phase === "transcribing"}
          aria-label={phase === "listening" ? t("voice.stop") : t("voice.hold")}
          aria-pressed={phase === "listening"}
          className="min-touch grid size-11 shrink-0 place-items-center rounded-full bg-stamp text-on-stamp transition-transform active:scale-95 disabled:opacity-50"
        >
          {phase === "listening" ? <Square className="size-4 fill-current" aria-hidden /> : <Mic className="size-5" aria-hidden />}
        </button>
        {phase === "listening" ? (
          <div className="flex h-8 flex-1 items-center gap-1" aria-hidden>
            {levels.map((level, i) => (
              <i key={i} className="block w-1 rounded-full bg-stamp" style={{ height: `${Math.round(level * 100)}%` }} />
            ))}
            <span className="ml-2 text-sm text-muted">{t("voice.listening")}</span>
          </div>
        ) : (
          <input
            value={text}
            onChange={(event) => {
              setText(event.target.value);
            }}
            onKeyDown={(event) => event.key === "Enter" && send()}
            disabled={disabled || busy}
            placeholder={placeholder ?? t("voice.hold")}
            aria-label={t("voice.type")}
            className="min-h-11 min-w-0 flex-1 bg-transparent px-1 text-base outline-none placeholder:text-muted"
          />
        )}
        {!busy && (
          <Button size="sm" onClick={send} disabled={disabled || !text.trim()} aria-label={t("action.send")}>
            <Send className="size-4" aria-hidden />
          </Button>
        )}
      </div>
      {viaVoice && phase === "editing" && <p className="text-xs text-muted">{t("voice.mock")}</p>}
      {notice && (
        <p role="alert" className="text-sm text-contradictory">
          {notice}
        </p>
      )}
    </div>
  );
}

/** ReadBackCard: "You said …" with Yes / Fix it. Values enter an artifact only after Yes. */
export function ReadBackCard({
  text,
  onYes,
  onFix,
  className,
}: {
  text: string;
  onYes: () => void;
  onFix: () => void;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className={cn("rounded-sheet flex flex-col gap-2 bg-surface p-3 ring-1 ring-line-strong", className)}>
      <p className="font-semibold">{t("voice.readback", { text })}</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={onYes}>
          {t("action.yes")}
        </Button>
        <Button size="sm" variant="secondary" onClick={onFix}>
          {t("action.fix")}
        </Button>
      </div>
    </div>
  );
}
