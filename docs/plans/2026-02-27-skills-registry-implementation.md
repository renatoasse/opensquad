# Skills Registry Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an on-demand skills distribution system so users can browse and install Opensquad skills from the central GitHub repository, both via CLI and from within `/opensquad`.

**Architecture:** A `skills/` folder in the opensquad repo hosts skill files and a `manifest.json` registry. A new `src/skills.js` module handles fetch/install/remove using Node.js native `fetch`. The CLI gains `skills list|install|remove|update` subcommands. The `SKILL.md` gains a `/opensquad skills` command route and browser flow.

**Tech Stack:** Node.js 20+ (native fetch, fs/promises), `raw.githubusercontent.com` for CDN delivery, `node:test` + `node:assert` for tests.

---

## Task 1: Create the skills registry folder and manifest

**Files:**
- Create: `skills/manifest.json`
- Create: `skills/README.md`

**Step 1: Create `skills/manifest.json`**

```json
{
  "version": "1",
  "skills": []
}
```

> The array is empty for now — skills will be added in Task 6.

**Step 2: Create `skills/README.md`**

```markdown
# Opensquad Skills Registry

This folder contains all available Opensquad skills distributed via `npx opensquad skills install`.

## Structure

Each skill lives in its own folder:

```
skills/
  manifest.json        ← registry index (update when adding a skill)
  <skill-id>/
    SKILL.md           ← the Claude Code skill file
```

## Adding a skill

1. Create `skills/<id>/SKILL.md` with standard Claude Code skill frontmatter
2. Add the skill entry to `manifest.json`
3. Commit both files
```

**Step 3: Commit**

```bash
git add skills/
git commit -m "feat: add skills registry folder and empty manifest"
```

---

## Task 2: Write failing tests for `src/skills.js`

**Files:**
- Create: `tests/skills.test.js`

**Step 1: Write the test file**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  fetchManifest,
  listInstalled,
  installSkill,
  removeSkill,
} from '../src/skills.js';

// Fake fetcher — simulates successful manifest response
function makeFetcher(responses) {
  return async (url) => {
    const body = responses[url];
    if (body === undefined) throw new Error(`Unexpected URL: ${url}`);
    return {
      ok: true,
      status: 200,
      json: async () => JSON.parse(body),
      text: async () => body,
    };
  };
}

function makeFailingFetcher(status = 503) {
  return async () => ({ ok: false, status, json: async () => ({}), text: async () => '' });
}

const MANIFEST_URL = 'https://raw.githubusercontent.com/opensquad-ai/opensquad/main/skills/manifest.json';
const SKILL_URL_BASE = 'https://raw.githubusercontent.com/opensquad-ai/opensquad/main/skills';

const SAMPLE_MANIFEST = JSON.stringify({
  version: '1',
  skills: [
    { id: 'seo-optimizer', name: 'SEO Optimizer', description: 'Optimize content for SEO', category: 'marketing', version: '1.0.0' },
  ],
});

const SAMPLE_SKILL_MD = `---\nname: seo-optimizer\ndescription: SEO Optimizer\n---\n# SEO Optimizer\n`;

// --- fetchManifest ---

test('fetchManifest returns parsed manifest', async () => {
  const fetcher = makeFetcher({ [MANIFEST_URL]: SAMPLE_MANIFEST });
  const manifest = await fetchManifest(fetcher);
  assert.equal(manifest.version, '1');
  assert.equal(manifest.skills.length, 1);
  assert.equal(manifest.skills[0].id, 'seo-optimizer');
});

test('fetchManifest throws on network error', async () => {
  const fetcher = makeFailingFetcher(503);
  await assert.rejects(() => fetchManifest(fetcher), /registry/);
});

// --- listInstalled ---

test('listInstalled returns empty array when .claude/skills/ does not exist', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const result = await listInstalled(dir);
    assert.deepEqual(result, []);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('listInstalled excludes the built-in opensquad skill', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const skillsDir = join(dir, '.claude', 'skills');
    await mkdir(join(skillsDir, 'opensquad'), { recursive: true });
    await mkdir(join(skillsDir, 'seo-optimizer'), { recursive: true });
    const result = await listInstalled(dir);
    assert.deepEqual(result, ['seo-optimizer']);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('listInstalled returns installed skill ids', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const skillsDir = join(dir, '.claude', 'skills');
    await mkdir(join(skillsDir, 'seo-optimizer'), { recursive: true });
    await mkdir(join(skillsDir, 'email-marketing'), { recursive: true });
    const result = await listInstalled(dir);
    assert.ok(result.includes('seo-optimizer'));
    assert.ok(result.includes('email-marketing'));
    assert.equal(result.length, 2);
  } finally {
    await rm(dir, { recursive: true });
  }
});

// --- installSkill ---

test('installSkill writes SKILL.md to .claude/skills/<id>/', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const fetcher = makeFetcher({ [`${SKILL_URL_BASE}/seo-optimizer/SKILL.md`]: SAMPLE_SKILL_MD });
    await installSkill('seo-optimizer', dir, fetcher);
    const content = await readFile(join(dir, '.claude', 'skills', 'seo-optimizer', 'SKILL.md'), 'utf-8');
    assert.equal(content, SAMPLE_SKILL_MD);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('installSkill creates .claude/skills/ directory if missing', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const fetcher = makeFetcher({ [`${SKILL_URL_BASE}/seo-optimizer/SKILL.md`]: SAMPLE_SKILL_MD });
    // No .claude/skills/ pre-created
    await installSkill('seo-optimizer', dir, fetcher);
    const content = await readFile(join(dir, '.claude', 'skills', 'seo-optimizer', 'SKILL.md'), 'utf-8');
    assert.ok(content.length > 0);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('installSkill throws when skill not found in registry', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const fetcher = makeFailingFetcher(404);
    await assert.rejects(
      () => installSkill('nonexistent', dir, fetcher),
      /not found/
    );
  } finally {
    await rm(dir, { recursive: true });
  }
});

// --- removeSkill ---

test('removeSkill deletes the skill directory', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const skillDir = join(dir, '.claude', 'skills', 'seo-optimizer');
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, 'SKILL.md'), SAMPLE_SKILL_MD);
    await removeSkill('seo-optimizer', dir);
    await assert.rejects(
      () => readFile(join(skillDir, 'SKILL.md'), 'utf-8'),
      { code: 'ENOENT' }
    );
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('removeSkill does not throw when skill not installed', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await assert.doesNotReject(() => removeSkill('nonexistent', dir));
  } finally {
    await rm(dir, { recursive: true });
  }
});
```

**Step 2: Run tests to confirm they fail**

```bash
node --test tests/skills.test.js
```

Expected: `ERR_MODULE_NOT_FOUND` — `src/skills.js` does not exist yet.

**Step 3: Commit the tests**

```bash
git add tests/skills.test.js
git commit -m "test: add failing tests for skills registry module"
```

---

## Task 3: Implement `src/skills.js`

**Files:**
- Create: `src/skills.js`

**Step 1: Write the implementation**

```js
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const REGISTRY_BASE = 'https://raw.githubusercontent.com/opensquad-ai/opensquad/main';
const MANIFEST_URL = `${REGISTRY_BASE}/skills/manifest.json`;

export async function fetchManifest(fetcher = fetch) {
  const res = await fetcher(MANIFEST_URL);
  if (!res.ok) throw new Error(`Could not reach skills registry (${res.status})`);
  return res.json();
}

export async function listInstalled(targetDir) {
  try {
    const skillsDir = join(targetDir, '.claude', 'skills');
    const entries = await readdir(skillsDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && e.name !== 'opensquad')
      .map((e) => e.name);
  } catch {
    return [];
  }
}

export async function installSkill(id, targetDir, fetcher = fetch) {
  const url = `${REGISTRY_BASE}/skills/${id}/SKILL.md`;
  const res = await fetcher(url);
  if (!res.ok) throw new Error(`Skill '${id}' not found in registry (${res.status})`);
  const content = await res.text();
  const destDir = join(targetDir, '.claude', 'skills', id);
  await mkdir(destDir, { recursive: true });
  await writeFile(join(destDir, 'SKILL.md'), content, 'utf-8');
}

export async function removeSkill(id, targetDir) {
  const skillDir = join(targetDir, '.claude', 'skills', id);
  await rm(skillDir, { recursive: true, force: true });
}
```

**Step 2: Run tests to confirm they pass**

```bash
node --test tests/skills.test.js
```

Expected: all 9 tests PASS.

**Step 3: Run full test suite to confirm no regressions**

```bash
npm test
```

Expected: all tests PASS.

**Step 4: Commit**

```bash
git add src/skills.js
git commit -m "feat: add skills registry module (fetch/install/remove)"
```

---

## Task 4: Add i18n strings for skills CLI output

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/pt-BR.json`
- Modify: `src/locales/es.json`

**Step 1: Add keys to `src/locales/en.json`**

Add these keys to the JSON (before the closing `}`):

```json
  "skillsNotInitialized": "No Opensquad installation found. Run 'init' first.",
  "skillsFetching": "Fetching skills registry...",
  "skillsInstalledHeader": "Installed:",
  "skillsAvailableHeader": "Available:",
  "skillsNoneInstalled": "No skills installed yet.",
  "skillsNoneAvailable": "No skills available in registry.",
  "skillsInstallHint": "Install with: opensquad skills install <id>",
  "skillsInstalling": "Installing {id}...",
  "skillsInstalled": "✅ Installed: {id}",
  "skillsAlreadyInstalled": "⚠️  {id} is already installed. Reinstall? (y/n) ",
  "skillsReinstalled": "✅ Reinstalled: {id}",
  "skillsRemoving": "Removing {id}...",
  "skillsRemoved": "✅ Removed: {id}",
  "skillsNotInstalled": "⚠️  {id} is not installed.",
  "skillsUpdating": "Updating all installed skills...",
  "skillsUpdateDone": "✅ Updated {count} skill(s).",
  "skillsUpdateNone": "No skills installed to update.",
  "skillsError": "❌ Error: {message}",
  "skillsUnknownCommand": "Unknown skills command: {cmd}\n  Usage: opensquad skills list|install|remove|update"
```

**Step 2: Add keys to `src/locales/pt-BR.json`**

```json
  "skillsNotInitialized": "Instalação Opensquad não encontrada. Execute 'init' primeiro.",
  "skillsFetching": "Buscando registro de skills...",
  "skillsInstalledHeader": "Instaladas:",
  "skillsAvailableHeader": "Disponíveis:",
  "skillsNoneInstalled": "Nenhuma skill instalada ainda.",
  "skillsNoneAvailable": "Nenhuma skill disponível no registro.",
  "skillsInstallHint": "Instale com: opensquad skills install <id>",
  "skillsInstalling": "Instalando {id}...",
  "skillsInstalled": "✅ Instalada: {id}",
  "skillsAlreadyInstalled": "⚠️  {id} já está instalada. Reinstalar? (s/n) ",
  "skillsReinstalled": "✅ Reinstalada: {id}",
  "skillsRemoving": "Removendo {id}...",
  "skillsRemoved": "✅ Removida: {id}",
  "skillsNotInstalled": "⚠️  {id} não está instalada.",
  "skillsUpdating": "Atualizando todas as skills instaladas...",
  "skillsUpdateDone": "✅ {count} skill(s) atualizada(s).",
  "skillsUpdateNone": "Nenhuma skill instalada para atualizar.",
  "skillsError": "❌ Erro: {message}",
  "skillsUnknownCommand": "Comando desconhecido: {cmd}\n  Uso: opensquad skills list|install|remove|update"
```

**Step 3: Add keys to `src/locales/es.json`**

```json
  "skillsNotInitialized": "Instalación de Opensquad no encontrada. Ejecuta 'init' primero.",
  "skillsFetching": "Obteniendo registro de skills...",
  "skillsInstalledHeader": "Instaladas:",
  "skillsAvailableHeader": "Disponibles:",
  "skillsNoneInstalled": "No hay skills instaladas todavía.",
  "skillsNoneAvailable": "No hay skills disponibles en el registro.",
  "skillsInstallHint": "Instala con: opensquad skills install <id>",
  "skillsInstalling": "Instalando {id}...",
  "skillsInstalled": "✅ Instalada: {id}",
  "skillsAlreadyInstalled": "⚠️  {id} ya está instalada. ¿Reinstalar? (s/n) ",
  "skillsReinstalled": "✅ Reinstalada: {id}",
  "skillsRemoving": "Eliminando {id}...",
  "skillsRemoved": "✅ Eliminada: {id}",
  "skillsNotInstalled": "⚠️  {id} no está instalada.",
  "skillsUpdating": "Actualizando todas las skills instaladas...",
  "skillsUpdateDone": "✅ {count} skill(s) actualizada(s).",
  "skillsUpdateNone": "No hay skills instaladas para actualizar.",
  "skillsError": "❌ Error: {message}",
  "skillsUnknownCommand": "Comando desconocido: {cmd}\n  Uso: opensquad skills list|install|remove|update"
```

**Step 4: Add a test to verify all locales have skills keys**

In `tests/i18n.test.js`, add after the existing `'all locales have update keys'` test:

```js
test('all locales have skills keys', async () => {
  const LOCALES_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/locales');
  const SKILLS_KEYS = [
    'skillsNotInitialized',
    'skillsFetching',
    'skillsInstalledHeader',
    'skillsAvailableHeader',
    'skillsInstalling',
    'skillsInstalled',
    'skillsRemoving',
    'skillsRemoved',
    'skillsUpdating',
    'skillsUpdateDone',
    'skillsUpdateNone',
    'skillsError',
  ];
  const localeFiles = ['en', 'pt-BR', 'es'];
  for (const locale of localeFiles) {
    const content = JSON.parse(
      await readFile(join(LOCALES_DIR, `${locale}.json`), 'utf-8')
    );
    for (const key of SKILLS_KEYS) {
      assert.ok(key in content, `${locale}.json missing key: ${key}`);
    }
  }
});
```

**Step 5: Run tests**

```bash
npm test
```

Expected: all tests PASS including the new `'all locales have skills keys'` test.

**Step 6: Commit**

```bash
git add src/locales/en.json src/locales/pt-BR.json src/locales/es.json tests/i18n.test.js
git commit -m "feat: add i18n strings for skills CLI commands"
```

---

## Task 5: Wire up `bin/opensquad.js` with skills subcommands

**Files:**
- Create: `src/skills-cli.js`
- Modify: `bin/opensquad.js`

**Step 1: Create `src/skills-cli.js`**

This file handles the CLI orchestration (prompts, output) separately from the pure logic in `src/skills.js`:

```js
import { createInterface } from 'node:readline';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fetchManifest, listInstalled, installSkill, removeSkill } from './skills.js';
import { loadLocale, t } from './i18n.js';
import { loadSavedLocale } from './init.js';

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

export async function skillsCli(subcommand, args, targetDir) {
  // Require initialized project
  try {
    await stat(join(targetDir, '_opensquad'));
  } catch {
    await loadLocale('English');
    console.log(`\n  ${t('skillsNotInitialized')}\n`);
    return { success: false };
  }

  await loadSavedLocale(targetDir);

  try {
    if (subcommand === 'list' || !subcommand) {
      await runList(targetDir);
    } else if (subcommand === 'install') {
      await runInstall(args[0], targetDir);
    } else if (subcommand === 'remove') {
      await runRemove(args[0], targetDir);
    } else if (subcommand === 'update') {
      await runUpdate(targetDir);
    } else {
      console.log(`\n  ${t('skillsUnknownCommand', { cmd: subcommand })}\n`);
      return { success: false };
    }
  } catch (err) {
    console.log(`\n  ${t('skillsError', { message: err.message })}\n`);
    return { success: false };
  }

  return { success: true };
}

async function runList(targetDir) {
  console.log(`\n  📦 Opensquad Skills Registry\n`);
  console.log(`  ${t('skillsFetching')}`);

  const [manifest, installed] = await Promise.all([
    fetchManifest(),
    listInstalled(targetDir),
  ]);

  const installedSet = new Set(installed);

  if (installed.length > 0) {
    console.log(`\n  ${t('skillsInstalledHeader')}`);
    for (const id of installed) {
      const meta = manifest.skills.find((s) => s.id === id);
      const label = meta ? `${meta.name.padEnd(30)} ${meta.version}` : id;
      console.log(`  ✓ ${id.padEnd(30)} ${label}`);
    }
  } else {
    console.log(`\n  ${t('skillsNoneInstalled')}`);
  }

  const available = manifest.skills.filter((s) => !installedSet.has(s.id));
  if (available.length > 0) {
    console.log(`\n  ${t('skillsAvailableHeader')}`);
    for (const skill of available) {
      console.log(`  ○ ${skill.id.padEnd(30)} ${skill.name.padEnd(30)} ${skill.version}`);
    }
    console.log(`\n  ${t('skillsInstallHint')}`);
  } else if (manifest.skills.length === 0) {
    console.log(`\n  ${t('skillsNoneAvailable')}`);
  }

  console.log('');
}

async function runInstall(id, targetDir) {
  if (!id) {
    console.log('\n  Usage: opensquad skills install <id>\n');
    return;
  }

  const installed = await listInstalled(targetDir);
  if (installed.includes(id)) {
    const answer = await confirm(`\n  ${t('skillsAlreadyInstalled', { id })}`);
    if (answer !== 'y' && answer !== 's') return;
    console.log(`  ${t('skillsInstalling', { id })}`);
    await installSkill(id, targetDir);
    console.log(`  ${t('skillsReinstalled', { id })}\n`);
    return;
  }

  console.log(`\n  ${t('skillsInstalling', { id })}`);
  await installSkill(id, targetDir);
  console.log(`  ${t('skillsInstalled', { id })}\n`);
}

async function runRemove(id, targetDir) {
  if (!id) {
    console.log('\n  Usage: opensquad skills remove <id>\n');
    return;
  }

  const installed = await listInstalled(targetDir);
  if (!installed.includes(id)) {
    console.log(`\n  ${t('skillsNotInstalled', { id })}\n`);
    return;
  }

  console.log(`\n  ${t('skillsRemoving', { id })}`);
  await removeSkill(id, targetDir);
  console.log(`  ${t('skillsRemoved', { id })}\n`);
}

async function runUpdate(targetDir) {
  const installed = await listInstalled(targetDir);
  if (installed.length === 0) {
    console.log(`\n  ${t('skillsUpdateNone')}\n`);
    return;
  }

  console.log(`\n  ${t('skillsUpdating')}`);
  for (const id of installed) {
    console.log(`  ${t('skillsInstalling', { id })}`);
    await installSkill(id, targetDir);
    console.log(`  ${t('skillsInstalled', { id })}`);
  }
  console.log(`\n  ${t('skillsUpdateDone', { count: installed.length })}\n`);
}
```

**Step 2: Update `bin/opensquad.js`**

Replace the entire file content with:

```js
#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { init } from '../src/init.js';
import { update } from '../src/update.js';
import { skillsCli } from '../src/skills-cli.js';

const { positionals } = parseArgs({
  allowPositionals: true,
  strict: false,
});

const command = positionals[0];

if (command === 'init') {
  await init(process.cwd());
} else if (command === 'update') {
  const result = await update(process.cwd());
  if (!result.success) process.exit(1);
} else if (command === 'skills') {
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await skillsCli(subcommand, args, process.cwd());
  if (!result.success) process.exit(1);
} else {
  console.log(`
  opensquad — Multi-agent orchestration for Claude Code

  Usage:
    npx opensquad init                    Initialize Opensquad in current directory
    npx opensquad update                  Update Opensquad to the latest version
    npx opensquad skills list             Browse available skills
    npx opensquad skills install <id>     Install a skill
    npx opensquad skills remove <id>      Remove a skill
    npx opensquad skills update           Update all installed skills

  Learn more: https://github.com/your-org/opensquad
  `);
  process.exit(command ? 1 : 0);
}
```

**Step 3: Run full test suite**

```bash
npm test
```

Expected: all tests PASS (no tests for the CLI orchestration layer since it requires interactive stdin — the pure logic in `src/skills.js` is covered by Task 2 tests).

**Step 4: Commit**

```bash
git add src/skills-cli.js bin/opensquad.js
git commit -m "feat: add skills CLI commands (list/install/remove/update)"
```

---

## Task 6: Update `SKILL.md` with skills command route and browser flow

**Files:**
- Modify: `.claude/skills/opensquad/SKILL.md`
- Modify: `templates/.claude/skills/opensquad/SKILL.md` (keep in sync)

**Step 1: Add skills route to the Command Routing table**

In both SKILL.md files, find the Command Routing table and add this row after the `/opensquad tools` row:

```markdown
| `/opensquad skills` | Load Skills Browser → Browse & install skills |
```

**Step 2: Add skills to the "More options" submenu**

Find the "More options" submenu section:

```markdown
If the user selects "More options", present a second AskUserQuestion:
- **Tools** — Manage tool integrations (MCP servers, scripts, APIs)
- **Company profile** — View or update your company information
- **Settings** — Language, preferences, and configuration
- **Help** — Commands, examples, and documentation
```

Replace it with:

```markdown
If the user selects "More options", present a second AskUserQuestion:
- **Skills** — Browse and install skills from the Opensquad registry
- **Tools** — Manage tool integrations (MCP servers, scripts, APIs)
- **Company profile** — View or update your company information
- **Settings & Help** — Language, preferences, configuration, and help
```

**Step 3: Add the help text entry for skills**

Find the TOOLS section in help text and add a SKILLS section before it:

```
SKILLS
  /opensquad skills           Browse available skills
  /opensquad skills install <id>  Install a skill
  /opensquad skills remove <id>   Remove a skill
```

**Step 4: Add "Loading the Skills Browser" section**

Add this new section after the "Loading the Tools Engine" section:

```markdown
## Loading the Skills Browser

When the user selects "Skills" from the menu or types `/opensquad skills`:

1. Use WebFetch to fetch `https://raw.githubusercontent.com/opensquad-ai/opensquad/main/skills/manifest.json`
   - If fetch fails, show: "Could not reach the skills registry. Check your connection."
2. Use Glob `.claude/skills/*/` to detect installed skills (exclude the `opensquad` folder itself)
3. Display available skills in two groups: **Installed** (✓) and **Available** (○)
4. Use AskUserQuestion to let the user choose an action:
   - **Install a skill** — choose from available skills
   - **Remove a skill** — choose from installed skills
   - **Back to menu** — return to main menu
5. To install: WebFetch `https://raw.githubusercontent.com/opensquad-ai/opensquad/main/skills/<id>/SKILL.md`, then Write to `.claude/skills/<id>/SKILL.md`
6. To remove: use Bash to `rm -rf .claude/skills/<id>/`
7. After any action, confirm and offer to browse again or return to menu

Note: Skills installed here take effect immediately — the user can type `/<skill-id>` right away.
```

**Step 5: Run full test suite to ensure no regressions**

```bash
npm test
```

Expected: all tests PASS.

**Step 6: Commit both SKILL.md files together**

```bash
git add .claude/skills/opensquad/SKILL.md templates/.claude/skills/opensquad/SKILL.md
git commit -m "feat: add skills browser to /opensquad skill (menu + command route + browser flow)"
```

---

## Task 7: Add a real example skill to the registry

**Files:**
- Create: `skills/seo-optimizer/SKILL.md`
- Modify: `skills/manifest.json`

**Step 1: Create an example skill**

Create `skills/seo-optimizer/SKILL.md` with a simple but realistic skill (the content itself is straightforward — the important part is the structure):

```markdown
---
name: seo-optimizer
description: "SEO Optimizer — Analyze and optimize content for search engine visibility."
---

# SEO Optimizer

You are an SEO specialist. When activated, help the user optimize content for search engines.

## What I can do

- Analyze existing content for SEO gaps
- Suggest keyword improvements
- Rewrite meta descriptions and titles
- Evaluate readability and structure

## Getting started

Ask the user: "What content would you like to optimize? Share the text, URL, or describe what you need."
```

**Step 2: Update `skills/manifest.json`**

```json
{
  "version": "1",
  "skills": [
    {
      "id": "seo-optimizer",
      "name": "SEO Optimizer",
      "description": "Analyze and optimize content for search engine visibility",
      "category": "marketing",
      "version": "1.0.0"
    }
  ]
}
```

**Step 3: Run full test suite**

```bash
npm test
```

Expected: all tests PASS.

**Step 4: Commit**

```bash
git add skills/
git commit -m "feat: add seo-optimizer as first skill in registry"
```

---

## Final: Update REGISTRY_BASE to real GitHub URL

> **Note:** Before shipping, update the placeholder `opensquad-ai/opensquad` in `src/skills.js` and `SKILL.md` to the real GitHub owner/repo once it is public.

Files to update:
- `src/skills.js` — `REGISTRY_BASE` constant
- `.claude/skills/opensquad/SKILL.md` — WebFetch URLs in "Loading the Skills Browser"
- `templates/.claude/skills/opensquad/SKILL.md` — same

```bash
git add src/skills.js .claude/skills/opensquad/SKILL.md templates/.claude/skills/opensquad/SKILL.md
git commit -m "chore: update skills registry URL to production GitHub repo"
```
