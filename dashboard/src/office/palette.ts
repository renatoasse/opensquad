// Slimmed palette — only badge colors and layout constants
// All visual rendering now uses sprite assets, not procedural colors

export const COLORS = {
  // Status badge dots
  statusIdle: 0xbbbbdd,
  statusWorking: 0x60b0ff,
  statusDone: 0x70ff90,
  statusCheckpoint: 0xffcc33,

  // Name badge
  nameCardBg: 0x14141c,
  nameCardText: 0xffffff,

  // Background
  background: 0x1a1420,

  // Floor fill (warm wood)
  floor: 0xc8ac86,
  floorAlt: 0xbca07a,

  // Wall fill
  wall: 0xe6dace,
  wallTrim: 0xa89888,
} as const;

// Layout constants
export const TILE = 32;           // Base tile size in pixels
export const CELL_W = 3 * TILE;   // 96px — desk cell width (tighter grid)
export const CELL_H = 3 * TILE;   // 96px — desk cell height
export const MARGIN = 3 * TILE;   // 96px — room edge margin (more breathing room)
export const WALL_H = 3 * TILE;   // 96px — wall strip height (taller for decorations)
