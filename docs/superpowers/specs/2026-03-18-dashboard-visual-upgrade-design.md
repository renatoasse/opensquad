# Dashboard Visual Upgrade — Design Spec

**Date:** 2026-03-18
**Status:** Approved

## Summary

Upgrade the dashboard office visualization to match Gather.town-level detail while keeping the front-facing character perspective and procedural pixel-by-pixel rendering approach. Three main improvements: (1) higher-detail 48×48 character sprites with shading, (2) detailed workstations with accessories, (3) dark floating name cards above characters.

## Decisions

| Decision | Choice | Alternatives considered |
|----------|--------|------------------------|
| Character perspective | Front-facing (current) | Back view (Gather-style), ¾ view |
| Name card content | Emoji + name + status dot | Name only; Name + status |
| Furniture detail level | Full workstation + 2-3 accessories per agent | Essential only; Ultra-detailed with screen content |
| Sprite size | 48×48px (up from 32×32) | Keep 32×32; 64×64 |
| Rendering approach | Enhanced procedural (`px()` pixel-by-pixel) | Canvas 2D API; Pre-rendered sprite sheets |

## 1. Character Sprites (48×48)

### Current state
- 32×32px canvas, pixel-by-pixel via `px(ctx, x, y, color)`
- Flat colors: single tone per hair/skin/shirt
- Simple features: 2-pixel eyes, 3-pixel mouth, block arms/legs
- 3 poses: idle, working (2 frames), done

### New design
- 48×48px canvas, same `px()` approach
- Multi-tone shading: each color gets base + highlight + shadow variant
- Detailed features:
  - **Hair**: 3 tones (base + highlight + shadow), fuller coverage
  - **Face**: Eyes with white + pupil, eyebrows, subtle nose, expressive mouth
  - **Skin**: 2 tones (base + shadow) for volume on jaw, neck, ears
  - **Shirt**: Collar/neckline in white, 3-tone shading (light center, dark edges), visible sleeves
  - **Arms**: More proportional, hands with 2-3 visible fingers
  - **Belt**: With metallic buckle detail
  - **Pants**: Shading on sides and between legs
  - **Shoes**: Visible sole (lighter tone), detail on toe area
- Same 3 poses: idle (arms relaxed), working (arms at keyboard, 2-frame animation at 250ms), done (arms raised + smile)

### Expanded CharacterColors type

```typescript
type CharacterColors = {
  hair: number;       hairLight: number;    hairDark: number;
  skin: number;       skinShadow: number;
  shirt: number;      shirtLight: number;   shirtDark: number;
  pants: number;      pantsDark: number;
  shoe: number;       shoeLight: number;
}
```

Each of the 6 `CHARACTER_VARIANTS` will be expanded with these additional shading fields.

## 2. Workstation Detail

### Desk surface
- Wood grain texture: 3 alternating tones across horizontal strips
- Left/right edges with darker shade for depth
- Front face with 3D depth (edge color + shadow color below)
- Drop shadow on floor beneath desk

### Monitor
- Outer frame (dark) with inner bezel (slightly lighter)
- Screen area with faint content-hint lines (horizontal bars at low opacity)
- Top reflection highlight (1-2px white at low alpha)
- Webcam dot centered on top bezel
- Monitor chin/brand area below screen
- Stand: neck (narrow rectangle) + oval base with metallic highlight

### Keyboard
- Body with rounded edges and top-edge highlight
- Individual keys visible: 3×8 grid + spacebar row
- Keys rendered as lighter rectangles on dark body

### Mouse
- Ergonomic shape on a mousepad (dark rectangle)
- Two-tone body with left shadow edge
- Visible scroll wheel (lighter accent)
- Bottom edge shadow

### Chair (enhanced from current)
- Chair back: visible behind character as horizontal bar with highlight
- Armrests: vertical rectangles on sides with top highlight
- Seat cushion: darker rectangle with lighter inner fill
- Center pole: narrow rectangle below seat
- Star base: 5 casters with individual wheel rectangles, shadow beneath

### Desk accessories
Each agent receives 2-3 accessories selected deterministically by `agentIndex % N`. Accessory pool:

| Accessory | Pixels | Description |
|-----------|--------|-------------|
| Coffee mug | ~8×10 | White/gray body with handle, steam wisps (3 semi-transparent pixels above) |
| Mini plant | ~10×14 | Terra cotta pot with rim, green leaf cluster (circles in 2 green tones) |
| Post-it notes | ~8×8 | 2 overlapping squares (yellow + pink), faint text lines |
| Book stack | ~10×8 | 2-3 stacked colored rectangles with spine detail |
| Photo frame | ~8×10 | Dark frame border with colored interior |
| Water bottle | ~6×12 | Tall transparent-ish rectangle with cap |

Placement: accessories go on desk surface in the left and right zones (avoiding monitor/keyboard center area). Function signature: `drawDeskAccessories(g, x, y, agentIndex)`.

## 3. Name Card

### Visual design
- **Background**: `rgba(20, 20, 28, 0.92)` — near-black with slight transparency
- **Border radius**: 8px (well-rounded, matching Gather.town style)
- **Padding**: 3px vertical, 12px horizontal
- **Shadow**: `0 2px 8px rgba(0,0,0,0.4)` — soft shadow for depth (PixiJS dropShadow filter or manual dark rect offset)
- **Pointer**: Downward-pointing triangle centered below card, same background color, connecting card to character head

### Content layout (left to right)
1. **Agent emoji** — from squad YAML `icon` field (rendered as PixiJS Text)
2. **Agent name** — white, sans-serif (system font), 600 weight, 12px
3. **Status dot** — 7px circle, colored by agent status:
   - `idle`: `#aaaacc` (gray-lavender)
   - `working`: `#60b0ff` (cyan) with glow shadow (`0 0 4px rgba(96,176,255,0.5)`)
   - `done`: `#60f080` (green) with glow
   - `checkpoint`: `#ffbb22` (amber) with glow

### Position
- Centered horizontally above the character sprite
- Y position: negative offset from cell top (approximately `y - 24`)
- Rendered as the topmost layer (Layer 4) in AgentDesk

### Replaces
- Current `pixiText` for agent name at `(4, 2)` — removed
- Current `pixiText` for status at `(4, 14)` — removed (status now shown as dot in card)
- Current checkpoint bubble + "?" text — replaced by card's amber dot + checkpoint-specific behavior (card could pulse or show "?" emoji instead of agent emoji)

## 4. Cell Layout

### Grid constants (unchanged)
```
TILE = 32
CELL_W = 128  (4 tiles)
CELL_H = 128  (4 tiles)
SCENE_SCALE = 2
```

### GRID_OFFSET_Y adjustment
- **Current**: `TILE * 3` (96px)
- **New**: `TILE * 4` (128px)
- **Reason**: Extra 32px above first row to prevent name cards from being clipped

### New Y layout within cell (128px)
```
y-24  ── Name card background (overflow above cell)
y-4   ── Card pointer triangle
y+0   ── Cell top boundary
y+4   ── Desk surface starts
y+8   ── Monitor top
y+36  ── Monitor bottom / stand
y+44  ── Desk front edge
y+48  ── Keyboard + accessories zone
y+56  ── Chair back (visible behind character)
y+58  ── Character sprite top (48×48)
y+106 ── Character sprite bottom
y+108 ── Chair base / casters
y+128 ── Cell bottom boundary
```

### Character position
- X: `(CELL_W - 48) / 2 = 40` — centered
- Y: `58` — positioned so character overlaps desk front and sits in chair

### Layer order (unchanged approach)
1. **Back**: Chair back + monitor + desk surface + screen glow (when working)
2. **Middle**: Character sprite (48×48)
3. **Front**: Desk front edge + keyboard + mouse + accessories
4. **Top**: Name card (Graphics + Text, at negative Y)

## 5. Files Modified

| File | Scope of change |
|------|----------------|
| `palette.ts` | New shading colors, expanded `CharacterColors` type and `CHARACTER_VARIANTS`, new colors for accessories and name card background |
| `textures.ts` | Full rewrite — 48×48 canvas, detailed front-facing character with multi-tone shading, all 3 poses rebuilt |
| `drawDesk.ts` | Full rewrite — wood-grain desk, beveled monitor, detailed keyboard/mouse, enhanced chair, new `drawDeskAccessories()` function |
| `AgentDesk.tsx` | `GRID_OFFSET_Y` changed from `TILE*3` to `TILE*4`, updated Y offsets, new name card rendering (Graphics roundRect + triangle + Text for emoji/name + circle for status dot), removal of old text labels, sprite size 48×48, `agentIndex` passed to accessory drawing |
| `OfficeScene.tsx` | Minimal — adjusts only if wall/margin calculations need updating for new GRID_OFFSET_Y |

### Files NOT modified
- `drawRoom.ts` — floor/wall rendering stays the same
- `drawFurniture.ts` — bookshelf/plant/clock/whiteboard/coffee machine/filing cabinet unchanged
- `HandoffEnvelope.tsx` — envelope animation unchanged
- `palette.ts` TILE/CELL constants — unchanged

## 6. Data requirements

The name card needs the agent's emoji/icon. The `Agent` type in `types/state.ts` already includes an `icon` field (confirmed). No backend changes needed — the icon is already passed through to the frontend.

## 7. Risk and complexity notes

- **textures.ts rewrite is the largest task** — each pose is hundreds of `px()` calls. The idle pose should be built first and validated visually before doing working/done variants.
- **Accessory system** is additive and low-risk — can be implemented last as a polish step.
- **Name card** is a straightforward PixiJS Graphics+Text change in AgentDesk, moderate complexity.
- **No breaking changes** to the grid system, room rendering, or handoff animation.
