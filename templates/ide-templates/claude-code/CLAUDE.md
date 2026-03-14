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
- `squads/` — User-created squads
- `squads/{name}/_investigations/` — Sherlock content investigations (profile analyses)
- `squads/{name}/output/` — Generated content and files
- `_opensquad/_browser_profile/` — Persistent browser sessions (login cookies, localStorage)

## How It Works

1. The `/opensquad` skill is the entry point for all interactions
2. The **Architect** agent creates and modifies squads
3. During squad creation, the **Sherlock** investigator can analyze reference profiles (Instagram, YouTube, Twitter/X, LinkedIn) to extract real content patterns
4. The **Pipeline Runner** executes squads automatically
5. Agents communicate via persona switching (inline) or subagents (background)
6. Checkpoints pause execution for user input/approval
7. The **Dashboard** shows a pixel-art office where you can watch agents work in real-time

## Dashboard

Type `/opensquad dashboard` or `/opensquad ver agentes` to launch the pixel-art dashboard.
This runs `npx opensquad dashboard` which:
- Installs dashboard dependencies (if needed)
- Starts the Vite dev server on http://localhost:5173
- Opens the browser automatically
- Shows agents animating in real-time as they work through the pipeline

## Rules

- Always use `/opensquad` commands to interact with the system
- Do not manually edit files in `_opensquad/core/` unless you know what you're doing
- Squad YAML files can be edited manually if needed, but prefer using `/opensquad edit`
- Company context in `_opensquad/_memory/company.md` is loaded for every squad run

## RTK (Rust Token Killer) — MANDATORY

**Always prefix shell commands with `rtk`**. RTK compresses CLI output by 60-90%, saving thousands of tokens per session.

```bash
# ✅ Correct — always use rtk
rtk git status
rtk git log
rtk git diff
rtk npm install
rtk cargo build
rtk docker ps

# ❌ Wrong — never run bare commands
git status
git log
npm install
```

Even in chained commands:
```bash
rtk git add . && rtk git commit -m "msg" && rtk git push
```

RTK is installed automatically during `npx opensquad init`. If missing: `cargo install rtk`

## Browser Sessions

Opensquad uses a persistent Playwright browser profile to keep you logged into social media platforms.
- Sessions are stored in `_opensquad/_browser_profile/` (gitignored, private to you)
- First time accessing a platform, you'll log in manually once
- Subsequent runs will reuse your saved session
- **Important:** The native Claude Code Playwright plugin must be disabled. Opensquad uses its own `@playwright/mcp` server configured in `.mcp.json`.
