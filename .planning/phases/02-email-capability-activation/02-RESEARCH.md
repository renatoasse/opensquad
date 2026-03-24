# Phase 2 Research: Email Capability Activation

**Phase:** 2 - Email Capability Activation  
**Date:** 2026-03-24  
**Confidence:** HIGH

## Executive Recommendation

Phase 2 should be implemented as a thin activation layer on top of the Phase 1 Resend setup flow, not as a new email subsystem. The best fit for this codebase is:

1. Detect email need during squad creation and agent design in the Architect workflow.
2. Resolve provider choice through a small capability/provider registry instead of hardcoding `resend` everywhere.
3. Reuse the persisted Resend setup from Phase 1 on later runs, and only re-prompt when the saved provider state is missing or stale.

That keeps the current file-based skill model intact while making email feel automatic when a squad actually needs it.

## Where Detection Should Happen

The primary detection point should be the Architect workflow in [`templates/_opensquad/core/architect.agent.yaml`](/Users/mauricio/workspace/opensquad/templates/_opensquad/core/architect.agent.yaml), not `src/init.js`.

Why there:
- The Architect already interprets the user's request and decides what skills the squad needs.
- The existing skill-discovery phase in the Architect template already recommends or installs skills when a squad needs them.
- Email need is a design-time decision, not an install-time bootstrap concern for every user.

The runner should still have a small guard in [`templates/_opensquad/core/runner.pipeline.md`](/Users/mauricio/workspace/opensquad/templates/_opensquad/core/runner.pipeline.md), but only as a preflight check:
- If a squad already declares email-related skills and no provider is configured, the runner should fail with a targeted install/setup prompt.
- It should not be the primary detector, because it lacks the original user intent and would only see the finished squad files.

## Provider Model

Do not model Phase 2 as “install Resend if email appears.” That would hardcode Resend as the permanent implementation and make future providers awkward.

Use a capability-first model instead:
- A provider is something that satisfies the `email` capability.
- `resend` is the default v1 provider, not the only provider.
- Provider resolution should prefer an explicit choice, then a single configured provider, then the default recommendation.

The current repo already has a natural place to extend this:
- [`src/skills.js`](/Users/mauricio/workspace/opensquad/src/skills.js) parses installed skill metadata, but it currently ignores provider-oriented capability details like `categories`.
- The Phase 2 abstraction should either parse those categories or add a dedicated `provides:` field so provider matching can be data-driven instead of string-matched on `resend`.

Recommended shape:
- `capability`: `email`
- `provider id`: `resend` today, potentially others later
- `selection rule`: `explicit choice > one configured provider > default recommendation`

That lets the product say “email is available” without baking Resend into every code path.

## Reusing Existing Resend State

Phase 1 already persists the actual setup in two places:
- `.claude/settings.local.json` contains the MCP server registration and API key.
- `_opensquad/_memory/resend.md` records non-secret setup state and repair markers.

Phase 2 should treat those files as the source of truth for later runs, not ask the user again.

Practical behavior:
- If `mcpServers.resend` exists and `_opensquad/_memory/resend.md` reports a complete setup, reuse it silently.
- If the workspace already has a configured provider, auto-select it on later runs.
- If the provider state is incomplete, call the same Phase 1 setup/repair flow rather than introducing a new path.

The most likely implementation home is [`src/skills-cli.js`](/Users/mauricio/workspace/opensquad/src/skills-cli.js), because it already owns the Resend setup/repair logic. Phase 2 should factor that into reusable helpers instead of duplicating the setup checks in multiple commands.

## Most Likely Code Touch Points

- [`templates/_opensquad/core/architect.agent.yaml`](/Users/mauricio/workspace/opensquad/templates/_opensquad/core/architect.agent.yaml): add email-intent detection and make the Architect recommend or include the right email provider skill during squad design.
- [`templates/_opensquad/core/skills.engine.md`](/Users/mauricio/workspace/opensquad/templates/_opensquad/core/skills.engine.md): extend skill discovery/resolution so email-capable squads can surface provider recommendations and install the default provider when none is configured.
- [`templates/_opensquad/core/runner.pipeline.md`](/Users/mauricio/workspace/opensquad/templates/_opensquad/core/runner.pipeline.md): add a preflight check that reuses configured provider state and fails with a targeted setup prompt when no provider exists.
- [`src/skills-cli.js`](/Users/mauricio/workspace/opensquad/src/skills-cli.js): extract reusable provider-resolution helpers from the Resend-specific setup flow and use them for “already configured” detection.
- [`src/skills.js`](/Users/mauricio/workspace/opensquad/src/skills.js): expose enough skill metadata to identify provider capabilities without special-casing `resend`.
- [`src/init.js`](/Users/mauricio/workspace/opensquad/src/init.js): keep only the post-init hint; do not move email detection into workspace bootstrap.

## Recommended Implementation Slices

1. Add a provider-resolution helper layer.
   Create a small helper module or equivalent functions that answer:
   - which email providers are configured
   - which provider should be selected
   - whether the selected provider needs setup or repair

2. Wire detection into the Architect flow.
   Update the squad-creation prompt so email-heavy requests trigger provider recommendation/install at design time, before the squad is written.

3. Reuse Phase 1 state automatically.
   Make the Phase 2 checks read `_opensquad/_memory/resend.md` and `.claude/settings.local.json` first, then skip prompts when the provider is already healthy.

4. Keep the fallback explicit.
   If no provider is configured, recommend Resend as the default v1 choice, but do not make the rest of the pipeline assume Resend is the only valid email backend.

## Risks

- `src/skills.js` currently has lightweight frontmatter parsing, so capability-based matching will need a deliberate metadata extension.
- `src/skills-cli.js` is still Resend-specific; if the provider abstraction is not extracted now, the hardcoding will spread into more commands later.
- Auto-installing a provider from the design flow can surprise users if the prompt is too aggressive, so the first install should still be explicit and reversible.
- Secret/config drift remains a risk if capability selection, `.claude/settings.local.json`, and `_opensquad/_memory/resend.md` are not updated together.

## Phase 2 Slice Recommendation

The safest delivery order is:

1. Teach the Architect to detect email needs and recommend a provider during squad creation.
2. Extract provider selection and reuse logic from the Resend setup flow.
3. Extend metadata parsing so the selection logic can work with future providers.
4. Add runner preflight checks only as a guardrail, not as the main activation path.

That sequence keeps Resend working, avoids hardcoding it as the permanent answer, and gives later providers a real model to plug into.
