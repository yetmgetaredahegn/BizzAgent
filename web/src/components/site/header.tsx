"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LanguageSwitch } from "@/components/language";
import { Logo } from "@/components/site/brand";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/format";

const LANDING_LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#honesty", label: "Honesty" },
  { href: "/#personas", label: "Applicants" },
  { href: "/#reviewers", label: "Reviewers" },
];

const APP_LINKS = [
  { href: "/apply", label: "Apply", match: "/apply" },
  { href: "/apply/almaz/pack", label: "Demo packs", match: "/apply/" },
  { href: "/review", label: "Reviewer", match: "/review" },
];

export function SiteHeader({ mode = "landing" }: { mode?: "landing" | "app" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = mode === "landing" ? LANDING_LINKS : APP_LINKS;

  const isActive = (link: { href: string; match?: string }) => {
    if (!link.match) return false;
    if (link.href === "/apply") return pathname === "/apply" || pathname === "/apply/interview";
    if (link.match === "/apply/") return pathname.startsWith("/apply/") && pathname !== "/apply/interview";
    return pathname.startsWith(link.match);
  };

  return (
    <header className="print-hidden sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                isActive(link) ? "bg-ink-50 text-ink-700" : "text-muted hover:text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitch className="hidden lg:inline-flex" />
          {mode === "landing" ? (
            <ButtonLink href="/apply" size="sm" className="hidden sm:inline-flex">
              Start an application
            </ButtonLink>
          ) : (
            <ButtonLink href="/review" size="sm" variant="secondary" className="hidden sm:inline-flex">
              Reviewer dashboard
            </ButtonLink>
          )}
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-ink hover:bg-ink/5 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-paper px-4 pt-2 pb-5 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line/70 py-3 text-base font-medium text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <LanguageSwitch />
            <ButtonLink href="/apply" size="sm" onClick={() => setOpen(false)}>
              Start an application
            </ButtonLink>
            <ButtonLink href="/review" size="sm" variant="secondary" onClick={() => setOpen(false)}>
              Reviewer dashboard
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
