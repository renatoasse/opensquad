# Project Research Summary

**Project:** opensquad Skill Ecosystem Expansion
**Domain:** third-party email skill integration for opensquad
**Researched:** 2026-03-24
**Confidence:** HIGH

## Executive Summary

This project is best treated as a product integration problem, not just a new skill folder. The official Resend ecosystem already provides two strong primitives: the `resend-mcp` server for operational access to send, batch send, and contacts; and an official Resend skill that positions single-send, batch-send, retry logic, idempotency, and automatic activation for email tasks as the expected experience. That makes MCP-first the correct v1 strategy.

Research also shows that the highest-risk area is not email delivery itself, but onboarding and activation inside `opensquad`. The current repository already distributes skills well, but its installation/update flows appear optimized for copying skill assets rather than fully guiding MCP setup for non-technical users. The roadmap should therefore start with guided setup, config persistence, and automatic capability activation before expanding into contact import or broader Resend features.

## Key Findings

### Recommended Stack

The recommended stack is a bundled `opensquad` MCP skill backed by the official Resend MCP server, with product-owned setup UX layered on top. This minimizes custom transport code while keeping the option to add a direct Node.js/API fallback later if a real MCP gap appears.

**Core technologies:**
- Resend MCP Server: primary operational backend for send, batch send, and contacts — already official and feature-complete for v1 needs
- `opensquad` Node.js CLI: onboarding, config persistence, and installation logic — already the center of product setup
- Bundled `SKILL.md` skill package: catalog/distribution unit — matches the current product architecture

### Expected Features

The must-have feature set is tightly scoped: guided setup, single send, batch send, and automatic skill surfacing when users request email-capable squads. Contact import is valuable, but should follow the core email path unless it fits cleanly after setup is stable.

**Must have (table stakes):**
- Guided Resend onboarding with saved configuration — users expect the product to handle setup
- Single email send — the core user job
- Batch email send — official Resend capability and an expected marketing/outreach workflow
- Automatic recommendation or installation for email-related squads — users should not need internal skill knowledge

**Should have (competitive):**
- Contact import from prompt data — low-friction conversational workflow
- Contact import from CSV — stronger utility for outreach use cases

**Defer (v2+):**
- Broadcasts, webhooks, analytics, and full lifecycle management — outside the narrow v1 job to be done

### Architecture Approach

The architecture should separate capability detection from transport. `opensquad` should decide that a squad needs email capability, install/configure the Resend skill, persist MCP credentials/default sender values, and then let agents invoke the official MCP tools. This preserves the product’s file-based skill model while avoiding premature custom email infrastructure.

**Major components:**
1. Resend bundled skill — declares MCP metadata and agent instructions
2. Guided setup/config layer — captures API key, sender defaults, and domain readiness
3. Capability activation logic — recommends or installs the skill during squad creation/run setup
4. Resend MCP runtime — executes send, batch, and optional contact operations

### Critical Pitfalls

1. **Shipping without guided MCP setup** — fix by making setup/persistence part of v1, not documentation
2. **Going direct API too early** — fix by validating the MCP-first path before adding fallback code
3. **Over-scoping into the full Resend platform** — fix by keeping v1 centered on send and batch
4. **Ignoring sender/domain prerequisites** — fix by making verified sender/domain guidance explicit in setup
5. **Weak batch/import reporting** — fix by adding row-level or per-item summaries where relevant

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Resend Foundation
**Rationale:** The product cannot meet its core value unless setup and installation are frictionless.
**Delivers:** Bundled Resend skill, guided setup, persisted config, MCP registration strategy
**Addresses:** core setup requirements and single-send readiness
**Avoids:** shipping a useless skill that is installed but not configured

### Phase 2: Email Capability Activation
**Rationale:** Users should encounter the feature in normal squad creation flows, not by reading internal docs.
**Delivers:** Capability detection, recommendation/auto-install behavior, agent/squad wiring
**Uses:** skill metadata and setup outputs from Phase 1
**Implements:** product-level activation logic

### Phase 3: Delivery Workflows
**Rationale:** Once setup and activation exist, the send path can be validated end-to-end.
**Delivers:** single send and batch send workflows with result handling
**Uses:** Resend MCP send and batch capabilities

### Phase 4: Contact Import
**Rationale:** Contact import is useful but should build on validated delivery flows.
**Delivers:** prompt-based import first, CSV import if it fits cleanly, validation/reporting

### Phase Ordering Rationale

- Setup precedes delivery because non-technical onboarding is part of the product promise.
- Activation precedes workflow polish because users need the feature surfaced naturally.
- Contact import follows send/batch because it enhances outreach rather than enabling the base capability.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** IDE-specific MCP config persistence and repair flows across supported clients
- **Phase 2:** Where to best detect email capability inside the squad/architect workflow
- **Phase 4:** CSV parsing, deduplication, and consent/error-reporting details

Phases with standard patterns (skip research-phase):
- **Phase 3:** Resend send and batch semantics are well documented with official sources

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official Resend docs and repo clearly support the MCP-first approach |
| Features | HIGH | User goals align with official send/batch capabilities and the codebase’s product direction |
| Architecture | HIGH | Repository structure makes the integration points visible |
| Pitfalls | HIGH | Main risks are well supported by both official docs and observed codebase constraints |

**Overall confidence:** HIGH

### Gaps to Address

- Multi-IDE MCP configuration details inside `opensquad`: confirm where and how each supported IDE should persist Resend MCP settings during planning
- Auto-install heuristics for squad creation: confirm the exact product layer that should infer “this squad needs email”

## Sources

### Primary (HIGH confidence)
- https://resend.com/docs/mcp-server — official MCP capabilities and setup
- https://github.com/resend/resend-mcp — official repository and setup notes
- https://resend.com/docs/resend-skill — official skill positioning and auto-activation note
- https://resend.com/docs/api-reference/introduction — auth, `User-Agent`, rate limit
- https://resend.com/docs/api-reference/emails/send-email — single-send semantics
- https://resend.com/docs/api-reference/emails/send-batch-emails — batch semantics and limits
- https://resend.com/docs/api-reference/contacts/create-contact — contact creation semantics

### Secondary (MEDIUM confidence)
- `src/init.js`, `src/update.js`, `src/skills.js`, `src/skills-cli.js`, `src/prompt.js`, `templates/_opensquad/core/skills.engine.md`, `skills/blotato/SKILL.md` — current product structure and constraints

---
*Research completed: 2026-03-24*
*Ready for roadmap: yes*
