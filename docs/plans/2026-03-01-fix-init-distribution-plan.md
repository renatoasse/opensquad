# Fix Init Distribution — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix Opensquad distribution so `npx opensquad init` delivers all formats, agents, skills, and up-to-date core files to new projects.

**Architecture:** Three changes: (1) sync stale templates with source, (2) modify `src/init.js` to auto-install all bundled agents and non-MCP skills silently after copying templates, (3) modify `src/update.js` to install new agents/skills that weren't in the previous version.

**Tech Stack:** Node.js (ESM), node:test, node:fs/promises

**Design doc:** `docs/plans/2026-03-01-fix-init-distribution-design.md`

---

### Task 1: Sync templates with source (immediate fix)

This is a file-copy task — no code changes, just syncing the `templates/` directory with the actual source files.

**Files:**
- Create: `templates/_opensquad/core/formats/` (14 files)
- Delete: `templates/_opensquad/core/platforms/` (4 deprecated files)
- Overwrite: `templates/_opensquad/core/architect.agent.yaml`
- Overwrite: `templates/_opensquad/core/runner.pipeline.md`
- Overwrite: `templates/_opensquad/core/prompts/sherlock.prompt.md`

**Step 1: Copy formats directory to templates**

```bash
mkdir -p templates/_opensquad/core/formats
cp _opensquad/core/formats/*.md templates/_opensquad/core/formats/
```

This copies all 14 format files (blog-post.md, blog-seo.md, email-newsletter.md, email-sales.md, instagram-feed.md, instagram-reels.md, instagram-stories.md, linkedin-article.md, linkedin-post.md, twitter-post.md, twitter-thread.md, whatsapp-broadcast.md, youtube-script.md, youtube-shorts.md).

**Step 2: Delete deprecated platforms directory from templates**

```bash
rm -rf templates/_opensquad/core/platforms
```

The `platforms/` directory was deprecated in favor of the `formats/` system. It was deleted from source but left in templates.

**Step 3: Sync outdated core files**

```bash
cp _opensquad/core/architect.agent.yaml templates/_opensquad/core/architect.agent.yaml
cp _opensquad/core/runner.pipeline.md templates/_opensquad/core/runner.pipeline.md
cp _opensquad/core/prompts/sherlock.prompt.md templates/_opensquad/core/prompts/sherlock.prompt.md
```

**Step 4: Verify sync is correct**

```bash
diff -r _opensquad/core templates/_opensquad/core --brief
```

Expected output: should show NO differences (or only differences for files that intentionally differ).

**Step 5: Run existing tests to confirm templates still work**

```bash
node --test tests/init.test.js
```

Expected: all 19 tests pass.

**Step 6: Commit**

```bash
git add templates/_opensquad/core/
git commit -m "fix: sync templates with source — add formats, remove platforms, update configs"
```

---

### Task 2: Add agent auto-install to init

Modify `src/init.js` to silently install all bundled agents during `npx opensquad init`.

**Files:**
- Modify: `src/init.js:1-7` (add import), `src/init.js:90-93` (add call)

**Step 1: Write the failing test**

Add to `tests/init.test.js`:

```js
test('init installs all bundled agents', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    // agents/ directory should exist with .agent.md files
    const agentsDir = join(tempDir, 'agents');
    await stat(agentsDir);

    const entries = await readdir(agentsDir);
    const agentFiles = entries.filter((f) => f.endsWith('.agent.md'));

    // At least 1 agent should be installed
    assert.ok(agentFiles.length > 0, 'No agent files found');

    // Verify a known agent exists
    await stat(join(agentsDir, 'researcher.agent.md'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

Note: you'll need to add `readdir` to the import at the top of the test file:
```js
import { mkdtemp, rm, stat, readFile, readdir } from 'node:fs/promises';
```

**Step 2: Run test to verify it fails**

```bash
node --test tests/init.test.js --test-name-pattern "installs all bundled agents"
```

Expected: FAIL — `agents/` directory does not exist after init.

**Step 3: Implement installAllAgents in init.js**

In `src/init.js`, add the import at line 7 (after the existing skills import):

```js
import { listAvailable as listAvailableAgents, installAgent } from './agents.js';
```

Add a new function after `copyIdeTemplates`:

```js
async function installAllAgents(targetDir) {
  const available = await listAvailableAgents();
  for (const id of available) {
    await installAgent(id, targetDir);
    console.log(`  ${t('createdFile', { path: `agents/${id}.agent.md` })}`);
  }
}
```

In the `init()` function, add the call after `copyIdeTemplates` (after line 92, before `writeProjectReadme`):

```js
  // Copy template files
  await copyCommonTemplates(targetDir);
  await copyIdeTemplates(ides, targetDir);
  await installAllAgents(targetDir);
  await writeProjectReadme(targetDir, language);
```

**Step 4: Run test to verify it passes**

```bash
node --test tests/init.test.js --test-name-pattern "installs all bundled agents"
```

Expected: PASS

**Step 5: Run all init tests**

```bash
node --test tests/init.test.js
```

Expected: all tests pass (existing + new).

**Step 6: Commit**

```bash
git add src/init.js tests/init.test.js
git commit -m "feat(init): auto-install all bundled agents during init"
```

---

### Task 3: Add non-MCP skill auto-install to init

Modify `src/init.js` to silently install all non-MCP bundled skills during init. MCP skills (apify, blotato, canva) and skills with env vars (instagram-publisher) continue to be offered via the interactive prompt.

**Current bundled skills and their types:**
- `apify` — type: mcp, env: APIFY_TOKEN → **skip** (already in interactive prompt)
- `blotato` — type: mcp, env: BLOTATO_API_KEY → **skip** (already in interactive prompt)
- `canva` — type: mcp → **skip** (already in interactive prompt)
- `image-creator` — type: mcp → **skip** (already in interactive prompt)
- `image-fetcher` — type: hybrid → **skip** (already in interactive prompt)
- `instagram-publisher` — type: script, env: 3 vars → **skip** (already in interactive prompt)
- `opensquad-skill-creator` — type: prompt → **skip** (internal, already filtered)

All current bundled skills are either MCP, hybrid, or have env vars — they're ALL already offered via the interactive skills selection prompt during init. The `listAvailable()` + `getSkillMeta()` flow in `init.js:67-82` already handles them.

The auto-install mechanism is needed for FUTURE non-MCP skills (like `opensquad-agent-creator` and `opensquad-agent-updater` which exist in `_opensquad/skills/` but not in `skills/`). However, looking at the current codebase, the skills in `_opensquad/skills/` are template-distributed (copied from `templates/_opensquad/skills/`), NOT installed from `skills/`.

**Decision:** The auto-install function should be added now as infrastructure, but currently it will be a no-op since all bundled skills require user interaction (MCP config, env vars). The function should filter to only install skills that have NO env vars AND are NOT type `mcp` or `hybrid`.

**Files:**
- Modify: `src/init.js:90-93` (add call)
- Modify: `tests/init.test.js` (add test)

**Step 1: Write the failing test**

Add to `tests/init.test.js`:

```js
test('init does not install MCP skills automatically', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    // MCP skills should NOT be auto-installed (they need user configuration)
    // Only skills from templates/_opensquad/skills/ should exist
    const skillsDir = join(tempDir, '_opensquad', 'skills');
    const entries = await readdir(skillsDir);

    // apify, blotato, canva etc should NOT be in the skills dir
    // (unless they came from templates, which they don't)
    assert.ok(!entries.includes('apify'), 'apify should not be auto-installed');
    assert.ok(!entries.includes('blotato'), 'blotato should not be auto-installed');
    assert.ok(!entries.includes('canva'), 'canva should not be auto-installed');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

**Step 2: Run test to verify it passes (it should already pass)**

```bash
node --test tests/init.test.js --test-name-pattern "does not install MCP"
```

Expected: PASS (since MCP skills are not auto-installed today either).

**Step 3: Add installNonMcpSkills function to init.js**

Add a new function:

```js
async function installNonMcpSkills(targetDir) {
  const available = await listAvailable();
  for (const id of available) {
    if (id === 'opensquad-skill-creator') continue;
    const meta = await getSkillMeta(id);
    if (!meta) continue;
    // Skip MCP/hybrid skills — they need user configuration
    if (meta.type === 'mcp' || meta.type === 'hybrid') continue;
    // Skip skills with env vars — they need user setup
    if (meta.env?.length > 0) continue;
    await installSkill(id, targetDir);
    console.log(`  ${t('createdFile', { path: `_opensquad/skills/${id}/SKILL.md` })}`);
  }
}
```

Add the call in `init()` after `installAllAgents`:

```js
  await copyCommonTemplates(targetDir);
  await copyIdeTemplates(ides, targetDir);
  await installAllAgents(targetDir);
  await installNonMcpSkills(targetDir);
  await writeProjectReadme(targetDir, language);
```

**Step 4: Run all init tests**

```bash
node --test tests/init.test.js
```

Expected: all tests pass.

**Step 5: Commit**

```bash
git add src/init.js tests/init.test.js
git commit -m "feat(init): auto-install non-MCP bundled skills during init"
```

---

### Task 4: Add agent/skill install to update

Modify `src/update.js` to install NEW bundled agents and non-MCP skills during `npx opensquad update`. This handles the case where a user already has Opensquad installed and a new version adds agents/skills.

**Key behavior:**
- Install agents that exist in the bundle but NOT in the user's `agents/` directory
- Install non-MCP skills that exist in the bundle but NOT in the user's `_opensquad/skills/` directory
- NEVER overwrite existing agents (they're in PROTECTED_PATHS and may have user customizations)
- NEVER overwrite existing skills (user may have modified them)

**Files:**
- Modify: `src/update.js:1-6` (add imports)
- Modify: `src/update.js:113-122` (add install calls before summary)
- Modify: `tests/update.test.js` (add tests)

**Step 1: Write the failing test**

Add to `tests/update.test.js` (add `readdir` to the import):

```js
import { mkdtemp, rm, readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
```

```js
test('update installs new bundled agents not already present', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    // Remove one agent to simulate a user with an older version
    const agentsDir = join(tempDir, 'agents');
    const entries = await readdir(agentsDir);
    const agentFiles = entries.filter((f) => f.endsWith('.agent.md'));
    assert.ok(agentFiles.length > 0, 'Should have agents after init');

    // Delete one agent
    await rm(join(agentsDir, agentFiles[0]), { force: true });
    const countBefore = (await readdir(agentsDir)).filter((f) => f.endsWith('.agent.md')).length;

    await update(tempDir);

    // After update, the deleted agent should be reinstalled
    const countAfter = (await readdir(agentsDir)).filter((f) => f.endsWith('.agent.md')).length;
    assert.ok(countAfter > countBefore, 'Update should install missing agents');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

**Step 2: Run test to verify it fails**

```bash
node --test tests/update.test.js --test-name-pattern "installs new bundled agents"
```

Expected: FAIL — update does not install agents.

**Step 3: Implement agent/skill install in update.js**

Add imports at the top of `src/update.js`:

```js
import { listAvailable as listAvailableAgents, listInstalled as listInstalledAgents, installAgent } from './agents.js';
import { listAvailable as listAvailableSkills, listInstalled as listInstalledSkills, installSkill, getSkillMeta } from './skills.js';
import { t } from './i18n.js';
```

Wait — `t` is already imported from `./i18n.js`. Adjust the imports to:

```js
import { listAvailable as listAvailableAgents, listInstalled as listInstalledAgents, installAgent } from './agents.js';
import { listAvailable as listAvailableSkills, listInstalled as listInstalledSkills, installSkill, getSkillMeta } from './skills.js';
```

Add new agent/skill installation after the IDE templates loop (after line 113, before the summary at line 115):

```js
  // 6b. Install new bundled agents not already present
  const availableAgents = await listAvailableAgents();
  const installedAgents = await listInstalledAgents(targetDir);
  let newAgents = 0;
  for (const id of availableAgents) {
    if (!installedAgents.includes(id)) {
      await installAgent(id, targetDir);
      console.log(`  ${t('createdFile', { path: `agents/${id}.agent.md` })}`);
      newAgents++;
    }
  }

  // 6c. Install new non-MCP skills not already present
  const availableSkills = await listAvailableSkills();
  const installedSkills = await listInstalledSkills(targetDir);
  let newSkills = 0;
  for (const id of availableSkills) {
    if (id === 'opensquad-skill-creator') continue;
    if (installedSkills.includes(id)) continue;
    const meta = await getSkillMeta(id);
    if (!meta) continue;
    if (meta.type === 'mcp' || meta.type === 'hybrid') continue;
    if (meta.env?.length > 0) continue;
    await installSkill(id, targetDir);
    console.log(`  ${t('createdFile', { path: `_opensquad/skills/${id}/SKILL.md` })}`);
    newSkills++;
  }
```

**Step 4: Run test to verify it passes**

```bash
node --test tests/update.test.js --test-name-pattern "installs new bundled agents"
```

Expected: PASS

**Step 5: Write test for preserving existing agents during update**

Add to `tests/update.test.js`:

```js
test('update does not overwrite existing agent files', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    // Modify an agent file to simulate user customization
    const agentPath = join(tempDir, 'agents', 'researcher.agent.md');
    await writeFile(agentPath, 'custom user content', 'utf-8');

    await update(tempDir);

    // User's customized agent should be preserved
    const content = await readFile(agentPath, 'utf-8');
    assert.equal(content, 'custom user content');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

**Step 6: Run test to verify it passes**

```bash
node --test tests/update.test.js --test-name-pattern "does not overwrite existing agent"
```

Expected: PASS (since we only install agents NOT already present).

**Step 7: Run all tests**

```bash
node --test tests/**/*.test.js
```

Expected: all tests pass.

**Step 8: Commit**

```bash
git add src/update.js tests/update.test.js
git commit -m "feat(update): install new bundled agents and non-MCP skills during update"
```

---

### Task 5: Update opensquad-dev skill

Update the opensquad-dev verification skill to check the new init behavior.

**Files:**
- Modify: `.claude/skills/opensquad-dev/SKILL.md`

**Step 1: Add Check H to the skill**

Add a new check section after Check G in `.claude/skills/opensquad-dev/SKILL.md`:

```markdown
#### Check H: Init installs agents and skills (`src/init.js` changed)

1. Read `src/init.js`
2. Verify it imports from `./agents.js`: `listAvailable` and `installAgent`
3. Verify `installAllAgents` function exists and is called in `init()`
4. Verify `installNonMcpSkills` function exists and is called in `init()`
5. If any of these are missing: **FAIL** — "Init does not auto-install agents/skills"
```

Also update the "How Opensquad Distribution Works" section to reflect the new behavior:

Change:
```
- **`agents/`** (project root) → Predefined agent catalog, distributed via npm
  (`package.json files[]`). NOT in templates — users install agents via
  `npx opensquad agents install`. Protected from overwrites in `src/update.js:PROTECTED_PATHS`.

- **`skills/`** (project root) → Bundled skills catalog, distributed via npm
  (`package.json files[]`). Users install via `npx opensquad skills install`.
```

To:
```
- **`agents/`** (project root) → Predefined agent catalog, distributed via npm
  (`package.json files[]`). Auto-installed during `npx opensquad init` and new agents
  added during `npx opensquad update`. Protected from overwrites in
  `src/update.js:PROTECTED_PATHS`. Users can also install manually via
  `npx opensquad agents install`.

- **`skills/`** (project root) → Bundled skills catalog, distributed via npm
  (`package.json files[]`). Non-MCP skills are auto-installed during init.
  MCP skills (type: mcp/hybrid or with env vars) are offered interactively
  during init. Users can also install manually via `npx opensquad skills install`.
```

**Step 2: Commit**

```bash
git add .claude/skills/opensquad-dev/SKILL.md
git commit -m "docs(opensquad-dev): add Check H for agent/skill auto-install verification"
```

---

### Task 6: Final verification — run opensquad-dev skill

After all code changes are committed, run `/opensquad-dev` to verify the distribution is now consistent.

**Step 1: Run all tests**

```bash
node --test tests/**/*.test.js
```

Expected: all tests pass.

**Step 2: Run opensquad-dev manually**

Invoke the `/opensquad-dev` skill. It should now report:

```
✅ All checks passed — distribution is consistent.
```

If any issues remain, fix them before proceeding.

---

## Summary

| # | Task | Files |
|---|------|-------|
| 1 | Sync templates with source | `templates/_opensquad/core/` (sync + delete platforms) |
| 2 | Add agent auto-install to init | `src/init.js`, `tests/init.test.js` |
| 3 | Add non-MCP skill auto-install to init | `src/init.js`, `tests/init.test.js` |
| 4 | Add agent/skill install to update | `src/update.js`, `tests/update.test.js` |
| 5 | Update opensquad-dev skill | `.claude/skills/opensquad-dev/SKILL.md` |
| 6 | Final verification | Run tests + `/opensquad-dev` |

**Total**: 6 tasks, 5 files modified, 14 template files created, 4 template files deleted
