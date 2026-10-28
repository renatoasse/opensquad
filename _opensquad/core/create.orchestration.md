# Create Squad — Phased Orchestration

<!-- SHARED — applies to ALL IDEs. Do not add IDE-specific logic here.
     For IDE-specific behavior: templates/ide-templates/{ide}/ only. -->

This file is the single source of truth for the `/opensquad create` flow. Every IDE entry point (SKILL.md, AGENTS.md, workflow or command file) routes `create` here. Read it completely before starting a squad creation.

Each phase is a separate prompt in `_opensquad/core/prompts/`. Dispatch each phase as a subagent when your environment supports it. **If your environment does not support subagents, execute each phase inline, in order, in the current conversation** — never skip or defer a phase.

## Phase 1: Discovery

1. Check resume: does `squads/{name}/_build/discovery.yaml` already exist?
   - If yes: read it, show summary, ask user to continue or redo
   - If no: proceed with discovery

2. **Collision guard:** List all existing subdirectories in `squads/` and pass the list of existing squad names to the Discovery phase. This is mandatory — never skip this step.

3. Run the Discovery phase:
   - Read `_opensquad/core/prompts/discovery.prompt.md`
   - Also provide: `_opensquad/_memory/company.md`, `_opensquad/_memory/preferences.md`
   - **Provide the list of existing squad folder names** so the agent can avoid collisions
   - Follow the discovery prompt instructions (intelligent wizard, one question at a time)
   - Output: `squads/{code}/_build/discovery.yaml`

4. Validate: `discovery.yaml` exists and has the required fields (`squad_code`, `purpose`, `domain`, `investigation`)

## Phase 2: Investigation (optional)

Read `discovery.yaml` and check `investigation.enabled`:

**If `enabled: true`:**
For each entry in `investigation.profiles` (each has `url`, `platform` and `investigation_mode`):
   1. Run the Sherlock extractor with:
      - `_opensquad/core/prompts/sherlock-shared.md`
      - `_opensquad/core/prompts/sherlock-{platform}.md` (platform-specific extractor: instagram, youtube, twitter or linkedin)
      - The profile's `url`, `investigation_mode`, the output directory `squads/{code}/_investigations/{username}/` and the squad name
   2. Use the fast model tier for Sherlock when your environment lets you choose
   3. Profiles can run in parallel (one per URL) when subagents are available; otherwise run them one at a time
   4. Wait for all to complete
   5. Validate per profile: `raw-content.md` + `pattern-analysis.md` OR `error.md` exists
   6. If any profile has `error.md`: inform user, ask to retry or skip

**If `enabled: false`:** Skip to Phase 3

## Phase 3: Design

1. Check resume: does `squads/{code}/_build/design.yaml` already exist?
   - If yes: read it, show summary, ask user to continue or redo

2. Run the Design phase:
   - Read `_opensquad/core/prompts/design.prompt.md`
   - Provide: path to discovery.yaml, paths to investigation results (if any)
   - The Design phase handles: best-practices consultation, web research, extraction, skill discovery, design presentation, template selection (optional — triggered when the squad includes an image skill)
   - Output: `squads/{code}/_build/design.yaml`

3. Validate: `design.yaml` exists and has agents and pipeline defined

## Phase 4: Build

1. Run the Build phase:
   - Read `_opensquad/core/prompts/build.prompt.md`
   - Provide: path to design.yaml, path to discovery.yaml
   - The Build phase generates all files and runs validation gates
   - Output: `squads/{code}/squad.yaml` + all agent and pipeline files

2. Final validation:
   - `squad.yaml` exists
   - All agent files referenced in squad-party.csv exist
   - All pipeline step files exist

3. Present completion summary to user

## Resume Support

If `/opensquad create` is called and `_build/` artifacts exist from a previous session:
- Discovery complete + Design missing → resume from Phase 3
- Discovery + Design complete → resume from Phase 4
- Show what was completed and ask user to continue or start over
