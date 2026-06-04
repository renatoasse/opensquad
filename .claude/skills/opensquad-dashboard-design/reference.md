# Opensquad Dashboard Design — Reference Guide

Reference material for the opensquad-dashboard-design skill. Consult this file during implementation phases when you need asset catalogs, code examples, or detailed technical guidance.

## Design Philosophy

A 2D virtual office is a **spatial metaphor for teamwork**. Unlike a plain status dashboard, it communicates:

- **Presence** — agents occupy physical space, they're *there*
- **Activity** — animations and desk state show who's working, idle, or done
- **Personality** — furniture, decorations, and layout choices create *culture*
- **Spatial relationships** — proximity implies collaboration; zones imply function

### What Makes a Great Virtual Office

GREAT OFFICE = functional zones + visual density + small details + warm lighting + lived-in clutter

**Functional zones** — not just a grid of desks. Real offices have:
- Work area (desks, monitors, chairs)
- Social area (couch, coffee table, plants)
- Wall decorations (whiteboards, clocks, posters, bookshelves)
- Transition elements (rugs defining zones, plants as dividers)

**Visual density** — empty space is the enemy. Every 3x3 tile area should have *something*:
- Corner plants, floor cushions, trash cans
- Wall posters, clocks, bulletin boards
- Cables, mugs, books, backpacks on or near desks

**Small details** — the magic that makes pixel art feel alive:
- A rug under the couch area, not floating on bare floor
- Plants in corners where walls meet
- A coffee machine or water cooler near the social area
- Bookshelves against the wall, not floating mid-room

**Lived-in clutter** — sterile = boring. Add:
- Books stacked on shelves, not perfectly aligned
- Multiple plant varieties (not the same plant repeated)
- Mixed furniture styles (not every desk identical)

---

## Zone Planning Template

```
┌──────────────────────────────────────────┐
│ WALL: blinds | bookshelf | whiteboard | clock | blinds │
├──────────────────────────────────────────┤
│                                          │
│  ┌─────┐  ┌─────┐  ┌─────┐              │
│  │Desk1│  │Desk2│  │Desk3│   ← Work Zone│
│  └─────┘  └─────┘  └─────┘              │
│  ┌─────┐  ┌─────┐  ┌─────┐              │
│  │Desk4│  │Desk5│  │Desk6│              │
│  └─────┘  └─────┘  └─────┘              │
│                                          │
│  🌿          ┌──────────┐          🌿   │
│              │  Couch +  │ ← Lounge Zone │
│              │  Table    │              │
│  🌺          └──────────┘          🌺   │
└──────────────────────────────────────────┘
```

---

## Phaser Rendering Config

The dashboard must always use pixel-perfect rendering. If you touch `PhaserGame.tsx` or the Phaser config:

```javascript
const config = {
    pixelArt: true,      // NEAREST filter on all textures — prevents blur on scale
    roundPixels: true,   // snap all objects to integer positions on GPU
    antialias: false,    // redundant with pixelArt:true but explicit
};
```

**CSS fallback** (apply to the canvas element):
```css
canvas { image-rendering: pixelated; image-rendering: crisp-edges; }
```

| Property | What it Does |
|----------|-------------|
| `pixelArt: true` | Sets all textures to `NEAREST` filter. Prevents blur on scale. |
| `roundPixels: true` | Snaps all texture objects to integer positions on GPU. |
| `antialias: false` | WebGL nearest-neighbor interpolation. |

---

## Rendering Pipeline

```
OfficeScene.preload()
  → Load all sprites from public/assets/ (desks, avatars, furniture)

OfficeScene.create()
  → RoomBuilder.build(roomW, roomH)
    → drawFloor()       // Graphics: wood base + checkerboard pattern
    → drawWalls()       // Graphics: wall color + baseboard trim
    → placeFurniture()  // Sprites: wall decorations + floor items
  → For each agent: new AgentSprite(scene, x, y, character, variant, agent)
    → Desk sprite (black/white × idle/coding)
    → Avatar sprite (character poses × 0.5 scale)
    → Name badge + status dot (Graphics)
    → Animation timer (talk/blink/wave cycles)
  → Camera: zoom to fit room, center
```

---

## Animation System

| Status | Animation | Cycle |
|--------|-----------|-------|
| `working` / `delivering` | talk ↔ blink | 500ms alternating |
| `done` | wave1 ↔ wave2 (4 frames) → hold blink | 400ms × 4, then static |
| `idle` | occasional talk → blink | random 2-4s intervals, 200ms talk |

### Animation Principles

- **Subtle > dramatic** — small movements (blink, occasional talk) feel alive without being distracting
- **Random intervals** — use `delay: 2000 + Math.random() * 2000` to avoid synchronized animations
- **Status-driven** — animation reflects agent state, not just decoration
- **Finite sequences** — "done" wave plays 4 frames then stops (don't loop forever)

---

## Asset Library

### Currently Installed (`dashboard/public/assets/`)

**Desks (6):** black/white × idle/coding/coding-alt
**Avatars (11 characters):** Jesse, Riley, Rose, Tanya + 7 NPCs — each with blink, talk, wave1, wave2
**Furniture (30+):** bookshelf, whiteboard, clock, plant1-3, flowers1-2, couch, rug, coffee_mug, blinds, coffee_table, armchair, backpacks, bulletin_board, cushions, lamps, monstera, picture_frame, posters, succulents, and more

### Available Asset Pack (`temp/pixel-assets/town/`)

**960+ sprites** ready to be copied into `dashboard/public/assets/`. Organized in 3 folders:

#### `temp/pixel-assets/town/assets/` — Furniture & Decorations

**Seating:**
- Armchairs: 10 colors × 4 orientations (black, blue, darkgrey, green, lightgrey, red, tan, white, yellow)
- Couches: 10 colors × 4 orientations (down, left, right, up)
- Floor cushions: 8 colors (blue, brown, dark_gray, green, light_gray, orange, purple, red)
- Chairs: office, bridge, brown, groovy, metal, red, white, wood — each with 4 orientations
- Stools, benches (park, red)

**Tables:**
- Wood: round, square, conference, skinny, various sizes (`[3x2]`, `[6x3]`, `[8x2]`)
- Metal: round, square, horizontal, vertical
- Cloth-covered: 8 colors (`[3x1]`, `[3x3]`, `[3x8]`)
- Coffee tables, small tables

**Desks & Workstations:**
- Grey, black, white, wood desks in various sizes
- Desk pods (vertical `[3x4]`)
- Art & design themed desks
- Cute wood light desks

**Storage & Shelves:**
- Bookshelves: wood dark in 6 sizes + alt styles + side views
- IKEA-style shelves: black/gray/white/wood, with or without stuff
- CD shelves, cabinets, dressers, lockers (grey/yellow, 4 variants each)

**Plants & Nature:**
- Potted plants: cat-tail, poof, spiky, spindly (dark/light)
- Monstera (2 sizes), magic plant (3 variants)
- Succulents: blue, bluegrey, green, spiky
- Bamboo, flowers (pot, vase), roses
- Trees: pine (3 seasons), topiary (3 seasons + planter)

**Tech & Office:**
- Monitors: front/back/side views
- Laptops: front/back/side, white variants
- Computer keyboard + mouse sets
- Projectors (3 colors) + projection screen
- Whiteboards: 4 blank/written/graph variants + standalone
- TVs: flat screen, on counter, on table

**Kitchen & Break Room:**
- Refrigerators: front/left/right
- Coffee makers, microwaves (3 orientations), water coolers
- Kitchen counters (horizontal, vertical, cute variants)
- Sinks, stoves, cutting boards
- Coffee mugs (blue, pink, red, white), kettles, water bottles
- Plates, bowls, cake variants

**Decorations:**
- Clocks: blue, red, purple
- Lamps: 5 colors + lanterns
- Posters: 7+ designs with active/inactive states
- Bulletin boards, picture frames, maps
- Rugs: green/purple/red in multiple sizes, fancy patterns, houndstooth
- Carpets: beige, gray in various sizes
- Fireplaces: wood/black, lit/unlit
- Blinds: large/small, open/closed, white/wood

**Portals & Doors:**
- Multiple door styles: brick, bluegrey, corpogrey, darkgrey, school
- Portals with colored shadows (black, white, yellow)
- Stairs: up/down/left/right

#### `temp/pixel-assets/town/avatars/` — Characters

- Named characters: Jesse, Riley, Rose, Tanya (multiple poses)
- NPCs: NPCE1-NPCE7 (multiple poses)
- Neutral variants: casual, hijab, staff, suits
- Seasonal costumes: Christmas, Halloween, Valentine, etc.

#### `temp/pixel-assets/town/objects/` — Additional Items

Extended collection of smaller objects and decorative items.

---

## Asset Integration Workflow

When adding new assets from the library:

```bash
# 1. Browse available assets
ls temp/pixel-assets/town/assets/ | grep -i "plant"

# 2. Copy to dashboard public folder
cp "temp/pixel-assets/town/assets/monstera.png" dashboard/public/assets/furniture/

# 3. Register in assetKeys.ts
# Add key to FURNITURE_KEYS and path to FURNITURE_PATHS

# 4. Place in RoomBuilder.ts placeFurniture()
# Use Y-based depth sorting

# 5. Test in browser — verify positioning and depth
```

### Asset Naming Convention

Files in `dashboard/public/assets/`:

```
assets/
  desks/       desktop_set_{color}_down_{state}.png
  furniture/   {item_name}.png (lowercase, underscores)
  avatars/     {CharacterName}_{pose}.png
```

Keys in assetKeys.ts:

```
// Furniture keys: descriptive, snake_case-ish
FURNITURE_KEYS = { bookshelf: 'furniture_bookshelf', ... }

// Desk keys: variant + state
DESK_KEYS = { blackIdle: 'desk_black_idle', ... }
```

---

## Room Sizing & Dynamic Layout

The room auto-sizes based on agent count:

```js
const roomW = maxCol * CELL_W + MARGIN * 2;
const roomH = maxRow * CELL_H + MARGIN * 2 + WALL_H + loungeSpace;
```

When placing furniture, use relative positions:
- `roomW / 2` for centered items
- `MARGIN / 2` for corner items
- `roomW / N` for evenly spaced wall decorations
- `deskAreaBottom + offset` for lounge zone items

---

## Camera & Viewport

The camera auto-fits the room:

```js
const scaleX = cam.width / roomW;
const scaleY = cam.height / roomH;
const zoom = Math.min(scaleX, scaleY, 2);  // Cap at 2x
cam.centerOn(roomW / 2, roomH / 2);
```

Keep in mind:
- Maximum zoom is 2x — sprites must look good at this scale
- Room is centered in viewport — leave breathing room at edges
- Sprites designed for 32px grid should be crisp at 1x and 2x
- **Always use integer zoom values** — non-integer zoom breaks pixel alignment
- `cam.roundPixels = true` must be set — prevents shimmer during any camera movement

---

## Color & Atmosphere

Current palette (palette.ts):
- Floor: warm wood `0xc4a882` with checkerboard alt `0xb89a72`
- Wall: soft cream `0xe4d8cc` with darker trim `0xa89888`
- Background: deep dark `0x1a1420`

Rules:
- Warm tones dominate — wood, cream, earth colors
- Accent with greens (plants), blues (monitors, status), and warm yellows (lamps)
- Avoid cold greys or stark whites — everything should feel cozy
- Status colors are distinct and reserved: idle=purple, working=blue, done=green, checkpoint=orange

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Empty corners and margins | Add plants, lamps, floor cushions, small furniture |
| All identical desk variants | Alternate black/white, add desk accessories nearby |
| Furniture floating mid-room | Anchor to walls, group in zones, place rugs underneath |
| Wrong depth — items behind when they should be in front | Set depth = Y position for floor items, 0 for wall items |
| Using `setOrigin(0, 0)` for floor sprites | Use `setOrigin(0.5, 1)` — bottom-center for Y-sort correctness |
| Ignoring wall decorations | Fill the wall strip — blinds, shelves, boards, clocks, posters |
| Repeating the same plant sprite | Use plant1, plant2, plant3, monstera, succulents — variety matters |
| Adding sprites without registering in assetKeys.ts | Every sprite needs a key in `FURNITURE_KEYS` + path in `FURNITURE_PATHS` |
| Hardcoding pixel positions | Use relative positioning based on `roomW`, `MARGIN`, `WALL_H`, `CELL_*` |
| Giant sprites that don't match the 32px grid | Scale down with `setScale()` or resize the PNG to fit the tile grid |
| Blurry sprites after scaling | Ensure `pixelArt: true` in Phaser config and `image-rendering: pixelated` in CSS |
| Shimmer or jitter during rendering | Set `roundPixels: true` in Phaser config and `cam.roundPixels = true` |
| Non-integer camera zoom | Always use whole numbers (1, 2) — fractional zoom breaks pixel alignment |
