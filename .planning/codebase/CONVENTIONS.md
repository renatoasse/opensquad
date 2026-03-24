# Coding Conventions

**Analysis Date:** 2026-03-24

## Naming Patterns

**Files:**
- Runtime modules in `src/` and `bin/` use lowercase file names, usually kebab-case when the file has a role suffix, like `src/skills-cli.js` and `src/agents-cli.js`.
- Test files live in `tests/` and end with `.test.js`, for example `tests/init.test.js` and `tests/update.test.js`.
- Generated or bundled content keeps domain-specific names in place, such as `src/locales/en.json`, `skills/*/SKILL.md`, and `agents/*/AGENT.md`.

**Functions:**
- Functions use camelCase everywhere in `src/` and `tests/`, including async functions like `loadSavedLocale`, `installSkill`, and `listRuns`.
- Command handlers and orchestration helpers often use verb-led names such as `runInstall`, `runUpdate`, `logEvent`, and `printRuns`.
- Small private helpers stay local to the module and are not prefixed with `_`.

**Variables:**
- Variables use camelCase.
- Constants use UPPER_SNAKE_CASE, such as `TEMPLATES_DIR`, `BUNDLED_SKILLS_DIR`, `MAX_RUNS`, and `PROTECTED_PATHS`.
- Module-scoped caches use descriptive names like `metaCache` rather than private-member conventions.

**Types:**
- The runtime code in `src/` is plain JavaScript, not TypeScript.
- Object shapes are documented by usage instead of formal interfaces or type aliases.
- Test data is usually represented as inline objects or constants such as `SAMPLE_SKILL_MD` in `tests/skills.test.js`.

## Code Style

**Formatting:**
- The project code under `src/`, `bin/`, and `tests/` uses single quotes, 2-space indentation, and semicolons omitted.
- ESM syntax is used throughout, with `import`/`export` and top-level `await` in `bin/opensquad.js`.
- Path handling is explicit and cross-platform, using `node:path` helpers like `join`, `dirname`, `relative`, `resolve`, and `sep`.

**Linting:**
- ESLint is configured in `eslint.config.js` with `@eslint/js` recommended rules and Node globals.
- Lint coverage targets `src/**/*.js`, `bin/**/*.js`, and `tests/**/*.js`.
- The repository uses `npm run lint` for validation.

## Import Organization

**Order:**
1. Node builtins first, usually from `node:*`, such as `node:fs/promises`, `node:path`, `node:url`, and `node:child_process`.
2. Local relative modules next, for example `./i18n.js`, `./skills.js`, and `../src/init.js`.

**Grouping:**
- Imports are kept as compact as possible, with no extra alias layer or barrel indirection in the runtime modules.
- The code generally avoids mixed import styles inside a single file.

**Path Aliases:**
- No path aliases are defined in `package.json` or `eslint.config.js`.
- Runtime modules resolve their own directory with `fileURLToPath(import.meta.url)` and build paths from there.

## Error Handling

**Patterns:**
- Expected filesystem misses are handled with `catch` blocks that return safe defaults such as `[]`, `null`, or `false`.
- Missing registry entries throw explicit errors with context, for example `new Error(..., { cause: err })` in `src/skills.js` and `src/agents.js`.
- CLI entrypoints catch user-facing failures and print translated messages rather than surfacing stack traces.

**Error Types:**
- `ENOENT` is treated as a normal branch for absent installs, missing version files, and absent logs.
- Invalid identifiers are rejected early with a regex guard in `validateSkillId()` and `validateAgentId()`.
- Silent failure is intentional for non-critical paths such as logging in `src/logger.js`.

## Logging

**Framework:**
- Logging is plain JSONL written by `src/logger.js` to `_opensquad/logs/cli.log`.
- `logEvent()` appends one JSON object per line, and `readCliLogs()` reads the same format back.

**Patterns:**
- Logging is best-effort and must not block the operation being performed.
- User-visible status remains `console.log`-based in CLI modules like `src/init.js`, `src/skills-cli.js`, and `src/agents-cli.js`.
- Log records are structured with `timestamp`, `action`, and `details`.

## Comments

**When to Comment:**
- Comments explain intent, exceptional branching, or file-copy exceptions, for example why `ide-templates/` is skipped in `src/init.js` and `src/update.js`.
- Short comments are used for edge cases such as cached metadata, protected paths, or compatibility branches.
- The code avoids narrating obvious statements.

**JSDoc/TSDoc:**
- Public APIs are not documented with JSDoc in the current codebase.
- Behavior is inferred from code and tests rather than formal API comments.

**TODO Comments:**
- No consistent TODO tagging convention is present in the sampled files.

## Function Design

**Size:**
- Functions are usually small and single-purpose, especially in `src/agents.js`, `src/skills.js`, and `src/runs.js`.
- Larger workflows are decomposed into a public orchestrator plus private helpers, as seen in `src/init.js` and `src/update.js`.

**Parameters:**
- Simple helpers take positional parameters.
- Configuration-heavy helpers use an options object, for example `update(targetDir)` and `readCliLogs({ action, limit } = {}, targetDir = process.cwd())`.

**Return Values:**
- Functions return plain data, such as arrays, objects, or `success` booleans.
- Early returns are common for guard clauses, missing files, and unsupported commands.

## Module Design

**Exports:**
- Named exports are preferred across runtime modules, such as `export async function init(...)` and `export function t(...)`.
- Modules that are primarily CLI wrappers expose one public entrypoint like `skillsCli()` or `agentsCli()`.

**Barrel Files:**
- No barrel files are used in `src/`.
- Callers import directly from the owning module, such as `../src/update.js` or `./skills.js`.

*Convention analysis: 2026-03-24*
*Update when patterns change*
