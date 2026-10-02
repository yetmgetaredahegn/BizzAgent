"use client";

import { Download, Volume2 } from "lucide-react";
import { useState } from "react";

import { api, type AutonomyLevel, type MemoryCandidate, type ParsedInstruction, type Policy } from "@/api";
import { useQuery } from "@/api/use-query";
import { EvidenceStamp } from "@/components/ds/evidence-stamp";
import { Panel } from "@/components/ds/page";
import { Tag } from "@/components/ds/tag";
import { setLang, useLang } from "@/components/language";
import { Button } from "@/components/ui/button";
import { useI18n, useMsg, type MessageId } from "@/i18n";
import { cn } from "@/lib/format";
import { speak } from "@/lib/speech";
import { dateOrderStore, useStore, voiceAutoplayStore } from "@/lib/store";
import type { Lang } from "@/lib/types";

const input = "h-11 rounded-stamp bg-surface px-3 ring-1 ring-line-strong focus-visible:ring-2 focus-visible:ring-stamp";

// ---------------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------------

const LANGS: { id: Lang; name: string; sample: string }[] = [
  { id: "am", name: "አማርኛ", sample: "ሰላም። ስለ ንግድዎ እናውራ።" },
  { id: "om", name: "Afaan Oromoo", sample: "Akkam. Waa'ee daldala keetii haa mari'annu." },
  { id: "en", name: "English", sample: "Hello. Let's talk about your business." },
];

export function LanguageSection() {
  const { t } = useI18n();
  const lang = useLang();
  const order = useStore(dateOrderStore);
  const autoplay = useStore(voiceAutoplayStore);
  const [silent, setSilent] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <Panel title={t("st.lang.choose")}>
        <ul className="grid gap-2 tablet:grid-cols-3">
          {LANGS.map((option) => (
            <li key={option.id} className={cn("rounded-sheet flex flex-col gap-2 p-3 ring-1", lang === option.id ? "bg-stamp text-on-stamp ring-stamp" : "ring-line-strong")}>
              <button type="button" lang={option.id} onClick={() => void api.updateLanguage(option.id).then(() => setLang(option.id))} aria-pressed={lang === option.id} className="min-touch text-left text-lg font-semibold">
                {option.name}
              </button>
              <button
                type="button"
                onClick={() => setSilent(!speak(option.sample, option.id))}
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-2 hover:underline"
              >
                <Volume2 className="size-4" aria-hidden /> {t("st.lang.sample")}
              </button>
            </li>
          ))}
        </ul>
        {silent && <p role="status" className="mt-2 text-sm text-muted">{t("st.lang.noVoice")}</p>}
        <p className="mt-2 text-sm text-muted">{t("st.lang.draft")}</p>
      </Panel>
      <Panel title={t("st.lang.voice")}>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" checked={autoplay} onChange={(event) => voiceAutoplayStore.set(event.target.checked)} className="size-5 accent-stamp" />
          {t("st.lang.autoplay")}
        </label>
      </Panel>
      <Panel title={t("st.lang.dates")}>
        <fieldset className="flex flex-col gap-1">
          <legend className="sr-only">{t("st.lang.dates")}</legend>
          {(["ec-first", "gc-first"] as const).map((value) => (
            <label key={value} className="flex min-h-11 items-center gap-3">
              <input type="radio" name="order" checked={order === value} onChange={() => dateOrderStore.set(value)} className="size-4 accent-stamp" />
              {t(value === "ec-first" ? "st.lang.dates.ec" : "st.lang.dates.gc")}
            </label>
          ))}
        </fieldset>
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Memory: what BizzAgent knows
// ---------------------------------------------------------------------------

const TOPICS = ["business", "goals", "people", "preferences"] as const;

export function MemorySection() {
  const { t } = useI18n();
  const msg = useMsg();
  const { data } = useQuery("memory", () => api.getMemory());
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pasted, setPasted] = useState("");
  const [found, setFound] = useState<MemoryCandidate[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  function exportJson() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data?.items ?? [], null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "bizzagent-memory.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-2xl text-muted">{t("st.mem.sub")}</p>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" checked={data?.paused ?? false} onChange={(event) => void api.setLearningPaused(event.target.checked)} className="size-5 accent-stamp" />
          {t("st.mem.pause")}
        </label>
        <Button size="sm" variant="secondary" onClick={exportJson}>
          <Download className="size-4" aria-hidden /> {t("st.mem.export")}
        </Button>
      </div>

      {data && data.items.length === 0 && <p className="text-muted">{t("st.mem.empty")}</p>}
      {TOPICS.map((topic) => {
        const items = (data?.items ?? []).filter((item) => item.topic === topic);
        if (items.length === 0) return null;
        return (
          <Panel key={topic} title={t(`st.mem.topic.${topic}` as MessageId)}>
            <ul className="ledger-rule">
              {items.map((item) => (
                <li key={item.id} className="flex flex-col gap-2 py-3">
                  {editing === item.id ? (
                    <>
                      <label className="sr-only" htmlFor={`m-${item.id}`}>
                        {t("action.edit")}
                      </label>
                      <textarea id={`m-${item.id}`} value={draft} rows={2} onChange={(event) => setDraft(event.target.value)} className="rounded-stamp p-2 ring-1 ring-line-strong" />
                      <span className="flex gap-2">
                        <Button size="sm" onClick={async () => { await api.updateMemory(item.id, draft); setEditing(null); }}>
                          {t("action.save")}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                          {t("action.cancel")}
                        </Button>
                      </span>
                    </>
                  ) : (
                    <>
                      <p className="leading-snug">{item.text}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="flex flex-wrap items-center gap-2 text-sm text-muted">
                          <EvidenceStamp status={item.status} compact />
                          {msg(item.source)}
                        </span>
                        <span className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditing(item.id); setDraft(item.text); }}>
                            {t("action.edit")}
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => void api.forgetMemory(item.id)}>
                            {t("st.mem.forget")}
                          </Button>
                        </span>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        );
      })}

      <Panel title={t("st.mem.import")}>
        <p className="mb-2 text-sm text-muted">{t("st.mem.import.note")}</p>
        <label className="sr-only" htmlFor="paste">
          {t("st.mem.import")}
        </label>
        <textarea id="paste" value={pasted} rows={5} onChange={(event) => setPasted(event.target.value)} placeholder={t("st.mem.import.placeholder")} className="w-full rounded-stamp p-3 ring-1 ring-line-strong" />
        <Button
          className="mt-2"
          size="sm"
          variant="secondary"
          disabled={!pasted.trim()}
          onClick={async () => {
            const result = await api.importMemory(pasted);
            setFound(result);
            setPicked(new Set(result.map((c) => c.id)));
          }}
        >
          {t("st.mem.find")}
        </Button>
        {found && (
          <div className="mt-4">
            {found.length === 0 ? (
              <p className="text-muted">{t("st.mem.none")}</p>
            ) : (
              <>
                <p className="mb-2 text-sm text-muted">{t("st.mem.review")}</p>
                <ul className="ledger-rule">
                  {found.map((c) => (
                    <li key={c.id}>
                      <label className="flex min-h-11 items-start gap-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={picked.has(c.id)}
                          onChange={(event) => setPicked((p) => { const next = new Set(p); if (event.target.checked) next.add(c.id); else next.delete(c.id); return next; })}
                          className="mt-0.5 size-5 shrink-0 accent-stamp"
                        />
                        <span>
                          {c.text} <Tag>{t(`st.mem.topic.${c.topic}` as MessageId)}</Tag>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-3"
                  size="sm"
                  disabled={picked.size === 0}
                  onClick={async () => {
                    await api.confirmMemory(found.filter((c) => picked.has(c.id)));
                    setFound(null);
                    setPasted("");
                  }}
                >
                  {t("st.mem.remember", { n: picked.size })}
                </Button>
              </>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Autonomy
// ---------------------------------------------------------------------------

export function AutonomySection() {
  const { t } = useI18n();
  const { data } = useQuery("autonomy", () => api.getAutonomy());
  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-2xl text-muted">{t("st.aut.sub")}</p>
      <ul className="flex flex-col gap-3">
        {(data ?? []).map((skill) => (
          <li key={skill.id} className="rounded-sheet flex flex-col gap-2.5 bg-surface p-4 ring-1 ring-line">
            <strong className="font-display text-lg">{t(`st.skill.${skill.id}` as MessageId)}</strong>
            <div role="radiogroup" aria-label={t(`st.skill.${skill.id}` as MessageId)} className="grid grid-cols-4 gap-1 rounded-full p-0.5 ring-1 ring-line-strong">
              {([0, 1, 2, 3] as AutonomyLevel[]).map((level) => {
                const blocked = level > skill.max;
                return (
                  <button
                    key={level}
                    type="button"
                    role="radio"
                    aria-checked={skill.level === level}
                    disabled={blocked}
                    onClick={() => void api.setAutonomy(skill.id, level)}
                    className={cn("min-touch num rounded-full text-sm font-semibold", skill.level === level ? "bg-stamp text-on-stamp" : "text-muted", blocked && "opacity-40")}
                  >
                    L{level}
                  </button>
                );
              })}
            </div>
            <p className="text-sm">
              <strong>{t(`st.lvl.${skill.level}` as MessageId)}.</strong> <span className="text-muted">{t(`st.lvl.${skill.level}.d` as MessageId)}</span>
            </p>
            {skill.max < 3 && <p className="text-sm text-muted">{t("st.aut.noL3")}</p>}
          </li>
        ))}
      </ul>
      <Panel title={t("st.aut.limits")}>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
          {["sign", "submit", "pay", "personal"].map((id) => (
            <li key={id}>{t(`st.aut.limit.${id}` as MessageId)}</li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Standing instructions
// ---------------------------------------------------------------------------

function PolicyLines({ policy }: { policy: Policy }) {
  const { t } = useI18n();
  const nf = new Intl.NumberFormat("en-US");
  if (policy.kind === "alert") {
    return (
      <ul className="flex list-disc flex-col gap-0.5 pl-5">
        <li>{t("st.pol.alert", { what: policy.what })}</li>
        {policy.maxBirr !== null && <li>{t("st.pol.max", { n: nf.format(policy.maxBirr) })}</li>}
        <li>{t("st.pol.notify")}</li>
      </ul>
    );
  }
  if (policy.kind === "draft") {
    return (
      <ul className="flex list-disc flex-col gap-0.5 pl-5">
        <li>{t("st.pol.draft", { n: policy.minFit })}</li>
        <li>{t("st.pol.neverSubmit")}</li>
      </ul>
    );
  }
  return (
    <ul className="flex list-disc flex-col gap-0.5 pl-5">
      <li>{t("st.pol.budget", { n: policy.credits })}</li>
      <li>{t("st.pol.stop")}</li>
    </ul>
  );
}

export function InstructionsSection() {
  const { t } = useI18n();
  const { data } = useQuery("instructions", () => api.listInstructions());
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedInstruction | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-2xl text-muted">{t("st.ins.sub")}</p>
      <Panel title={t("st.ins.new")}>
        <label className="sr-only" htmlFor="instruction">
          {t("st.ins.new")}
        </label>
        <textarea id="instruction" value={text} rows={3} onChange={(event) => { setText(event.target.value); setParsed(null); }} placeholder={t("st.ins.placeholder")} className="w-full rounded-stamp p-3 ring-1 ring-line-strong" />
        <Button className="mt-2" size="sm" variant="secondary" disabled={!text.trim()} onClick={async () => setParsed(await api.parseInstruction(text))}>
          {t("st.ins.understand")}
        </Button>

        {parsed?.ok && (
          <div className="rounded-stamp mt-4 flex flex-col gap-2 bg-copy-pink p-3 text-ink">
            <p className="num text-xs tracking-wide uppercase">{t("st.ins.understood")}</p>
            <PolicyLines policy={parsed.policy} />
            <span className="flex gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  await api.saveInstruction(text, parsed.policy);
                  setText("");
                  setParsed(null);
                }}
              >
                {t("action.confirm")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setParsed(null)}>
                {t("action.edit")}
              </Button>
            </span>
          </div>
        )}
        {parsed && !parsed.ok && (
          <p role="alert" className="mt-3 text-sm">
            <strong className="text-contradictory">{t("st.ins.notUnderstood")}</strong> {t("st.ins.examples")}
          </p>
        )}
      </Panel>

      <Panel title={t("st.ins.active")}>
        {data && data.length === 0 ? (
          <p className="text-muted">{t("st.ins.none")}</p>
        ) : (
          <ul className="ledger-rule">
            {(data ?? []).map((item) => (
              <li key={item.id} className="flex flex-col gap-1.5 py-3 text-sm">
                <p className="font-semibold">“{item.text}”</p>
                <PolicyLines policy={item.policy} />
                <Button size="sm" variant="danger" className="w-fit" onClick={() => void api.removeInstruction(item.id)}>
                  {t("st.ins.remove")}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Connectors
// ---------------------------------------------------------------------------

export function ConnectorsSection() {
  const { t } = useI18n();
  const { data: me } = useQuery("me", () => api.me());
  const { data: tokens } = useQuery("tokens", () => api.listConnectorTokens());
  const [ws, setWs] = useState("");
  const [scope, setScope] = useState<"read" | "write">("read");
  const [secret, setSecret] = useState<string | null>(null);
  const venture = (me?.workspaces ?? []).filter((w) => w.type !== "partner");
  const chosen = ws || venture[0]?.id || "";

  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-2xl text-muted">{t("st.con.sub")}</p>
      <Panel title={t("st.con.setup")}>
        <p className="text-sm">{t("st.con.todo")}</p>
        <p className="num mt-2 text-sm break-all text-muted">https://api.bizzagent.example/mcp ({t("st.con.placeholder")})</p>
        <ul className="mt-2 flex list-disc flex-col gap-0.5 pl-5 text-sm text-muted">
          {["claude", "chatgpt", "mcp"].map((id) => (
            <li key={id}>{t(`st.con.client.${id}` as MessageId)}</li>
          ))}
        </ul>
      </Panel>
      <Panel title={t("st.con.tokens")}>
        {venture.length > 0 && (
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">{t("st.con.workspace")}</span>
              <select value={chosen} onChange={(event) => setWs(event.target.value)} className={input}>
                {venture.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">{t("st.con.scope")}</span>
              <select value={scope} onChange={(event) => setScope(event.target.value as "read" | "write")} className={input}>
                <option value="read">{t("st.con.scope.read")}</option>
                <option value="write">{t("st.con.scope.write")}</option>
              </select>
            </label>
            <Button
              size="sm"
              onClick={async () => {
                const result = await api.createConnectorToken(chosen, scope);
                setSecret(result.secret);
              }}
            >
              {t("st.con.create")}
            </Button>
          </div>
        )}
        {secret && (
          <div role="status" className="rounded-stamp mb-4 flex flex-col gap-1 bg-copy-yellow p-3 text-ink">
            <p className="num text-sm break-all">{secret}</p>
            <p className="text-sm">{t("st.con.once")}</p>
          </div>
        )}
        {tokens && tokens.length === 0 ? (
          <p className="text-muted">{t("st.con.none")}</p>
        ) : (
          <ul className="ledger-rule">
            {(tokens ?? []).map((token) => (
              <li key={token.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <span>
                  <strong>{token.workspaceName}</strong> <Tag>{t(token.scope === "read" ? "st.con.scope.read" : "st.con.scope.write")}</Tag>
                  <span className="num block text-xs text-muted">{token.preview}</span>
                </span>
                {token.revoked ? <Tag highlight>{t("pp.revoked")}</Tag> : (
                  <Button size="sm" variant="danger" onClick={() => void api.revokeConnectorToken(token.id)}>
                    {t("pp.revoke")}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function NotificationsSection() {
  const { t } = useI18n();
  const { data } = useQuery("notifications", () => api.getNotifications());
  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-2xl text-muted">{t("st.not.sub")}</p>
      {data && (
        <>
          <Panel title={t("st.not.channels")}>
            <ul className="ledger-rule">
              <li>
                <label className="flex min-h-11 items-center gap-3 py-2">
                  <input type="checkbox" checked={data.web} onChange={(event) => void api.setNotifications({ web: event.target.checked })} className="size-5 accent-stamp" />
                  {t("st.not.web")}
                </label>
              </li>
              {(["telegram", "whatsapp", "sms"] as const).map((id) => (
                <li key={id} className="flex min-h-11 items-center justify-between gap-3 py-2 text-muted">
                  <span>{t(`st.not.${id}` as MessageId)}</span>
                  <Tag>{t("st.not.later")}</Tag>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title={t("st.not.weekly")}>
            <label className="flex min-h-11 items-center gap-3">
              <input type="checkbox" checked={data.weekly} onChange={(event) => void api.setNotifications({ weekly: event.target.checked })} className="size-5 accent-stamp" />
              {t("st.not.weekly.label")}
            </label>
          </Panel>
          <Panel title={t("st.not.quiet")}>
            <div className="flex flex-wrap items-end gap-4">
              {(["from", "to"] as const).map((key) => (
                <label key={key} className="flex flex-col gap-1 text-sm">
                  <span className="text-muted">{t(key === "from" ? "st.not.from" : "st.not.to")}</span>
                  <input type="time" value={data.quiet[key]} onChange={(event) => void api.setNotifications({ quiet: { ...data.quiet, [key]: event.target.value } })} className={input} />
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted">{t("st.not.quiet.note")}</p>
          </Panel>
        </>
      )}
    </div>
  );
}
