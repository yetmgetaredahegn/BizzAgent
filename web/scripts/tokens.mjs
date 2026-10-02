#!/usr/bin/env node
/*
 * Generates src/styles/tokens.css from docs/design/tokens.json (the single
 * source of truth for colour, type, space, radius, shadow and motion).
 * Run with `npm run tokens`. A test fails if the committed file drifts.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(here, "../../docs/design/tokens.json");
const TARGET = resolve(here, "../src/styles/tokens.css");

export function buildCss(tokens) {
  const colors = (set) =>
    Object.entries(tokens.color[set])
      .map(([name, token]) => `  --${name}: ${token.$value};`)
      .join("\n");
  const scalar = (group, prefix) =>
    Object.entries(tokens[group])
      .filter(([name]) => !name.startsWith("$"))
      .map(([name, token]) => `  --${prefix}-${name}: ${Array.isArray(token.$value) ? token.$value.join(", ") : token.$value};`)
      .join("\n");
  const shadow = tokens.shadow["active-sheet"].$value;
  const shadowCss = `${shadow.offsetX} ${shadow.offsetY} ${shadow.blur} ${shadow.spread} ${shadow.color}`;
  const motion = tokens.motion;
  const easing = motion.easing.$value.join(", ");

  const bp = tokens.breakpoint;
  const breakpoints = ["phone", "tablet", "laptop", "desktop", "wide"]
    .map((name) => `  --breakpoint-${name}: ${bp[name].$value};`)
    .join("\n");

  return `/* Generated from docs/design/tokens.json by scripts/tokens.mjs. Do not edit. */
@theme {
${breakpoints}
}

:root {
${colors("light")}
${scalar("space", "space")}
${scalar("radius", "radius")}
  --shadow-active-sheet: ${shadowCss};
  --motion-stamp-press: ${motion["stamp-press"].$value};
  --motion-standard: ${motion.standard.$value};
  --motion-landing-print: ${motion["landing-print"].$value};
  --motion-easing: cubic-bezier(${easing});
${scalar("breakpoint", "bp")}
${scalar("layout", "layout")}
  --touch-target: ${tokens.size["touch-target"].$value};
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${colors("dark")}
    color-scheme: dark;
  }
}

:root[data-theme="dark"] {
${colors("dark")}
  color-scheme: dark;
}
`.replace(/\n\n\n+/g, "\n\n");
}

export function readTokens() {
  return JSON.parse(readFileSync(SOURCE, "utf8"));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(TARGET, buildCss(readTokens()));
  console.log("wrote", TARGET);
}
