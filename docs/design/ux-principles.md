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
