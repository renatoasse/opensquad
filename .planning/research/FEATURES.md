# Feature Research

**Domain:** third-party email skill integration for opensquad
**Researched:** 2026-03-24
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Guided Resend onboarding | Non-technical users expect the product to tell them what to do and save the result | MEDIUM | Must help with API key, verified sender/domain expectations, and where config is stored |
| Single email send from squads/agents | This is the core value of the skill | MEDIUM | Resend supports HTML, text, attachments, tags, reply-to, templates, and idempotency on single send |
| Batch email send | Official Resend skill and API position batch send as a standard capability | MEDIUM | API supports up to 100 emails per batch request |
| Automatic agent activation or recommendation | Users should not need internal catalog knowledge to get email capability | HIGH | Resend’s official skill explicitly advertises automatic activation for email tasks; `opensquad` needs analogous behavior |
| Persisted configuration after first setup | Repeated prompts for the same secret or sender address feel broken | MEDIUM | Must remember API key path and sender defaults so users can reuse the skill across squads |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Contact import from CSV | Lets marketing/outreach squads start with real recipient lists instead of manual entry | MEDIUM | Likely implemented as CSV parsing plus repeated contact creation through MCP or direct API fallback |
| Contact import from prompt-structured data | Removes file preparation friction for small lists | LOW | Good for conversational UX and demos |
| Domain-verification guidance in setup | Reduces failed sends and support burden | LOW | Resend requires verified domains to send outside your own addresses |
| Skill auto-install/suggestion during squad creation | Makes email capability feel native to `opensquad` | HIGH | Requires changes in product flows, not just the skill itself |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| “Support the whole Resend platform in v1” | Feels comprehensive | Pulls in broadcasts, domains, templates, webhooks, and lifecycle complexity before the send path is validated | Launch with send + batch + optional contacts |
| Manual secret setup instructions as the main UX | Fastest thing to ship | Violates the product goal of low friction for non-developers | Guided prompts that write config automatically |
| Automatic mass contact import without safeguards | Looks powerful | Risks bad input, duplicates, consent issues, and confusing partial failures | Start with explicit CSV/prompt import plus validation and clear result reporting |

## Feature Dependencies

```text
Guided onboarding
    └──requires──> config persistence
                          └──enables──> automatic reuse by squads

Single send
    └──requires──> Resend MCP skill installation
                          └──requires──> API key + sender/domain guidance

Batch send
    └──requires──> single send foundations

Contact import
    └──enhances──> batch send

Automatic activation
    └──requires──> squad/agent capability detection
```

### Dependency Notes

- **Single send requires onboarding:** users cannot reliably send mail until API key and sender/domain expectations are captured.
- **Batch send depends on the same configuration model:** it should not invent a second setup path.
- **Contact import enhances batch send:** imported contacts are most useful when the product can immediately use them for outreach workflows.
- **Automatic activation depends on product wiring:** the current repository does not appear to auto-suggest/install MCP skills based on requested squad behavior yet.

## MVP Definition

### Launch With (v1)

- [ ] Guided Resend setup with automatic persistence of the API key and sender defaults — essential for non-technical adoption
- [ ] Resend skill bundled into the `opensquad` catalog — essential so users can install/use it in the normal product flow
- [ ] Single email send capability for agents/squads — essential core behavior
- [ ] Batch send capability up to Resend’s supported limits — essential for marketing/outreach use cases
- [ ] Product logic that recommends or installs the skill when email behavior is requested in squad creation — essential to reduce discovery friction

### Add After Validation (v1.x)

- [ ] Contact import from prompt data — add once the send path is proven and the UX remains simple
- [ ] Contact import from CSV — add once validation/reporting is in place
- [ ] Better sender/domain troubleshooting guidance — add if onboarding failures show up in real use

### Future Consideration (v2+)

- [ ] Broadcasts and audience/segment management — defer until single/batch workflows are stable
- [ ] Template management inside `opensquad` — defer until there is evidence users need product-managed email templates
- [ ] Webhooks, analytics, inbound handling, and advanced domain controls — defer because they are outside the initial job to be done

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Guided setup + config persistence | HIGH | MEDIUM | P1 |
| Single email send | HIGH | MEDIUM | P1 |
| Batch send | HIGH | MEDIUM | P1 |
| Auto-suggest/auto-install skill in squad flow | HIGH | HIGH | P1 |
| Contact import from prompt | MEDIUM | LOW | P2 |
| Contact import from CSV | MEDIUM | MEDIUM | P2 |
| Broader Resend platform support | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Official email skill | Resend offers an official skill with automatic activation for email tasks | Resend also offers the MCP server directly | Adapt official primitives to `opensquad` instead of building a parallel email abstraction first |
| Batch sending | Official Resend skill supports single and batch send | API supports up to 100 per request | Expose batch in a way that matches squad workflows |
| Contact management | MCP covers contacts broadly | Official skill page emphasizes sending more than contact workflows | Keep contacts optional in early phases, likely through MCP reuse |

## Sources

- https://resend.com/docs/resend-skill
- https://resend.com/docs/mcp-server
- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/api-reference/emails/send-batch-emails
- https://resend.com/docs/api-reference/contacts/create-contact
- `README.md`, `src/init.js`, `src/skills-cli.js`, `templates/_opensquad/core/skills.engine.md`

---
*Feature research for: third-party email skill integration for opensquad*
*Researched: 2026-03-24*
