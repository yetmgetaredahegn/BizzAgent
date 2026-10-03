"use client";

import { Camera, ImageUp, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/format";

export interface PickedFile {
  file: File;
  url: string;
}

export function FileDrop({
  id,
  label,
  hint,
  value,
  onChange,
  pickLabel,
  replaceLabel,
  icon,
}: {
  id: string;
  label: ReactNode;
  hint: ReactNode;
  value: PickedFile | null;
  onChange: (value: PickedFile | null) => void;
  pickLabel: string;
  replaceLabel: string;
  icon?: ReactNode;
}) {
  const [dragging, setDragging] = useState(false);
  const latest = useRef<PickedFile | null>(value);

  useEffect(() => {
    latest.current = value;
  }, [value]);

  // Release the preview URL when the picker unmounts.
  useEffect(() => () => {
    if (latest.current) URL.revokeObjectURL(latest.current.url);
  }, []);

  function pick(file: File | undefined) {
    if (!file) return;
    if (value) URL.revokeObjectURL(value.url);
    onChange({ file, url: URL.createObjectURL(file) });
  }

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 font-semibold text-ink">
        {icon}
        {label}
      </p>
      <label
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          pick(event.dataTransfer.files[0]);
        }}
        className={cn(
          "group relative flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-5 text-center transition-colors",
          dragging ? "border-brand-500 bg-brand-50" : value ? "border-transparent bg-ink" : "border-line-strong bg-surface hover:border-brand-400 hover:bg-brand-50/40",
        )}
      >
        {value ? (
          <>
            <Image src={value.url} alt="" fill unoptimized className="object-cover opacity-80" />
            <span className="relative mt-auto inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink shadow">
              <RefreshCw className="size-3.5" aria-hidden /> {replaceLabel}
            </span>
            <span className="relative mt-2 max-w-full truncate text-xs text-white/90">{value.file.name}</span>
          </>
        ) : (
          <>
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition-transform group-hover:scale-105">
              <Camera className="size-5" aria-hidden />
            </span>
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
              <ImageUp className="size-4" aria-hidden /> {pickLabel}
            </span>
            <span className="mt-1 text-xs text-subtle">{hint}</span>
          </>
        )}
        <input
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            pick(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
    </div>
  );
}
