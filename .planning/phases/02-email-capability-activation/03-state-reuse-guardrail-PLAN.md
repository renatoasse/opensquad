---
wave: 3
depends_on:
  - 01-provider-registry-PLAN.md
  - 02-architect-activation-PLAN.md
files_modified:
  - src/skills-cli.js
  - templates/_opensquad/core/runner.pipeline.md
requirements:
  - ACTV-03
autonomous: true
---

# Objective
Reuse persisted Resend state on later runs and keep runner preflight as a narrow guardrail rather than the primary detection mechanism.

## must_haves
- `opensquad skills setup resend` can detect healthy saved state and skip prompting when `.claude/settings.local.json` and `_opensquad/_memory/resend.md` already describe a complete setup.
- Repair reuses the same setup flow when provider state is missing or stale instead of creating a second prompt path.
- Runner preflight only checks that an email-capable squad has a configured provider and fails fast with a targeted message when it does not.
- The guardrail message points the user back to setup or provider choice instead of trying to rediscover the squad intent itself.

## verification
- A workspace with healthy Resend state does not prompt for the API key again on a later setup or install run.
- Removing only the Resend entries triggers repair while leaving unrelated `mcpServers` entries and top-level JSON keys intact.
- Runner preflight for an email-capable squad with no provider configured exits with a specific setup prompt instead of a generic failure.

## tasks
<task id="reuse-provider-state-in-cli">
  <objective>Make the Resend setup and repair flow reuse saved state before prompting and keep repairs on the same code path as first-run setup.</objective>
  <read_first>
    - `src/skills-cli.js`
    - `.planning/phases/01-resend-foundation/01-VERIFICATION.md`
    - `src/email-providers.js`
  </read_first>
  <action>
    - Add a shared health-check helper that reads `.claude/settings.local.json#mcpServers.resend` and `_opensquad/_memory/resend.md` and returns a ready or repair-needed status.
    - Short-circuit the `resend` setup flow when the provider is already healthy so the API key and sender prompts do not repeat on later runs.
    - If repair is needed, call the same setup routine that phase 1 already uses rather than creating a second prompt sequence.
    - Keep the config merge behavior surgical so unrelated settings and sibling MCP servers remain untouched.
  </action>
  <acceptance_criteria>
    - Healthy Resend state skips prompts.
    - Repair reuses the same setup path.
    - Unrelated config data survives setup and repair unchanged.
  </acceptance_criteria>
</task>
<task id="add-runner-email-guardrail">
  <objective>Add a narrow runner preflight check for email capability so missing provider state fails fast without becoming the primary detection layer.</objective>
  <read_first>
    - `templates/_opensquad/core/runner.pipeline.md`
    - `templates/_opensquad/core/skills.engine.md`
    - `src/skills-cli.js`
  </read_first>
  <action>
    - Add a preflight check that inspects the squad skill list for email capability and verifies that one configured provider exists before execution begins.
    - If no provider is configured, fail with a targeted message that points to `opensquad skills setup resend` and the Architect provider choice flow.
    - Keep the preflight limited to guardrail behavior; it must not try to re-derive intent, install skills, or become the main activation path.
  </action>
  <acceptance_criteria>
    - Email-capable squads fail fast when provider state is missing.
    - The failure message is specific enough for the user to act on immediately.
    - Runner behavior remains secondary to the Architect-time detection and provider selection logic.
  </acceptance_criteria>
</task>
