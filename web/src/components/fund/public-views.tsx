"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { api, type DocumentFormat, type FieldStatusCounts } from "@/api";
import { useQuery } from "@/api/use-query";
import { DualDate } from "@/components/ds/format-parts";
import { formatDual } from "@/lib/ethiopian-calendar";
import { dateOrderStore, useStore } from "@/lib/store";
import { EvidenceStamp, StampRing } from "@/components/ds/evidence-stamp";
import { Tag } from "@/components/ds/tag";
import { Button } from "@/components/ui/button";
import { useI18n, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";

import { PassportFacts } from "./passport-screen";

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-10 tablet:px-6">
      <h1 className="font-display text-[clamp(1.75rem,5vw,2.5rem)] leading-tight font-bold">{title}</h1>
      {children}
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div role="status" className="rounded-sheet flex flex-col gap-1.5 bg-surface p-5 ring-1 ring-line">
      <strong className="font-display text-xl">{title}</strong>
      <p className="text-muted">{body}</p>
    </div>
  );
}

/** /passport/[token]: a read-only Passport. Expired, revoked and unknown links each say so. */
export function SharedPassportView() {
  const { t, lang } = useI18n();
  const order = useStore(dateOrderStore);
  const params = useParams<{ token: string }>();
  const { data } = useQuery(`shared:${params.token}`, () => api.openSharedPassport(params.token));
  if (!data) return <Shell title={t("pp.title")}>{null}</Shell>;
  if (data.state !== "ok") {
    return (
      <Shell title={t("pp.title")}>
        <Notice title={t(`pp.public.${data.state}.title` as MessageId)} body={t(`pp.public.${data.state}.body` as MessageId)} />
      </Shell>
    );
  }
  return (
    <Shell title={t("pp.title")}>
      <p className="text-lg">{t("pp.public.by", { name: data.business })}</p>
      <p className="text-sm text-muted">{t("pp.public.expires", { date: formatDual(data.expiresAt, lang, order) })}</p>
      <div className="rounded-sheet bg-surface p-4 ring-1 ring-line">
        <PassportFacts facts={data.facts} />
      </div>
      <p className="text-sm text-muted">{t("pp.public.about")}</p>
    </Shell>
  );
}

const sha256 = async (bytes: ArrayBuffer) =>
  [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((b) => b.toString(16).padStart(2, "0")).join("");

function Counts({ counts }: { counts: FieldStatusCounts }) {
  const { t } = useI18n();
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
      {(["established", "unverified", "missing", "contradictory"] as const).map((status) => (
        <li key={status} className="flex items-center gap-1.5 text-sm">
          <StampRing status={status} className="size-4" />
          <span className="num font-semibold">{counts[status]}</span>
          <span className="text-muted">{t(`status.${status}`)}</span>
        </li>
      ))}
    </ul>
  );
}

/** /v/[id]: shows what a document is, never its content, and compares a visitor's file by fingerprint. */
export function VerifyView() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const { data, loading } = useQuery(`verify:${params.id}`, () => api.getPublicDocument(params.id));
  const [result, setResult] = useState<"match" | "altered" | null>(null);

  async function compareText(text: string) {
    setResult(await api.verifyDocument(params.id, await sha256(new TextEncoder().encode(text).buffer as ArrayBuffer)));
  }

  if (loading) return <Shell title={t("vf.title")}>{null}</Shell>;
  if (!data) {
    return (
      <Shell title={t("vf.title")}>
        <Notice title={t("vf.unknown.title")} body={t("vf.unknown.body")} />
      </Shell>
    );
  }
  return (
    <Shell title={t("vf.title")}>
      <p className="text-muted">{t("vf.sub")}</p>
      <div className="rounded-sheet flex flex-col gap-4 bg-surface p-5 ring-1 ring-line">
        <div>
          <h2 className="font-display text-2xl font-semibold">{data.title}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span>
              {t("vf.issuer")}: <strong className="text-ink">{data.issuer}</strong>
            </span>
            <span>
              {t("vf.created")}: <DualDate iso={data.createdAt} />
            </span>
            <Tag>{data.format.toUpperCase() as Uppercase<DocumentFormat>}</Tag>
          </p>
        </div>
        <div>
          <h3 className="num mb-1.5 text-xs tracking-wide text-muted uppercase">{t("vf.evidence")}</h3>
          <Counts counts={data.provenance} />
        </div>
        <div>
          <h3 className="num mb-1.5 text-xs tracking-wide text-muted uppercase">{t("vf.verifiers")}</h3>
          <ul className="flex flex-col gap-1">
            {data.verifiers.map((verifier) => (
              <li key={verifier} className="flex items-center gap-2 text-sm">
                <EvidenceStamp status="established" compact />
                {t(`vf.v.${verifier}` as MessageId)}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-muted">{t("vf.noContent")}</p>
      </div>

      <div className="rounded-sheet flex flex-col gap-3 bg-surface p-5 ring-1 ring-line">
        <h2 className="font-display text-xl font-semibold">{t("vf.compare")}</h2>
        <p className="text-sm text-muted">{t("vf.compare.body")}</p>
        <label className="flex flex-col gap-1 text-sm">
          <span className="sr-only">{t("vf.choose")}</span>
          <input
            type="file"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) setResult(await api.verifyDocument(params.id, await sha256(await file.arrayBuffer())));
            }}
            className="rounded-stamp p-2 ring-1 ring-line-strong file:mr-3 file:rounded-full file:border-0 file:bg-stamp file:px-4 file:py-2 file:font-semibold file:text-on-stamp"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={async () => compareText(await api.getDocumentText(params.id))}>
            {t("vf.try.original")}
          </Button>
          <Button size="sm" variant="secondary" onClick={async () => compareText(`${await api.getDocumentText(params.id)} (edited)`)}>
            {t("vf.try.altered")}
          </Button>
        </div>
        {result && (
          <div role="status" className={cn("rounded-stamp p-3 ring-2", result === "match" ? "ring-established" : "ring-contradictory")}>
            <strong className={cn("flex items-center gap-2", result === "match" ? "text-established" : "text-contradictory")}>
              <StampRing status={result === "match" ? "established" : "contradictory"} />
              {t(result === "match" ? "vf.match.title" : "vf.altered.title")}
            </strong>
            <p className="mt-1 text-sm">{t(result === "match" ? "vf.match.body" : "vf.altered.body")}</p>
          </div>
        )}
      </div>
    </Shell>
  );
}
