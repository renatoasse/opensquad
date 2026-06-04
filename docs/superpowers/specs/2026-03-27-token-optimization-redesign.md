# Opensquad Token Optimization — CREATE Flow Redesign

**Date:** 2026-03-27
**Status:** Draft
**Problem:** CREATE flow consumes ~12.7M tokens (~R$46) with zero functional output
**Goal:** Reduce to ~200K-500K tokens (~95-97% reduction) while maintaining intelligent squad creation

---

## Problem Statement

The current `/opensquad create` flow is a monolithic single-session process that:

1. **Loads everything at once** — architect.agent.yaml (1,131 lines), 22 best-practices files, sherlock.prompt.md (1,014 lines), skills engine, all in a single context
2. **Accumulates context without reset** — 7 phases in one session means context grows continuously until overflow
3. **Uses MCP Playwright** — screenshots and visual tokens dominate Sherlock's consumption
4. **Fabricates success on failure** — semantic checkpoints allow the system to declare success over empty directories
5. **Result:** 233 requests, 12.7M tokens, 2 context overflow interruptions, zero artifacts

### Root Cause

The architecture treats squad creation as a single intelligent conversation. In reality, it's **4 distinct activities** that don't need shared context:

1. Understanding what the user wants (conversation)
2. Investigating reference profiles (browser automation)
3. Designing the squad structure (architectural reasoning)
4. Generating files (mechanical templating)

---

## Solution: Phase-Based Architecture

Break CREATE into 4 independent phases, each with its own clean context. Phases communicate via **artifacts on disk**, not conversation context.

```
Phase 1: DISCOVERY ──→ _build/discovery.yaml
Phase 2: INVESTIGATION (optional) ──→ _investigations/{profile}/
Phase 3: DESIGN ──→ _build/design.yaml
Phase 4: BUILD ──→ squads/{name}/
```

### Key Principles

- **Context resets between phases** — no accumulation
- **Disk artifacts are the handoff mechanism** — not conversation memory
- **Best-practices loaded only when needed** — referenced by name during Design, loaded during Build and Run
- **Programmatic validation** — file existence checks, YAML parsing, not semantic interpretation
- **Explicit failure** — never fabricate data, never skip silently

---

## Phase 1: Discovery (Intelligent Wizard)

**Purpose:** Understand what the user wants to build through intelligent conversation.

**Inspired by:** Superpowers' Brainstorming skill — one question at a time, multiple choice when possible, adaptive to domain.

### Context Loaded

- Discovery prompt (~150-200 lines)
- `_opensquad/_memory/company.md` (company context)
- `_opensquad/_memory/preferences.md` (user preferences)

**Total: ~250 lines of prompt + conversation**

### What is NOT Loaded

- Zero best-practices files
- Zero Sherlock instructions
- Zero file generation logic
- Zero skills catalog content

### Conversational Flow

```
1. Purpose (open-ended)
   "What do you want this squad to do?"
   — Does not assume domain. Adapts to response.

2. Context exploration (adaptive)
   Questions adapt based on detected domain:
   - Content creation → audience, tone, platforms, formats
   - Research → sources, depth, output format
   - Automation → systems, triggers, frequency
   - Analysis → data inputs, metrics, reports
   - Mixed → decompose into sub-objectives

3. Tools and integrations
   "Does this squad need external tools?"
   (skills, APIs, browser, local files, etc.)

4. Investigation — offered only when relevant
   Only suggested when domain involves content creation
   AND user mentions reference profiles/accounts.

   Options:
   A) Sherlock investigates (next phase)
   B) User provides reference content manually
   C) Skip — go straight to design

5. Summary + confirmation
   Presents discovery.yaml, asks for approval
```

### Output: `_build/discovery.yaml`

```yaml
purpose: "..."
domain: content | research | automation | analysis | mixed
context:
  # structure varies by domain
  audience: "..."       # if content
  tone: "..."           # if content
  platforms: [...]      # if content
  sources: [...]        # if research
  # etc.
tools_needed: [browser, skill_name, ...]
investigation:
  mode: none | sherlock | manual
  targets:
    - url: "https://..."
      platform: instagram
references_provided: []
```

---

## Phase 2: Investigation (Sherlock Lean) — OPTIONAL

**Purpose:** Extract content patterns from reference profiles. Only runs when the user's squad involves content creation and they want to analyze reference accounts.

### When Sherlock is Offered

- Domain involves **content production** (social media, blog, newsletter, etc.)
- User mentions or Discovery identifies **reference profiles** to follow
- For all other domains (research, automation, analysis): Sherlock is **not mentioned**

### When User Provides Manual References

If user chose `mode: manual`:
- System asks user to paste reference content
- Saves to `_investigations/manual/raw-content.md`
- Same output format, no browser needed
- Proceeds to Phase 3

### Architecture: Split by Platform

**Current:** 1 file, 1,014 lines, all platforms loaded always.
**New:** Shared base + 1 file per platform, loaded on demand.

```
_opensquad/core/prompts/
  sherlock-shared.md        (~80 lines — browser setup, output format, error handling)
  sherlock-instagram.md     (~100 lines — Instagram extraction)
  sherlock-youtube.md       (~100 lines — YouTube extraction)
  sherlock-twitter.md       (~80 lines — Twitter/X extraction)
  sherlock-linkedin.md      (~80 lines — LinkedIn extraction)
```

**Context per investigation:** `sherlock-shared.md` + 1 platform file = ~180 lines (vs. 1,014 current)

### Browser Sessions — Playwright CLI

Uses Playwright CLI with `--save-storage` / `--load-storage` for session persistence. Preserves the existing Sherlock instructions about session management (login prompts, session saving, etc.), adapted from browser profile to JSON storage files.

```
_opensquad/_browser_profile/
  instagram.json    # cookies + localStorage
  twitter.json
  youtube.json
  linkedin.json
```

**First access flow:**
1. Check: `_browser_profile/{platform}.json` exists?
2. NO → Inform user about session persistence, open interactive browser:
   `npx playwright open --save-storage=_browser_profile/{platform}.json https://{platform}.com`
3. User logs in manually, closes browser → session saved
4. YES → Use `--load-storage=_browser_profile/{platform}.json`

**Session expiry detection:**
- If redirect to login page detected → report explicitly, request re-login
- Never proceed with expired session

### Extraction — Minimal and Focused

```
For each target in discovery.yaml:
  1. Detect platform from URL
  2. Load sherlock-shared + sherlock-{platform}
  3. Navigate via Playwright CLI
  4. Extract minimum viable content:
     - Last 6-10 posts (not 12-15)
     - Text + basic metrics (not screenshots of each post)
     - Bio and profile data
  5. Save → _investigations/{profile}/raw-content.md
  6. On failure → save _investigations/{profile}/error.md
     (never fabricate data, never proceed silently)
```

### One Platform Per Execution

Each platform target runs as a **separate invocation** with clean context. If the user has 3 profiles across 2 platforms, that's 3 separate lightweight runs, not 1 massive session.

### Programmatic Validation

```
Before proceeding to Phase 3:
  ✓ _investigations/{profile}/raw-content.md exists AND has content?
  ✓ OR _investigations/{profile}/error.md exists?
  If neither → explicit failure, do not proceed
```

---

## Phase 3: Design (Architectural Intelligence)

**Purpose:** Compose the squad structure based on Discovery + Investigation results. This is where AI adds the most value.

### Context Loaded

- Design prompt (~250-300 lines)
- `_build/discovery.yaml` (Phase 1 output)
- `_investigations/*/raw-content.md` (if they exist, summarized)
- `_opensquad/_memory/company.md` (company context)
- Skills catalog — **compact list only** (name + one-line description, not full SKILL.md content)

**Total: ~400-500 lines of prompt + artifacts**

### What is NOT Loaded

- Best-practices file content (only referenced by name)
- Full skill SKILL.md bodies
- No Sherlock prompts
- No file generation templates

### Design Prompt Structure (~250-300 lines)

- How to interpret discovery.yaml — ~30 lines
- How to compose agents (roles, personas, handoffs) — ~100 lines
- How to build pipelines (tasks, checkpoints, dependencies) — ~80 lines
- Available skills catalog (compact list) — ~40 lines
- Output format (design.yaml) — ~50 lines

### Flow

```
1. Read discovery.yaml + investigations (if any)

2. Propose squad structure:
   "Based on what we discussed, I suggest this squad:"

   Agents: [list with roles and responsibilities]
   Pipeline: [ordered task flow with checkpoints]
   Skills needed: [by name]
   Best-practices: [by name]

3. User adjusts (add/remove agents, change order, etc.)

4. Confirmation → save _build/design.yaml
```

### Output: `_build/design.yaml`

```yaml
squad:
  name: "squad-name"
  description: "..."

agents:
  - name: agent-name
    role: role-type
    persona: "brief persona description"
    skills: [skill-names]
    best_practices: [best-practice-names]

pipeline:
  - task: task-name
    agent: agent-name
    output: output-file.md
  - checkpoint: user-approval
  - task: next-task
    agent: other-agent
    input: output-file.md
    output: final.md

investigation_refs:
  - _investigations/profile/raw-content.md
```

---

## Phase 4: Build (Mechanical Generation)

**Purpose:** Take the approved design.yaml and generate squad files. Minimal AI needed — mostly templating.

### Context Loaded

- Build prompt (~150-200 lines)
- `_build/design.yaml` (Phase 3 output)
- Best-practices referenced in design — **loaded now**, but only the ones needed (e.g., if squad uses 2 best-practices, load 2, not 22)

**Total: ~200 lines of prompt + design.yaml + selected best-practices**

### Flow

```
1. Read design.yaml

2. For each agent in design:
   - Load referenced best-practices (on demand)
   - Generate persona from discovery + investigation + best-practice
   - Write {agent-name}.agent.md

3. Generate squad.yaml (metadata + pipeline)

4. Programmatic validation:
   ✓ squad.yaml exists and is valid YAML?
   ✓ Each agent referenced in pipeline has .agent.md?
   ✓ Referenced skills are installed?
   ✓ Referenced best-practices exist in catalog?

   On failure → report exactly what's missing
   (never fabricate, never skip)

5. Present summary to user:
   "Squad created:
    squads/{name}/
    ├── squad.yaml
    ├── agents/agent1.agent.md
    ├── agents/agent2.agent.md
    └── ...

    Ready to run with /opensquad run {name}"
```

### Cleanup

- `_build/` directory can be removed after successful generation
- Or kept for debugging/auditing — user preference

---

## Token Consumption: Before vs. After

| Phase | Before (monolithic) | After (phased) |
|-------|-------------------|----------------|
| Discovery | ~4,500 (entire architect) | ~800 (light prompt + conversation) |
| Investigation | ~4,000 (entire sherlock) + MCP screenshots | ~600 (1 platform) + Playwright CLI |
| Design | included in architect | ~1,200 (prompt + artifacts) |
| Build | included in architect | ~1,000 (prompt + selected best-practices) |
| Best-practices | ~22 files loaded during create | ~2-3 files on demand during Build |
| Context accumulation | grows until overflow | resets between phases |
| **Total CREATE** | **~12.7M tokens** | **~200K-500K tokens** |

**Estimated reduction: 95-97%**

### Where the Savings Come From

1. **Context reset between phases** — no accumulation across 7 phases
2. **On-demand loading** — only what's needed for the current phase
3. **Playwright CLI instead of MCP** — no visual tokens from screenshots
4. **Programmatic validation** — no AI loops interpreting success/failure
5. **Best-practices deferred to Build/Run** — not loaded during Discovery or Design
6. **Platform-specific Sherlock** — load 180 lines instead of 1,014

---

## File Structure Changes

### New Files

```
_opensquad/core/
  prompts/
    discovery.prompt.md       (~150-200 lines — wizard prompt)
    design.prompt.md          (~250-300 lines — squad composition)
    build.prompt.md           (~150-200 lines — file generation)
    sherlock-shared.md        (~80 lines — browser setup, errors)
    sherlock-instagram.md     (~100 lines — Instagram extraction)
    sherlock-youtube.md       (~100 lines — YouTube extraction)
    sherlock-twitter.md       (~80 lines — Twitter/X extraction)
    sherlock-linkedin.md      (~80 lines — LinkedIn extraction)
```

### Modified Files

```
_opensquad/core/
  architect.agent.yaml       → significantly reduced or replaced by phase prompts
  skills.engine.md           → split into smaller operation files (future optimization)
  runner.pipeline.md         → unchanged for now (RUN flow optimization is separate scope)
```

### Removed Files

```
_opensquad/core/prompts/
  sherlock.prompt.md          → replaced by platform-specific files
```

### Build Artifacts (Temporary)

```
squads/{name}/_build/
  discovery.yaml              → Phase 1 output
  design.yaml                 → Phase 3 output
```

---

## Validation Strategy

### Current (Semantic — Unreliable)

Checkpoints are natural language instructions in the prompt. The AI interprets whether conditions are met. When it can't meet them, it fabricates success.

### New (Programmatic — Reliable)

Each phase transition validates via filesystem checks:

```
Phase 1 → 2: discovery.yaml exists, is valid YAML, has required fields
Phase 2 → 3: For each target:
             raw-content.md exists AND has content
             OR error.md exists (explicit failure recorded)
             OR mode is "none"/"manual" (investigation skipped/manual)
Phase 3 → 4: design.yaml exists, is valid YAML, agents and pipeline defined
Phase 4 done: squad.yaml valid, all agent .md files exist, skills installed
```

**Rule: If validation fails, stop and report. Never fabricate. Never skip.**

---

## Migration Path

This redesign affects only the CREATE flow. The RUN flow (`runner.pipeline.md`) is unchanged in this scope.

### Implementation Order

1. Create new phase prompts (discovery, design, build)
2. Split sherlock.prompt.md into platform files
3. Update the opensquad skill entry point to use phased flow
4. Adapt session persistence to Playwright CLI (`--save-storage`/`--load-storage`)
5. Add programmatic validation between phases
6. Test end-to-end with a real squad creation
7. Remove old monolithic architect.agent.yaml (after validation)

### Backwards Compatibility

- Existing squads are unaffected (RUN flow unchanged)
- Squad YAML format is unchanged
- Agent .agent.md format is unchanged
- Best-practices files are unchanged
- Skills are unchanged

---

## Phase Orchestration

The `/opensquad` skill entry point orchestrates phase transitions:

```
/opensquad create
  → Load discovery.prompt.md → run Phase 1
  → Check discovery.yaml exists
  → If investigation.mode == "sherlock":
      For each target:
        → Load sherlock-shared + sherlock-{platform} → run Phase 2
        → Validate raw-content.md or error.md exists
  → If investigation.mode == "manual":
      → Prompt user to paste content → save to _investigations/manual/
  → Load design.prompt.md + artifacts → run Phase 3
  → Check design.yaml exists
  → Load build.prompt.md + design.yaml + selected best-practices → run Phase 4
  → Validate generated squad files
  → Done
```

Each "run Phase N" is a **separate subagent dispatch** with clean context. The orchestrator (the skill prompt) only carries the minimal state needed to know which phase to run next — it reads artifact existence on disk to determine progress.

If a session is interrupted, the user can resume by running `/opensquad create` again — the orchestrator checks which `_build/` artifacts already exist and resumes from the next incomplete phase.

---

## Out of Scope

- RUN flow optimization (separate effort)
- `skills.engine.md` splitting (future optimization)
- Best-practices deduplication (future optimization — copywriting principles repeated across 8 files)
- Dashboard/UI changes
