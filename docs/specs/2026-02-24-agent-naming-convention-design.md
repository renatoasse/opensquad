# Agent Naming Convention — Design Document

**Date:** 2026-02-24
**Status:** Approved

## Problem

Agents currently use single-word generic names (Scout, Spark, Quill, Eagle). We want humorous, memorable two-word names that follow an alliterative pattern tied to the agent's profession, in the user's language.

## Design

### Naming Rules

1. **Format:** `FirstName LastName` — both starting with the same letter (alliteration)
2. **First name:** Common human name in the user's Output Language (from `_opensquad/_memory/preferences.md`)
3. **Last name:** Playful reference to the agent's specialty or profession
4. **Uniqueness:** Each agent in a squad uses a different initial letter
5. **Exception:** The Architect agent uses only its functional name in the user's language (e.g., "Arquiteto", "Architect")

### Examples

| Domain | PT-BR | EN | ES |
|--------|-------|----|----|
| Finance | Sérgio Selic, Beto Barsi | Betty Bonds, Frank Funds | Fernando Fondos |
| Copywriting | Guilherme Gancho, Sofia Story | Clara Copy, Harry Hook | Carmen Copy |
| Marketing | Ítalo Inbound, Lucas Leads | Dean Digital, Larry Leads | Pablo Pipeline |
| Data | Dante Dados, Beatriz BI | Dean Data, Roger ROI | Diana Datos |

### Approach

**Approach A (selected):** Add naming convention instructions directly in `architect.agent.yaml` Phase 4 (Design). The Architect generates names creatively each time — no pre-defined name bank.

### Language Source

The agent name language comes from `_opensquad/_memory/preferences.md → Output Language`, which is set during `npx opensquad init`.

### Changes Required

#### 1. `architect.agent.yaml`
- `name: Atlas` → `name: Arquiteto` (functional name in default language)
- Phase 4 (Design): Add `#### Agent Naming Convention` block with rules, multi-language examples, and instruction to read Output Language from preferences.md

#### 2. Template agents (instagram-content squad)
Rename to Portuguese alliterative names:

| Current | New | File |
|---------|-----|------|
| Scout | Pedro Pesquisa | `agents/researcher.agent.md` |
| Spark | Ivan Ideia | `agents/ideator.agent.md` |
| Quill | Carlos Carrossel | `agents/copywriter.agent.md` |
| Eagle | Renata Revisão | `agents/reviewer.agent.md` |

Each file: update `name:` in front matter + `#` title heading.

#### 3. `squad-party.csv`
Update `name` and `displayName` columns to match new agent names.

### Not Changed
- `squad.yaml` — references file paths, not names
- `src/init.js` — no naming logic
- Prompt templates — don't define specific names
