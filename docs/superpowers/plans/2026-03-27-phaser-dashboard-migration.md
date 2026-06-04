# Phaser Dashboard Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the PixiJS procedural rendering dashboard with Phaser 3 using pre-made pixel art sprites from the Gather.town-style asset pack.

**Architecture:** React shell stays untouched. A new `PhaserGame.tsx` component wraps a Phaser 3 canvas that renders the office scene. The scene uses pre-made PNG sprites for everything — desks, avatars, furniture, floor/walls. Top-down ¾ perspective with Y-sort depth replaces the current isometric system.

**Tech Stack:** Phaser 3, React 19, Zustand, Vite, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-27-phaser-dashboard-migration-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `dashboard/public/assets/avatars/*.png` | Create (copy) | 11 character sprites × 3-5 poses each |
| `dashboard/public/assets/desks/*.png` | Create (copy) | desktop_set black/white × normal/coding |
| `dashboard/public/assets/furniture/*.png` | Create (copy) | Bookshelf, plants, couch, rug, whiteboard, clock, blinds, coffee table, coffee mug |
| `dashboard/src/office/assetKeys.ts` | Create | Asset key constants, loader manifest, character roster |
| `dashboard/src/office/PhaserGame.tsx` | Create | React wrapper that creates/destroys Phaser.Game, bridges React state to scene |
| `dashboard/src/office/OfficeScene.ts` | Create | Main Phaser Scene — preload, create room, manage agents |
| `dashboard/src/office/AgentSprite.ts` | Create | Agent class — avatar sprite + desk sprite + name badge + status |
| `dashboard/src/office/RoomBuilder.ts` | Create | Builds floor, walls, furniture from sprites |
| `dashboard/src/office/palette.ts` | Rewrite | Slim down to badge colors + layout constants only (~30 lines) |
| `dashboard/src/App.tsx` | Modify | Swap `<OfficeScene>` → `<PhaserGame>` |
| `dashboard/package.json` | Modify | Add phaser, remove @pixi/react + pixi.js |
| `dashboard/src/office/drawDesk.ts` | Delete | Replaced by desk sprites |
| `dashboard/src/office/drawFurniture.ts` | Delete | Replaced by furniture sprites |
| `dashboard/src/office/drawRoom.ts` | Delete | Replaced by RoomBuilder |
| `dashboard/src/office/isoUtils.ts` | Delete | Isometric math no longer needed |
| `dashboard/src/office/textures.ts` | Delete | Procedural characters removed |
| `dashboard/src/office/OfficeScene.tsx` | Delete | Replaced by PhaserGame.tsx + OfficeScene.ts |
| `dashboard/src/office/AgentDesk.tsx` | Delete | Replaced by AgentSprite.ts |
| `dashboard/src/office/HandoffEnvelope.tsx` | Delete | Removed entirely |

---

### Task 1: Copy Assets and Swap Dependencies

**Files:**
- Create: `dashboard/public/assets/avatars/` (copy PNGs)
- Create: `dashboard/public/assets/desks/` (copy PNGs)
- Create: `dashboard/public/assets/furniture/` (copy PNGs)
- Modify: `dashboard/package.json`

- [ ] **Step 1: Create asset directories and copy desk sprites**

```bash
cd d:/Coding\ Projects/opensquad
mkdir -p dashboard/public/assets/desks
cp "temp/pixel-assets/town/objects/desktop_set_black_down.png" dashboard/public/assets/desks/
cp "temp/pixel-assets/town/objects/desktop_set_black_down_coding.png" dashboard/public/assets/desks/
cp "temp/pixel-assets/town/objects/desktop_set_black_down_coding-1.png" dashboard/public/assets/desks/
cp "temp/pixel-assets/town/objects/desktop_set_white_down.png" dashboard/public/assets/desks/
cp "temp/pixel-assets/town/objects/desktop_set_white_down_coding.png" dashboard/public/assets/desks/
cp "temp/pixel-assets/town/objects/desktop_set_white_down_coding-1.png" dashboard/public/assets/desks/
```

- [ ] **Step 2: Copy avatar sprites**

```bash
mkdir -p dashboard/public/assets/avatars
# Named characters (blink, talk, wave frames)
for name in Jesse Riley Rose Tanya; do
  cp "temp/pixel-assets/town/avatars/${name}_blink.png" dashboard/public/assets/avatars/
  cp "temp/pixel-assets/town/avatars/${name}_talk.png" dashboard/public/assets/avatars/
  cp "temp/pixel-assets/town/avatars/${name}_1wave.png" dashboard/public/assets/avatars/
  cp "temp/pixel-assets/town/avatars/${name}_2wave.png" dashboard/public/assets/avatars/
done
# NPC characters (blink, talk, wave)
for n in 1 2 3 4 5 6 7; do
  cp "temp/pixel-assets/town/avatars/NPCE${n}_blink.png" dashboard/public/assets/avatars/
  cp "temp/pixel-assets/town/avatars/NPCE${n}_talk.png" dashboard/public/assets/avatars/
  cp "temp/pixel-assets/town/avatars/NPCE${n}_wave.png" dashboard/public/assets/avatars/
done
```

- [ ] **Step 3: Copy furniture sprites**

```bash
mkdir -p dashboard/public/assets/furniture
cp "temp/pixel-assets/town/assets/bookshelf_wood_dark [4x2].png" "dashboard/public/assets/furniture/bookshelf.png"
cp "temp/pixel-assets/town/assets/whiteboard_1.png" "dashboard/public/assets/furniture/whiteboard.png"
cp "temp/pixel-assets/town/assets/clock blue [1x2].png" "dashboard/public/assets/furniture/clock.png"
cp "temp/pixel-assets/town/assets/plant_spiky [1x2].png" "dashboard/public/assets/furniture/plant1.png"
cp "temp/pixel-assets/town/assets/plant_spindly_light [1x2].png" "dashboard/public/assets/furniture/plant2.png"
cp "temp/pixel-assets/town/assets/couch_blue_down [2x1].png" "dashboard/public/assets/furniture/couch.png"
cp "temp/pixel-assets/town/assets/fancy_rug [4x4].png" "dashboard/public/assets/furniture/rug.png"
cp "temp/pixel-assets/town/assets/coffee_mug_blue.png" "dashboard/public/assets/furniture/coffee_mug.png"
cp "temp/pixel-assets/town/objects/Blinds_Large_Open_wood.png" "dashboard/public/assets/furniture/blinds.png"
cp "temp/pixel-assets/town/objects/Table_Oval_Coffee_DarkWood_Down.png" "dashboard/public/assets/furniture/coffee_table.png"
```

- [ ] **Step 4: Swap dependencies**

```bash
cd dashboard
npm uninstall @pixi/react pixi.js
npm install phaser@^3.87
```

- [ ] **Step 5: Commit**

```bash
cd d:/Coding\ Projects/opensquad
git add dashboard/public/assets/ dashboard/package.json dashboard/package-lock.json
git commit -m "feat(dashboard): copy pixel art assets and swap pixi→phaser dependency"
```

---

### Task 2: Asset Keys and Palette

**Files:**
- Create: `dashboard/src/office/assetKeys.ts`
- Rewrite: `dashboard/src/office/palette.ts`

- [ ] **Step 1: Create assetKeys.ts**

Create `dashboard/src/office/assetKeys.ts`:

```typescript
// Asset key constants for Phaser loader
// All paths relative to /assets/ in public/

// --- Characters ---
// Named characters have: blink, talk, 1wave, 2wave
// NPCs have: blink, talk, wave
export const CHARACTER_NAMES = [
  'Jesse', 'Riley', 'Rose', 'Tanya',
  'NPCE1', 'NPCE2', 'NPCE3', 'NPCE4', 'NPCE5', 'NPCE6', 'NPCE7',
] as const;

export type CharacterName = typeof CHARACTER_NAMES[number];

// Returns the asset keys for a character's animation frames
export function avatarKeys(name: CharacterName) {
  return {
    blink: `avatar_${name}_blink`,
    talk: `avatar_${name}_talk`,
    wave1: `avatar_${name}_wave1`,
    wave2: `avatar_${name}_wave2`,
  };
}

// Returns the file path for a character sprite
export function avatarPath(name: CharacterName, pose: string): string {
  // Named characters use _1wave/_2wave, NPCs use _wave (single frame)
  if (pose === 'wave1') {
    return name.startsWith('NPCE')
      ? `assets/avatars/${name}_wave.png`
      : `assets/avatars/${name}_1wave.png`;
  }
  if (pose === 'wave2') {
    return name.startsWith('NPCE')
      ? `assets/avatars/${name}_wave.png`  // NPCs reuse same frame
      : `assets/avatars/${name}_2wave.png`;
  }
  return `assets/avatars/${name}_${pose}.png`;
}

// --- Desks ---
export const DESK_KEYS = {
  blackIdle: 'desk_black_idle',
  blackCoding: 'desk_black_coding',
  blackCodingAlt: 'desk_black_coding_alt',
  whiteIdle: 'desk_white_idle',
  whiteCoding: 'desk_white_coding',
  whiteCodingAlt: 'desk_white_coding_alt',
} as const;

export const DESK_PATHS: Record<string, string> = {
  [DESK_KEYS.blackIdle]: 'assets/desks/desktop_set_black_down.png',
  [DESK_KEYS.blackCoding]: 'assets/desks/desktop_set_black_down_coding.png',
  [DESK_KEYS.blackCodingAlt]: 'assets/desks/desktop_set_black_down_coding-1.png',
  [DESK_KEYS.whiteIdle]: 'assets/desks/desktop_set_white_down.png',
  [DESK_KEYS.whiteCoding]: 'assets/desks/desktop_set_white_down_coding.png',
  [DESK_KEYS.whiteCodingAlt]: 'assets/desks/desktop_set_white_down_coding-1.png',
};

// --- Furniture ---
export const FURNITURE_KEYS = {
  bookshelf: 'furniture_bookshelf',
  whiteboard: 'furniture_whiteboard',
  clock: 'furniture_clock',
  plant1: 'furniture_plant1',
  plant2: 'furniture_plant2',
  couch: 'furniture_couch',
  rug: 'furniture_rug',
  coffeeMug: 'furniture_coffee_mug',
  blinds: 'furniture_blinds',
  coffeeTable: 'furniture_coffee_table',
} as const;

export const FURNITURE_PATHS: Record<string, string> = {
  [FURNITURE_KEYS.bookshelf]: 'assets/furniture/bookshelf.png',
  [FURNITURE_KEYS.whiteboard]: 'assets/furniture/whiteboard.png',
  [FURNITURE_KEYS.clock]: 'assets/furniture/clock.png',
  [FURNITURE_KEYS.plant1]: 'assets/furniture/plant1.png',
  [FURNITURE_KEYS.plant2]: 'assets/furniture/plant2.png',
  [FURNITURE_KEYS.couch]: 'assets/furniture/couch.png',
  [FURNITURE_KEYS.rug]: 'assets/furniture/rug.png',
  [FURNITURE_KEYS.coffeeMug]: 'assets/furniture/coffee_mug.png',
  [FURNITURE_KEYS.blinds]: 'assets/furniture/blinds.png',
  [FURNITURE_KEYS.coffeeTable]: 'assets/furniture/coffee_table.png',
};
```

- [ ] **Step 2: Rewrite palette.ts**

Replace `dashboard/src/office/palette.ts` entirely with:

```typescript
// Slimmed palette — only badge colors and layout constants
// All visual rendering now uses sprite assets, not procedural colors

export const COLORS = {
  // Status badge dots
  statusIdle: 0xaaaacc,
  statusWorking: 0x60b0ff,
  statusDone: 0x60f080,
  statusCheckpoint: 0xffbb22,

  // Name badge
  nameCardBg: 0x14141c,
  nameCardText: 0xffffff,

  // Background
  background: 0x1a1420,

  // Floor fill (warm wood)
  floor: 0xc4a882,
  floorAlt: 0xb89a72,

  // Wall fill
  wall: 0xe4d8cc,
  wallTrim: 0xa89888,
} as const;

// Layout constants
export const TILE = 32;           // Base tile size in pixels
export const CELL_W = 4 * TILE;   // 128px — desk cell width
export const CELL_H = 4 * TILE;   // 128px — desk cell height
export const MARGIN = 2 * TILE;   // 64px — room edge margin
export const WALL_H = 2 * TILE;   // 64px — wall strip height at top
```

- [ ] **Step 3: Verify TypeScript compiles (expect errors from deleted imports — that's fine)**

```bash
cd d:/Coding\ Projects/opensquad/dashboard
npx tsc --noEmit 2>&1 | head -20
```

Expected: errors about missing OfficeScene/AgentDesk imports. These will be resolved in later tasks.

- [ ] **Step 4: Commit**

```bash
cd d:/Coding\ Projects/opensquad
git add dashboard/src/office/assetKeys.ts dashboard/src/office/palette.ts
git commit -m "feat(dashboard): add asset keys manifest and slim down palette"
```

---

### Task 3: PhaserGame React Wrapper

**Files:**
- Create: `dashboard/src/office/PhaserGame.tsx`

- [ ] **Step 1: Create PhaserGame.tsx**

Create `dashboard/src/office/PhaserGame.tsx`:

```typescript
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { OfficeScene } from './OfficeScene';
import { useSquadStore } from '@/store/useSquadStore';
import { COLORS } from './palette';

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  // Create Phaser game on mount
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      pixelArt: true,
      zoom: 2,
      backgroundColor: COLORS.background,
      scene: [OfficeScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // Bridge React state → Phaser scene
  useEffect(() => {
    return useSquadStore.subscribe((state) => {
      const game = gameRef.current;
      if (!game) return;
      const scene = game.scene.getScene('OfficeScene') as OfficeScene | null;
      if (!scene || !scene.scene.isActive()) return;

      const selectedSquad = state.selectedSquad;
      const squadState = selectedSquad
        ? state.activeStates.get(selectedSquad) ?? null
        : null;

      scene.events.emit('stateUpdate', squadState);
    });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflow: 'hidden',
        imageRendering: 'pixelated',
      }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd d:/Coding\ Projects/opensquad
git add dashboard/src/office/PhaserGame.tsx
git commit -m "feat(dashboard): add PhaserGame React wrapper component"
```

---

### Task 4: OfficeScene — Preload and Basic Room

**Files:**
- Create: `dashboard/src/office/OfficeScene.ts`
- Create: `dashboard/src/office/RoomBuilder.ts`

- [ ] **Step 1: Create RoomBuilder.ts**

Create `dashboard/src/office/RoomBuilder.ts`:

```typescript
import Phaser from 'phaser';
import { COLORS, TILE, MARGIN, WALL_H } from './palette';
import { FURNITURE_KEYS } from './assetKeys';

export class RoomBuilder {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Build the full room: floor, walls, and furniture.
   * Call after all assets are loaded.
   * @param roomW - room width in pixels
   * @param roomH - room height in pixels
   */
  build(roomW: number, roomH: number): void {
    this.drawFloor(roomW, roomH);
    this.drawWalls(roomW);
    this.placeFurniture(roomW, roomH);
  }

  private drawFloor(roomW: number, roomH: number): void {
    const g = this.scene.add.graphics();
    // Main floor fill
    g.fillStyle(COLORS.floor, 1);
    g.fillRect(0, WALL_H, roomW, roomH - WALL_H);
    // Alternating tile grid for subtle texture
    g.fillStyle(COLORS.floorAlt, 0.3);
    for (let y = WALL_H; y < roomH; y += TILE) {
      for (let x = 0; x < roomW; x += TILE) {
        if ((x / TILE + y / TILE) % 2 === 0) {
          g.fillRect(x, y, TILE, TILE);
        }
      }
    }
    g.setDepth(-2);
  }

  private drawWalls(roomW: number): void {
    const g = this.scene.add.graphics();
    // Wall background
    g.fillStyle(COLORS.wall, 1);
    g.fillRect(0, 0, roomW, WALL_H);
    // Baseboard trim
    g.fillStyle(COLORS.wallTrim, 1);
    g.fillRect(0, WALL_H - 4, roomW, 4);
    g.setDepth(-1);
  }

  placeFurniture(roomW: number, roomH: number): void {
    const s = this.scene;
    const centerX = roomW / 2;

    // Wall decorations (placed on the wall strip, low Y = behind everything)
    // Bookshelf — left side of wall
    s.add.image(MARGIN + 64, WALL_H - 16, FURNITURE_KEYS.bookshelf)
      .setOrigin(0.5, 1).setDepth(0);

    // Whiteboard — center of wall
    s.add.image(centerX, WALL_H - 20, FURNITURE_KEYS.whiteboard)
      .setOrigin(0.5, 1).setDepth(0);

    // Clock — right of whiteboard
    s.add.image(centerX + 100, WALL_H - 28, FURNITURE_KEYS.clock)
      .setOrigin(0.5, 1).setDepth(0);

    // Blinds — right side of wall
    s.add.image(roomW - MARGIN - 40, WALL_H - 16, FURNITURE_KEYS.blinds)
      .setOrigin(0.5, 1).setDepth(0);

    // Floor decorations (placed by Y for depth sorting)
    // Rug — center
    s.add.image(centerX, roomH * 0.65, FURNITURE_KEYS.rug)
      .setOrigin(0.5, 0.5).setDepth(roomH * 0.65);

    // Plants — corners
    s.add.image(MARGIN, roomH * 0.5, FURNITURE_KEYS.plant1)
      .setOrigin(0.5, 1).setDepth(roomH * 0.5);
    s.add.image(roomW - MARGIN, roomH * 0.5, FURNITURE_KEYS.plant2)
      .setOrigin(0.5, 1).setDepth(roomH * 0.5);

    // Couch + coffee table — bottom left
    const couchY = roomH - MARGIN - TILE;
    s.add.image(MARGIN + 48, couchY, FURNITURE_KEYS.couch)
      .setOrigin(0.5, 1).setDepth(couchY);
    s.add.image(MARGIN + 48 + 80, couchY - 8, FURNITURE_KEYS.coffeeTable)
      .setOrigin(0.5, 1).setDepth(couchY - 8);
  }
}
```

- [ ] **Step 2: Create OfficeScene.ts**

Create `dashboard/src/office/OfficeScene.ts`:

```typescript
import Phaser from 'phaser';
import {
  CHARACTER_NAMES, avatarKeys, avatarPath,
  DESK_KEYS, DESK_PATHS,
  FURNITURE_KEYS, FURNITURE_PATHS,
} from './assetKeys';
import { TILE, CELL_W, CELL_H, MARGIN, WALL_H } from './palette';
import { RoomBuilder } from './RoomBuilder';
import { AgentSprite } from './AgentSprite';
import type { SquadState, Agent } from '@/types/state';

// Demo agents for preview when no squad is active
const DEMO_AGENTS: Agent[] = [
  { id: '1', name: 'Researcher', icon: '', status: 'working', deliverTo: null, desk: { col: 1, row: 1 } },
  { id: '2', name: 'Writer', icon: '', status: 'idle', deliverTo: null, desk: { col: 2, row: 1 } },
  { id: '3', name: 'Editor', icon: '', status: 'done', deliverTo: null, desk: { col: 3, row: 1 } },
  { id: '4', name: 'Designer', icon: '', status: 'working', deliverTo: null, desk: { col: 1, row: 2 } },
  { id: '5', name: 'Reviewer', icon: '', status: 'checkpoint', deliverTo: null, desk: { col: 2, row: 2 } },
  { id: '6', name: 'Publisher', icon: '', status: 'idle', deliverTo: null, desk: { col: 3, row: 2 } },
];

export class OfficeScene extends Phaser.Scene {
  private agentSprites: Map<string, AgentSprite> = new Map();
  private roomBuilder!: RoomBuilder;
  private currentState: SquadState | null = null;

  constructor() {
    super({ key: 'OfficeScene' });
  }

  preload(): void {
    // Load desk sprites
    for (const [key, path] of Object.entries(DESK_PATHS)) {
      this.load.image(key, path);
    }

    // Load avatar sprites
    for (const name of CHARACTER_NAMES) {
      const keys = avatarKeys(name);
      this.load.image(keys.blink, avatarPath(name, 'blink'));
      this.load.image(keys.talk, avatarPath(name, 'talk'));
      this.load.image(keys.wave1, avatarPath(name, 'wave1'));
      this.load.image(keys.wave2, avatarPath(name, 'wave2'));
    }

    // Load furniture sprites
    for (const [key, path] of Object.entries(FURNITURE_PATHS)) {
      this.load.image(key, path);
    }
  }

  create(): void {
    this.roomBuilder = new RoomBuilder(this);

    // Listen for state updates from React
    this.events.on('stateUpdate', (state: SquadState | null) => {
      this.onStateUpdate(state);
    });

    // Render demo scene initially
    this.renderScene(DEMO_AGENTS);
  }

  private onStateUpdate(state: SquadState | null): void {
    this.currentState = state;
    const agents = state?.agents ?? DEMO_AGENTS;
    this.renderScene(agents);
  }

  private renderScene(agents: Agent[]): void {
    // Calculate room dimensions from agent grid
    let maxCol = 0, maxRow = 0;
    for (const agent of agents) {
      maxCol = Math.max(maxCol, agent.desk.col);
      maxRow = Math.max(maxRow, agent.desk.row);
    }
    const roomW = maxCol * CELL_W + MARGIN * 2;
    const roomH = maxRow * CELL_H + MARGIN * 2 + WALL_H;

    // Clear existing sprites
    this.clearScene();

    // Build room
    this.roomBuilder.build(roomW, roomH);

    // Place agents
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const x = (agent.desk.col - 1) * CELL_W + MARGIN + CELL_W / 2;
      const y = (agent.desk.row - 1) * CELL_H + MARGIN + WALL_H + CELL_H / 2;

      const characterName = CHARACTER_NAMES[i % CHARACTER_NAMES.length];
      const deskVariant = i % 2 === 0 ? 'black' : 'white';

      const agentSprite = new AgentSprite(this, x, y, characterName, deskVariant, agent);
      this.agentSprites.set(agent.id, agentSprite);
    }

    // Resize the game canvas to fit the room (at 2x zoom)
    this.scale.setGameSize(roomW, roomH);
  }

  private clearScene(): void {
    // Destroy all agent sprites
    for (const sprite of this.agentSprites.values()) {
      sprite.destroy();
    }
    this.agentSprites.clear();

    // Clear all game objects (floor, walls, furniture)
    this.children.removeAll(true);
  }
}
```

- [ ] **Step 3: Commit**

```bash
cd d:/Coding\ Projects/opensquad
git add dashboard/src/office/OfficeScene.ts dashboard/src/office/RoomBuilder.ts
git commit -m "feat(dashboard): add OfficeScene and RoomBuilder with Phaser"
```

---

### Task 5: AgentSprite — Avatar, Desk, and Name Badge

**Files:**
- Create: `dashboard/src/office/AgentSprite.ts`

- [ ] **Step 1: Create AgentSprite.ts**

Create `dashboard/src/office/AgentSprite.ts`:

```typescript
import Phaser from 'phaser';
import { avatarKeys, DESK_KEYS, type CharacterName } from './assetKeys';
import { COLORS } from './palette';
import type { Agent, AgentStatus } from '@/types/state';

// Avatar display size (original is 960x640, scale to fit ~32px wide)
const AVATAR_SCALE = 32 / 960;

// Status → badge color mapping
const STATUS_COLORS: Record<AgentStatus, number> = {
  idle: COLORS.statusIdle,
  working: COLORS.statusWorking,
  done: COLORS.statusDone,
  checkpoint: COLORS.statusCheckpoint,
  delivering: COLORS.statusWorking, // treat delivering same as working
};

export class AgentSprite {
  private scene: Phaser.Scene;
  private desk: Phaser.GameObjects.Image;
  private avatar: Phaser.GameObjects.Image;
  private nameText: Phaser.GameObjects.Text;
  private badgeBg: Phaser.GameObjects.Graphics;
  private badgeDot: Phaser.GameObjects.Graphics;
  private animTimer?: Phaser.Time.TimerEvent;
  private agent: Agent;
  private characterName: CharacterName;
  private deskVariant: 'black' | 'white';

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    characterName: CharacterName,
    deskVariant: 'black' | 'white',
    agent: Agent,
  ) {
    this.scene = scene;
    this.agent = agent;
    this.characterName = characterName;
    this.deskVariant = deskVariant;

    // Desk sprite (centered at position)
    const deskKey = this.getDeskKey(agent.status);
    this.desk = scene.add.image(x, y, deskKey).setOrigin(0.5, 0.5);
    this.desk.setDepth(y);

    // Avatar sprite (above desk)
    const avatarKey = this.getAvatarKey(agent.status);
    this.avatar = scene.add.image(x, y - 20, avatarKey)
      .setOrigin(0.5, 1)
      .setScale(AVATAR_SCALE);
    this.avatar.setDepth(y + 1);

    // Name badge background
    this.badgeBg = scene.add.graphics();
    this.badgeDot = scene.add.graphics();

    // Name text
    this.nameText = scene.add.text(x, y + 20, agent.name, {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0);
    this.nameText.setDepth(y + 10);

    // Draw badge
    this.drawBadge(x, y + 20, agent);

    // Start animation loop
    this.startAnimation(agent.status);
  }

  private getDeskKey(status: AgentStatus): string {
    const variant = this.deskVariant;
    if (status === 'working' || status === 'delivering') {
      return variant === 'black' ? DESK_KEYS.blackCoding : DESK_KEYS.whiteCoding;
    }
    return variant === 'black' ? DESK_KEYS.blackIdle : DESK_KEYS.whiteIdle;
  }

  private getAvatarKey(status: AgentStatus): string {
    const keys = avatarKeys(this.characterName);
    switch (status) {
      case 'working':
      case 'delivering':
        return keys.talk;
      case 'done':
        return keys.wave1;
      default:
        return keys.blink;
    }
  }

  private drawBadge(x: number, y: number, agent: Agent): void {
    const textW = this.nameText.width;
    const badgeW = textW + 16;
    const badgeH = 12;
    const badgeX = x - badgeW / 2;

    // Badge background pill
    this.badgeBg.fillStyle(COLORS.nameCardBg, 0.85);
    this.badgeBg.fillRoundedRect(badgeX, y - 1, badgeW, badgeH, 3);
    this.badgeBg.setDepth(y + 9);

    // Status dot
    const dotColor = STATUS_COLORS[agent.status] ?? COLORS.statusIdle;
    this.badgeDot.fillStyle(dotColor, 1);
    this.badgeDot.fillCircle(badgeX + 5, y + badgeH / 2 - 1, 2);
    this.badgeDot.setDepth(y + 11);
  }

  private startAnimation(status: AgentStatus): void {
    const keys = avatarKeys(this.characterName);

    if (status === 'working' || status === 'delivering') {
      // Alternate between talk and blink every 500ms
      let frame = 0;
      this.animTimer = this.scene.time.addEvent({
        delay: 500,
        loop: true,
        callback: () => {
          frame = (frame + 1) % 2;
          this.avatar.setTexture(frame === 0 ? keys.talk : keys.blink);
        },
      });
    } else if (status === 'done') {
      // Wave animation: alternate wave1/wave2, then settle to blink
      let frame = 0;
      let waveCount = 0;
      this.animTimer = this.scene.time.addEvent({
        delay: 400,
        loop: true,
        callback: () => {
          if (waveCount < 4) {
            frame = (frame + 1) % 2;
            this.avatar.setTexture(frame === 0 ? keys.wave1 : keys.wave2);
            waveCount++;
          } else {
            this.avatar.setTexture(keys.blink);
            this.animTimer?.destroy();
          }
        },
      });
    } else {
      // Idle: blink occasionally
      this.animTimer = this.scene.time.addEvent({
        delay: 2000 + Math.random() * 2000,
        loop: true,
        callback: () => {
          this.avatar.setTexture(keys.talk); // "blink" using talk frame
          this.scene.time.delayedCall(200, () => {
            this.avatar.setTexture(keys.blink);
          });
        },
      });
    }
  }

  updateStatus(agent: Agent): void {
    if (this.agent.status === agent.status) return;
    this.agent = agent;

    // Update desk
    this.desk.setTexture(this.getDeskKey(agent.status));

    // Update avatar
    this.avatar.setTexture(this.getAvatarKey(agent.status));

    // Restart animation
    this.animTimer?.destroy();
    this.startAnimation(agent.status);

    // Redraw badge dot
    this.badgeDot.clear();
    const dotColor = STATUS_COLORS[agent.status] ?? COLORS.statusIdle;
    this.badgeDot.fillStyle(dotColor, 1);
    // Approximate position — derived from badge
    const badgeX = this.nameText.x - (this.nameText.width + 16) / 2;
    this.badgeDot.fillCircle(badgeX + 5, this.nameText.y + 5, 2);
  }

  destroy(): void {
    this.animTimer?.destroy();
    this.desk.destroy();
    this.avatar.destroy();
    this.nameText.destroy();
    this.badgeBg.destroy();
    this.badgeDot.destroy();
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd d:/Coding\ Projects/opensquad
git add dashboard/src/office/AgentSprite.ts
git commit -m "feat(dashboard): add AgentSprite with avatar animations and status badges"
```

---

### Task 6: Wire Up App.tsx and Delete Old Code

**Files:**
- Modify: `dashboard/src/App.tsx`
- Delete: `dashboard/src/office/drawDesk.ts`
- Delete: `dashboard/src/office/drawFurniture.ts`
- Delete: `dashboard/src/office/drawRoom.ts`
- Delete: `dashboard/src/office/isoUtils.ts`
- Delete: `dashboard/src/office/textures.ts`
- Delete: `dashboard/src/office/OfficeScene.tsx`
- Delete: `dashboard/src/office/AgentDesk.tsx`
- Delete: `dashboard/src/office/HandoffEnvelope.tsx`

- [ ] **Step 1: Update App.tsx**

Replace `dashboard/src/App.tsx`:

```typescript
import { useSquadSocket } from "@/hooks/useSquadSocket";
import { SquadSelector } from "@/components/SquadSelector";
import { PhaserGame } from "@/office/PhaserGame";
import { StatusBar } from "@/components/StatusBar";

export function App() {
  useSquadSocket();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          height: 40,
          minHeight: 40,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-sidebar)",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        opensquad Dashboard
      </header>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <SquadSelector />
        <PhaserGame />
      </div>

      {/* Footer */}
      <StatusBar />
    </div>
  );
}
```

- [ ] **Step 2: Delete old procedural rendering files**

```bash
cd d:/Coding\ Projects/opensquad
rm dashboard/src/office/drawDesk.ts
rm dashboard/src/office/drawFurniture.ts
rm dashboard/src/office/drawRoom.ts
rm dashboard/src/office/isoUtils.ts
rm dashboard/src/office/textures.ts
rm dashboard/src/office/OfficeScene.tsx
rm dashboard/src/office/AgentDesk.tsx
rm dashboard/src/office/HandoffEnvelope.tsx
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd d:/Coding\ Projects/opensquad/dashboard
npx tsc --noEmit
```

Expected: clean compilation with no errors. If there are import errors, fix them — likely `@/` path alias issues or missing type imports.

- [ ] **Step 4: Commit**

```bash
cd d:/Coding\ Projects/opensquad
git add -A dashboard/src/
git commit -m "feat(dashboard): wire PhaserGame into App, delete all PixiJS procedural code"
```

---

### Task 7: Visual Testing and Tuning

**Files:**
- Possibly tweak: `dashboard/src/office/RoomBuilder.ts`, `dashboard/src/office/AgentSprite.ts`, `dashboard/src/office/OfficeScene.ts`

- [ ] **Step 1: Start the dev server and open in browser**

```bash
cd d:/Coding\ Projects/opensquad/dashboard
npm run dev
```

Open the URL shown (typically `http://localhost:5173`). You should see the dashboard with the Phaser canvas rendering the office scene with demo agents.

- [ ] **Step 2: Check and fix visual issues**

Common things to verify and fix:
- **Avatar sizing** — the 960x640 sprites need `AVATAR_SCALE = 32 / 960` to display at ~32px wide. If they look too big or too small, adjust the scale constant in `AgentSprite.ts`.
- **Avatar positioning** — avatars should sit "in" the chair at the desk. Adjust the Y offset (currently `-20` from desk center) until the character looks naturally seated.
- **Desk sizing** — desks are 32x32 native. At 2x zoom they'll be 64x64 on screen. If too small relative to the room, the scene may need zoom adjustment.
- **Furniture placement** — bookshelf, whiteboard, plants etc. may need position tweaks in `RoomBuilder.ts`. Adjust the hardcoded X/Y values until the room looks good.
- **Room dimensions** — if the room feels too cramped or too spacious, adjust `CELL_W`, `CELL_H`, `MARGIN` in `palette.ts`.
- **Depth sorting** — verify objects in front occlude objects behind. All sprites should have `setDepth(y)` based on their Y position.

- [ ] **Step 3: Take a screenshot to verify the result**

Use Playwright to take a screenshot:

```bash
npx playwright screenshot http://localhost:5173 --full-page dashboard-phaser.png
```

- [ ] **Step 4: Commit any visual fixes**

```bash
cd d:/Coding\ Projects/opensquad
git add dashboard/src/office/
git commit -m "fix(dashboard): tune sprite positions, sizes, and room layout"
```

---

### Task 8: Final Cleanup

**Files:**
- Possibly modify: `dashboard/package.json` (verify no leftover pixi references)

- [ ] **Step 1: Verify no PixiJS references remain**

```bash
cd d:/Coding\ Projects/opensquad
grep -r "pixi" dashboard/src/ --include="*.ts" --include="*.tsx" -l
grep -r "@pixi" dashboard/package.json
```

Expected: no matches. If any remain, remove the imports/references.

- [ ] **Step 2: Verify build succeeds**

```bash
cd d:/Coding\ Projects/opensquad/dashboard
npm run build
```

Expected: clean build with no errors.

- [ ] **Step 3: Commit if any cleanup was needed**

```bash
cd d:/Coding\ Projects/opensquad
git add -A dashboard/
git commit -m "chore(dashboard): remove leftover PixiJS references"
```
