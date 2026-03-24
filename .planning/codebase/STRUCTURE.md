# Codebase Structure

**Analysis Date:** 2026-03-24

## Directory Layout

```text
opensquad/
├── bin/                 # CLI executable entry points
├── dashboard/           # Live React/Vite dashboard app
├── skills/              # Bundled skill catalog and skill assets
├── src/                 # CLI implementation and shared runtime helpers
├── templates/           # Files copied into initialized projects
├── _opensquad/          # Versioned runtime core used by initialized projects
├── tests/               # Node test suite for CLI/runtime modules
├── README.md            # Primary project documentation
├── CONTRIBUTING.md      # Contribution notes
├── CLAUDE.md            # Repo-specific agent instructions
├── package.json         # Root package manifest
├── package-lock.json    # Root lockfile
├── eslint.config.js     # Lint configuration
└── dashboard/package.json # Dashboard workspace manifest
```

## Directory Purposes

**`bin/`:**
- Purpose: Installable command-line entry points.
- Contains: `opensquad.js`.
- Key files: `bin/opensquad.js` dispatches all top-level CLI subcommands.
- Subdirectories: None.

**`src/`:**
- Purpose: Core CLI logic, locale handling, logging, and project file operations.
- Contains: `*.js` source files plus `src/locales/*.json` and `src/readme/README.md`.
- Key files: `src/init.js`, `src/update.js`, `src/skills.js`, `src/agents.js`, `src/logger.js`, `src/i18n.js`.
- Subdirectories: `locales/` for translations and `readme/` for the installed README template.

**`dashboard/`:**
- Purpose: The runnable 2D squad dashboard used during local development.
- Contains: React components, hooks, Zustand store, Vite plugin, office drawing helpers, and styles.
- Key files: `dashboard/src/main.tsx`, `dashboard/src/App.tsx`, `dashboard/src/plugin/squadWatcher.ts`, `dashboard/vite.config.ts`.
- Subdirectories: `src/components/`, `src/hooks/`, `src/lib/`, `src/office/`, `src/plugin/`, `src/store/`, `src/styles/`, `src/types/`.

**`templates/`:**
- Purpose: The install/update payload copied into a user workspace.
- Contains: `_opensquad/` runtime files, `dashboard/` scaffold files, IDE-specific instructions, and `templates/package.json`.
- Key files: `templates/_opensquad/core/runner.pipeline.md`, `templates/_opensquad/core/skills.engine.md`, `templates/dashboard/src/App.tsx`, `templates/ide-templates/claude-code/CLAUDE.md`, `templates/ide-templates/codex/AGENTS.md`.
- Subdirectories: `_opensquad/`, `dashboard/`, and `ide-templates/`.

**`_opensquad/`:**
- Purpose: Bundled runtime core tracked in the repo and mirrored into initialized projects.
- Contains: Core prompts, runner instructions, best-practice docs, config files, and version metadata.
- Key files: `_opensquad/core/runner.pipeline.md`, `_opensquad/core/skills.engine.md`, `_opensquad/core/architect.agent.yaml`, `_opensquad/config/playwright.config.json`.
- Subdirectories: `core/`, `core/best-practices/`, `core/prompts/`, `config/`.

**`skills/`:**
- Purpose: Bundled skill registry for install/update operations.
- Contains: One directory per skill with `SKILL.md`, plus optional scripts, assets, references, and eval tooling.
- Key files: `skills/README.md`, `skills/apify/SKILL.md`, `skills/instagram-publisher/SKILL.md`, `skills/opensquad-skill-creator/SKILL.md`.
- Subdirectories: Skill folders such as `image-generator/`, `image-fetcher/`, `opensquad-skill-creator/`, each with their own helper assets.

**`tests/`:**
- Purpose: Node test coverage for the CLI modules.
- Contains: `*.test.js` files.
- Key files: `tests/init.test.js`, `tests/update.test.js`, `tests/skills.test.js`, `tests/agents.test.js`.
- Subdirectories: None.

## Key File Locations

**Entry Points:**
- `bin/opensquad.js` - primary CLI executable.
- `dashboard/src/main.tsx` - dashboard React entry.
- `dashboard/vite.config.ts` - dashboard dev/build configuration entry.

**Configuration:**
- `package.json` - root package metadata, scripts, and published file list.
- `dashboard/package.json` - dashboard workspace scripts and dependencies.
- `eslint.config.js` - root lint rules.
- `dashboard/tsconfig.json` - dashboard TypeScript config.
- `templates/package.json` - package scaffold copied into initialized projects.

**Core Logic:**
- `src/init.js` - project setup, template copying, locale selection, and preference persistence.
- `src/update.js` - in-place upgrade flow for templates and bundled skills.
- `src/skills.js` - bundled skill registry and file install/remove helpers.
- `src/agents.js` - bundled agent registry and file install/remove helpers.
- `src/runs.js` - run history scanning and display.
- `dashboard/src/plugin/squadWatcher.ts` - filesystem watcher and snapshot transport.

**Testing:**
- `tests/*.test.js` - unit tests for init, update, skills, agents, logging, i18n, and run listing.

**Documentation:**
- `README.md` - user-facing overview and usage guide.
- `CONTRIBUTING.md` - contribution workflow guidance.
- `CLAUDE.md` - agent instructions for this repository.
- `skills/README.md` - skill catalog documentation.
- `src/readme/README.md` - README template written into initialized projects.

## Naming Conventions

**Files:**
- `*.js` in `src/` and `bin/` for Node runtime modules.
- `*.json` in `src/locales/` for translation strings.
- `SKILL.md` for bundled skill definitions.
- `AGENT.md` for bundled agent definitions and `*.agent.md` for installed agent files in user projects.
- `*.tsx` for React components in `dashboard/src/`.

**Directories:**
- Kebab-case for almost all directories, including `dashboard/`, `skills/`, `templates/`, and skill IDs like `image-generator/`.
- Plural collection directories for grouped content such as `skills/`, `tests/`, and `templates/`.

**Special Patterns:**
- `index` files are not used as directory exports here; imports are explicit.
- `templates/dashboard/` mirrors `dashboard/` so initialized projects receive a copy of the UI app.
- `templates/_opensquad/` mirrors `_opensquad/` so release updates can copy versioned runtime files.

## Where to Add New Code

**New Feature:**
- Primary code: `src/` for CLI behavior, or `dashboard/src/` for UI behavior.
- Tests: `tests/` for Node modules, or the dashboard workspace’s own tests if added later.
- Config if needed: `package.json`, `dashboard/package.json`, `dashboard/vite.config.ts`, or `eslint.config.js`.

**New Component/Module:**
- Implementation: `dashboard/src/components/`, `dashboard/src/lib/`, `dashboard/src/office/`, or `src/`.
- Types: `dashboard/src/types/` for dashboard data contracts.
- Tests: `tests/` for CLI-side helpers; add dashboard tests alongside the dashboard workspace if introduced.

**New Route/Command:**
- Definition: `bin/opensquad.js`.
- Handler: `src/init.js`, `src/update.js`, `src/skills-cli.js`, `src/agents-cli.js`, or `src/runs.js`.
- Tests: `tests/*.test.js`.

**Utilities:**
- Shared helpers: `src/logger.js`, `src/i18n.js`, `src/prompt.js`, `dashboard/src/lib/`, and `dashboard/src/hooks/`.
- Type definitions: `dashboard/src/types/`.

## Special Directories

**`templates/dashboard/`:**
- Purpose: Generated dashboard scaffold copied into user projects.
- Source: Mirrors the live `dashboard/` app structure.
- Committed: Yes.

**`templates/ide-templates/`:**
- Purpose: IDE-specific startup files such as `CLAUDE.md`, `AGENTS.md`, and other editor instructions.
- Source: Copied selectively during `init` and `update`.
- Committed: Yes.

**`_opensquad/`:**
- Purpose: Versioned runtime core assets that ship with the repo and are copied into target workspaces.
- Source: Maintained in-repo under `_opensquad/` and `templates/_opensquad/`.
- Committed: Yes.

**`dashboard/src/plugin/squadWatcher.ts`:**
- Purpose: Vite dev-server plugin for websocket and HTTP snapshot delivery.
- Source: Used only by the dashboard dev/build workflow.
- Committed: Yes.

*Structure analysis: 2026-03-24*
*Update when directory structure changes*
