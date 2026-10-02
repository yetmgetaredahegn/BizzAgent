# ADR-0012: Document exports with docxtpl, HTML → PDF and openpyxl

- **Status:** Accepted
- **Date:** 2026-10-02

## Context

Users submit to off-platform funders, who need real documents.

## Decision

DOCX via docxtpl/python-docx, PDF via HTML templates and WeasyPrint, XLSX via openpyxl, plus JSON. Every template has a provenance legend.

## Consequences

Documents are funders' accepted formats. WeasyPrint needs system libraries, so PDF tests skip when it is unavailable.
