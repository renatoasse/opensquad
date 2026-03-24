# Phase 01 / Plan 03: Repair and Hygiene Summary

## Summary

- Added `skills repair resend` in `src/skills-cli.js` so the CLI checks `.claude/settings.local.json` and `_opensquad/_memory/resend.md` for missing or stale setup state before replaying the existing setup flow.
- Kept repair conservative: the CLI merges only `mcpServers.resend` back into `.claude/settings.local.json` and preserves unrelated `mcpServers` entries plus other top-level keys.
- Added a post-init hint in `src/init.js` that points users to `opensquad skills setup resend` when the bundled Resend skill is present.
- Ignored `.claude/settings.local.json` in both `.gitignore` files.
- Updated `templates/_opensquad/core/skills.engine.md` so the MCP docs describe CLI-owned setup/repair behavior and warn against deleting unrelated `mcpServers` entries.
- Marked phase 1 complete in `.planning/STATE.md` and `.planning/ROADMAP.md`.

## Verification

- `npx eslint src/skills-cli.js src/init.js`
- `git diff --check`
- Manual throwaway-workspace run of `node /Users/mauricio/workspace/opensquad/bin/opensquad.js skills repair resend`
- Confirmed the repair flow preserved an unrelated `mcpServers.other` entry and a top-level `theme` key in `.claude/settings.local.json`.
- Confirmed `_opensquad/_memory/resend.md` was rewritten with `configured_at`, `setup_complete: true`, `default_sender_email`, and `sender_domain`.
- `npm test`

## Issues

- None.
