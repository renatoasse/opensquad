# Phase 1 Research: Resend Foundation

**Phase:** 1 - Resend Foundation  
**Date:** 2026-03-24  
**Confidence:** HIGH

## Executive Recommendation

Implement Phase 1 as a bundled `skills/resend/SKILL.md` MCP skill plus a product-owned setup/repair flow in the CLI. Do not try to solve this only with skill instructions or only with `init.js`; the codebase already separates skill packaging from workspace onboarding, and Phase 1 needs both.

The right default transport is the official Resend MCP server via `npx -y resend-mcp` with a stdio `mcpServers.resend` entry. The setup flow should live in `src/skills-cli.js` or a small helper module it calls, because that is where user-facing install/repair prompts already belong. Persist the MCP registration in `.claude/settings.local.json` and persist non-secret setup metadata in `_opensquad/_memory/` so repair can be re-run without re-asking everything.

## Standard Stack

- `skills/resend/SKILL.md` as a bundled `mcp` skill, modeled on `skills/blotato/SKILL.md`
- `npx -y resend-mcp` as the operational backend
- `.claude/settings.local.json` as the authoritative MCP registration file
- `_opensquad/_memory/resend.md` or similar workspace state file for setup status, sender defaults, and repair metadata
- `src/skills-cli.js` as the primary entry point for guided install/setup/repair
- `src/prompt.js` for interactive prompts, including a masked input helper if API key entry happens in the CLI

Concrete skill shape for v1:

- `name: resend`
- `type: mcp`
- `mcp.server_name: resend`
- `mcp.command: npx`
- `mcp.args: ["-y", "resend-mcp"]`
- `mcp.transport: stdio`
- `env: ["RESEND_API_KEY"]`

## Architecture Patterns

1. Keep the Resend package as a normal bundled skill, not a special registry.
   `src/init.js` already installs bundled skills by copying `skills/<id>/SKILL.md`, so the new skill should fit that model without a parallel installer.

2. Put onboarding in the CLI, not in the skill body.
   The skill should explain how to use Resend, but the interactive API key/sender capture belongs in `src/skills-cli.js` or a helper it calls.

3. Treat setup as idempotent configuration, not one-time install magic.
   Repair should re-open the same flow, merge only the `resend` MCP entry, and preserve unrelated `.claude/settings.local.json` content.

4. Keep update behavior conservative.
   `src/update.js` currently skips bundled `mcp` and `hybrid` skills. That is a useful safety rail for Phase 1 because auto-installing a broken MCP skill would create a configured-but-unusable state.

5. Persist state in two layers.
   Use `.claude/settings.local.json` for the actual MCP server registration and `_opensquad/_memory/resend.md` for the product-owned record of sender/default setup, completion state, and repair hints.

## Repository Touch Points

- [`skills/README.md`](/Users/mauricio/workspace/opensquad/skills/README.md): add the new `resend` row and mark it as `mcp`
- [`skills/resend/SKILL.md`](/Users/mauricio/workspace/opensquad/skills/resend/SKILL.md): new bundled skill definition and usage instructions
- [`src/skills-cli.js`](/Users/mauricio/workspace/opensquad/src/skills-cli.js): add `setup`/`repair` behavior for `resend`, and route install flows to it when appropriate
- [`src/prompt.js`](/Users/mauricio/workspace/opensquad/src/prompt.js): add a secret-friendly prompt helper if the API key is entered interactively
- [`src/init.js`](/Users/mauricio/workspace/opensquad/src/init.js): leave the generic bundle install path intact; only add a light pointer to Resend setup if needed
- [`src/update.js`](/Users/mauricio/workspace/opensquad/src/update.js): keep the MCP skip rule unless you explicitly want update-time setup, which is higher risk
- [`templates/_opensquad/core/skills.engine.md`](/Users/mauricio/workspace/opensquad/templates/_opensquad/core/skills.engine.md): align the documented install/repair contract with the CLI behavior
- [`templates/_opensquad/core/runner.pipeline.md`](/Users/mauricio/workspace/opensquad/templates/_opensquad/core/runner.pipeline.md): no Phase 1 logic change required unless you want better repair guidance for missing MCP config
- [`.gitignore`](/Users/mauricio/workspace/opensquad/.gitignore) and [`templates/.gitignore`](/Users/mauricio/workspace/opensquad/templates/.gitignore): ensure `.claude/settings.local.json` does not become a commit risk

## Don't Hand-Roll

- Do not build a direct Resend API integration for Phase 1. The project goal is MCP-first, and the current roadmap already reserves API fallback for later only if MCP proves insufficient.
- Do not make `init.js` ask Resend questions for every bundled skill. That would turn fresh workspace bootstrap into a noisy provider setup flow and would be wrong for non-email users.
- Do not add a generic YAML parser just to satisfy one skill. `src/skills.js` currently uses lightweight frontmatter parsing and only needs richer parsing if you decide to generalize beyond Resend.
- Do not write multiple copies of the same secret in `.env`, `.claude/settings.local.json`, and a separate cache file unless you have a clear precedence rule. One authoritative secret path is easier to repair.
- Do not overwrite unrelated `.claude` settings during repair. Merge the `resend` server entry only.

## Common Pitfalls

- Installing the skill without configuring MCP leaves users with a catalog entry that still cannot send mail.
- Saving only docs or preferences, but not the MCP registration, creates a “looks installed but fails at runtime” bug.
- Forgetting sender/domain guidance makes the setup technically complete but operationally unusable for real outbound email.
- Auto-installing the new skill through `update.js` without a repair step will likely produce a broken first run on existing workspaces.
- Hardcoding one IDE path for MCP config is unnecessary here because the repo already standardizes on `.claude/settings.local.json` for pipeline resolution.
- Storing the API key in a tracked file would create a secret leak risk; the ignore rules need to be part of the phase.

## Recommended Slices

1. Ship the bundled skill package.
   Add `skills/resend/SKILL.md`, update `skills/README.md`, and keep the body focused on single-send, batch-send, and the MCP-first path.

2. Add a dedicated setup/repair command.
   Extend `src/skills-cli.js` with a `setup resend` or `repair resend` subcommand that prompts for API key and sender defaults, then writes `.claude/settings.local.json`.

3. Persist setup state explicitly.
   Write a small `_opensquad/_memory/resend.md` record so the CLI can detect incomplete or stale configuration and re-run the same flow.

4. Keep the current install/update contract conservative.
   `src/init.js` should continue to install bundled assets, while `src/update.js` should keep skipping MCP installs unless you intentionally add a targeted follow-up action.

5. Align docs with behavior.
   Update the bundled skill engine docs and the skill catalog so the product contract matches the actual CLI flow.

## Code Examples

```json
{
  "mcpServers": {
    "resend": {
      "command": "npx",
      "args": ["-y", "resend-mcp"],
      "env": {
        "RESEND_API_KEY": "..."
      }
    }
  }
}
```

```js
// CLI-owned setup flow, not SKILL.md behavior.
await ensureResendSkillInstalled(targetDir);
await promptForResendSetup();
await writeMcpSettings(targetDir, {
  resend: {
    command: 'npx',
    args: ['-y', 'resend-mcp'],
    env: { RESEND_API_KEY: apiKey },
  },
});
await writeResendState(targetDir, { senderEmail, configuredAt });
```

```md
## Repair Rule

If configuration is missing or invalid, re-run the same setup flow and merge only the `resend` MCP server entry.
Do not delete unrelated `mcpServers` entries.
```

## Technical Risks

- **Secret handling risk:** `.claude/settings.local.json` will contain the Resend API key unless the CLI writes it somewhere else. That file must be treated as local-only and ignored from version control.
- **Config drift risk:** if the skill, the CLI setup state, and `.claude/settings.local.json` are not updated together, repair will become unreliable.
- **Behavior mismatch risk:** `update.js` currently skips MCP skills. If you later expect `update` to bring Resend in automatically, you will need a deliberate follow-up design rather than a silent tweak.
- **Parser risk:** `src/skills.js` does not currently expose full nested MCP frontmatter. Avoid requiring generic parsing unless you want a broader skill metadata refactor.

## Confidence Notes

This approach fits the current repository structure:

- File-based skill distribution already exists.
- Prompt-driven onboarding already exists.
- Workspace state already persists in `_opensquad/_memory/`.
- The pipeline runtime already expects `.claude/settings.local.json` for MCP skills.

That makes a dedicated Resend setup helper the smallest change that actually satisfies the phase goal.
