import Link from "next/link";
import type { ComponentProps, ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/format";

type Variant = "primary" | "navy" | "secondary" | "ghost" | "light" | "white";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white shadow-[0_10px_24px_-10px_rgb(0_178_169/0.8)] hover:bg-brand-600",
  navy: "bg-ink-600 text-white shadow-[0_10px_24px_-10px_rgb(29_66_138/0.7)] hover:bg-ink-700",
  secondary: "bg-surface text-ink ring-1 ring-line-strong hover:bg-ink-50/60 hover:ring-ink-200",
  ghost: "text-ink hover:bg-ink/5",
  light: "bg-white/10 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/20",
  white: "bg-white text-brand-800 hover:bg-brand-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
