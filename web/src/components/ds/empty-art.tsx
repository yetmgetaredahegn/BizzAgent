import { cn } from "@/lib/format";

/** One-colour line drawings of paperwork objects, in stamp ink. No gradients, no fills. */
export type ArtName = "stamp" | "receipt" | "checklist" | "tray" | "clip";

const common = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function EmptyArt({ name, className }: { name: ArtName; className?: string }) {
  return (
    <svg viewBox="0 0 120 96" className={cn("h-24 w-30 text-stamp", className)} aria-hidden>
      {name === "stamp" && (
        <g {...common}>
          <rect x="22" y="70" width="76" height="14" rx="3" />
          <path d="M34 70v-8h52v8" />
          <path d="M50 62V40a10 10 0 1 1 20 0v22" />
          <circle cx="60" cy="22" r="8" />
          <path d="M30 90h60" strokeDasharray="2 5" />
        </g>
      )}
      {name === "receipt" && (
        <g {...common}>
          <path d="M34 10h52v70l-6.5-5-6.5 5-6.5-5-6.5 5-6.5-5-6.5 5-6.5-5-6.5 5z" />
          <path d="M44 28h32M44 40h32M44 52h20" />
          <circle cx="76" cy="60" r="0.5" />
        </g>
      )}
      {name === "checklist" && (
        <g {...common}>
          <rect x="30" y="14" width="60" height="72" rx="4" />
          <path d="M50 14v-4h20v4" />
          <path d="M42 36l4 4 8-8M42 56l4 4 8-8M42 76l4 4 8-8" />
          <path d="M60 36h20M60 56h20M60 76h12" />
        </g>
      )}
      {name === "tray" && (
        <g {...common}>
          <path d="M20 54l12-30h56l12 30v26H20z" />
          <path d="M20 54h26l4 8h20l4-8h26" />
          <path d="M44 38h32M48 46h24" />
        </g>
      )}
      {name === "clip" && (
        <g {...common}>
          <rect x="34" y="22" width="52" height="62" rx="3" />
          <path d="M46 40h28M46 52h28M46 64h16" />
          <path d="M80 8v28a8 8 0 0 1-16 0V14" />
        </g>
      )}
    </svg>
  );
}
