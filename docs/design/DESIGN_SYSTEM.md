# Design system

> **What this is:** the component library: foundations, signature components (anatomy, states, accessibility, do/don't), core components and the PR checklist.
> **Who reads it:** front-end engineers and designers. The brand rationale is in [BRAND.md](BRAND.md); screens are in [ux-spec.md](ux-spec.md).
> **Last reviewed:** 2026-10-02

## 1. Foundations

- **Tokens.** [tokens.json](tokens.json) is the only source of colours, type, space, radius,
  shadow and motion. Components never use raw hex values.
- **Themes.** Light and dark come from the same token names. Light is the default for
  everyone. Dark is opt-in, and "follow my device" is a third choice, all under Settings →
  Language.
- **Type.** Display: Familjen Grotesk. Body: Atkinson Hyperlegible Next. Figures: Atkinson
  Hyperlegible Mono. Ge'ez: Noto Sans/Serif Ethiopic. Use `font-variant-numeric: tabular-nums`
  for all money.
- **Space.** 4 px base, 8 px rhythm.
- **Radius.** `stamp` 2 px, `sheet` 8 px, `pill` full.
- **Elevation.** Only the active sheet has a shadow.
- **Motion.** 180 ms standard; the stamp press is 140 ms. All motion respects
  `prefers-reduced-motion`.
- **Icons.** Lucide at a 1.75 px stroke. 20 px in UI and 16 px inline. Always paired with a
  label or an `aria-label`.
- **Targets.** At least 44 × 44 px. Focus rings are 2 px `stamp` with a 2 px offset, always
  visible on keyboard focus.

## 2. Accessibility baseline (WCAG 2.2 AA)

- Text contrast at least 4.5:1 and controls at least 3:1 (measured in BRAND §4).
- **Colour is never the only signal.** Provenance uses shape, icon and label.
- Every prompt has audio. Every audio has text.
- Correct `lang` attributes on mixed-language text.
- Live regions for stage events (`aria-live="polite"`) and errors (`assertive`).
- Layout works from 320 px; designed at 390 px first.

## 3. Signature components

### EvidenceStamp

Shows a field's provenance status.

| State | Shape | Icon | Label (en) |
|---|---|---|---|
| `established` | Solid double ring | check | Established |
| `unverified` | Dashed ring | question | Unverified |
| `missing` | Empty thin ring | dash | Missing |
| `contradictory` | Double-struck ring | split arrows | Contradictory |

- **Anatomy:** the ring, an icon and a label in the user's language. On tap or focus, a
  CitationSlip shows the source.
- **Motion:** a 140 ms press (scale 1.06 → 1, ink opacity 0.7 → 1) when a field becomes
  established; none with reduced motion.
- **A11y:** `role="img"` with an `aria-label` such as "Established: from licence photo".
- **Do:** place it next to the value.
- **Don't:** use colour alone, or use it decoratively.

### ReceiptTape

A calculation trace.

- **Anatomy:**
  - numbered monospace lines: `#`, label, operator column (`+ − × ÷ =`), value
  - input lines link to their source
  - the total sits under an **accounting double underline**
- Long tapes collapse to the inputs and the total, with "show all steps".
- **A11y:** rendered as a `<table>` with a caption; operators have text equivalents.
- **Don't:** round in the middle of a calculation; show only the final value.

### CarbonSheet

A document surface tinted by role. Original: `surface`. Draft awaiting approval: `copy-pink`,
edge label "DRAFT COPY". File copy / export: `copy-yellow`, edge label "FILE COPY".

The edge label is text, not just a tint.

### FidelJourney

The 7-stage journey as a 7-cell row, after the fidel chart's 7 orders: idea · validated ·
formalised · operating · growing · funded · expanding.

- The current cell is filled with `stamp`; past cells get an outline and a check.
- At most 3 next actions sit below it.
- On mobile it scrolls horizontally, with the current cell centred.

### CitationSlip

A source card styled as a torn receipt slip (a zig-zag top edge drawn by a CSS mask). It holds
the title, domain or pack entry id, `retrieved_at` or the verification state, and "Open source".

A pack entry that is not verified shows "Unverified source".

### CostTicket

The pay-as-you-go estimate shown before a paid action. It looks like a minibus ticket stub.

- **Anatomy:** action, estimate in credits (a range if it varies), balance after, cap remaining,
  and **Confirm** / **Cancel**.
- **States:** affordable · over threshold (needs confirm) · over cap (blocked, with a link to top
  up) · estimating.
- **Rule:** no paid action starts without it when over the threshold.

### VoicePill

Push-to-talk.

- **States:** idle → listening (a level meter from real input) → transcribing → editable
  transcript → read-back card.
- Hold or tap to toggle. Space bar on desktop. Cancel by swiping away or pressing Escape.
- **Errors:** mic denied (show the text input and how to enable the mic), too quiet, too long.

### ScamFlag · DualDate · BirrAmount · TermTooltip

- **ScamFlag.** A warning stamp plus a list of reasons. It is never just an icon.
- **DualDate.** "21 Meskerem 2019 EC · 1 Oct 2026", in the order of the user's preference.
- **BirrAmount.** "Br 12,500" / "ብር 12,500" with tabular figures. Negatives use a minus sign,
  never only red.
- **TermTooltip.** A dotted underline on business terms. On tap, a 1–2 sentence plain definition
  from the [glossary](../i18n/glossary-am-om-en.md), plus "listen".

### PaperClip · PerforatedEdge · CarbonStack · LedgerRule

- **PaperClip.** An SVG clip (a stamp-ink stroke with a knock-out ring in the surface colour)
  that attaches to the top-right of a field or card. Use it only for **attached evidence**: it
  opens the source (CitationSlip, photo or document). One per field. `aria-label="Evidence:
  <source>"`. Not decorative.
- **PerforatedEdge.** A dashed divider between an action and its price, used by CostTicket. It
  separates a "stub" (the amount) from the "main" (the action).
- **CarbonStack.** Two offset layers behind a sheet (pink, then yellow) to show that a document
  has a draft and a file copy. At most 2 layers. Text remains on the top sheet.
- **LedgerRule.** Faint 1 px horizontal rules between rows (`line` token), no vertical rules and
  no boxed cells. Use for any list of label/value facts.

Delight budget and rules: [ux-principles §4](ux-principles.md#4-balanced-creativity).

## 4. Core components

| Component | Notes |
|---|---|
| AppShell | Left rail on desktop; bottom bar with 5 items + More on mobile; workspace switcher; language button always visible |
| WorkspaceSwitcher | Personal space ("only you") first, then workspaces with their type |
| ConversationPane | The receipt-roll column: turns, stage events, read-back cards |
| ArtifactPane | The wide sheet; tabs per artifact; completeness and provenance summary |
| ReadBackCard | "You said …" with Yes / Fix it / Listen |
| ApprovalCard | What, why, evidence, cost (CostTicket), undo window; Approve / Decline / by voice |
| QuestionCard | A missing fact with "why we ask"; answer inline |
| MissionStep | Status, owner (agent or member avatar), verifier results |
| DataTable | Real tables: sticky header, tabular numbers, a stacked layout on mobile |
| PipelineBoard | Columns: found → shortlisted → preparing → submitted → outcome; keyboard-movable |
| EmptyState | Line drawing in stamp ink, a one-sentence explanation, one primary action |
| StageStatus | "Reading your licence…" in the user's language; never a bare spinner |
| ErrorState | What happened, what to do, retry; error codes hidden behind "details" |
| OfflineBanner | The queued actions count; the last sync time |
| ExportDialog | Format, language, the provenance legend preview |

## 5. PR checklist (every UI PR)

- [ ] Tokens only; no raw colours or sizes.
- [ ] Screenshots at 390 px and 1440 px, light and dark, plus one of am/om.
- [ ] axe scan is clean (no serious or critical issues).
- [ ] Every state is implemented: empty, loading by stage, partial, error with recovery, offline.
- [ ] All strings are in the locale files.
- [ ] The **anti-slop checklist** in [ux-principles](ux-principles.md#3-anti-slop-checklist) is
      ticked.

## 6. Responsive system

The product must work on every device, from a 320 px feature-phone browser to a 1920 px monitor.
Layout is driven by the **size of the container**, not by device guesses.

### Size classes

| Class | Width | Shell | Notes |
|---|---|---|---|
| compact | 320–359 | Bottom bar (5 items + More) | Single column; labels may wrap; no horizontal page scroll |
| phone | 360–599 | Bottom bar | Designed first at 390 |
| tablet | 600–1023 | Collapsed icon rail (labels on focus/hover) | Two-pane screens use tabs |
| laptop | 1024–1439 | Full rail (216 px) | Talk shows the split "ledger spread"; Home gets a side column (320 px) |
| desktop | 1440–1919 | Full rail | More whitespace; content width capped |
| wide | 1920+ | Full rail | Content is capped at 1440 and centred |

Landscape phones (about 844 × 390) use the **phone** layout with a collapsed top bar; foldables
use the class of their current inner width.

### Rules

1. **Mobile first.** Write the narrow layout, then add `min-width` queries.
2. **Container queries** (`container-type: inline-size`) for components that live in different
   places: ReceiptTape, CostTicket, cards, tables, the Home grid. Tables **stack** into
   label/value rows in narrow containers.
3. **Fluid type** with `clamp()` between scale steps. Body stays at 16 px or more; display sizes
   shrink first.
4. **Touch.** `pointer: coarse` raises targets to at least 44 × 44 px with 8 px spacing. Hover
   effects are enhancements only; nothing is reachable only by hover.
5. **No horizontal page scroll** at any width from 320 up. Only tables, code and diagrams may
   scroll inside their own container.
6. **Text zoom.** Layouts hold at 200% text size and 400% browser zoom (a 320 px viewport
   equivalent).
7. **Images and photos** are `max-width: 100%` with explicit aspect ratios, so layout does not
   jump.
8. **Safe areas.** Fixed bars add `env(safe-area-inset-*)` padding.
9. **Ge'ez and Oromo length.** Components tolerate +35% text length; buttons wrap instead of
   truncating.
10. **Performance.** The landing page is under 150 KB of JS on first load; images are lazy
    except the first fold.

Breakpoint tokens are in [tokens.json](tokens.json) (`breakpoint.*`).
