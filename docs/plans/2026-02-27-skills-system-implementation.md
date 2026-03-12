# Skills System Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify "tools" and "skills" into a single "skills" concept across the entire Opensquad codebase.

**Architecture:** Replace `_opensquad/tools/` with `_opensquad/skills/`, convert all `.tool.yaml` files to `SKILL.md` format, rewrite the engine/runner/architect to use skills terminology, and update CLI to install skills to the new location.

**Tech Stack:** Node.js 20+, YAML frontmatter in Markdown, GitHub raw content API for skill distribution.

**Design doc:** `docs/plans/2026-02-27-skills-system-redesign.md`

---

## Task 1: Convert tool registry to skill catalog

Convert the 6 existing `.tool.yaml` files into `SKILL.md` format in the `skills/` directory at repo root. This is the new catalog that lives on GitHub.

**Files:**
- Create: `skills/apify/SKILL.md`
- Create: `skills/canva/SKILL.md`
- Create: `skills/instagram-publisher/SKILL.md`
- Create: `skills/instagram-publisher/scripts/publish.js` (copy from `templates/squads/instagram-content/tools/publish.js`)
- Create: `skills/blotato/SKILL.md`
- Create: `skills/asset-fetcher/SKILL.md`
- Create: `skills/visual-renderer/SKILL.md`
- Remove: `skills/manifest.json` (no longer needed — skills are folders, not a JSON registry)
- Remove: `skills/seo-optimizer/SKILL.md` (placeholder, will be re-added when actually built)
- Modify: `skills/README.md` — rewrite as full skill catalog

**Step 1: Read all existing tool definitions**

Read these files to extract content for conversion:
- `_opensquad/tools/registry/apify.tool.yaml`
- `_opensquad/tools/registry/canva.tool.yaml`
- `_opensquad/tools/registry/instagram-publisher.tool.yaml`
- `_opensquad/tools/registry/asset-fetcher.tool.yaml`
- `_opensquad/tools/registry/blotato.tool.yaml`
- `_opensquad/tools/registry/visual-renderer.tool.yaml`

**Step 2: Create each skill SKILL.md**

For each tool, convert the `.tool.yaml` schema into SKILL.md frontmatter + markdown body.

Conversion mapping:
- `name` → `name` (keep)
- `id` → `name` (use id as name, drop separate id field)
- `version` → `version` (keep)
- `type` → `type` (keep: mcp, script, hybrid)
- `description` → `description` (keep)
- `mcp.server_name` → `mcp.server_name`
- `mcp.command` → `mcp.command`
- `mcp.args` → `mcp.args`
- `mcp.transport` → `mcp.transport`
- `mcp.url` → `mcp.url`
- `mcp.headers` → `mcp.headers`
- `mcp.env` → `env` (flatten to top-level array of var names)
- `script.*` → `script.*` (keep structure)
- `instructions` → Markdown body (## When to use / ## Instructions)
- `categories` → `categories` (keep)
- `useful_for` → remove (architect will use categories + description)

Example — `skills/apify/SKILL.md`:
```markdown
---
name: apify
description: Web scraping and data extraction using Apify Actors. Run pre-built scrapers for social media, e-commerce, search engines, and any website.
type: mcp
version: "1.0.0"
mcp:
  server_name: apify
  command: npx
  args: ["-y", "@nicekiwi/apify-mcp-server"]
  transport: stdio
env:
  - APIFY_API_TOKEN
categories: [scraping, data, automation]
---

# Apify Web Scraper

## When to use
[Move instructions field content here — expand into proper markdown sections]

## Available operations
[List key capabilities]
```

Create all 6 skills following this pattern. For instagram-publisher (type: script), also copy the `publish.js` script into `skills/instagram-publisher/scripts/`.

**Step 3: Rewrite skills/README.md as catalog**

Replace current README.md with a catalog documenting all available skills:

```markdown
# Opensquad Skills Catalog

Available skills for Opensquad squads. Install via CLI or chat.

## Installation

\`\`\`bash
npx opensquad install <skill-name>
\`\`\`

Or in your IDE chat:
\`\`\`
/opensquad install <skill-name>
\`\`\`

## Available Skills

| Skill | Type | Description |
|-------|------|-------------|
| apify | MCP | Web scraping via Apify Actors |
| canva | MCP | Create and export Canva designs |
| ...   | ...  | ... |

## [skill-name]
[For each skill: description, required env vars, setup instructions]
```

**Step 4: Remove old files**

- Delete `skills/manifest.json`
- Delete `skills/seo-optimizer/` directory

**Step 5: Commit**

```bash
git add skills/
git commit -m "feat: convert tool registry to SKILL.md catalog format"
```

---

## Task 2: Create the opensquad-skill-creator

Create the skill that helps users create new Opensquad skills. Adapted from Anthropic's skill-creator (`temp/skill-creator/`).

**Files:**
- Create: `skills/opensquad-skill-creator/SKILL.md`
- Create: `skills/opensquad-skill-creator/agents/grader.md`
- Create: `skills/opensquad-skill-creator/agents/comparator.md`
- Create: `skills/opensquad-skill-creator/agents/analyzer.md`
- Create: `skills/opensquad-skill-creator/references/schemas.md`
- Create: `skills/opensquad-skill-creator/references/skill-format.md`
- Create: `skills/opensquad-skill-creator/scripts/aggregate_benchmark.py`
- Create: `skills/opensquad-skill-creator/scripts/generate_report.py`
- Create: `skills/opensquad-skill-creator/scripts/run_eval.py`
- Reference: `temp/skill-creator/SKILL.md` (480 lines — primary source)
- Reference: `temp/skill-creator/agents/*.md`
- Reference: `temp/skill-creator/references/schemas.md`
- Reference: `temp/skill-creator/scripts/*.py`

**Step 1: Write SKILL.md**

Adapt `temp/skill-creator/SKILL.md` with these changes:

1. **Frontmatter**: `name: opensquad-skill-creator`, description focused on creating Opensquad skills
2. **Skill type selection**: Add a step after "Capture Intent" asking what type of skill:
   - "Is this an integration with an external API/service? (MCP)" → guide through MCP config
   - "Is this a custom script that does something specific? (Script)" → guide through script setup
   - "Is this behavioral guidance for agents? (Prompt)" → standard skill writing
   - "Both MCP and script? (Hybrid)" → guide through both
3. **Frontmatter generation**: After interview, generate the correct YAML frontmatter per type:
   - Refer to `references/skill-format.md` for schemas
4. **Output location**: Skills go to `_opensquad/skills/<name>/` (not `.claude/skills/`)
5. **Remove description optimization**: Delete the entire "Description Optimization" section and `run_loop` references
6. **Remove packaging**: Delete `package_skill.py` references — skills stay in-place
7. **Adapt testing**: Instead of "run Claude with skill", test within squad agent context:
   - Create a temporary test squad
   - Assign the skill to a test agent
   - Run the agent with the skill injected
8. Keep: Core loop, eval system, grader/comparator/analyzer, benchmark viewer, iteration philosophy

**Step 2: Write skill-format.md reference**

Create `references/skill-format.md` documenting the SKILL.md format:

```markdown
# Opensquad Skill Format

## SKILL.md Structure

Every skill has a `SKILL.md` file with YAML frontmatter and Markdown body.

### Frontmatter Schema

#### Common fields (all types)
- `name` (string, required): Skill identifier
- `description` (string, required): What the skill does
- `type` (enum, required): mcp | script | hybrid | prompt
- `version` (string, required): Semver version
- `categories` (array, optional): Classification tags
- `env` (array, optional): Required environment variable names

#### Type: mcp
[Full schema with examples]

#### Type: script
[Full schema with examples]

#### Type: hybrid
[Combined schema]

#### Type: prompt
[Minimal schema — just name, description, version, type]

### Markdown Body
[Instructions for agents — what this skill does, when to use it, available operations]

### Resolution
[How the pipeline runner processes each type]
```

**Step 3: Adapt agent files**

Copy and adapt from `temp/skill-creator/agents/`:
- `grader.md` — keep as-is (generic grading logic works)
- `comparator.md` — keep as-is (generic comparison works)
- `analyzer.md` — keep as-is (generic analysis works)

**Step 4: Adapt schemas.md**

Copy from `temp/skill-creator/references/schemas.md` and keep as-is — the eval/grading/benchmark schemas are generic.

**Step 5: Adapt scripts**

Copy from `temp/skill-creator/scripts/`:
- `aggregate_benchmark.py` — keep as-is
- `generate_report.py` — keep as-is (or rename from generate_review.py if that's the correct one)
- `run_eval.py` — keep as-is

Check: `temp/skill-creator/scripts/` contains `aggregate_benchmark.py`, `generate_report.py`, `run_eval.py`, `run_loop.py`, `quick_validate.py`, `improve_description.py`, `package_skill.py`, `utils.py`, `__init__.py`.

Only copy the ones needed (exclude `run_loop.py`, `improve_description.py`, `package_skill.py` — these are for description optimization and packaging which we removed).

Keep: `aggregate_benchmark.py`, `generate_report.py`, `run_eval.py`, `quick_validate.py`, `utils.py`, `__init__.py`

Also check if `eval-viewer/generate_review.py` and `eval-viewer/viewer.html` should be included — the SKILL.md references `generate_review.py` for the benchmark viewer. Include them:
- Create: `skills/opensquad-skill-creator/eval-viewer/generate_review.py`
- Create: `skills/opensquad-skill-creator/eval-viewer/viewer.html`
- Create: `skills/opensquad-skill-creator/assets/eval_review.html` (for eval set review UI)

**Step 6: Commit**

```bash
git add skills/opensquad-skill-creator/
git commit -m "feat: create opensquad-skill-creator skill"
```

---

## Task 3: Write skills.engine.md

Replace `tools.engine.md` with the new skills engine.

**Files:**
- Create: `_opensquad/core/skills.engine.md`
- Remove: `_opensquad/core/tools.engine.md` (done in Task 12)

**Step 1: Write skills.engine.md**

Create `_opensquad/core/skills.engine.md` based on the design doc's "Skills Engine" section. This replaces the 245-line `tools.engine.md`.

Key differences from `tools.engine.md`:
- **No registry**: Skills are installed directly as folders in `_opensquad/skills/`
- **No .installed.yaml bindings**: A skill is installed if its folder exists
- **No squad overrides**: Override mechanism removed for simplicity
- **Installation source**: GitHub raw content (`skills/<name>/`) instead of local registry
- **Interactive install prompt**: When skill not found at runtime

Structure of `skills.engine.md`:

```markdown
# Opensquad Skills Engine

You are the Skills Engine. Your job is to manage skill integrations for Opensquad squads.

## Skill Types
- **mcp**: MCP server integration
- **script**: Custom script
- **hybrid**: Both MCP and script
- **prompt**: Behavioral instructions only

## File Locations
- **Installed skills**: `_opensquad/skills/` — each skill in its own subfolder
- **Skill catalog**: https://github.com/opensquad-ai/opensquad/tree/main/skills

## SKILL.md Format
[Reference to skill-format.md in opensquad-skill-creator]

## Operations

### 1. List Installed Skills
1. Read all subdirectories in `_opensquad/skills/`
2. For each, read SKILL.md frontmatter
3. Display: name, type, version, description, env status

### 2. Install a Skill
1. User provides skill name
2. Fetch skill folder contents from GitHub:
   - Fetch `https://raw.githubusercontent.com/opensquad-ai/opensquad/main/skills/<name>/SKILL.md`
   - For skills with scripts/references/assets: fetch each listed file
3. Write to `_opensquad/skills/<name>/`
4. Read SKILL.md frontmatter to check requirements:
   a. If `env:` present → check each var in `.env`, warn about missing ones
   b. If `mcp:` present → configure MCP in `.claude/settings.local.json`
      (same stdio/http logic as old tools.engine.md Operations 2.5/2.6)
   c. If `script:` present → verify script file exists, install dependencies
5. Confirm: "✅ {name} installed!"

### 3. Remove a Skill
1. User selects skill from installed list
2. Warn which squads use this skill (scan squad.yaml files)
3. If confirmed:
   a. Delete `_opensquad/skills/<name>/`
   b. Remove MCP config from `.claude/settings.local.json` if applicable
   c. Warn about dependent squads

### 4. Resolve Skills for Pipeline
Called BEFORE pipeline execution:
1. Read `squad.yaml` → `skills:` section
2. Separate native skills (web_search, web_fetch)
3. For each non-native skill:
   a. Check `_opensquad/skills/<name>/` exists
   b. If not → prompt: "Skill '{name}' not found. Install now? (y/n)"
      - If yes → run Install flow
      - If no → ERROR, stop pipeline
   c. Read SKILL.md, parse frontmatter
   d. If type: mcp → verify MCP configured in `.claude/settings.local.json`
4. Return resolved skill list

### 5. Inject Skill Instructions into Agent
For each skill declared in agent's `.agent.md` frontmatter `skills:`:
1. Load SKILL.md body (everything after frontmatter)
2. Append to agent context:
   --- SKILL INSTRUCTIONS ---
   ## {skill name from frontmatter}
   {SKILL.md body}
3. Multi-skill injection follows declaration order

### 6. Skill Discovery (called by Architect in Phase 3.5)
1. Fetch skills/README.md from GitHub (or list `_opensquad/skills/` for already-installed)
2. Match `categories` against squad needs
3. Suggest relevant skills to user
4. For each accepted → run Install flow
5. Add to squad's `skills:` list
```

**Step 2: Commit**

```bash
git add _opensquad/core/skills.engine.md
git commit -m "feat: create skills.engine.md replacing tools.engine.md"
```

---

## Task 4: Rewrite src/skills.js

The current `src/skills.js` installs skills to `.claude/skills/`. Rewrite it to install to `_opensquad/skills/`.

**Files:**
- Modify: `src/skills.js:1-52`
- Test: `tests/skills.test.js`

**Step 1: Write the failing tests**

Rewrite `tests/skills.test.js` to test the new behavior:
- `listInstalled` should scan `_opensquad/skills/` (not `.claude/skills/`)
- `listInstalled` should exclude `opensquad-skill-creator` (the built-in, like old code excluded `opensquad`)
- `installSkill` should write to `_opensquad/skills/<id>/SKILL.md`
- `installSkill` should handle skills with subdirectories (scripts/, references/, etc.)
- `removeSkill` should delete from `_opensquad/skills/<id>/`
- `fetchManifest` is removed — no more manifest, we fetch individual skill files
- New: `fetchSkillFiles` fetches the SKILL.md + any referenced subdirectory files
- New: `getSkillVersion` reads version from SKILL.md frontmatter

Run: `node --test tests/skills.test.js`
Expected: FAIL — functions don't exist yet or have wrong behavior

**Step 2: Rewrite src/skills.js**

```javascript
import { mkdir, readdir, readFile, rm, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const REGISTRY_BASE = 'https://raw.githubusercontent.com/opensquad-ai/opensquad/main';

export async function listInstalled(targetDir) {
  try {
    const skillsDir = join(targetDir, '_opensquad', 'skills');
    const entries = await readdir(skillsDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && e.name !== 'opensquad-skill-creator')
      .map((e) => e.name);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

function validateSkillId(id) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    throw new Error(`Invalid skill id: '${id}'`);
  }
}

export async function installSkill(id, targetDir, fetcher = fetch) {
  validateSkillId(id);
  const url = `${REGISTRY_BASE}/skills/${id}/SKILL.md`;
  const res = await fetcher(url);
  if (!res.ok) throw new Error(`Skill '${id}' not found in registry (${res.status})`);
  const content = await res.text();
  const destDir = join(targetDir, '_opensquad', 'skills', id);
  await mkdir(destDir, { recursive: true });
  await writeFile(join(destDir, 'SKILL.md'), content, 'utf-8');
}

export async function removeSkill(id, targetDir) {
  validateSkillId(id);
  const skillDir = join(targetDir, '_opensquad', 'skills', id);
  await rm(skillDir, { recursive: true, force: true });
}

export async function getSkillVersion(id, targetDir) {
  try {
    const skillMd = await readFile(
      join(targetDir, '_opensquad', 'skills', id, 'SKILL.md'), 'utf-8'
    );
    const match = skillMd.match(/^version:\s*"?([^"\n]+)"?/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}
```

**Step 3: Run tests**

Run: `node --test tests/skills.test.js`
Expected: PASS

**Step 4: Commit**

```bash
git add src/skills.js tests/skills.test.js
git commit -m "feat: rewrite skills.js to install to _opensquad/skills/"
```

---

## Task 5: Update CLI (bin/opensquad.js + src/skills-cli.js)

Update CLI to support new command structure: `npx opensquad install/uninstall/update/skills`.

**Files:**
- Modify: `bin/opensquad.js:1-40`
- Modify: `src/skills-cli.js:1-143`

**Step 1: Update bin/opensquad.js**

Add new top-level commands alongside existing ones:

```javascript
#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { init } from '../src/init.js';
import { update } from '../src/update.js';
import { skillsCli } from '../src/skills-cli.js';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  strict: false,
  options: {
    version: { type: 'string' },
  },
});

const command = positionals[0];

if (command === 'init') {
  await init(process.cwd());
} else if (command === 'update') {
  // 'npx opensquad update' with no args = update core
  // 'npx opensquad update <name>' = update specific skill
  const target = positionals[1];
  if (target) {
    const result = await skillsCli('update', [target], process.cwd());
    if (!result.success) process.exit(1);
  } else {
    const result = await update(process.cwd());
    if (!result.success) process.exit(1);
  }
} else if (command === 'install') {
  const result = await skillsCli('install', positionals.slice(1), process.cwd());
  if (!result.success) process.exit(1);
} else if (command === 'uninstall') {
  const result = await skillsCli('remove', positionals.slice(1), process.cwd());
  if (!result.success) process.exit(1);
} else if (command === 'skills') {
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await skillsCli(subcommand || 'list', args, process.cwd());
  if (!result.success) process.exit(1);
} else {
  console.log(`
  opensquad — Multi-agent orchestration for Claude Code

  Usage:
    npx opensquad init                    Initialize Opensquad in current directory
    npx opensquad update                  Update Opensquad core to the latest version
    npx opensquad install <name>          Install a skill
    npx opensquad uninstall <name>        Remove a skill
    npx opensquad update <name>           Update a specific skill
    npx opensquad skills                  List installed skills

  Learn more: https://github.com/opensquad-ai/opensquad
  `);
  process.exit(command ? 1 : 0);
}
```

**Step 2: Update src/skills-cli.js**

Update to use the new `listInstalled` from `src/skills.js` (which now reads `_opensquad/skills/`).

Key changes:
- `runList`: Instead of fetching manifest, just list installed skills from `_opensquad/skills/` and show a link to the GitHub catalog
- `runInstall`: Install to `_opensquad/skills/` (already handled by updated `skills.js`)
- `runRemove`: Remove from `_opensquad/skills/`
- `runUpdate`: Re-download each installed skill from GitHub
- Remove `fetchManifest` dependency — no more manifest.json

**Step 3: Commit**

```bash
git add bin/opensquad.js src/skills-cli.js
git commit -m "feat: update CLI for new skills install/uninstall/update commands"
```

---

## Task 6: Update src/init.js

Update the init flow to copy `opensquad-skill-creator` instead of the tools directory.

**Files:**
- Modify: `src/init.js:130-144` (copyCommonTemplates already handles this — but we need the templates to be correct)

**Step 1: Verify init.js logic**

The `copyCommonTemplates` function copies everything from `templates/` except `ide-templates/`. Since we'll update the templates directory (Task 10) to have `_opensquad/skills/` instead of `_opensquad/tools/`, the init.js code should work without changes.

Verify by reading the function — it recursively copies all files from `templates/` preserving directory structure. If `templates/_opensquad/skills/opensquad-skill-creator/` exists and `templates/_opensquad/tools/` is removed, init will automatically do the right thing.

**No code changes needed** — the templates directory change (Task 10) handles this.

**Step 2: Verify with a dry run**

Run: `node --test tests/init.test.js`
Expected: Tests may need updating if they assert on specific template paths.

---

## Task 7: Update src/update.js

The update flow copies templates to the user's directory, skipping protected paths. Ensure skills are handled correctly.

**Files:**
- Modify: `src/update.js:24-28` (PROTECTED_PATHS)

**Step 1: Add _opensquad/skills to protected paths**

User-installed skills should NOT be overwritten during update. Only the `opensquad-skill-creator` (which comes from templates) should be updated.

```javascript
const PROTECTED_PATHS = [
  '_opensquad/_memory',
  '_opensquad/_investigations',
  '_opensquad/skills',     // Don't overwrite user-installed skills
  'squads',
];
```

Wait — this would also prevent updating the skill-creator. We need a more nuanced approach:

Actually, the template only contains `opensquad-skill-creator`. User-installed skills are NOT in templates. So the update would only copy the skill-creator, which is correct — we WANT to update the skill-creator.

But with `_opensquad/skills` in PROTECTED_PATHS, we'd block that update. So we should NOT add it to protected paths. The update will:
1. Copy `templates/_opensquad/skills/opensquad-skill-creator/` → overwrites with latest version ✅
2. User-installed skills (e.g., `_opensquad/skills/canva/`) are NOT in templates, so they won't be touched ✅

**No code changes needed** — the current logic already works correctly.

**Step 2: Run tests**

Run: `node --test tests/update.test.js`
Expected: Tests may need updating if they assert on tools directory structure.

---

## Task 8: Update architect.agent.yaml

Rename all "tool" references to "skill" and update Phase 3.5.

**Files:**
- Modify: `_opensquad/core/architect.agent.yaml`

**Step 1: Apply changes**

Global replacements in the file:
1. Line 15: `tools.` → `skills.` in persona role
2. Line 31: `Research tools use subagent` → `Research skills use subagent`
3. Line 42: `"Tool discovery: after extraction, scan _opensquad/tools/registry/..."` → `"Skill discovery: after extraction, scan _opensquad/skills/ for installed skills and check the GitHub catalog for additional skills matching the squad's needs"`
4. Lines 303-322: Rewrite Phase 3.5 "Tool Discovery" → "Skill Discovery":
   - Read installed skills from `_opensquad/skills/`
   - Also check GitHub catalog for available skills not yet installed
   - Match `categories` against squad needs
   - If skill not installed → offer to install
   - Reference `skills.engine.md` Operation 2 (Install) instead of `tools.engine.md`
5. Lines 467-475: `tools:` → `skills:` in squad.yaml template
6. Line 509: Agent frontmatter `tools: []` → `skills: []`

**Step 2: Commit**

```bash
git add _opensquad/core/architect.agent.yaml
git commit -m "refactor: rename tools to skills in architect agent"
```

---

## Task 9: Update runner.pipeline.md

Update the pipeline runner to resolve skills instead of tools.

**Files:**
- Modify: `_opensquad/core/runner.pipeline.md:16-24, 85-95`

**Step 1: Apply changes**

1. Lines 16-24 (Initialization step 3 "Resolve tools"):
   Replace entire block with:
   ```
   3. **Resolve skills**: Read `squad.yaml` → `skills` section. For each non-native skill:
      a. Verify `_opensquad/skills/{skill}/SKILL.md` exists
         - If missing → prompt user: "Skill '{skill}' is not installed. Install now? (y/n)"
         - If yes → read `_opensquad/core/skills.engine.md`, follow Operation 2 (Install)
         - If no → **ERROR**: stop pipeline
      b. Read SKILL.md, parse frontmatter for type
      c. If type: mcp, verify MCP is configured in `.claude/settings.local.json`
         - If missing → **ERROR**: "Skill '{skill}' MCP not configured. Reinstall the skill."
      All skills must resolve successfully before the pipeline starts (fail fast).
   ```

2. Lines 85-95 (Agent loading step 4 "Inject tool instructions"):
   Replace with:
   ```
   4. **Inject skill instructions**: Check which skills the agent declares in its frontmatter `skills:`.
      For each non-native skill declared:
      a. Read `_opensquad/skills/{skill}/SKILL.md`
      b. Extract the Markdown body (everything after the YAML frontmatter)
      c. Append to the agent's context, after all agent instructions:
         --- SKILL INSTRUCTIONS ---
         ## {name from frontmatter}
         {markdown body}
      d. Follow declaration order in the agent's frontmatter for multi-skill injection
   ```

3. All other "tool" → "skill" renames throughout the file (search and replace, preserving context).

**Step 2: Commit**

```bash
git add _opensquad/core/runner.pipeline.md
git commit -m "refactor: rename tools to skills in pipeline runner"
```

---

## Task 10: Update templates directory

Remove tools, add skills, update all template files.

**Files:**
- Remove: `templates/_opensquad/tools/` (entire directory)
- Remove: `templates/_opensquad/core/tools.engine.md`
- Remove: `templates/squads/instagram-content/tools/` (directory)
- Create: `templates/_opensquad/skills/opensquad-skill-creator/` (copy from `skills/opensquad-skill-creator/`)
- Create: `templates/_opensquad/core/skills.engine.md` (copy from `_opensquad/core/skills.engine.md`)
- Modify: `templates/_opensquad/core/architect.agent.yaml` (copy updated version)
- Modify: `templates/_opensquad/core/runner.pipeline.md` (copy updated version)
- Modify: `templates/squads/instagram-content/squad.yaml` (`tools:` → `skills:`)
- Modify: `templates/squads/instagram-content/squad-party.csv` (if it references tools)
- Modify: `templates/squads/instagram-content/agents/*.agent.md` (`tools:` → `skills:` in frontmatter)

**Step 1: Remove old tools directories**

```bash
rm -rf templates/_opensquad/tools/
rm -f templates/_opensquad/core/tools.engine.md
rm -rf templates/squads/instagram-content/tools/
```

**Step 2: Copy new skills files**

```bash
# Copy skill-creator to templates
cp -r skills/opensquad-skill-creator/ templates/_opensquad/skills/opensquad-skill-creator/

# Copy updated core files to templates
cp _opensquad/core/skills.engine.md templates/_opensquad/core/skills.engine.md
cp _opensquad/core/architect.agent.yaml templates/_opensquad/core/architect.agent.yaml
cp _opensquad/core/runner.pipeline.md templates/_opensquad/core/runner.pipeline.md
```

**Step 3: Update squad template files**

In `templates/squads/instagram-content/squad.yaml`:
- Change `tools:` → `skills:`

In each `templates/squads/instagram-content/agents/*.agent.md`:
- Change `tools:` → `skills:` in frontmatter

**Step 4: Commit**

```bash
git add templates/
git commit -m "refactor: update templates — remove tools, add skills"
```

---

## Task 11: Update IDE templates and SKILL.md files

Update all IDE-specific template files and the live `/opensquad` skill.

**Files:**
- Modify: `.claude/skills/opensquad/SKILL.md` (live — current project)
- Modify: `templates/ide-templates/claude-code/.claude/skills/opensquad/SKILL.md`
- Modify: `templates/ide-templates/claude-code/CLAUDE.md`
- Modify: `templates/ide-templates/antigravity/.antigravity/rules.md`
- Modify: `templates/ide-templates/codex/AGENTS.md`
- Modify: `templates/ide-templates/opencode/AGENTS.md`

**Step 1: Update .claude/skills/opensquad/SKILL.md (live)**

This is the main `/opensquad` skill with 200 lines. Changes:

1. **Main Menu** (lines 39-51): Remove "Tools" as separate option. Merge into "Skills":
   ```
   **Primary menu:**
   - Create a new squad
   - Run an existing squad
   - My squads
   - More options — Skills, company profile, settings, and help

   **More options:**
   - Skills — Browse, install, and manage skills for your squads
   - Company profile
   - Settings & Help
   ```

2. **Command Routing** (lines 57-73): Replace tools routes with skills:
   ```
   | `/opensquad skills` | Load Skills Engine → Show skills menu |
   | `/opensquad install <name>` | Install a skill from the catalog |
   | `/opensquad uninstall <name>` | Remove an installed skill |
   ```
   Remove: `| /opensquad tools |`

3. **Help Text** (lines 77-121): Remove TOOLS section, update SKILLS section:
   ```
   SKILLS
     /opensquad skills           Browse installed skills
     /opensquad install <name>   Install a skill from catalog
     /opensquad uninstall <name> Remove a skill
   ```

4. **Loading the Tools Engine** (lines 153-164): Replace entirely with "Loading the Skills Engine":
   ```
   ## Loading the Skills Engine

   When the user selects "Skills" or types `/opensquad skills`:

   1. Read `_opensquad/core/skills.engine.md` for the skills engine instructions
   2. Present the skills submenu using AskUserQuestion:
      - **View installed skills** — See what skills are available
      - **Install a skill** — Browse the catalog and install
      - **Create a skill** — Create a custom skill (uses opensquad-skill-creator)
      - **Remove a skill** — Uninstall a skill
   3. Follow the corresponding operation in the skills engine
   ```

5. **Loading the Skills Browser** (lines 166-182): Remove entirely (merged into Skills Engine above)

6. All remaining "tool" → "skill" renames

**Step 2: Update template SKILL.md (claude-code)**

Apply the same changes to `templates/ide-templates/claude-code/.claude/skills/opensquad/SKILL.md`.
Note: this is a separate file from the live one. Check if they differ and apply changes to both.

**Step 3: Update CLAUDE.md template**

`templates/ide-templates/claude-code/CLAUDE.md` — currently no "tool" references, but verify and add skills info if needed.

**Step 4: Update Antigravity rules.md**

`templates/ide-templates/antigravity/.antigravity/rules.md` — has "Tools" menu reference at line 40-46. Replace "Tools" with "Skills":
- Line 40: `- **More options** — Tools,` → `- **More options** — Skills,`
- Lines 43-46: Replace Tools submenu with Skills
- Line 61: `/opensquad tools` → `/opensquad skills`

**Step 5: Update Codex and OpenCode AGENTS.md**

Same changes as Antigravity — both files have identical content. Replace "Tools" references with "Skills".

**Step 6: Commit**

```bash
git add .claude/skills/opensquad/SKILL.md templates/ide-templates/
git commit -m "refactor: update IDE templates — tools to skills"
```

---

## Task 12: Update CLAUDE.md and README.md

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`

**Step 1: Update CLAUDE.md**

Current CLAUDE.md at project root (35 lines). No direct "tool" references, but update directory structure description if present. Also add skills info:

Add to Directory Structure section:
```
- `_opensquad/skills/` — Installed skills (integrations, scripts, prompts)
```

Remove any tools-related lines if present.

**Step 2: Update README.md**

Current README.md (102 lines). Add skills commands to the Commands table:

```markdown
| `/opensquad skills` | Browse and install skills |
| `/opensquad install <name>` | Install a skill |
```

Remove any tools-related commands.

**Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: update CLAUDE.md and README.md for skills system"
```

---

## Task 13: Update i18n locale files

Update English locale keys and translate.

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/pt-BR.json`
- Modify: `src/locales/es.json`

**Step 1: Update en.json**

The existing skills-related keys already work for the new system (they talk about "skills"). But we need to:
- Update `skillsInstallHint` to use new command format: `Install with: npx opensquad install <id>`
- Add new keys if needed for uninstall confirmation, skill type display, etc.
- Remove any "tool"-related keys if they exist

**Step 2: Update pt-BR.json and es.json**

Apply corresponding translations for any new or changed keys.

**Step 3: Commit**

```bash
git add src/locales/
git commit -m "refactor: update i18n keys for skills system"
```

---

## Task 14: Update tests

Update all test files to work with the new skills structure.

**Files:**
- Modify: `tests/skills.test.js` (already partially done in Task 4)
- Modify: `tests/init.test.js`
- Modify: `tests/update.test.js`

**Step 1: Finalize tests/skills.test.js**

Ensure all tests use `_opensquad/skills/` paths instead of `.claude/skills/`:
- `listInstalled` scans `_opensquad/skills/`, excludes `opensquad-skill-creator`
- `installSkill` writes to `_opensquad/skills/<id>/SKILL.md`
- `removeSkill` deletes from `_opensquad/skills/<id>/`
- Remove `fetchManifest` tests (function removed)
- Add `getSkillVersion` tests

**Step 2: Update tests/init.test.js**

If tests assert on created file paths, update to expect `_opensquad/skills/opensquad-skill-creator/` instead of `_opensquad/tools/`.

**Step 3: Update tests/update.test.js**

If tests assert on updated file paths, update to expect skills structure.

**Step 4: Run all tests**

Run: `node --test tests/`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add tests/
git commit -m "test: update all tests for skills system"
```

---

## Task 15: Cleanup old artifacts

Remove all old tools-related files from the working directory (not just templates).

**Files:**
- Remove: `_opensquad/tools/` (entire directory)
- Remove: `_opensquad/core/tools.engine.md`

**Step 1: Remove old tools directory**

```bash
rm -rf _opensquad/tools/
rm -f _opensquad/core/tools.engine.md
```

**Step 2: Copy skills engine to working directory**

The `skills.engine.md` was created in Task 3 for the working directory.
Verify it exists at `_opensquad/core/skills.engine.md`.

**Step 3: Copy skill-creator to working directory**

```bash
cp -r skills/opensquad-skill-creator/ _opensquad/skills/opensquad-skill-creator/
```

**Step 4: Verify directory structure**

```bash
# Should show skills/ with opensquad-skill-creator
ls _opensquad/skills/

# Should NOT exist
ls _opensquad/tools/ 2>/dev/null && echo "ERROR: tools still exists" || echo "OK: tools removed"

# Should show skills.engine.md, NOT tools.engine.md
ls _opensquad/core/*.engine.md
```

**Step 5: Run full test suite**

Run: `node --test tests/`
Expected: ALL PASS

**Step 6: Final commit**

```bash
git add -A
git commit -m "refactor: remove old tools artifacts, complete skills migration"
```

---

## Task 16: Update prompts that reference tools

Check and update any core prompt files that mention "tools".

**Files:**
- Check: `_opensquad/core/prompts/*.prompt.md`
- Check: `templates/_opensquad/core/prompts/*.prompt.md`

**Step 1: Search for "tool" references in prompts**

```bash
grep -r "tool" _opensquad/core/prompts/ --include="*.md" -l
```

**Step 2: Update any found references**

For each file with "tool" references:
- Replace "tool" → "skill" where it refers to the Opensquad concept
- Keep "tool" if it refers to generic IDE tools (e.g., "Use the WebSearch tool")
- Be careful with context — "tools" in agent frontmatter → "skills", but "Bash tool" stays

**Step 3: Copy updated prompts to templates**

```bash
cp _opensquad/core/prompts/*.prompt.md templates/_opensquad/core/prompts/
```

**Step 4: Commit**

```bash
git add _opensquad/core/prompts/ templates/_opensquad/core/prompts/
git commit -m "refactor: update prompt templates — tools to skills"
```

---

## Execution Order

Tasks 1-2 can run in parallel (catalog + skill-creator are independent).
Task 3 depends on design understanding but not on 1-2.
Tasks 4-5 depend on Task 3 (new function signatures).
Tasks 6-7 are independent verification (likely no changes needed).
Tasks 8-9 can run in parallel (architect + runner are independent files).
Task 10 depends on 3, 8, 9 (copies updated files to templates).
Task 11 depends on understanding the final menu structure.
Tasks 12-13 are independent text updates.
Task 14 depends on 4 (new skills.js functions).
Task 15 depends on all prior tasks.
Task 16 is independent text search/replace.

Recommended parallel groups:
1. **Group A** (parallel): Tasks 1, 2, 3
2. **Group B** (parallel): Tasks 4, 5 (after Group A)
3. **Group C** (parallel): Tasks 8, 9, 16 (after Group A)
4. **Group D** (sequential): Task 10 (after Groups B, C)
5. **Group E** (parallel): Tasks 6, 7, 11, 12, 13 (after Group D)
6. **Group F** (sequential): Tasks 14, 15 (after all)
