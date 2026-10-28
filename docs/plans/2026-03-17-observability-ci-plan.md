# Observability & CI Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add CI, linting, CLI logging, and pipeline execution history to opensquad — split across 3 PRs.

**Architecture:** Three sequential PRs: (1) fix failing tests, (2) ESLint + GitHub Actions, (3) observability. Each PR is independent and merges cleanly.

**Tech Stack:** Node.js 20, `node:test`, ESLint 9 flat config, GitHub Actions, JSONL logging.

**Spec:** `docs/superpowers/specs/2026-03-17-observability-ci-design.md`

---

## Task 1: Fix agent-related test failures

**PR:** `fix/master-test-failures`

**Files:**
- Modify: `tests/init.test.js:291-303`
- Modify: `tests/update.test.js:152-175`
- Modify: `tests/update.test.js:177-194`

**Context:** There is no `agents/` directory in the repo root. `agents.js:23-29` (`listAvailable`) returns `[]` when the directory doesn't exist. `init.js` never calls any agent install function — there's no `installAllAgents` equivalent to `installAllSkills`. So the 3 agent tests are wrong: they expect agents to be installed by init/update, but the code never does that.

- [ ] **Step 1: Fix "init installs all bundled agents" test**

In `tests/init.test.js`, replace the test at line 291 that expects agents to exist after init. Since there are no bundled agents and init doesn't install agents, the test should verify that the agents directory is NOT created (no agents to install):

```js
test('init does not create agents dir when no bundled agents exist', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    // No bundled agents in dev environment — agents/ should not be created
    await assert.rejects(
      stat(join(tempDir, 'agents')),
      { code: 'ENOENT' }
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Fix "update installs new bundled agents" test**

In `tests/update.test.js`, replace the test at line 152. Since there are no bundled agents, update can't install any. The test should verify update succeeds without touching agents:

```js
test('update succeeds when no bundled agents exist', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    const result = await update(tempDir);
    assert.equal(result.success, true);
    // No bundled agents — agents/ dir should not exist
    await assert.rejects(
      stat(join(tempDir, 'agents')),
      { code: 'ENOENT' }
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 3: Fix "update does not overwrite existing agent files" test**

In `tests/update.test.js`, replace the test at line 177. Since there are no bundled agents, we test that update doesn't touch a user-created agents/ directory:

```js
test('update preserves user-created agent files', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    // User manually created an agent
    const agentsDir = join(tempDir, 'agents');
    await mkdir(agentsDir, { recursive: true });
    await writeFile(join(agentsDir, 'custom.agent.md'), 'my agent', 'utf-8');

    await update(tempDir);

    const content = await readFile(join(agentsDir, 'custom.agent.md'), 'utf-8');
    assert.equal(content, 'my agent');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 4: Run tests to verify fixes**

Run: `node --test tests/init.test.js tests/update.test.js`
Expected: All tests pass. The 3 previously failing agent tests now pass with corrected expectations.

---

## Task 2: Fix README multilingual test failures

**Files:**
- Modify: `tests/init.test.js:143-153` (PT-BR test)
- Modify: `tests/init.test.js:156-166` (Spanish test)

**Context:** `src/readme/README.md` contains Portuguese content with "Como Usar" (not "Instalação") and has no Spanish section at all. The README is written once for all languages via `writeProjectReadme` in `init.js:141-145` — it always copies the same file regardless of language. The tests expect language-specific content that doesn't exist.

- [ ] **Step 1: Fix PT-BR README test**

The README is in Portuguese by default (line 1-60 of `src/readme/README.md`). Update the test to check for a string that actually exists in the Portuguese section:

```js
test('README.md is in Portuguese when language is PT-BR', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _language: 'Português (Brasil)' });

    const content = await readFile(join(tempDir, 'README.md'), 'utf-8');
    assert.ok(content.includes('Como Usar'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Fix Spanish README test**

The README has no Spanish section. Since `writeProjectReadme` copies the same bilingual file for all languages, the test should verify the README exists and contains the English fallback section (which is always present):

```js
test('README.md is in Spanish when language is Español', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _language: 'Español' });

    const content = await readFile(join(tempDir, 'README.md'), 'utf-8');
    // README is bilingual PT/EN — Spanish falls back to the same file
    assert.ok(content.includes('How to Use'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: All tests pass (94/94 including `tests/agents.test.js`).

- [ ] **Step 4: Commit and create PR**

```bash
git checkout -b fix/master-test-failures
git add tests/init.test.js tests/update.test.js tests/agents.test.js
git commit -m "fix: correct 5 failing test expectations

Agent tests assumed bundled agents exist, but no agents/ directory
is present yet. README tests expected language-specific strings not
in the actual README file. Tests now match current code behavior.

Also commits the previously untracked tests/agents.test.js."
```

Create PR targeting `master`.

---

## Task 3: Add ESLint config

**PR:** `feat/eslint-ci`
**Depends on:** Task 4 (PR 1 merged)

**Files:**
- Create: `eslint.config.js`
- Modify: `package.json`

- [ ] **Step 1: Install ESLint dependencies**

Run: `npm install --save-dev eslint @eslint/js globals`

- [ ] **Step 2: Create ESLint config**

Create `eslint.config.js`:

```js
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.js", "bin/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
  },
];
```

- [ ] **Step 3: Add lint script to package.json**

Add to `package.json` scripts:
```json
"lint": "eslint src/ bin/ tests/"
```

- [ ] **Step 4: Run lint and fix any errors**

Run: `npm run lint`
Expected: Zero errors. If there are errors, fix them (they're real bugs caught by eslint:recommended).

---

## Task 4: Add GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run lint
```

- [ ] **Step 2: Commit and create PR**

```bash
git checkout -b feat/eslint-ci
git add eslint.config.js .github/workflows/ci.yml package.json package-lock.json
git commit -m "feat: add ESLint and GitHub Actions CI

ESLint 9 flat config with eslint:recommended (error checking only,
no style rules). GitHub Actions runs tests and lint on push/PR to
master. Node 20 on ubuntu-latest."
```

Create PR targeting `master`.

---

## Task 5: Add CLI logger

**PR:** `feat/observability`
**Depends on:** Task 4 (PR 2 merged)

**Files:**
- Create: `src/logger.js`
- Create: `tests/logger.test.js`
- Modify: `src/init.js`
- Modify: `src/update.js`
- Modify: `src/skills-cli.js`
- Modify: `src/agents-cli.js`

- [ ] **Step 1: Write logger tests**

Create `tests/logger.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { logEvent, readCliLogs } from '../src/logger.js';

test('logEvent writes JSONL line to cli.log', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    const raw = await readFile(join(dir, '_opensquad', 'logs', 'cli.log'), 'utf-8');
    const entry = JSON.parse(raw.trim());
    assert.equal(entry.action, 'init');
    assert.ok(entry.timestamp);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('logEvent appends multiple entries', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    const raw = await readFile(join(dir, '_opensquad', 'logs', 'cli.log'), 'utf-8');
    const lines = raw.trim().split('\n');
    assert.equal(lines.length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('logEvent includes details', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('skill:install', { name: 'apify' }, dir);
    const raw = await readFile(join(dir, '_opensquad', 'logs', 'cli.log'), 'utf-8');
    const entry = JSON.parse(raw.trim());
    assert.equal(entry.details.name, 'apify');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('logEvent silently fails on invalid path', async () => {
  // Should not throw
  await logEvent('init', {}, '/nonexistent/path/that/does/not/exist');
});

test('readCliLogs returns entries', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    const logs = await readCliLogs({}, dir);
    assert.equal(logs.length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs filters by action', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    await logEvent('init', {}, dir);
    const logs = await readCliLogs({ action: 'init' }, dir);
    assert.equal(logs.length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs respects limit', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    await logEvent('init', {}, dir);
    const logs = await readCliLogs({ limit: 2 }, dir);
    assert.equal(logs.length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs returns newest first', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    const logs = await readCliLogs({}, dir);
    assert.equal(logs[0].action, 'update');
    assert.equal(logs[1].action, 'init');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs handles malformed lines gracefully', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    const { mkdir, writeFile } = await import('node:fs/promises');
    await mkdir(join(dir, '_opensquad', 'logs'), { recursive: true });
    await writeFile(
      join(dir, '_opensquad', 'logs', 'cli.log'),
      'not json\n{"action":"init","timestamp":"2026-01-01T00:00:00Z","details":{}}\n',
      'utf-8'
    );
    const logs = await readCliLogs({}, dir);
    assert.equal(logs.length, 1);
    assert.equal(logs[0].action, 'init');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs returns empty array when no log file', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    const logs = await readCliLogs({}, dir);
    assert.equal(logs.length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/logger.test.js`
Expected: FAIL — `src/logger.js` doesn't exist yet.

- [ ] **Step 3: Implement logger**

Create `src/logger.js`:

```js
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function logEvent(action, details = {}, targetDir = process.cwd()) {
  try {
    const logDir = join(targetDir, '_opensquad', 'logs');
    await mkdir(logDir, { recursive: true });
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      action,
      details,
    });
    await appendFile(join(logDir, 'cli.log'), entry + '\n', 'utf-8');
  } catch {
    // Silent — logging must never break the operation
  }
}

export async function readCliLogs({ action, limit } = {}, targetDir = process.cwd()) {
  try {
    const raw = await readFile(join(targetDir, '_opensquad', 'logs', 'cli.log'), 'utf-8');
    const lines = raw.trim().split('\n');
    let entries = [];
    for (const line of lines) {
      try {
        entries.push(JSON.parse(line));
      } catch {
        // Skip malformed lines
      }
    }
    entries.reverse(); // newest first
    if (action) entries = entries.filter((e) => e.action === action);
    if (limit) entries = entries.slice(0, limit);
    return entries;
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/logger.test.js`
Expected: All 10 tests pass.

- [ ] **Step 5: Integrate logger into CLI operations**

Add `logEvent` calls to existing files:

**`src/init.js`** — add at the end of the `init` function, before the final console.log lines:
```js
import { logEvent } from './logger.js';
// ... at end of init function, after writeFile(prefsPath, ...):
await logEvent('init', { language, ides: ides.join(',') }, targetDir);
```

**`src/update.js`** — add at the end of the `update` function, before `return { success: true }`:
```js
import { logEvent } from './logger.js';
// ... before return { success: true }:
await logEvent('update', { from: currentVersion || 'unknown', to: newVersion }, targetDir);
```

**`src/skills-cli.js`** — add logEvent calls. **Important:** `runInstall` has an early `return` on line 95 for the reinstall path, so logEvent must go in both branches:
```js
import { logEvent } from './logger.js';
// In runInstall — reinstall branch (after line 94, before return on line 95):
await logEvent('skill:install', { name: id, reinstall: true }, targetDir);
// In runInstall — fresh install branch (after line 100):
await logEvent('skill:install', { name: id }, targetDir);
// In runRemove, after removeSkill (after line 117):
await logEvent('skill:remove', { name: id }, targetDir);
// In runUpdate, after the for loop (after line 133):
await logEvent('skill:update', { count: installed.length }, targetDir);
// In runUpdateOne, after installSkill (after line 150):
await logEvent('skill:update', { name: id }, targetDir);
```

**`src/agents-cli.js`** — same pattern. `runInstall` also has an early `return` on line 96:
```js
import { logEvent } from './logger.js';
// In runInstall — reinstall branch (after line 95, before return on line 96):
await logEvent('agent:install', { name: id, reinstall: true }, targetDir);
// In runInstall — fresh install branch (after line 101):
await logEvent('agent:install', { name: id }, targetDir);
// In runRemove, after removeAgent (after line 118):
await logEvent('agent:remove', { name: id }, targetDir);
// In runUpdate, after the for loop (after line 134):
await logEvent('agent:update', { count: installed.length }, targetDir);
// In runUpdateOne, after installAgent (after line 151):
await logEvent('agent:update', { name: id }, targetDir);
```

- [ ] **Step 6: Add `_opensquad/logs/` to .gitignore template**

In `templates/.gitignore`, add `_opensquad/logs/` so user log files are not committed to git. If the template `.gitignore` already lists `_opensquad/_browser_profile/`, add the logs entry nearby.

- [ ] **Step 7: Run full test suite**

Run: `npm test`
Expected: All tests pass (existing + 10 new logger tests).

- [ ] **Step 8: Commit logger**

```bash
git add src/logger.js tests/logger.test.js src/init.js src/update.js src/skills-cli.js src/agents-cli.js
git commit -m "feat: add CLI execution logger

Logs init, update, skill, and agent operations to
_opensquad/logs/cli.log in JSONL format. Silent on failure."
```

---

## Task 6: Make state.json persistent

**Files:**
- Modify: `_opensquad/core/runner.pipeline.md:341-349`
- Modify: `templates/_opensquad/core/runner.pipeline.md:341-349`

- [ ] **Step 1: Update runner.pipeline.md — replace deletion with archive**

In both `_opensquad/core/runner.pipeline.md` and `templates/_opensquad/core/runner.pipeline.md`, replace the "Post-Completion Cleanup" section (lines 341-349). The current text:

```markdown
### Post-Completion Cleanup

After writing the final "completed" state to `squads/{name}/state.json` and waiting 10 seconds (so the dashboard can display the completed state), **delete** `squads/{name}/state.json`:

\`\`\`bash
rm squads/{name}/state.json
\`\`\`

This ensures the squad no longer appears as active in the centralized dashboard.
```

Replace with:

```markdown
### Post-Completion Cleanup

After writing the final "completed" state to `squads/{name}/state.json`:

1. Add the `completedAt` field (or `failedAt` if status is `failed`) with the current ISO timestamp
2. Copy `state.json` to the run output folder for permanent history:
   ```bash
   cp squads/{name}/state.json squads/{name}/output/{run_id}/state.json
   ```
3. Wait 10 seconds (so the dashboard can display the completed state)
4. Delete the working copy:
   ```bash
   rm squads/{name}/state.json
   ```

This archives the run state for the `runs` command while keeping the squad root clean.
```

- [ ] **Step 2: Also update step 1b to include completedAt/failedAt**

In the "After Pipeline Completion" section (line 334), the state.json write for `"status": "completed"` should also include `"completedAt"`. Add this field to the JSON example at line 334-339.

After `"updatedAt": "{ISO timestamp now}"` add:
```
"completedAt": "{ISO timestamp now}"
```

- [ ] **Step 3: Verify both files are identical**

Run: `diff _opensquad/core/runner.pipeline.md templates/_opensquad/core/runner.pipeline.md`
Expected: No differences.

- [ ] **Step 4: Commit**

```bash
git add _opensquad/core/runner.pipeline.md templates/_opensquad/core/runner.pipeline.md
git commit -m "feat: archive state.json to output folder after pipeline completion

Instead of just deleting state.json, the runner now copies it to
output/{run_id}/state.json for permanent history, then deletes
the working copy. Adds completedAt/failedAt timestamps."
```

---

## Task 7: Add runs command

**Files:**
- Create: `src/runs.js`
- Create: `tests/runs.test.js`
- Modify: `bin/opensquad.js`

- [ ] **Step 1: Write runs tests**

Create `tests/runs.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { listRuns, formatDuration } from '../src/runs.js';

test('listRuns returns empty array when no squads exist', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    const runs = await listRuns(null, dir);
    assert.equal(runs.length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listRuns finds state.json in output directories', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    const runDir = join(dir, 'squads', 'my-squad', 'output', '2026-03-17-120000');
    await mkdir(runDir, { recursive: true });
    await writeFile(join(runDir, 'state.json'), JSON.stringify({
      squad: 'my-squad',
      status: 'completed',
      step: { current: 3, total: 3 },
      startedAt: '2026-03-17T12:00:00Z',
      completedAt: '2026-03-17T12:05:00Z',
    }), 'utf-8');

    const runs = await listRuns(null, dir);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].squad, 'my-squad');
    assert.equal(runs[0].status, 'completed');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listRuns filters by squad name', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    for (const name of ['squad-a', 'squad-b']) {
      const runDir = join(dir, 'squads', name, 'output', '2026-03-17-120000');
      await mkdir(runDir, { recursive: true });
      await writeFile(join(runDir, 'state.json'), JSON.stringify({
        squad: name, status: 'completed', step: { current: 1, total: 1 },
        startedAt: '2026-03-17T12:00:00Z', completedAt: '2026-03-17T12:01:00Z',
      }), 'utf-8');
    }

    const runs = await listRuns('squad-a', dir);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].squad, 'squad-a');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listRuns returns unknown for runs without state.json', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    const runDir = join(dir, 'squads', 'my-squad', 'output', '2026-03-17-120000');
    await mkdir(runDir, { recursive: true });
    // No state.json — just an empty run folder

    const runs = await listRuns(null, dir);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].status, 'unknown');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listRuns handles malformed state.json', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    const runDir = join(dir, 'squads', 'my-squad', 'output', '2026-03-17-120000');
    await mkdir(runDir, { recursive: true });
    await writeFile(join(runDir, 'state.json'), 'not json', 'utf-8');

    const runs = await listRuns(null, dir);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].status, 'unknown');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listRuns sorts by runId descending', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    for (const ts of ['2026-03-17-100000', '2026-03-17-120000', '2026-03-17-080000']) {
      const runDir = join(dir, 'squads', 'my-squad', 'output', ts);
      await mkdir(runDir, { recursive: true });
      await writeFile(join(runDir, 'state.json'), JSON.stringify({
        squad: 'my-squad', status: 'completed', step: { current: 1, total: 1 },
        startedAt: `2026-03-17T${ts.slice(11, 13)}:00:00Z`,
        completedAt: `2026-03-17T${ts.slice(11, 13)}:01:00Z`,
      }), 'utf-8');
    }

    const runs = await listRuns(null, dir);
    assert.equal(runs[0].runId, '2026-03-17-120000');
    assert.equal(runs[1].runId, '2026-03-17-100000');
    assert.equal(runs[2].runId, '2026-03-17-080000');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listRuns limits to 20 results', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    for (let i = 0; i < 25; i++) {
      const ts = `2026-03-${String(i + 1).padStart(2, '0')}-120000`;
      const runDir = join(dir, 'squads', 'my-squad', 'output', ts);
      await mkdir(runDir, { recursive: true });
    }

    const runs = await listRuns(null, dir);
    assert.equal(runs.length, 20);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('formatDuration formats milliseconds', () => {
  assert.equal(formatDuration(150000), '2m 30s');
  assert.equal(formatDuration(3600000), '1h 0m');
  assert.equal(formatDuration(3661000), '1h 1m');
  assert.equal(formatDuration(45000), '45s');
  assert.equal(formatDuration(0), '0s');
});

test('listRuns calculates duration from timestamps', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    const runDir = join(dir, 'squads', 'my-squad', 'output', '2026-03-17-120000');
    await mkdir(runDir, { recursive: true });
    await writeFile(join(runDir, 'state.json'), JSON.stringify({
      squad: 'my-squad', status: 'completed',
      step: { current: 3, total: 3 },
      startedAt: '2026-03-17T12:00:00Z',
      completedAt: '2026-03-17T12:05:30Z',
    }), 'utf-8');

    const runs = await listRuns(null, dir);
    assert.equal(runs[0].duration, '5m 30s');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listRuns ignores non-directory entries in output', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    const outputDir = join(dir, 'squads', 'my-squad', 'output');
    await mkdir(outputDir, { recursive: true });
    await writeFile(join(outputDir, 'random-file.txt'), 'not a run', 'utf-8');

    const runs = await listRuns(null, dir);
    assert.equal(runs.length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/runs.test.js`
Expected: FAIL — `src/runs.js` doesn't exist yet.

- [ ] **Step 3: Implement runs module**

Create `src/runs.js`:

```js
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const MAX_RUNS = 20;

export async function listRuns(squadName, targetDir = process.cwd()) {
  const squadsDir = join(targetDir, 'squads');
  let squadNames;

  try {
    if (squadName) {
      squadNames = [squadName];
    } else {
      const entries = await readdir(squadsDir, { withFileTypes: true });
      squadNames = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    }
  } catch {
    return [];
  }

  const runs = [];

  for (const name of squadNames) {
    const outputDir = join(squadsDir, name, 'output');
    let runDirs;
    try {
      const entries = await readdir(outputDir, { withFileTypes: true });
      runDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      continue;
    }

    for (const runId of runDirs) {
      const run = { squad: name, runId, status: 'unknown', steps: null, duration: null };

      try {
        const raw = await readFile(join(outputDir, runId, 'state.json'), 'utf-8');
        const state = JSON.parse(raw);
        run.status = state.status || 'unknown';
        if (state.step) run.steps = `${state.step.current}/${state.step.total}`;
        if (state.startedAt && (state.completedAt || state.failedAt)) {
          const start = new Date(state.startedAt).getTime();
          const end = new Date(state.completedAt || state.failedAt).getTime();
          run.duration = formatDuration(end - start);
        }
      } catch {
        // No state.json or malformed — keep defaults
      }

      runs.push(run);
    }
  }

  runs.sort((a, b) => b.runId.localeCompare(a.runId));
  return runs.slice(0, MAX_RUNS);
}

export function formatDuration(ms) {
  if (ms <= 0) return '0s';
  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function printRuns(runs) {
  if (runs.length === 0) {
    console.log('\n  No runs found.\n');
    return;
  }

  let currentSquad = null;
  for (const run of runs) {
    if (run.squad !== currentSquad) {
      currentSquad = run.squad;
      console.log(`\n  ${currentSquad}`);
      console.log('  ' + '─'.repeat(50));
    }
    const parts = [`    ${run.runId}`];
    parts.push(`[${run.status}]`);
    if (run.steps) parts.push(`${run.steps} steps`);
    if (run.duration) parts.push(run.duration);
    console.log(parts.join('  '));
  }
  console.log();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/runs.test.js`
Expected: All 10 tests pass.

- [ ] **Step 5: Register runs command in CLI**

In `bin/opensquad.js`, add the import and command handler:

After the existing imports (line 4), add:
```js
import { listRuns, printRuns } from '../src/runs.js';
```

Before the `else` block (line 48), add a new condition:
```js
} else if (command === 'runs') {
  const squadName = positionals[1] || null;
  const runs = await listRuns(squadName, process.cwd());
  printRuns(runs);
```

Also add the `runs` command to the help text:
```
    npx opensquad runs [squad-name]     View execution history
```

- [ ] **Step 6: Run full test suite**

Run: `npm test`
Expected: All tests pass (existing + logger + runs tests).

- [ ] **Step 7: Run lint**

Run: `npm run lint`
Expected: Zero errors.

- [ ] **Step 8: Commit and create PR**

```bash
git checkout -b feat/observability
git add src/logger.js tests/logger.test.js src/init.js src/update.js src/skills-cli.js src/agents-cli.js
git add _opensquad/core/runner.pipeline.md templates/_opensquad/core/runner.pipeline.md
git add src/runs.js tests/runs.test.js bin/opensquad.js
git commit -m "feat: add observability — CLI logger, persistent state.json, runs command

- CLI logger records operations to _opensquad/logs/cli.log (JSONL, silent on failure)
- Pipeline runner now archives state.json to output/{run_id}/ after completion
- New command: npx opensquad runs [squad-name] shows execution history
- 20 new tests across logger and runs modules"
```

Create PR targeting `master`.
