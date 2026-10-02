import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/format";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl bg-surface shadow-card ring-1 ring-line", className)}
      {...props}
    />
  );
}

type Tone = "neutral" | "brand" | "navy" | "saffron" | "green" | "amber" | "rose" | "slate";

const tones: Record<Tone, string> = {
  neutral: "bg-paper text-muted ring-line",
  brand: "bg-brand-50 text-brand-800 ring-brand-200",
  navy: "bg-navy-50 text-navy-700 ring-navy-200",
  saffron: "bg-saffron-50 text-saffron-700 ring-saffron-200",
  green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs font-bold tracking-[0.14em] text-brand-700 uppercase",
        className,
      )}
      {...props}
    />
  );
}

const calloutTones = {
  info: { className: "bg-navy-50 text-navy-800 ring-navy-200", Icon: Info },
  success: { className: "bg-emerald-50 text-emerald-900 ring-emerald-200", Icon: CircleCheck },
  warn: { className: "bg-amber-50 text-amber-900 ring-amber-200", Icon: TriangleAlert },
  error: { className: "bg-rose-50 text-rose-900 ring-rose-200", Icon: CircleAlert },
};

export function Callout({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: keyof typeof calloutTones;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const { className: toneClass, Icon } = calloutTones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn("flex gap-3 rounded-xl p-4 text-sm ring-1 ring-inset", toneClass, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="leading-relaxed opacity-90">{children}</div>}
      </div>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">
        {title}
      </h2>
      {lead && <p className="mt-4 text-lg leading-relaxed text-pretty text-muted">{lead}</p>}
    </div>
  );
}

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}
