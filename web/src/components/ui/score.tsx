import { cn } from "@/lib/format";

export function ScoreRing({
  value,
  max = 100,
  size = 132,
  stroke = 12,
  label,
  sublabel,
  tone = "brand",
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  tone?: "brand" | "navy" | "slate";
  className?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const share = Math.max(0, Math.min(1, value / max));
  const color =
    tone === "brand" ? "var(--color-brand-500)" : tone === "navy" ? "var(--color-ink-600)" : "#94a3b8";

  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(value)} out of ${max}${label ? `, ${label}` : ""}`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * share} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="text-[2.1em] leading-none font-bold tracking-tight text-ink tabular-nums">
          {Math.round(value)}
        </span>
        {label && <span className="mt-1 text-[0.72em] font-semibold text-muted">{label}</span>}
        {sublabel && <span className="text-[0.68em] text-subtle">{sublabel}</span>}
      </div>
    </div>
  );
}

export function ScoreBar({
  value,
  max,
  tone = "brand",
  hatched = false,
  className,
}: {
  value: number | null;
  max: number;
  tone?: "brand" | "amber" | "navy" | "rose" | "slate";
  /** Diagonal hatching marks provisional points. */
  hatched?: boolean;
  className?: string;
}) {
  const share = value == null ? 0 : Math.max(0, Math.min(1, value / max));
  const colors = {
    brand: "bg-brand-500",
    amber: "bg-amber-400",
    navy: "bg-ink-600",
    rose: "bg-rose-400",
    slate: "bg-slate-300",
  };
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-line/70", className)} aria-hidden>
      <div
        className={cn("h-full rounded-full", colors[tone])}
        style={{
          width: `${share * 100}%`,
          backgroundImage: hatched
            ? "repeating-linear-gradient(135deg, rgb(255 255 255 / 0.45) 0 4px, transparent 4px 8px)"
            : undefined,
        }}
      />
    </div>
  );
}
