import type { ReactNode } from "react";

import { cn } from "@/lib/format";

/** Tag: a small mono label (type, state). `highlight` uses the one Meskel fill. */
export function Tag({
  children,
  highlight = false,
  className,
}: {
  children: ReactNode;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "num rounded-stamp inline-flex w-fit items-center px-1.5 py-px text-[11px] tracking-wide whitespace-nowrap uppercase",
        highlight ? "bg-meskel text-on-meskel font-semibold" : "text-muted ring-1 ring-line-strong",
        className,
      )}
    >
      {children}
    </span>
  );
}
