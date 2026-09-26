import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/format";

/** FundFlow mark: sound bars turning into the rows of a form. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <defs>
        <linearGradient id="ff-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00B2A9" />
          <stop offset="1" stopColor="#1D428A" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#ff-mark)" />
      <rect x="6.5" y="12" width="2.6" height="8" rx="1.3" fill="#fff" opacity="0.8" />
      <rect x="11" y="8.5" width="2.6" height="15" rx="1.3" fill="#fff" />
      <rect x="16.5" y="10" width="9" height="2.6" rx="1.3" fill="#fff" />
      <rect x="16.5" y="14.7" width="6.5" height="2.6" rx="1.3" fill="#fff" opacity="0.85" />
      <rect x="16.5" y="19.4" width="8" height="2.6" rx="1.3" fill="#EAA33D" />
    </svg>
  );
}

export function Logo({
  className,
  tone = "dark",
  href = "/",
}: {
  className?: string;
  tone?: "dark" | "light";
  href?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label="FundFlow home">
      <LogoMark />
      <span
        className={cn(
          "text-[19px] font-extrabold tracking-tight",
          tone === "dark" ? "text-ink" : "text-white",
        )}
      >
        Fund<span className={tone === "dark" ? "text-brand-600" : "text-brand-300"}>Flow</span>
      </span>
    </Link>
  );
}

export function SequaCredit({
  className,
  label = "Built for",
  tone = "dark",
}: {
  className?: string;
  label?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "text-[11px] font-semibold tracking-[0.12em] uppercase",
          tone === "dark" ? "text-subtle" : "text-white/60",
        )}
      >
        {label}
      </span>
      <span className={cn("inline-flex rounded-md", tone === "light" && "bg-white px-2 py-1")}>
        <Image src="/brand/sequa.png" alt="sequa gGmbH" width={711} height={219} className="h-5 w-auto" />
      </span>
    </span>
  );
}
