# Eliminate Template Duplication — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove duplicated `core/`, `config/`, and `dashboard/` from `templates/` — have `init.js` and `update.js` copy directly from canonical sources at the package root.

**Architecture:** Add a `copyCanonicalSources(targetDir, { overwrite })` function in `init.js` that iterates a `CANONICAL_SOURCES` map. `init()` calls it with `overwrite: false` (skip existing). `update()` imports and calls it with `overwrite: true` (backup + overwrite). Then delete the three template directories.

**Tech Stack:** Node.js (fs/promises), existing test suite (`node --test`)

---

### Task 1: Add `copyCanonicalSources()` to `init.js`

**Files:**
- Modify: `src/init.js`

- [ ] **Step 1: Add constants after the existing `TEMPLATES_DIR` line**

At `src/init.js:11`, after `const TEMPLATES_DIR = join(__dirname, '..', 'templates');`, add:

```js
const PACKAGE_ROOT = join(__dirname, '..');

const CANONICAL_SOURCES = [
  { src: join(PACKAGE_ROOT, '_opensquad', 'core'), dest: join('_opensquad', 'core') },
  { src: join(PACKAGE_ROOT, '_opensquad', 'config'), dest: join('_opensquad', 'config') },
  { src: join(PACKAGE_ROOT, 'dashboard'), dest: 'dashboard' },
];

const DASHBOARD_EXCLUDES = ['node_modules', 'dist', 'tsconfig.tsbuildinfo', 'squads'];
```

- [ ] **Step 2: Add the `copyCanonicalSources` function**

Add this exported function after `getTemplateEntries()` at the end of `src/init.js`:

```js
export async function copyCanonicalSources(targetDir, { overwrite = false, backupFn = null, protectedFn = null } = {}) {
  let count = 0;

  for (const { src, dest } of CANONICAL_SOURCES) {
    const isDashboard = dest === 'dashboard';
    let entries;
    try {
      entries = await getTemplateEntries(src);
    } catch {
      continue; // source dir doesn't exist (e.g., running from a partial install)
    }

    for (const entry of entries) {
      const relativeToSrc = entry.slice(src.length + 1);
      const normalizedRel = relativeToSrc.replace(/\\/g, '/');

      // Skip dashboard-local artifacts
      if (isDashboard && DASHBOARD_EXCLUDES.some(ex => normalizedRel === ex || normalizedRel.startsWith(ex + '/'))) {
        continue;
      }

      const relativePath = join(dest, relativeToSrc);
      const normalizedPath = relativePath.replace(/\\/g, '/');

      // Skip protected paths (update mode)
      if (protectedFn && protectedFn(normalizedPath)) continue;

      const destPath = join(targetDir, relativePath);
      await mkdir(dirname(destPath), { recursive: true });

      if (!overwrite) {
        // Init mode: skip existing files
        try {
          await stat(destPath);
          continue;
        } catch {
          // does not exist — copy it
        }
        await cp(entry, destPath);
        console.log(`  ${t('createdFile', { path: normalizedPath })}`);
      } else {
        // Update mode: backup then overwrite
        const backed = backupFn ? await backupFn(destPath) : false;
        await cp(entry, destPath);
        if (backed) {
          console.log(`  ${t('updatedFile', { path: normalizedPath })} (backup: ${normalizedPath}.bak)`);
        } else {
          console.log(`  ${t('updatedFile', { path: normalizedPath })}`);
        }
      }
      count++;
    }
  }

  return count;
}
```

- [ ] **Step 3: Call `copyCanonicalSources()` in the `init()` function**

In `src/init.js`, in the `init()` function, add the call after `copyCommonTemplates(targetDir)` (line 70):

```js
  // Copy template files
  await copyCommonTemplates(targetDir);
  await copyCanonicalSources(targetDir);
  await copyIdeTemplates(ides, targetDir);
```

- [ ] **Step 4: Run existing tests to verify nothing breaks**

Run: `node --test tests/init.test.js`
Expected: All tests PASS (the template dirs still exist at this point, so both old and new paths work)

- [ ] **Step 5: Commit**

```bash
git add src/init.js
git commit -m "feat(init): add copyCanonicalSources for core, config, and dashboard"
```

---

### Task 2: Wire `copyCanonicalSources` into `update.js`

**Files:**
- Modify: `src/update.js`

- [ ] **Step 1: Import `copyCanonicalSources` from `init.js`**

In `src/update.js:5`, change:

```js
import { getTemplateEntries, loadSavedLocale } from './init.js';
```

to:

```js
import { getTemplateEntries, loadSavedLocale, copyCanonicalSources } from './init.js';
```

- [ ] **Step 2: Call `copyCanonicalSources` in the update function**

In `src/update.js`, after the IDE-specific templates loop (after line 138, before the `// 6b.` comment), add:

```js
  // 6a. Copy canonical sources (core, config, dashboard)
  count += await copyCanonicalSources(targetDir, {
    overwrite: true,
    backupFn: backupIfExists,
    protectedFn: isProtected,
  });
```

- [ ] **Step 3: Run existing tests to verify nothing breaks**

Run: `node --test tests/update.test.js`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/update.js
git commit -m "feat(update): use copyCanonicalSources for core, config, and dashboard"
```

---

### Task 3: Delete duplicated template directories

**Files:**
- Delete: `templates/_opensquad/core/` (entire directory)
- Delete: `templates/_opensquad/config/` (entire directory)
- Delete: `templates/dashboard/` (entire directory)

- [ ] **Step 1: Delete the three directories**

```bash
rm -rf templates/_opensquad/core/
rm -rf templates/_opensquad/config/
rm -rf templates/dashboard/
```

- [ ] **Step 2: Run ALL tests to confirm everything works from canonical sources**

Run: `node --test tests/init.test.js tests/update.test.js`
Expected: All tests PASS — `init` copies core/config from `_opensquad/` and dashboard from `dashboard/`; `update` does the same with backup/overwrite semantics.

- [ ] **Step 3: Verify key files end up in the right place**

Quick manual sanity check — run init on a temp dir and verify:

```bash
node -e "
import { init } from './src/init.js';
import { mkdtemp, stat, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const tmp = await mkdtemp(join(tmpdir(), 'osq-verify-'));
await init(tmp, { _skipPrompts: true });
await stat(join(tmp, '_opensquad', 'core', 'architect.agent.yaml'));
await stat(join(tmp, '_opensquad', 'config', 'playwright.config.json'));
await stat(join(tmp, 'dashboard', 'package.json'));
await stat(join(tmp, 'dashboard', 'src', 'App.tsx'));
console.log('All canonical files copied correctly');
await rm(tmp, { recursive: true, force: true });
"
```

Expected: `All canonical files copied correctly`

- [ ] **Step 4: Commit the deletions**

```bash
git add -A templates/_opensquad/core/ templates/_opensquad/config/ templates/dashboard/
git commit -m "chore: remove duplicated core, config, and dashboard from templates

These are now copied from canonical sources (_opensquad/core, _opensquad/config, dashboard/) by init.js and update.js."
```

---

### Task 4: Verify dashboard exclusions work

**Files:**
- Test: `tests/init.test.js` (add one test)

- [ ] **Step 1: Write a test that verifies dashboard node_modules/dist are NOT copied**

Add to `tests/init.test.js`:

```js
test('init does not copy dashboard node_modules or dist to user project', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    await assert.rejects(
      stat(join(tempDir, 'dashboard', 'node_modules')),
      { code: 'ENOENT' }
    );
    await assert.rejects(
      stat(join(tempDir, 'dashboard', 'dist')),
      { code: 'ENOENT' }
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run the test**

Run: `node --test tests/init.test.js`
Expected: All tests PASS including the new one

- [ ] **Step 3: Commit**

```bash
git add tests/init.test.js
git commit -m "test: verify dashboard exclusions in init"
```
