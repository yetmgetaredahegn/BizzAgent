"use client";

import Link from "next/link";

import { Logo } from "@/components/ds/logo";
import { LanguageSwitch } from "@/components/language";
import { ButtonLink } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export const PAGE_WIDTH = "mx-auto w-full max-w-[1440px] px-4 tablet:px-8 laptop:px-12 desktop:px-16";

export function LandingHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm supports-[backdrop-filter]:bg-paper/85">
      <div className={`${PAGE_WIDTH} flex h-16 items-center justify-between gap-3`}>
        <Link href="/" aria-label="BizzAgent" className="rounded-stamp">
          <Logo size={34} />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 text-[15px] font-semibold laptop:flex">
          <a href="#how" className="hover:text-stamp">
            {t("landing.nav.how")}
          </a>
          <a href="#partners" className="hover:text-stamp">
            {t("landing.nav.partners")}
          </a>
          <a href="#pricing" className="hover:text-stamp">
            {t("landing.nav.pricing")}
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitch />
          <ButtonLink href="/start" size="sm" className="hidden tablet:inline-flex">
            {t("landing.cta.start")}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
