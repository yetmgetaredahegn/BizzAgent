# Design system

> **What this is:** the component library: foundations, signature components (anatomy, states, accessibility, do/don't), core components and the PR checklist.
> **Who reads it:** front-end engineers and designers. The brand rationale is in [BRAND.md](BRAND.md); screens are in [ux-spec.md](ux-spec.md).
> **Last reviewed:** 2026-10-02

## 1. Foundations

- **Tokens.** [tokens.json](tokens.json) is the only source of colours, type, space, radius,
  shadow and motion. Components never use raw hex values.
- **Themes.** Light and dark come from the same token names. The theme follows the system
  setting, with a manual override.
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
