"use client";

import Link from "next/link";

import { Page, Panel } from "@/components/ds/page";
import { EmptyState } from "@/components/ds/states";
import { Tag } from "@/components/ds/tag";
import { casesFor } from "@/components/funding/cases";
import { useWorkspace } from "@/components/shell/workspace-context";
import { ButtonLink } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { getDemoPack } from "@/lib/fixtures";
import { liveSessionStore, useStore } from "@/lib/store";

/** The funding module's home: your proposals, and a way to start one from a voice interview. */
export function FundingIndex() {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const session = useStore(liveSessionStore);
  const root = `/w/${workspace.id}/funding`;
  const demos = casesFor(workspace.id).filter((id) => id !== "live");

  return (
    <Page eyebrow={workspace.name} title={t("fund.title")} actions={<ButtonLink href={`${root}/new`}>{t("fund.start")}</ButtonLink>}>
      <p className="max-w-2xl text-muted">{t("fund.sub")}</p>
      {demos.length === 0 && !session ? (
        <EmptyState
          art="receipt"
          title={t("fund.empty.title")}
          body={t("fund.empty.body")}
          action={<ButtonLink href={`${root}/new`}>{t("fund.start")}</ButtonLink>}
        />
      ) : (
        <Panel title={t("fund.proposals")}>
          <ul className="ledger-rule">
            {demos.map((id) => {
              const pack = getDemoPack(id);
              return (
                <li key={id} className="py-3 first:pt-0 last:pb-0">
                  <Link href={`${root}/${id}/pack`} className="group flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0">
                      <strong className="block leading-snug group-hover:underline">{pack?.data.applicant.company_profile.company_name}</strong>
                      <span className="text-sm text-muted">{t("fund.demoCase")}</span>
                    </span>
                    <Tag highlight>{t("fund.demo")}</Tag>
                  </Link>
                </li>
              );
            })}
            {session && (
              <li className="py-3 last:pb-0">
                <Link href={`${root}/live/pack`} className="group flex flex-wrap items-center justify-between gap-2">
                  <strong className="leading-snug group-hover:underline">{t("fund.yourApplication")}</strong>
                  <Tag>{t("fund.live")}</Tag>
                </Link>
              </li>
            )}
          </ul>
        </Panel>
      )}
    </Page>
  );
}
