# Architecture Research

**Domain:** third-party email skill integration for opensquad
**Researched:** 2026-03-24
**Confidence:** HIGH

## Standard Architecture

### System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Squad Creation / Run UX                 │
├─────────────────────────────────────────────────────────────┤
│  Intent detection   Skill recommendation   Guided setup    │
│  ("needs email")    / auto-install         / persistence   │
├─────────────────────────────────────────────────────────────┤
│                opensquad Skill Integration Layer           │
├─────────────────────────────────────────────────────────────┤
│  Bundled skill       MCP registration      Config storage  │
│  `skills/resend/`    per supported IDE     `.env` / local  │
├─────────────────────────────────────────────────────────────┤
│                    Resend Execution Layer                  │
│  resend-mcp stdio/http  ->  Resend platform tools         │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Skill package | Declare metadata, MCP config, env needs, and usage instructions | `skills/resend/SKILL.md` following the same pattern as `skills/blotato/SKILL.md` |
| Setup/onboarding flow | Collect API key, sender address, and domain readiness from the user and persist it | Prompt-driven CLI logic using `src/prompt.js` plus file writes to project config/env |
| Skill activation logic | Detect when squads/agents need email capability and surface the Resend skill | Changes in squad creation and/or run orchestration logic, likely near architect/skills engine flows |
| MCP runtime integration | Register and execute the official Resend MCP server | IDE-specific MCP config files plus `npx -y resend-mcp` or equivalent |

## Recommended Project Structure

```text
skills/
├── resend/
│   └── SKILL.md              # MCP metadata + agent instructions

src/
├── skills.js                 # Skill metadata parsing and installation
├── skills-cli.js             # Install/update/remove UX
├── init.js                   # Guided initial workspace setup
├── update.js                 # Refresh/install behavior for shipped skills
├── prompt.js                 # Shared interactive prompts
└── [new setup/helper files]  # Resend-specific setup + config persistence

templates/
├── ide-templates/            # IDE-specific MCP config scaffolds
└── _opensquad/core/          # Product prompts/engines that decide skill usage
```

### Structure Rationale

- **`skills/resend/`:** keeps the feature aligned with the existing catalog model instead of creating a special-case integration path.
- **`src/` onboarding/config code:** current product behavior for prompts and file setup lives here already, so Resend guidance should plug into those flows.
- **`templates/ide-templates/`:** MCP registration is IDE-specific in this product, so configuration needs to respect that distribution mechanism.

## Architectural Patterns

### Pattern 1: MCP-First Adapter

**What:** Treat the official Resend MCP server as the operational backend while `opensquad` owns discovery, installation, and user guidance.
**When to use:** Default for v1.
**Trade-offs:** Fastest path and smallest maintenance surface, but depends on MCP client/config behavior.

**Example:**
```typescript
// Product flow, not current implementation:
if (squadNeedsEmail && !resendSkillInstalled) {
  await installBundledSkill('resend');
  await guideResendSetup();
  await registerResendMcpForSelectedIde();
}
```

### Pattern 2: Capability Detection Before Tool Wiring

**What:** Decide that “email sending is required” at the squad/product level before touching tool setup.
**When to use:** Squad creation, agent generation, or run preflight.
**Trade-offs:** Better UX, but requires reliable intent heuristics or explicit capability declarations.

**Example:**
```typescript
const capabilities = inferCapabilitiesFromPrompt(userIntent);
if (capabilities.includes('email-delivery')) {
  suggestOrAutoInstall('resend');
}
```

### Pattern 3: Fallback Transport Boundary

**What:** Keep direct API integration behind a product-owned boundary in case MCP is insufficient later.
**When to use:** Only after a real MCP gap is confirmed.
**Trade-offs:** Adds code paths, but prevents a rewrite if one missing feature blocks adoption.

## Data Flow

### Request Flow

```text
[User requests marketing/outreach squad]
    ↓
[Architect / squad builder detects email need]
    ↓
[Install or suggest Resend skill]
    ↓
[Guided setup captures API key + sender/domain readiness]
    ↓
[Persist config and IDE MCP registration]
    ↓
[Agent invokes Resend MCP tools for send or batch send]
```

### State Management

```text
[Preferences / env / MCP config files]
    ↓
[Install + setup logic]
    ↓
[Skill available to squads and agents]
    ↓
[Reused across future runs]
```

### Key Data Flows

1. **Capability activation flow:** user intent -> product inference -> skill installation/configuration.
2. **Email execution flow:** agent action -> Resend MCP tool -> Resend platform -> result returned to the squad.
3. **Contact import flow:** prompt or CSV input -> normalized contact rows -> repeated contact creation via MCP/API -> import summary.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1 skills of this type | Hardcoded onboarding flow is acceptable if kept clean |
| Several external skills | Shared installer/setup abstractions become important so each integration does not duplicate prompt/env/MCP wiring |
| Large skill ecosystem | Capability inference, config storage, and IDE registration should become generic platform services |

### Scaling Priorities

1. **First bottleneck:** one-off onboarding logic per skill — fix by extracting reusable skill-setup helpers.
2. **Second bottleneck:** IDE-specific MCP config drift — fix by centralizing config generation instead of hand-writing per feature.

## Anti-Patterns

### Anti-Pattern 1: “SKILL.md only” integration

**What people do:** Add the skill folder and assume the product now supports it.
**Why it's wrong:** This repo’s current installation UX does not appear to fully automate MCP secret capture and registration for non-technical users.
**Do this instead:** Treat Resend as a product integration plus a skill artifact.

### Anti-Pattern 2: Coupling all email behavior to direct SDK code

**What people do:** Skip MCP and immediately build custom Node wrappers for every send path.
**Why it's wrong:** It duplicates official tooling and increases maintenance before validation.
**Do this instead:** Keep MCP as the default transport and add a fallback boundary only when needed.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Resend MCP server | Local stdio MCP process by default | Official docs include Codex setup and support sender defaults plus API key env |
| Resend Email API | Direct fallback via REST or Node SDK | Requires `Authorization: Bearer ...` and a `User-Agent` header on direct HTTP requests |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `src/skills.js` ↔ bundled `skills/resend/SKILL.md` | File copy + frontmatter parsing | Existing skill-distribution contract |
| `src/skills-cli.js` / `src/init.js` ↔ prompt layer | Direct function calls | Best place for guided onboarding |
| Product prompts/architect flows ↔ skill installation logic | Product decision + install side effects | Needed for automatic suggestion/activation |
| IDE templates ↔ MCP config persistence | File generation/update | Must work for supported IDEs, not only one client |

## Sources

- https://resend.com/docs/mcp-server
- https://github.com/resend/resend-mcp
- https://resend.com/docs/resend-skill
- https://resend.com/docs/api-reference/introduction
- `src/init.js`, `src/skills.js`, `src/skills-cli.js`, `src/update.js`, `src/prompt.js`, `skills/blotato/SKILL.md`, `templates/_opensquad/core/skills.engine.md`

---
*Architecture research for: third-party email skill integration for opensquad*
*Researched: 2026-03-24*
