import type { ReactNode } from "react";

import { cn } from "@/lib/format";

/** Page: content width, gutters and an optional title row for app screens. */
export function Page({
  title,
  eyebrow,
  actions,
  children,
  className,
  wide = false,
}: {
  title?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={cn("mx-auto flex w-full flex-col gap-5 px-4 py-5 tablet:px-6 laptop:px-9 laptop:py-7", wide ? "max-w-[1440px]" : "max-w-[1180px]", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <p className="num text-xs tracking-wide text-muted uppercase">{eyebrow}</p>}
            {title && <h1 className="font-display text-[clamp(1.5rem,5vw,2rem)] leading-tight font-bold">{title}</h1>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/** Panel: a plain sheet for grouped content. Use sparingly: tables and rows beat cards. */
export function Panel({ children, className, title, aside }: { children: ReactNode; className?: string; title?: ReactNode; aside?: ReactNode }) {
  return (
    <section className={cn("rounded-sheet bg-surface p-4 ring-1 ring-line", className)}>
      {(title || aside) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="num text-xs tracking-wide text-muted uppercase">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}
