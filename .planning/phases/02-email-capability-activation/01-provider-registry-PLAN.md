---
wave: 1
depends_on: []
files_modified:
  - src/email-providers.js
  - src/skills.js
  - src/skills-cli.js
requirements:
  - PROV-01
  - PROV-02
  - PROV-03
  - PROV-04
autonomous: true
---

# Objective
Build a capability-first email provider registry so `opensquad` can resolve email as a capability instead of hardcoding `resend` as the only backend.

## must_haves
- The codebase has a shared provider registry that models `email` as a capability and marks `resend` as the default v1 provider only.
- Provider selection follows a stable order: explicit choice first, one configured provider second, default recommendation last.
- `src/skills.js` exposes enough skill metadata to identify provider-oriented skills without special-casing `resend` in call sites.
- `src/skills-cli.js` can ask the shared helper layer which provider is configured, healthy, or needs repair before it decides what to prompt.

## verification
- Unit coverage can resolve the configured provider when exactly one email provider exists.
- Unit coverage can detect ambiguity when more than one email provider is configured.
- Unit coverage can fall back to recommending `resend` when no provider is already chosen.
- Existing Resend setup and repair behavior still preserves unrelated `.claude/settings.local.json` keys.

## tasks
<task id="create-email-provider-registry">
  <objective>Add a shared registry that represents email as a capability with `resend` as the default v1 provider.</objective>
  <read_first>
    - `src/skills.js`
    - `src/skills-cli.js`
    - `templates/_opensquad/core/skills.engine.md`
    - `skills/resend/SKILL.md`
  </read_first>
  <action>
    - Create `src/email-providers.js` with a provider registry shape that includes `id`, `capability`, `skill_id`, `config_path`, `state_path`, and `default_recommendation` fields.
    - Define the registry so `resend` satisfies the `email` capability and is only the default recommendation when no other configured email provider has already been selected.
    - Export helpers named `listConfiguredEmailProviders(targetDir)`, `selectEmailProvider(context)`, `recommendEmailProvider(context)`, and `providerNeedsSetup(providerRecord)` so later waves can reuse the same selection logic.
    - Update `src/skills.js` so `getSkillMeta()` returns provider-relevant metadata from skill frontmatter, including `categories` or `provides` when present, rather than ignoring those fields.
  </action>
  <acceptance_criteria>
    - The registry can identify `email` providers without comparing call sites to the literal string `resend`.
    - Selection order is explicit choice, single configured provider, then default recommendation.
    - `getSkillMeta()` preserves `categories` from skill frontmatter in its returned metadata.
    - `getSkillMeta()` preserves `provides` from skill frontmatter in its returned metadata.
  </acceptance_criteria>
</task>
<task id="refactor-cli-provider-checks">
  <objective>Move the Resend-specific health checks behind the shared provider helper layer so the CLI can reason about configured providers consistently.</objective>
  <read_first>
    - `src/skills-cli.js`
    - `.planning/phases/01-resend-foundation/01-VERIFICATION.md`
    - `.planning/phases/02-email-capability-activation/02-RESEARCH.md`
  </read_first>
  <action>
    - Refactor the Resend setup/repair helpers in `src/skills-cli.js` to call the new provider helper module instead of duplicating selection and health logic inline.
    - Keep the `.claude/settings.local.json` merge behavior scoped to `mcpServers.<providerId>` and preserve all unrelated top-level keys and sibling servers.
    - Add shared status helpers that can report `configured`, `needs_setup`, or `needs_repair` for a provider based on `.claude/settings.local.json` and `_opensquad/_memory/<providerId>.md`.
    - Make the CLI consume the provider helper output so later waves can reuse the same checks for install, setup, repair, and future provider selection flows.
  </action>
  <acceptance_criteria>
    - The CLI no longer duplicates provider health checks in multiple local helper functions.
    - The shared helpers can answer whether a provider is ready to use, needs setup, or needs repair.
    - Resend-specific commands still work after the refactor and continue to preserve unrelated config entries.
  </acceptance_criteria>
</task>
