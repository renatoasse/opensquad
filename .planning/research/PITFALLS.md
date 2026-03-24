# Pitfalls Research

**Domain:** third-party email skill integration for opensquad
**Researched:** 2026-03-24
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Shipping the skill without guided MCP setup

**What goes wrong:**
The skill exists in the catalog, but non-technical users still cannot send email because API keys and MCP registration were never configured.

**Why it happens:**
It is tempting to treat MCP skills as just another `SKILL.md`, but the current repository mainly copies skill files and does not obviously complete end-to-end secret onboarding for MCP users.

**How to avoid:**
Make guided setup part of the feature definition, not a follow-up enhancement. Installation must collect the API key, explain verified sender/domain requirements, and write the needed config automatically.

**Warning signs:**
- Users can install the skill but first send attempts fail immediately
- Documentation says “set `RESEND_API_KEY` yourself”
- Support burden shifts to manual environment editing

**Phase to address:**
Phase 1

---

### Pitfall 2: Choosing direct API integration too early

**What goes wrong:**
The project burns time implementing custom SDK/API wrappers before validating whether the official MCP server already covers the real workflow.

**Why it happens:**
Product teams often assume deeper control is safer, even when official tooling already supports the needed operations.

**How to avoid:**
Keep v1 explicitly MCP-first. Add direct Node.js fallback only after a documented MCP limitation blocks a real user workflow.

**Warning signs:**
- New abstractions appear before the MCP path is tested
- The roadmap includes API fallback before basic MCP onboarding works

**Phase to address:**
Phase 1

---

### Pitfall 3: Over-scoping into the full Resend platform

**What goes wrong:**
The project expands into broadcasts, webhooks, domains, templates, and analytics before single send and batch send are stable.

**Why it happens:**
Resend exposes many capabilities, and once MCP is available it is easy to keep adding scope.

**How to avoid:**
Define v1 around one job to be done: email delivery from squads. Keep contacts optional and defer the rest.

**Warning signs:**
- Requirements mention every MCP capability
- Batch send and setup remain unfinished while advanced features are discussed

**Phase to address:**
Phase 2

---

### Pitfall 4: Ignoring sender/domain prerequisites

**What goes wrong:**
Users finish setup but cannot send to real external recipients because they have no verified domain or valid sender address.

**Why it happens:**
The product focuses on API key collection and under-explains Resend’s sending prerequisites.

**How to avoid:**
Onboarding should explicitly ask for or guide the sender address and explain when domain verification is required. Save sane defaults like `SENDER_EMAIL_ADDRESS` when available.

**Warning signs:**
- Users can send only to themselves or test inboxes
- Frequent “why didn’t my email send?” reports after setup

**Phase to address:**
Phase 1

---

### Pitfall 5: Designing batch/contact flows without validation and partial-failure reporting

**What goes wrong:**
CSV imports or batch sends produce mixed results, but the user receives an opaque success/failure message and cannot recover safely.

**Why it happens:**
Batch-oriented features are often implemented as a loop without product-grade reporting, retry handling, or idempotency guidance.

**How to avoid:**
Return per-item results, use idempotency for sends where applicable, and make import validation explicit before execution.

**Warning signs:**
- No row-level import summary
- No duplicate protection or retry strategy
- Users rerun imports because they cannot tell what succeeded

**Phase to address:**
Phase 3

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing setup only in docs, not config | Faster first ship | Constant onboarding failures and user friction | Never for this project goal |
| Hardcoding only one IDE’s MCP config path | Faster implementation | Inconsistent behavior across supported IDEs | Only for a temporary spike, not a release |
| Treating contact import as raw text passthrough | Low initial complexity | Bad data quality and hard-to-debug failures | Acceptable only for prototype tests |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Resend direct API | Omitting `User-Agent` and getting `403` errors | Use the official SDK or send a valid `User-Agent` header explicitly |
| Resend batch send | Assuming batch supports everything single send does | Respect current limitations: batch does not support `attachments` or `scheduled_at` yet |
| Resend MCP | Omitting a default sender and forcing repeated manual input | Persist sender defaults where possible and guide users through verified sender setup |
| opensquad update flow | Assuming new MCP skills will auto-install like other skills | Account for the repo’s current logic that skips auto-installing newly bundled `mcp` and `hybrid` skills in `src/update.js` |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Naive one-email-per-action loops | Slow outreach workflows and noisy agent behavior | Use batch send when the job fits within Resend’s batch limits | Noticeable even at tens of recipients |
| Unthrottled direct API fallback | `429` rate-limit responses | Respect the default 5 requests/sec per team and centralize throttling if fallback is added | As soon as multiple agents send concurrently |
| Large CSV imports with no chunking/reporting | Long-running jobs and unclear failures | Validate, chunk, and summarize results | Hundreds of contacts and above |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Writing API keys in multiple uncontrolled files | Secret sprawl and accidental leakage | Choose one persisted secret strategy and reuse it consistently |
| Logging full payloads containing recipient data | PII leakage in logs | Log operational metadata, not full email content or full contact rows |
| Letting any squad send without explicit user intent | Abuse or accidental outreach | Gate email capability through squad intent and visible setup/approval rules |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| “Paste this env var manually” as onboarding | Non-technical users get stuck | Prompt for the value and write config automatically |
| Installing the skill but not surfacing it in squad creation | Users do not discover the feature | Detect email-oriented intents and recommend/install the skill inline |
| Contact import with vague prompt expectations | Users do not know acceptable input format | Offer clear prompt and CSV examples plus validation feedback |

## "Looks Done But Isn't" Checklist

- [ ] **Resend skill:** Installed in the catalog and actually configured for at least one supported IDE
- [ ] **Single send:** Works with a persisted sender/default setup, not only by manual ad hoc input
- [ ] **Batch send:** Handles Resend’s current batch limitations and reports per-run outcomes clearly
- [ ] **Onboarding:** Explains verified domain/sender prerequisites, not just API key collection
- [ ] **Automatic activation:** Confirmed in squad creation or run flows, not only documented as an aspiration

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Missing MCP setup | MEDIUM | Add a repair/setup command, re-run guided onboarding, and rewrite MCP config |
| Wrong sender/domain assumptions | LOW | Re-run sender/domain guidance and persist corrected defaults |
| Partial contact import failure | MEDIUM | Produce row-level error output, fix input, rerun only failed rows |
| Direct API fallback missing headers/rate handling | MEDIUM | Add a single product-owned HTTP client wrapper with `User-Agent` and throttling |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Shipping without guided MCP setup | Phase 1 | Fresh non-dev setup succeeds without manual file editing |
| Choosing direct API too early | Phase 1 | MCP-first path is working before any fallback code is planned |
| Over-scoping the feature set | Phase 2 | Requirements remain focused on send, batch, and setup |
| Ignoring sender/domain prerequisites | Phase 1 | Setup explicitly covers sender/domain readiness |
| Weak batch/import reporting | Phase 3 | Batch and import flows return actionable result summaries |

## Sources

- https://resend.com/docs/api-reference/introduction
- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/api-reference/emails/send-batch-emails
- https://resend.com/docs/api-reference/contacts/create-contact
- https://resend.com/docs/mcp-server
- https://resend.com/docs/resend-skill
- https://github.com/resend/resend-mcp
- `src/init.js`, `src/update.js`, `src/skills-cli.js`, `templates/_opensquad/core/skills.engine.md`

---
*Pitfalls research for: third-party email skill integration for opensquad*
*Researched: 2026-03-24*
