# How to add a knowledge entry

> **What this is:** adding a cited fact to a country pack.
> **Who reads it:** contributors. **Last reviewed:** 2026-10-02

1. **Find an official source** and open it. Copy the exact sentence you rely on.
2. Create `backend/knowledge/<country>/<topic>/<id>.yaml` in the format in
   [COUNTRY_PACKS](../../knowledge/COUNTRY_PACKS.md#2-entry-format). Fill in `excerpt`,
   `retrieved_at` and `review_due`. Leave `verified: false`.
3. Write the `body` in plain English. Every number in it must appear in an `excerpt`. Leave
   am/om as drafts for review.
4. Run `uv run bizzagent knowledge validate` (from C1).
5. Ask a `content_reviewer` to verify the entry; they set `verified_by`.
6. **If you cannot find a source,** write `TODO(source needed)` in the coverage table.
   **Never** add a number.
