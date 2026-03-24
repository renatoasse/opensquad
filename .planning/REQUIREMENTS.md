# Requirements: opensquad Skill Ecosystem Expansion

**Defined:** 2026-03-24
**Core Value:** Any `opensquad` user should be able to add powerful external capabilities to squads with near-zero developer friction.

## v1 Requirements

### Skill Core

- [ ] **SKILL-01**: Maintainer can ship a bundled `resend` skill in the `opensquad` catalog using the existing `skills/<id>/SKILL.md` format
- [ ] **SKILL-02**: An installed `resend` skill exposes Resend email capabilities through the official MCP server as the default integration path
- [ ] **SKILL-03**: Agents that receive the `resend` skill get clear usage instructions for single-send and batch-send workflows

### Onboarding

- [ ] **ONBD-01**: User can complete Resend setup through an interactive guided flow without manually editing environment files
- [ ] **ONBD-02**: Guided setup collects and persists the Resend API key for future squad and agent runs
- [ ] **ONBD-03**: Guided setup explains sender/domain prerequisites and captures a default sender address when available
- [ ] **ONBD-04**: User can re-run or repair Resend setup after an incomplete or invalid configuration

### Activation

- [ ] **ACTV-01**: When a user requests a squad or agent workflow that needs email sending, `opensquad` detects that email capability is required
- [ ] **ACTV-02**: When email capability is required and no email provider is configured, `opensquad` recommends or installs the Resend skill as the default v1 provider
- [ ] **ACTV-03**: Email-capable squads can reuse existing Resend configuration without repeating first-time setup prompts on every run

### Delivery

- [ ] **DLVR-01**: An agent can send a single email through the Resend-backed skill with sender, recipient, subject, and body content
- [ ] **DLVR-02**: An agent can send a batch email request through the Resend-backed skill for up to the provider-supported batch size
- [ ] **DLVR-03**: Email send flows return actionable success or failure feedback to the user
- [ ] **DLVR-04**: Batch send flows report results clearly enough for the user to understand whether the run succeeded or needs retry/review

### Provider Selection

- [ ] **PROV-01**: `opensquad` treats email sending as a capability that can be satisfied by more than one skill/provider
- [ ] **PROV-02**: When exactly one configured email provider is available, `opensquad` selects it automatically
- [ ] **PROV-03**: When multiple configured email providers are available, `opensquad` verifies which one should be used instead of assuming Resend
- [ ] **PROV-04**: Provider selection logic can prefer Resend as the default recommendation only when no other configured email provider has already been chosen

## v2 Requirements

### Contacts

- **CONT-01**: User can import contacts into the chosen email provider from prompt-structured data
- **CONT-02**: User can import contacts into the chosen email provider from CSV input
- **CONT-03**: Contact import reports validation errors and partial failures clearly

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full Resend platform support (broadcasts, webhooks, analytics, templates, domains management UI) | Not required to validate the core email capability inside `opensquad` |
| Direct API-first Resend integration in v1 | MCP-first approach minimizes changes and reuses official tooling |
| Provider-agnostic contact management in v1 | Contact workflows are useful but not essential to validate the core email path |
| Manual secret/config setup as the primary workflow | Conflicts with the non-technical onboarding goal |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SKILL-01 | Phase 1 | Pending |
| SKILL-02 | Phase 1 | Pending |
| SKILL-03 | Phase 1 | Pending |
| ONBD-01 | Phase 1 | Pending |
| ONBD-02 | Phase 1 | Pending |
| ONBD-03 | Phase 1 | Pending |
| ONBD-04 | Phase 1 | Pending |
| ACTV-01 | Phase 2 | Pending |
| ACTV-02 | Phase 2 | Pending |
| ACTV-03 | Phase 2 | Pending |
| DLVR-01 | Phase 3 | Pending |
| DLVR-02 | Phase 3 | Pending |
| DLVR-03 | Phase 3 | Pending |
| DLVR-04 | Phase 3 | Pending |
| PROV-01 | Phase 2 | Pending |
| PROV-02 | Phase 2 | Pending |
| PROV-03 | Phase 2 | Pending |
| PROV-04 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

**v2 note:**
- CONT-01, CONT-02, and CONT-03 are intentionally left outside v1 traceability and are represented in the roadmap as Phase 4 follow-on work.

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 after roadmap creation*
