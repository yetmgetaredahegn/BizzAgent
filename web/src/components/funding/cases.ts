/*
 * Which funding cases a workspace may open. In the prototype Almaz's workspace
 * owns the finished demo proposal; every workspace can start a live one from the
 * voice interview. The other fixtures (Nahom, Hiwot) are applications that the
 * funder reviews in the partner portal, not cases of this workspace.
 */
const OWNED: Record<string, string[]> = { "almaz-spices": ["almaz"] };

export function casesFor(wsId: string): string[] {
  return [...(OWNED[wsId] ?? []), "live"];
}
