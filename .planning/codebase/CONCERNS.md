# Codebase Concerns

**Analysis Date:** 2026-03-24

## Tech Debt

**Template sync is split across `src/init.js` and `src/update.js`:**
- Issue: Initialization and update both implement recursive template copying, IDE-specific overlays, and special-case path preservation independently.
- Files: `src/init.js`, `src/update.js`
- Why: The project grew from setup-first flows, so update logic was layered on top of init logic.
- Impact: New template paths or IDE variants can drift between init and update, causing different project states depending on when a squad was created.
- Fix approach: Extract a single template-sync manifest and reuse it in both code paths.

**Frontmatter parsing is hand-rolled in `src/skills.js` and `src/agents.js`:**
- Issue: Metadata is parsed with regex instead of a YAML parser.
- Files: `src/skills.js`, `src/agents.js`
- Why: Quick parsing of simple frontmatter was enough for the current bundle layout.
- Impact: Small format changes, multiline values, or richer YAML features can silently break listing and version detection.
- Fix approach: Parse frontmatter with a real YAML parser and validate the schema explicitly.

## Known Bugs

**Run history ordering is string-based:**
- Symptoms: `opensquad runs` can show newer runs after older ones if `runId` is not lexicographically sortable.
- Trigger: Any run IDs that are not zero-padded timestamps or that mix formats.
- Workaround: None; users have to inspect the directory manually.
- Root cause: `src/runs.js` sorts by `runId.localeCompare()` instead of a timestamp or mtime.

## Security Considerations

**Setup shells out to package managers and browser installers:**
- Risk: `src/init.js` runs `npm install` and `npx playwright install chromium`, which can execute dependency lifecycle scripts and pull code from the network.
- Files: `src/init.js`
- Current mitigation: The commands run only during explicit setup and use the target project directory as `cwd`.
- Recommendations: Make dependency installation opt-in or document it clearly, and consider safer install modes for non-interactive bootstrap.

**Dashboard snapshot endpoint is unauthenticated and filesystem-backed:**
- Risk: `dashboard/src/plugin/squadWatcher.ts` exposes squad names and state from the local workspace to any client that can reach the dev server.
- Files: `dashboard/src/plugin/squadWatcher.ts`, `dashboard/src/hooks/useSquadSocket.ts`
- Current mitigation: The design assumes local development on loopback.
- Recommendations: Bind and advertise the server as local-only, and add an access check if the dashboard is ever reverse-proxied.

## Performance Bottlenecks

**Snapshot generation rescans the whole squads tree repeatedly:**
- Problem: Every new websocket connection and `squad.yaml` refresh rebuilds the full snapshot.
- Measurement: Not benchmarked; cost grows linearly with number of squads and active state files.
- Cause: `discoverSquads()` and `readActiveStates()` each walk the directory tree and parse every relevant file.
- Improvement path: Cache parsed squad metadata, debounce snapshot rebuilds, and update only the changed squad on file events.
- Files: `dashboard/src/plugin/squadWatcher.ts`

**Polling fallback can create steady background traffic:**
- Problem: After repeated websocket failures, each dashboard client polls `/api/snapshot` every 3 seconds.
- Measurement: 1 request per client every 3s until the websocket recovers.
- Cause: `dashboard/src/hooks/useSquadSocket.ts` keeps reconnecting while also starting the polling loop.
- Improvement path: Back off polling more aggressively or stop reconnect attempts after a longer outage.
- Files: `dashboard/src/hooks/useSquadSocket.ts`

## Fragile Areas

**Template overwrite rules are easy to get wrong:**
- Why fragile: `src/update.js` protects only a short list of directories, while everything else under `templates/` is copied over the user project.
- Common failures: Adding a new persistent folder to templates and forgetting to add it to `PROTECTED_PATHS`, or unintentionally overwriting user edits in generated files.
- Safe modification: Treat file ownership as a manifest, not a hard-coded exclusion list.
- Test coverage: There are preservation tests for `_memory`, `_investigations`, and `squads`, but not for new template subtrees.
- Files: `src/update.js`, `tests/update.test.js`

**Dashboard state validation is shallow:**
- Why fragile: `dashboard/src/plugin/squadWatcher.ts` accepts any object with `status`, `step`, and `agents`, but does not validate nested fields like `step.current`, `step.total`, or agent desk positions.
- Common failures: Bad `state.json` data can reach the UI and break rendering or produce misleading cards.
- Safe modification: Validate `state.json` with a schema before broadcasting it, and reject partial shapes early.
- Test coverage: No integration tests for malformed `state.json` or `squad.yaml`.
- Files: `dashboard/src/plugin/squadWatcher.ts`, `dashboard/src/types/state.ts`

## Scaling Limits

**Local file-watching model:**
- Current capacity: Fine for a handful of squads, unmeasured beyond that.
- Limit: Full-tree scans and repeated YAML/JSON parsing become noticeable as the workspace grows.
- Symptoms at limit: Slow dashboard connect time, delayed live updates, and higher CPU use on the dev host.
- Scaling path: Incremental indexing, cached snapshots, and fewer full rebuilds.
- Files: `dashboard/src/plugin/squadWatcher.ts`

## Dependencies at Risk

**Pixi render stack is tightly version-coupled:**
- Risk: `@pixi/react` and `pixi.js` need compatible major versions, and the dashboard build is sensitive to rendering API changes.
- Impact: Upgrade churn can break the virtual office scene or the custom `extend(...)` setup.
- Migration plan: Upgrade the render stack together and keep a smoke test around `dashboard/src/office/OfficeScene.tsx` and `dashboard/src/office/AgentDesk.tsx`.
- Files: `dashboard/package.json`, `dashboard/src/office/OfficeScene.tsx`, `dashboard/src/office/AgentDesk.tsx`

## Missing Critical Features

**No schema gate for runtime state files:**
- Problem: The watcher trusts `squad.yaml` and `state.json` enough to render them, but there is no formal schema validation step.
- Current workaround: Best-effort parsing and silent skips on exceptions.
- Blocks: Safer evolution of the pipeline runner format and better error reporting in the dashboard.
- Implementation complexity: Medium; add a shared schema and validate on write/read.
- Files: `dashboard/src/plugin/squadWatcher.ts`, `dashboard/src/types/state.ts`

## Test Coverage Gaps

**Dashboard dev-server behavior is largely untested:**
- What's not tested: Websocket connection handling, polling fallback, malformed file events, and server-side snapshot generation.
- Risk: Regressions in the live dashboard can slip through because only the CLI bootstrap flows are exercised.
- Priority: High
- Difficulty to test: Requires a running Vite server, filesystem events, and websocket clients.
- Files: `dashboard/src/plugin/squadWatcher.ts`, `dashboard/src/hooks/useSquadSocket.ts`

**Shell-out install paths lack failure-mode coverage:**
- What's not tested: `npm install`, `npx playwright install chromium`, and partial-copy failures during init/update.
- Risk: A transient network or package-manager failure can leave a project half-initialized without a clear recovery path.
- Priority: Medium
- Difficulty to test: The code currently expects the external commands to succeed and uses real process execution.
- Files: `src/init.js`, `src/update.js`, `tests/init.test.js`, `tests/update.test.js`

*Concerns audit: 2026-03-24*
*Update as issues are fixed or new ones discovered*
