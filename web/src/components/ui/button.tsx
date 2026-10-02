import Link from "next/link";
import type { ComponentProps, ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/format";

type Variant = "primary" | "navy" | "secondary" | "ghost" | "light" | "white" | "highlight" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,color,transform] duration-[180ms] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary: "bg-stamp text-on-stamp hover:bg-stamp-strong",
  navy: "bg-stamp text-on-stamp hover:bg-stamp-strong",
  secondary: "bg-transparent text-ink ring-1 ring-line-strong hover:bg-ink/5",
  ghost: "text-ink hover:bg-ink/5",
  light: "bg-on-stamp/10 text-on-stamp ring-1 ring-on-stamp/30 hover:bg-on-stamp/20",
  white: "bg-surface text-stamp hover:bg-paper",
  highlight: "bg-meskel text-on-meskel hover:brightness-95",
  danger: "bg-transparent text-contradictory ring-1 ring-contradictory hover:bg-contradictory/10",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-7 text-base",
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
