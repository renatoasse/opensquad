# Update Command (`opensquad-terminal update`) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `npx opensquad-terminal update` that re-applies the latest system templates to an initialized project while preserving all user data.

**Architecture:** A new `src/update.js` module with an exported `update()` function mirrors the structure of `src/init.js`. It re-copies all template files to the project, skipping three protected directories (`_opensquad/_memory/`, `_opensquad/_investigations/`, `squads/`). Version is tracked in `_opensquad/.opensquad-version`. Two shared utilities (`getTemplateEntries`, `loadSavedLocale`) are exported from `init.js` and reused.

**Tech Stack:** Node.js 20+ ESM, `node:fs/promises`, `node:path`, `node:test` (built-in test runner)

---

### Task 1: Add version file to templates

**Files:**
- Create: `templates/_opensquad/.opensquad-version`
- Modify: `tests/init.test.js`

**Step 1: Create the version file**

Create `templates/_opensquad/.opensquad-version` with exactly this content (single line, no trailing newline):

```
0.1.0
```

**Step 2: Write a failing test**

Add to `tests/init.test.js`:

```js
test('init creates .opensquad-version file', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const version = await readFile(join(tempDir, '_opensquad', '.opensquad-version'), 'utf-8');
    assert.ok(version.trim().length > 0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

**Step 3: Run test to verify it fails**

```bash
node --test tests/init.test.js
```

Expected: FAIL — `ENOENT: no such file or directory ... .opensquad-version`

**Step 4: Run test to verify it passes**

Since `copyTemplates()` in `init.js` recursively copies all template files, adding the file to `templates/_opensquad/` is all that's needed. No code changes required.

```bash
node --test tests/init.test.js
```

Expected: all tests PASS

**Step 5: Commit**

```bash
git add templates/_opensquad/.opensquad-version tests/init.test.js
git commit -m "feat: add .opensquad-version tracking file to templates"
```

---

### Task 2: Export shared utilities from `src/init.js`

**Files:**
- Modify: `src/init.js`

**Step 1: Export `getTemplateEntries` and `loadSavedLocale`**

In `src/init.js`, change:

```js
async function loadSavedLocale(targetDir) {
```

to:

```js
export async function loadSavedLocale(targetDir) {
```

And change:

```js
async function getTemplateEntries(dir) {
```

to:

```js
export async function getTemplateEntries(dir) {
```

**Step 2: Run existing tests to confirm nothing broke**

```bash
npm test
```

Expected: all tests PASS (no behavioral change, only visibility)

**Step 3: Commit**

```bash
git add src/init.js
git commit -m "refactor: export getTemplateEntries and loadSavedLocale from init.js"
```

---

### Task 3: Add i18n strings for the update command

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/pt-BR.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`
- Modify: `src/locales/de.json`
- Modify: `src/locales/it.json`
- Modify: `src/locales/ja.json`
- Modify: `src/locales/zh.json`
- Modify: `tests/i18n.test.js`

**Step 1: Write a failing test**

Add to `tests/i18n.test.js`:

```js
test('all locales have update keys', async () => {
  const LOCALES_DIR = new URL('../src/locales', import.meta.url).pathname;
  const UPDATE_KEYS = [
    'updateNotInitialized',
    'updateStarting',
    'updateStartingUnknown',
    'updatedFile',
    'updateSuccess',
    'updatePreserved',
    'updateFileCount',
    'updateLatestHint',
  ];
  const localeFiles = ['en', 'pt-BR', 'es', 'fr', 'de', 'it', 'ja', 'zh'];

  for (const locale of localeFiles) {
    const content = JSON.parse(
      await readFile(join(LOCALES_DIR.replace(/^\//, ''), `${locale}.json`), 'utf-8')
    );
    for (const key of UPDATE_KEYS) {
      assert.ok(key in content, `${locale}.json missing key: ${key}`);
    }
  }
});
```

Note: also add `import { readFile } from 'node:fs/promises';` and `import { join } from 'node:path';` to the imports in `tests/i18n.test.js` if not already present.

**Step 2: Run test to verify it fails**

```bash
node --test tests/i18n.test.js
```

Expected: FAIL — `en.json missing key: updateNotInitialized`

**Step 3: Add keys to all locale files**

Add the following to each locale file (add at the end of the JSON object, before the closing `}`):

**`src/locales/en.json`** — add:
```json
  "updateNotInitialized": "No Opensquad installation found. Run 'init' first.",
  "updateStarting": "Updating Opensquad {old} → {new}...",
  "updateStartingUnknown": "Updating Opensquad (unknown version) → {new}...",
  "updatedFile": "📄 Updated {path}",
  "updateSuccess": "✅ Opensquad {version} installed successfully!",
  "updatePreserved": "✓ Preserved: _memory/, _investigations/, squads/",
  "updateFileCount": "✓ Updated: {count} system files",
  "updateLatestHint": "💡 Tip: Use 'npx opensquad-terminal@latest update' to always get the newest version."
```

**`src/locales/pt-BR.json`** — add:
```json
  "updateNotInitialized": "Nenhuma instalação do Opensquad encontrada. Execute 'init' primeiro.",
  "updateStarting": "Atualizando Opensquad {old} → {new}...",
  "updateStartingUnknown": "Atualizando Opensquad (versão desconhecida) → {new}...",
  "updatedFile": "📄 Atualizado {path}",
  "updateSuccess": "✅ Opensquad {version} instalado com sucesso!",
  "updatePreserved": "✓ Preservado: _memory/, _investigations/, squads/",
  "updateFileCount": "✓ Atualizados: {count} arquivos do sistema",
  "updateLatestHint": "💡 Dica: Use 'npx opensquad-terminal@latest update' para sempre obter a versão mais recente."
```

**`src/locales/es.json`** — add:
```json
  "updateNotInitialized": "No se encontró ninguna instalación de Opensquad. Ejecute 'init' primero.",
  "updateStarting": "Actualizando Opensquad {old} → {new}...",
  "updateStartingUnknown": "Actualizando Opensquad (versión desconocida) → {new}...",
  "updatedFile": "📄 Actualizado {path}",
  "updateSuccess": "✅ ¡Opensquad {version} instalado correctamente!",
  "updatePreserved": "✓ Preservado: _memory/, _investigations/, squads/",
  "updateFileCount": "✓ Actualizados: {count} archivos del sistema",
  "updateLatestHint": "💡 Consejo: Use 'npx opensquad-terminal@latest update' para obtener siempre la versión más reciente."
```

**`src/locales/fr.json`** — add:
```json
  "updateNotInitialized": "Aucune installation Opensquad trouvée. Exécutez 'init' d'abord.",
  "updateStarting": "Mise à jour de Opensquad {old} → {new}...",
  "updateStartingUnknown": "Mise à jour de Opensquad (version inconnue) → {new}...",
  "updatedFile": "📄 Mis à jour {path}",
  "updateSuccess": "✅ Opensquad {version} installé avec succès !",
  "updatePreserved": "✓ Préservé : _memory/, _investigations/, squads/",
  "updateFileCount": "✓ Mis à jour : {count} fichiers système",
  "updateLatestHint": "💡 Conseil : Utilisez 'npx opensquad-terminal@latest update' pour toujours obtenir la dernière version."
```

**`src/locales/de.json`** — add:
```json
  "updateNotInitialized": "Keine Opensquad-Installation gefunden. Führen Sie zuerst 'init' aus.",
  "updateStarting": "Opensquad wird aktualisiert {old} → {new}...",
  "updateStartingUnknown": "Opensquad wird aktualisiert (unbekannte Version) → {new}...",
  "updatedFile": "📄 Aktualisiert {path}",
  "updateSuccess": "✅ Opensquad {version} erfolgreich installiert!",
  "updatePreserved": "✓ Erhalten: _memory/, _investigations/, squads/",
  "updateFileCount": "✓ Aktualisiert: {count} Systemdateien",
  "updateLatestHint": "💡 Tipp: Verwenden Sie 'npx opensquad-terminal@latest update', um immer die neueste Version zu erhalten."
```

**`src/locales/it.json`** — add:
```json
  "updateNotInitialized": "Nessuna installazione Opensquad trovata. Eseguire prima 'init'.",
  "updateStarting": "Aggiornamento Opensquad {old} → {new}...",
  "updateStartingUnknown": "Aggiornamento Opensquad (versione sconosciuta) → {new}...",
  "updatedFile": "📄 Aggiornato {path}",
  "updateSuccess": "✅ Opensquad {version} installato con successo!",
  "updatePreserved": "✓ Preservato: _memory/, _investigations/, squads/",
  "updateFileCount": "✓ Aggiornati: {count} file di sistema",
  "updateLatestHint": "💡 Suggerimento: Usa 'npx opensquad-terminal@latest update' per ottenere sempre la versione più recente."
```

**`src/locales/ja.json`** — add:
```json
  "updateNotInitialized": "Opensquadのインストールが見つかりません。まず'init'を実行してください。",
  "updateStarting": "Opensquad {old} → {new} に更新中...",
  "updateStartingUnknown": "Opensquad（バージョン不明）→ {new} に更新中...",
  "updatedFile": "📄 更新しました {path}",
  "updateSuccess": "✅ Opensquad {version} のインストールが完了しました！",
  "updatePreserved": "✓ 保持: _memory/, _investigations/, squads/",
  "updateFileCount": "✓ 更新済み: {count} 個のシステムファイル",
  "updateLatestHint": "💡 ヒント: 常に最新バージョンを入手するには 'npx opensquad-terminal@latest update' を使用してください。"
```

**`src/locales/zh.json`** — add:
```json
  "updateNotInitialized": "未找到 Opensquad 安装。请先运行 'init'。",
  "updateStarting": "正在更新 Opensquad {old} → {new}...",
  "updateStartingUnknown": "正在更新 Opensquad（未知版本）→ {new}...",
  "updatedFile": "📄 已更新 {path}",
  "updateSuccess": "✅ Opensquad {version} 安装成功！",
  "updatePreserved": "✓ 已保留：_memory/、_investigations/、squads/",
  "updateFileCount": "✓ 已更新：{count} 个系统文件",
  "updateLatestHint": "💡 提示：使用 'npx opensquad-terminal@latest update' 以始终获取最新版本。"
```

**Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all tests PASS

**Step 5: Commit**

```bash
git add src/locales/
git commit -m "feat: add i18n strings for update command (8 locales)"
```

---

### Task 4: Create `src/update.js` with TDD

**Files:**
- Create: `tests/update.test.js`
- Create: `src/update.js`

**Step 1: Write all failing tests**

Create `tests/update.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { init } from '../src/init.js';
import { update } from '../src/update.js';

test('update returns failure when not initialized', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    const result = await update(tempDir);
    assert.equal(result.success, false);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update overwrites system files', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await writeFile(join(tempDir, 'CLAUDE.md'), 'garbage content', 'utf-8');

    await update(tempDir);

    const content = await readFile(join(tempDir, 'CLAUDE.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
    assert.ok(!content.includes('garbage content'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update preserves _memory contents', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await writeFile(
      join(tempDir, '_opensquad', '_memory', 'company.md'),
      'My Company Info',
      'utf-8'
    );

    await update(tempDir);

    const content = await readFile(
      join(tempDir, '_opensquad', '_memory', 'company.md'),
      'utf-8'
    );
    assert.equal(content, 'My Company Info');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update preserves _investigations contents', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await writeFile(
      join(tempDir, '_opensquad', '_investigations', 'profile-analysis.md'),
      'investigation data',
      'utf-8'
    );

    await update(tempDir);

    const content = await readFile(
      join(tempDir, '_opensquad', '_investigations', 'profile-analysis.md'),
      'utf-8'
    );
    assert.equal(content, 'investigation data');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update preserves squads contents', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await mkdir(join(tempDir, 'squads', 'my-squad'), { recursive: true });
    await writeFile(
      join(tempDir, 'squads', 'my-squad', 'custom.md'),
      'user squad content',
      'utf-8'
    );

    await update(tempDir);

    const content = await readFile(
      join(tempDir, 'squads', 'my-squad', 'custom.md'),
      'utf-8'
    );
    assert.equal(content, 'user squad content');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update writes new version to .opensquad-version', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    await update(tempDir);

    const version = await readFile(
      join(tempDir, '_opensquad', '.opensquad-version'),
      'utf-8'
    );
    assert.ok(version.trim().length > 0);
    assert.match(version.trim(), /^\d+\.\d+\.\d+$/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update succeeds without existing .opensquad-version (legacy install)', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await rm(join(tempDir, '_opensquad', '.opensquad-version'), { force: true });

    const result = await update(tempDir);
    assert.equal(result.success, true);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update returns success when initialized', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    const result = await update(tempDir);
    assert.equal(result.success, true);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

**Step 2: Run tests to verify they all fail**

```bash
node --test tests/update.test.js
```

Expected: FAIL — `Cannot find module '../src/update.js'`

**Step 3: Create `src/update.js`**

```js
import { cp, mkdir, readFile, stat } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadLocale, t } from './i18n.js';
import { getTemplateEntries, loadSavedLocale } from './init.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

const PROTECTED_PATHS = [
  '_opensquad/_memory',
  '_opensquad/_investigations',
  'squads',
];

function isProtected(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  return PROTECTED_PATHS.some(
    (p) => normalized === p || normalized.startsWith(p + '/')
  );
}

export async function update(targetDir) {
  console.log('\n  🔄 Opensquad — Update\n');

  // 1. Check initialized
  try {
    await stat(join(targetDir, '_opensquad'));
  } catch {
    await loadLocale('English');
    console.log(`  ${t('updateNotInitialized')}`);
    return { success: false };
  }

  // 2. Load user's locale
  await loadSavedLocale(targetDir);

  // 3. Read versions
  let currentVersion = null;
  try {
    currentVersion = (
      await readFile(join(targetDir, '_opensquad', '.opensquad-version'), 'utf-8')
    ).trim();
  } catch {
    // Legacy install — no version file
  }

  const newVersion = (
    await readFile(join(TEMPLATES_DIR, '_opensquad', '.opensquad-version'), 'utf-8')
  ).trim();

  // 4. Announce
  if (currentVersion) {
    console.log(
      `  ${t('updateStarting', { old: `v${currentVersion}`, new: `v${newVersion}` })}`
    );
  } else {
    console.log(`  ${t('updateStartingUnknown', { new: `v${newVersion}` })}`);
  }

  // 5. Copy templates, skipping protected paths
  const entries = await getTemplateEntries(TEMPLATES_DIR);
  let count = 0;

  for (const entry of entries) {
    const relativePath = relative(TEMPLATES_DIR, entry);
    if (isProtected(relativePath)) continue;

    const destPath = join(targetDir, relativePath);
    await mkdir(dirname(destPath), { recursive: true });
    await cp(entry, destPath);
    console.log(`  ${t('updatedFile', { path: relativePath.replaceAll('\\', '/') })}`);
    count++;
  }

  // 6. Summary
  console.log(`\n  ${t('updateFileCount', { count })}`);
  console.log(`  ${t('updatePreserved')}`);
  console.log(`  ${t('updateSuccess', { version: `v${newVersion}` })}`);
  console.log(`\n  ${t('updateLatestHint')}\n`);

  return { success: true };
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all tests PASS

**Step 5: Commit**

```bash
git add src/update.js tests/update.test.js
git commit -m "feat: implement update() function with protected-path copy logic"
```

---

### Task 5: Wire `update` command in `bin/opensquad.js`

**Files:**
- Modify: `bin/opensquad.js`

**Step 1: Update the CLI entry point**

Replace the content of `bin/opensquad.js` with:

```js
#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { init } from '../src/init.js';
import { update } from '../src/update.js';

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
} else {
  console.log(`
  opensquad-terminal — Multi-agent orchestration for Claude Code

  Usage:
    npx opensquad-terminal init      Initialize Opensquad in current directory
    npx opensquad-terminal update    Update Opensquad to the latest version

  Learn more: https://github.com/your-org/opensquad-terminal
  `);
  process.exit(command ? 1 : 0);
}
```

**Step 2: Run full test suite**

```bash
npm test
```

Expected: all tests PASS

**Step 3: Smoke test the command manually**

From the project root (which has an initialized `_opensquad/`):

```bash
node bin/opensquad.js update
```

Expected output:
```
  🔄 Opensquad — Update

  Updating Opensquad v0.1.0 → v0.1.0...
  📄 Updated _opensquad/.opensquad-version
  📄 Updated _opensquad/core/...
  ...

  ✓ Updated: N system files
  ✓ Preserved: _memory/, _investigations/, squads/
  ✅ Opensquad v0.1.0 installed successfully!

  💡 Tip: Use 'npx opensquad-terminal@latest update' to always get the newest version.
```

**Step 4: Test the "not initialized" error path**

```bash
mkdir /tmp/opensquad-empty && cd /tmp/opensquad-empty && node /path/to/opensquad/bin/opensquad.js update
```

Expected: prints error message and exits with code 1.

**Step 5: Commit**

```bash
git add bin/opensquad.js
git commit -m "feat: wire update command in CLI entry point"
```
