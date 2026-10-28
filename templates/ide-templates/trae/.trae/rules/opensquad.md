---
description: Opensquad multi-agent orchestration framework instructions
alwaysApply: true
---

# Opensquad — Project Instructions

This project uses **Opensquad**, a multi-agent orchestration framework.

## Quick Start

Type `/opensquad` to open the main menu, or use any of these commands:
- `/opensquad create` — Create a new squad
- `/opensquad run <name>` — Run a squad
- `/opensquad help` — See all commands

## Directory Structure

- `_opensquad/` — Opensquad core files (do not modify manually)
- `_opensquad/_memory/` — Persistent memory (company context, preferences)
- `skills/` — Installed skills (integrations, scripts, prompts)
- `squads/` — User-created squads
- `squads/{name}/_investigations/` — Sherlock content investigations (profile analyses)
- `squads/{name}/output/` — Generated content and files
- `_opensquad/_browser_profile/` — Persistent browser sessions (login cookies, localStorage)

## How It Works

1. The `/opensquad` workflow is the entry point for all interactions
2. The **Architect** agent creates and modifies squads
3. During squad creation, the **Sherlock** investigator can analyze reference profiles (Instagram, YouTube, Twitter/X, LinkedIn) to extract real content patterns
4. The **Pipeline Runner** executes squads automatically
5. All tasks run inline and sequentially (no background subagents)
6. Checkpoints pause execution for user input/approval

## Rules

- Always use `/opensquad` commands to interact with the system
- Do not manually edit files in `_opensquad/core/` unless you know what you're doing
- Squad YAML files can be edited manually if needed, but prefer using `/opensquad edit`
- Company context in `_opensquad/_memory/company.md` is loaded for every squad run

## Trae Environment: Subagents

This environment (Trae) does not support spawning background or parallel subagents. When agent instructions (e.g., from the Architect) say to "use the Task tool with run_in_background: true" or similar, you MUST instead execute all tasks inline and sequentially:

1. Inform the user you will process the tasks one by one
2. Execute each task in the current conversation — do NOT skip or defer any of them
3. Complete ALL tasks before asking the next question or moving on

Never announce that you "will do something in parallel" and then skip the work. Always do the actual research inline before continuing.

## Interaction Rules

- NEVER ask more than one question per message — always wait for the user's answer before proceeding to the next question
- When presenting options, always use a numbered list (1. / 2. / 3.) — tell the user to reply with the option number

## Browser Sessions

Opensquad uses a persistent Playwright browser profile to keep you logged into social media platforms.
- Sessions are stored in `_opensquad/_browser_profile/` (gitignored, private to you)
- First time accessing a platform, you'll log in manually once
- Subsequent runs will reuse your saved session
- **Important:** Opensquad uses its own `@playwright/mcp` server configured in `.trae/mcp.json`.

## Opensquad System Instructions

When the user types `/opensquad` (with or without arguments) or asks to create, run or manage squads, activate the Opensquad system and follow these steps IN ORDER:

1. Read `_opensquad/_memory/company.md` for company context
2. Read `_opensquad/_memory/preferences.md` for user preferences
3. If company.md is empty or contains `<!-- NOT CONFIGURED -->`, run the ONBOARDING flow (see below)
4. Otherwise, show the MAIN MENU

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

Present the following numbered menu and ask the user to reply with a number:

**Primary menu:**
1. **Create a new squad** — Describe what you need and I'll build a squad for you
2. **Run an existing squad** — Execute a squad's pipeline
3. **My squads** — View, edit, or delete your squads
4. **More options** — Skills, company profile, settings, and help

If the user replies "4" or types "More options", present a second numbered menu:
1. **Skills** — Browse, install, create, and manage skills for your squads
2. **Company profile** — View or update your company information
3. **Settings & Help** — Language, preferences, configuration, and help

## Command Routing

Parse user input and route to the appropriate action:

| Input Pattern | Action |
|---------------|--------|
| `/opensquad` or `/opensquad menu` | Show main menu |
| `/opensquad help` | Show help text |
| `/opensquad create <description>` | Run Create Squad — Phased Orchestration (see below) |
| `/opensquad list` | List all squads in `squads/` directory |
| `/opensquad run <name>` | Load Pipeline Runner → Execute squad |
| `/opensquad edit <name> <changes>` | Load Architect → Edit Squad flow |
| `/opensquad skills` | Load Skills Engine → Show skills menu |
| `/opensquad install <name>` | Install a skill from the catalog |
| `/opensquad uninstall <name>` | Remove an installed skill |
| `/opensquad delete <name>` | Confirm and delete squad directory |
| `/opensquad edit-company` | Re-run company profile setup |
| `/opensquad show-company` | Display company.md contents |
| `/opensquad settings` | Show/edit preferences.md |
| `/opensquad reset` | Confirm and reset all configuration |
| Natural language about squads | Infer intent and route accordingly |

## Create Squad — Phased Orchestration

When the user runs `/opensquad create <description>` (or picks "Create a new squad" from the menu):

1. Read `_opensquad/core/create.orchestration.md` completely — it is the single source of truth for squad creation
2. Follow its four phases in order: Discovery → Investigation (optional) → Design → Build
3. Each phase reads its own prompt from `_opensquad/core/prompts/` — never improvise a squad design without going through the phases
4. Honor the resume rules in that file when `squads/{code}/_build/` artifacts already exist from a previous session

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
- After each pipeline run, update the squad's memories.md with key learnings
