"use client";

import Link from "next/link";

import { Wordmark } from "@/components/ds/logo";
import { useI18n } from "@/i18n";

import { PAGE_WIDTH } from "./header";

export function LandingFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line">
      <div className={`${PAGE_WIDTH} flex flex-col gap-3 py-8 text-sm text-muted tablet:flex-row tablet:items-center tablet:justify-between`}>
        <span className="flex items-center gap-2 text-stamp">
          <Wordmark height={18} />
          <span lang="am" className="font-ethiopic text-muted">
            ቢዝኤጀንት
          </span>
        </span>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/v/demo" className="hover:text-ink hover:underline">
            {t("landing.footer.verify")}
          </Link>
          <Link href="/start" className="hover:text-ink hover:underline">
            {t("landing.footer.privacy")}
          </Link>
          <Link href="/start" className="hover:text-ink hover:underline">
            {t("landing.footer.terms")}
          </Link>
        </nav>
        <p className="max-w-md">{t("notice.notAdvice")}</p>
      </div>
    </footer>
  );
}
