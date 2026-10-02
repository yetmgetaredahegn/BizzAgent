# FundFlow web

Next.js 16 (App Router) + Tailwind CSS v4. Landing page, applicant path and
reviewer dashboard for FundFlow.

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
npm run lint
npm test           # vitest: grid, evaluator, contradictions, gaps
npm run build
```

## Routes

| Route | Screen |
| --- | --- |
| `/` | Landing page |
| `/apply` | Intake: language, licence photo, workshop photo (live, calls the API) |
| `/apply/interview` | Voice interview (live, calls the API) |
| `/apply/[case]/pack` | Application pack, sections 1.1–2.6, status per field |
| `/apply/[case]/gaps` | Gap list: why, what it needs, from whom |
| `/apply/[case]/declarations` | Three declarations in Amharic, Afaan Oromo, English |
| `/apply/[case]/score` | Provisional score, eligibility gate, exclusions, grid routing |
| `/apply/[case]/impact` | ImpactProtocol draft |
| `/apply/[case]/submit` | Readiness checklist, JSON download, print, send to reviewer |
| `/review` | Ranked shortlist of the batch, import JSON, export CSV |
| `/review/[id]` | Justification, contradictions, site-visit questions, criteria |

`[case]` is `almaz`, `nahom` or `hiwot` (demo fixtures) or `live` (built from
the voice interview in this browser).

## Where things live

- `src/lib/types.ts`: mirrors of the backend Pydantic schemas, plus view types
- `src/lib/form-schema.ts`: registry of every form field: section, label, what
  evidence establishes it and who provides it
- `src/lib/grid.ts`, `src/lib/evaluate.ts`: deterministic eligibility gate,
  exclusions and weighted grid (illustrative grid, to move to `backend/app/rules.py`)
- `src/lib/contradictions.ts`: licence date vs years, ownership sum, capacity vs
  machinery, staff split
- `src/lib/fixtures/`: fictional demo applications
- `src/lib/i18n.ts`, `src/lib/declarations.ts`: Amharic and Afaan Oromo text
  (first draft, pending native-speaker review)
