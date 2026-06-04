// Asset key constants for Phaser loader
// All paths relative to /assets/ in public/

// --- Characters ---
export const MALE_CHARACTERS   = ['Male1', 'Male2', 'Male3', 'Male4'] as const;
export const FEMALE_CHARACTERS = ['Female1', 'Female2', 'Female3', 'Female4', 'Female5', 'Female6'] as const;

export type CharacterName =
  | typeof MALE_CHARACTERS[number]
  | typeof FEMALE_CHARACTERS[number];

// Combined array for preloading all sprites
export const CHARACTER_NAMES = [...MALE_CHARACTERS, ...FEMALE_CHARACTERS] as const;

// Characters with only a single wave frame (no _1wave/_2wave variants)
const SINGLE_WAVE = new Set<CharacterName>(['Male3', 'Male4', 'Female3', 'Female4', 'Female5', 'Female6']);

// Returns the asset keys for a character's animation frames
export function avatarKeys(name: CharacterName) {
  return {
    blink: `avatar_${name}_blink`,
    talk: `avatar_${name}_talk`,
    wave1: `avatar_${name}_wave1`,
    wave2: `avatar_${name}_wave2`,
  };
}

export function avatarPath(name: CharacterName, pose: string): string {
  if (pose === 'wave1') return SINGLE_WAVE.has(name) ? `assets/avatars/${name}_wave.png` : `assets/avatars/${name}_1wave.png`;
  if (pose === 'wave2') return SINGLE_WAVE.has(name) ? `assets/avatars/${name}_wave.png` : `assets/avatars/${name}_2wave.png`;
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
  blackUp: 'desk_black_up',
  whiteUp: 'desk_white_up',
} as const;

export const DESK_PATHS: Record<string, string> = {
  [DESK_KEYS.blackIdle]: 'assets/desks/desktop_set_black_down.png',
  [DESK_KEYS.blackCoding]: 'assets/desks/desktop_set_black_down_coding.png',
  [DESK_KEYS.blackCodingAlt]: 'assets/desks/desktop_set_black_down_coding-1.png',
  [DESK_KEYS.whiteIdle]: 'assets/desks/desktop_set_white_down.png',
  [DESK_KEYS.whiteCoding]: 'assets/desks/desktop_set_white_down_coding.png',
  [DESK_KEYS.whiteCodingAlt]: 'assets/desks/desktop_set_white_down_coding-1.png',
  [DESK_KEYS.blackUp]: 'assets/desks/desktop_set_black_up.png',
  [DESK_KEYS.whiteUp]: 'assets/desks/desktop_set_white_up.png',
};

// --- Furniture ---
export const FURNITURE_KEYS = {
  bookshelf: 'furniture_bookshelf',
  whiteboard: 'furniture_whiteboard',
  clock: 'furniture_clock',
  plant1: 'furniture_plant1',
  plant2: 'furniture_plant2',
  plant3: 'furniture_plant3',
  flowers1: 'furniture_flowers1',
  flowers2: 'furniture_flowers2',
  couch: 'furniture_couch',
  rug: 'furniture_rug',
  coffeeMug: 'furniture_coffee_mug',
  blinds: 'furniture_blinds',
  coffeeTable: 'furniture_coffee_table',
  // New assets
  lampTan: 'furniture_lamp_tan',
  monstera: 'furniture_monstera',
  monsteraSmall: 'furniture_monstera_small',
  succulentGreen: 'furniture_succulent_green',
  succulentBlue: 'furniture_succulent_blue',
  posterBlue: 'furniture_poster_blue',
  bulletinBoard: 'furniture_bulletin_board',
  fancyRug: 'furniture_fancy_rug',
  cushionBlue: 'furniture_cushion_blue',
  cushionTan: 'furniture_cushion_tan',
  armchairTan: 'furniture_armchair_tan',
  backpackBlue: 'furniture_backpack_blue',
  backpackRed: 'furniture_backpack_red',
  plantPoof: 'furniture_plant_poof',
  plantSpindly: 'furniture_plant_spindly',
  coffeeMugBlue: 'furniture_coffee_mug_blue',
  pictureFrame: 'furniture_picture_frame',
  lantern: 'furniture_lantern',
  windowBlindsOpen: 'furniture_window_blinds_open',
  couchTanDown: 'furniture_couch_tan_down',
  armchairTanDown: 'furniture_armchair_tan_down',
  deskWood: 'furniture_desk_wood',
  fancyRugWide: 'furniture_fancy_rug_wide',
  waterCooler: 'furniture_water_cooler',
  whiteboardStandGraph: 'furniture_whiteboard_stand_graph',
  bookshelfPurpleTall: 'furniture_bookshelf_purple_tall',
  coffeetableBlackH: 'furniture_coffeetable_black_h',
  coffeepotRight: 'furniture_coffeepot_right',
  blindsLargeWhite: 'furniture_blinds_large_white',
  treasurechestGold: 'furniture_treasurechest_gold',
} as const;

export const FURNITURE_PATHS: Record<string, string> = {
  [FURNITURE_KEYS.bookshelf]: 'assets/furniture/bookshelf.png',
  [FURNITURE_KEYS.whiteboard]: 'assets/furniture/whiteboard.png',
  [FURNITURE_KEYS.clock]: 'assets/furniture/clock.png',
  [FURNITURE_KEYS.plant1]: 'assets/furniture/plant1.png',
  [FURNITURE_KEYS.plant2]: 'assets/furniture/plant2.png',
  [FURNITURE_KEYS.plant3]: 'assets/furniture/plant3.png',
  [FURNITURE_KEYS.flowers1]: 'assets/furniture/flowers1.png',
  [FURNITURE_KEYS.flowers2]: 'assets/furniture/flowers2.png',
  [FURNITURE_KEYS.couch]: 'assets/furniture/couch.png',
  [FURNITURE_KEYS.rug]: 'assets/furniture/rug.png',
  [FURNITURE_KEYS.coffeeMug]: 'assets/furniture/coffee_mug.png',
  [FURNITURE_KEYS.blinds]: 'assets/furniture/blinds.png',
  [FURNITURE_KEYS.coffeeTable]: 'assets/furniture/coffee_table.png',
  // New assets
  [FURNITURE_KEYS.lampTan]: 'assets/furniture/lamp_tan.png',
  [FURNITURE_KEYS.monstera]: 'assets/furniture/monstera.png',
  [FURNITURE_KEYS.monsteraSmall]: 'assets/furniture/monstera_small.png',
  [FURNITURE_KEYS.succulentGreen]: 'assets/furniture/succulent_green.png',
  [FURNITURE_KEYS.succulentBlue]: 'assets/furniture/succulent_blue.png',
  [FURNITURE_KEYS.posterBlue]: 'assets/furniture/poster_blue.png',
  [FURNITURE_KEYS.bulletinBoard]: 'assets/furniture/bulletin_board.png',
  [FURNITURE_KEYS.fancyRug]: 'assets/furniture/fancy_rug.png',
  [FURNITURE_KEYS.cushionBlue]: 'assets/furniture/cushion_blue.png',
  [FURNITURE_KEYS.cushionTan]: 'assets/furniture/cushion_tan.png',
  [FURNITURE_KEYS.armchairTan]: 'assets/furniture/armchair_tan.png',
  [FURNITURE_KEYS.backpackBlue]: 'assets/furniture/backpack_blue.png',
  [FURNITURE_KEYS.backpackRed]: 'assets/furniture/backpack_red.png',
  [FURNITURE_KEYS.plantPoof]: 'assets/furniture/plant_poof.png',
  [FURNITURE_KEYS.plantSpindly]: 'assets/furniture/plant_spindly.png',
  [FURNITURE_KEYS.coffeeMugBlue]: 'assets/furniture/coffee_mug_blue.png',
  [FURNITURE_KEYS.pictureFrame]: 'assets/furniture/picture_frame.png',
  [FURNITURE_KEYS.lantern]: 'assets/furniture/lantern.png',
  [FURNITURE_KEYS.windowBlindsOpen]: 'assets/furniture/window_blinds_open.png',
  [FURNITURE_KEYS.couchTanDown]: 'assets/furniture/couch_tan_down.png',
  [FURNITURE_KEYS.armchairTanDown]: 'assets/furniture/armchair_tan_down.png',
  [FURNITURE_KEYS.deskWood]: 'assets/furniture/desk_wood.png',
  [FURNITURE_KEYS.fancyRugWide]: 'assets/furniture/fancy_rug_wide.png',
  [FURNITURE_KEYS.waterCooler]: 'assets/furniture/water_cooler_better.png',
  [FURNITURE_KEYS.whiteboardStandGraph]: 'assets/furniture/whiteboard_stand_graph.png',
  [FURNITURE_KEYS.bookshelfPurpleTall]: 'assets/furniture/bookshelf_purple_tall.png',
  [FURNITURE_KEYS.coffeetableBlackH]: 'assets/furniture/coffeetable_black_horizontal.png',
  [FURNITURE_KEYS.coffeepotRight]: 'assets/furniture/coffeepot_right.png',
  [FURNITURE_KEYS.blindsLargeWhite]: 'assets/furniture/blinds_large_closed_white.png',
  [FURNITURE_KEYS.treasurechestGold]: 'assets/furniture/treasurechest_closed_gold.png',
};
