# Roadmap: opensquad Skill Ecosystem Expansion

**Created:** 2026-03-24
**Scope:** v1 requirements mapped 1:1 to phases, with a separate follow-on phase for v2 contact import work
**Current status:** phase 2 in progress; provider registry, shared provider-state checks, and runner guardrails are in place

## Roadmap Summary

This roadmap follows the research recommendation to solve the problem in layers: first make the Resend skill shippable and easy to set up, then make email capability appear automatically when users need it, then validate delivery workflows, and finally carry the contact-import work as the next extension.

Phases 1-3 cover every v1 requirement exactly once. Phase 4 is retained from the research summary as a v2 follow-on so the roadmap stays faithful to the product direction without mixing future work into v1 coverage.

## Phase 1: Resend Foundation

**Goal:** Ship a bundled Resend skill that installs cleanly, uses the official MCP server as the default integration path, and gives non-technical users a guided setup flow that persists configuration automatically.

**Success criteria:**
- The catalog contains a bundled `resend` skill using the existing `skills/<id>/SKILL.md` format and it installs without manual file edits.
- The skill clearly instructs agents how to perform single-send and batch-send workflows through the official Resend MCP path.
- Guided setup collects the Resend API key and any available sender defaults without requiring the user to edit environment files.
- A user can re-run setup after incomplete or invalid configuration and the flow repairs or refreshes saved state.

**Requirements mapped:** SKILL-01, SKILL-02, SKILL-03, ONBD-01, ONBD-02, ONBD-03, ONBD-04

**Progress:** bundled `resend` skill packaged in `skills/resend/SKILL.md`, cataloged in `skills/README.md`, and backed by guided setup and repair flows that persist local MCP config and non-secret state.

## Phase 2: Email Capability Activation

**Goal:** Detect email needs inside squad and agent workflows, automatically recommend or install Resend when no provider is configured, and reuse existing configuration on later runs.

**Success criteria:**
- The product detects that a requested squad or agent workflow needs email capability before the run starts.
- When no email provider is configured, the user is guided toward Resend as the default v1 provider and the skill can be installed from that path.
- Email-capable squads reuse persisted Resend configuration on subsequent runs instead of repeating first-time setup prompts.
- Provider selection logic handles single-provider and multi-provider cases without assuming Resend is always the active choice.

**Requirements mapped:** ACTV-01, ACTV-02, ACTV-03, PROV-01, PROV-02, PROV-03, PROV-04

**Progress:** capability-first email provider registry added in `src/email-providers.js`; `src/skills-cli.js` now reuses shared provider inspection and persistence helpers for Resend setup and repair; the pipeline runner now carries a narrow email-capability guardrail.

## Phase 3: Delivery Workflows

**Goal:** Deliver reliable single-send and batch-send workflows through the Resend-backed skill, with feedback that makes success, failure, and partial failure easy to understand.

**Success criteria:**
- An agent can send a single email with sender, recipient, subject, and body content through the Resend-backed skill.
- An agent can submit a batch email request up to the provider-supported batch size through the same path.
- Successful sends return actionable confirmation to the user, including enough context to continue the workflow.
- Failed or partial batch results clearly identify what needs retry or review.

**Requirements mapped:** DLVR-01, DLVR-02, DLVR-03, DLVR-04

## Phase 4: Contact Import Expansion

**Goal:** Extend the email workflow with contact import once the core send path is proven, starting with prompt-structured data and then CSV input.

**Success criteria:**
- Prompt-structured contact data can be imported into the chosen provider with clear validation feedback.
- CSV contact input can be parsed and imported without manual transformation steps.
- Validation errors and partial failures are reported at a row or record level so the user can correct the import.

**Requirements mapped:** CONT-01, CONT-02, CONT-03

## Ordering Notes

- Phase 1 comes first because setup and skill packaging must exist before any useful email workflow can run.
- Phase 2 follows because users should encounter email capability naturally in squad creation and execution flows.
- Phase 3 validates the actual delivery path after the skill and activation layers are in place.
- Phase 4 stays separate because contact import is valuable, but it is not required to validate the core v1 email capability.
