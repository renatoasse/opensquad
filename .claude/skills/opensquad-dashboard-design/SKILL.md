---
name: opensquad-dashboard-design
description: Use when creating, modifying, or designing 2D virtual office scenes for the opensquad dashboard — room layouts, furniture placement, avatar integration, environment design, or any visual improvement. Also use when the dashboard looks empty, flat, lifeless, or lacks personality.
---

# Opensquad Dashboard Design — Visual Office Workflow

Design and improve the opensquad dashboard's 2D virtual office through a structured workflow with visual verification. Every change is screenshot-verified before completion.

## Workflow

Follow these 6 phases in order. Do NOT skip phases or implement without diagnosis.

> **Phase 7 — FULL SPRITE REVIEW** is an optional audit phase triggered only when the user explicitly requests a full sprite audit (e.g. "faz o full sprite review", "revisa todos os sprites"). When triggered, it replaces phases 1–6 for that session — skip directly to 7.1 INVENTORY.

### Phase 1: UNDERSTAND

- Read the user's request carefully
- Identify what they want: layout change, new furniture, atmosphere fix, specific problem
- If the request is ambiguous, ask ONE clarifying question before proceeding
- Do NOT start implementing — move to Phase 2

### Phase 2: DIAGNOSE

Take a screenshot of the current dashboard state before any changes.

**Auto-detect dashboard URL:**
1. Check `dashboard/vite.config.ts` for `server.port`
2. Check `dashboard/package.json` scripts for `--port` flags
3. Fallback: `http://localhost:5173` (Vite default)

**Take screenshot via Playwright CLI** (Bash tool, NOT MCP Playwright tools):
```bash
npx playwright screenshot --browser chromium "URL" "/tmp/dashboard-before.png" --viewport-size "1400x900"
```
If `npx playwright screenshot` is unavailable, use a small inline Playwright script.

**If URL is unreachable:** tell the user to run `cd dashboard && npm run dev`.

**Analyze the screenshot:**
- Identify visible problems (empty zones, depth issues, floating sprites, poor framing)
- Emphasize problems related to the user's specific request
- Present findings to the user WITH the screenshot image

### Phase 3: PLAN

Based on diagnosis, propose an action plan:
- List specific changes grouped by file/area
- Group related changes together (independent groups can be parallelized)
- Ask clarifying questions if the diagnosis revealed ambiguity
- **WAIT for explicit user approval before proceeding to Phase 4**

### Phase 4: IMPLEMENT

**Group changes by independence:**
- Group A: `RoomBuilder.ts` (furniture placement, layout)
- Group B: `assetKeys.ts` + copy new asset files to `dashboard/public/assets/`
- Group C: `palette.ts` (colors, constants)
- Group D: `AgentSprite.ts` (animations, badges)

**Dispatch subagents** in parallel for independent groups. Each subagent receives:
- Description of changes to make
- The critical rules from the "Quick Reference" section below
- Instruction: read `.claude/skills/opensquad-dashboard-design/reference.md` if you need the asset catalog or code examples

**Respect dependencies:** assets copied first → keys registered in assetKeys.ts → placement in RoomBuilder.ts → visual adjustments.

### Phase 5: VERIFY

**Layer 1 — Screenshot:**
```bash
npx playwright screenshot --browser chromium "URL" "/tmp/dashboard-after.png" --viewport-size "1400x900"
```

**Layer 2 — Automated quality checklist:**
- [ ] No large empty zones visible
- [ ] Wall decorated (at least 1 item per wall section)
- [ ] Plants in corners (minimum 4)
- [ ] Lounge zone exists with seating + table + rug (if applicable)
- [ ] Depth sorting correct (lower objects render on top of higher ones)
- [ ] Sprite variety (max 2 identical items visible)
- [ ] Camera frames the room well with breathing room
- [ ] No hyperactive flickering or distracting animations

**Layer 3 — User approval:**
Present to the user:
1. The after-screenshot
2. Summary of what changed
3. Checklist results (pass/fail per item)

Ask: "O resultado ficou como esperado? Posso finalizar ou quer ajustes?"

- User approves → **DONE**
- User wants adjustments → Phase 6

### Phase 6: LOOP

- Collect the user's specific feedback
- Create a NEW focused plan addressing only the points raised
- Return to **Phase 4** (IMPLEMENT)
- Then **Phase 5** (VERIFY)
- Repeat until user approves

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
- **Origin** — the `.setOrigin(x, y)` value (or `(0.5, 0.5)` if not set)
- **Alpha** — the `.setAlpha()` value (or 1 if not set)

Do NOT skip any sprite. Include sprites inside loops (e.g. per-agent desk sprites).
For `AgentSprite.ts`, record only the four `Image` objects per agent: `avatar`, `deskTable`, `desk`, and `coffeeMug`. Exclude `Graphics` and `Text` objects — these are not sprites and are evaluated separately only if a white-background artifact is suspected.

#### 7.2 SCREENSHOT

Auto-detect the dashboard URL (same logic as Phase 2):
1. Check `dashboard/vite.config.ts` for `server.port`
2. Check `dashboard/package.json` scripts for `--port` flags
3. Fallback: `http://localhost:5173`

Take screenshot via Playwright CLI:
```bash
npx playwright screenshot --browser chromium "URL" "/tmp/sprite-review-before.png" --viewport-size "1400x900"
```
If `npx playwright screenshot` is unavailable, use a small inline Playwright script.

If URL is unreachable, tell the user to run `cd dashboard && npm run dev` and wait for confirmation before continuing.

Present the screenshot to the user and say: "Capturei o estado atual. Iniciando avaliação de cada sprite..."

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
| Desk base (deskTable) | Below the avatar, aligned with the work grid — not in the lounge zone or wall strip |

**Criterion 4 — Unwanted Overlap**
Check if a sprite visually covers another in a way that breaks scene logic:
- Plant rendered over an avatar's face → FAIL
- Rug floating visually above a couch → FAIL
- Two identical sprites stacked at the same pixel position → FAIL
- Desk partially clipped by a wall decoration → FAIL
- No scene-breaking overlaps visible → PASS

**UNCERTAIN rule:** If you cannot determine PASS or FAIL from the screenshot alone (e.g. the sprite is partially hidden, or the position rule doesn't clearly apply), mark it UNCERTAIN and note the specific question. You will ask the user about all UNCERTAIN sprites together in 7.4, before proceeding to 7.5.

**Invisible sprite rule:** If a sprite from the inventory is not visible in the screenshot at all (e.g. a per-agent desk sprite outside the visible viewport), mark all four criteria UNCERTAIN with note: "sprite not visible in screenshot."

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
npx playwright screenshot --browser chromium "URL" "/tmp/sprite-review-iter-N.png" --viewport-size "1400x900"
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

1. Present the final screenshot (`/tmp/sprite-review-iter-N.png` or `/tmp/sprite-review-before.png` if no iterations were needed)
2. Show a summary of what was fixed:
   - List each sprite that was corrected, with before/after description
   - List sprites that passed without changes
3. Show the final checklist with all items as PASS

Ask: "Todos os sprites passaram na revisão. O resultado ficou como esperado? Posso finalizar ou quer ajustes?"

- User approves → **DONE**
- User wants adjustments → collect feedback, return to **7.5 FIX** with a new targeted plan, then proceed through **7.6 RE-REVIEW** before returning to 7.7

## Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `dashboard/src/office/OfficeScene.ts` | Main Phaser scene — loads assets, builds room, places agents |
| `dashboard/src/office/RoomBuilder.ts` | Procedural floor/walls + sprite furniture placement |
| `dashboard/src/office/AgentSprite.ts` | Per-agent: desk sprite + avatar sprite + name badge + status |
| `dashboard/src/office/assetKeys.ts` | Asset manifest — all sprite keys and file paths |
| `dashboard/src/office/palette.ts` | Colors (status badges, floor, wall) + layout constants |
| `dashboard/src/office/PhaserGame.tsx` | React wrapper — Phaser game initialization |

### Layout Constants (palette.ts)

TILE   = 32   // Base grid unit (px)
CELL_W = 96   // 3 tiles — desk cell width
CELL_H = 96   // 3 tiles — desk cell height
MARGIN = 96   // 3 tiles — room edge padding
WALL_H = 96   // 3 tiles — wall strip height

### Depth Sorting

Y-based painter's algorithm — objects lower on screen render on top:

  Wall decorations:  setDepth(0)          — behind everything
  Rugs:              setDepth(-0.5)       — below furniture, above floor
  Floor furniture:   setDepth(y)          — Y position
  Agent desk:        setDepth(y)          — Y position
  Avatar:            setDepth(y + 1)      — on top of desk
  Name badge:        setDepth(y + 99/101) — always on top

**Rule:** anything closer to the bottom of the screen gets a higher depth value.

### Sprite Placement

  // WALL DECORATIONS — anchor to bottom of wall, depth 0
  scene.add.image(x, WALL_H, key).setOrigin(0.5, 1).setDepth(0);

  // FLOOR ITEMS — anchor to bottom of sprite, depth = Y
  scene.add.image(x, y, key).setOrigin(0.5, 1).setDepth(y);

  // UNDER FURNITURE (rugs) — depth = -0.5
  scene.add.image(x, y, key).setOrigin(0.5, 0.5).setDepth(-0.5);

**Origin conventions:**
- Wall items: `setOrigin(0.5, 1)` — bottom-center anchored to wall base
- Floor items: `setOrigin(0.5, 1)` — bottom-center for correct Y-sorting
- Rugs/carpets: `setOrigin(0.5, 0.5)` — center-anchored

**Relative positioning** — never hardcode pixels:
- `roomW / 2` for centered items
- `MARGIN / 2` for corner items
- `roomW / N` for evenly spaced wall decorations
- `deskAreaBottom + offset` for lounge zone items

### Visual Density

| Zone | Minimum Items | Examples |
|------|--------------|----------|
| Wall (per 5 sections) | 5 | blinds, bookshelf, whiteboard, clock, poster |
| Work area corners | 2 per corner | plant + flowers, or plant + trash can |
| Lounge zone | 4+ | couch + coffee table + rug + 2 plants |
| Between desk rows | 1 per gap | floor cushion, small plant, backpack |
| Room edges | 1 per 3 tiles | plants, lamps, small furniture |

## Important Rules

- **NEVER create pixel art from scratch** — always use existing assets from `dashboard/public/assets/` or the asset pack in `temp/pixel-assets/town/`
- **Every new sprite must be registered** in `assetKeys.ts` (FURNITURE_KEYS + FURNITURE_PATHS)
- **Consult reference.md** (`.claude/skills/opensquad-dashboard-design/reference.md`) for the full asset catalog, code examples, and detailed technical guidance during implementation
