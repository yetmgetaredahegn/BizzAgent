import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { buildCss, readTokens } from "../../scripts/tokens.mjs";

describe("design tokens", () => {
  it("tokens.css matches docs/design/tokens.json (run `npm run tokens` if this fails)", () => {
    const committed = readFileSync(resolve(__dirname, "tokens.css"), "utf8");
    expect(committed).toBe(buildCss(readTokens()));
  });
});
