# How to add a translation

> **What this is:** adding or changing user-facing text.
> **Who reads it:** contributors. **Last reviewed:** 2026-10-02

1. Add the key to `locales/en.json` (the web uses `web/src/lib/i18n.ts` until PR D), with
   context in `_context.json`.
2. Add drafts to `am.json` and `om.json` with `reviewed_by: null`.
3. Use placeholders for numbers and dates (`{amount}`, `{date}`), never concatenated
   strings.
4. Run the key-completeness check (CI).
5. Request native review per the [translation workflow](../../i18n/translation-workflow.md).
   Legal and declaration text must be reviewed before release.
