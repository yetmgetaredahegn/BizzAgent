# How to add a funder call

> **What this is:** publishing a call as a partner, or seeding a fictional one for development.
> **Who reads it:** contributors. **Last reviewed:** 2026-10-02

1. **Seed (development):** add `backend/seeds/calls/<funder>/<call>.json` with the form fields,
   `field_map`, grid criteria and weights, eligibility gate, exclusions, declarations
   (reviewed text keys), languages, deadline and submission mode. **Funders in seeds are
   fictional.**
2. **Partner portal (later):** Calls → New → fill each builder section → Preview score on a
   sample → Publish. Publishing creates an immutable version with a SHA-256 hash.
3. Proposals pin the version current at creation. Changing a call means publishing a new
   version; existing proposals keep theirs.
4. Add a `rules` test: the sample proposal scores as expected under the new configuration.
