"use client";

import { Mic, RotateCcw, Square, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/format";

export interface Recording {
  blob: Blob;
  filename: string;
  url: string;
}

const EXTENSIONS: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
};

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4", "audio/webm"].find((type) =>
    MediaRecorder.isTypeSupported(type),
  );
}

function guessAudioType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "opus" || ext === "ogg") return "audio/ogg";
  if (ext === "m4a" || ext === "aac") return "audio/mp4";
  if (ext === "mp3") return "audio/mpeg";
  if (ext === "wav") return "audio/wav";
  return "audio/webm";
}

export function AudioRecorder({
  value,
  onChange,
  disabled,
  labels,
}: {
  value: Recording | null;
  onChange: (value: Recording | null) => void;
  disabled?: boolean;
  labels: { record: string; stop: string; retake: string; upload: string };
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const latest = useRef<Recording | null>(value);

  useEffect(() => {
    latest.current = value;
  }, [value]);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      recorder.current?.stream.getTracks().forEach((track) => track.stop());
      if (latest.current) URL.revokeObjectURL(latest.current.url);
    },
    [],
  );

  function replace(next: Recording | null) {
    if (value) URL.revokeObjectURL(value.url);
    onChange(next);
  }

  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("This browser cannot record audio. Upload a voice note instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const media = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      media.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      media.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (timer.current) clearInterval(timer.current);
        setRecording(false);
        const type = (media.mimeType || "audio/webm").split(";")[0];
        const blob = new Blob(chunks, { type });
        replace({ blob, filename: `answer.${EXTENSIONS[type] ?? "webm"}`, url: URL.createObjectURL(blob) });
      };
      recorder.current = media;
      media.start();
      setSeconds(0);
      setRecording(true);
      timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Microphone permission was refused. Allow it, or upload a voice note instead.");
    }
  }

  function stop() {
    recorder.current?.stop();
  }

  function upload(file: File | undefined) {
    if (!file) return;
    // WhatsApp .opus files often arrive without a MIME type; the backend needs audio/*.
    const blob = file.type.startsWith("audio/") ? file : new File([file], file.name, { type: guessAudioType(file.name) });
    replace({ blob, filename: file.name, url: URL.createObjectURL(blob) });
  }

  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-3">
      {recording ? (
        <div className="flex items-center gap-4 rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
          <span className="relative grid size-12 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/40" aria-hidden />
            <span className="relative grid size-12 place-items-center rounded-full bg-rose-500 text-white">
              <Mic className="size-5" aria-hidden />
            </span>
          </span>
          <p className="font-semibold text-rose-800 tabular-nums" aria-live="polite">
            {time}
          </p>
          <Button onClick={stop} variant="secondary" className="ml-auto">
            <Square className="size-4 fill-current" aria-hidden /> {labels.stop}
          </Button>
        </div>
      ) : value ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-paper p-4 ring-1 ring-line sm:flex-row sm:items-center">
          <audio controls src={value.url} className="h-10 w-full min-w-0 flex-1" />
          <Button onClick={() => replace(null)} variant="ghost" size="sm" disabled={disabled}>
            <RotateCcw className="size-4" aria-hidden /> {labels.retake}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-500 px-6 py-5 text-lg font-semibold text-white shadow-[0_14px_30px_-14px_rgb(0_178_169/0.9)] transition-colors hover:bg-brand-600 disabled:opacity-50",
          )}
        >
          <span className="grid size-10 place-items-center rounded-full bg-white/20">
            <Mic className="size-5" aria-hidden />
          </span>
          {labels.record}
        </button>
      )}

      {!recording && !value && (
        <label className="flex cursor-pointer items-center justify-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800">
          <Upload className="size-4" aria-hidden />
          {labels.upload}
          <input
            type="file"
            accept="audio/*,.opus,.ogg,.m4a,.mp3,.wav"
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              upload(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      )}
      {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
    </div>
  );
}
