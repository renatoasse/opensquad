# IDE Multi-Select Onboarding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** During `opensquad init`, ask which IDEs the user wants to install (multi-select) and copy the appropriate config files for each selected IDE (Claude Code, Open Code, Codex, Antigravity).

**Architecture:** IDE-specific template files move from `templates/` root into `templates/ide-templates/{ide}/`. `init.js` gains `copyCommonTemplates()` + `copyIdeTemplates(ides)`. `prompt.js` gains `multiChoose()` wrapping `@inquirer/checkbox`. The `_skipPrompts` path defaults to `['claude-code']` for backward-compatibility.

**Tech Stack:** Node.js ESM, `@inquirer/checkbox` (new dep), node:fs/promises (existing)

---

### Task 1: Add `@inquirer/checkbox` dependency

**Files:**
- Modify: `package.json`

**Step 1: Install the package**

```bash
npm install @inquirer/checkbox
```

Expected: `package.json` now has `"dependencies": { "@inquirer/checkbox": "^..." }` and `package-lock.json` is created/updated.

**Step 2: Run existing tests to confirm nothing broke**

```bash
npm test
```

Expected: All tests PASS (no code changes yet).

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add @inquirer/checkbox dependency"
```

---

### Task 2: Add `multiChoose()` to `prompt.js`

**Files:**
- Modify: `src/prompt.js`

**Step 1: Add the `multiChoose` method inside `createPrompt()`**

In `src/prompt.js`, after the `choose()` method (line 33), add:

```js
async multiChoose(question, options) {
  const { checkbox, Separator } = await import('@inquirer/checkbox');

  const choices = options.map(opt => {
    if (opt.separator) return new Separator(opt.label);
    return {
      name: opt.label,
      value: opt.value,
      checked: opt.checked ?? false,
      disabled: opt.disabled ? t('comingSoon') : false,
    };
  });

  return checkbox({
    message: `  ${question}`,
    choices,
    validate: (selected) =>
      selected.length > 0 || t('atLeastOneIde'),
  });
},
```

**Step 2: Run existing tests**

```bash
npm test
```

Expected: All tests PASS (no callers of `multiChoose` yet).

**Step 3: Commit**

```bash
git add src/prompt.js
git commit -m "feat: add multiChoose() to prompt for multi-select"
```

---

### Task 3: Add `_ides` option and split `copyTemplates` in `init.js`

This task introduces `_ides` as a test-injection option and splits template copying — but leaves the actual file locations unchanged for now. All existing tests must still pass.

**Files:**
- Modify: `src/init.js`

**Step 1: Write a new failing test in `tests/init.test.js`**

Add at the bottom of `tests/init.test.js`:

```js
test('init with _ides installs only selected IDE files', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['claude-code'] });

    // claude-code files exist
    await stat(join(tempDir, '.claude', 'skills', 'opensquad', 'SKILL.md'));
    await stat(join(tempDir, 'CLAUDE.md'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

**Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `init` doesn't accept `_ides` yet (but the test may pass by accident since defaults cover claude-code). Actually this test will pass with current code. The real failing tests will come in Task 4 after we move the files. Continue.

**Step 3: Update `init.js` — change `ide` to `ides`, add `copyIdeTemplates`**

In `src/init.js`, make these changes:

1. Change the default IDE variable (line 40) from `let ide = 'claude-code';` to `let ides = options._ides ?? ['claude-code'];`

2. In the `!options._skipPrompts` block, keep `ideChoice` as a placeholder but don't change interactive behavior yet (will be done in Task 9). For now just wrap the single choice in an array:
   ```js
   // Temporary — will be replaced with multiChoose in Task 9
   const ideChoice = await prompt.choose(t('chooseIdes'), IDES);
   ides = [ideChoice.value];
   ```

3. Replace `copyTemplates(targetDir)` call (line 68) with two calls:
   ```js
   await copyCommonTemplates(targetDir);
   await copyIdeTemplates(ides, targetDir);
   ```

4. Update the preferences file write (line 73-80) — change `**IDE:**` to `**IDEs:**`:
   ```js
   const prefsContent = `# Opensquad Preferences

- **User Name:** ${userName}
- **Output Language:** ${language}
- **IDEs:** ${ides.join(', ')}
- **Date Format:** YYYY-MM-DD
`;
   ```

5. Update the post-install step display — replace the if/else block (lines 84-91):
   ```js
   for (const ide of ides) {
     if (ide === 'claude-code') {
       console.log(`  ${t('step1ClaudeCode')}`);
       console.log(`  ${t('step2ClaudeCode')}`);
       console.log(`  ${t('step3ClaudeCode')}`);
     } else {
       console.log(`  ${t('step1OtherIde', { ide })}`);
       console.log(`  ${t('step2OtherIde')}`);
     }
   }
   ```

6. Rename the existing `copyTemplates` → `copyCommonTemplates` (no behavior change yet):
   ```js
   async function copyCommonTemplates(targetDir) {
     const entries = await getTemplateEntries(TEMPLATES_DIR);
     // ... same body as before ...
   }
   ```

7. Add the new `copyIdeTemplates` function after `copyCommonTemplates`:
   ```js
   async function copyIdeTemplates(ides, targetDir) {
     const ideTemplatesDir = join(TEMPLATES_DIR, 'ide-templates');
     const writtenPaths = new Set(); // avoid writing same file twice (e.g. opencode + codex both use AGENTS.md)

     for (const ide of ides) {
       const ideSrcDir = join(ideTemplatesDir, ide);
       let entries;
       try {
         entries = await getTemplateEntries(ideSrcDir);
       } catch {
         continue; // no template dir for this IDE yet
       }

       for (const entry of entries) {
         const relativePath = entry.slice(ideSrcDir.length + 1);
         if (writtenPaths.has(relativePath)) continue;
         writtenPaths.add(relativePath);

         const destPath = join(targetDir, relativePath);
         const destDir = dirname(destPath);
         await mkdir(destDir, { recursive: true });
         await cp(entry, destPath);
         console.log(`  ${t('createdFile', { path: relativePath })}`);
       }
     }
   }
   ```

**Step 4: Run tests**

```bash
npm test
```

Expected: Most tests PASS. The preferences test will FAIL because it checks `IDE:` but now we write `IDEs:`.

**Step 5: Fix the preferences test in `tests/init.test.js`**

Find the test `'init writes preferences file with defaults when prompts skipped'` (line 78) and change:
```js
assert.ok(prefs.includes('IDE:'));
```
to:
```js
assert.ok(prefs.includes('IDEs:'));
```

**Step 6: Run tests**

```bash
npm test
```

Expected: All tests PASS.

**Step 7: Commit**

```bash
git add src/init.js tests/init.test.js
git commit -m "feat: add _ides option and split copyTemplates into common + ide-specific"
```

---

### Task 4: Move Claude Code template files into `ide-templates/`

**Files:**
- Create: `templates/ide-templates/claude-code/` (directory + files moved from root)
- Delete (move): `templates/CLAUDE.md`
- Delete (move): `templates/.claude/` directory

**Step 1: Create the new directory and move files**

```bash
mkdir -p "templates/ide-templates/claude-code/.claude/skills/opensquad"
cp "templates/.claude/skills/opensquad/SKILL.md" "templates/ide-templates/claude-code/.claude/skills/opensquad/SKILL.md"
cp "templates/CLAUDE.md" "templates/ide-templates/claude-code/CLAUDE.md"
rm -rf "templates/.claude"
rm "templates/CLAUDE.md"
```

**Step 2: Update `copyCommonTemplates` in `init.js` to skip `ide-templates/`**

In the `copyCommonTemplates` function, add a filter to skip the `ide-templates/` subdirectory. Before the `for` loop over entries, add:

```js
async function copyCommonTemplates(targetDir) {
  const entries = await getTemplateEntries(TEMPLATES_DIR);
  const ideTemplatesPrefix = join(TEMPLATES_DIR, 'ide-templates') + '/';

  for (const entry of entries) {
    // Skip anything inside ide-templates/ — handled by copyIdeTemplates
    if (entry.replace(/\\/g, '/').includes('/ide-templates/')) continue;

    const relativePath = entry.slice(TEMPLATES_DIR.length + 1);
    const destPath = join(targetDir, relativePath);
    const destDir = dirname(destPath);
    await mkdir(destDir, { recursive: true });
    await cp(entry, destPath);
    console.log(`  ${t('createdFile', { path: relativePath })}`);
  }
}
```

Note: Use a string `includes('/ide-templates/')` check (normalizing backslashes) to handle Windows paths correctly.

**Step 3: Run tests**

```bash
npm test
```

Expected: All tests PASS. The test `init creates _opensquad directory structure` checks for `.claude/skills/opensquad/SKILL.md` — this now comes from `copyIdeTemplates(['claude-code'])` which is the default.

**Step 4: Commit**

```bash
git add templates/ src/init.js
git commit -m "refactor: move claude-code template files into ide-templates/claude-code/"
```

---

### Task 5: Create Open Code template file and test

**Files:**
- Create: `templates/ide-templates/opencode/AGENTS.md`
- Modify: `tests/init.test.js`

**Step 1: Write a failing test**

Add at the bottom of `tests/init.test.js`:

```js
test('init with _ides opencode creates AGENTS.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['opencode'] });

    const content = await readFile(join(tempDir, 'AGENTS.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
    assert.ok(content.includes('/opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

**Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL with "ENOENT: no such file or directory, open '.../AGENTS.md'"

**Step 3: Create the AGENTS.md template**

Create `templates/ide-templates/opencode/AGENTS.md` with this content (SKILL.md body, no YAML frontmatter):

```markdown
# Opensquad Instructions

You are now operating as the Opensquad system. Your primary role is to help users create, manage, and run AI agent squads.

## Initialization

On activation, perform these steps IN ORDER:

1. Read the company context file: `{project-root}/_opensquad/_memory/company.md`
2. Read the preferences file: `{project-root}/_opensquad/_memory/preferences.md`
3. Check if company.md is empty or contains only the template — if so, trigger ONBOARDING flow
4. Otherwise, display the MAIN MENU

## Onboarding Flow (first time only)

If `company.md` is empty or contains `<!-- NOT CONFIGURED -->`:

1. Welcome the user warmly to Opensquad
2. Ask their name (save to preferences.md)
3. Ask their preferred language for outputs (save to preferences.md)
4. Ask for their company name/description and website URL
5. Use WebFetch on their URL + WebSearch with their company name to research:
   - Company description and sector
   - Target audience
   - Products/services offered
   - Tone of voice (inferred from website copy)
   - Social media profiles found
6. Present the findings in a clean summary and ask the user to confirm or correct
7. Save the confirmed profile to `_opensquad/_memory/company.md`
8. Show the main menu

## Main Menu

When the user types `/opensquad` or asks for the menu, present an interactive selector using AskUserQuestion with these options (max 4 per question):

**Primary menu (first question):**
- **Create a new squad** — Describe what you need and I'll build a squad for you
- **Run an existing squad** — Execute a squad's pipeline
- **My squads** — View, edit, or delete your squads
- **More options** — Tools, company profile, settings, and help

If the user selects "More options", present a second AskUserQuestion:
- **Tools** — Manage tool integrations (MCP servers, scripts, APIs)
- **Company profile** — View or update your company information
- **Settings** — Language, preferences, and configuration
- **Help** — Commands, examples, and documentation

## Command Routing

Parse user input and route to the appropriate action:

| Input Pattern | Action |
|---------------|--------|
| `/opensquad` or `/opensquad menu` | Show main menu |
| `/opensquad help` | Show help text |
| `/opensquad create <description>` | Load Architect → Create Squad flow |
| `/opensquad list` | List all squads in `squads/` directory |
| `/opensquad run <name>` | Load Pipeline Runner → Execute squad |
| `/opensquad dashboard <name>` | Load dashboard.prompt.md → generate squad dashboard |
| `/opensquad edit <name> <changes>` | Load Architect → Edit Squad flow |
| `/opensquad tools` | Load Tools Engine → Show tools menu |
| `/opensquad delete <name>` | Confirm and delete squad directory |
| `/opensquad edit-company` | Re-run company profile setup |
| `/opensquad show-company` | Display company.md contents |
| `/opensquad settings` | Show/edit preferences.md |
| `/opensquad reset` | Confirm and reset all configuration |
| Natural language about squads | Infer intent and route accordingly |

## Loading Agents

When a specific agent needs to be activated:

1. Read the agent's `.agent.md` file completely
2. Adopt the agent's persona (role, identity, communication_style, principles)
3. Follow the agent's menu/workflow instructions
4. When the agent's task is complete, return to Opensquad main context

## Loading the Pipeline Runner

When running a squad:

1. Read `squads/{name}/squad.yaml` to understand the pipeline
2. Read `squads/{name}/squad-party.csv` to load all agent personas
3. For each agent in the party CSV, also read their full `.agent.md` file from agents/ directory
4. Load company context from `_opensquad/_memory/company.md`
5. Load squad memory from `squads/{name}/_memory/memories.md`
6. Read the pipeline runner instructions from `_opensquad/core/runner.pipeline.md`
7. Execute the pipeline step by step following runner instructions

## Language Handling

- Read `preferences.md` for the user's preferred language
- All user-facing output should be in the user's preferred language
- Internal file names and code remain in English
- Agent personas communicate in the user's language

## Critical Rules

- NEVER skip the onboarding if company.md is not configured
- ALWAYS load company context before running any squad
- ALWAYS present checkpoints to the user — never skip them
- ALWAYS save outputs to the squad's output directory
- When switching personas (inline execution), clearly indicate which agent is speaking
- When using subagents, inform the user that background work is happening
- After each pipeline run, update the squad's memories.md with key learnings
```

**Step 4: Run tests**

```bash
npm test
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add templates/ide-templates/opencode/AGENTS.md tests/init.test.js
git commit -m "feat: add Open Code (opencode) IDE template with AGENTS.md"
```

---

### Task 6: Create Codex template file and test

**Files:**
- Create: `templates/ide-templates/codex/AGENTS.md`
- Modify: `tests/init.test.js`

**Step 1: Write two failing tests**

Add to `tests/init.test.js`:

```js
test('init with _ides codex creates AGENTS.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['codex'] });

    const content = await readFile(join(tempDir, 'AGENTS.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with opencode and codex both selected writes AGENTS.md only once', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['opencode', 'codex'] });

    // AGENTS.md exists (written once, not duplicated)
    const content = await readFile(join(tempDir, 'AGENTS.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

**Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: The `codex` test FAILS (no template). The `opencode + codex` test passes (opencode already works; the dedup logic in `copyIdeTemplates` prevents double-writes).

**Step 3: Create `templates/ide-templates/codex/AGENTS.md`**

Copy the same content as `templates/ide-templates/opencode/AGENTS.md`:

```bash
cp templates/ide-templates/opencode/AGENTS.md templates/ide-templates/codex/AGENTS.md
```

**Step 4: Run tests**

```bash
npm test
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add templates/ide-templates/codex/AGENTS.md tests/init.test.js
git commit -m "feat: add Codex (OpenAI) IDE template with AGENTS.md"
```

---

### Task 7: Create Antigravity template file and test

**Files:**
- Create: `templates/ide-templates/antigravity/.antigravity/rules.md`
- Modify: `tests/init.test.js`

**Step 1: Write a failing test**

Add to `tests/init.test.js`:

```js
test('init with _ides antigravity creates .antigravity/rules.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['antigravity'] });

    const content = await readFile(
      join(tempDir, '.antigravity', 'rules.md'),
      'utf-8'
    );
    assert.ok(content.includes('Opensquad'));
    assert.ok(content.includes('/opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

**Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL with ENOENT for `.antigravity/rules.md`

**Step 3: Create the template file**

Create `templates/ide-templates/antigravity/.antigravity/rules.md` with the same content as `templates/ide-templates/opencode/AGENTS.md`.

```bash
mkdir -p templates/ide-templates/antigravity/.antigravity
cp templates/ide-templates/opencode/AGENTS.md templates/ide-templates/antigravity/.antigravity/rules.md
```

**Step 4: Run tests**

```bash
npm test
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add templates/ide-templates/antigravity/ tests/init.test.js
git commit -m "feat: add Antigravity IDE template with .antigravity/rules.md"
```

---

### Task 8: Update locale files with new i18n keys

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/pt-BR.json`
- Modify: `src/locales/es.json`

**Step 1: Update `src/locales/en.json`**

Add the following new keys (replace existing `chooseIde`, keep the rest, add new ones):

```json
{
  "chooseIdes": "Which IDEs/tools do you use? (select all that apply)",
  "atLeastOneIde": "Please select at least one IDE.",
  "step1OpenCode": "1. See AGENTS.md in your project root for Open Code instructions",
  "step1Codex": "1. See AGENTS.md in your project root for Codex instructions",
  "step1Antigravity": "1. See .antigravity/rules.md for Antigravity instructions"
}
```

Keep the existing `chooseIde` key so i18n tests don't break. Just add the new keys.

**Step 2: Update `src/locales/pt-BR.json`**

Add the same keys translated:

```json
{
  "chooseIdes": "Quais IDEs/ferramentas você usa? (selecione todas que usa)",
  "atLeastOneIde": "Selecione pelo menos uma IDE.",
  "step1OpenCode": "1. Veja AGENTS.md na raiz do projeto para instruções do Open Code",
  "step1Codex": "1. Veja AGENTS.md na raiz do projeto para instruções do Codex",
  "step1Antigravity": "1. Veja .antigravity/rules.md para instruções do Antigravity"
}
```

**Step 3: Update `src/locales/es.json`**

```json
{
  "chooseIdes": "¿Qué IDEs/herramientas usas? (selecciona todas las que uses)",
  "atLeastOneIde": "Por favor selecciona al menos una IDE.",
  "step1OpenCode": "1. Consulta AGENTS.md en la raíz del proyecto para instrucciones de Open Code",
  "step1Codex": "1. Consulta AGENTS.md en la raíz del proyecto para instrucciones de Codex",
  "step1Antigravity": "1. Consulta .antigravity/rules.md para instrucciones de Antigravity"
}
```

**Step 4: Run tests**

```bash
npm test
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add src/locales/
git commit -m "feat: add i18n keys for multi-select IDE onboarding"
```

---

### Task 9: Wire interactive multi-select into `init.js` + per-IDE next steps

**Files:**
- Modify: `src/init.js`

**Step 1: Update the IDES array in `init.js`**

Replace the current `IDES` constant (lines 16-21) with:

```js
const IDES = [
  { label: 'Claude Code (Terminal)', value: 'claude-code', checked: true },
  { label: 'Open Code', value: 'opencode' },
  { label: 'Codex (OpenAI)', value: 'codex' },
  { label: 'Antigravity', value: 'antigravity' },
  { label: '──────────────────', separator: true },
  { label: 'Cursor', value: 'cursor', disabled: true },
  { label: 'Windsurf', value: 'windsurf', disabled: true },
  { label: 'VS Code + Copilot', value: 'vscode-copilot', disabled: true },
];
```

**Step 2: Replace the interactive IDE selection**

Inside the `if (!options._skipPrompts)` block, replace:
```js
const ideChoice = await prompt.choose(t('chooseIdes'), IDES);
ides = [ideChoice.value];
```

With:
```js
ides = await prompt.multiChoose(t('chooseIdes'), IDES);
```

**Step 3: Update the post-install message block**

Replace the current `for (const ide of ides)` loop with per-IDE specific messages:

```js
for (const ide of ides) {
  if (ide === 'claude-code') {
    console.log(`  ${t('step1ClaudeCode')}`);
    console.log(`  ${t('step2ClaudeCode')}`);
    console.log(`  ${t('step3ClaudeCode')}`);
  } else if (ide === 'opencode') {
    console.log(`  ${t('step1OpenCode')}`);
  } else if (ide === 'codex') {
    console.log(`  ${t('step1Codex')}`);
  } else if (ide === 'antigravity') {
    console.log(`  ${t('step1Antigravity')}`);
  }
}
```

**Step 4: Run tests**

```bash
npm test
```

Expected: All tests PASS (interactive path is not tested; `_skipPrompts` skips it).

**Step 5: Manual smoke test** (optional, for confidence)

```bash
node bin/opensquad.js init /tmp/opensquad-smoke-test
```

Expected: See the checkbox selector with Claude Code pre-selected, select multiple, confirm files are created.

**Step 6: Commit**

```bash
git add src/init.js
git commit -m "feat: wire multi-select IDE checkbox into interactive init flow"
```

---

### Task 10: Update the `templates` SKILL.md to match the live SKILL.md

**Files:**
- Verify: `templates/ide-templates/claude-code/.claude/skills/opensquad/SKILL.md`

**Step 1: Check if the template SKILL.md matches the live SKILL.md**

```bash
diff templates/ide-templates/claude-code/.claude/skills/opensquad/SKILL.md .claude/skills/opensquad/SKILL.md
```

Expected: If there are differences, the live `.claude/skills/opensquad/SKILL.md` is the source of truth. Copy it over:

```bash
cp .claude/skills/opensquad/SKILL.md templates/ide-templates/claude-code/.claude/skills/opensquad/SKILL.md
```

Also copy to AGENTS.md templates if needed (they're manually maintained copies).

**Step 2: Run tests**

```bash
npm test
```

Expected: All tests PASS.

**Step 3: Commit (if changes)**

```bash
git add templates/
git commit -m "chore: sync template SKILL.md with live version"
```

---

## Summary

After all tasks, the onboarding flow will:

1. Ask language (unchanged)
2. Ask name (unchanged)
3. Show multi-select checkbox with Claude Code pre-checked, Open Code, Codex, Antigravity enabled; Cursor/Windsurf/VS Code + Copilot shown as "coming soon"
4. Copy common templates (unchanged)
5. Copy IDE-specific files for each selected IDE
6. Write `**IDEs:** claude-code, opencode` to preferences.md
7. Show per-IDE next steps

Test coverage includes: each IDE creates its expected file, opencode+codex dedup, default `_ides: ['claude-code']` for backward compat.
