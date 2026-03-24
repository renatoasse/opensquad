# Architecture

**Analysis Date:** 2026-03-24

## Pattern Overview

**Overall:** File-based CLI distribution with a catalog-driven installer and a companion React dashboard

**Key Characteristics:**
- `bin/opensquad.js` is a thin command router over project bootstrap, updates, catalog management, and run listing.
- Most behavior is I/O bound: copying templates, reading/writing Markdown and JSON, and scanning project directories.
- Runtime state is persisted in the target workspace under `_opensquad/` and `squads/`, not in a service or database.
- The dashboard is a separate Vite app in `dashboard/`, with a matching scaffold in `templates/dashboard/` for generated projects.

## Layers

**CLI Shell:**
- Purpose: Parse top-level subcommands and dispatch to the correct operation.
- Contains: `bin/opensquad.js`.
- Depends on: Project operations in `src/init.js`, `src/update.js`, `src/skills-cli.js`, `src/agents-cli.js`, and `src/runs.js`.
- Used by: End users invoking `npx opensquad ...`.

**Project Bootstrap and Maintenance:**
- Purpose: Initialize a project, copy shipped assets, and keep user projects aligned with new releases.
- Contains: `src/init.js`, `src/update.js`, `src/readme/README.md`, `templates/_opensquad/`, `templates/dashboard/`, `templates/ide-templates/*`.
- Depends on: Shared locale, prompt, catalog, and logging helpers.
- Used by: `init` and `update` CLI commands.

**Catalog Management:**
- Purpose: Manage bundled skills and bundled agents as installable file assets.
- Contains: `src/skills.js`, `src/skills-cli.js`, `skills/*`, `src/agents.js`, `src/agents-cli.js`.
- Depends on: Node filesystem APIs plus metadata parsing from `SKILL.md` and `AGENT.md` frontmatter.
- Used by: `install`, `uninstall`, `skills`, `agents`, and update flows.

**Shared Services:**
- Purpose: Centralize reusable concerns across commands.
- Contains: `src/i18n.js`, `src/prompt.js`, `src/logger.js`, `src/runs.js`.
- Depends on: Locale JSON files in `src/locales/` and the on-disk project layout under `squads/` and `_opensquad/`.
- Used by: Bootstrap, update, skills, agents, and run-listing commands.

**Dashboard Runtime:**
- Purpose: Render live squad state and keep the UI synchronized with filesystem changes.
- Contains: `dashboard/src/App.tsx`, `dashboard/src/main.tsx`, `dashboard/src/plugin/squadWatcher.ts`, `dashboard/src/hooks/useSquadSocket.ts`, `dashboard/src/store/useSquadStore.ts`.
- Depends on: Vite, React 19, Zustand, Pixi, `ws`, `chokidar`, and the project `squads/` directory.
- Used by: The generated dashboard app in a user project and the mirrored scaffold in `templates/dashboard/`.

## Data Flow

**`npx opensquad init`:**
1. `bin/opensquad.js` parses `init` and calls `src/init.js`.
2. `src/init.js` checks whether `_opensquad/` already exists in the target project.
3. Prompts collect language, user name, and IDE choices unless test mode skips prompts.
4. Common files are copied from `templates/`, then IDE-specific files are copied from `templates/ide-templates/*`.
5. Bundled skills are installed from `skills/*`, and the install README is written from `src/readme/README.md`.
6. Preferences are persisted to `_opensquad/_memory/preferences.md`, and the action is logged to `_opensquad/logs/cli.log`.

**`npx opensquad update`:**
1. `bin/opensquad.js` dispatches to `src/update.js`.
2. `src/update.js` reads the installed version from `_opensquad/.opensquad-version` and the bundled version from `templates/_opensquad/.opensquad-version`.
3. It copies non-protected template files, then replays IDE-specific templates based on saved preferences.
4. It installs newly bundled non-MCP skills that are not already present in the target project.
5. It logs the update and reports the number of files refreshed.

**Dashboard Sync:**
1. The Vite dev server in `dashboard/vite.config.ts` registers `dashboard/src/plugin/squadWatcher.ts`.
2. The plugin watches `squads/` and exposes a websocket at `/__squads_ws` plus an HTTP fallback at `/api/snapshot`.
3. `dashboard/src/hooks/useSquadSocket.ts` connects, reconnects with backoff, and falls back to polling if the socket keeps failing.
4. `dashboard/src/store/useSquadStore.ts` holds the current squad list, active states, and selection state for the React UI.

**State Management:**
- Persistent workspace state lives in `_opensquad/_memory/`, `_opensquad/logs/`, and `squads/<name>/`.
- The CLI is mostly stateless between invocations; it reconstructs state from files on each run.
- The dashboard keeps transient UI state in Zustand and treats the filesystem snapshot as source of truth.

## Key Abstractions

**Template Payload:**
- Purpose: Versioned files copied into user projects during `init` and `update`.
- Examples: `templates/_opensquad/core/runner.pipeline.md`, `templates/dashboard/src/App.tsx`, `templates/ide-templates/codex/AGENTS.md`.
- Pattern: Static file bundle mirrored into the target workspace.

**Catalog Item:**
- Purpose: Installable skill or agent definition with metadata and optional scripts.
- Examples: `skills/apify/SKILL.md`, `skills/instagram-publisher/SKILL.md`, `skills/opensquad-skill-creator/SKILL.md`.
- Pattern: Markdown file with YAML frontmatter plus directory-local assets.

**Workspace Record:**
- Purpose: User/project state that the CLI and dashboard read back later.
- Examples: `_opensquad/_memory/preferences.md`, `_opensquad/logs/cli.log`, `squads/<name>/output/<runId>/state.json`.
- Pattern: File-backed record with simple parse-and-fallback handling.

**Live Squad Snapshot:**
- Purpose: Transport current squad metadata and active state to the dashboard.
- Examples: `dashboard/src/types/state.ts`, `dashboard/src/plugin/squadWatcher.ts`.
- Pattern: JSON snapshot plus incremental websocket messages.

## Entry Points

**CLI Entry:**
- Location: `bin/opensquad.js`.
- Triggers: `npx opensquad <command>`.
- Responsibilities: Dispatch to init, update, skills, agents, and runs flows.

**Dashboard Entry:**
- Location: `dashboard/src/main.tsx`.
- Triggers: `vite` or `vite build` in `dashboard/`.
- Responsibilities: Mount `App` and load global styles.

**Dashboard Dev Server Hook:**
- Location: `dashboard/src/plugin/squadWatcher.ts`.
- Triggers: Vite dev-server startup.
- Responsibilities: Watch filesystem changes, serve snapshots, and broadcast squad updates.

## Error Handling

**Strategy:** Fail fast at the command boundary, but degrade gracefully for missing or malformed workspace files.

**Patterns:**
- CLI wrappers return `{ success: false }` or set `process.exitCode = 1` when a command cannot complete.
- Install/update helpers validate IDs and surface missing bundled assets with explicit `Error` messages.
- `src/logger.js` swallows its own failures so logging never blocks the operation.
- Run listing, locale loading, and dashboard snapshot reads ignore missing files and malformed JSON/YAML when a safe fallback exists.

## Cross-Cutting Concerns

**Logging:**
- `src/logger.js` appends JSONL events to `_opensquad/logs/cli.log`.
- Major CLI flows log lifecycle events such as `init`, `update`, `skill:*`, and `agent:*`.

**Validation:**
- Skill and agent IDs are constrained to lowercase kebab-case patterns in `src/skills.js` and `src/agents.js`.
- Dashboard state validation is intentionally shallow in `dashboard/src/plugin/squadWatcher.ts` so bad files do not crash the UI.

**Localization:**
- `src/i18n.js` loads `src/locales/en.json`, `src/locales/pt-BR.json`, and `src/locales/es.json`.
- User language preference is persisted in `_opensquad/_memory/preferences.md` and reused on later commands.

**Version Synchronization:**
- `package.json` exposes the current CLI package version.
- `templates/_opensquad/.opensquad-version` is the bundled version source used by `src/update.js`.

*Architecture analysis: 2026-03-24*
*Update when major patterns change*
