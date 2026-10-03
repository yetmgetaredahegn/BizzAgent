import { cn } from "@/lib/format";

import { LOGO_SYMBOLS_HTML, LOGO_WORDMARK_VIEWBOX } from "./logo-symbols";

/**
 * Shared SVG symbols for the logo, rendered once in the root layout. Marks
 * are single-colour (currentColor); the paper clip uses --logo-knock for its
 * knock-out ring, so set it to the surface the mark sits on.
 */
export function LogoDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs dangerouslySetInnerHTML={{ __html: LOGO_SYMBOLS_HTML }} />
    </svg>
  );
}

type MarkVariant = "logo" | "seal";

/** The product logo (clipped receipt) or the document seal (round office stamp). */
export function LogoMark({
  variant = "logo",
  small = false,
  size = 32,
  className,
}: {
  variant?: MarkVariant;
  small?: boolean;
  size?: number;
  className?: string;
}) {
  const id = variant === "seal" ? "lg-B" : "lg-C";
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("shrink-0 text-stamp", className)}
      aria-hidden
    >
      <use href={`#${id}${small ? "s" : ""}`} />
    </svg>
  );
}

export function Wordmark({
  height = 24,
  lang = "latin",
  className,
}: {
  height?: number;
  lang?: "latin" | "am";
  className?: string;
}) {
  const vb = LOGO_WORDMARK_VIEWBOX[lang];
  const w = Number(vb.split(" ")[2]);
  return (
    <svg
      viewBox={vb}
      width={(w / 40) * height}
      height={height}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <use href={`#wm-${lang}`} />
    </svg>
  );
}

/** Mark + wordmark lockup. `knock` is the surface colour behind the mark. */
export function Logo({
  className,
  size = 34,
  knock = "var(--paper)",
  onInk = false,
}: {
  className?: string;
  size?: number;
  knock?: string;
  onInk?: boolean;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2.5", onInk ? "text-on-stamp" : "text-stamp", className)}
      style={{ "--logo-knock": knock } as React.CSSProperties}
      role="img"
      aria-label="BizzAgent"
    >
      <LogoMark size={size} className="text-current" />
      <Wordmark height={Math.round(size * 0.72)} />
    </span>
  );
}

/** Paper clip for "attached evidence". Position it on a relatively placed parent. */
export function PaperClip({ className, knock = "var(--surface)" }: { className?: string; knock?: string }) {
  return (
    <svg
      viewBox="0 0 14 32"
      className={cn("pointer-events-none text-stamp", className)}
      style={{ "--logo-knock": knock } as React.CSSProperties}
      aria-hidden
    >
      <use href="#clip" />
    </svg>
  );
}
