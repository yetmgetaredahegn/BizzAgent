# BizzAgent brand: "Stamped"

> **What this is:** the visual identity: concept, logo, colour (with measured contrast), typography, signature components, layout, imagery, voice and the review process.
> **Who reads it:** designers and front-end engineers. Tokens are in [tokens.json](tokens.json); components are in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
> **Last reviewed:** 2026-10-02 · **Status:** brand board v2 awaiting the owner's logo pick

## 1. Brief

| | |
|---|---|
| **Subject** | An agent that turns what a person says into business paperwork they can trust. |
| **Audience** | Ethiopian founders and small businesses, many of them low-literacy or voice-first; funders and partners. |
| **The UI's single job** | Make every number and claim feel **checked**, like a document that has been stamped. |

## 2. Concept: "Stamped"

The identity borrows from the material world of Ethiopian business paperwork, where trust is
physical:

- the rubber stamp on a licence
- the carbon-copy receipt book (white original, pink and yellow copies)
- the hand-ruled ledger
- the Ge'ez fidel chart

These objects are used as **information design**, not ornament:

| Paperwork object | UI role |
|---|---|
| Evidence stamps | The four provenance states |
| Carbon copies | Document roles: original / draft copy / file copy |
| Receipt tape | Calculation traces |
| The fidel grid's 7 orders | The 7-stage journey |

Ethiopian context comes through **content and conventions**: birr, the EC calendar, kebele,
Ge'ez script and local examples. There are **no** flags, tibeb borders, coffee-cup clip art or
stock "Africa" imagery.

**Balance.** The identity is simple but not plain. The creative layer is paperwork objects that
each carry meaning (see [ux-principles §4](ux-principles.md#4-balanced-creativity)), under a strict
per-screen budget.

**Generic directions explicitly avoided:**

- cream + serif display + terracotta
- near-black + one acid-green or vermilion pop
- broadsheet hairline columns
- purple-to-blue gradient heroes
- Inter / Space Grotesk / IBM Plex as "safe" faces
- emoji section markers
- centred-everything layouts
- uniform `rounded-lg` cards with accent rails
- glows and glass
- decorative 01/02/03 numbering

## 3. Logo and name

**Name.** The product is **BizzAgent**, written **ቢዝኤጀንት** in Amharic (confirmed by the owner).
The Amharic name starts with **ቢ** (bi). An earlier draft of the mark used ብ (bə); that was wrong
and is withdrawn. Two story names were shown as alternatives (Mahtem ማኅተም "seal" and Wekil ወኪል
"agent"); the owner may choose one. A rename is a separate PR and needs a trademark, domain and
existing-company check first.

**The story.** *You say it, and it becomes a stamped, trusted paper that travels with you.*

**Concepts** (SVG sources in [logo/](logo/); all are built from the real ቢ letterform outline):

| | Concept | Story | Notes |
|---|---|---|---|
| A | **Voice becomes record** | A sound wave under the letter settles into a stamp | Modern; least "paperwork" |
| B | **The round office stamp** | Ethiopian office stamps are round with rim text: ቢዝኤጀንት above, BIZZAGENT below, a speech bubble with ቢ in the middle | Most recognisably official. Rim text is too fine below about 40 px, so small sizes drop to two rings and ቢ |
| C | **The clipped receipt** | A torn receipt slip with ቢ, held by a paper clip: your business papers, kept together and checked | Friendly, ownable, ties to the interface motifs |
| D | **The receipt roll** | A roll feeds a printed receipt with ቢ, two lines of work and a checked stamp | Best "step by step" story; generic at small sizes |

**Recommendation.** **C is the product logo. B is the document seal**, stamped on every export
next to the verification QR code. The final choice is recorded here after the owner picks.
**Working default for the prototype: C (logo) and B (seal).** The logo is one component
(`Logo`, `LogoMark`), so changing the choice is a one-file change.

**Rules (all concepts):**

- **Wordmark.** "BizzAgent" in Familjen Grotesk 700, with the "zz" kerned tight like a stamped
  serial number. Amharic wordmark "ቢዝኤጀንት" in Noto Sans Ethiopic 700.
- **Small marks.** Each concept has a simplified mark for 16–32 px (favicon, tab, app list).
- **Colour.** One colour: stamp ink. A knock-out ring in the page colour keeps the paper clip
  readable over the slip. On stamp-ink backgrounds, the mark is `on-stamp`.
- **Lockups:** mark only (app icon, favicon), horizontal (header), stacked Amharic.
- **Clear space** = the height of the ቢ. **Minimum size** 20 px (16 px with the small mark).
- **Cultural check: required before launch.** A native reviewer confirms the use of ቢ, the
  spelling "ቢዝኤጀንት" and the rim text.

## 4. Colour

**Theory:**

- **Primary hue: stamp-ink violet.** The ink of official office stamps. It is distinct from
  fintech blue and green and from the teal it replaces.
- **Complement: Meskel yellow.** From the adey abeba flower and the yellow carbon copy. It is
  used **only as a highlight fill behind dark text**: "needs your attention" and the active
  question. **Never as text.**
- **Neutrals** are cool and biased toward the violet hue: receipt-paper grey and blue-black ink.
  Never warm cream.
- **Semantic colours** are separate from the brand hues and **always paired with a stamp shape
  and a label**. Colour is never the only signal.
- **Carbon-copy tints** mark document roles.

**Measured contrast.** WCAG 2.x relative luminance, computed by script. The figures are against
`paper`; "on surface" is higher in every case except where noted.

| Token | Light | Dark | Use | Contrast light / dark |
|---|---|---|---|---|
| `paper` | `#F3F4F8` | `#111219` | page ground | — |
| `surface` | `#FFFFFF` | `#1A1B25` | sheets, panes | — |
| `ink` | `#161722` | `#ECEDF5` | text | 16.2 / 16.0 |
| `muted` | `#555A6E` | `#A6A9BD` | secondary text | 6.2 / 8.0 |
| `line` | `#D9DBE6` | `#2E3040` | decorative dividers only | 1.25 / 1.43 (**not** for controls) |
| `line-strong` | `#82879B` | `#6C7088` | input and control borders | 3.24 / 3.83 (≥ 3:1 non-text) |
| `stamp` | `#4A2FBF` | `#A99BFF` | primary actions, links, logo | 7.8 / 7.8; white on stamp 8.6; dark paper on dark stamp 7.8 |
| `stamp-strong` | `#36209A` | `#C4BAFF` | pressed / hover | 10.4; white on it 11.5 / dark paper on it 10.5 |
| `meskel` | `#F2C230` | `#F2C230` | highlight fill only; text on it is always light `ink` / dark `paper` | 10.6 / 11.2 |
| `copy-pink` | `#FBE9EE` | `#2A1F27` | drafts awaiting approval | ink on it 15.3 / 13.6 |
| `copy-yellow` | `#FFF6D6` | `#29261A` | file copies / exports | ink on it 16.5 / 13.0 |
| `established` | `#1C6E47` | `#5CC98F` | solid double-ring stamp | 5.7 / 9.1 |
| `unverified` | `#8A5300` | `#F0B44C` | dashed-ring stamp | 5.8 / 10.1 |
| `missing` | `#5B6274` | `#9AA1B5` | empty ring | 5.6 / 7.2 |
| `contradictory` | `#B42A22` | `#FF7A6E` | double-struck stamp | 5.8 / 7.4 |

Re-run `scripts/contrast.py` (added in PR F) whenever a token changes. CI fails below the
targets: 4.5:1 for text and 3:1 for controls.

## 5. Typography

| Role | Face | Why |
|---|---|---|
| Display | **Familjen Grotesk** 500–700 | A grotesque with ink-trap character, used with restraint: titles, big figures, the wordmark |
| UI / body | **Atkinson Hyperlegible Next** | Designed for low-vision legibility; fits a low-literacy, voice-first audience |
| Figures | **Atkinson Hyperlegible Mono** | Tabular numerals for money, receipt tape and tables |
| Ge'ez | **Noto Sans Ethiopic** (UI) · **Noto Serif Ethiopic** (Amharic display headings) | Large x-height; `:lang(am)` line height 1.7 |

All five faces are confirmed available in `next/font/google`.

- **Scale:** 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48. At most 3 sizes per screen. Body text is at
  least 16 px on mobile.
- **Money:** "Br 12,500" / "ብር 12,500", with tabular figures.
- **Dual dates:** "21 Meskerem 2019 EC · 1 Oct 2026".

## 6. Signature components

They are specified in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md#3-signature-components):

- **EvidenceStamp**
- **ReceiptTape**
- **CarbonSheet**
- **FidelJourney**
- **CitationSlip**
- **CostTicket**
- **VoicePill**
- **ScamFlag**
- **DualDate**
- **BirrAmount**
- **TermTooltip**

**The one orchestrated motion:** the EvidenceStamp "press". A 140 ms animation (scale
1.06 → 1, plus the ink settling) plays when a field becomes established. With reduced motion,
the change is instant.

## 7. Layout and composition

- Asymmetric, left-aligned, editorial-tool layouts.
- The workspace is a **ledger spread**: the conversation is a narrow "receipt roll" column and
  the artifact is a wide sheet.
- **Radius scale:** 2 px (stamps, tickets: paper-like), 8 px (sheets), full (pills). Never uniform
  rounding.
- A shadow appears **only on the active sheet**. Separation comes from surface tint and spacing,
  not borders on everything.
- 4 px base / 8 px rhythm. 12 columns on desktop, 4 on mobile.

## 8. Imagery and icons

- Lucide icons at a 1.75 px stroke.
- **Real user photos** (their licence, their workshop) are the imagery.
- Empty states use a single-colour line drawing of the relevant paperwork object (a stamp pad, a
  receipt book) in stamp ink. No 3D art, no stock people.

## 9. Voice and tone

Plain, warm, specific, never hype. Always say where a number came from. "I don't know yet" is
acceptable copy. See [content guidelines](content-guidelines.md).

## 10. Review process

1. This document, [tokens.json](tokens.json) and a **brand board with key-screen mockups**
   (published as a private artifact: [brand board v2](https://claude.ai/artifact/UAUbLsy9cXYWMkSHCwMizy))
   are reviewed by the owner. The mockups cover onboarding,
   Home, Talk with ReceiptTape, Opportunities and CostTicket, at 390 and 1440, in light and dark,
   in 3 languages.
2. Optionally, the same frames and a component library go to Figma.
3. **The owner approves the brand board before PR F starts.**
4. PR F generates `web/src/styles/tokens.css` from `tokens.json` (`npm run tokens`). A test fails
   if they drift.
