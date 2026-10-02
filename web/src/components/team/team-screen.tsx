"use client";

import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { api, type Role } from "@/api";
import { useQuery } from "@/api/use-query";
import { DualDate } from "@/components/ds/format-parts";
import { Page, Panel } from "@/components/ds/page";
import { Sheet } from "@/components/ds/sheet";
import { Tag } from "@/components/ds/tag";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button } from "@/components/ui/button";
import { useI18n, useMsg, type MessageId } from "@/i18n";

const ROLES = ["co_founder", "manager", "finance", "member", "helper", "advisor", "viewer"] as const satisfies readonly Role[];

function InviteSheet({ open, onClose, wsId }: { open: boolean; onClose: () => void; wsId: string }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [sent, setSent] = useState(false);
  return (
    <Sheet open={open} onClose={() => { setSent(false); setName(""); onClose(); }} title={t("tm.invite")}>
      {sent ? (
        <div className="flex flex-col gap-3">
          <p className="font-display text-xl font-semibold">{t("tm.invite.sent")}</p>
          <Button className="w-fit" onClick={() => { setSent(false); setName(""); onClose(); }}>
            {t("action.close")}
          </Button>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!name.trim()) return;
            await api.inviteMember(wsId, { name: name.trim(), role });
            setSent(true);
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">{t("tm.invite.name")}</span>
            <input value={name} onChange={(event) => setName(event.target.value)} className="h-11 rounded-stamp bg-surface px-3 ring-1 ring-line-strong focus-visible:ring-2 focus-visible:ring-stamp" />
          </label>
          <fieldset>
            <legend className="mb-1 text-sm text-muted">{t("tm.invite.role")}</legend>
            <div className="flex flex-col gap-1.5">
              {ROLES.map((id) => (
                <label key={id} className="rounded-stamp flex min-h-11 cursor-pointer items-start gap-3 p-2.5 ring-1 ring-line-strong has-[:checked]:ring-2 has-[:checked]:ring-stamp">
                  <input type="radio" name="role" value={id} checked={role === id} onChange={() => setRole(id)} className="mt-1 size-4 accent-stamp" />
                  <span>
                    <strong className="block">
                      {t(`role.${id}` as MessageId)}
                      {id === "member" && <Tag className="ml-2">{t("tm.invite.suggest")}</Tag>}
                    </strong>
                    <span className="text-sm text-muted">{t(`role.${id}.d` as MessageId)}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="text-sm text-muted">{t("tm.invite.note")}</p>
          <Button type="submit" disabled={!name.trim()} className="w-fit">
            {t("action.send")}
          </Button>
        </form>
      )}
    </Sheet>
  );
}

export function TeamScreen() {
  const { t } = useI18n();
  const msg = useMsg();
  const { workspace } = useWorkspace();
  const { data } = useQuery(`team:${workspace.id}`, () => api.getTeam(workspace.id));
  const { data: artifacts } = useQuery(`file:${workspace.id}`, () => api.listArtifacts(workspace.id));
  const [open, setOpen] = useState(false);
  const jobs = (artifacts ?? []).filter((a) => a.kind === "hiring");

  return (
    <Page
      eyebrow={workspace.name}
      title={t("tm.title")}
      wide
      actions={
        <Button onClick={() => setOpen(true)}>
          <UserPlus className="size-4" aria-hidden /> {t("tm.invite")}
        </Button>
      }
    >
      <p className="max-w-2xl text-muted">{t("tm.sub")}</p>
      {data && (
        <>
          <Panel title={t("tm.members")}>
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr>
                    <th className="py-1 font-normal">{t("tm.col.name")}</th>
                    <th className="py-1 font-normal">{t("tm.col.role")}</th>
                    <th className="py-1 font-normal">{t("tm.col.signatory")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.members.map((member) => (
                    <tr key={member.id} className="border-t border-line align-top">
                      <td className="py-2.5 pr-3">
                        <strong>{member.name}</strong>
                        {member.status === "invited" && <Tag className="ml-2">{t("tm.status.invited")}</Tag>}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="font-semibold">{t(`role.${member.role}` as MessageId)}</span>
                        <span className="block text-xs text-muted">{t(`role.${member.role}.d` as MessageId)}</span>
                      </td>
                      <td className="py-2.5">{member.signatory ? <Tag highlight>{t("tm.sign.yes")}</Tag> : <span className="text-muted">{t("tm.sign.no")}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-muted">{t("tm.sign.note")}</p>
          </Panel>

          <Panel title={t("tm.consents")}>
            {data.consents.length === 0 ? (
              <p className="text-muted">{t("tm.consent.none")}</p>
            ) : (
              <ul className="ledger-rule">
                {data.consents.map((grant) => (
                  <li key={grant.id} className="flex flex-col gap-1.5 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong>{grant.grantee}</strong>
                      {grant.revoked ? (
                        <Tag highlight>{t("tm.consent.revoked")}</Tag>
                      ) : (
                        <Button size="sm" variant="danger" onClick={() => void api.revokeConsent(workspace.id, grant.id)}>
                          {t("tm.consent.revoke")}
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted">{msg(grant.scope)}</p>
                    <p className="text-sm">{grant.artifacts.join(" · ")}</p>
                    <p className="text-sm text-muted">
                      {t("tm.consent.expires")} <DualDate iso={grant.expiresAt} />
                    </p>
                    {grant.log.length > 0 && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-stamp">{t("tm.consent.log")}</summary>
                        <ul className="mt-1 flex flex-col gap-0.5 text-muted">
                          {grant.log.map((entry, i) => (
                            <li key={i} className="num text-xs">
                              {entry.at.replace("T", " ")} · {msg(entry.what)}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={t("tm.hiring")}>
            {jobs.length === 0 ? (
              <p className="text-muted">{t("tm.hiring.none")}</p>
            ) : (
              <ul className="ledger-rule">
                {jobs.map((job) => (
                  <li key={job.id} className="py-2.5">
                    <Link href={`/w/${workspace.id}/file/hiring/${job.id}`} className="font-semibold hover:underline">
                      {job.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
      <InviteSheet open={open} onClose={() => setOpen(false)} wsId={workspace.id} />
    </Page>
  );
}
