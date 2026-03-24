# opensquad Skill Ecosystem Expansion

## What This Is

`opensquad` is a multi-agent orchestration framework that lets users create AI squads from natural-language requests directly inside their IDE. This project initialization focuses on extending that existing product with reusable skills, starting with a Resend-powered email skill that can be adopted by non-technical users with minimal setup friction.

The immediate goal is to make email sending feel native inside `opensquad`: users should be able to create squads whose agents can send emails through Resend without manually wiring low-level configuration. The longer-term direction is to establish a repeatable pattern for adding new third-party skills to the project.

## Core Value

Any `opensquad` user should be able to add powerful external capabilities to squads with near-zero developer friction.

## Requirements

### Validated

- ✓ Users can initialize and update an `opensquad` workspace from the CLI — existing
- ✓ Users can install and manage bundled skills and agents from the project catalog — existing
- ✓ Users can create and run multi-agent squads inside supported IDEs — existing
- ✓ Users can use a generated dashboard/virtual office to observe squad activity — existing
- ✓ `opensquad` can ship a bundled Resend MCP skill in the catalog with agent-facing usage guidance — validated in Phase 1
- ✓ Users can configure and repair Resend setup through guided CLI flows that persist local MCP config and non-secret setup state — validated in Phase 1

### Active

- [ ] Support sending individual emails through Resend from squads and agents
- [ ] Support batch email sending through the same skill
- [ ] Make email-capable agents and squads use or receive the Resend skill automatically when email delivery is needed
- [ ] Establish a low-friction pattern for introducing future third-party skills into `opensquad`

### Out of Scope

- Full Resend platform coverage on v1 (domains, broadcasts, webhooks, analytics, full audience management) — start with the smallest useful email workflow
- Direct API-first Node.js integration in v1 — prefer the official Resend MCP server first, and only add direct API calls if MCP proves insufficient
- Developer-centric setup that assumes users will manually create env vars or edit config files — conflicts with the non-technical onboarding goal

## Context

This is a brownfield project with a working CLI, bundled skill catalog, bundled agent catalog, template-driven project bootstrap, and a dashboard runtime. The codebase map in `.planning/codebase/` shows that `opensquad` already distributes skills and agents as file-based assets, installs them into user workspaces, and persists workspace state under `_opensquad/` and `squads/`.

The current initiative is not to build email infrastructure from scratch. The intended approach is to reuse as much of Resend's existing ecosystem as possible, especially the official MCP server, and fit it into the `opensquad` conventions. If MCP cannot satisfy a real requirement later, direct API usage from Node.js is acceptable as a fallback rather than the default architecture.

The target user is any `opensquad` user, not just the repository maintainer. The skill should therefore work well for non-developers who expect guided setup, automatic persistence of configuration, and sensible defaults. A likely usage path is that marketing or outbound-oriented agents need to send emails as part of a squad workflow, and the product should make that capability feel built-in rather than bolted on.

Contact import is a desirable extension after initial email send and batch send capabilities. The preferred UX is to support importing contacts either from CSV input or directly from prompt-provided data, but this is secondary to getting guided email sending working reliably.

## Constraints

- **Tech stack**: Must fit the existing Node.js 20+ CLI and file-based skill distribution model — minimizes architectural drift
- **Integration strategy**: Reuse the official Resend MCP server first — reduces custom maintenance and speeds delivery
- **User experience**: Setup must be guided and low-friction for non-technical users — this is central to the value of the feature
- **Scope control**: v1 should focus on send email and batch send before expanding into broader Resend functionality — prevents premature complexity
- **Product fit**: The solution should not feel like an optional side integration only advanced users can discover — agents and squad flows should surface it when relevant

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build the first email skill around Resend | Resend already has solid docs and an official MCP server/skill ecosystem to reuse | ✓ Good |
| Prefer MCP integration before direct API calls | Reuse lowers implementation risk and aligns with the goal of minimal changes | ✓ Good |
| Optimize for non-developer onboarding | `opensquad` should reduce friction, not require manual env/config work | ✓ Good |
| Make email usage discoverable or automatic in squad creation flows | Users should not need to know the internal skill catalog to get email capability | — Pending |
| Treat this work as the first pattern for future external skills | The broader project objective is to keep expanding `opensquad` with new skills | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check -> still the right priority?
3. Audit Out of Scope -> reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-24 after Phase 1 completion*
