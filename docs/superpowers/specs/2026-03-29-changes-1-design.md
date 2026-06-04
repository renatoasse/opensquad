# Changes-1: Melhorias Opensquad

**Date:** 2026-03-29
**Source:** docs/temp/changes-1/changes-1.md
**Scope:** 12 improvements across Architect UX, Sherlock, Template Designer, Dashboard, skill renaming, and performance optimization.

> Item #9 (token usage opinion) is addressed inline — not an implementation item.

---

## 1. Architect UX

### 1.1 Restore numbered options (#1)

**Problem:** After recent changes the Architect stopped presenting numbered options to the user.

**Solution:** Add explicit instruction to `discovery.prompt.md`, `design.prompt.md`, and `architect.agent.yaml`:

> "Always present numbered options for the user to choose from. The only exception is when the question requires free-text input (e.g., a URL, a name, a description)."

This rule applies to all Opensquad interactions, not just the Architect.

### 1.2 Auto-detect tools instead of asking (#2)

**Problem:** The Architect asks "Do you need to connect to a tool?" and lists all available tools. The user is non-technical and shouldn't have to decide this.

**Solution:**
- Remove the tools question from the discovery phase.
- The Architect scans the `skills/` directory automatically.
- Based on the squad's purpose and target platforms, the Architect selects the relevant skills.
- The selected tools appear in the final summary. The user can adjust them there before confirming.

**Files:** `_opensquad/core/prompts/discovery.prompt.md`

### 1.3 Natural language in prompts (#3)

**Problem:** Instruction phrases like `Pode responder com varios numeros separados por espaco (ex: "1 3 5")` and `Digite sim para confirmar, ou me diga o que quer mudar` feel robotic.

**Solution:** Replace all robotic instruction patterns in prompts with natural phrasing. Add a general rule:

> "Never instruct the user as if they are filling out a form. Speak like a person. Examples:
> - Instead of 'Reply with multiple numbers separated by spaces' → 'Which platforms interest you? Can be more than one.'
> - Instead of 'Type yes to confirm, or tell me what to change' → 'All good? Or want to change something?'"

**Files:** `_opensquad/core/prompts/discovery.prompt.md`, `_opensquad/core/prompts/design.prompt.md`, `_opensquad/core/prompts/build.prompt.md`, `_opensquad/core/architect.agent.yaml`

### 1.4 Remove performance modes, adopt agile-by-default philosophy (#12)

**Problem:** The "alta performance" vs "economico" choice is unnecessary. Squads should always be lean.

**Solution:**
- Remove the performance mode question from discovery.
- Remove all branching logic for `alta_performance` vs `economico` in `design.prompt.md`.
- Replace with a single design philosophy:

> "Build agile, objective squads. Each agent should have the minimum tasks necessary to fulfill its role. Avoid redundant passes, cascading reviews, or separate optimization tasks."

- This is not a "mode" — it's the default and only way squads are built.

**Files:** `_opensquad/core/prompts/discovery.prompt.md`, `_opensquad/core/prompts/design.prompt.md`

---

## 2. Sherlock & Instagram Login

### 2.1 Two-step login flow (#4)

**Problem:** `npx playwright open --save-storage` blocks the Claude Code process. Instagram requires email verification which takes time. Claude Code enters "Not Responding" before the user can finish.

**Solution:** Split into two steps:

1. **Step 1 — Login:** Run `npx playwright open https://instagram.com` (no `--save-storage`). Instruct the user: "Log into Instagram. When you're done, come back here and let me know." Use a generous timeout (5 minutes).
2. **Step 2 — Save session:** After user confirms, run `npx playwright open --save-storage=_opensquad/_browser_profile/instagram.json https://instagram.com` to capture the already-authenticated session. This command completes quickly since the user is already logged in.

**Files:** `_opensquad/core/prompts/sherlock-shared.md`

### 2.2 Session instructions not surfacing (#5)

**Problem:** Instructions about session management (save, clear, folder location) were added but never appear during execution.

**Solution:** Verify `sherlock-shared.md` contains these instructions and move them to a prominent position (early in the prompt, not at the end). If the instructions exist but are buried, reposition them under a clearly marked section near the top:

> **Session Management** (always inform the user):
> - Saved sessions are in `_opensquad/_browser_profile/`
> - To clear a platform session, delete the corresponding JSON file
> - Always ask before saving a new session

**Files:** `_opensquad/core/prompts/sherlock-shared.md`

---

## 3. Template Designer

### 3.1 Enforce aspect ratio and font sizes (#6)

**Problem:** Generated templates don't respect the target format's aspect ratio (should be 3:4 / 1080x1440 for carousel) and fonts are tiny.

**Solution:**
- Add explicit dimension rules to the Template Designer `SKILL.md`:

> "The generated HTML MUST use fixed dimensions matching the target format:
> - Instagram Carousel: `width: 1080px; height: 1440px` (3:4)
> - Instagram Story/Reel: `width: 1080px; height: 1920px` (9:16)
> - LinkedIn Post: `width: 1200px; height: 627px`
>
> Minimum font sizes (Instagram):
> - Hero/Title: 58px
> - Heading: 43px
> - Body: 34px
> - Caption: 24px
> - Absolute minimum for any text: 20px
>
> Never use `height: auto` or flexible height. The template must render at exactly the specified dimensions."

- These rules are duplicated directly in SKILL.md (not just referenced from `image-design.md`) to ensure compliance.

**Files:** `skills/template-designer/SKILL.md`

### 3.2 Fix server dying on Windows (#7)

**Problem:** On Windows, `start-server.sh` runs in foreground mode (line 51-56). The `node server.js` process is a child of the Bash shell. When Claude Code needs to do something else, it kills the Bash process and the server dies with it.

**Solution:** On Windows, start the server as a detached background process instead of running in foreground:
- Remove the Windows auto-foreground override (lines 51-56 in `start-server.sh`).
- Use the same background launch path that macOS/Linux uses (`nohup node server.js &` with PID capture).
- Git Bash on Windows supports `nohup`, `&`, and `disown` — no need for `cmd.exe`.
- After launching, poll `server-info.json` for up to 5 seconds (same as current background mode).
- Return the server info JSON and exit the shell script, leaving the server running independently.

**Files:** `skills/template-designer/scripts/start-server.sh`

---

## 4. Dashboard

### 4.1 Fix NPC gender assignment and add round-robin (#10)

**Problem:** The Raul agent (male) got a female sprite. The current hash-based character selection ignores the `gender` field.

**Solution:**
- Use the `gender` field (already present on all agents) to select from the correct pool: `MALE_CHARACTERS` or `FEMALE_CHARACTERS`.
- Within each gender pool, assign characters via round-robin based on agent order: first male agent → Male1, second male agent → Male2, etc. Only reuse when the pool is exhausted.
- Keep assignment deterministic (based on agent index order, not random).

**Files:** `dashboard/src/office/OfficeScene.ts`

### 4.2 Remove handoff animation delay (#13)

**Problem:** The pipeline runner does `sleep 3` between agent handoffs. There's no animation to wait for anymore.

**Solution:**
- Remove the `sleep 3` from the handoff logic in `runner.pipeline.md`.
- The `delivering` status in state.json can remain (useful for visual indication) but must not block pipeline execution.

**Files:** `_opensquad/core/runner.pipeline.md`

---

## 5. Skill Renaming

### 5.1 Rename image-generator to image-ai-generator (#8)

**Problem:** The name `image-generator` is too similar to `image-creator`. Needs disambiguation.

**Solution:**
- Rename folder: `skills/image-generator/` → `skills/image-ai-generator/`
- Update all references across the codebase: Architect prompts (discovery, design, build), skill catalog, any YAML or markdown that mentions `image-generator`.

**Files:** `skills/image-generator/` (rename), all files referencing this skill name.

---

## 6. Research Performance

### 6.1 Lighter research phases (#11)

**Problem:** Initial research phase costs $1.08, takes 7 minutes, and uses 1.7M cache read tokens. Too heavy.

**Solution:**
- Add research directives to the research best-practices and to agent prompts:

> "Be objective and direct. Focus on the most relevant information. Don't repeat already-known context. Research enough to fulfill the task without being exhaustive."

- Audit what context is being loaded into research agents — if full investigations, best-practices catalogs, or other large documents are being injected unnecessarily, trim them.
- This aligns with #12's agile philosophy: agents should do the minimum needed to accomplish their goal.

**Files:** `_opensquad/core/best-practices/research.md`, `_opensquad/core/prompts/design.prompt.md` (agent generation instructions)

---

## Non-implementation item

### Token usage during squad creation (#9)

260k cache create + 8.5M cache read for squad creation is expected given the volume of files loaded (prompts, best-practices, investigations, catalog). Cache read is the cheapest token type (~$0.30/MTok). The $7.08 total for a full squad creation with investigation is reasonable. Second runs in the same session would be significantly cheaper as files shift from cache create to cache read. No action needed — improvements from #12 and #11 will naturally reduce this.
