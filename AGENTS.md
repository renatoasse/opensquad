# Opensquad Project Guidance

This repository is a brownfield `opensquad` expansion focused on a bundled Resend skill, guided onboarding, automatic activation, and reliable email delivery workflows.

## Working Rules

- Read `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, and `.planning/STATE.md` before changing scope or sequencing work.
- Keep v1 traceability intact: each v1 requirement must map to exactly one phase.
- Do not revert unrelated changes; treat the workspace as shared.
- Prefer small, local edits and preserve the file-based skill/catalog architecture.
- Use `apply_patch` for manual edits.

## Current Planning Context

- Core value: any `opensquad` user should be able to add external capabilities to squads with near-zero developer friction.
- Roadmap order: Resend foundation, email capability activation, delivery workflows, then contact import as follow-on work.
- v1 scope: bundled Resend skill, guided setup with persisted config, automatic activation, single-send, batch-send, and provider selection.
- v2 follow-on: contact import from structured prompt data or CSV.

## Operational Guidance

- When touching roadmap-adjacent files, keep requirements, roadmap, and state aligned in the same change.
- If the user asks for a future phase or new requirement, record it in the planning artifacts rather than leaving it implicit.
- If phase status changes, update `.planning/STATE.md` and any impacted traceability in `.planning/REQUIREMENTS.md`.
- Prefer explicit requirement IDs in discussion and commits so the roadmap stays auditable.

