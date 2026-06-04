# Eliminate Template Duplication

**Date:** 2026-03-27
**Status:** Approved

## Problem

`templates/_opensquad/core/`, `templates/_opensquad/config/`, and `templates/dashboard/` are manual copies of their canonical counterparts at the repo root. They already diverge (e.g., `architect.agent.yaml` differs between the two `core/` directories), causing users to receive stale versions on `init`/`update`.

This violates the project's own principle: "_opensquad/core/ is the canonical source — never apply palliative patches on installed instances."

## Solution

Use canonical source directories directly in `init.js` and `update.js`, eliminating the duplicated template copies.

### Source Mapping

| Destination (user project)   | Current source (template)          | New source (canonical)         |
|------------------------------|------------------------------------|--------------------------------|
| `_opensquad/core/*`          | `templates/_opensquad/core/`       | `_opensquad/core/`             |
| `_opensquad/config/*`        | `templates/_opensquad/config/`     | `_opensquad/config/`           |
| `dashboard/*`                | `templates/dashboard/`             | `dashboard/`                   |

### What stays in `templates/`

- `_opensquad/_memory/` — clean scaffold for new projects
- `_opensquad/_investigations/` — clean scaffold for new projects
- `_opensquad/.opensquad-version` — distribution version marker
- `ide-templates/` — IDE-specific config files
- `skills/` — bundled skill templates
- `squads/` — example squad scaffolding
- `package.json` — user project package.json
- `.gitignore` — user project gitignore

## Implementation

### New constant

```js
const PACKAGE_ROOT = join(__dirname, '..');
```

### New shared function: `copyCanonicalSources()`

Copies files from the three canonical directories to the target project:

```js
const CANONICAL_SOURCES = [
  { src: join(PACKAGE_ROOT, '_opensquad', 'core'), dest: join('_opensquad', 'core') },
  { src: join(PACKAGE_ROOT, '_opensquad', 'config'), dest: join('_opensquad', 'config') },
  { src: join(PACKAGE_ROOT, 'dashboard'), dest: 'dashboard' },
];

const DASHBOARD_EXCLUDES = [
  'node_modules',
  'dist',
  'tsconfig.tsbuildinfo',
  'squads',
];
```

- For `init`: skip files that already exist (same as current `copyCommonTemplates` behavior)
- For `update`: backup existing files before overwriting, respect `PROTECTED_PATHS`
- Dashboard copy excludes local-only artifacts: `node_modules/`, `dist/`, `tsconfig.tsbuildinfo`, `squads/`

### Changes to `init.js`

1. Add `PACKAGE_ROOT` and `CANONICAL_SOURCES` constants
2. Add and export `copyCanonicalSources(targetDir, { overwrite: false })` function
3. Call `copyCanonicalSources()` in `init()` after `copyCommonTemplates()`
4. `copyCommonTemplates()` unchanged — it already skips `ide-templates/`, and the removed dirs simply won't exist in `templates/` anymore

### Changes to `update.js`

1. Import `copyCanonicalSources` from `init.js`
2. Call `copyCanonicalSources(targetDir, { overwrite: true })` after the existing template copy loop
3. The overwrite mode uses `backupIfExists()` before copying, same as current update behavior
4. Respects existing `PROTECTED_PATHS`

### Filesystem deletions

- Delete `templates/_opensquad/core/` (entire directory)
- Delete `templates/_opensquad/config/` (entire directory)
- Delete `templates/dashboard/` (entire directory)

## What does NOT change

- `templates/_opensquad/_memory/` — stays (clean scaffold)
- `templates/_opensquad/_investigations/` — stays (clean scaffold)
- `templates/_opensquad/.opensquad-version` — stays
- IDE templates logic — unchanged
- Skills installation logic — unchanged
- Protected paths logic — unchanged
- Version comparison logic in `update.js` — unchanged (still reads from `templates/_opensquad/.opensquad-version`)

## Risk Assessment

- **Low risk:** `init.js` and `update.js` are the only consumers of these template paths
- **No behavioral change for users:** They receive the same files, just from the canonical source
- **Existing tests:** Should continue to pass — the test suite uses `_skipPrompts` and targets a temp directory
- **npm pack:** `_opensquad/core/`, `_opensquad/config/`, and `dashboard/` are already included in the package (they're in the repo root, not gitignored)
