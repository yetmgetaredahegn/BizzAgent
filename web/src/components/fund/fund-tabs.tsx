"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useWorkspace } from "@/components/shell/workspace-context";
import { useI18n, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";

const TABS = [
  { id: "opps", path: "opportunities" },
  { id: "proposals", path: "funding" },
  { id: "readiness", path: "readiness" },
  { id: "common", path: "common-application" },
  { id: "passport", path: "passport" },
] as const;

/** The funding hub's sub-navigation: opportunities, proposals, readiness, common application, Passport. */
export function FundTabs() {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const pathname = usePathname();
  return (
    <nav aria-label={t("fund.tabs")} className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 tablet:mx-0 tablet:px-0">
      {TABS.map((tab) => {
        const href = `/w/${workspace.id}/${tab.path}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={tab.id}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "min-touch inline-flex shrink-0 items-center rounded-full px-4 text-sm font-semibold ring-1",
              active ? "bg-stamp text-on-stamp ring-stamp" : "bg-surface text-muted ring-line-strong hover:text-ink",
            )}
          >
            {t(`fund.tab.${tab.id}` as MessageId)}
          </Link>
        );
      })}
    </nav>
  );
}
