# Design: Multi-select IDE Selection in Onboarding

**Date:** 2026-02-27
**Status:** Approved

## Overview

During `opensquad init`, the user is asked which IDEs they want to install Opensquad support for. Currently, only a single IDE can be selected and only Claude Code is enabled. This change adds multi-selection and enables three new IDEs: Open Code, Codex (OpenAI), and Antigravity.

## UI Approach

Use `@inquirer/checkbox` from the Inquirer.js v9+ modular API (ESM-compatible). Add a `multiChoose()` method to `src/prompt.js` that wraps `@inquirer/checkbox`. Returns `string[]` of selected values. Claude Code is pre-checked by default.

The existing `choose()` method is left unchanged to avoid breaking other usage.

## IDE Configuration

| IDE | value | File installed | Location |
|-----|-------|---------------|----------|
| Claude Code | `claude-code` | `SKILL.md` + `CLAUDE.md` | `.claude/skills/opensquad/SKILL.md` + root |
| Open Code | `opencode` | `AGENTS.md` | repo root |
| Codex (OpenAI) | `codex` | `AGENTS.md` | repo root (shared if both selected) |
| Antigravity | `antigravity` | `rules.md` | `.antigravity/rules.md` |
| Cursor | `cursor` | TBD | disabled (coming soon) |
| Windsurf | `windsurf` | TBD | disabled (coming soon) |
| VS Code + Copilot | `vscode-copilot` | TBD | disabled (coming soon) |

**Note:** OpenCode and Codex both use `AGENTS.md` at the repo root. If both are selected, the file is written once (same content).

## Template Structure

IDE-specific files are moved out of the generic `templates/` root into `templates/ide-templates/{ide}/`. The common template copy function ignores this directory; a new `copyIdeTemplates()` function handles per-IDE copying.

```
templates/
  _opensquad/                                  ← always copied (unchanged)
  squads/                                    ← always copied (unchanged)
  ide-templates/                             ← NEW — skipped by copyCommonTemplates()
    claude-code/
      CLAUDE.md                              ← MOVED from templates/CLAUDE.md
      .claude/skills/opensquad/SKILL.md        ← MOVED from templates/.claude/
    opencode/
      AGENTS.md                              ← NEW
    codex/
      AGENTS.md                              ← NEW (same content as opencode/AGENTS.md)
    antigravity/
      .antigravity/rules.md                  ← NEW
```

## Template Content

`AGENTS.md` and `.antigravity/rules.md` contain the same instructions as `SKILL.md` but adapted for non-Claude-Code IDEs:
- No YAML frontmatter (Claude Code-specific)
- Title changed to `# Opensquad Instructions`
- Otherwise same content: commands, workflows, onboarding steps

## Changes to `src/init.js`

- `ide: string` → `ides: string[]`
- IDE selection uses `multiChoose` instead of `choose`
- `copyTemplates()` splits into:
  - `copyCommonTemplates(targetDir)` — copies `templates/` excluding `ide-templates/`
  - `copyIdeTemplates(ides, targetDir)` — copies from `templates/ide-templates/{ide}/` for each selected IDE
- `preferences.md` stores `**IDEs:** claude-code, opencode` (comma-separated)
- Post-install messages display per-IDE instructions for all selected IDEs

## Post-install Messages

```
  Next steps:

  Claude Code:  type /opensquad to get started
  Open Code:    see AGENTS.md in your project root
  Codex:        see AGENTS.md in your project root
  Antigravity:  see .antigravity/rules.md
```

## Localization

Add new i18n keys in `src/locales/{en,pt-BR,es}.json`:
- `chooseIdes` — updated prompt for multi-select
- `step1OpenCode`, `step1Codex`, `step1Antigravity` — per-IDE next step messages

## Files Changed

| File | Change |
|------|--------|
| `package.json` | Add `@inquirer/checkbox` dependency |
| `src/prompt.js` | Add `multiChoose()` method |
| `src/init.js` | Multi-select IDEs, `copyIdeTemplates()`, updated preferences format |
| `src/locales/en.json` | New keys for multi-select + new IDEs |
| `src/locales/pt-BR.json` | Same |
| `src/locales/es.json` | Same |
| `templates/CLAUDE.md` | Move → `templates/ide-templates/claude-code/CLAUDE.md` |
| `templates/.claude/` | Move → `templates/ide-templates/claude-code/.claude/` |
| `templates/ide-templates/opencode/AGENTS.md` | Create |
| `templates/ide-templates/codex/AGENTS.md` | Create |
| `templates/ide-templates/antigravity/.antigravity/rules.md` | Create |
| `tests/init.test.js` | Update for multi-select behavior |
