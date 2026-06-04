# Skills System Redesign

**Date**: 2026-02-27
**Status**: Approved

## Summary

Unify "tools" and "skills" into a single concept called **skills**. Everything an agent can use — MCP integrations, scripts, behavioral prompts — is a skill. The tools system (`_opensquad/tools/`) is fully replaced by a skills system (`_opensquad/skills/`).

## Decisions

1. **Single concept**: "Tools" cease to exist. Everything is a "skill".
2. **Format**: `SKILL.md` with YAML frontmatter + Markdown body (Anthropic skill-creator pattern, extended).
3. **Location**: `_opensquad/skills/` in user repo. Internal to pipeline runner only — no IDE-specific duplication.
4. **Pre-installed**: Only `opensquad-skill-creator` ships with `npx opensquad-init`.
5. **Catalog**: `skills/` at root of main repo (GitHub) with README documenting all available skills.
6. **Install/update**: Both CLI (`npx opensquad install/update`) and chat (`/opensquad`).
7. **Skills engine**: `skills.engine.md` replaces `tools.engine.md`.
8. **Missing skill at runtime**: Interactive prompt — "Skill X not found. Install now? (y/n)".
9. **Skill creator**: Full eval/benchmark system adapted from Anthropic, minus description optimization, plus MCP/script support.

## Directory Structure

### Main repo (GitHub)

```
skills/
├── README.md                          # Catalog of available skills + install instructions
├── opensquad-skill-creator/
│   ├── SKILL.md
│   ├── agents/
│   │   ├── grader.md
│   │   ├── comparator.md
│   │   └── analyzer.md
│   ├── references/
│   │   ├── schemas.md
│   │   └── skill-format.md
│   └── scripts/
│       ├── aggregate_benchmark.py
│       ├── generate_report.py
│       └── run_eval.py
├── canva/
│   └── SKILL.md
├── apify/
│   └── SKILL.md
├── instagram-publisher/
│   ├── SKILL.md
│   └── scripts/
│       └── publish.js
├── blotato/
│   └── SKILL.md
├── asset-fetcher/
│   └── SKILL.md
└── visual-renderer/
    └── SKILL.md
```

### Templates (copied by `npx opensquad-init`)

```
templates/
├── _opensquad/
│   ├── .opensquad-version
│   ├── _memory/
│   │   ├── company.md
│   │   └── preferences.md
│   ├── core/
│   │   ├── architect.agent.yaml
│   │   ├── skills.engine.md
│   │   ├── runner.pipeline.md
│   │   ├── platforms/
│   │   └── prompts/
│   └── skills/
│       └── opensquad-skill-creator/
│           ├── SKILL.md
│           ├── agents/
│           ├── references/
│           └── scripts/
├── ide-templates/
│   ├── claude-code/
│   ├── antigravity/
│   ├── codex/
│   └── opencode/
```

### User repo (after init + some installs)

```
_opensquad/
├── skills/
│   ├── opensquad-skill-creator/        # Pre-installed
│   │   ├── SKILL.md
│   │   ├── agents/
│   │   ├── references/
│   │   └── scripts/
│   ├── canva/                        # Installed by user
│   │   └── SKILL.md
│   └── instagram-publisher/          # Installed by user
│       ├── SKILL.md
│       └── scripts/
│           └── publish.js
├── core/
│   ├── skills.engine.md
│   ├── architect.agent.yaml
│   ├── runner.pipeline.md
│   └── ...
```

## SKILL.md Format

### Type: MCP

```yaml
---
name: canva
description: Create, search, edit and export Canva designs.
type: mcp
version: "1.0.0"
mcp:
  server_name: canva-mcp
  transport: http
  url: https://mcp.canva.com
  headers:
    Authorization: "Bearer ${CANVA_API_KEY}"
env:
  - CANVA_API_KEY
categories: [design, visual-content]
---

# Canva Connect

## When to use
...

## Available operations
...
```

### Type: Script

```yaml
---
name: instagram-publisher
description: Publish carousel posts to Instagram from local images.
type: script
version: "1.0.0"
script:
  path: scripts/publish.js
  runtime: node
  dependencies: [axios, form-data]
  invoke: "node {skill_path}/scripts/publish.js --images \"{images}\" --caption \"{caption}\""
env:
  - INSTAGRAM_ACCESS_TOKEN
  - INSTAGRAM_USER_ID
  - IMGBB_API_KEY
categories: [social-media, publishing]
---

# Instagram Publisher

## When to use
...
```

### Type: Prompt

```yaml
---
name: seo-optimizer
description: Optimize content for search engines.
type: prompt
version: "1.0.0"
categories: [content, optimization]
---

# SEO Optimizer

## Instructions
...
```

### Type: Hybrid

Combines `mcp` and `script` sections in the same frontmatter.

## Commands

### CLI

| Command | Description |
|---|---|
| `npx opensquad install <name>` | Download skill from GitHub → `_opensquad/skills/<name>/` |
| `npx opensquad install <name> --version X.Y.Z` | Install specific version |
| `npx opensquad uninstall <name>` | Remove skill |
| `npx opensquad update` | Update all installed skills |
| `npx opensquad update <name>` | Update specific skill |
| `npx opensquad skills` | List installed skills with status |

### Chat (`/opensquad`)

Natural language equivalents of CLI commands:
- "instala a skill canva"
- "quais skills tenho instaladas?"
- "atualiza as skills"
- "remove a skill apify"

### Installation flow

1. Fetch skill from GitHub repo (`skills/<name>/`)
2. Copy entire folder to `_opensquad/skills/<name>/`
3. If skill has `env:` → check if variables exist in `.env`
4. If env vars missing → warn user which to configure
5. If skill has `mcp:` → configure MCP server in IDE config (`.claude/settings.local.json`, etc.)
6. Confirm installation

### Missing skill at pipeline runtime

1. Pipeline reads `skills:` from `squad.yaml`
2. Checks if `_opensquad/skills/<name>/` exists
3. If not → "Skill `canva` not found. Install now? (y/n)"
4. If yes → run installation flow
5. If no → pipeline stops with error

### Update flow

1. Compare local version (`version` in frontmatter) with GitHub version
2. If newer version available → download and replace
3. Preserve local configurations (env vars already set)

## Skills Engine (`skills.engine.md`)

Replaces `tools.engine.md`. Responsibilities:

### 1. Resolution

- Read `skills:` from `squad.yaml`
- Load `_opensquad/skills/<name>/SKILL.md` for each skill
- Check type (mcp, script, prompt, hybrid)
- Validate env vars are configured
- Validate MCP server is accessible (if applicable)
- If skill not found → interactive install prompt

### 2. Injection into agents

Each agent lists skills in its `.agent.md`:
```yaml
skills:
  - web_search        # native (always available)
  - canva             # installed
```

The engine reads the SKILL.md body and injects after the agent's instructions:
```
[Agent .agent.md content]

--- SKILL INSTRUCTIONS ---

## Canva Connect
[SKILL.md body of canva skill]
```

### 3. Native skills

`web_search` and `web_fetch` are always available — no installation needed. The engine recognizes them by name and skips resolution.

## Opensquad Skill Creator

Pre-installed skill for creating new Opensquad skills. Adapted from Anthropic's skill-creator.

### Structure

```
opensquad-skill-creator/
├── SKILL.md
├── agents/
│   ├── grader.md
│   ├── comparator.md
│   └── analyzer.md
├── references/
│   ├── schemas.md
│   └── skill-format.md
└── scripts/
    ├── aggregate_benchmark.py
    ├── generate_report.py
    └── run_eval.py
```

### Flow

1. **Capture intent** — what should the skill do? Integration (MCP/script) or behavioral (prompt)?
2. **Interview** — edge cases, formats, success criteria. For MCP: which API? Transport? Env vars? For script: runtime? Dependencies?
3. **Generate SKILL.md** — correct frontmatter for chosen type + body with instructions
4. **Test cases** — 2-3 realistic prompts, run with/without skill
5. **Eval + review** — grading, benchmark viewer, user feedback
6. **Iterate** — improve based on feedback, re-test
7. **Finalize** — skill ready in `_opensquad/skills/<name>/`

### Differences from Anthropic's skill-creator

| Anthropic | Opensquad |
|---|---|
| Creates prompt-only skills | Creates 4 types: mcp, script, hybrid, prompt |
| Description optimization (trigger matching) | Removed — skills are referenced explicitly |
| Skill goes to `.claude/skills/` | Skill goes to `_opensquad/skills/` |
| Tested by running Claude with/without skill | Tested within squad agent context |
| `package_skill.py` generates `.skill` file | Not needed — skill stays in final directory |

### What stays the same

- Core loop: draft → test → review → improve
- Eval system with `evals.json`
- Auxiliary agents (grader, comparator, analyzer)
- Benchmark viewer HTML
- Philosophy: explain the why, generalize, keep lean

### `skill-format.md` reference

New document the creator consults, documenting:
- YAML frontmatter schema per type (mcp, script, hybrid, prompt)
- Required vs optional fields
- Examples of each type
- How the pipeline runner resolves each type

## Migration

### Files removed

- `_opensquad/tools/` (entire directory — registry, installed, scripts)
- `_opensquad/core/tools.engine.md`
- `templates/_opensquad/tools/` (entire directory)

### Files renamed/replaced

- `tools.engine.md` → `skills.engine.md` (rewritten)
- In `squad.yaml`: `tools:` → `skills:`
- In `.agent.md`: `tools:` → `skills:`

### Files requiring "tools" → "skills" reference updates

- `_opensquad/core/architect.agent.yaml` — Phase 3.5 "Tool Discovery" → "Skill Discovery"
- `_opensquad/core/runner.pipeline.md` — tool resolution sections
- `_opensquad/core/prompts/*.prompt.md` — any tool mentions
- `templates/ide-templates/claude-code/CLAUDE.md`
- `templates/ide-templates/antigravity/.antigravity/rules.md`
- `templates/ide-templates/codex/AGENTS.md`
- `templates/ide-templates/opencode/AGENTS.md`
- `.claude/skills/opensquad/SKILL.md` — the `/opensquad` skill itself
- `src/i18n.js` — internationalization keys
- `src/skills.js` — CLI logic
- `README.md`
- `CLAUDE.md`
- `package.json` — CLI commands

### Skills migrated from `.tool.yaml` to `SKILL.md`

- `apify.tool.yaml` → `skills/apify/SKILL.md`
- `asset-fetcher.tool.yaml` → `skills/asset-fetcher/SKILL.md`
- `blotato.tool.yaml` → `skills/blotato/SKILL.md`
- `canva.tool.yaml` → `skills/canva/SKILL.md`
- `instagram-publisher.tool.yaml` → `skills/instagram-publisher/SKILL.md`
- `visual-renderer.tool.yaml` → `skills/visual-renderer/SKILL.md`
