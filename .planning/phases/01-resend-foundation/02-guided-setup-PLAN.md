---
wave: 2
depends_on:
  - 01-skill-package-PLAN.md
files_modified:
  - src/skills-cli.js
  - src/prompt.js
  - package.json
  - skills/README.md
requirements:
  - ONBD-01
  - ONBD-02
  - ONBD-03
autonomous: true
---

# Objective
Add an interactive Resend setup flow that captures the API key and sender defaults, persists the MCP registration, and records non-secret state so setup can be completed without editing environment files by hand.

## must_haves
- `opensquad skills setup resend` runs an interactive flow that asks for the Resend API key and sender/domain context.
- The API key prompt is masked and does not echo the secret in the terminal.
- The setup flow writes `.claude/settings.local.json` with a merged `mcpServers.resend` entry using `npx -y resend-mcp`.
- The setup flow writes `_opensquad/_memory/resend.md` with non-secret setup state, including the chosen default sender address when available.
- The flow is idempotent enough to be run again without forcing the user to edit `.env` or `.claude/settings.local.json` manually.

## verification
- `opensquad skills setup resend` prompts for the API key and sender details in a throwaway workspace.
- `.claude/settings.local.json` contains a `mcpServers.resend` entry with `command`, `args`, and `env.RESEND_API_KEY`.
- `_opensquad/_memory/resend.md` exists and records sender/default setup state without secrets.
- The prompt helper masks secret input and still supports the existing non-secret prompt flows.

## tasks
<task id="add-secret-prompt-helper">
  <objective>Add a masked prompt helper so the API key is never shown in plain text while typing.</objective>
  <read_first>
    - `src/prompt.js`
    - `package.json`
    - `src/skills-cli.js`
  </read_first>
  <action>
    - Add `@inquirer/password` to `package.json` and expose a `askSecret(question)` helper from `createPrompt()` in `src/prompt.js`.
    - Keep the existing `ask`, `choose`, and `multiChoose` behaviors unchanged while adding a single secret-input path for `RESEND_API_KEY`.
    - Use the helper from the Resend setup flow instead of reusing the plain text input widget for the API key prompt.
  </action>
  <acceptance_criteria>
    - The prompt module exposes a masked input path for secret collection.
    - Existing prompt types still behave exactly as before.
    - The Resend setup flow can call a dedicated secret prompt helper for the API key.
  </acceptance_criteria>
</task>
<task id="persist-resend-setup-state">
  <objective>Implement the first-run setup flow that writes both the MCP config and the workspace-owned state file.</objective>
  <read_first>
    - `src/skills-cli.js`
    - `.planning/phases/01-resend-foundation/01-RESEARCH.md`
    - `skills/resend/SKILL.md`
  </read_first>
  <action>
    - Add a `setup resend` subcommand in `src/skills-cli.js` that collects `RESEND_API_KEY`, asks for the default sender address, and explains the sender/domain prerequisite before completion.
    - Write `.claude/settings.local.json` with only the `mcpServers.resend` entry merged in, preserving any unrelated existing settings and using `command: "npx"` plus `args: ["-y", "resend-mcp"]`.
    - Write `_opensquad/_memory/resend.md` with setup status fields such as `configured_at`, `default_sender_email`, and a non-secret completion marker so later runs can detect that setup already happened.
    - Route `opensquad skills install resend` through the same setup helper when the `resend` skill is installed so users do not need to hand-edit any config files after installation.
  </action>
  <acceptance_criteria>
    - Running the setup command creates or updates `.claude/settings.local.json` and `_opensquad/_memory/resend.md`.
    - The state file contains sender/default metadata but no API key.
    - The setup flow completes without asking the user to edit `.env` or `.claude/settings.local.json` manually.
  </acceptance_criteria>
</task>
<task id="document-install-expectations">
  <objective>Make the user-facing install docs point to the guided setup flow.</objective>
  <read_first>
    - `skills/README.md`
    - `src/skills-cli.js`
  </read_first>
  <action>
    - Add a short `Resend setup` note to `skills/README.md` that tells users to run `opensquad skills setup resend` after installing the skill.
    - Keep the note specific to Resend so the rest of the skill catalog does not inherit setup-only guidance.
  </action>
  <acceptance_criteria>
    - The catalog README tells users how to finish the Resend setup flow.
    - The note is specific to `resend` and does not change the meaning of other catalog entries.
  </acceptance_criteria>
</task>
