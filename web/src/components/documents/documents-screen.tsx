"use client";

import { Download, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { api, type DocumentFormat, type DocumentRecord, type Lang } from "@/api";
import { useQuery } from "@/api/use-query";
import { CostTicket } from "@/components/ds/cost-ticket";
import { DualDate } from "@/components/ds/format-parts";
import { Page, Panel } from "@/components/ds/page";
import { Sheet } from "@/components/ds/sheet";
import { EmptyState } from "@/components/ds/states";
import { StampRing } from "@/components/ds/evidence-stamp";
import { Tag } from "@/components/ds/tag";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button, ButtonLink } from "@/components/ui/button";
import { useI18n, useMsg } from "@/i18n";

const FORMATS: DocumentFormat[] = ["pdf", "docx", "xlsx", "json"];
const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "am", label: "አማርኛ" },
  { id: "om", label: "Afaan Oromoo" },
];

async function download(record: DocumentRecord) {
  const text = await api.getDocumentText(record.id);
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${record.id}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function ExportSheet({ open, onClose, wsId }: { open: boolean; onClose: () => void; wsId: string }) {
  const { t, lang } = useI18n();
  const msg = useMsg();
  const { data: artifacts } = useQuery(`file:${wsId}`, () => api.listArtifacts(wsId));
  const [artifactId, setArtifactId] = useState("");
  const [format, setFormat] = useState<DocumentFormat>("pdf");
  const [language, setLanguage] = useState<Lang>(lang);
  const [done, setDone] = useState<DocumentRecord | null>(null);
  const [failed, setFailed] = useState(false);
  const { data: estimate } = useQuery(`est:${format}`, () => api.estimateExport(format));
  const chosen = artifactId || artifacts?.[0]?.id || "";

  async function create() {
    setFailed(false);
    try {
      setDone(await api.createExport(wsId, { artifactId: chosen, format, language }));
    } catch {
      setFailed(true);
    }
  }

  return (
    <Sheet open={open} onClose={() => { setDone(null); onClose(); }} title={t("doc.dialog.title")}>
      {done ? (
        <div className="flex flex-col gap-3">
          <p className="font-display text-xl font-semibold">{t("doc.created", { title: done.title })}</p>
          <p className="num text-xs break-all text-muted">SHA-256 {done.hash.slice(0, 12)}…</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void download(done)}>
              <Download className="size-4" aria-hidden /> {t("doc.download")}
            </Button>
            <ButtonLink href={`/v/${done.id}`} size="sm" variant="secondary">
              {t("doc.verify")}
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">{t("doc.artifact")}</span>
            <select value={chosen} onChange={(event) => setArtifactId(event.target.value)} className="h-11 rounded-stamp bg-surface px-2 ring-1 ring-line-strong">
              {(artifacts ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 phone:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">{t("doc.format")}</span>
              <select value={format} onChange={(event) => setFormat(event.target.value as DocumentFormat)} className="h-11 rounded-stamp bg-surface px-2 ring-1 ring-line-strong">
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">{t("doc.language")}</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value as Lang)} className="h-11 rounded-stamp bg-surface px-2 ring-1 ring-line-strong">
                {LANGS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <h3 className="num mb-1.5 text-xs tracking-wide text-muted uppercase">{t("doc.legend")}</h3>
            <ul className="flex flex-col gap-1 text-sm">
              {(["established", "unverified", "missing", "contradictory"] as const).map((status) => (
                <li key={status} className="flex items-center gap-2">
                  <StampRing status={status} className="size-4" /> {t(`status.${status}`)}
                </li>
              ))}
            </ul>
          </div>
          {estimate && (
            <CostTicket
              estimate={{ ...estimate, action: msg(estimate.action) }}
              onConfirm={() => void create()}
              confirmLabel={t("doc.create")}
              onCancel={onClose}
            />
          )}
          {failed && (
            <p role="alert" className="text-sm font-semibold text-contradictory">
              {t("doc.error.credits")}
            </p>
          )}
          <p className="text-sm text-muted">{t("doc.preview")}</p>
        </div>
      )}
    </Sheet>
  );
}

export function DocumentsScreen() {
  const { t } = useI18n();
  const { workspace } = useWorkspace();
  const { data } = useQuery(`docs:${workspace.id}`, () => api.listDocuments(workspace.id));
  const [open, setOpen] = useState(false);
  return (
    <Page
      eyebrow={workspace.name}
      title={t("doc.title")}
      wide
      actions={
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden /> {t("doc.new")}
        </Button>
      }
    >
      <p className="max-w-2xl text-muted">{t("doc.sub")}</p>
      {data && data.length === 0 ? (
        <EmptyState art="receipt" title={t("doc.empty.title")} body={t("doc.empty.body")} action={<Button onClick={() => setOpen(true)}>{t("doc.new")}</Button>} />
      ) : (
        <Panel>
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="text-left text-xs text-muted">
                <tr>
                  <th className="py-1 font-normal">{t("doc.col.title")}</th>
                  <th className="py-1 font-normal">{t("doc.col.format")}</th>
                  <th className="py-1 font-normal">{t("doc.col.source")}</th>
                  <th className="py-1 font-normal">{t("doc.col.hash")}</th>
                  <th className="py-1 font-normal">{t("doc.col.created")}</th>
                  <th className="py-1" />
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((record) => (
                  <tr key={record.id} className="border-t border-line align-top">
                    <td className="py-2.5 pr-3 font-semibold">{record.title}</td>
                    <td className="py-2.5 pr-3">
                      <Tag>
                        {record.format.toUpperCase()} · {record.language}
                      </Tag>
                    </td>
                    <td className="py-2.5 pr-3">
                      <Link href={`/w/${workspace.id}/file/${record.artifactKind}/${record.artifactId}`} className="hover:underline">
                        {record.artifactTitle}
                      </Link>
                      <span className="num block text-xs text-muted">{t("home.version", { n: record.version })}</span>
                    </td>
                    <td className="num py-2.5 pr-3 text-xs text-muted">{record.hash.slice(0, 12)}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">
                      <DualDate iso={record.createdAt} className="text-xs" />
                    </td>
                    <td className="py-2.5">
                      <span className="flex flex-wrap justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => void download(record)}>
                          <Download className="size-4" aria-hidden /> {t("doc.download")}
                        </Button>
                        <ButtonLink href={`/v/${record.id}`} size="sm" variant="ghost">
                          <ShieldCheck className="size-4" aria-hidden /> {t("doc.verify")}
                        </ButtonLink>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      <ExportSheet open={open} onClose={() => setOpen(false)} wsId={workspace.id} />
    </Page>
  );
}
