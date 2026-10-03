"use client";

import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { api, type CallSummary, type Lang, type Role } from "@/api";
import { useQuery } from "@/api/use-query";
import { DualDate } from "@/components/ds/format-parts";
import { Page, Panel } from "@/components/ds/page";
import { Sheet } from "@/components/ds/sheet";
import { EmptyState, ErrorState } from "@/components/ds/states";
import { Tag } from "@/components/ds/tag";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button, ButtonLink } from "@/components/ui/button";
import { useI18n, useMsg, type MessageId } from "@/i18n";
import { weightedScore } from "@/lib/calc";
import { formatCalcValue } from "@/lib/format-calc";

function CallRow({ call, org }: { call: CallSummary; org: string }) {
  const { t } = useI18n();
  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <Link href={`/p/${org}/calls/${call.id}`} className="group flex flex-wrap items-center justify-between gap-2">
        <span className="min-w-0">
          <strong className="block leading-snug group-hover:underline">{call.title}</strong>
          <span className="text-sm text-muted">
            {call.version > 0 ? t("cl.version", { n: call.version }) : t("cl.noVersion")} · {t("cl.applications", { n: call.applications })} · <DualDate iso={call.deadline} />
          </span>
        </span>
        <Tag highlight={call.status === "open"}>{t(`cl.status.${call.status}` as MessageId)}</Tag>
      </Link>
    </li>
  );
}

export function PartnerOverviewScreen() {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const { data } = useQuery(`partner:${workspace.id}`, () => api.getPartnerOverview(workspace.id));
  return (
    <Page eyebrow={data ? t(`pt.kind.${data.kind}` as MessageId) : undefined} title={workspace.name}>
      {data && (
        <div className="grid items-start gap-5 laptop:grid-cols-[minmax(0,1fr)_20rem]">
          <Panel title={t("pt.open")}>
            {data.openCalls.length === 0 ? (
              <p className="text-muted">{t("pt.noCalls")}</p>
            ) : (
              <ul className="ledger-rule">
                {data.openCalls.map((call) => (
                  <CallRow key={call.id} call={call} org={workspace.id} />
                ))}
              </ul>
            )}
          </Panel>
          <Panel>
            <dl className="ledger-rule">
              {[
                ["pt.awaiting", data.awaitingReview, data.kind === "funder" ? `/p/${workspace.id}/review` : `/p/${workspace.id}/calls`],
                ["pt.ventures", data.ventures, `/p/${workspace.id}/ventures`],
                ["pt.members", data.members, `/p/${workspace.id}/members`],
              ].map(([label, n, href]) => (
                <div key={label as string} className="flex items-baseline justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <dt>
                    <Link href={href as string} className="hover:underline">
                      {t(label as MessageId)}
                    </Link>
                  </dt>
                  <dd className="font-display num text-2xl font-bold">{n as number}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
      )}
    </Page>
  );
}

export function CallsScreen() {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const { data } = useQuery(`calls:${workspace.id}`, () => api.listCalls(workspace.id));
  return (
    <Page eyebrow={workspace.name} title={t("cl.title")}>
      <p className="max-w-2xl text-muted">{t("cl.sub")}</p>
      {data && data.length === 0 ? (
        <EmptyState art="checklist" title={t("cl.empty.title")} body={t("cl.empty.body")} />
      ) : (
        <Panel>
          <ul className="ledger-rule">
            {(data ?? []).map((call) => (
              <CallRow key={call.id} call={call} org={workspace.id} />
            ))}
          </ul>
        </Panel>
      )}
    </Page>
  );
}

const LANGS: Lang[] = ["en", "am", "om"];

export function CallBuilder() {
  const { t } = useI18n();
  const msg = useMsg();
  const { workspace } = useWorkspace();
  const params = useParams<{ id: string }>();
  const { data, error } = useQuery(`call:${workspace.id}:${params.id}`, () => api.getCall(workspace.id, params.id));
  const [weights, setWeights] = useState<Record<string, number> | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [languages, setLanguages] = useState<Lang[] | null>(null);
  const [note, setNote] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [done, setDone] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  if (error) {
    return (
      <Page>
        <ErrorState title={t("af.notfound.title")} body={t("af.notfound.body")} />
        <ButtonLink href={`/p/${workspace.id}/calls`} variant="secondary" className="w-fit">
          {t("cb.back")}
        </ButtonLink>
      </Page>
    );
  }
  if (!data) return <Page>{null}</Page>;

  const w = weights ?? Object.fromEntries(data.grid.map((g) => [g.id, g.weight]));
  const total = Object.values(w).reduce((sum, n) => sum + n, 0);
  const langs = languages ?? data.languages;
  const day = deadline ?? data.deadline;
  const valid = total === 100 && /^\d{4}-\d{2}-\d{2}$/.test(day) && langs.length > 0;
  const sample = weightedScore(data.grid.map((g) => ({ label: g.label.id, weight: w[g.id], score: scores[g.id] ?? 3 })));

  async function publish() {
    setFailed(false);
    try {
      const result = await api.publishCall(workspace.id, params.id, { weights: w, deadline: day, languages: langs, note });
      setDone(result.versions.length);
      setWeights(null);
      setDeadline(null);
      setLanguages(null);
      setNote("");
    } catch {
      setFailed(true);
    }
  }

  const field = "h-11 rounded-stamp bg-surface px-3 ring-1 ring-line-strong focus-visible:ring-2 focus-visible:ring-stamp";
  return (
    <Page
      eyebrow={
        <Link href={`/p/${workspace.id}/calls`} className="hover:underline">
          ← {t("cb.back")}
        </Link>
      }
      title={data.title}
      actions={<Tag highlight={data.status === "open"}>{t(`cl.status.${data.status}` as MessageId)}</Tag>}
    >
      <div className="grid items-start gap-5 laptop:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <Panel title={t("cb.grid")}>
            <ul className="ledger-rule">
              {data.grid.map((criterion) => (
                <li key={criterion.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                  <label htmlFor={`w-${criterion.id}`} className="min-w-0 font-semibold">
                    {msg(criterion.label)}
                  </label>
                  <input
                    id={`w-${criterion.id}`}
                    inputMode="numeric"
                    value={w[criterion.id]}
                    onChange={(event) => setWeights({ ...w, [criterion.id]: Number(event.target.value.replace(/\D/g, "")) || 0 })}
                    aria-label={`${msg(criterion.label)}: ${t("cb.weight")}`}
                    className={`${field} num w-20 text-right`}
                  />
                </li>
              ))}
            </ul>
            <p role="status" className={`num mt-2 text-sm font-semibold ${total === 100 ? "text-established" : "text-contradictory"}`}>
              {t("cb.total", { n: total })}
            </p>
            {total !== 100 && <p className="text-sm text-muted">{t("cb.mustTotal")}</p>}
          </Panel>

          <div className="grid items-start gap-5 tablet:grid-cols-2">
            <Panel title={t("cb.gate")}>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
                {data.gate.map((item, i) => (
                  <li key={i}>{msg(item)}</li>
                ))}
              </ul>
              {data.exclusions.length > 0 && (
                <>
                  <h3 className="num mt-3 mb-1 text-xs tracking-wide text-muted uppercase">{t("cb.exclusions")}</h3>
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
                    {data.exclusions.map((item, i) => (
                      <li key={i}>{msg(item)}</li>
                    ))}
                  </ul>
                </>
              )}
            </Panel>
            <Panel title={t("cb.declarations")}>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
                {data.declarations.map((item, i) => (
                  <li key={i}>{msg(item)}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-muted">{t("cb.declarations.note")}</p>
            </Panel>
          </div>

          <Panel title={t("cb.preview")}>
            <p className="mb-3 text-sm text-muted">{t("cb.preview.note")}</p>
            <ul className="ledger-rule text-sm">
              {data.grid.map((criterion) => (
                <li key={criterion.id} className="flex items-center justify-between gap-3 py-2">
                  <label htmlFor={`s-${criterion.id}`}>{msg(criterion.label)}</label>
                  <select id={`s-${criterion.id}`} value={scores[criterion.id] ?? 3} onChange={(event) => setScores({ ...scores, [criterion.id]: Number(event.target.value) })} className={field}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
            <p className="font-display num mt-3 text-2xl font-bold">
              {t("cb.preview.total")}: {formatCalcValue(sample.value, "percent")}
            </p>
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Panel title={t("cb.publish")}>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted">{t("cb.deadline")}</span>
                <input type="date" value={day} onChange={(event) => setDeadline(event.target.value)} className={field} />
              </label>
              <fieldset>
                <legend className="mb-1 text-sm text-muted">{t("cb.languages")}</legend>
                <div className="flex flex-wrap gap-3">
                  {LANGS.map((l) => (
                    <label key={l} className="flex min-h-11 items-center gap-2 text-sm">
                      <input type="checkbox" checked={langs.includes(l)} onChange={(event) => setLanguages(event.target.checked ? [...langs, l] : langs.filter((x) => x !== l))} className="size-5 accent-stamp" />
                      {t(`cb.lang.${l}` as MessageId)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <p className="text-sm">
                <span className="text-muted">{t("cb.submission")}: </span>
                {t(`cb.submission.${data.submission}` as MessageId)}
              </p>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted">{t("cb.note.label")}</span>
                <input value={note} onChange={(event) => setNote(event.target.value)} className={field} />
              </label>
              <Button onClick={() => void publish()} disabled={!valid} className="w-fit">
                {t("cb.publish")}
              </Button>
              <p className="text-sm text-muted">{t("cb.publish.note")}</p>
              {done !== null && (
                <p role="status" className="text-sm font-semibold text-established">
                  {t("cb.published", { n: done })}
                </p>
              )}
              {failed && (
                <p role="alert" className="text-sm font-semibold text-contradictory">
                  {t("cb.error")}
                </p>
              )}
            </div>
          </Panel>

          <Panel title={t("cb.versions")}>
            {data.versions.length === 0 ? (
              <p className="text-muted">{t("cl.noVersion")}</p>
            ) : (
              <ul className="ledger-rule">
                {[...data.versions].reverse().map((version) => (
                  <li key={version.v} className="flex flex-col gap-1 py-3 text-sm">
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <strong>{t("cl.version", { n: version.v })}</strong>
                      <Tag>{t("cb.readOnly")}</Tag>
                    </span>
                    <span className="text-muted">
                      <DualDate iso={version.publishedAt} /> · {version.note}
                    </span>
                    <span className="num text-xs text-muted">
                      {t("cb.fingerprint")} {version.hash} · {Object.values(version.weights).join(" / ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </Page>
  );
}

export function VenturesScreen() {
  const { t } = useI18n();
  const msg = useMsg();
  const { workspace } = useWorkspace();
  const { data } = useQuery(`ventures:${workspace.id}`, () => api.listVentures(workspace.id));
  return (
    <Page eyebrow={workspace.name} title={t("vt.title")}>
      <p className="max-w-2xl text-muted">{t("vt.sub")}</p>
      {data && data.length === 0 ? (
        <EmptyState art="tray" title={t("vt.empty.title")} body={t("vt.empty.body")} />
      ) : (
        <ul className="grid items-start gap-4 laptop:grid-cols-2">
          {(data ?? []).map((venture) => (
            <li key={venture.id} className="rounded-sheet flex flex-col gap-2 bg-surface p-4 ring-1 ring-line">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <strong className="font-display text-lg">{venture.name}</strong>
                <Tag>{msg(venture.status)}</Tag>
              </div>
              <p className="text-sm">
                <span className="num mr-1.5 text-xs tracking-wide text-muted uppercase">{t("vt.shared")}</span>
                {venture.shared.join(" · ")}
              </p>
              <p className="text-sm text-muted">
                {t("vt.until")} <DualDate iso={venture.consentUntil} />
              </p>
              <p className="text-sm">
                <span className="text-muted">{t("vt.readiness")}: </span>
                {venture.readiness === null ? <span className="text-muted">{t("vt.noReadiness")}</span> : <strong className="num">{t("rd.score", { n: venture.readiness })}</strong>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}

const PARTNER_ROLES = ["org_admin", "program_manager", "reviewer", "mentor"] as const satisfies readonly Role[];

export function MembersScreen() {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const { data } = useQuery(`pmembers:${workspace.id}`, () => api.listPartnerMembers(workspace.id));
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("reviewer");
  const [sent, setSent] = useState(false);

  function close() {
    setOpen(false);
    setSent(false);
    setName("");
  }

  return (
    <Page
      eyebrow={workspace.name}
      title={t("mb.title")}
      actions={
        <Button onClick={() => setOpen(true)}>
          <UserPlus className="size-4" aria-hidden /> {t("tm.invite")}
        </Button>
      }
    >
      <p className="max-w-2xl text-muted">{t("mb.sub")}</p>
      <Panel>
        <ul className="ledger-rule">
          {(data ?? []).map((member) => (
            <li key={member.id} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0">
              <span>
                <strong>{member.name}</strong>
                {member.status === "invited" && <Tag className="ml-2">{t("tm.status.invited")}</Tag>}
              </span>
              <span className="text-sm font-semibold">{t(`role.${member.role}` as MessageId)}</span>
              <span className="text-sm text-muted">{t(`role.${member.role}.d` as MessageId)}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <Sheet open={open} onClose={close} title={t("tm.invite")}>
        {sent ? (
          <div className="flex flex-col gap-3">
            <p className="font-display text-xl font-semibold">{t("tm.invite.sent")}</p>
            <Button className="w-fit" onClick={close}>
              {t("action.close")}
            </Button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!name.trim()) return;
              await api.invitePartnerMember(workspace.id, { name: name.trim(), role });
              setSent(true);
            }}
          >
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">{t("tm.invite.name")}</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className="h-11 rounded-stamp bg-surface px-3 ring-1 ring-line-strong focus-visible:ring-2 focus-visible:ring-stamp" />
            </label>
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1 text-sm text-muted">{t("tm.invite.role")}</legend>
              {PARTNER_ROLES.map((id) => (
                <label key={id} className="rounded-stamp flex min-h-11 cursor-pointer items-start gap-3 p-2.5 ring-1 ring-line-strong has-[:checked]:ring-2 has-[:checked]:ring-stamp">
                  <input type="radio" name="prole" checked={role === id} onChange={() => setRole(id)} className="mt-1 size-4 accent-stamp" />
                  <span>
                    <strong className="block">{t(`role.${id}` as MessageId)}</strong>
                    <span className="text-sm text-muted">{t(`role.${id}.d` as MessageId)}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <Button type="submit" disabled={!name.trim()} className="w-fit">
              {t("action.send")}
            </Button>
          </form>
        )}
      </Sheet>
    </Page>
  );
}

/** Reviewing applications is for funders; a programme's applicants appear under Ventures. */
export function ReviewGate({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  if (workspace.partnerKind === "funder") return <>{children}</>;
  return (
    <Page>
      <EmptyState art="tray" title={t("rv.noAccess.title")} body={t("rv.noAccess.body")} action={<ButtonLink href={`/p/${workspace.id}`}>{t("nav.overview")}</ButtonLink>} />
    </Page>
  );
}
