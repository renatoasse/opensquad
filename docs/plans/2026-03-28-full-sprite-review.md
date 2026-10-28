# Full Sprite Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Phase 7 (FULL SPRITE REVIEW) to the `opensquad-dashboard-design` skill — a self-contained audit loop that inventories all sprites, evaluates each one visually, fixes issues via parallel subagents, and loops until every sprite passes a 4-criterion checklist.

**Architecture:** Single file edit to `.claude/skills/opensquad-dashboard-design/SKILL.md`. Phase 7 is appended after Phase 6 (LOOP). No TypeScript changes. No new files. The phase is triggered only on explicit user request; all other phases remain unchanged.

**Tech Stack:** Markdown (SKILL.md prompt engineering), Playwright CLI for screenshots, Claude subagents for parallel fixes.

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `.claude/skills/opensquad-dashboard-design/SKILL.md` | Append Phase 7 section after line 100 (after Phase 6 content) |

---

### Task 1: Add Phase 7 trigger note at the top of the Workflow section

**Files:**
- Modify: `.claude/skills/opensquad-dashboard-design/SKILL.md` (line 12)

The workflow intro currently says "Follow these 6 phases in order." Update it to mention Phase 7 as an optional explicit-request phase.

- [ ] **Step 1: Edit the workflow intro line**

Open `.claude/skills/opensquad-dashboard-design/SKILL.md`. Find line 12:

```
Follow these 6 phases in order. Do NOT skip phases or implement without diagnosis.
```

Replace with:

```
Follow these 6 phases in order. Do NOT skip phases or implement without diagnosis.

> **Phase 7 — FULL SPRITE REVIEW** is an optional audit phase triggered only when the user explicitly requests a full sprite audit (e.g. "faz o full sprite review", "revisa todos os sprites"). When triggered, it replaces phases 2–6 for that session.
```

- [ ] **Step 2: Verify the edit looks right**

Read the file and confirm lines 12–16 now contain the updated intro + the Phase 7 callout block. No other lines should have changed.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/opensquad-dashboard-design/SKILL.md
git commit -m "feat(dashboard-skill): add Phase 7 trigger note to workflow intro"
```

---

### Task 2: Append Phase 7 — sub-phases 7.1 INVENTORY and 7.2 SCREENSHOT

**Files:**
- Modify: `.claude/skills/opensquad-dashboard-design/SKILL.md` (append after line 100, after Phase 6 ends)

- [ ] **Step 1: Append sub-phases 7.1 and 7.2 after Phase 6**

Find the end of Phase 6 (after "- Repeat until user approves") and append:

```markdown
### Phase 7: FULL SPRITE REVIEW

> Triggered only on explicit user request. Replaces phases 2–6 for this session.

#### 7.1 INVENTORY

Read `dashboard/src/office/RoomBuilder.ts` and `dashboard/src/office/AgentSprite.ts` in full. Build a structured list of every sprite currently placed in the scene:

For each sprite, record:
- **Key** — the asset key string (e.g. `furniture_monstera`, `desk_black_idle`)
- **Type** — `furniture` | `desk` | `avatar` | `decoration`
- **File + line** — where in the code it is placed
- **Scale** — the `.setScale()` value (or 1 if not set)
- **Depth** — the `.setDepth()` value
- **Position** — the (x, y) expression in code (e.g. `MARGIN / 2`, `roomW - 40`)

Do NOT skip any sprite. Include sprites inside loops (e.g. per-agent desk sprites).

#### 7.2 SCREENSHOT

Auto-detect the dashboard URL (same logic as Phase 2):
1. Check `dashboard/vite.config.ts` for `server.port`
2. Check `dashboard/package.json` scripts for `--port` flags
3. Fallback: `http://localhost:5173`

Take screenshot via Playwright CLI:
```bash
npx playwright screenshot --browser chromium "URL" "/tmp/sprite-review-before.png" --full-page
```

If URL is unreachable, tell the user to run `cd dashboard && npm run dev` and wait for confirmation before continuing.

Present the screenshot to the user and say: "Capturei o estado atual. Iniciando avaliação de cada sprite..."
```

- [ ] **Step 2: Verify append**

Read the file around lines 94–130. Confirm Phase 6 ends cleanly, then Phase 7 begins with the `> Triggered only on explicit user request` note, followed by 7.1 and 7.2. No duplicated content.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/opensquad-dashboard-design/SKILL.md
git commit -m "feat(dashboard-skill): add Phase 7 sub-phases 7.1 INVENTORY and 7.2 SCREENSHOT"
```

---

### Task 3: Append sub-phases 7.3 EVALUATE and 7.4 DOCUMENT

**Files:**
- Modify: `.claude/skills/opensquad-dashboard-design/SKILL.md` (append after 7.2)

- [ ] **Step 1: Append 7.3 and 7.4**

After the 7.2 block, append:

```markdown
#### 7.3 EVALUATE

For every sprite in the inventory, evaluate 4 criteria against the screenshot. Assign **PASS**, **FAIL**, or **UNCERTAIN** to each.

**Criterion 1 — Size**
Compare visual scale against neighboring elements in the screenshot:
- Avatar must not appear larger than the desk it sits at
- Plants/flowers must not visually dominate the scene (overshadow desks or avatars)
- Wall decorations must fit within the visible wall strip (not spill onto the floor)
- Accessories (mugs, backpacks, cushions) must be proportionally small relative to desks

**Criterion 2 — Transparent Background**
Look for a visible white or solid-colored box surrounding the sprite in the screenshot:
- PASS: sprite renders cleanly with transparent surroundings
- FAIL: visible bounding box or white halo around the sprite
- Fix approach: inspect the Phaser code around that sprite for `setTint`, `setAlpha`, Graphics rectangles drawn immediately before the sprite, or incorrect `filterMode`. Fix is always in the code — PNG files are already transparent.

**Criterion 3 — Semantic Position**
Apply these lightweight rules per sprite category:

| Category | Rule |
|----------|------|
| Plants / flowers | Corners, room edges, or between desk rows — **never** on top of a work desk |
| Avatar (character sprite) | Visibly above the desk sprite — not floating mid-air or sitting on the floor |
| Monitor / desktop set | On top of the work desk at the correct vertical offset |
| Couch / armchair | Lounge zone (lower portion of the scene) — not in the work desk area |
| Rug / carpet | Below all furniture — never rendered visually above a character |
| Wall decorations (blinds, poster, bookshelf, clock) | Within the wall strip (`y ≤ WALL_H`) — not on the floor |
| Accessories (mug, backpack, lantern) | On or immediately beside a desk — not in the middle of a walkway |

**Criterion 4 — Unwanted Overlap**
Check if a sprite visually covers another in a way that breaks scene logic:
- Plant rendered over an avatar's face → FAIL
- Rug floating visually above a couch → FAIL
- Two identical sprites stacked at the same pixel position → FAIL
- Desk partially clipped by a wall decoration → FAIL

**UNCERTAIN rule:** If you cannot determine PASS or FAIL from the screenshot alone (e.g. the sprite is partially hidden, or the position rule doesn't clearly apply), mark it UNCERTAIN and note the specific question. You will ask the user about all UNCERTAIN sprites together before proceeding to 7.5.

#### 7.4 DOCUMENT

Write the evaluation results to `/tmp/sprite-review.md` in this exact format:

```markdown
# Sprite Review — YYYY-MM-DD HH:MM

## Summary
- Total sprites: N
- PASS: N | FAIL: N | UNCERTAIN: N

## Results

### furniture_monstera (RoomBuilder.ts:112)
- Tamanho: PASS
- Fundo: PASS
- Posição: FAIL — planta posicionada sobre mesa de trabalho (x=320, y=180). Mover para canto.
- Sobreposição: FAIL — sobrepõe avatar do agente "Writer". Ajustar x/y.
- **Fix needed:** reposition to corner (x=MARGIN/2, y=deskAreaBottom - 20)

### avatar_Jesse_blink (AgentSprite.ts:87)
- Tamanho: UNCERTAIN — parece grande, mas pode ser intencional
- Fundo: PASS
- Posição: PASS
- Sobreposição: PASS
```

If there are any UNCERTAIN sprites, present them to the user now with a concise question for each one. Wait for the user's answer, update the report, then proceed to 7.5.
```

- [ ] **Step 2: Verify append**

Read the new block. Confirm:
- Criterion tables are intact
- The UNCERTAIN rule is clearly stated
- The report format example is complete (has both FAIL and UNCERTAIN example entries)

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/opensquad-dashboard-design/SKILL.md
git commit -m "feat(dashboard-skill): add Phase 7 sub-phases 7.3 EVALUATE and 7.4 DOCUMENT"
```

---

### Task 4: Append sub-phases 7.5 FIX, 7.6 RE-REVIEW, and 7.7 APPROVE

**Files:**
- Modify: `.claude/skills/opensquad-dashboard-design/SKILL.md` (append after 7.4)

- [ ] **Step 1: Append 7.5, 7.6, and 7.7**

After the 7.4 block, append:

```markdown
#### 7.5 FIX

Group all FAIL sprites by fix type and dispatch subagents in parallel:

| Group | File(s) | Problem types |
|-------|---------|---------------|
| A | `dashboard/src/office/RoomBuilder.ts` | Wrong position, wrong size, unwanted overlap — furniture/decorations |
| B | `dashboard/src/office/AgentSprite.ts` | Avatar mispositioned, wrong scale |
| C | `RoomBuilder.ts` + `AgentSprite.ts` | White background (Phaser rendering artifact) |

**Groups A and B run in parallel.** Group C runs after A and B complete (white-background causes may span both files).

Each subagent receives:
1. The list of sprite keys it must fix, with specific FAIL reasons from `/tmp/sprite-review.md`
2. The Quick Reference section from this skill (depth sorting, origin conventions, layout constants)
3. Instruction: read `.claude/skills/opensquad-dashboard-design/reference.md` for the asset catalog and code examples
4. The rule: **never hardcode pixel values** — always use relative expressions (`MARGIN / 2`, `roomW / N`, `deskAreaBottom - offset`)

If a group has no failing sprites, skip it.

#### 7.6 RE-REVIEW

After subagents complete, take a new screenshot:

```bash
npx playwright screenshot --browser chromium "URL" "/tmp/sprite-review-iter-N.png" --full-page
```

(Increment N each iteration: `iter-1.png`, `iter-2.png`, etc.)

Re-evaluate **only the sprites that previously had FAIL or UNCERTAIN status**. Do not re-evaluate sprites that already passed.

Update `/tmp/sprite-review.md` with the new results.

**Stuck detection:** If the same sprite fails the same criterion for the 2nd consecutive iteration, do NOT dispatch another subagent blindly. Instead, pause and report to the user:

> "O sprite `<key>` continua falhando no critério `<criterion>` após 2 tentativas. [Descrição concisa do problema]. O que devo fazer?"

Wait for the user's answer, then continue.

**Loop:** If any sprites still FAIL after re-evaluation, return to **7.5 FIX** with only the remaining failures. Continue until all sprites are PASS.

#### 7.7 APPROVE

When all sprites reach PASS status:

1. Present the final screenshot (`/tmp/sprite-review-iter-N.png` or `sprite-review-before.png` if no iterations were needed)
2. Show a summary of what was fixed:
   - List each sprite that was corrected, with before/after description
   - List sprites that passed without changes
3. Show the final checklist with all items as PASS

Ask: "Todos os sprites passaram na revisão. O resultado ficou como esperado? Posso finalizar ou quer ajustes?"

- User approves → **DONE**
- User wants adjustments → collect feedback, return to **7.5 FIX** with a new targeted plan
```

- [ ] **Step 2: Verify the full Phase 7 is coherent**

Read the entire Phase 7 block from start to finish. Confirm:
- Sub-phases are numbered 7.1 through 7.7 with no gaps
- Loop termination condition is clear (7.6 → 7.5 until all PASS, then 7.7)
- Stuck detection is present in 7.6
- Final approval question is in Portuguese (matching the existing skill's style in Phase 5)
- No placeholder text ("TBD", "TODO", "similar to above")

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/opensquad-dashboard-design/SKILL.md
git commit -m "feat(dashboard-skill): add Phase 7 sub-phases 7.5 FIX, 7.6 RE-REVIEW, 7.7 APPROVE"
```

---

### Task 5: Manual smoke test

No automated tests exist for skill files. Verification is manual.

- [ ] **Step 1: Read the full updated SKILL.md**

Read `.claude/skills/opensquad-dashboard-design/SKILL.md` from top to bottom. Confirm:
- Phase numbering is 1–7, no gaps or duplicates
- The workflow intro mentions Phase 7 as optional/explicit-request
- The Quick Reference section is still intact after Phase 6 (Phase 7 must be inserted before the Quick Reference section if the Quick Reference is meant to apply to Phase 7 as well — verify the append went to the right place)
- Phase 7 reads as a self-contained workflow a fresh agent can follow without additional context

- [ ] **Step 2: Check Phase 7 can reference Quick Reference**

The Quick Reference section contains the layout constants and depth sorting rules that Phase 7's subagents need. Confirm Phase 7 explicitly instructs subagents to use the Quick Reference section (it does — in 7.5 step 2: "The Quick Reference section from this skill").

If Phase 7 was accidentally appended *after* the Quick Reference section (at the very end of the file), that's fine — the skill is read in full before execution. No structural change needed.

- [ ] **Step 3: Final commit with complete message**

```bash
git add .claude/skills/opensquad-dashboard-design/SKILL.md
git commit -m "feat(dashboard-skill): complete Phase 7 FULL SPRITE REVIEW — smoke test verified"
```
