# Dashboard Migration: PixiJS → Phaser 3 with Pixel Art Assets

## Summary

Rewrite the dashboard rendering layer from procedural PixiJS Graphics to Phaser 3 with pre-made pixel art sprites from the Gather.town-style asset pack. The goal is **visual fidelity** — replacing ~1800 lines of procedural drawing code with professional pixel art assets while keeping the dashboard read-only.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary goal | Visual fidelity | Assets look far better than procedural drawings |
| Interactivity | Read-only | No clicks, no tooltips — user watches agents work |
| Engine | Phaser 3 with tilemap | Native sprite animation, Y-sort depth, pixel-perfect scaling |
| Perspective | Top-down ¾ (Gather.town style) | Assets are top-down, not isometric — abandon iso system |
| Avatars | Pre-made from asset pack | 11 characters with blink/talk/wave animations |
| Handoff envelope | Removed | Status shown via agent animations and monitor sprites |
| Sprite creation | Never procedural | Use asset pack exclusively; procedural sprites are forbidden |

## Architecture

```
React App (unchanged shell)
├── SquadSelector, StatusBar, Header (React components — no changes)
└── PhaserGame.tsx (new React component)
    └── Phaser.Game canvas
        └── OfficeScene (Phaser.Scene)
            ├── Floor layer (tilemap or tiled background)
            ├── Wall sprites (top edge of room)
            ├── Furniture sprites (Y-sorted)
            ├── Agent desks (desktop_set sprites)
            ├── Agent avatars (animated sprites)
            └── UI overlays (name tags, status badges)
```

### React ↔ Phaser Communication

- **React → Phaser:** `scene.events.emit('stateUpdate', squadState)` when WebSocket updates arrive
- **No Phaser → React needed** (read-only dashboard)
- `PhaserGame.tsx` creates `Phaser.Game` on mount, destroys on unmount
- Receives `squadState` as React prop, forwards to scene via events

### Phaser Config

```typescript
{
  type: Phaser.AUTO,        // WebGL with Canvas fallback
  pixelArt: true,           // nearest-neighbor scaling (crisp pixels)
  zoom: 2,                  // 2x integer scaling
  backgroundColor: '#1a1420', // warm dark background
  scene: [OfficeScene],
  parent: containerRef       // mount into React div
}
```

## Perspective Change: Isometric → Top-down ¾

The asset pack uses **top-down ¾ perspective** (Gather.town / RPG Maker style), not isometric. This means:

- **Grid:** Simple cartesian (x, y) instead of isometric diamond projection
- **Depth sorting:** Objects sorted by Y coordinate (higher Y = closer to camera = rendered on top)
- **Tile size:** Determined by asset dimensions (likely 32×32 base tiles)
- **Delete:** All isometric math (`isoUtils.ts`, `toIso()`, `isoBox()`, `isoTile()`)

This is a simplification — the isometric projection code was the most complex part of the current renderer.

## Asset Mapping

### Files to Copy from `temp/pixel-assets/town/` → `dashboard/public/assets/`

#### Desks (`assets/desks/`)
| File | Purpose |
|------|---------|
| `objects/desktop_set_black_down.png` | Agent desk — idle state |
| `objects/desktop_set_black_down_coding.png` | Agent desk — working state (code on screen) |
| `objects/desktop_set_black_down_coding-1.png` | Agent desk — working state alt frame |
| `objects/desktop_set_white_down.png` | Agent desk variant — idle |
| `objects/desktop_set_white_down_coding.png` | Agent desk variant — working |
| `objects/desktop_set_white_down_coding-1.png` | Agent desk variant — working alt |

#### Avatars (`assets/avatars/`)
| Character | Files | Animations |
|-----------|-------|------------|
| Jesse | `Jesse_blink.png`, `Jesse_talk.png`, `Jesse_1wave.png`, `Jesse_2wave.png` | blink, talk, wave (2-frame) |
| Riley | `Riley_blink.png`, `Riley_talk.png`, `Riley_1wave.png`, `Riley_2wave.png` | blink, talk, wave |
| Rose | `Rose_blink.png`, `Rose_talk.png`, `Rose_1wave.png`, `Rose_2wave.png` | blink, talk, wave |
| Tanya | `Tanya_blink.png`, `Tanya_2wave.png` | blink, wave |
| NPCE1–7 | `NPCE{n}_blink.png`, `NPCE{n}_talk.png`, `NPCE{n}_wave.png` | blink, talk, wave |

**Assignment:** Round-robin by `agentIndex % 11` across: Jesse, Riley, Rose, Tanya, NPCE1-7.

**Animation mapping to agent status:**
| Agent Status | Avatar Animation | Desk Sprite |
|-------------|-----------------|-------------|
| `idle` | blink (loop) | desktop_set normal |
| `working` | talk (loop) | desktop_set_coding |
| `done` | wave (play once, then blink) | desktop_set normal |
| `checkpoint` | blink (loop) | desktop_set normal |

#### Furniture & Decoration (`assets/furniture/`)
| File | Purpose | Placement |
|------|---------|-----------|
| `assets/bookshelf_wood_dark [4x2].png` | Bookshelf | Against back wall |
| `assets/whiteboard_1.png` | Whiteboard | On back wall |
| `assets/clock blue [1x2].png` | Clock | On back wall |
| `assets/plant_spiky [1x2].png` | Plant | Corners / between desks |
| `assets/plant_spindly_light [1x2].png` | Plant variant | Corners |
| `assets/couch_blue_down [2x1].png` | Couch | Lounge area |
| `assets/fancy_rug [4x4].png` | Center rug | Center of room |
| `assets/coffee_mug_blue.png` | Coffee mug | On desks (accessory) |
| `objects/Blinds_Large_Open_wood.png` | Window blinds | On back wall |
| `objects/Table_Oval_Coffee_DarkWood_Down.png` | Coffee table | Near couch |

#### Room Structure
| Element | Approach |
|---------|----------|
| Floor | Solid color tiles or simple wood texture tilemap (32×32 grid) |
| Walls | `objects/BuldingBlocksTilesheet.png` — extract wall segments, or simple colored rectangle along top edge |
| Background | `backgroundColor: '#1a1420'` (warm dark, same as current) |

## Room Layout

```
┌──────────────────────────────────────────────┐
│  WALL: bookshelf | whiteboard | clock | blinds │
├──────────────────────────────────────────────┤
│                                              │
│  [desk+agent]    [desk+agent]    [desk+agent]│
│                                              │
│         [desk+agent]    [desk+agent]         │
│                                              │
│  plant          [rug]           plant        │
│                                              │
│  couch  coffee-table                         │
│                                              │
└──────────────────────────────────────────────┘
```

- Agents positioned on a simple grid: `col * CELL_W`, `row * CELL_H`
- Room size scales dynamically based on agent count (same behavior as current)
- Wall decorations placed at fixed positions along top edge
- Floor decorations placed at fixed positions around edges
- Depth sorting: all game objects sorted by Y coordinate via Phaser's built-in `depthSort()`

## Agent Status Visualization

Without the HandoffEnvelope, status is communicated through:

1. **Avatar animation** — idle/blink vs working/talk vs done/wave
2. **Desk sprite swap** — normal desk vs coding desk (code visible on monitor)
3. **Name badge** — colored dot indicator (same as current: blue=working, green=done, yellow=checkpoint, gray=idle)

Name badges rendered as Phaser Text + Graphics overlay on each agent, same compact pill style as current.

## File Structure (New)

```
dashboard/
├── public/
│   └── assets/
│       ├── avatars/          # Character sprites (blink, talk, wave per character)
│       ├── desks/            # desktop_set variants
│       ├── furniture/        # Plants, couch, bookshelf, etc.
│       └── tiles/            # Floor tiles, wall segments
├── src/
│   ├── office/
│   │   ├── PhaserGame.tsx    # React wrapper — creates/destroys Phaser.Game
│   │   ├── OfficeScene.ts    # Main Phaser Scene — room layout, agent management
│   │   ├── AgentSprite.ts    # Agent class — avatar + desk + name badge + status
│   │   ├── RoomBuilder.ts    # Builds floor, walls, decorations from assets
│   │   ├── assetKeys.ts      # Asset key constants and loader manifest
│   │   └── palette.ts        # Colors for badges, background (slimmed down)
│   ├── components/           # (unchanged)
│   ├── hooks/                # (unchanged)
│   ├── store/                # (unchanged)
│   └── types/                # (unchanged)
```

### Files Deleted

All current procedural rendering code:
- `drawDesk.ts` (~320 lines)
- `drawFurniture.ts` (~350 lines)
- `drawRoom.ts` (~166 lines)
- `isoUtils.ts` (~95 lines)
- `textures.ts` (~248 lines)
- `OfficeScene.tsx` (replaced by `PhaserGame.tsx` + `OfficeScene.ts`)
- `AgentDesk.tsx` (replaced by `AgentSprite.ts`)
- `HandoffEnvelope.tsx` (removed entirely)

### Files Modified

- `palette.ts` — Slimmed to just badge colors and layout constants (from ~258 lines to ~30)
- `App.tsx` — Replace `<OfficeScene>` with `<PhaserGame>`

### Dependencies

- **Add:** `phaser` (^3.87)
- **Remove:** `@pixi/react`, `pixi.js`

## Scope Boundaries

**In scope:**
- Replace PixiJS with Phaser 3
- Load all visuals from asset pack PNGs
- Animated avatars (blink/talk/wave per status)
- Desk sprite swapping (normal/coding per status)
- Name badges with status color dots
- Dynamic room sizing based on agent count
- Copy used assets from `temp/` to `dashboard/public/assets/`

**Out of scope:**
- Interactivity (clicking, dragging, tooltips)
- Camera controls (zoom, pan)
- Sound effects
- Modular avatar assembly (using pre-built characters only)
- Tilemap editor / Tiled integration (manual sprite placement is fine)
