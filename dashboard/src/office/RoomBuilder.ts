import Phaser from 'phaser';
import { COLORS, TILE, MARGIN, WALL_H } from './palette';
import { FURNITURE_KEYS } from './assetKeys';

export class RoomBuilder {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  build(roomW: number, roomH: number): void {
    this.drawFloor(roomW, roomH);
    this.drawWalls(roomW);
    this.drawRoomBorder(roomW, roomH);
    this.placeFurniture(roomW, roomH);
  }

  private drawFloor(roomW: number, roomH: number): void {
    const g = this.scene.add.graphics();
    // Main floor fill
    g.fillStyle(COLORS.floor, 1);
    g.fillRect(0, WALL_H, roomW, roomH - WALL_H);
    // Checkerboard texture
    g.fillStyle(COLORS.floorAlt, 0.25);
    for (let y = WALL_H; y < roomH; y += TILE) {
      for (let x = 0; x < roomW; x += TILE) {
        if ((x / TILE + y / TILE) % 2 === 0) {
          g.fillRect(x, y, TILE, TILE);
        }
      }
    }
    // Shadow along the wall base for depth
    g.fillStyle(0x000000, 0.1);
    g.fillRect(0, WALL_H, roomW, 10);
    g.fillStyle(0x000000, 0.05);
    g.fillRect(0, WALL_H + 10, roomW, 6);
    // Subtle shadow along left and right walls
    g.fillStyle(0x000000, 0.04);
    g.fillRect(0, WALL_H, 6, roomH - WALL_H);
    g.fillRect(roomW - 6, WALL_H, 6, roomH - WALL_H);
    // Subtle warm highlight on bottom edge
    g.fillStyle(0xddc89e, 0.15);
    g.fillRect(0, roomH - 4, roomW, 4);
    g.setDepth(-2);
  }

  private drawWalls(roomW: number): void {
    const g = this.scene.add.graphics();
    // Wall background — slight gradient effect with two tones
    g.fillStyle(COLORS.wall, 1);
    g.fillRect(0, 0, roomW, WALL_H);
    // Lighter upper band for depth
    g.fillStyle(0xede2d6, 1);
    g.fillRect(0, 0, roomW, WALL_H / 3);
    // Baseboard trim
    g.fillStyle(COLORS.wallTrim, 1);
    g.fillRect(0, WALL_H - 5, roomW, 5);
    // Thin highlight line above baseboard
    g.fillStyle(0xc8b8a8, 1);
    g.fillRect(0, WALL_H - 6, roomW, 1);
    g.setDepth(-1);
  }

  private drawRoomBorder(roomW: number, roomH: number): void {
    const g = this.scene.add.graphics();
    const bg = 0x1a1420;
    const pad = 200; // generous padding to cover any viewport overflow

    // Dark overlay strips outside the room on all 4 sides
    g.fillStyle(bg, 1);
    g.fillRect(-pad, -pad, roomW + pad * 2, pad);         // top
    g.fillRect(-pad, roomH, roomW + pad * 2, pad);        // bottom
    g.fillRect(-pad, -pad, pad, roomH + pad * 2);         // left
    g.fillRect(roomW, -pad, pad, roomH + pad * 2);        // right

    // Clean 2px border around room edge
    g.lineStyle(2, 0x2a2030, 0.8);
    g.strokeRect(0, 0, roomW, roomH);
    g.setDepth(1000);
  }

  placeFurniture(roomW: number, roomH: number): void {
    const s = this.scene;
    const centerX = roomW / 2;
    const deskAreaBottom = roomH - MARGIN;
    const loungeY = deskAreaBottom - TILE * 0.5;

    // ================================================================
    // WALL DECORATIONS — 5 evenly-spaced sections for breathing room
    // ================================================================
    const wallSections = 5;
    const section = roomW / wallSections;

    // Section 1: Window — far left
    s.add.image(section * 0.6, WALL_H + 5, FURNITURE_KEYS.blindsLargeWhite)
      .setOrigin(0.5, 1).setScale(1.8).setDepth(0);

    // Section 2: Bookshelf purple tall — left
    s.add.image(section * 1.8, WALL_H + 40, FURNITURE_KEYS.bookshelfPurpleTall)
      .setOrigin(0.5, 1).setScale(2).setDepth(0);

    // Section 4: Whiteboard stand with graph — right of center
    s.add.image(section * 3.2, WALL_H + 40, FURNITURE_KEYS.whiteboardStandGraph)
      .setOrigin(0.5, 1).setScale(2.0).setDepth(0);

    // Section 5: Window — far right
    s.add.image(section * 4.4, WALL_H + 5, FURNITURE_KEYS.blindsLargeWhite)
      .setOrigin(0.5, 1).setScale(1.8).setDepth(0);

    // ================================================================
    // CORNER PLANTS — one plant anchored to each room corner
    // ================================================================
    // Top-left corner
    s.add.image(MARGIN / 2 + 8, WALL_H + TILE * 2, FURNITURE_KEYS.monstera)
      .setOrigin(0.5, 1).setScale(1.3).setDepth(WALL_H + TILE * 2);

    // Top-right corner — water cooler against the right wall
    s.add.image(roomW - MARGIN / 4, WALL_H + TILE * 2, FURNITURE_KEYS.waterCooler)
      .setOrigin(0.5, 1).setScale(1.5).setDepth(WALL_H + TILE * 2 + 1);

    // Bottom-left corner
    s.add.image(MARGIN / 2, roomH - TILE * 0.5, FURNITURE_KEYS.plant3)
      .setOrigin(0.5, 1).setScale(1.8).setDepth(roomH - TILE * 0.5);

    // Bottom-right corner
    s.add.image(roomW - MARGIN / 2.5, roomH - TILE * 0.5, FURNITURE_KEYS.plantPoof)
      .setOrigin(0.5, 1).setScale(1.8).setDepth(roomH - TILE * 0.5);

    // Bottom-right corner — treasure chest
    s.add.image(roomW - MARGIN / 4, roomH - TILE * 2, FURNITURE_KEYS.treasurechestGold)
      .setOrigin(0.5, 1).setScale(1.4).setDepth(1);



      
    // Middle-left and middle-right (vertical center)
    const midY = WALL_H + (roomH - WALL_H) / 2;
    s.add.image(MARGIN / 2, midY, FURNITURE_KEYS.monsteraSmall)
      .setOrigin(0.5, 1).setScale(1.5).setDepth(midY);
    s.add.image(roomW - MARGIN / 2, midY, FURNITURE_KEYS.plant1)
      .setOrigin(0.5, 1).setScale(1.5).setDepth(midY);

    // ================================================================
    // DESK-AREA ACCENTS — flowers near wall, anchored to desk tops
    // ================================================================


    // ================================================================
    // LOUNGE ZONE — cozy social area at bottom
    // ================================================================
    // Rug — wide rectangular, covers full lounge seating group (448x256 sprite)
    s.add.image(centerX, loungeY + TILE * 0.9, FURNITURE_KEYS.fancyRugWide)
      .setOrigin(0.5, 0.5).setScale(0.7).setDepth(-0.5);

    // Couch — centered, bigger
    const couchY = loungeY + TILE * 0.3;
    s.add.image(centerX, couchY, FURNITURE_KEYS.couchTanDown)
      .setOrigin(0.5, 1).setScale(1.8).setDepth(couchY);

    // Cushions — sitting on the couch seat (slightly above couch bottom)
    s.add.image(centerX - 26, couchY - 28, FURNITURE_KEYS.cushionBlue)
      .setOrigin(0.5, 0.5).setScale(1.5).setDepth(couchY + 1);
    s.add.image(centerX + 26, couchY - 28, FURNITURE_KEYS.cushionTan)
      .setOrigin(0.5, 0.5).setScale(1.5).setDepth(couchY + 1);

    // Armchairs — flanking the couch, same scale
    s.add.image(centerX - 95, loungeY + TILE * 0.8, FURNITURE_KEYS.armchairTanDown)
      .setOrigin(0.5, 1).setScale(1.8).setDepth(loungeY + TILE * 0.8);
    s.add.image(centerX + 95, loungeY + TILE * 0.8, FURNITURE_KEYS.armchairTanDown)
      .setOrigin(0.5, 1).setScale(1.8).setDepth(loungeY + TILE * 0.8);

    // Coffee table — in front of couch
    s.add.image(centerX, loungeY + TILE * 1.5, FURNITURE_KEYS.coffeeTable)
      .setOrigin(0.5, 1).setScale(1.4).setDepth(loungeY + TILE * 1.5);

    // Coffee mug on table
    s.add.image(centerX + 12, loungeY + TILE * 1.3, FURNITURE_KEYS.coffeeMugBlue)
      .setOrigin(0.5, 1).setDepth(loungeY + TILE * 1.5 + 1);

    // Coffee station — right side of lounge
    const stationX = centerX + TILE * 6;
    const stationY = loungeY + TILE * 1.9;
    s.add.image(stationX, stationY, FURNITURE_KEYS.coffeetableBlackH)
      .setOrigin(0.5, 1).setScale(1.5).setDepth(stationY);
    s.add.image(stationX, stationY + 5, FURNITURE_KEYS.coffeepotRight)
      .setOrigin(0.5, 1).setScale(1.2).setDepth(stationY + 1);

  }
}
