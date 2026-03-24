---
wave: 3
depends_on:
  - 02-guided-setup-PLAN.md
files_modified:
  - src/skills-cli.js
  - src/init.js
  - templates/_opensquad/core/skills.engine.md
  - .gitignore
  - templates/.gitignore
requirements:
  - ONBD-04
autonomous: true
---

# Objective
Add a repair path for incomplete or invalid Resend setup and keep the local MCP config files out of version control while aligning the skill-engine docs with the new CLI contract.

## must_haves
- `opensquad skills repair resend` re-runs the same guided setup flow when the existing Resend config is incomplete, missing, or invalid.
- The repair path merges only `mcpServers.resend` and preserves unrelated `.claude/settings.local.json` content.
- The repair logic uses the workspace memory file to detect stale or incomplete setup state instead of assuming the user wants a clean reset.
- `.claude/settings.local.json` is ignored in both the repo root and the generated template tree so the API key never becomes a tracked file by accident.
- The skills engine docs describe the local MCP config and the repair contract so the CLI and documentation stay in sync.

## verification
- `opensquad skills repair resend` restores a broken setup without deleting unrelated MCP entries.
- A workspace with extra `.claude/settings.local.json` keys keeps those keys after repair.
- Both `.gitignore` files ignore `.claude/settings.local.json`.
- `templates/_opensquad/core/skills.engine.md` reflects the CLI-owned setup and repair flow for MCP skills.

## tasks
<task id="add-repair-path">
  <objective>Teach the CLI to detect incomplete or invalid Resend configuration and replay the setup flow safely.</objective>
  <read_first>
    - `src/skills-cli.js`
    - `.planning/phases/01-resend-foundation/02-guided-setup-PLAN.md`
    - `.planning/phases/01-resend-foundation/01-RESEARCH.md`
  </read_first>
  <action>
    - Add a `repair resend` subcommand in `src/skills-cli.js` that checks `.claude/settings.local.json` and `_opensquad/_memory/resend.md` for missing or stale setup state.
    - Reuse the same setup prompt flow when repair is needed so the user answers the API-key and sender questions only once per repair cycle.
    - Merge only the `mcpServers.resend` block back into `.claude/settings.local.json`, leaving any unrelated `mcpServers` entries and other top-level keys untouched.
    - Treat invalid or missing Resend state as repairable, not as a hard failure that forces the user to manually edit files.
  </action>
  <acceptance_criteria>
    - Repair can be invoked explicitly with `opensquad skills repair resend`.
    - Repair restores a missing or invalid Resend configuration without clobbering unrelated settings.
    - The same setup flow is reused instead of introducing a second, divergent repair prompt sequence.
  </acceptance_criteria>
</task>
<task id="add-config-and-doc-safety-rails">
  <objective>Keep local MCP config untracked and align the skill-engine documentation with the repairable CLI contract.</objective>
  <read_first>
    - `.gitignore`
    - `templates/.gitignore`
    - `templates/_opensquad/core/skills.engine.md`
    - `src/init.js`
  </read_first>
  <action>
    - Add `.claude/settings.local.json` to `.gitignore` and `templates/.gitignore`.
    - Update `templates/_opensquad/core/skills.engine.md` so MCP skills are described as local-config integrations that can require a CLI setup or repair flow, and so the docs explicitly warn against deleting unrelated `mcpServers` entries.
    - Add a light post-init hint in `src/init.js` that points users to `opensquad skills setup resend` when the bundled `resend` skill is present, without prompting for secrets during init.
  </action>
  <acceptance_criteria>
    - The local `.claude/settings.local.json` file is ignored in both repo and template contexts.
    - The skills-engine docs match the CLI-owned setup and repair behavior.
    - Fresh init can point users to the Resend setup command without turning bootstrap into an interactive email configuration flow.
  </acceptance_criteria>
</task>
