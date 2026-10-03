"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Page } from "@/components/ds/page";
import { useI18n, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";

import { SECTIONS, type Section } from "./sections-list";
import { AutonomySection, ConnectorsSection, InstructionsSection, LanguageSection, MemorySection, NotificationsSection } from "./sections";


const VIEW: Record<Section, () => React.ReactNode> = {
  language: () => <LanguageSection />,
  memory: () => <MemorySection />,
  autonomy: () => <AutonomySection />,
  instructions: () => <InstructionsSection />,
  connectors: () => <ConnectorsSection />,
  notifications: () => <NotificationsSection />,
};

export function SettingsScreen() {
  const { t } = useI18n();
  const params = useParams<{ section: Section }>();
  const section = SECTIONS.includes(params.section) ? params.section : "language";
  return (
    <Page title={t("st.title")}>
      <nav aria-label={t("st.title")} className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 tablet:mx-0 tablet:flex-wrap tablet:px-0">
        {SECTIONS.map((id) => (
          <Link
            key={id}
            href={`/me/settings/${id}`}
            aria-current={id === section ? "page" : undefined}
            className={cn("min-touch inline-flex shrink-0 items-center rounded-full px-4 text-sm font-semibold ring-1", id === section ? "bg-stamp text-on-stamp ring-stamp" : "bg-surface text-muted ring-line-strong hover:text-ink")}
          >
            {t(`st.tab.${id}` as MessageId)}
          </Link>
        ))}
      </nav>
      {VIEW[section]()}
    </Page>
  );
}
