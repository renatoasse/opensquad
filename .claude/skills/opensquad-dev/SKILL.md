---
name: opensquad-dev
description: "opensquad development checklist — verifies distribution wiring, template/IDE separation, and package integrity."
---

# opensquad Development Checklist

You are running the opensquad-dev verification skill inside the opensquad repository.
Your job is to detect and report distribution issues before they reach users.

## How opensquad Distribution Works

Understand this before checking anything. There are **four** copy mechanisms, and choosing the
wrong one is the most common distribution bug.

- **`templates/`** (excluding `ide-templates/`) → Copied by `src/init.js:copyCommonTemplates()`
  during `npx opensquad init`, and by `src/update.js` during `npx opensquad update`.
  On init, existing files are **skipped**; on update, they are **overwritten with a `.bak` backup**
  unless protected. If a file isn't here, users don't get it on init.

- **`templates/ide-templates/{ide}/`** → IDE-specific files, copied selectively based on the user's
  IDE selection during init (and on their saved `preferences.md` during update). One subfolder per
  supported IDE.

- **Canonical sources** → `src/init.js:CANONICAL_SOURCES` copies these **directly from the package
  root**, with no `templates/` mirror:
  - `_opensquad/core` → user's `_opensquad/core`
  - `_opensquad/config` → user's `_opensquad/config`
  - `dashboard` → user's `dashboard` (minus `DASHBOARD_EXCLUDES`: `node_modules`,
    `tsconfig.tsbuildinfo`, `squads`)

  > **This replaced the old `templates/_opensquad/core/` mirror.** Editing `_opensquad/core/*` is
  > sufficient and complete. Do NOT recreate a mirror under `templates/` — see
  > `docs/superpowers/specs/2026-03-27-eliminate-template-duplication-design.md`.

- **`skills/`** (project root) → Bundled skills catalog, distributed via `package.json files[]`.
  `installSkill()` does a **recursive directory copy**, so multi-file skills (those with
  `scripts/`, `assets/`, `references/`, etc.) work without any `templates/skills/` mirror.
  - `init` installs **every** bundled skill, including MCP/hybrid ones and `opensquad-skill-creator`
    (`src/init.js:installAllSkills`).
  - `update` installs only skills **not already present**, and skips `opensquad-skill-creator`
    plus anything with `type: mcp` or `type: hybrid`.

- **`agents/`** (project root) → Predefined agent **archetype** catalog, distributed via
  `package.json files[]`. One directory per archetype containing `AGENT.md`, plus a generated
  `_catalog.yaml` index.
  - `init` installs every archetype as `agents/{id}.agent.md` (`src/init.js:installAllAgents`)
    and copies the index (`src/agents.js:installCatalog`).
  - `update` backfills only archetypes **not already present** — `agents` is in `PROTECTED_PATHS`,
    so user-customized agents are never overwritten — and refreshes `_catalog.yaml`, which is
    generated rather than user-owned.
  - Archetypes are **inputs to the Architect, not finished agents**. `design.prompt.md` Phase E
    reads `_catalog.yaml`, picks a matching archetype, and specializes it; `build.prompt.md`
    writes the specialized agent into `squads/{code}/agents/`. Gate 1 rejects any generated agent
    that still carries the `> **ARCHETYPE**` banner or a `## Specialization Contract` section.

- **`package.json files[]`** → Controls what enters the npm package. Currently:
  `bin/`, `src/`, `agents/`, `skills/`, `templates/`, `_opensquad/`, `dashboard/`.

- **`src/update.js:PROTECTED_PATHS`** → Directories never overwritten during update.
  Actual contents: `_opensquad/_memory`, `agents`, `squads`.

## Multi-IDE Architecture

When a user runs `npx opensquad init`, they choose one or more IDEs. Files come from two places:

1. **Common templates** (`templates/`, excluding `ide-templates/`) — copied for every project
2. **IDE-specific templates** (`templates/ide-templates/{ide}/`) — copied only for selected IDEs

### File Classification

| Type | Definition | Location |
|------|-----------|----------|
| SHARED | Applies to all IDEs equally | `_opensquad/core/`, `templates/` (excluding `ide-templates/`) |
| IDE-SPECIFIC | Applies to one IDE only | `templates/ide-templates/{ide}/` |

### Supported IDEs and Their Template Folders

All nine live under `templates/ide-templates/`:

| IDE | Folder | Entry-point files |
|-----|--------|-------------------|
| Antigravity | `antigravity/` | `.agent/rules/`, `.agent/workflows/` |
| Claude Code | `claude-code/` | `.claude/skills/opensquad/SKILL.md`, `CLAUDE.md`, `.mcp.json` |
| Codex | `codex/` | `AGENTS.md`, `.agents/skills/opensquad/SKILL.md` |
| Cursor | `cursor/` | `.cursor/rules/opensquad.mdc`, `.cursor/commands/`, `.cursor/mcp.json` |
| Gemini CLI | `gemini-cli/` | `.gemini/` (settings **merged**, not copied) |
| OpenCode | `opencode/` | `AGENTS.md`, `.opencode/commands/` |
| Qwen Code | `qwen-code/` | `.qwen/` (settings **merged**, not copied) |
| Trae | `trae/` | `.trae/` |
| VS Code + Copilot | `vscode-copilot/` | `.github/prompts/`, `.vscode/settings.json` (**merged**) |

Three IDEs merge JSON settings instead of copying, to preserve pre-existing user config:
`mergeVsCodeSettings`, `mergeQwenSettings`, `mergeGeminiSettings` in `src/init.js`. If you add a
settings file for one of these IDEs, it must also be excluded from the plain-copy loop in
`copyIdeTemplates()`.

### The Golden Rule

> When a change is requested for a specific IDE, modify ONLY files inside `templates/ide-templates/{ide}/`.
> NEVER add conditional logic ("if antigravity, do X") to shared files.

**Violation example:**
- User asks: "Add sequential execution support for Antigravity in the pipeline."
- ❌ Wrong: Edit `_opensquad/core/runner.pipeline.md` adding `if antigravity: run sequentially`
- ✅ Correct: Edit `templates/ide-templates/antigravity/.agent/rules/opensquad.md` with the sequential execution instructions

**Legitimate shared file edit:**
- User asks: "Add a new researcher agent type to the architect."
- ✅ Fine: Edit `_opensquad/core/architect.agent.yaml` because the change benefits ALL IDEs equally.

Shared runtime files carry a banner (`> **SHARED FILE** — applies to ALL IDEs`). Preserve it.

## Verification Process

### Step 1: Detect what changed

```bash
# Uncommitted changes (staged + unstaged)
git diff --name-only HEAD

# If no uncommitted changes, check recent commits
git log --oneline -5
git diff --name-only HEAD~5..HEAD
```

Collect all changed file paths into a list.

### Step 2: Run applicable checks

Only run checks relevant to the actual changes detected.

#### Check A: Canonical source wiring (`_opensquad/core/**`, `_opensquad/config/**`, or `dashboard/**` changed)

These directories ship straight from the package root — no template copy is needed or wanted.

1. Confirm the changed file's top-level directory is listed in `src/init.js:CANONICAL_SOURCES`.
   If someone added e.g. `_opensquad/newthing/`, it will **not** be distributed until it is added there.
2. **FAIL** if a mirror was (re)created — verify these do NOT exist:
   ```bash
   test -d templates/_opensquad/core && echo "STALE MIRROR"
   test -d templates/skills && echo "STALE MIRROR"
   ```
   A mirror means edits silently diverge from what users receive. **Fix:** delete the mirror.
3. For `dashboard/**`: confirm the changed path is not swallowed by `DASHBOARD_EXCLUDES`.
4. `_opensquad/` is in `package.json files[]` — but note only `core/` and `config/` are copied to
   users. `_opensquad/.opensquad-version` at the repo root is stale leftover and is NOT the shipped
   version file (see Check H).

#### Check B: Skill registry integrity (`skills/**` changed)

There is **no** `templates/skills/` mirror — `installSkill()` copies the directory recursively, so
multi-file skills need nothing extra. Do not flag missing template counterparts.

For each changed skill:
1. `skills/{id}/SKILL.md` exists and the directory name matches `^[a-z0-9][a-z0-9-]*$`
   (enforced by `validateSkillId()` — a non-matching name is uninstallable).
2. Frontmatter parses under the hand-rolled regexes in `src/skills.js:getSkillMeta()`:
   `name`, optional `type`, `description` (inline or folded `>`), optional `description_pt-BR` /
   `description_es`, optional `env` list, optional `version`.
   A new frontmatter field requires a new regex there — it will be silently ignored otherwise.
3. If the skill declares `type: mcp` / `type: hybrid` or an `env` list, confirm the intent: `init`
   installs it unconditionally, but `update` will never backfill it for existing users.

#### Check C: Agent catalog (`agents/**` changed)

1. Verify `"agents/"` is in `package.json` `files[]` and `agents` is in
   `src/update.js:PROTECTED_PATHS` (users customize installed agents)
2. Each `agents/{id}/AGENT.md` parses under `src/agents.js:getAgentMeta()` with `name`, `icon`,
   `category`, `version`, `description`, plus `description_pt-BR` and `description_es`
3. Directory names match `^[a-z0-9][a-z0-9-]*$` — `validateAgentId()` makes a bad name uninstallable
4. `agents/_catalog.yaml` and the directories are in **exact** correspondence — every catalog `id`
   has a directory, and every directory is listed. A directory missing from the index is invisible
   to the Architect; an index entry with no directory sends it to a nonexistent file.
5. Every archetype keeps its `> **ARCHETYPE**` banner and `## Specialization Contract` section —
   these are what tell the Architect to specialize rather than copy verbatim
6. All of the above are enforced by `tests/agents.test.js`; run it rather than checking by hand

#### Check D: Init logic (`src/init.js` changed)

Verify all six copy stages are still called from `init()`, in order:
`copyCommonTemplates` → `copyCanonicalSources` → `copyIdeTemplates` → `installAllAgents` →
`installAllSkills` → `writeProjectReadme` (plus `installDependencies`, skipped when `_skipPrompts`
is set).

1. `getTemplateEntries()` still recurses the full tree
2. `copyCommonTemplates()` still excludes `/ide-templates/`
3. Flag any **new** filtering/skip logic — it silently removes files from every future install
4. Init is skip-if-exists by design; it must never overwrite a user file

#### Check E: Update logic (`src/update.js` changed)

1. Extract `PROTECTED_PATHS`; it must contain `_opensquad/_memory`, `agents`, `squads`
2. If a new **user-owned** top-level directory was introduced, it belongs here
3. Note: `_opensquad/_investigations` is *not* in the list. It is safe today only because update
   overwrites nothing that has no counterpart in `templates/`. If investigation files are ever added
   to `templates/`, add the path to `PROTECTED_PATHS` first.
4. Verify the skill backfill loop still skips `opensquad-skill-creator`, `type: mcp`, and `type: hybrid`
5. Verify the agent backfill installs only archetypes **missing** from the target — installing
   unconditionally would overwrite user customizations that `PROTECTED_PATHS` exists to defend
6. Update must back up before overwriting (`backupIfExists` → `.bak`)

#### Check F: Package manifest (`package.json` changed)

1. Parse `files[]`; it must contain: `bin/`, `src/`, `agents/`, `skills/`, `templates/`,
   `_opensquad/`, `dashboard/`
2. Any distributable root directory missing from `files[]` is a **FAIL**
3. Verify the `version` script is intact — it regenerates
   `templates/_opensquad/.opensquad-version` and stages it (see Check H)

#### Check G: New top-level directory (any new directory at root)

For each new root directory, it must be classified as exactly one of:
- **Distributed** → in `package.json files[]`, and reached by a template copy or `CANONICAL_SOURCES`
- **User-owned** → in `PROTECTED_PATHS`
- **Repo-only** → in `.npmignore`/`files[]` exclusion (e.g. `docs/`, `tests/`, `temp/`, `test-results/`)

Flag anything that is distributed but unreachable by any copy mechanism — the classic silent failure.

#### Check H: Version file (`package.json` version bumped, or `.opensquad-version` touched)

1. The shipped version file is `templates/_opensquad/.opensquad-version`, read by `src/update.js`
2. It is generated by the `version` npm script on `npm version` — **never hand-edit it**
3. It must match `package.json` `version`; a mismatch makes update report the wrong version
4. Root `_opensquad/.opensquad-version` is stale and unused — do not "fix" it by syncing

#### Check I: Localization (`src/**` changed with new user-facing strings)

1. Every user-facing CLI string goes through `t()` from `src/i18n.js` — flag raw literals
2. Any new key must exist in all three of `src/locales/{en,pt-BR,es}.json`
   (`en.json` is the fallback; a key missing there renders as the raw key name)

#### Check J: IDE contamination in shared files (any `_opensquad/core/**` or `templates/**` changed, excluding `templates/ide-templates/**`)

Scan shared files for IDE-specific conditional logic that should live in `templates/ide-templates/{ide}/` instead.

**Files to scan:**
- All files in `_opensquad/core/`
- All files in `templates/` EXCEPT those under `templates/ide-templates/`

**What to look for:** Content that says "do X for IDE Y" or "if using IDE Y, behave differently."

**Contamination keywords** (IDE names used as conditional subjects):
- `antigravity`, `cursorrules` or `.cursor/`, `windsurf`, `opencode` or `open-code`, `codex`,
  `qwen`, `gemini`, `trae`, `copilot`
- Conditional patterns: "se antigravity", "if antigravity", "for antigravity", "if cursor",
  "if windsurf", "if codex"

**Exclusions:** Mentions inside this opensquad-dev SKILL.md itself (documentation), and any comment
explicitly labeled as a cross-reference.

**Pass:** No IDE-specific conditional logic found in shared files.
**Fail:** Report the file path, relevant line, and the correct `templates/ide-templates/{ide}/` file
where the change should go instead.

#### Check K: Dashboard state contract (`_opensquad/core/runner.pipeline.md` or `dashboard/src/types/state.ts` changed)

The runner and the dashboard communicate only through `squads/{name}/state.json`.

1. The JSON shape written in `runner.pipeline.md` (initialize-state step) must match the types in
   `dashboard/src/types/state.ts`
2. `isValidState()` in `dashboard/src/plugin/squadWatcher.ts` silently **drops** malformed states —
   a mismatch produces no error, just a dead dashboard
3. If a required field was added or renamed on one side, it is a **FAIL** until both sides agree

### Step 3: Report results

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 opensquad Dev Checklist
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files changed: {N}
Checks run: {N}

✅ Check A: Canonical sources — no stale mirrors, all paths wired
❌ Check B: Skill registry — skills/{x}/SKILL.md frontmatter has unparsed field 'foo'
   Fix: add a regex for 'foo' in src/skills.js:getSkillMeta()
✅ Check F: Package manifest — all directories present
✅ Check J: IDE contamination — no IDE-specific logic in shared files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Result: {N} issues found
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If ALL checks pass:
```
✅ All {N} checks passed — distribution is consistent.
```

If any check fails, list the fix commands at the end so the user can approve them in batch.

### Step 4: Confirm nothing regressed

Distribution changes are covered by the test suite — `tests/init.test.js` and `tests/update.test.js`
assert the copy behavior against a real temp directory.

```bash
npm test && npm run lint
```

Never run `npx opensquad init` inside this repository to verify — it copies `templates/` over the
repo root and mixes distribution output with source. Use a scratch directory, or
`init(tempDir, { _skipPrompts: true })` as the tests do.
