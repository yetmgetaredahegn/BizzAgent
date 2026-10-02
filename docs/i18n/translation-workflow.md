# Translation workflow

> **What this is:** how user-facing text gets into three languages and becomes "reviewed".
> **Who reads it:** engineers adding strings, content reviewers, native-speaker reviewers.
> **Last reviewed:** 2026-10-02

1. **Add the key in English** in `locales/en.json`, with a short context comment in
   `locales/_context.json`: the screen and the meaning.
2. **Draft am and om.** A machine or model draft is allowed **only as a draft**, with
   `reviewed_by: null`. The UI may show it, with a "pending review" flag in development builds.
3. **Native review.** A `content_reviewer` checks:
   - meaning
   - register (plain, respectful)
   - glossary consistency ([glossary](glossary-am-om-en.md))
   - length

   The reviewer sets `reviewed_by` and `reviewed_at`.
4. **Legal and declaration text** must be reviewed before release. Unreviewed legal keys fail the
   release check, not CI.
5. **Changing English** text resets the review fields of am and om for that key.

**Do not:**

- concatenate translated fragments
- put numbers or dates inside strings (use placeholders and the formatters)
- translate brand names ("BizzAgent")
- translate user quotes

How-to: [add a translation](../onboarding/how-to/add-a-translation.md).
