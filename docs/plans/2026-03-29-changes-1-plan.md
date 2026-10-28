# Changes-1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 12 improvements to Opensquad covering Architect UX, Sherlock login, Template Designer, Dashboard, skill renaming, and research performance.

**Architecture:** All changes target existing prompt/config/code files in `_opensquad/core/`, `skills/`, and `dashboard/`. No new subsystems. Most tasks are prompt edits; two are code changes (Dashboard TS, server shell script); one is a file rename.

**Tech Stack:** Markdown prompts, YAML configs, TypeScript (Phaser dashboard), Bash (server script), Node.js

---

## File Map

| File | Action | Task |
|------|--------|------|
| `_opensquad/core/prompts/discovery.prompt.md` | Modify | 1, 2, 3 |
| `_opensquad/core/prompts/design.prompt.md` | Modify | 3, 4 |
| `_opensquad/core/prompts/build.prompt.md` | Modify | 3, 4 |
| `_opensquad/core/architect.agent.yaml` | Modify | 2 |
| `_opensquad/core/prompts/sherlock-shared.md` | Modify | 5 |
| `skills/template-designer/SKILL.md` | Modify | 6 |
| `skills/template-designer/scripts/start-server.sh` | Modify | 7 |
| `dashboard/src/office/OfficeScene.ts` | Modify | 8 |
| `_opensquad/core/runner.pipeline.md` | Modify | 9 |
| `skills/image-generator/` → `skills/image-ai-generator/` | Rename | 10 |
| `skills/README.md` | Modify | 10 |
| `tests/update.test.js` | Modify | 10 |
| `_opensquad/core/best-practices/researching.md` | Modify | 11 |

---

### Task 1: Discovery — Remove performance mode, auto-detect tools, restore options, natural language

**Files:**
- Modify: `_opensquad/core/prompts/discovery.prompt.md`

- [ ] **Step 1: Remove Step 4 (Tools and Integrations) and Step 5 (Performance Mode)**

Replace the entire Step 4 section (lines 81-92) with:

```markdown
### Step 4 — Tools and Integrations (automatic)

Do NOT ask the user about tools. Instead:

1. Silently scan the `skills/` directory to find installed skills
2. Based on the squad's purpose and target formats, select which skills are relevant:
   - Content squads targeting Instagram → check for: image-creator, image-ai-generator, template-designer, instagram-publisher
   - Content squads targeting any platform → check for: image-fetcher, blotato
   - Research squads → check for: apify
   - Any squad → note built-in capabilities: web browsing, file reading/writing, code execution
3. Save the auto-selected tools in `tools_needed` — they will appear in the Step 8 summary where the user can adjust them

---
```

Remove the entire Step 5 section (lines 95-108). Renumber subsequent steps: Step 6 → Step 5, Step 7 → Step 6, Step 8 → Step 7.

- [ ] **Step 2: Update Step 7 (Target Formats) to use natural language**

In the renumbered Step 6 (Target Formats), replace the line:
```
The user can reply with multiple numbers separated by spaces (e.g., "1 3 5").
```
With:
```
Ask: "Which formats interest you? Can be more than one."
```

- [ ] **Step 3: Update Step 8 (Summary) to include tools and remove performance mode**

In the renumbered Step 7 (Summary), remove the line:
```
> **Performance mode:** {performance_mode}
```

Change confirmation text from:
```
> Type **yes** to confirm, or let me know what to change."
```
To:
```
> All good? Or want to change something?"
```

- [ ] **Step 4: Update Output schema**

In the `## Output: _build/discovery.yaml` section:
- Remove `performance_mode: "{alta_performance | economico}"` line
- Keep `tools_needed` section as-is (now auto-populated)

- [ ] **Step 5: Add interaction style rules to Communication Style**

At the end of the `## Communication Style` section (after line 13), add:

```markdown
- Speak naturally — never instruct the user as if they're filling out a form
  - Instead of "Reply with multiple numbers separated by spaces (ex: 1 3 5)" → "Which ones interest you? Can be more than one."
  - Instead of "Type yes to confirm, or tell me what to change" → "All good? Or want to change something?"
  - Instead of "Reply with a number" → just present the options, the user knows what to do
- Always present numbered options when there are choices. The only exception is when the question requires free-text input (a URL, a name, a description)
```

- [ ] **Step 6: Update Rules section**

In the `## Rules` section at the bottom, remove:
```
- **NEVER load best-practices file contents** — only scan filenames to build the Step 7 list
```
Replace with:
```
- **NEVER load best-practices file contents** — only scan filenames to build the format list
```

Add new rule:
```
- **NEVER ask about tools** — auto-detect from installed skills and include in the summary
- **NEVER ask about performance mode** — squads are always built lean and agile
```

- [ ] **Step 7: Commit**

```bash
git add _opensquad/core/prompts/discovery.prompt.md
git commit -m "feat(architect): remove perf mode, auto-detect tools, natural language"
```

---

### Task 2: Architect agent YAML — Update communication style

**Files:**
- Modify: `_opensquad/core/architect.agent.yaml`

- [ ] **Step 1: Update communication_style**

Replace lines 25-27:
```yaml
    communication_style: >
      Clear and structured. Uses numbered lists and visual separators
      to organize information. Asks one question at a time. Confirms
      understanding before proceeding. Celebrates progress with the user.
```

With:
```yaml
    communication_style: >
      Clear and structured. Uses numbered lists and visual separators
      to organize information. Asks one question at a time. Confirms
      understanding before proceeding. Speaks naturally — never instructs
      the user like a form ("reply with a number", "type yes to confirm").
      Just presents options and lets the user respond however they want.
```

- [ ] **Step 2: Commit**

```bash
git add _opensquad/core/architect.agent.yaml
git commit -m "feat(architect): update communication style to natural language"
```

---

### Task 3: Design prompt — Remove performance modes and add agile philosophy

**Files:**
- Modify: `_opensquad/core/prompts/design.prompt.md`

- [ ] **Step 1: Remove performance_mode from Context Loading**

In `## Context Loading` (line 15), replace:
```
- `squads/{code}/_build/discovery.yaml` — Discovery phase output (purpose, audience, domains, performance mode, formats, references)
```
With:
```
- `squads/{code}/_build/discovery.yaml` — Discovery phase output (purpose, audience, domains, formats, references)
```

- [ ] **Step 2: Add agile design philosophy to Phase E**

At the start of `## Phase E: Agent Design` (after line 149), add a new subsection before "Design the squad":

```markdown
### Design Philosophy

Build agile, objective squads. Each agent should have the minimum tasks necessary to fulfill its role. Avoid redundant passes, cascading reviews, or separate optimization tasks. A single well-crafted task that combines creation and basic optimization is better than three tasks that split the work artificially.

Guidelines:
- 1-2 tasks per agent maximum
- One creator agent (generic writer), not per-platform specialists
- Combined optimization embedded in the creation task
- Single-pass review (no separate scoring + feedback tasks)
- Research agents must be direct and focused — no exhaustive surveys
```

- [ ] **Step 3: Remove all performance mode branching from Content Squad Pattern**

In `#### Agent Roles in Content Squads` section:

Replace the researcher tasks block (around lines 273-276):
```markdown
- Tasks based on performance_mode:
  - Alta Performance: `find-news.md` → `rank-stories.md` (2 tasks)
  - Economico: `find-and-rank-news.md` (1 task)
```
With:
```markdown
- Tasks: `find-and-rank-news.md` (single focused task)
```

Replace the creator tasks block (around lines 280-288):
```markdown
- **For news-based squads**: the creator is responsible for angle generation. Prepend `generate-angles.md` as the creator's FIRST task. This task runs in a dedicated pipeline step AFTER the news selection checkpoint — it generates 5 distinct angles from the ONE selected story. An angle selection checkpoint follows immediately. The content creation tasks run in a SEPARATE pipeline step AFTER angle selection.
  - Alta Performance (news-based): `generate-angles.md` [step A, after news selection] → Angle Selection checkpoint → `create-{format}.md` → `optimize-{format}.md` [step B, after angle selection]
  - Economico (news-based): `generate-angles.md` [step A, after news selection] → Angle Selection checkpoint → `create-{format}.md` [step B, optimization embedded]
```
With:
```markdown
- **For news-based squads**: the creator is responsible for angle generation. Prepend `generate-angles.md` as the creator's FIRST task. This task runs in a dedicated pipeline step AFTER the news selection checkpoint — it generates 5 distinct angles from the ONE selected story. An angle selection checkpoint follows immediately. The content creation tasks run in a SEPARATE pipeline step AFTER angle selection.
  - Pipeline: `generate-angles.md` [step A, after news selection] → Angle Selection checkpoint → `create-{format}.md` [step B, optimization embedded in creation]
```

Replace the second creator tasks block (around lines 286-289):
```markdown
- Tasks based on performance_mode:
  - Alta Performance: `create-{format-1}.md` → `create-{format-2}.md` → `optimize-{format}.md` (3 tasks)
  - Economico: `create-{main-format}.md` with optimization embedded (1 task)
```
With:
```markdown
- Tasks: `create-{format}.md` with optimization embedded (single focused task per format)
```

Replace the reviewer tasks block (around lines 293-296):
```markdown
- Tasks based on performance_mode:
  - Alta Performance: `score-content.md` → `generate-feedback.md` (2 tasks)
  - Economico: `review.md` — combined scoring + feedback (1 task)
```
With:
```markdown
- Tasks: `review.md` — combined scoring + feedback (single pass)
```

- [ ] **Step 4: Remove Performance Mode Effects section**

Delete the entire `#### Performance Mode Effects on Task Decomposition` section (lines 310-313):
```markdown
#### Performance Mode Effects on Task Decomposition

- **Alta Performance**: 3-5 tasks per agent, platform-specific creators, dedicated optimization tasks, full review with separate scoring and feedback. Higher token consumption due to multiple optimization passes, dedicated review tasks, and A/B variant generation.
- **Economico**: 1-2 tasks per agent, single creator (or generic writer), combined optimization in create task, lightweight single-pass review. Reduced token consumption with single-pass creation and lightweight review.
```

- [ ] **Step 5: Remove performance_mode from Phase G presentation**

In `## Phase G: Design Presentation`, remove the line:
```
Mode: [Alta Performance / Economico]
```

- [ ] **Step 6: Remove performance_mode from design.yaml schema**

In `## Output: _build/design.yaml`, remove:
```yaml
  performance_mode: "alta_performance" | "economico"
```

- [ ] **Step 7: Remove Phase D Skill Discovery numbered-list instruction**

In `## Phase D: Skill Discovery`, replace:
```
4. If relevant skills found, present to user as a numbered list (user can reply with multiple numbers separated by spaces). If only 1 skill is relevant, add "No thanks, skip skills" as a second option.
```
With:
```
4. If relevant skills found, present to user as a numbered list. If only 1 skill is relevant, add "No thanks, skip skills" as a second option.
```

- [ ] **Step 8: Commit**

```bash
git add _opensquad/core/prompts/design.prompt.md
git commit -m "feat(design): remove performance modes, add agile philosophy"
```

---

### Task 4: Build prompt — Remove performance mode references

**Files:**
- Modify: `_opensquad/core/prompts/build.prompt.md`

- [ ] **Step 1: Remove performance mode from summary**

In `## Step D: Present Summary`, remove the line:
```
- Mode: {Alta Performance / Economico}
```

- [ ] **Step 2: Remove Alta Performance agent sections**

Replace the section at lines 245-251:
```markdown
#### Agents WITH Tasks (Alta Performance mode)

For agents that have `tasks:` in frontmatter:
- **Keep**: Persona, Principles, Voice Guidance, Anti-Patterns, Quality Criteria, Integration
- **Remove**: Operational Framework and Output Examples (these move to task files)
- **Target**: 80-150 lines per agent (identity-focused)
```

With:
```markdown
#### Agents WITH Tasks

For agents that have `tasks:` in frontmatter:
- **Keep**: Persona, Principles, Voice Guidance, Anti-Patterns, Quality Criteria, Integration
- **Remove**: Operational Framework and Output Examples (these move to task files)
- **Target**: 80-150 lines per agent (identity-focused)
```

- [ ] **Step 3: Commit**

```bash
git add _opensquad/core/prompts/build.prompt.md
git commit -m "feat(build): remove performance mode references"
```

---

### Task 5: Sherlock — Two-step login and session instructions

**Files:**
- Modify: `_opensquad/core/prompts/sherlock-shared.md`

- [ ] **Step 1: Add Session Management notice section near the top**

After the `## Purpose` section (line 9) and before `## How It Works`, insert:

```markdown
## Session Management (ALWAYS inform the user)

At the START of every investigation, before any browser action, tell the user:

> "Your browser sessions are saved in `_opensquad/_browser_profile/`. To clear a platform's session, just delete the JSON file (e.g., `instagram.json`). I'll ask before saving any new session."

This notice is mandatory for every investigation run, even if sessions already exist.

---
```

- [ ] **Step 2: Replace the First-Time Setup login flow**

In `## Browser Profile Setup` → `### First-Time Setup`, replace the entire subsection (lines 133-147) with:

```markdown
### First-Time Setup

On the first investigation for a given platform, Sherlock may encounter a login wall. When this happens:

1. Navigate to the platform URL
2. Take a snapshot to detect login prompts or walls
3. If a login wall is detected, inform the user:
   "I need you to log in to {platform} so I can access the content. I'll open the browser — log in, and come back here when you're done."

4. **Step 1 — Open browser for login (NO session saving):**
   ```bash
   npx playwright open {platform-url}
   ```
   Use a **5-minute timeout** on this command. The user needs time to complete login + any verification (email, SMS, 2FA).

5. Wait for the user to confirm login is complete in the terminal.

6. **Step 2 — Save the session (quick — user is already logged in):**
   Ask: "Want me to save this session for next time?"
   If yes:
   ```bash
   npx playwright open --save-storage=_opensquad/_browser_profile/{platform}.json {platform-url}
   ```
   This command completes quickly since the browser already has the authenticated cookies.

7. If the user declines saving, inform them:
   "No problem. Remember your cookies are still in `_opensquad/_browser_profile/` — delete the folder to clear everything."
```

- [ ] **Step 3: Commit**

```bash
git add _opensquad/core/prompts/sherlock-shared.md
git commit -m "feat(sherlock): two-step login flow, session notice at top"
```

---

### Task 6: Template Designer — Enforce aspect ratio and font sizes

**Files:**
- Modify: `skills/template-designer/SKILL.md`

- [ ] **Step 1: Add mandatory dimension rules after Step 0**

After the `### Step 0: Read Design Guidelines (MANDATORY)` section (after line 83), add a new subsection:

```markdown
### HARD RULES — Dimensions and Typography

These rules are NON-NEGOTIABLE. Every template must comply:

**Fixed Dimensions (never use height: auto or flexible height):**
- Instagram Carousel: `width: 1080px; height: 1440px` (3:4 portrait)
- Instagram Story/Reel: `width: 1080px; height: 1920px` (9:16 portrait)
- Instagram Post: `width: 1080px; height: 1080px` (1:1 square)
- LinkedIn Post: `width: 1200px; height: 627px` (1.91:1 horizontal)

The root container of every template MUST set explicit `width` and `height` in pixels. The template must render at exactly these dimensions — no overflow, no scrolling, no flexible height.

**Minimum Font Sizes (Instagram at 1080px width):**
- Hero/Title: **58px** minimum
- Heading: **43px** minimum
- Body text: **34px** minimum
- Caption/small text: **24px** minimum
- Absolute minimum for ANY readable text on ANY platform: **20px**

**Font Weight:** 500 or higher for body text and above. Never use font-weight below 400 for any visible text.

Templates that violate these rules are rejected — no exceptions.
```

- [ ] **Step 2: Update Step 3 to reinforce dimensions**

In `### Step 3: Generate Adapted Variations`, replace the line (around line 109):
```
- Resize viewport if the target is not 1080x1440 (e.g., 1080x1080 for posts, 1080x1920 for stories)
```
With:
```
- Set the root container to the exact fixed dimensions from HARD RULES above. Never use percentage heights or auto heights.
```

- [ ] **Step 3: Commit**

```bash
git add skills/template-designer/SKILL.md
git commit -m "feat(template-designer): enforce fixed dimensions and min font sizes"
```

---

### Task 7: Template Designer — Fix server dying on Windows

**Files:**
- Modify: `skills/template-designer/scripts/start-server.sh`

- [ ] **Step 1: Remove Windows auto-foreground override**

Delete lines 50-56 (the Windows/Git Bash auto-foreground block):
```bash
# Windows/Git Bash auto-foreground
case "${OSTYPE:-}" in
  msys*|cygwin*|mingw*) FOREGROUND="true" ;;
esac
if [[ -n "${MSYSTEM:-}" ]]; then
  FOREGROUND="true"
fi
```

This means Windows now uses the same background path as macOS/Linux (the `nohup ... &` block at lines 85-87), which Git Bash supports.

- [ ] **Step 2: Update SKILL.md Windows instructions**

In `skills/template-designer/SKILL.md`, replace the `### On Windows (Git Bash)` section (lines 40-48):
```markdown
### On Windows (Git Bash)

The script auto-detects Windows and runs in foreground mode. Use `run_in_background: true` on the Bash tool call:

~~~bash
bash skills/template-designer/scripts/start-server.sh --session-dir "squads/{code}/_build/template-session"
~~~

Then read `squads/{code}/_build/template-session/state/server-info.json` on your next turn to get the URL and port.
```

With:
```markdown
### On Windows (Git Bash)

The server runs in the background on all platforms:

~~~bash
bash skills/template-designer/scripts/start-server.sh --session-dir "squads/{code}/_build/template-session"
~~~

The script prints the server info JSON on success. If it doesn't appear, read `squads/{code}/_build/template-session/state/server-info.json`.
```

- [ ] **Step 3: Commit**

```bash
git add skills/template-designer/scripts/start-server.sh skills/template-designer/SKILL.md
git commit -m "fix(template-designer): run server in background on Windows"
```

---

### Task 8: Dashboard — Fix NPC gender and add round-robin

**Files:**
- Modify: `dashboard/src/office/OfficeScene.ts`

- [ ] **Step 1: Replace the pickCharacter function**

Replace the current `pickCharacter` function (lines 13-17):
```typescript
function pickCharacter(agent: Agent): CharacterName {
  const pool = agent.gender === 'male' ? MALE_CHARACTERS : FEMALE_CHARACTERS;
  const hash = [...agent.id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return pool[hash % pool.length];
}
```

With a round-robin version that takes agent list context:
```typescript
function assignCharacters(agents: Agent[]): Map<string, CharacterName> {
  const assignments = new Map<string, CharacterName>();
  let maleIndex = 0;
  let femaleIndex = 0;

  for (const agent of agents) {
    if (agent.gender === 'male') {
      assignments.set(agent.id, MALE_CHARACTERS[maleIndex % MALE_CHARACTERS.length]);
      maleIndex++;
    } else {
      assignments.set(agent.id, FEMALE_CHARACTERS[femaleIndex % FEMALE_CHARACTERS.length]);
      femaleIndex++;
    }
  }

  return assignments;
}
```

- [ ] **Step 2: Update renderScene to use assignCharacters**

In the `renderScene` method, replace lines 113-121:
```typescript
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const x = (agent.desk.col - 1) * cellW + MARGIN + cellW / 2;
      const y = (agent.desk.row - 1) * cellH + MARGIN + WALL_H + cellH / 2;
      const characterName = pickCharacter(agent);
      const deskVariant = i % 2 === 0 ? 'black' : 'white';
      const agentSprite = new AgentSprite(this, x, y, characterName, deskVariant, agent);
      this.agentSprites.set(agent.id, agentSprite);
    }
```

With:
```typescript
    const characterMap = assignCharacters(agents);

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const x = (agent.desk.col - 1) * cellW + MARGIN + cellW / 2;
      const y = (agent.desk.row - 1) * cellH + MARGIN + WALL_H + cellH / 2;
      const characterName = characterMap.get(agent.id)!;
      const deskVariant = i % 2 === 0 ? 'black' : 'white';
      const agentSprite = new AgentSprite(this, x, y, characterName, deskVariant, agent);
      this.agentSprites.set(agent.id, agentSprite);
    }
```

- [ ] **Step 3: Verify build**

```bash
cd dashboard && npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add dashboard/src/office/OfficeScene.ts
git commit -m "fix(dashboard): round-robin gender-aware character assignment"
```

---

### Task 9: Pipeline Runner — Remove handoff sleep

**Files:**
- Modify: `_opensquad/core/runner.pipeline.md`

- [ ] **Step 1: Remove the sleep 3 block**

In `### Dashboard Handoff (between steps)`, replace the block at lines 402-405:
```markdown
2. **Wait for animation** — Run via Bash tool:
   ```bash
   sleep 3
   ```
```

With:
```markdown
2. _(No delay — proceed immediately to working state)_
```

- [ ] **Step 2: Renumber step 3 to step 2**

Update the following step numbering:
```markdown
3. **Write working state** — Write `squads\{name}\state.json` again with:
```
To:
```markdown
2. **Write working state** — Write `squads/{name}/state.json` again with:
```

(Also fix the backslash to forward slash while we're here.)

- [ ] **Step 3: Commit**

```bash
git add _opensquad/core/runner.pipeline.md
git commit -m "perf(runner): remove 3s handoff sleep delay"
```

---

### Task 10: Rename image-generator to image-ai-generator

**Files:**
- Rename: `skills/image-generator/` → `skills/image-ai-generator/`
- Modify: `skills/image-ai-generator/SKILL.md` (update name field)
- Modify: `skills/README.md`
- Modify: `tests/update.test.js`

- [ ] **Step 1: Rename the directory**

```bash
cd "d:/Coding Projects/opensquad" && git mv skills/image-generator skills/image-ai-generator
```

- [ ] **Step 2: Update SKILL.md name field**

In `skills/image-ai-generator/SKILL.md`, replace:
```yaml
name: image-generator
```
With:
```yaml
name: image-ai-generator
```

- [ ] **Step 3: Update skills/README.md**

In `skills/README.md`, replace all occurrences of `image-generator` with `image-ai-generator`:
- Table row: `| [image-generator](./image-generator/) |` → `| [image-ai-generator](./image-ai-generator/) |`
- Install command: `npx opensquad install image-generator` → `npx opensquad install image-ai-generator`
- Directory tree: `image-generator/` → `image-ai-generator/`

- [ ] **Step 4: Update tests/update.test.js**

Replace all occurrences of `image-generator` with `image-ai-generator` (4 occurrences at lines 190, 192, 196, 197):

```javascript
    // image-ai-generator is the canonical non-MCP skill with env requirements (env: [OPENROUTER_API_KEY])
    // Simulate a user who installed opensquad before this skill was bundled
    await rm(join(tempDir, 'skills', 'image-ai-generator'), { recursive: true, force: true });

    await update(tempDir);

    // image-ai-generator has `env: [OPENROUTER_API_KEY]` and should be re-installed by update
    const skillMd = join(tempDir, 'skills', 'image-ai-generator', 'SKILL.md');
```

- [ ] **Step 5: Run tests to verify**

```bash
cd "d:/Coding Projects/opensquad" && npm test
```

Expected: Tests pass (or at least the update test passes).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: rename image-generator to image-ai-generator"
```

---

### Task 11: Research best-practices — Add efficiency directives

**Files:**
- Modify: `_opensquad/core/best-practices/researching.md`

- [ ] **Step 1: Add efficiency principle**

After principle 8 (Browser tool discipline, around line 29), add a new principle:

```markdown
9. **Efficiency and focus** — Be objective and direct. Research enough to fulfill the task without being exhaustive. Avoid spending excessive time on broad sweeps when a focused search answers the question. The goal is actionable intelligence, not academic completeness. If 5 high-quality sources answer the brief, don't search for 15 more.
```

- [ ] **Step 2: Tighten the Broad Search Sweep technique**

Replace the `### Broad Search Sweep` section (lines 38-39):
```markdown
### Broad Search Sweep

Conduct an initial broad search across multiple source categories to establish the terrain. Collect 15-30 candidate sources. Note which angles are well-covered and which have gaps. The goal at this stage is breadth, not depth — you are surveying the landscape to decide where to focus.
```

With:
```markdown
### Focused Search Sweep

Conduct an initial search across the most relevant source categories. Collect 5-10 candidate sources — enough to map the terrain without over-searching. Note which angles are well-covered and which have gaps. Move quickly to deep-dive on the best sources rather than endlessly expanding the search.
```

- [ ] **Step 3: Tighten the Deep-Dive Methodology**

Replace the `### Deep-Dive Methodology` section (lines 42-43):
```markdown
### Deep-Dive Methodology

Select the 8-12 most promising sources from the broad sweep and extract detailed findings. Cross-reference claims across sources. Flag any contradictions or inconsistencies. This is where rigor matters: read beyond headlines, check methodology sections, look for caveats the authors buried in footnotes.
```

With:
```markdown
### Deep-Dive Methodology

Select the 3-5 most promising sources and extract detailed findings. Cross-reference key claims across sources. Flag contradictions. Focus on extracting what the squad actually needs — not every possible angle, just the ones that serve the brief.
```

- [ ] **Step 4: Commit**

```bash
git add _opensquad/core/best-practices/researching.md
git commit -m "perf(research): add efficiency directives, tighten search scope"
```

---

### Task 12: Design prompt — Add research efficiency directive

**Files:**
- Modify: `_opensquad/core/prompts/design.prompt.md`

- [ ] **Step 1: Tighten Phase B Research instructions**

In `## Phase B: Research`, replace the intro and first item (lines 50-55):
```markdown
For each knowledge domain identified in discovery.yaml, use WebSearch to research:

1. **Frameworks and methodologies**: Search for "{domain} framework" and "{domain} best practices"
   - Extract: named frameworks, step-by-step processes, proven methodologies
   - Minimum: 3 unique sources per domain
```

With:
```markdown
For each knowledge domain identified in discovery.yaml, do a focused web search. Be direct and efficient — research enough to build solid agent foundations without exhaustive surveys. Move quickly.

1. **Frameworks and methodologies**: Search for "{domain} framework" or "{domain} best practices"
   - Extract: the 1-2 most relevant frameworks and processes
   - 2-3 sources is sufficient — don't over-search
```

- [ ] **Step 2: Simplify research notification**

Replace the research notification text (around line 73):
```
"Researching {N} knowledge domains... This takes 1-2 minutes."
```

With:
```
"Researching {N} knowledge domains..."
```

- [ ] **Step 3: Commit**

```bash
git add _opensquad/core/prompts/design.prompt.md
git commit -m "perf(design): tighten research phase for efficiency"
```
