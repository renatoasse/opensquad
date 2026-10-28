# Dashboard Visual Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the dashboard office visualization to Gather.town-level detail: 48×48 character sprites with shading, detailed workstations with accessories, and dark floating name cards.

**Architecture:** Procedural pixel-by-pixel rendering using PixiJS Graphics + Canvas. All sprites generated at runtime via `px(ctx, x, y, color)` calls on 48×48 canvases. Workstation elements drawn with PixiJS Graphics primitives. Name cards use PixiJS Graphics (roundRect) + Text, positioned at negative Y to float above the cell.

**Tech Stack:** PixiJS 8.9.2, @pixi/react, React 19, TypeScript, Vite

**Spec:** `docs/superpowers/specs/2026-03-18-dashboard-visual-upgrade-design.md`

**Verification:** No test framework in the dashboard. All verification is visual — run `cd dashboard && npm run dev`, open the browser, run a squad, and inspect the rendering. Use `npm run build` to catch type errors.

---

## File Structure

| File | Responsibility | Change scope |
|------|---------------|-------------|
| `dashboard/src/office/palette.ts` | Color constants, layout constants, CharacterColors type, CHARACTER_VARIANTS | Expand type + variants, add accessory/name card colors |
| `dashboard/src/office/textures.ts` | Procedural character sprite generation (canvas pixel art) | Full rewrite — 48×48 canvas, 3 poses with multi-tone shading |
| `dashboard/src/office/drawDesk.ts` | Workstation drawing (desk, monitor, keyboard, mouse, chair, accessories) | Full rewrite — wood grain desk, beveled monitor, detailed peripherals, accessory system |
| `dashboard/src/office/AgentDesk.tsx` | React/PixiJS component assembling each agent's cell | Updated offsets, name card rendering, remove old text labels |

Files **NOT** modified: `drawRoom.ts`, `drawFurniture.ts`, `HandoffEnvelope.tsx`, `OfficeScene.tsx` (imports `GRID_OFFSET_Y` from `AgentDesk.tsx` — the floor position shifts down automatically when `GRID_OFFSET_Y` changes; verify visually in Task 6 that room layout still looks correct).

---

### Task 1: Expand palette and CharacterColors type

**Files:**
- Modify: `dashboard/src/office/palette.ts`

This task expands the `CharacterColors` type with shading fields and updates all 6 `CHARACTER_VARIANTS` to include highlight/shadow tones. Also adds new colors for desk accessories and the name card.

- [ ] **Step 1: Expand the `CharacterColors` type and `CHARACTER_VARIANTS`**

In `palette.ts`, replace the current `CHARACTER_VARIANTS` array and its implicit type. Add new color constants for accessories and name card.

```typescript
// Add to COLORS object — after existing character colors:

  // Character shading (auto-derived tones)
  skinLightShadow: 0xd4a883,
  skinMediumShadow: 0xb48854,
  skinDarkShadow: 0x6b4320,

  hairBlackLight: 0x3a3028,
  hairBlackDark: 0x1a1008,
  hairBrownLight: 0x8a6a4a,
  hairBrownDark: 0x4a2a0a,
  hairBlondeLight: 0xe4b850,
  hairBlondeDark: 0xb48830,
  hairRedLight: 0xc05030,
  hairRedDark: 0x903010,

  shirtBlueLight: 0x5a8ac0,
  shirtBlueDark: 0x3a6898,
  shirtGreenLight: 0x5a9a5a,
  shirtGreenDark: 0x3a7a3a,
  shirtRedLight: 0xb85858,
  shirtRedDark: 0x983838,
  shirtWhiteLight: 0xf0e8dc,
  shirtWhiteDark: 0xd0c8bc,
  shirtPurpleLight: 0x8a68b0,
  shirtPurpleDark: 0x6a4890,

  pantsBase: 0x3a3a4a,
  pantsShade: 0x2a2a3a, // darker shade for leg edges/inner shadow

  shoeBase: 0x2a2018,
  shoeLight: 0x3a3028,

  // Accessories
  mugBody: 0xe0e0e0,
  mugRim: 0xcccccc,
  mugHandle: 0xcccccc,
  postItYellow: 0xffee55,
  postItPink: 0xff8866,
  bookRed: 0xcc4444,
  bookBlue: 0x4466aa,
  bookGreen: 0x44aa44,
  photoFrame: 0x3a3028,
  waterBottle: 0x88bbdd,
  waterCap: 0x4488aa,

  // Name card
  nameCardBg: 0x14141c,
  nameCardText: 0xffffff,

  // Belt
  beltBuckle: 0x8a8a6a,

  // Collar
  collarWhite: 0xf0f0f0,
```

```typescript
// Replace the CharacterColors implicit type with an explicit export:
export type CharacterColors = {
  hair: number;      hairLight: number;     hairDark: number;
  skin: number;      skinShadow: number;
  shirt: number;     shirtLight: number;    shirtDark: number;
  pants: number;     pantsDark: number;
  shoe: number;      shoeLight: number;
};

// Replace CHARACTER_VARIANTS with expanded shading fields:
export const CHARACTER_VARIANTS: CharacterColors[] = [
  {
    hair: COLORS.hairBlack,  hairLight: COLORS.hairBlackLight,  hairDark: COLORS.hairBlackDark,
    skin: COLORS.skinLight,  skinShadow: COLORS.skinLightShadow,
    shirt: COLORS.shirtBlue, shirtLight: COLORS.shirtBlueLight, shirtDark: COLORS.shirtBlueDark,
    pants: COLORS.pantsBase, pantsDark: COLORS.pantsShade,
    shoe: COLORS.shoeBase,   shoeLight: COLORS.shoeLight,
  },
  {
    hair: COLORS.hairBrown,  hairLight: COLORS.hairBrownLight,  hairDark: COLORS.hairBrownDark,
    skin: COLORS.skinMedium, skinShadow: COLORS.skinMediumShadow,
    shirt: COLORS.shirtGreen, shirtLight: COLORS.shirtGreenLight, shirtDark: COLORS.shirtGreenDark,
    pants: COLORS.pantsBase, pantsDark: COLORS.pantsShade,
    shoe: COLORS.shoeBase,   shoeLight: COLORS.shoeLight,
  },
  {
    hair: COLORS.hairBlonde, hairLight: COLORS.hairBlondeLight,  hairDark: COLORS.hairBlondeDark,
    skin: COLORS.skinLight,  skinShadow: COLORS.skinLightShadow,
    shirt: COLORS.shirtRed,  shirtLight: COLORS.shirtRedLight,  shirtDark: COLORS.shirtRedDark,
    pants: COLORS.pantsBase, pantsDark: COLORS.pantsShade,
    shoe: COLORS.shoeBase,   shoeLight: COLORS.shoeLight,
  },
  {
    hair: COLORS.hairRed,    hairLight: COLORS.hairRedLight,    hairDark: COLORS.hairRedDark,
    skin: COLORS.skinDark,   skinShadow: COLORS.skinDarkShadow,
    shirt: COLORS.shirtWhite, shirtLight: COLORS.shirtWhiteLight, shirtDark: COLORS.shirtWhiteDark,
    pants: COLORS.pantsBase, pantsDark: COLORS.pantsShade,
    shoe: COLORS.shoeBase,   shoeLight: COLORS.shoeLight,
  },
  {
    hair: COLORS.hairBlack,  hairLight: COLORS.hairBlackLight,  hairDark: COLORS.hairBlackDark,
    skin: COLORS.skinMedium, skinShadow: COLORS.skinMediumShadow,
    shirt: COLORS.shirtPurple, shirtLight: COLORS.shirtPurpleLight, shirtDark: COLORS.shirtPurpleDark,
    pants: COLORS.pantsBase, pantsDark: COLORS.pantsShade,
    shoe: COLORS.shoeBase,   shoeLight: COLORS.shoeLight,
  },
  {
    hair: COLORS.hairBrown,  hairLight: COLORS.hairBrownLight,  hairDark: COLORS.hairBrownDark,
    skin: COLORS.skinLight,  skinShadow: COLORS.skinLightShadow,
    shirt: COLORS.shirtGreen, shirtLight: COLORS.shirtGreenLight, shirtDark: COLORS.shirtGreenDark,
    pants: COLORS.pantsBase, pantsDark: COLORS.pantsShade,
    shoe: COLORS.shoeBase,   shoeLight: COLORS.shoeLight,
  },
];
```

- [ ] **Step 2: Verify types compile**

Run: `cd dashboard && npx tsc --noEmit`

Expected: Type errors in `textures.ts` (because it still uses the old 3-field `CharacterColors`). This is expected — we'll fix it in Task 2. The key is that `palette.ts` itself compiles.

- [ ] **Step 3: Commit**

```bash
git add dashboard/src/office/palette.ts
git commit -m "feat(dashboard): expand palette with shading variants and accessory colors"
```

---

### Task 2: Rewrite character sprites — idle pose (48×48)

**Files:**
- Modify: `dashboard/src/office/textures.ts`

This is the largest single task. Rewrite `textures.ts` with a 48×48 canvas and a detailed idle pose using multi-tone shading. The working and done poses come in Task 3.

- [ ] **Step 1: Rewrite textures.ts with the new CharacterColors type and idle pose**

Replace the entire file. Key changes:
- Import `CharacterColors` from `palette.ts` instead of defining it locally
- Canvas size: `48` (was `32`)
- `drawCharacterIdle`: Full rewrite at 48×48 with:
  - Hair: 3 tones (`c.hair`, `c.hairLight`, `c.hairDark`), rows 2–7, wider coverage (x: 14–32)
  - Face: `c.skin` + `c.skinShadow` on jaw/neck edges, rows 6–14
  - Eyes: white pixel + dark pupil + eyebrow row above
  - Nose: 2px of `c.skinShadow` at center (x:23, y:12–13)
  - Mouth: 5px neutral line at y:15
  - Ears: `c.skin` + `c.skinShadow` at x:14/32, y:9–10
  - Neck: `c.skin` rows 16–17, `c.skinShadow` on edges
  - Collar: `COLORS.collarWhite` row at y:18, center dip
  - Shirt: `c.shirt` body y:19–29, `c.shirtLight` center column, `c.shirtDark` edges
  - Arms: at sides, `c.shirt` sleeve + `c.skin` forearm + 3-finger hands at bottom
  - Belt: `COLORS.pantsDark` at y:30 with `COLORS.beltBuckle` center
  - Pants: `c.pants` + `c.pantsDark` edges, y:31–39, gap between legs
  - Shoes: `c.shoe` + `c.shoeLight` sole, y:40–43
- `drawCharacterWorking`: Stub that calls `drawCharacterIdle` (temporary — replaced in Task 3)
- `drawCharacterDone`: Stub that calls `drawCharacterIdle` (temporary — replaced in Task 3)
- `generateCharacterTextures`: Change `size` from `32` to `48`
- `CharacterTextures` interface: unchanged
- `getCharacterTextures`: unchanged

```typescript
import { Texture, CanvasSource } from "pixi.js";
import { COLORS, type CharacterColors } from "./palette";

function hexToRgb(hex: number): [number, number, number] {
  return [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
}

function createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  return [canvas, ctx];
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: number) {
  const [r, g, b] = hexToRgb(color);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(x, y, 1, 1);
}

// Helper: fill a horizontal span
function hspan(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number, color: number) {
  for (let x = x1; x <= x2; x++) px(ctx, x, y, color);
}

function drawCharacterIdle(ctx: CanvasRenderingContext2D, c: CharacterColors) {
  // --- HAIR (rows 2-7) ---
  // Top of hair
  hspan(ctx, 16, 30, 2, c.hair);
  hspan(ctx, 15, 31, 3, c.hair);
  hspan(ctx, 14, 32, 4, c.hair);
  hspan(ctx, 14, 32, 5, c.hair);
  // Hair highlights
  px(ctx, 17, 3, c.hairLight); px(ctx, 20, 3, c.hairLight);
  px(ctx, 25, 4, c.hairLight); px(ctx, 28, 3, c.hairLight);
  px(ctx, 16, 4, c.hairLight); px(ctx, 22, 4, c.hairLight); px(ctx, 30, 4, c.hairLight);
  // Hair dark edges
  px(ctx, 14, 5, c.hairDark); px(ctx, 32, 5, c.hairDark);
  px(ctx, 15, 4, c.hairDark); px(ctx, 31, 4, c.hairDark);
  // Sideburns
  px(ctx, 14, 6, c.hair); px(ctx, 14, 7, c.hair);
  px(ctx, 32, 6, c.hair); px(ctx, 32, 7, c.hair);

  // --- FACE (rows 6-14) ---
  hspan(ctx, 15, 31, 6, c.skin);
  hspan(ctx, 15, 31, 7, c.skin);
  hspan(ctx, 15, 31, 8, c.skin);
  hspan(ctx, 15, 31, 9, c.skin);
  hspan(ctx, 16, 30, 10, c.skin);
  hspan(ctx, 16, 30, 11, c.skin);
  hspan(ctx, 17, 29, 12, c.skin);
  hspan(ctx, 18, 28, 13, c.skin);
  hspan(ctx, 19, 27, 14, c.skin);
  // Jaw shadow
  for (let i = 16; i <= 17; i++) { px(ctx, i, 11, c.skinShadow); px(ctx, i, 12, c.skinShadow); }
  for (let i = 29; i <= 30; i++) { px(ctx, i, 11, c.skinShadow); px(ctx, i, 12, c.skinShadow); }
  px(ctx, 18, 13, c.skinShadow); px(ctx, 19, 13, c.skinShadow);
  px(ctx, 27, 13, c.skinShadow); px(ctx, 28, 13, c.skinShadow);

  // Eyebrows
  hspan(ctx, 18, 20, 7, c.hairDark);
  hspan(ctx, 26, 28, 7, c.hairDark);

  // Eyes (white + pupil)
  px(ctx, 18, 9, 0xf0ede8); px(ctx, 19, 9, 0x2a2018); px(ctx, 20, 9, 0xf0ede8);
  px(ctx, 26, 9, 0xf0ede8); px(ctx, 27, 9, 0x2a2018); px(ctx, 28, 9, 0xf0ede8);

  // Nose
  px(ctx, 23, 11, c.skinShadow); px(ctx, 23, 12, c.skinShadow);

  // Mouth (neutral)
  hspan(ctx, 21, 25, 14, 0x2a2018);

  // Ears
  px(ctx, 14, 8, c.skin); px(ctx, 14, 9, c.skinShadow);
  px(ctx, 32, 8, c.skin); px(ctx, 32, 9, c.skinShadow);

  // --- NECK (rows 15-16) ---
  hspan(ctx, 20, 26, 15, c.skin);
  hspan(ctx, 21, 25, 16, c.skin);
  px(ctx, 20, 15, c.skinShadow); px(ctx, 26, 15, c.skinShadow);

  // --- COLLAR (row 17) ---
  hspan(ctx, 17, 29, 17, COLORS.collarWhite);
  // Center dip
  px(ctx, 22, 17, 0xe0e0e0); px(ctx, 23, 17, 0xe0e0e0); px(ctx, 24, 17, 0xe0e0e0);

  // --- SHIRT (rows 18-28) ---
  for (let y = 18; y <= 28; y++) {
    for (let i = 13; i <= 33; i++) {
      if (i <= 15) px(ctx, i, y, c.shirtDark);
      else if (i >= 31) px(ctx, i, y, c.shirtDark);
      else if (i >= 22 && i <= 24) px(ctx, i, y, c.shirtLight);
      else px(ctx, i, y, c.shirt);
    }
  }

  // --- ARMS at sides ---
  // Left arm: shirt sleeve + skin forearm
  for (let y = 18; y <= 22; y++) { px(ctx, 11, y, c.shirt); px(ctx, 12, y, c.shirt); }
  px(ctx, 12, 19, c.shirtDark); px(ctx, 12, 20, c.shirtDark); // inner shadow
  for (let y = 23; y <= 27; y++) { px(ctx, 10, y, c.skin); px(ctx, 11, y, c.skin); }
  // Left hand (3 fingers)
  px(ctx, 8, 28, c.skin); px(ctx, 9, 28, c.skin); px(ctx, 10, 28, c.skin);
  px(ctx, 8, 29, c.skin); px(ctx, 9, 29, c.skinShadow);

  // Right arm
  for (let y = 18; y <= 22; y++) { px(ctx, 34, y, c.shirt); px(ctx, 35, y, c.shirt); }
  px(ctx, 34, 19, c.shirtDark); px(ctx, 34, 20, c.shirtDark);
  for (let y = 23; y <= 27; y++) { px(ctx, 35, y, c.skin); px(ctx, 36, y, c.skin); }
  // Right hand
  px(ctx, 36, 28, c.skin); px(ctx, 37, 28, c.skin); px(ctx, 38, 28, c.skin);
  px(ctx, 37, 29, c.skin); px(ctx, 38, 29, c.skinShadow);

  // --- BELT (row 29) ---
  hspan(ctx, 13, 33, 29, c.pantsDark);
  px(ctx, 22, 29, COLORS.beltBuckle); px(ctx, 23, 29, COLORS.beltBuckle); px(ctx, 24, 29, COLORS.beltBuckle);

  // --- PANTS (rows 30-39) ---
  for (let y = 30; y <= 39; y++) {
    // Left leg
    for (let i = 14; i <= 21; i++) px(ctx, i, y, i <= 15 ? c.pantsDark : c.pants);
    // Right leg
    for (let i = 25; i <= 32; i++) px(ctx, i, y, i >= 31 ? c.pantsDark : c.pants);
    // Inner leg shadow
    px(ctx, 21, y, c.pantsDark); px(ctx, 25, y, c.pantsDark);
  }

  // --- SHOES (rows 40-43) ---
  // Left shoe
  for (let i = 13; i <= 22; i++) { px(ctx, i, 40, c.shoe); px(ctx, i, 41, c.shoe); }
  for (let i = 13; i <= 22; i++) px(ctx, i, 42, i <= 14 ? c.shoeLight : c.shoe);
  hspan(ctx, 13, 22, 43, c.shoeLight); // sole
  // Right shoe
  for (let i = 24; i <= 33; i++) { px(ctx, i, 40, c.shoe); px(ctx, i, 41, c.shoe); }
  for (let i = 24; i <= 33; i++) px(ctx, i, 42, i >= 32 ? c.shoeLight : c.shoe);
  hspan(ctx, 24, 33, 43, c.shoeLight);
}

// Temporary stubs — replaced in Task 3
function drawCharacterWorking(ctx: CanvasRenderingContext2D, c: CharacterColors, _frame: 0 | 1) {
  drawCharacterIdle(ctx, c);
}

function drawCharacterDone(ctx: CanvasRenderingContext2D, c: CharacterColors) {
  drawCharacterIdle(ctx, c);
}

export interface CharacterTextures {
  idle: Texture;
  working: [Texture, Texture];
  done: Texture;
  checkpoint: Texture;
}

export function generateCharacterTextures(colors: CharacterColors): CharacterTextures {
  const size = 48;

  function makeFrame(drawFn: (ctx: CanvasRenderingContext2D) => void): Texture {
    const [canvas, ctx] = createCanvas(size, size);
    drawFn(ctx);
    return new Texture({ source: new CanvasSource({ resource: canvas, scaleMode: "nearest" }) });
  }

  return {
    idle: makeFrame((ctx) => drawCharacterIdle(ctx, colors)),
    working: [
      makeFrame((ctx) => drawCharacterWorking(ctx, colors, 0)),
      makeFrame((ctx) => drawCharacterWorking(ctx, colors, 1)),
    ],
    done: makeFrame((ctx) => drawCharacterDone(ctx, colors)),
    checkpoint: makeFrame((ctx) => drawCharacterIdle(ctx, colors)),
  };
}

const textureCache = new Map<number, CharacterTextures>();

export function getCharacterTextures(variantIndex: number, colors: CharacterColors): CharacterTextures {
  if (!textureCache.has(variantIndex)) {
    textureCache.set(variantIndex, generateCharacterTextures(colors));
  }
  return textureCache.get(variantIndex)!;
}
```

- [ ] **Step 2: Update AgentDesk.tsx sprite size to 48×48**

In `AgentDesk.tsx`, update the `<pixiSprite>` to use 48×48 and new position. Change the sprite position from `x={48} y={72}` to `x={40} y={58}` and size from `width={32} height={32}` to `width={48} height={48}`.

```tsx
// Line ~135-141 in AgentDesk.tsx — change:
<pixiSprite
  texture={currentTexture}
  x={40}
  y={58}
  width={48}
  height={48}
/>
```

- [ ] **Step 3: Verify types compile**

Run: `cd dashboard && npx tsc --noEmit`

Expected: Clean compilation (no errors). The `CharacterColors` type now matches between `palette.ts` and `textures.ts`.

- [ ] **Step 4: Visual verification — idle pose**

Run: `cd dashboard && npm run dev`

Open browser, run a squad, verify:
- Characters render at 48×48 with visible shading (hair highlights, jaw shadow, collar, belt buckle)
- Characters are centered in their cells
- No clipping or overlap issues

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/office/textures.ts dashboard/src/office/AgentDesk.tsx
git commit -m "feat(dashboard): rewrite character sprites at 48x48 with shading (idle pose)"
```

---

### Task 3: Character working and done poses

**Files:**
- Modify: `dashboard/src/office/textures.ts`

Replace the temporary stubs with proper working (2 frames) and done poses. First extract shared drawing code into helpers to avoid duplicating hundreds of `px()` calls.

- [ ] **Step 1: Extract `drawHead` and `drawBody` helpers from `drawCharacterIdle`**

Refactor `drawCharacterIdle` into 3 helpers + the pose function. The helpers encapsulate the shared pixel data:

```typescript
type MouthVariant = "neutral" | "focused" | "smile";

/** Draw hair, face, ears. Eyes use standard position; mouth varies by pose. */
function drawHead(ctx: CanvasRenderingContext2D, c: CharacterColors, mouth: MouthVariant) {
  // --- HAIR (rows 2-7) --- (exact same code as current drawCharacterIdle hair section)
  hspan(ctx, 16, 30, 2, c.hair);
  hspan(ctx, 15, 31, 3, c.hair);
  hspan(ctx, 14, 32, 4, c.hair);
  hspan(ctx, 14, 32, 5, c.hair);
  px(ctx, 17, 3, c.hairLight); px(ctx, 20, 3, c.hairLight);
  px(ctx, 25, 4, c.hairLight); px(ctx, 28, 3, c.hairLight);
  px(ctx, 16, 4, c.hairLight); px(ctx, 22, 4, c.hairLight); px(ctx, 30, 4, c.hairLight);
  px(ctx, 14, 5, c.hairDark); px(ctx, 32, 5, c.hairDark);
  px(ctx, 15, 4, c.hairDark); px(ctx, 31, 4, c.hairDark);
  px(ctx, 14, 6, c.hair); px(ctx, 14, 7, c.hair);
  px(ctx, 32, 6, c.hair); px(ctx, 32, 7, c.hair);

  // --- FACE (rows 6-14) --- (exact same code as current face section)
  hspan(ctx, 15, 31, 6, c.skin);
  hspan(ctx, 15, 31, 7, c.skin);
  hspan(ctx, 15, 31, 8, c.skin);
  hspan(ctx, 15, 31, 9, c.skin);
  hspan(ctx, 16, 30, 10, c.skin);
  hspan(ctx, 16, 30, 11, c.skin);
  hspan(ctx, 17, 29, 12, c.skin);
  hspan(ctx, 18, 28, 13, c.skin);
  hspan(ctx, 19, 27, 14, c.skin);
  // Jaw shadow
  for (let i = 16; i <= 17; i++) { px(ctx, i, 11, c.skinShadow); px(ctx, i, 12, c.skinShadow); }
  for (let i = 29; i <= 30; i++) { px(ctx, i, 11, c.skinShadow); px(ctx, i, 12, c.skinShadow); }
  px(ctx, 18, 13, c.skinShadow); px(ctx, 19, 13, c.skinShadow);
  px(ctx, 27, 13, c.skinShadow); px(ctx, 28, 13, c.skinShadow);
  // Eyebrows
  hspan(ctx, 18, 20, 7, c.hairDark);
  hspan(ctx, 26, 28, 7, c.hairDark);
  // Ears
  px(ctx, 14, 8, c.skin); px(ctx, 14, 9, c.skinShadow);
  px(ctx, 32, 8, c.skin); px(ctx, 32, 9, c.skinShadow);
  // Nose
  px(ctx, 23, 11, c.skinShadow); px(ctx, 23, 12, c.skinShadow);

  // Eyes — variant: "focused" shifts pupils down 1px
  if (mouth === "focused") {
    px(ctx, 18, 9, 0xf0ede8); px(ctx, 19, 10, 0x2a2018); px(ctx, 20, 9, 0xf0ede8);
    px(ctx, 26, 9, 0xf0ede8); px(ctx, 27, 10, 0x2a2018); px(ctx, 28, 9, 0xf0ede8);
  } else {
    px(ctx, 18, 9, 0xf0ede8); px(ctx, 19, 9, 0x2a2018); px(ctx, 20, 9, 0xf0ede8);
    px(ctx, 26, 9, 0xf0ede8); px(ctx, 27, 9, 0x2a2018); px(ctx, 28, 9, 0xf0ede8);
  }

  // Mouth
  if (mouth === "smile") {
    px(ctx, 20, 13, 0x2a2018); px(ctx, 26, 13, 0x2a2018); // corners up
    hspan(ctx, 21, 25, 14, 0x2a2018); // bottom curve
  } else {
    hspan(ctx, 21, 25, 14, 0x2a2018); // neutral line
  }
}

/** Draw neck, collar, shirt body, belt, pants, shoes — shared by all poses. */
function drawBody(ctx: CanvasRenderingContext2D, c: CharacterColors) {
  // Neck
  hspan(ctx, 20, 26, 15, c.skin);
  hspan(ctx, 21, 25, 16, c.skin);
  px(ctx, 20, 15, c.skinShadow); px(ctx, 26, 15, c.skinShadow);
  // Collar
  hspan(ctx, 17, 29, 17, COLORS.collarWhite);
  px(ctx, 22, 17, 0xe0e0e0); px(ctx, 23, 17, 0xe0e0e0); px(ctx, 24, 17, 0xe0e0e0);
  // Shirt
  for (let y = 18; y <= 28; y++) {
    for (let i = 13; i <= 33; i++) {
      if (i <= 15) px(ctx, i, y, c.shirtDark);
      else if (i >= 31) px(ctx, i, y, c.shirtDark);
      else if (i >= 22 && i <= 24) px(ctx, i, y, c.shirtLight);
      else px(ctx, i, y, c.shirt);
    }
  }
  // Belt
  hspan(ctx, 13, 33, 29, c.pantsDark);
  px(ctx, 22, 29, COLORS.beltBuckle); px(ctx, 23, 29, COLORS.beltBuckle); px(ctx, 24, 29, COLORS.beltBuckle);
  // Pants
  for (let y = 30; y <= 39; y++) {
    for (let i = 14; i <= 21; i++) px(ctx, i, y, i <= 15 ? c.pantsDark : c.pants);
    for (let i = 25; i <= 32; i++) px(ctx, i, y, i >= 31 ? c.pantsDark : c.pants);
    px(ctx, 21, y, c.pantsDark); px(ctx, 25, y, c.pantsDark);
  }
  // Shoes
  for (let i = 13; i <= 22; i++) { px(ctx, i, 40, c.shoe); px(ctx, i, 41, c.shoe); }
  for (let i = 13; i <= 22; i++) px(ctx, i, 42, i <= 14 ? c.shoeLight : c.shoe);
  hspan(ctx, 13, 22, 43, c.shoeLight);
  for (let i = 24; i <= 33; i++) { px(ctx, i, 40, c.shoe); px(ctx, i, 41, c.shoe); }
  for (let i = 24; i <= 33; i++) px(ctx, i, 42, i >= 32 ? c.shoeLight : c.shoe);
  hspan(ctx, 24, 33, 43, c.shoeLight);
}
```

Then simplify `drawCharacterIdle` to use the helpers:

```typescript
function drawCharacterIdle(ctx: CanvasRenderingContext2D, c: CharacterColors) {
  drawHead(ctx, c, "neutral");
  drawBody(ctx, c);

  // Arms at sides (idle-specific)
  // Left arm: shirt sleeve + skin forearm
  for (let y = 18; y <= 22; y++) { px(ctx, 11, y, c.shirt); px(ctx, 12, y, c.shirt); }
  px(ctx, 12, 19, c.shirtDark); px(ctx, 12, 20, c.shirtDark);
  for (let y = 23; y <= 27; y++) { px(ctx, 10, y, c.skin); px(ctx, 11, y, c.skin); }
  px(ctx, 8, 28, c.skin); px(ctx, 9, 28, c.skin); px(ctx, 10, 28, c.skin);
  px(ctx, 8, 29, c.skin); px(ctx, 9, 29, c.skinShadow);
  // Right arm
  for (let y = 18; y <= 22; y++) { px(ctx, 34, y, c.shirt); px(ctx, 35, y, c.shirt); }
  px(ctx, 34, 19, c.shirtDark); px(ctx, 34, 20, c.shirtDark);
  for (let y = 23; y <= 27; y++) { px(ctx, 35, y, c.skin); px(ctx, 36, y, c.skin); }
  px(ctx, 36, 28, c.skin); px(ctx, 37, 28, c.skin); px(ctx, 38, 28, c.skin);
  px(ctx, 37, 29, c.skin); px(ctx, 38, 29, c.skinShadow);
}
```

Verify idle still renders correctly after refactor before proceeding.

- [ ] **Step 2: Implement `drawCharacterWorking`**

Replace the stub. Uses `drawHead(ctx, c, "focused")` and `drawBody(ctx, c)`, then adds pose-specific arms:

```typescript
function drawCharacterWorking(ctx: CanvasRenderingContext2D, c: CharacterColors, frame: 0 | 1) {
  drawHead(ctx, c, "focused");
  drawBody(ctx, c);

  // Arms forward (typing) — include shirt sleeve then skin forearm
  if (frame === 0) {
    // Left arm: sleeve + forearm reaching forward
    for (let y = 18; y <= 20; y++) { px(ctx, 11, y, c.shirt); px(ctx, 12, y, c.shirt); }
    for (let y = 21; y <= 24; y++) { px(ctx, 10, y, c.skin); px(ctx, 11, y, c.skin); }
    px(ctx, 11, 25, c.skin); px(ctx, 12, 25, c.skin); px(ctx, 13, 26, c.skin);
    // Right arm
    for (let y = 18; y <= 20; y++) { px(ctx, 34, y, c.shirt); px(ctx, 35, y, c.shirt); }
    for (let y = 21; y <= 24; y++) { px(ctx, 35, y, c.skin); px(ctx, 36, y, c.skin); }
    px(ctx, 34, 25, c.skin); px(ctx, 35, 25, c.skin); px(ctx, 33, 26, c.skin);
  } else {
    // Left arm: slightly raised (keystroke)
    for (let y = 18; y <= 20; y++) { px(ctx, 11, y, c.shirt); px(ctx, 12, y, c.shirt); }
    for (let y = 21; y <= 23; y++) { px(ctx, 10, y, c.skin); px(ctx, 11, y, c.skin); }
    px(ctx, 11, 24, c.skin); px(ctx, 12, 24, c.skin); px(ctx, 13, 27, c.skin);
    // Right arm
    for (let y = 18; y <= 20; y++) { px(ctx, 34, y, c.shirt); px(ctx, 35, y, c.shirt); }
    for (let y = 21; y <= 23; y++) { px(ctx, 35, y, c.skin); px(ctx, 36, y, c.skin); }
    px(ctx, 34, 24, c.skin); px(ctx, 35, 24, c.skin); px(ctx, 33, 27, c.skin);
  }
}
```

- [ ] **Step 3: Implement `drawCharacterDone`**

Replace the stub. Uses `drawHead(ctx, c, "smile")` and `drawBody(ctx, c)`, then adds celebration arms:

```typescript
function drawCharacterDone(ctx: CanvasRenderingContext2D, c: CharacterColors) {
  drawHead(ctx, c, "smile");
  drawBody(ctx, c);

  // Arms raised (celebration) — shirt sleeve connects to diagonal skin pixels
  // Left arm raised
  px(ctx, 11, 18, c.shirt); px(ctx, 12, 18, c.shirt); // sleeve
  px(ctx, 10, 17, c.skin); px(ctx, 9, 16, c.skin);
  px(ctx, 9, 12, c.skin); px(ctx, 8, 11, c.skin); px(ctx, 7, 10, c.skin);
  px(ctx, 6, 9, c.skin); px(ctx, 5, 8, c.skin);
  // Right arm raised
  px(ctx, 34, 18, c.shirt); px(ctx, 35, 18, c.shirt); // sleeve
  px(ctx, 36, 17, c.skin); px(ctx, 37, 16, c.skin);
  px(ctx, 37, 12, c.skin); px(ctx, 38, 11, c.skin); px(ctx, 39, 10, c.skin);
  px(ctx, 40, 9, c.skin); px(ctx, 41, 8, c.skin);
}
```

- [ ] **Step 3: Verify types compile**

Run: `cd dashboard && npx tsc --noEmit`

Expected: Clean compilation.

- [ ] **Step 4: Visual verification — all poses**

Run: `cd dashboard && npm run dev`

Open browser, run a squad. Verify:
- Idle agents show relaxed arms at sides
- Working agents animate between 2 frames (arms typing motion at 250ms)
- Done agents show raised arms + smile
- All 6 color variants render correctly with shading

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/office/textures.ts
git commit -m "feat(dashboard): add working and done character poses at 48x48"
```

---

### Task 4: Rewrite workstation drawing

**Files:**
- Modify: `dashboard/src/office/drawDesk.ts`

Full rewrite of desk, monitor, keyboard, mouse, and chair with enhanced detail. Update Y layout comment at top to match new spec.

- [ ] **Step 1: Rewrite drawDesk.ts**

Replace the entire file. New Y layout per spec:

```
y+0   cell top
y+4   desk surface starts
y+8   monitor top
y+44  desk front edge
y+48  keyboard + accessories zone
y+56  chair back
y+58  character sprite (48×48)
y+106 character bottom
y+108 chair base/casters
y+128 cell bottom
```

New functions to implement:

**`drawDeskArea(g, x, y)`** — Ground shadow + enhanced chair:
- Chair back: `g.rect(x+38, y+56, 52, 4)` with highlight top row
- Armrests: `g.rect` on left (x+36) and right (x+84), 8×10 with highlight
- Seat cushion: `g.rect(x+46, y+64, 36, 12)` with lighter inner fill
- Center pole: `g.rect(x+62, y+108, 4, 4)`
- Star base: 5 casters at radius 16/8 from center (x+64, y+112)

**`drawWorkstationBack(g, x, y)`** — Desk surface + monitor:
- Desk surface: `g.rect(x+10, y+4, 108, 44)` with wood grain (3 alternating tones per 4px row)
- Left/right edges: darker shade for depth
- Monitor outer frame: `g.roundRect(x+34, y+8, 60, 30)` dark
- Inner bezel: lighter dark at +1 inset
- Screen: dark blue with faint content lines (5 horizontal bars at low alpha)
- Screen top reflection: 2px white at 0.08 alpha
- Webcam dot: 2px at top center of bezel
- Monitor chin: 3px below screen
- Stand neck: `g.rect(x+61, y+38, 6, 5)` with metallic highlight
- Stand base: `g.roundRect(x+52, y+43, 24, 4)` oval with highlight

**`drawWorkstationFront(g, x, y)`** — Keyboard + mouse + desk front:
- Desk front edge: `g.rect(x+10, y+48, 108, 6)` with shadow
- Keyboard body: `g.roundRect(x+40, y+48, 36, 8)` with top highlight
- Individual keys: 3×8 grid at 4px spacing + spacebar
- Mousepad: `g.rect(x+80, y+46, 16, 18)` dark
- Mouse body: `g.roundRect(x+83, y+48, 10, 13)` with scroll wheel, left shadow

**`drawScreenGlow(g, x, y)`** — Same concept, adjusted Y positions:
- Active screen fill at new monitor position
- Ambient glow rect slightly larger

```typescript
import type { Graphics as PixiGraphics } from "pixi.js";
import { COLORS } from "./palette";

// Cell is 128px wide × 128px tall.
// Y layout (updated for visual upgrade):
//   y-24  name card (overflow above cell)
//   y+0   cell top boundary
//   y+4   desk surface starts
//   y+8   monitor top
//   y+44  desk front edge
//   y+48  keyboard + accessories zone
//   y+56  chair back (behind character)
//   y+58  character sprite (48×48)
//   y+108 chair base / casters
//   y+128 cell bottom

export function drawDeskArea(g: PixiGraphics, x: number, y: number) {
  // Ground shadow under desk + chair area
  g.roundRect(x + 8, y + 2, 112, 118, 4);
  g.fill({ color: 0x000000, alpha: 0.04 });

  // Chair back (visible behind character)
  g.rect(x + 38, y + 56, 52, 4);
  g.fill({ color: COLORS.chairSeat });
  g.rect(x + 39, y + 56, 50, 2);
  g.fill({ color: COLORS.chairBase }); // highlight top

  // Armrests
  g.rect(x + 34, y + 60, 8, 12);
  g.fill({ color: COLORS.chairSeat });
  g.rect(x + 35, y + 60, 6, 2);
  g.fill({ color: COLORS.chairBase });
  g.rect(x + 86, y + 60, 8, 12);
  g.fill({ color: COLORS.chairSeat });
  g.rect(x + 87, y + 60, 6, 2);
  g.fill({ color: COLORS.chairBase });

  // Seat cushion
  g.rect(x + 42, y + 68, 44, 14);
  g.fill({ color: 0x2a2a3a });
  g.rect(x + 44, y + 70, 40, 10);
  g.fill({ color: COLORS.chairSeat });

  // Center pole
  g.rect(x + 62, y + 108, 4, 4);
  g.fill({ color: COLORS.chairBase });

  // Star base with casters
  const cx = x + 64;
  const cy = y + 114;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const wx = cx + Math.cos(angle) * 16;
    const wy = cy + Math.sin(angle) * 8;
    g.rect(Math.round(wx) - 2, Math.round(wy) - 1, 4, 3);
    g.fill({ color: COLORS.chairBase });
    // Caster wheel
    g.rect(Math.round(wx) - 1, Math.round(wy) + 1, 2, 2);
    g.fill({ color: 0x5a5a6a });
  }
}

export function drawWorkstationBack(g: PixiGraphics, x: number, y: number) {
  // Desk surface with wood grain
  const deskLight = 0xe0ccaa, deskBase = COLORS.deskTop, deskDark = 0xc4af8c;
  g.rect(x + 10, y + 4, 108, 44);
  g.fill({ color: deskBase });
  // Wood grain rows
  for (let row = 0; row < 11; row++) {
    const shade = row % 3 === 0 ? deskLight : row % 3 === 1 ? deskBase : deskDark;
    g.rect(x + 10, y + 4 + row * 4, 108, 3);
    g.fill({ color: shade });
  }
  // Left/right depth edges
  g.rect(x + 10, y + 4, 2, 44);
  g.fill({ color: deskDark });
  g.rect(x + 116, y + 4, 2, 44);
  g.fill({ color: deskDark });

  // Monitor outer frame
  g.roundRect(x + 34, y + 8, 60, 30, 2);
  g.fill({ color: 0x1a1a22 });
  // Inner bezel
  g.roundRect(x + 35, y + 9, 58, 28, 1);
  g.fill({ color: COLORS.monitorFrame });
  // Screen
  g.roundRect(x + 37, y + 11, 54, 24, 1);
  g.fill({ color: COLORS.monitorScreen });
  // Content hint lines
  for (let i = 0; i < 5; i++) {
    g.rect(x + 39, y + 13 + i * 4, 25 + ((i * 7) % 20), 1);
    g.fill({ color: COLORS.monitorScreenOn, alpha: 0.2 });
  }
  // Screen top reflection
  g.rect(x + 37, y + 11, 54, 2);
  g.fill({ color: 0xffffff, alpha: 0.08 });
  // Webcam dot
  g.rect(x + 63, y + 9, 2, 1);
  g.fill({ color: 0x222222 });
  // Monitor chin
  g.rect(x + 37, y + 35, 54, 3);
  g.fill({ color: COLORS.monitorFrame });
  // Stand neck
  g.rect(x + 61, y + 38, 6, 5);
  g.fill({ color: COLORS.chairBase });
  g.rect(x + 62, y + 39, 4, 3);
  g.fill({ color: 0x5a5a6a }); // metallic highlight
  // Stand base
  g.roundRect(x + 52, y + 43, 24, 4, 2);
  g.fill({ color: COLORS.chairBase });
  g.roundRect(x + 54, y + 43, 20, 2, 1);
  g.fill({ color: 0x5a5a6a });
}

export function drawWorkstationFront(g: PixiGraphics, x: number, y: number) {
  // Desk front face (3D depth)
  g.rect(x + 10, y + 48, 108, 6);
  g.fill({ color: COLORS.deskEdge });
  g.rect(x + 10, y + 53, 108, 2);
  g.fill({ color: COLORS.deskShadow, alpha: 0.3 });
  // Drop shadow on floor
  g.rect(x + 12, y + 55, 104, 2);
  g.fill({ color: 0x000000, alpha: 0.1 });

  // Keyboard body
  g.roundRect(x + 40, y + 48, 36, 8, 1);
  g.fill({ color: COLORS.keyboard });
  // Top edge highlight
  g.rect(x + 41, y + 48, 34, 1);
  g.fill({ color: 0x4a4a52 });
  // Individual keys (3 rows × 8 keys + spacebar)
  for (let row = 0; row < 3; row++) {
    for (let key = 0; key < 8; key++) {
      g.rect(x + 42 + key * 4, y + 49 + row * 2, 3, 1);
      g.fill({ color: 0x5a5a5a });
    }
  }
  // Spacebar
  g.rect(x + 50, y + 55, 12, 1);
  g.fill({ color: 0x5a5a5a });

  // Mousepad
  g.rect(x + 80, y + 46, 16, 18);
  g.fill({ color: 0x2a2a3a });
  // Mouse body
  g.roundRect(x + 83, y + 48, 10, 13, 3);
  g.fill({ color: COLORS.keyboard });
  // Mouse buttons (top)
  g.rect(x + 84, y + 48, 8, 2);
  g.fill({ color: 0x4a4a52 });
  // Scroll wheel
  g.rect(x + 87, y + 48, 2, 3);
  g.fill({ color: 0x5a5a62 });
  // Left shadow edge
  g.rect(x + 83, y + 48, 1, 13);
  g.fill({ color: 0x2a2a32 });
}

export function drawScreenGlow(g: PixiGraphics, x: number, y: number) {
  // Active monitor screen
  g.roundRect(x + 37, y + 11, 54, 24, 1);
  g.fill({ color: COLORS.monitorScreenOn });
  // Ambient glow
  g.roundRect(x + 31, y + 7, 66, 32, 3);
  g.fill({ color: COLORS.monitorScreenOn, alpha: 0.06 });
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd dashboard && npx tsc --noEmit`

Expected: Clean compilation.

- [ ] **Step 3: Visual verification — workstation**

Run: `cd dashboard && npm run dev`

Verify:
- Desk surface shows wood grain texture with 3 alternating tones
- Monitor has visible bezel, content-hint lines, webcam dot, chin, metallic stand
- Keyboard shows individual key grid + spacebar
- Mouse sits on mousepad with scroll wheel visible
- Chair shows back, armrests, seat cushion, pole, and star base with casters
- Screen glows cyan when agent is working

- [ ] **Step 4: Commit**

```bash
git add dashboard/src/office/drawDesk.ts
git commit -m "feat(dashboard): rewrite workstation with detailed desk, monitor, keyboard, mouse, chair"
```

---

### Task 5: Desk accessories system

**Files:**
- Modify: `dashboard/src/office/drawDesk.ts`
- Modify: `dashboard/src/office/AgentDesk.tsx`

Add the `drawDeskAccessories` function and wire it into the front layer of AgentDesk.

- [ ] **Step 1: Add `drawDeskAccessories` to drawDesk.ts**

Append to the end of `drawDesk.ts`:

```typescript
// === Desk Accessories ===
// Each agent gets 2-3 accessories deterministically selected by agentIndex.

function drawCoffeeMug(g: PixiGraphics, x: number, y: number) {
  g.rect(x, y + 2, 8, 8);
  g.fill({ color: COLORS.mugBody });
  g.rect(x, y + 2, 8, 2);
  g.fill({ color: COLORS.mugRim });
  g.rect(x + 8, y + 4, 3, 4);
  g.fill({ color: COLORS.mugHandle });
  // Steam wisps
  g.rect(x + 2, y, 1, 1);
  g.fill({ color: 0xffffff, alpha: 0.35 });
  g.rect(x + 4, y - 1, 1, 1);
  g.fill({ color: 0xffffff, alpha: 0.25 });
  g.rect(x + 3, y - 2, 1, 1);
  g.fill({ color: 0xffffff, alpha: 0.15 });
}

function drawMiniPlant(g: PixiGraphics, x: number, y: number) {
  g.rect(x + 1, y + 8, 8, 6);
  g.fill({ color: COLORS.plantPot });
  g.rect(x, y + 6, 10, 3);
  g.fill({ color: COLORS.plantPot });
  g.circle(x + 5, y + 4, 3);
  g.fill({ color: COLORS.plantGreen });
  g.circle(x + 3, y + 2, 2);
  g.fill({ color: COLORS.plantDark });
  g.circle(x + 7, y + 2, 2);
  g.fill({ color: COLORS.plantGreen });
  g.circle(x + 5, y + 1, 2);
  g.fill({ color: COLORS.plantDark });
}

function drawPostIts(g: PixiGraphics, x: number, y: number) {
  g.rect(x, y, 7, 7);
  g.fill({ color: COLORS.postItPink });
  g.rect(x + 3, y + 2, 8, 8);
  g.fill({ color: COLORS.postItYellow });
  g.rect(x + 3, y + 2, 8, 2);
  g.fill({ color: 0xeedd44 });
  g.rect(x + 4, y + 5, 5, 1);
  g.fill({ color: 0x000000, alpha: 0.12 });
  g.rect(x + 4, y + 7, 4, 1);
  g.fill({ color: 0x000000, alpha: 0.12 });
}

function drawBookStack(g: PixiGraphics, x: number, y: number) {
  g.rect(x, y + 4, 10, 3);
  g.fill({ color: COLORS.bookRed });
  g.rect(x, y + 2, 10, 3);
  g.fill({ color: COLORS.bookBlue });
  g.rect(x + 1, y, 8, 3);
  g.fill({ color: COLORS.bookGreen });
  // Spine lines
  g.rect(x, y + 4, 1, 3);
  g.fill({ color: 0x000000, alpha: 0.15 });
  g.rect(x, y + 2, 1, 3);
  g.fill({ color: 0x000000, alpha: 0.15 });
}

function drawPhotoFrame(g: PixiGraphics, x: number, y: number) {
  g.rect(x, y, 8, 10);
  g.fill({ color: COLORS.photoFrame });
  g.rect(x + 1, y + 1, 6, 8);
  g.fill({ color: 0x88aacc }); // photo tint
}

function drawWaterBottle(g: PixiGraphics, x: number, y: number) {
  g.rect(x + 1, y, 4, 2);
  g.fill({ color: COLORS.waterCap });
  g.rect(x, y + 2, 6, 10);
  g.fill({ color: COLORS.waterBottle });
  g.rect(x + 1, y + 3, 4, 4);
  g.fill({ color: 0xaaddee, alpha: 0.5 }); // water level
}

const ACCESSORY_POOL = [
  drawCoffeeMug, drawMiniPlant, drawPostIts,
  drawBookStack, drawPhotoFrame, drawWaterBottle,
];

// Left zone: x+14..x+32, right zone: x+96..x+114
const LEFT_SLOT = { dx: 14, dy: 38 };
const RIGHT_SLOT = { dx: 100, dy: 38 };

export function drawDeskAccessories(g: PixiGraphics, x: number, y: number, agentIndex: number) {
  const seed = agentIndex * 7 + 3; // deterministic pseudo-random
  const idx1 = seed % ACCESSORY_POOL.length;
  const idx2 = (seed + 2) % ACCESSORY_POOL.length;

  ACCESSORY_POOL[idx1](g, x + LEFT_SLOT.dx, y + LEFT_SLOT.dy);
  if (idx2 !== idx1) {
    ACCESSORY_POOL[idx2](g, x + RIGHT_SLOT.dx, y + RIGHT_SLOT.dy);
  }
}
```

- [ ] **Step 2: Wire accessories into AgentDesk.tsx**

Import `drawDeskAccessories` from `drawDesk.ts` and call it in the front layer draw callback. **Important:** The dependency array of `drawStationFront` must change from `[]` to `[agentIndex]` so accessories update correctly when agents reorder.

In `AgentDesk.tsx`:

```typescript
// Update import:
import { drawDeskArea, drawWorkstationBack, drawWorkstationFront, drawScreenGlow, drawDeskAccessories } from "./drawDesk";

// Update drawStationFront callback:
const drawStationFront = useCallback(
  (g: PixiGraphics) => {
    g.clear();
    drawWorkstationFront(g, 0, 0);
    drawDeskAccessories(g, 0, 0, agentIndex);
  },
  [agentIndex]
);
```

- [ ] **Step 3: Verify types compile**

Run: `cd dashboard && npx tsc --noEmit`

Expected: Clean compilation.

- [ ] **Step 4: Visual verification — accessories**

Run: `cd dashboard && npm run dev`

Verify:
- Each agent has 2 accessories on their desk
- Different agents have different accessory combinations
- Accessories render cleanly on the desk surface without overlapping the monitor/keyboard

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/office/drawDesk.ts dashboard/src/office/AgentDesk.tsx
git commit -m "feat(dashboard): add randomized desk accessories per agent"
```

---

### Task 6: Dark floating name card

**Files:**
- Modify: `dashboard/src/office/AgentDesk.tsx`

Replace the old text labels with a dark rounded card above the character's head, containing emoji + name + status dot.

- [ ] **Step 1: Update GRID_OFFSET_Y**

In `AgentDesk.tsx` line 15, change:

```typescript
export const GRID_OFFSET_Y = TILE * 4;  // was TILE * 3 — extra space for name cards
```

- [ ] **Step 2: Add the name card drawing function**

Add a new `drawNameCard` callback inside the `AgentDesk` component:

```typescript
const drawNameCard = useCallback(
  (g: PixiGraphics) => {
    g.clear();

    // Measure approximate card width (emoji ~12px + name ~name.length*7px + dot ~12px + padding 24px)
    const cardW = 24 + 12 + agent.name.length * 7 + 12;
    const cardH = 20;
    const cardX = (CELL_W - cardW) / 2;
    const cardY = -24;

    // Shadow
    g.roundRect(cardX + 1, cardY + 2, cardW, cardH, 8);
    g.fill({ color: 0x000000, alpha: 0.3 });

    // Card background
    g.roundRect(cardX, cardY, cardW, cardH, 8);
    g.fill({ color: COLORS.nameCardBg, alpha: 0.92 });

    // Pointer triangle (PixiJS 8 — use poly() for closed shapes)
    const triX = CELL_W / 2;
    g.poly([triX - 5, cardY + cardH, triX, cardY + cardH + 5, triX + 5, cardY + cardH]);
    g.fill({ color: COLORS.nameCardBg, alpha: 0.92 });

    // Status dot
    const dotColor = agent.status === "working" ? COLORS.statusWorking
      : agent.status === "done" ? COLORS.statusDone
      : agent.status === "checkpoint" ? COLORS.statusCheckpoint
      : COLORS.statusIdle;
    const dotX = cardX + cardW - 14;
    const dotY = cardY + cardH / 2;
    // Glow (for active states)
    if (agent.status === "working" || agent.status === "done" || agent.status === "checkpoint") {
      g.circle(dotX, dotY, 5);
      g.fill({ color: dotColor, alpha: 0.25 });
    }
    g.circle(dotX, dotY, 3.5);
    g.fill({ color: dotColor });
  },
  [agent.name, agent.status]
);
```

- [ ] **Step 3: Add emoji and name text elements, remove old labels**

In the JSX return, replace the old text labels (lines 147–159) with the name card:

```tsx
return (
  <pixiContainer x={x} y={y}>
    {/* Layer 1: chair + monitor (behind character) */}
    <pixiGraphics draw={drawStationBack} />

    {/* Layer 2: character sprite */}
    <pixiSprite texture={currentTexture} x={40} y={58} width={48} height={48} />

    {/* Layer 3: desk surface + keyboard + accessories (in front of character) */}
    <pixiGraphics draw={drawStationFront} />

    {/* Layer 4: name card (floating above cell) */}
    <pixiGraphics draw={drawNameCard} />
    <pixiText
      text={agent.icon || "🤖"}
      style={{ fontSize: 11 } as TextStyleOptions}
      x={(CELL_W - (24 + 12 + agent.name.length * 7 + 12)) / 2 + 6}
      y={-22}
    />
    <pixiText
      text={agent.name}
      style={{
        fontSize: 11,
        fill: COLORS.nameCardText,
        fontFamily: "-apple-system, 'Segoe UI', sans-serif",
        fontWeight: "600",
      } as TextStyleOptions}
      x={(CELL_W - (24 + 12 + agent.name.length * 7 + 12)) / 2 + 20}
      y={-22}
    />
  </pixiContainer>
);
```

Remove the old elements:
- Remove `nameStyle` and `statusStyle` const declarations
- Remove the old `<pixiText text={agent.name} ...>` at `x={4} y={2}`
- Remove the old `<pixiText text={agent.status} ...>` at `x={4} y={14}`
- Remove the old `drawBubble` callback and its `<pixiGraphics>` usage
- Remove the old checkpoint "?" `<pixiText>`

- [ ] **Step 4: Verify types compile**

Run: `cd dashboard && npx tsc --noEmit`

Expected: Clean compilation.

- [ ] **Step 5: Visual verification — name card**

Run: `cd dashboard && npm run dev`

Verify:
- Dark card appears centered above each character's head
- Emoji renders on the left, name in white, status dot on the right
- Status dot color changes correctly: gray (idle), cyan (working), green (done), amber (checkpoint)
- Working status dot has subtle glow
- Pointer triangle connects card to character
- Name cards don't get clipped at the top of the scene (GRID_OFFSET_Y provides enough space)

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/office/AgentDesk.tsx
git commit -m "feat(dashboard): add dark floating name cards with emoji and status dot"
```

---

### Task 7: Final integration verification and build

**Files:** None (verification only)

- [ ] **Step 1: Full build check**

Run: `cd dashboard && npm run build`

Expected: Clean build with no type errors and no warnings.

- [ ] **Step 2: Full visual integration test**

Run: `cd dashboard && npm run dev`

Open browser, run a squad through its full lifecycle. Verify the complete picture:
- Room renders correctly (floor, walls, furniture — unchanged)
- Each agent desk shows detailed workstation (wood grain, beveled monitor, keyboard with keys, mouse on pad)
- Each agent has unique accessories on their desk
- Characters render at 48×48 with full shading detail (hair highlights, jaw shadow, collar, belt)
- Working agents animate with typing motion + screen glow
- Done agents show celebration pose with green particles
- Checkpoint agents show amber status dot
- Dark name cards float above each character with emoji + name + colored status dot
- Handoff envelope animation still works between agents
- No visual clipping, overlap, or z-order issues

- [ ] **Step 3: Final commit if any adjustments needed**

If any pixel positions needed tweaking during verification, commit the fixes:

```bash
git add -A dashboard/src/office/
git commit -m "fix(dashboard): adjust pixel positions from visual verification"
```
