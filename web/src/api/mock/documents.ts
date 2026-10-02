/*
 * Exported documents and their tamper-evident record (docs/engineering/api.md,
 * "document verification"). A real export is a DOCX, PDF or XLSX with a QR code in
 * its footer. The prototype exports a plain-text preview of the same content so a
 * visitor can really hash it, change it and see the verification page react.
 */

import type { ArtifactKind, ArtifactSummary, DocumentFormat, DocumentRecord, PublicDocument } from "../contract";
import type { WsSeed } from "./seed/workspaces";

const FORMAT: Record<ArtifactKind, DocumentFormat> = {
  profile: "json",
  legal: "pdf",
  launch: "pdf",
  idea: "pdf",
  validation: "docx",
  market: "docx",
  entry: "docx",
  finance: "xlsx",
  proposal: "pdf",
  accelerator: "docx",
  growth: "docx",
  explainer: "pdf",
  hiring: "docx",
};

export type DocumentDraft = Omit<DocumentRecord, "hash">;

export function documentIdFor(artifactId: string): string {
  return `d-${artifactId}`;
}

export function documentDraftsFor(ws: WsSeed): DocumentDraft[] {
  return ws.artifacts.map((artifact: ArtifactSummary) => ({
    id: documentIdFor(artifact.id),
    title: artifact.title,
    format: FORMAT[artifact.kind],
    language: "en",
    artifactId: artifact.id,
    artifactTitle: artifact.title,
    artifactKind: artifact.kind,
    version: artifact.version,
    createdAt: artifact.updatedAt,
    provenance: artifact.stamps,
  }));
}

/** The prototype's sample file: the legend every real export carries, then the facts a verifier needs. */
export function documentText(draft: DocumentDraft, issuer: string): string {
  const p = draft.provenance;
  return [
    "BizzAgent document (prototype preview)",
    `Title: ${draft.title}`,
    `Issuer: ${issuer}`,
    `Created: ${draft.createdAt}`,
    `Source: ${draft.artifactTitle}, version ${draft.version}`,
    `Evidence: ${p.established} established, ${p.unverified} unverified, ${p.missing} missing, ${p.contradictory} contradictory`,
    "",
    "Legend",
    "Established: backed by a document or your ledger.",
    "Unverified: you said it; nothing backs it yet.",
    "Missing: not provided. It is listed, never guessed.",
    "Contradictory: two sources disagree. Both values are kept.",
    "",
    "Fictional prototype data.",
  ].join("\n");
}

export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function publicView(draft: DocumentDraft, issuer: string): PublicDocument {
  return {
    id: draft.id,
    title: draft.title,
    issuer,
    format: draft.format,
    createdAt: draft.createdAt,
    provenance: draft.provenance,
    verifiers: ["grounding", "rules", "language"],
  };
}
