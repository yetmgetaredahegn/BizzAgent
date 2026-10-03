"use client";

import Link from "next/link";

import type { ArtifactDetail } from "@/api";
import { EvidenceStamp } from "@/components/ds/evidence-stamp";
import { Panel } from "@/components/ds/page";
import { useWorkspace } from "@/components/shell/workspace-context";
import { useI18n, useMsg } from "@/i18n";

type Profile = Extract<ArtifactDetail, { kind: "profile" }>;

export function ProfileView({ artifact }: { artifact: Profile }) {
  const { t } = useI18n();
  const msg = useMsg();
  const { workspace } = useWorkspace();
  const open = artifact.rows.filter((row) => row.status !== "established").length;
  return (
    <Panel>
      <dl className="ledger-rule">
        {artifact.rows.map((row, i) => (
          <div key={i} className="grid gap-1 py-3 tablet:grid-cols-[12rem_minmax(0,1fr)_auto] tablet:items-center tablet:gap-4">
            <dt className="num text-xs tracking-wide text-muted uppercase">{msg(row.key)}</dt>
            <dd className="min-w-0 font-semibold">
              {msg(row.value)}
              {row.source && <span className="block text-sm font-normal text-muted">{msg(row.source)}</span>}
            </dd>
            <dd>
              <EvidenceStamp status={row.status} />
            </dd>
          </div>
        ))}
      </dl>
      {open > 0 && (
        <p className="mt-3 text-sm text-muted">
          {t("pf.open", { n: open })}{" "}
          <Link href={`/w/${workspace.id}/talk`} className="font-semibold text-stamp hover:underline">
            {t("pf.fixInTalk")}
          </Link>
        </p>
      )}
    </Panel>
  );
}
