import type { ReactNode } from "react";

import { cn } from "@/lib/format";

export type CarbonRole = "original" | "draft" | "file";

const ROLE: Record<CarbonRole, { bg: string; edge: string }> = {
  original: { bg: "bg-surface", edge: "ORIGINAL" },
  draft: { bg: "bg-copy-pink", edge: "DRAFT COPY" },
  file: { bg: "bg-copy-yellow", edge: "FILE COPY" },
};

/** CarbonSheet: a document surface tinted by role, with a text edge label (never tint alone). */
export function CarbonSheet({
  role = "original",
  edgeLabel,
  className,
  children,
  active = false,
}: {
  role?: CarbonRole;
  /** Localised edge label; defaults to the English role name. */
  edgeLabel?: string;
  className?: string;
  children: ReactNode;
  active?: boolean;
}) {
  const r = ROLE[role];
  return (
    <section
      className={cn(
        "rounded-sheet relative p-4 pr-8 text-ink",
        r.bg,
        role === "original" && "ring-1 ring-line",
        active && "shadow-sheet",
        className,
      )}
    >
      <span
        className="num absolute top-3 right-1 text-[11px] tracking-[0.14em] text-muted [writing-mode:vertical-rl]"
        aria-hidden
      >
        {edgeLabel ?? r.edge}
      </span>
      {children}
    </section>
  );
}

/** CarbonStack: up to two offset layers behind a sheet to show a draft and a file copy exist. */
export function CarbonStack({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative pr-4 pb-4", className)}>
      <div className="rounded-stamp bg-copy-yellow absolute inset-0 translate-x-3 translate-y-3" aria-hidden />
      <div className="rounded-stamp bg-copy-pink absolute inset-0 translate-x-1.5 translate-y-1.5" aria-hidden />
      <div className="rounded-stamp relative bg-surface p-4 ring-1 ring-line">{children}</div>
    </div>
  );
}
