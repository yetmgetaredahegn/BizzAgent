# Contributing to BizzAgent

Thanks for helping. Start with [docs/onboarding/GETTING_STARTED.md](docs/onboarding/GETTING_STARTED.md).

## Workflow

1. Branch from the latest base: `feat/…`, `fix/…`, `docs/…`, `chore/…`, `refactor/…`, `test/…`.
2. Keep changes small and focused. Write tests for new behaviour.
3. Update the docs your change affects, in the same PR (SRS IDs, traceability, SAD, ADRs, API
   contract, UX spec).
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/): an imperative
   subject, and a body explaining *why*.
5. Open a PR with the template. UI PRs include screenshots at 390 px and 1440 px and the
   anti-slop checklist.

## Checks

```bash
cd backend && uv run ruff check && uv run ruff format --check && uv run mypy src && uv run pytest -q
cd web && npm run lint && npm test && npm run build
```

## Rules that are never broken

- Never invent legal, tax or market facts. Cite a source, or write `TODO(source needed)`.
- All people and businesses in fixtures are fictional.
- No secrets in the repository.
- The human contributor is the author of commits and PRs.

The full rules are in [docs/engineering/ENGINEERING_RULES.md](docs/engineering/ENGINEERING_RULES.md).
