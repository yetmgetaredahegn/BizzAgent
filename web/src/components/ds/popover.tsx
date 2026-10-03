"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/format";

/**
 * Popover: a button that opens a panel. Closes on Escape and outside click.
 * On phones the panel is a full-width card under the header; from tablet up it
 * hangs from the trigger.
 */
export function Popover({
  label,
  trigger,
  children,
  align = "right",
  className,
  panelClassName,
}: {
  /** Accessible name of the trigger button. */
  label: string;
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  className?: string;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onDown = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="min-touch rounded-sheet flex items-center gap-2 px-2 hover:bg-ink/5"
      >
        {trigger}
      </button>
      {open && (
        <div
          id={id}
          className={cn(
            "rounded-sheet fixed inset-x-3 top-16 z-50 max-h-[70dvh] overflow-y-auto bg-surface p-2 shadow-sheet ring-1 ring-line",
            "tablet:absolute tablet:inset-x-auto tablet:top-full tablet:mt-2 tablet:w-80",
            align === "right" ? "tablet:right-0" : "tablet:left-0",
            panelClassName,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
