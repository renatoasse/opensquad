# Token Optimization — CREATE Flow Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Break the monolithic CREATE flow (12.7M tokens) into 4 independent phases with context reset, reducing consumption to ~200K-500K tokens (~95-97% reduction).

**Architecture:** Replace the single-session architect.agent.yaml (1,131 lines) + sherlock.prompt.md (1,015 lines) with phase-specific prompts (discovery, design, build) and platform-specific Sherlock files. The `/opensquad` SKILL.md becomes the orchestrator, dispatching each phase as a separate subagent with clean context. Artifacts on disk (`_build/discovery.yaml`, `_build/design.yaml`) serve as the handoff mechanism between phases.

**Tech Stack:** Markdown prompt files, YAML configs, Playwright CLI (replacing MCP)

**Spec:** `docs/superpowers/specs/2026-03-27-token-optimization-redesign.md`

---

### Task 1: Split Sherlock into Platform-Specific Files

**Context:** The current `sherlock.prompt.md` (1,015 lines) loads ALL platform extractors even when investigating a single platform. Splitting into per-platform files means each investigation loads only ~180 lines instead of 1,015.

**Files:**
- Create: `_opensquad/core/prompts/sherlock-shared.md`
- Create: `_opensquad/core/prompts/sherlock-instagram.md`
- Create: `_opensquad/core/prompts/sherlock-youtube.md`
- Create: `_opensquad/core/prompts/sherlock-twitter.md`
- Create: `_opensquad/core/prompts/sherlock-linkedin.md`
- Remove (later, Task 7): `_opensquad/core/prompts/sherlock.prompt.md`

- [ ] **Step 1: Create `sherlock-shared.md`**

This file contains everything shared across platforms. Extract and adapt from `sherlock.prompt.md`:

```markdown
# Sherlock — Content Investigator (Shared)

Sherlock is dispatched by the Opensquad orchestrator to investigate reference profiles during squad creation. Each invocation investigates ONE profile on ONE platform.

## Purpose

When a user provides reference profile URLs, the orchestrator launches one Sherlock subagent per URL. Each subagent navigates to the profile using Playwright CLI, extracts real content, and produces a structured analysis.

## Investigation Mode

The orchestrator passes an `investigation_mode` parameter. Follow the corresponding behavior:

| Mode | Meaning | Behavior |
|------|---------|----------|
| `single_post` | Direct post/reel/tv URL — analyze that one post | Skip profile navigation. Go directly to the post URL. |
| `profile_1` | Scan profile, get 1 post only | Navigate to profile. Collect the most recent 1 post. |
| `profile_5_10` | Scan profile for patterns | Navigate to profile. Collect up to 10 posts. Stop at 10. |

Default (if not specified): `profile_5_10`. This mode applies to Instagram only. YouTube, Twitter/X, and LinkedIn use their own quantity configuration.

## Browser Sessions — Playwright CLI

Sherlock uses Playwright CLI with persistent session storage. Sessions are saved as JSON files in `_opensquad/_browser_profile/`.

### Session Check

Before navigating, check if a session file exists for this platform:

```bash
# Check if session exists
ls _opensquad/_browser_profile/{platform}.json
```

- **If exists:** Use `--load-storage=_opensquad/_browser_profile/{platform}.json` for all navigation
- **If not exists:** See First-Time Setup below

### First-Time Setup

If no session file exists for the target platform:

1. Inform the user: "I need you to log in to {platform} so I can access the content. I'll open the browser — please log in manually and then close it."
2. Open interactive browser:
   ```bash
   npx playwright open --save-storage=_opensquad/_browser_profile/{platform}.json https://{platform-url}
   ```
3. Wait for user to confirm they've logged in and closed the browser
4. The session is now saved for future investigations

### Session Expiry

If during navigation a login wall or redirect to login page is detected:
1. Report explicitly: "Session expired for {platform}. Please log in again."
2. Re-run the first-time setup flow
3. Never proceed with an expired session
4. Never fabricate data if session fails

### Screenshot Saving Rule

When saving screenshots, always use the full path:
```
squads/{squad-name}/_investigations/{username}/screenshots/{filename}.png
```
Never save screenshots to the repo root.

For reading content, prefer `browser_snapshot` (text-based, no file) over `browser_take_screenshot` (image file).

## Prerequisites

### Required for All Investigations
- Playwright CLI: `npx playwright --version` must succeed

### Required Only for Video Content
- yt-dlp: `yt-dlp --version` — if missing: `pip install yt-dlp`
- ffmpeg: `ffmpeg -version` — if missing: `brew install ffmpeg`
- whisper: `whisper --help` — if missing: `pip install openai-whisper`

If video tools are missing, skip video transcription but continue with text content. Log: "Video transcription tools not available — skipping. Text content will still be extracted."

## Failure Handling

**CRITICAL: Never fabricate data. Never declare success over empty results.**

- If extraction fails → save `_investigations/{username}/error.md` with the exact error
- If browser crashes → save what was collected so far + error description
- If platform blocks access → retry once, then save error.md
- Maximum time per profile: 10 minutes. If exceeded, save partial results with note.
- Always produce either `raw-content.md` (success) or `error.md` (failure) — never neither.

## Output Formats

### Raw Content File: `raw-content.md`

Saved to `squads/{squad-name}/_investigations/{username}/raw-content.md`.

[Include the full raw-content.md template from sherlock.prompt.md lines 538-678 — the format is platform-agnostic]

### Pattern Analysis File: `pattern-analysis.md`

Saved to `squads/{squad-name}/_investigations/{username}/pattern-analysis.md`.

[Include the full pattern-analysis.md template from sherlock.prompt.md lines 684-793]

### Consolidated Analysis File: `consolidated-analysis.md`

Saved to `squads/{squad-name}/_investigations/consolidated-analysis.md`.
NOTE: This file is generated by the Design phase, NOT by individual Sherlock subagents.

[Include the full consolidated-analysis.md template from sherlock.prompt.md lines 799-909]

## URL Parsing Rules

| URL Contains | Platform | Extractor File |
|---|---|---|
| `instagram.com` | Instagram | `sherlock-instagram.md` |
| `youtube.com` or `youtu.be` | YouTube | `sherlock-youtube.md` |
| `x.com` or `twitter.com` | Twitter/X | `sherlock-twitter.md` |
| `linkedin.com` | LinkedIn | `sherlock-linkedin.md` |

If URL doesn't match: inform user "Unsupported platform. Supported: Instagram, YouTube, Twitter/X, LinkedIn."
```

Write this file to `_opensquad/core/prompts/sherlock-shared.md`.

**Important:** When writing the actual file, include the FULL output format templates (raw-content.md, pattern-analysis.md, consolidated-analysis.md) extracted verbatim from `sherlock.prompt.md` lines 538-909. The templates shown above as `[Include the full...]` are references to the source content — replace them with the actual template text. Do NOT use placeholders.

- [ ] **Step 2: Create `sherlock-instagram.md`**

Extract from `sherlock.prompt.md` lines 126-267. Adapt all `browser_navigate`, `browser_click`, `browser_snapshot`, `browser_evaluate` MCP calls to use Playwright CLI commands instead.

```markdown
# Sherlock — Instagram Extractor

Load `sherlock-shared.md` before using this extractor.

## URL Patterns

- `instagram.com/{username}` — Profile URL
- `instagram.com/p/{post-id}` — Post URL
- `instagram.com/reel/{reel-id}` — Reel URL

## Pre-extraction: Check Investigation Mode

- **`single_post`**: Skip Profile Grid. Jump directly to Carousel/Reel/Single Image extraction using the exact post URL.
- **`profile_1`** or **`profile_5_10`**: Proceed with Profile Grid Extraction. For `profile_1`, stop after 1 post. For `profile_5_10`, stop after 10 posts.

## Profile Grid Extraction

1. Navigate to profile:
   ```bash
   npx playwright open --load-storage=_opensquad/_browser_profile/instagram.json "https://www.instagram.com/{username}/"
   ```
   [Rest of the Instagram extraction instructions adapted to CLI...]

[Continue with full Carousel Extraction, Reel Extraction, Single Image Extraction, Scrolling sections from lines 156-267, adapted to use Playwright CLI]

## Configuration Defaults

- Default content count: 6-10 most recent posts (reduced from 12-15 for token efficiency)
- Content types: all (carousels, reels, single images)
- Priority: carousels and reels first, then single images
- Stop condition: target count reached OR 3 scrolls with no new content
```

Write to `_opensquad/core/prompts/sherlock-instagram.md`.

**Important:** Extract the FULL Instagram extraction content from `sherlock.prompt.md` lines 126-267. Replace all MCP tool calls (`browser_navigate`, `browser_click`, `browser_snapshot`, `browser_evaluate`, `browser_press_key`) with equivalent Playwright CLI commands (`npx playwright` with `--load-storage`). Reduce default content count from 12-15 to 6-10 per the spec.

- [ ] **Step 3: Create `sherlock-youtube.md`**

Extract from `sherlock.prompt.md` lines 270-358. Same MCP-to-CLI adaptation.

```markdown
# Sherlock — YouTube Extractor

Load `sherlock-shared.md` before using this extractor.

## URL Patterns

- `youtube.com/@{handle}` — Channel URL
- `youtube.com/channel/{id}` — Channel URL (legacy)
- `youtube.com/watch?v={id}` — Video URL
- `youtube.com/@{handle}/videos` — Videos page

[Full YouTube extraction content from sherlock.prompt.md lines 270-358, adapted to CLI]

## Configuration Defaults

- Default video count: 6-8 most recent videos (reduced from 8-10)
- Transcription: subtitles first, audio+whisper fallback
- Priority: most recent first, then highest viewed
- Stop condition: target count reached OR end of uploads page
```

Write to `_opensquad/core/prompts/sherlock-youtube.md`.

- [ ] **Step 4: Create `sherlock-twitter.md`**

Extract from `sherlock.prompt.md` lines 361-448. Same MCP-to-CLI adaptation.

```markdown
# Sherlock — Twitter/X Extractor

Load `sherlock-shared.md` before using this extractor.

## URL Patterns

- `x.com/{username}` — Profile URL
- `twitter.com/{username}` — Profile URL (legacy)
- `x.com/{username}/status/{id}` — Tweet URL

[Full Twitter extraction content from sherlock.prompt.md lines 361-448, adapted to CLI]

## Configuration Defaults

- Default tweet count: 10-15 most recent (reduced from 15-20)
- Content types: standalone tweets and threads (skip replies)
- Priority: threads first, then standalone by engagement
- Stop condition: target count reached OR 3 scrolls with no new tweets
```

Write to `_opensquad/core/prompts/sherlock-twitter.md`.

- [ ] **Step 5: Create `sherlock-linkedin.md`**

Extract from `sherlock.prompt.md` lines 451-527. Same MCP-to-CLI adaptation.

```markdown
# Sherlock — LinkedIn Extractor

Load `sherlock-shared.md` before using this extractor.

## URL Patterns

- `linkedin.com/in/{username}` — Profile URL
- `linkedin.com/in/{username}/recent-activity/all/` — Activity feed
- `linkedin.com/posts/{post-id}` — Post URL

[Full LinkedIn extraction content from sherlock.prompt.md lines 451-527, adapted to CLI]

## Configuration Defaults

- Default post count: 8-12 most recent (reduced from 10-15)
- Content types: text posts, document/carousel posts, articles
- Priority: long-form text and articles first
- Stop condition: target count reached OR 3 scrolls with no new posts
```

Write to `_opensquad/core/prompts/sherlock-linkedin.md`.

- [ ] **Step 6: Verify all 5 Sherlock files exist and have content**

Run:
```bash
wc -l _opensquad/core/prompts/sherlock-shared.md _opensquad/core/prompts/sherlock-instagram.md _opensquad/core/prompts/sherlock-youtube.md _opensquad/core/prompts/sherlock-twitter.md _opensquad/core/prompts/sherlock-linkedin.md
```

Expected: All files exist. sherlock-shared.md should be ~250-350 lines (includes output templates). Platform files should each be ~60-120 lines. Total across all 5 files should be roughly comparable to the original 1,015 lines of sherlock.prompt.md (content is preserved, just split).

- [ ] **Step 7: Commit**

```bash
git add _opensquad/core/prompts/sherlock-shared.md _opensquad/core/prompts/sherlock-instagram.md _opensquad/core/prompts/sherlock-youtube.md _opensquad/core/prompts/sherlock-twitter.md _opensquad/core/prompts/sherlock-linkedin.md
git commit -m "refactor(sherlock): split monolithic prompt into platform-specific files

Split sherlock.prompt.md (1,015 lines) into:
- sherlock-shared.md (browser setup, output formats, error handling)
- sherlock-instagram.md (Instagram extractor)
- sherlock-youtube.md (YouTube extractor)
- sherlock-twitter.md (Twitter/X extractor)
- sherlock-linkedin.md (LinkedIn extractor)

Each investigation now loads ~180 lines instead of 1,015.
Migrated from MCP Playwright to Playwright CLI.
Reduced default content counts for token efficiency."
```

---

### Task 2: Create Discovery Prompt (Phase 1)

**Context:** This replaces the architect's Phase 1 discovery questions. It must be domain-agnostic (not just content creation) and follow the Superpowers Brainstorming pattern: one question at a time, multiple choice when possible, adaptive to domain.

**Files:**
- Create: `_opensquad/core/prompts/discovery.prompt.md`

- [ ] **Step 1: Write the discovery prompt**

Source material: `architect.agent.yaml` lines 68-251 (Phase 1 + Phase 1.5). Strip out all content-specific assumptions and make it domain-agnostic per the spec.

```markdown
# Discovery — Intelligent Squad Wizard

You are the Opensquad Discovery agent. Your role is to understand what the user wants to build through intelligent conversation, then produce a structured discovery.yaml file.

## Persona

You are a strategic systems thinker who sees organizations as interconnected workflows. Patient with all users, always explains in plain language. Believes the best squad is the simplest one that gets the job done.

## Communication Style

- Ask ONE question at a time — never overwhelm with multiple questions
- Use numbered lists for multiple choice when possible
- Open-ended questions when the answer space is too wide for choices
- Adapt follow-up questions based on previous answers
- Confirm understanding before moving on

## Context

Before starting, read:
- `_opensquad/_memory/company.md` — company context
- `_opensquad/_memory/preferences.md` — user preferences (language, name)

All user-facing output must be in the user's preferred language (from preferences.md).

## Discovery Flow

### 1. Purpose (open-ended)

"What do you want this squad to do? Describe the end result you want."

Do NOT assume any domain. Wait for the answer and detect the domain from it.

### 2. Domain Detection

Based on the user's answer, classify the domain:

| Domain | Signals |
|--------|---------|
| `content` | mentions posts, articles, videos, social media, copy, newsletter |
| `research` | mentions data, analysis, reports, investigation, market research |
| `automation` | mentions workflow, triggers, scheduling, repetitive tasks, integration |
| `analysis` | mentions metrics, dashboards, KPIs, data processing, insights |
| `mixed` | combines multiple domains — decompose into sub-objectives |

### 3. Context Exploration (adaptive — ONE question at a time)

Adapt questions based on detected domain:

**Content domain:**
- "Who is the audience for this content?" (multiple choice + "Other")
- "What tone fits your brand?" (multiple choice based on company.md)
- "Which platforms/formats?" (numbered list from available best-practices catalog)

**Research domain:**
- "What sources should the squad use?" (web search, specific sites, uploaded files, APIs)
- "How deep should the research go?" (quick scan, standard analysis, deep dive)
- "What format should the output be?" (report, briefing, raw data, presentation)

**Automation domain:**
- "What systems are involved?" (open-ended)
- "What triggers should start the workflow?" (scheduled, event-based, manual)
- "How often does this need to run?" (one-time, daily, weekly, on-demand)

**Analysis domain:**
- "What data inputs does the squad need?" (files, APIs, databases, web)
- "What metrics or insights are you looking for?" (open-ended)
- "What format should the analysis output be?" (charts, report, dashboard data)

**Mixed domain:**
- Decompose into sub-objectives first, then explore each one

### 4. Tools and Integrations

"Does this squad need any external tools or integrations?"

List currently installed skills from `skills/` directory. Also mention:
- Built-in: web search, web fetch, file read/write
- Browser automation (Playwright) — for web scraping, testing, etc.

### 5. Performance Mode

"What quality level do you want?"

1. **Alta Performance** — Full pipeline with deep analysis, multiple optimization passes, dedicated review. Higher token cost, premium results.
2. **Econômico** — Lean pipeline with basic analysis, single-pass creation, lightweight review. Lower token cost, good quality.

### 6. Investigation (offered ONLY when relevant)

**Only offer this when:**
- Domain is `content` (social media, blog, newsletter, etc.)
- AND user mentions or implies reference profiles/accounts to follow

**When offered:**
"Do you have profiles or accounts you'd like me to analyze as reference?"

1. Yes — I'll provide URLs for Sherlock to investigate
2. I have reference content I can paste directly
3. No — skip investigation, go straight to design

**If user provides URLs:** Collect them, detect platform per URL, configure investigation mode per URL (see architect.agent.yaml Phase 1.5 lines 168-248 for URL type detection and mode configuration logic). Save to discovery.yaml `investigation.targets`.

**For all non-content domains:** Do NOT mention Sherlock or investigation.

### 7. Target Formats (content squads only)

If domain is `content`, ask about target formats:

"Which content formats should this squad produce?"

Scan `_opensquad/core/best-practices/` directory for format files. Parse YAML frontmatter for `name` and `description`. Present as a numbered list grouped by platform. User can pick multiple (e.g., "1 3").

Save selected format IDs to discovery.yaml.

For NON-content squads: skip this question entirely.

### 8. Summary + Confirmation

Present the complete discovery as a formatted summary. Ask user to confirm or adjust.

## Output: `_build/discovery.yaml`

After confirmation, write this file to `squads/{code}/_build/discovery.yaml` (where `{code}` is the squad code derived from purpose):

```yaml
squad_code: "{code}"  # derived from purpose, kebab-case, e.g. "instagram-content"
purpose: "User's stated purpose"
domain: content | research | automation | analysis | mixed
performance_mode: alta_performance | economico
context:
  audience: "..."       # if content
  tone: "..."           # if content
  platforms: [...]      # if content
  formats: [instagram-feed, twitter-thread]  # if content
  sources: [...]        # if research
  triggers: [...]       # if automation
  data_inputs: [...]    # if analysis
  # structure varies by domain
tools_needed: [web_search, web_fetch, ...]
investigation:
  mode: none | sherlock | manual
  targets:
    - url: "https://..."
      platform: instagram
      investigation_mode: profile_5_10
references_provided: []  # if user chose manual mode, content pasted here or saved separately
company_name: "From company.md"
company_context: "Brief summary from company.md"
language: "From preferences.md"
```

## Rules

- NEVER load best-practices file content — only scan filenames for format list
- NEVER load Sherlock prompts — just collect URLs and modes
- NEVER load skills engine — just list installed skill names
- NEVER start designing the squad — that's Phase 3
- Keep the conversation focused and efficient — maximum 8 questions total
```

Write to `_opensquad/core/prompts/discovery.prompt.md`.

- [ ] **Step 2: Verify the file**

```bash
wc -l _opensquad/core/prompts/discovery.prompt.md
```

Expected: ~150-200 lines.

- [ ] **Step 3: Commit**

```bash
git add _opensquad/core/prompts/discovery.prompt.md
git commit -m "feat(create): add discovery phase prompt

Domain-agnostic wizard inspired by Superpowers Brainstorming.
One question at a time, adaptive to domain, outputs discovery.yaml.
Loads only company.md and preferences.md — no best-practices, no Sherlock."
```

---

### Task 3: Create Design Prompt (Phase 3)

**Context:** This replaces the architect's Phases 2-4 (Research, Extraction, Design). The Design phase reads discovery.yaml + investigation results, proposes squad structure, and outputs design.yaml. This is where AI adds the most value.

**Files:**
- Create: `_opensquad/core/prompts/design.prompt.md`

- [ ] **Step 1: Write the design prompt**

Source material: `architect.agent.yaml` lines 275-603 (Phases 2, 3, 3.5, 4). Also lines 253-274 (Phase 1.8 best-practices consultation). Consolidate and restructure for the phased architecture.

```markdown
# Design — Squad Architecture

You are the Opensquad Design agent. Your role is to compose the squad structure based on Discovery and Investigation results.

## Context Loading

Read these files before starting:
- `squads/{code}/_build/discovery.yaml` — Discovery output
- `_opensquad/_memory/company.md` — Company context
- `_opensquad/_memory/preferences.md` — User preferences
- `_opensquad/core/best-practices/_catalog.yaml` — Available best-practices catalog

If investigation was performed:
- `squads/{code}/_investigations/*/raw-content.md` — Raw content from each profile
- `squads/{code}/_investigations/*/pattern-analysis.md` — Pattern analyses

## Phase A: Research (gather domain knowledge)

[Extract from architect.agent.yaml lines 275-304 — the web research process.
Include: framework search, output examples search, common mistakes search,
quality benchmarks search, domain vocabulary collection.
Run as subagent, compile into research brief.]

## Phase B: Best Practices Consultation

Read `_catalog.yaml` to discover available best-practices.
Based on the squad's purpose and domain from discovery.yaml:

1. Review each catalog entry's `whenToUse` field
2. Select entries matching the squad's needs
3. Read the FULL content of each selected best-practice file
4. Use this knowledge to design better agents

Do NOT read all 22 files — only those relevant to this squad.

## Phase C: Extraction (transform research into artifacts)

[Extract from architect.agent.yaml lines 319-390 — the extraction process.
Include: operational framework extraction, output examples, anti-patterns,
voice guidance, quality criteria, domain framework, quality criteria document.
If investigation data exists, use it to ENRICH all artifacts per lines 322-346.]

## Phase D: Skill Discovery

[Extract from architect.agent.yaml lines 392-413 — skill discovery.
Check installed skills and catalog for relevant integrations.
Present to user as options. Install if accepted.]

## Phase E: Design Presentation

Based on discovery + company context + research + extracted artifacts:

### Agent Composition

[Extract from architect.agent.yaml lines 415-467 — agent design rules.
Include: deep .agent.md format, agent naming convention with alliteration,
icon assignment, role-based design.]

### Pipeline Design

[Extract from architect.agent.yaml lines 468-576 — pipeline design rules.
Include: research/creative execution modes, checkpoints, content squad patterns,
reviewer inclusion, task decomposition by performance mode.]

### Presentation Format

Present the design to the user:
```
I'll create a squad with N agents:

1. [Icon] [Name] — [Role description]
   Tasks: [task 1] → [task 2]
   Format: [format name, if applicable]
...

Pipeline: [Visual flow with checkpoints]
Mode: [Alta Performance / Econômico]
```

Wait for user approval. Adjust if requested.

## Output: `_build/design.yaml`

After user approves, write to `squads/{code}/_build/design.yaml`:

```yaml
squad:
  name: "squad-name"
  code: "squad-code"
  description: "..."
  performance_mode: alta_performance | economico

agents:
  - id: agent-id
    name: "Agent Name"
    icon: "emoji"
    role: role-type
    execution: inline | subagent
    persona_summary: "Brief persona description"
    skills: [skill-names]
    best_practices: [best-practice-names]
    tasks:  # if performance mode warrants decomposition
      - task-name-1.md
      - task-name-2.md

pipeline:
  - step: 01
    type: agent
    agent: agent-id
    execution: subagent
    format: format-id  # optional
    output: output-file.md
  - step: 02
    type: checkpoint
    description: "User reviews research"
  - step: 03
    type: agent
    agent: other-agent-id
    execution: inline
    input: output-file.md
    output: final.md

investigation_refs:
  - _investigations/profile/raw-content.md
  - _investigations/profile/pattern-analysis.md

research_brief: "Compiled research from Phase A"
extracted_artifacts:
  domain_framework: "..."
  quality_criteria: "..."
  output_examples: "..."
  anti_patterns: "..."
  voice_guidance: "..."

skills_installed: [skill-names]
formats_selected: [format-ids]
```

## Rules

- DO load best-practices content — this phase needs it for agent design
- DO run web research — compile into research brief
- DO present design to user and get approval
- DO NOT generate squad files — that's Phase 4 (Build)
- DO NOT load Sherlock prompts — investigation is already done
- DO NOT load pipeline runner — that's for execution
```

Write to `_opensquad/core/prompts/design.prompt.md`.

**Important:** The sections marked `[Extract from architect.agent.yaml lines X-Y]` must be replaced with the ACTUAL content from those lines, adapted for the phased context. Do NOT leave them as references. The agent implementing this task should read `architect.agent.yaml` and extract the relevant content.

- [ ] **Step 2: Verify the file**

```bash
wc -l _opensquad/core/prompts/design.prompt.md
```

Expected: ~250-350 lines. This is the largest phase prompt because it contains agent composition rules, pipeline design patterns, and extraction logic.

- [ ] **Step 3: Commit**

```bash
git add _opensquad/core/prompts/design.prompt.md
git commit -m "feat(create): add design phase prompt

Consolidates architect phases 2-4: research, extraction, skill discovery,
and squad design presentation. Loads best-practices selectively.
Outputs design.yaml with full squad structure for Build phase."
```

---

### Task 4: Create Build Prompt (Phase 4)

**Context:** This replaces the architect's Phases 5-6 (Build + Validate). The Build phase reads design.yaml and generates all squad files. It's mostly mechanical — templates and validation.

**Files:**
- Create: `_opensquad/core/prompts/build.prompt.md`

- [ ] **Step 1: Write the build prompt**

Source material: `architect.agent.yaml` lines 605-1095 (Phase 5 Build + Phase 6 Validate).

```markdown
# Build — Squad File Generation

You are the Opensquad Build agent. Your role is to take an approved design.yaml and generate all squad files.

## Context Loading

Read these files:
- `squads/{code}/_build/design.yaml` — Approved design from Phase 3
- `squads/{code}/_build/discovery.yaml` — Original discovery data
- `_opensquad/_memory/company.md` — Company context
- `_opensquad/_memory/preferences.md` — User preferences

For each best-practice referenced in design.yaml agents:
- Read `_opensquad/core/best-practices/{best-practice}.md` — On demand, only the ones needed

If investigation was performed:
- Read `squads/{code}/_investigations/*/raw-content.md` as needed for output examples

## Step A: Generate Reference Materials (inline)

Generate these files directly — they compile data already in design.yaml:

[Extract from architect.agent.yaml lines 607-618 — reference material generation.
Include: research-brief.md, domain-framework.md, quality-criteria.md,
output-examples.md, anti-patterns.md, tone-of-voice.md, memories.md, output/.gitkeep]

## Step B: Generate Squad Structure Files

Generate the following files. Use subagents for parallel generation when possible:

[Extract from architect.agent.yaml lines 622-868 — file generation rules.
Include: squad.yaml format, squad-party.csv format, agent .agent.md format
(full section with all required sections), task file format, pipeline step format]

### Agent .agent.md Format

[Include the FULL agent format from architect.agent.yaml lines 676-811 verbatim —
this is critical for agent quality and must not be abbreviated]

### Task File Format

[Include the FULL task format from architect.agent.yaml lines 812-868 verbatim]

### Pipeline Step Format

[Include the FULL step format from architect.agent.yaml lines 870-963 verbatim]

## Step C: Programmatic Validation

**CRITICAL: Never skip validation. Never fabricate success.**

[Extract from architect.agent.yaml lines 996-1074 — validation gates.
Include: Gate 1 (Agent Completeness), Gate 1b (Task Completeness),
Gate 2 (Step Completeness), Gate 2b (Content Approval Gate),
Gate 3 (Pipeline Coherence)]

### Additional Filesystem Checks

After validation gates pass, also verify:

```
✓ squads/{code}/squad.yaml exists and is valid YAML
✓ Each agent referenced in pipeline has a .agent.md file
✓ Each agent with tasks: has all task files created
✓ Each pipeline step has a step file
✓ Referenced skills are installed in skills/
✓ Referenced best-practices exist in _opensquad/core/best-practices/
```

If ANY check fails → report exactly what's missing. Never fabricate. Never skip.

## Step D: Present Summary

[Extract from architect.agent.yaml lines 1076-1094 — summary presentation format]

## Rules

- DO load best-practices content for agent persona generation
- DO validate all generated files programmatically
- DO present clear summary with quality report
- DO NOT re-ask discovery questions — design is already approved
- DO NOT run web research — already done in Design phase
- DO NOT generate files that aren't in design.yaml — YAGNI
```

Write to `_opensquad/core/prompts/build.prompt.md`.

**Important:** Same as Task 3 — all `[Extract from...]` markers must be replaced with actual content from architect.agent.yaml. The agent .agent.md format, task file format, and pipeline step format sections are particularly critical and must be included in full.

- [ ] **Step 2: Verify the file**

```bash
wc -l _opensquad/core/prompts/build.prompt.md
```

Expected: ~300-400 lines. This is large because it contains full file format specifications (agent, task, step) and validation gates. This content is essential for quality.

- [ ] **Step 3: Commit**

```bash
git add _opensquad/core/prompts/build.prompt.md
git commit -m "feat(create): add build phase prompt

Generates all squad files from approved design.yaml.
Includes full agent/task/step format specifications.
Programmatic validation gates — never fabricates success."
```

---

### Task 5: Update SKILL.md for Phased Orchestration

**Context:** The SKILL.md entry point must be updated to orchestrate the 4 phases as separate subagent dispatches with clean context. Currently it loads the monolithic architect for create; now it dispatches discovery → investigation → design → build as independent phases.

**Files:**
- Modify: `.claude/skills/opensquad/SKILL.md`

- [ ] **Step 1: Read current SKILL.md**

Read `.claude/skills/opensquad/SKILL.md` to understand the current structure (169 lines).

- [ ] **Step 2: Update the create flow in SKILL.md**

Replace the current create flow (which loads the monolithic architect) with phased orchestration. The key change is in the "Loading Agents" section (lines 118-125) and "Command Routing" section (lines 52-72).

Replace the current `Loading Agents` section and add a new `Create Squad — Phased Orchestration` section:

```markdown
## Create Squad — Phased Orchestration

When the user runs `/opensquad create`:

### Phase 1: Discovery

1. Check if `squads/{name}/_build/discovery.yaml` already exists (resume support)
   - If exists: read it, show summary, ask if user wants to redo or continue
   - If not: proceed with discovery

2. Dispatch Discovery subagent:
   - Read `_opensquad/core/prompts/discovery.prompt.md`
   - Read `_opensquad/_memory/company.md`
   - Read `_opensquad/_memory/preferences.md`
   - Follow the discovery prompt instructions
   - Output: `squads/{code}/_build/discovery.yaml`

3. Validate: `discovery.yaml` exists and has required fields (purpose, domain, performance_mode)

### Phase 2: Investigation (optional)

Read `discovery.yaml` to check `investigation.mode`:

**If `mode: sherlock`:**
For each target in `investigation.targets`:
   1. Detect platform from URL
   2. Read `_opensquad/core/prompts/sherlock-shared.md`
   3. Read `_opensquad/core/prompts/sherlock-{platform}.md`
   4. Dispatch Sherlock subagent (one per URL, can run in parallel):
      - Pass: URL, investigation_mode, output directory, squad name
      - Use fast model tier
   5. Wait for all subagents to complete
   6. Validate per target: either `raw-content.md` or `error.md` exists
   7. If any target has `error.md`: inform user, ask if they want to retry or skip

**If `mode: manual`:**
   1. Ask user to paste reference content
   2. Save to `squads/{code}/_investigations/manual/raw-content.md`

**If `mode: none`:** Skip to Phase 3

### Phase 3: Design

1. Check if `squads/{code}/_build/design.yaml` already exists (resume support)
   - If exists: read it, show summary, ask if user wants to redo or continue

2. Dispatch Design subagent:
   - Read `_opensquad/core/prompts/design.prompt.md`
   - Pass: path to discovery.yaml, investigation results (if any)
   - The Design subagent handles research, extraction, skill discovery, and design presentation internally
   - Output: `squads/{code}/_build/design.yaml`

3. Validate: `design.yaml` exists and has agents and pipeline defined

### Phase 4: Build

1. Dispatch Build subagent:
   - Read `_opensquad/core/prompts/build.prompt.md`
   - Pass: path to design.yaml, path to discovery.yaml
   - The Build subagent generates all files and runs validation gates
   - Output: `squads/{code}/squad.yaml` + all agent and pipeline files

2. Final validation:
   - `squad.yaml` exists
   - All agent files exist
   - All pipeline step files exist

3. Present final summary to user

### Resume Support

If `_build/` artifacts exist from a previous interrupted session:
- Discovery complete + Design missing → resume from Phase 3
- Discovery + Design complete → resume from Phase 4
- Show what was already completed and ask user if they want to continue or start over
```

Update the command routing table to reference the phased flow instead of "Load Architect":

```
| `/opensquad create <description>` | Run Create Squad — Phased Orchestration |
```

Keep the existing `Loading Agents` section but update it to clarify it's for squad agents during RUN, not for the Architect during CREATE.

- [ ] **Step 3: Verify the updated SKILL.md**

```bash
wc -l .claude/skills/opensquad/SKILL.md
```

Expected: ~220-270 lines (increased from 169 due to phased orchestration section).

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/opensquad/SKILL.md
git commit -m "feat(create): update SKILL.md for phased orchestration

Replace monolithic architect dispatch with 4-phase flow:
Discovery → Investigation → Design → Build.
Each phase dispatched as independent subagent with clean context.
Adds resume support via _build/ artifact detection."
```

---

### Task 6: Reduce architect.agent.yaml

**Context:** The architect's create-squad workflow (1,000+ lines) is now handled by the phase prompts. The architect.agent.yaml should be reduced to only contain the shared persona, the edit/list/delete workflows, and a reference to the phased create flow.

**Files:**
- Modify: `_opensquad/core/architect.agent.yaml`

- [ ] **Step 1: Read current architect.agent.yaml**

Read the full file to identify what to keep and what to remove.

- [ ] **Step 2: Reduce the file**

Keep:
- Lines 1-49: Metadata + persona + principles (update principles to remove create-specific ones)
- Lines 50-66: Menu (update create trigger to reference phased flow)
- Lines 1096-1131: edit-squad, list-squads, delete-squad workflows

Remove:
- Lines 67-1095: The entire `create-squad` workflow (now in discovery/design/build prompts)

Replace the create-squad workflow with a brief reference:

```yaml
    create-squad: |
      ## Create Squad

      The create flow is now handled by the phased orchestration system.
      See the SKILL.md entry point for the full phased flow:
      Discovery → Investigation → Design → Build

      Each phase is a separate prompt in `_opensquad/core/prompts/`:
      - `discovery.prompt.md` — Phase 1: Intelligent wizard
      - `sherlock-*.md` — Phase 2: Investigation (optional)
      - `design.prompt.md` — Phase 3: Squad architecture
      - `build.prompt.md` — Phase 4: File generation + validation

      The SKILL.md orchestrator dispatches each phase as a subagent.
```

- [ ] **Step 3: Verify the reduced file**

```bash
wc -l _opensquad/core/architect.agent.yaml
```

Expected: ~100-150 lines (reduced from 1,131). Should contain only persona, menu, and edit/list/delete workflows.

- [ ] **Step 4: Commit**

```bash
git add _opensquad/core/architect.agent.yaml
git commit -m "refactor(architect): remove create-squad workflow

Create flow is now handled by phased prompts:
discovery.prompt.md, design.prompt.md, build.prompt.md.
Architect retains: persona, edit, list, delete workflows.
Reduced from 1,131 lines to ~120 lines."
```

---

### Task 7: Clean Up and Remove Old Sherlock

**Context:** The monolithic sherlock.prompt.md is now replaced by the platform-specific files. Remove it and verify nothing references the old path.

**Files:**
- Remove: `_opensquad/core/prompts/sherlock.prompt.md`

- [ ] **Step 1: Search for references to old sherlock path**

```bash
grep -r "sherlock.prompt.md" _opensquad/ .claude/ --include="*.md" --include="*.yaml" --include="*.yml"
```

Expected: Should find references in the old architect.agent.yaml (already reduced in Task 6) and possibly in SKILL.md. These should already be updated. If any remain, fix them.

- [ ] **Step 2: Remove the old file**

```bash
git rm _opensquad/core/prompts/sherlock.prompt.md
```

- [ ] **Step 3: Verify no broken references**

```bash
grep -r "sherlock.prompt.md" . --include="*.md" --include="*.yaml" --include="*.yml" | grep -v "docs/superpowers" | grep -v ".git/"
```

Expected: No results (excluding docs/specs which reference it historically).

- [ ] **Step 4: Commit**

```bash
git rm _opensquad/core/prompts/sherlock.prompt.md
git commit -m "chore: remove monolithic sherlock.prompt.md

Replaced by platform-specific files:
sherlock-shared.md, sherlock-instagram.md, sherlock-youtube.md,
sherlock-twitter.md, sherlock-linkedin.md."
```

---

### Task 8: End-to-End Verification

**Context:** Verify the complete phased architecture is in place and coherent.

**Files:** (read-only verification)

- [ ] **Step 1: Verify file structure**

```bash
echo "=== New phase prompts ==="
ls -la _opensquad/core/prompts/discovery.prompt.md
ls -la _opensquad/core/prompts/design.prompt.md
ls -la _opensquad/core/prompts/build.prompt.md

echo "=== Platform-specific Sherlock ==="
ls -la _opensquad/core/prompts/sherlock-shared.md
ls -la _opensquad/core/prompts/sherlock-instagram.md
ls -la _opensquad/core/prompts/sherlock-youtube.md
ls -la _opensquad/core/prompts/sherlock-twitter.md
ls -la _opensquad/core/prompts/sherlock-linkedin.md

echo "=== Old sherlock removed ==="
ls -la _opensquad/core/prompts/sherlock.prompt.md 2>&1 || echo "REMOVED (expected)"

echo "=== Reduced architect ==="
wc -l _opensquad/core/architect.agent.yaml

echo "=== Updated SKILL.md ==="
wc -l .claude/skills/opensquad/SKILL.md
```

Expected:
- All 8 new/modified files exist
- sherlock.prompt.md is removed
- architect.agent.yaml is ~100-150 lines
- SKILL.md is ~220-270 lines

- [ ] **Step 2: Verify cross-references**

```bash
# Check that SKILL.md references the new phase prompts
grep "discovery.prompt.md" .claude/skills/opensquad/SKILL.md
grep "design.prompt.md" .claude/skills/opensquad/SKILL.md
grep "build.prompt.md" .claude/skills/opensquad/SKILL.md
grep "sherlock-shared.md" .claude/skills/opensquad/SKILL.md

# Check no dangling references to old files
grep -r "sherlock.prompt.md" _opensquad/ .claude/ --include="*.md" --include="*.yaml"
```

Expected: Phase prompts are referenced in SKILL.md. No dangling references to old sherlock.

- [ ] **Step 3: Line count summary**

```bash
echo "=== Before ==="
echo "architect.agent.yaml: 1,131 lines"
echo "sherlock.prompt.md: 1,015 lines"
echo "TOTAL always-loaded for create: ~2,146 lines"

echo ""
echo "=== After ==="
echo "Per-phase context loads:"
echo "Phase 1 (Discovery):"
wc -l _opensquad/core/prompts/discovery.prompt.md
echo "Phase 2 (Investigation, 1 platform):"
wc -l _opensquad/core/prompts/sherlock-shared.md
wc -l _opensquad/core/prompts/sherlock-instagram.md
echo "Phase 3 (Design):"
wc -l _opensquad/core/prompts/design.prompt.md
echo "Phase 4 (Build):"
wc -l _opensquad/core/prompts/build.prompt.md
```

Expected: Each individual phase loads significantly fewer lines than the old monolithic approach. No single phase should exceed ~400 lines of prompt.

- [ ] **Step 4: Commit verification summary**

```bash
git log --oneline -7
```

Expected: 7 commits from this implementation (Tasks 1-7).
