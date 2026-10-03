import { describe, expect, it } from "vitest";

import { documentDraftsFor, documentText, publicView, sha256Hex } from "./documents";
import { WORKSPACES } from "./seed/workspaces";

const ws = WORKSPACES.find((w) => w.id === "meron-garments")!;

describe("documents", () => {
  it("makes one document per artifact, with a stable id", () => {
    const drafts = documentDraftsFor(ws);
    expect(drafts).toHaveLength(ws.artifacts.length);
    expect(new Set(drafts.map((d) => d.id)).size).toBe(drafts.length);
  });

  it("hashes the same text the same way and notices any change", async () => {
    const draft = documentDraftsFor(ws)[0];
    const text = documentText(draft, ws.name);
    expect(await sha256Hex(text)).toBe(await sha256Hex(text));
    expect(await sha256Hex(text)).not.toBe(await sha256Hex(`${text} `));
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("shows the public page only the issuer's name and counts, never the content", () => {
    const view = publicView(documentDraftsFor(ws)[0], ws.name);
    expect(Object.keys(view).sort()).toEqual(["createdAt", "format", "id", "issuer", "provenance", "title", "verifiers"]);
  });
});
