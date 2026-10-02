# UX principles: not AI slop

> **What this is:** the banned and required patterns, and the checklist every UI PR passes.
> **Who reads it:** designers, front-end engineers, reviewers.
> **Last reviewed:** 2026-10-02

## 1. Banned

- Gradient blobs, glows, glassmorphism, gradient text.
- "✨ AI" or sparkle badges; "AI-powered" in copy.
- Floating decorative chips; stock 3D illustrations; stock people.
- Emoji headings; decorative 01/02/03 numbering.
- Generic icon-card grids ("Feature · Feature · Feature").
- Chat-only screens with no artifact.
- Hype copy: "supercharge", "seamless", "revolutionise", "unlock", "effortless".
- Vague spinners with no stage text.
- Uniform `rounded-lg` cards with coloured accent rails; centred-everything layouts.

The interim FundFlow landing page used several of these: blurred blobs, floating chips and a
gradient call to action. They are removed in PR F.

## 2. Required

1. **Workspace first.** The conversation is in one pane and the artifact being built in the
   other. On mobile, two tabs ("Talk" / "Sheet") with a badge when the sheet changes.
2. **Show the work.**
   - Every number opens its ReceiptTape.
   - Every claim opens its CitationSlip.
   - Every field shows its EvidenceStamp.
3. **Editorial, ledger-like visuals.** Strong type hierarchy, generous whitespace, real tables,
   tabular figures, restrained colour.
4. **Plain, specific copy** in the user's language. Every business term has a TermTooltip, and
   every question has a "why we ask" line.
5. **Voice affordances.** Push-to-talk, an editable transcript, read-back, and playback of
   replies.
6. **Real states, specific to the stage.** "Reading your licence…", not "Loading…". Errors
   always offer a recovery action.
7. **Accessibility and low literacy.** WCAG 2.2 AA, 44 px targets, audio for every prompt,
   390 px first, reduced motion.
8. **Honest money.** A CostTicket before paid actions; balance always reachable in one tap.
9. **Ethiopian context through content:** birr, EC dates, kebele, Ge'ez. Not through ornament.

## 3. Anti-slop checklist

Paste into every UI PR body:

```
- [ ] No gradients, glows, glass, sparkle/AI badges, emoji headings, stock 3D or people
- [ ] No hype words; copy is plain and specific, in locale files
- [ ] Every number has a trace; every claim has a source; every field has a stamp
- [ ] Stage-specific loading text; errors have a recovery action
- [ ] Workspace layout (conversation + artifact), not chat-only
- [ ] Real tables for tabular data, tabular figures for money
- [ ] Colour never the only signal; contrast checked
- [ ] Screenshots 390 / 1440, light / dark, one Ethiopic language
```

## 4. Balanced creativity

The product must be **simple but not plain**, and creative without being distracting. The expressive
layer is **paperwork objects, and each one carries meaning**. They are information design first.

| Motif | Means | Component |
|---|---|---|
| Paper clip | Attached evidence: a source clipped to the field it supports | `PaperClip` |
| Receipt tape (torn edge, double underline) | A calculation or a log | `ReceiptTape` |
| Perforated ticket edge | A cost | `CostTicket` |
| Carbon-copy offset stack | Versions and document roles (original, draft, file copy) | `CarbonStack`, `CarbonSheet` |
| Ledger ruling | A table of facts | `LedgerRule` |
| Stamp press | "Now checked": a field becomes established | `EvidenceStamp` |

### Delight budget (per screen)

| Budget | Limit |
|---|---|
| Motion moments | **1** (600 ms or less; the landing hero prints once, 2.5 s or less) |
| Paperwork motifs | **2**, each used for its meaning |
| Bold colour blocks | **1**: a Meskel highlight *or* a stamp-ink panel, not both |
| Glows, gradients, textures, confetti | **0** |

- **Illustrations** are single-colour line drawings in stamp ink, for empty states and the
  landing page.
- **Motion** always has a purpose (feedback, or showing that something was produced). With
  reduced motion, the final state shows immediately. Nothing animates on scroll.
- **Test:** remove a motif. If the screen loses no information, the motif was decoration.

### Too plain, balanced, too much

| Too plain | Balanced | Too much |
|---|---|---|
| Identical cards everywhere | Real documents and tables as the main surface | Motifs on every card |
| Numbers without a trace | One yellow highlight marks what needs you now | Confetti, glows, sparkles |
| "No data" empty states | A clip, torn edge or stamp only where it means something | Animation on every scroll |
