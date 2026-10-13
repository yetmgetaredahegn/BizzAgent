# How to add a calculator

> **What this is:** adding a pure calculation to `bizzagent.modules.calc` (PR C1 onward).
> **Who reads it:** contributors. **Last reviewed:** 2026-10-03

1. Create `modules/calc/<topic>.py` with a function that returns
   `Result{value, steps, inputs_used, warnings}`. No I/O and no LLM imports.
2. Every step is `Step(n, label_key, op, value, input=None)`. Labels are locale keys, so the
   ReceiptTape renders in any language.
3. Write tests with **hand-computed** expectations (show the working in the test docstring), plus
   `hypothesis` property tests for invariants (for example: margin ≤ 100%, break-even ≥ 0).
4. Register the calculator in `modules/calc/registry.py` with its input spec, and export it from
   `modules/calc/__init__.py`. This exposes it at
   `POST /v1/calcs/{name}` and as a numbers-coach tool.
5. Put the tests in `backend/tests/modules/calc/` and add the `FR-NUM` traceability row.
