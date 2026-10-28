# Full Sprite Review — Design Spec
Date: 2026-03-28

## Overview

Add a **FULL SPRITE REVIEW** function to the `opensquad-dashboard-design` skill as **Phase 7** — an optional phase invoked when the user explicitly requests a full visual audit of all sprites in the dashboard. It replaces the normal phases 2–6 for that session.

The function autonomously audits every sprite, fixes issues via parallel subagents, and loops until all sprites pass the checklist. It asks the user for input only when evaluation is ambiguous or when stuck, and requests final approval at the end.

## Approach

Hybrid: **code-driven inventory + visual screenshot evaluation + lightweight category rules.**

1. Read `RoomBuilder.ts` and `AgentSprite.ts` to build a precise list of all active sprites (key, type, code position, scale, depth)
2. Take screenshot for visual evaluation
3. Evaluate each sprite using vision + lightweight rules per category
4. Ask the user when evaluation is UNCERTAIN
5. Fix via parallel subagents grouped by file/problem type
6. Re-screenshot and re-evaluate only previously-failing sprites
7. Loop until all pass, then request final approval

## Sub-phases

```
Phase 7: FULL SPRITE REVIEW
  7.1 INVENTORY   — read code to enumerate all active sprites
  7.2 SCREENSHOT  — capture current dashboard state
  7.3 EVALUATE    — assess each sprite against 4-criterion checklist
  7.4 DOCUMENT    — write review report to /tmp/sprite-review.md
  7.5 FIX         — dispatch parallel subagents by fix group
  7.6 RE-REVIEW   — re-screenshot + re-evaluate failing sprites only
  7.7 APPROVE     — present final screenshot + summary, request user approval
```

Loop: **7.5 → 7.6** repeats until all sprites pass (or user is asked for help if agent is stuck after 2 iterations on the same sprite).

## Evaluation Checklist (per sprite)

Each sprite receives **PASS / FAIL / UNCERTAIN** on 4 criteria:

### 1. Size
Compare visual scale against neighbors in the screenshot.
- Avatar must not appear larger than the desk it sits at
- Plants must not dominate the scene (overshadow desks or avatars)
- Wall decorations must fit within the wall strip height
- Accessories (mugs, backpacks) must be proportionally small

### 2. Transparent Background
Check screenshot for a visible white or solid-colored box surrounding the sprite.
- If found: inspect Phaser code for culprits — `setTint`, Graphics rectangles drawn behind sprite, incorrect `setAlpha`, wrong `filterMode`
- Fix is always in the code, not the PNG files (all source PNGs are already transparent)

### 3. Semantic Position
Apply lightweight category rules:

| Category | Rule |
|----------|------|
| Plants / flowers | Corners, room edges, or between desk rows — never on top of a work desk |
| Avatar (character) | Visibly above the desk sprite — not floating mid-air or on the floor |
| Monitor / desktop | On top of the work desk at correct height |
| Couch / armchair | Lounge zone (lower portion of scene) — not in work area |
| Rug / carpet | Below furniture — never rendered above characters |
| Wall decorations | Within the wall strip (WALL_H zone) — not on the floor |
| Accessories (mug, backpack) | On or beside desks — not in the middle of walkways |

### 4. Unwanted Overlap
Check screenshot for a sprite visually covering another in a way that breaks the scene logic (e.g., a plant rendered over an avatar's face, a rug floating above a couch).

## Review Report Format

Written to `/tmp/sprite-review.md` after evaluation:

```markdown
# Sprite Review — YYYY-MM-DD HH:MM

## Summary
- Total sprites: N
- PASS: N | FAIL: N | UNCERTAIN: N

## Results

### <sprite_key> (<file>:<line>)
- Tamanho: PASS | FAIL | UNCERTAIN — <reason>
- Fundo: PASS | FAIL | UNCERTAIN — <reason>
- Posição: PASS | FAIL | UNCERTAIN — <reason>
- Sobreposição: PASS | FAIL | UNCERTAIN — <reason>
- Fix: <proposed fix if any criteria fail>
```

## Fix Subagent Groups

| Group | File(s) | Problem Types |
|-------|---------|---------------|
| A | `RoomBuilder.ts` | Wrong position, wrong size, overlap — furniture |
| B | `AgentSprite.ts` | Avatar mispositioned, wrong scale |
| C | `RoomBuilder.ts` + `AgentSprite.ts` | White background (Phaser rendering artifact) |

Groups A and B run in parallel. Group C runs after A+B complete (white background issues may span multiple files).

Each subagent receives:
- The sprite key(s) it must fix
- The specific FAIL reasons from the review report
- The critical rules from the skill's Quick Reference section
- Instruction to read `reference.md` for asset catalog and code examples

## Loop Termination

- **Normal exit:** all sprites reach PASS → show final screenshot + summary → ask user for approval
- **Stuck detection:** if the same sprite fails the same criterion after 2 consecutive fix iterations → pause loop, report to user with specific question, resume after user answers
- **User approval:** present final screenshot, list of what was fixed, checklist results → ask "O resultado ficou como esperado? Posso finalizar ou quer ajustes?"

## What Changes in the Skill File

A single new section — **Phase 7: FULL SPRITE REVIEW** — is appended to `SKILL.md`. No existing phases are modified. The phase header makes it clear it is only triggered on explicit user request.

The UNCERTAIN → ask-user flow mirrors the existing skill's principle: "ask ONE clarifying question before proceeding."
