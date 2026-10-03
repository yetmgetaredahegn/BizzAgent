# Logo sources

> **What this is:** the logo concepts as standalone SVG (outlined, no font needed), and the script that generates them.
> **Who reads it:** designers and front-end engineers. Rationale: [BRAND.md](../BRAND.md#3-logo-and-name).
> **Last reviewed:** 2026-10-02

| File | Use |
|---|---|
| `concept-{A,B,C,D}.svg` | Full mark, 64 × 64 viewBox |
| `concept-{A,B,C,D}-small.svg` | Simplified mark for 16–32 px |
| `wordmark.svg`, `wordmark-am.svg` | "BizzAgent" and "ቢዝኤጀንት" outlined |

The SVGs here use concrete colours (stamp `#4A2FBF`, knock-out `#F3F4F8`). In the web app the
marks use `currentColor` and a `--logo-knock` variable instead.

`gen.py` regenerates them from the letterform outlines of Noto Sans Ethiopic 700 and Familjen
Grotesk 700 (both SIL OFL, from Google Fonts). It expects the TTF files in `../fonts/` relative to
its own folder and `pip install fonttools`. The fonts are not committed.
