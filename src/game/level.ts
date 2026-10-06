/**
 * =====================================================================
 *  LEVEL GENERATOR — สร้างด่าน platformer จากจำนวนข้อสอบ
 *  1 ข้อ = 1 ช่วงด่าน (segment) ที่มีบล็อก [?] 1 ก้อน
 *  ท้ายด่านคือปราสาทบอส (มีประตูเหล็กกั้น จนกว่าบอสจะพ่าย)
 * =====================================================================
 */

export const TILE = 16; // ขนาดช่อง (px)
export const ROWS = 14; // ความสูงด่าน (ช่อง)
export const GROUND_ROW = 12; // แถวผิวดิน

export const Tile = {
  Empty: 0,
  Ground: 1,
  Brick: 2,
  Question: 3,
  Used: 4,
  PipeTopL: 5,
  PipeTopR: 6,
  PipeL: 7,
  PipeR: 8,
  Stone: 9,
  Gate: 10,
  Castle: 11,
} as const;
export type Tile = (typeof Tile)[keyof typeof Tile];

export interface LevelData {
  cols: number;
  rows: number;
  tiles: Uint8Array;
  spawn: { x: number; y: number };
  enemies: { x: number; y: number }[];
  boss: { x: number; y: number; w: number; h: number };
  gateCol: number;
  arenaStartCol: number;
  blockCount: number;
}

const SEG = 14; // ความกว้างของ 1 segment (ช่อง)
const START = 12; // ช่วงเริ่มต้นที่ปลอดภัย
const ARENA = 22; // ความกว้างลานบอส

export function buildLevel(blockCount: number): LevelData {
  const arenaStartCol = START + blockCount * SEG + 2;
  const cols = arenaStartCol + ARENA;
  const tiles = new Uint8Array(cols * ROWS);
  const set = (c: number, r: number, t: Tile) => {
    if (c >= 0 && c < cols && r >= 0 && r < ROWS) tiles[r * cols + c] = t;
  };
  const enemies: { x: number; y: number }[] = [];

  // พื้นดินทั้งด่าน
  for (let c = 0; c < cols; c++) {
    set(c, GROUND_ROW, Tile.Ground);
    set(c, GROUND_ROW + 1, Tile.Ground);
  }
  const pit = (from: number, w: number) => {
    for (let c = from; c < from + w; c++) {
      set(c, GROUND_ROW, Tile.Empty);
      set(c, GROUND_ROW + 1, Tile.Empty);
    }
  };
  const pipe = (c: number, h: number) => {
    const top = GROUND_ROW - h;
    set(c, top, Tile.PipeTopL);
    set(c + 1, top, Tile.PipeTopR);
    for (let r = top + 1; r < GROUND_ROW; r++) {
      set(c, r, Tile.PipeL);
      set(c + 1, r, Tile.PipeR);
    }
  };
  const column = (c: number, h: number, t: Tile) => {
    for (let r = GROUND_ROW - h; r < GROUND_ROW; r++) set(c, r, t);
  };
  const enemy = (c: number) => enemies.push({ x: c * TILE, y: (GROUND_ROW - 1) * TILE });

  // ----- segment ต่อข้อสอบ (5 รูปแบบหมุนเวียน) -----
  for (let i = 0; i < blockCount; i++) {
    const x0 = START + i * SEG;
    const pattern = i === 0 ? 0 : i % 5;
    switch (pattern) {
      case 0: // บล็อก ? ระหว่างอิฐ
        set(x0 + 5, 8, Tile.Brick);
        set(x0 + 6, 8, Tile.Question);
        set(x0 + 7, 8, Tile.Brick);
        if (i > 0) enemy(x0 + 11);
        break;
      case 1: // ท่อ + บล็อก
        pipe(x0 + 2, 2);
        set(x0 + 8, 8, Tile.Question);
        enemy(x0 + 11);
        break;
      case 2: // หลุม + แท่นลอย + บล็อกด้านบน
        pit(x0 + 2, 3);
        for (let c = x0 + 6; c <= x0 + 10; c++) set(c, 9, Tile.Brick);
        set(x0 + 8, 5, Tile.Question);
        break;
      case 3: // บันไดหิน ขึ้น-ลง
        column(x0 + 2, 1, Tile.Stone);
        column(x0 + 3, 2, Tile.Stone);
        column(x0 + 4, 3, Tile.Stone);
        column(x0 + 5, 2, Tile.Stone);
        column(x0 + 6, 1, Tile.Stone);
        set(x0 + 9, 8, Tile.Question);
        enemy(x0 + 11);
        break;
      case 4: // แถวอิฐ + หลุมเล็ก
        for (let c = x0 + 4; c <= x0 + 8; c++) set(c, 8, Tile.Brick);
        set(x0 + 6, 8, Tile.Question);
        enemy(x0 + 9);
        pit(x0 + 11, 2);
        break;
    }
  }

  // ----- ลานบอส -----
  const gateCol = arenaStartCol;
  for (let r = 0; r < GROUND_ROW; r++) set(gateCol, r, Tile.Gate);
  for (let c = arenaStartCol; c < cols; c++) {
    set(c, GROUND_ROW, Tile.Castle);
    set(c, GROUND_ROW + 1, Tile.Castle);
  }
  // กำแพงปิดท้ายด่าน
  for (let r = 0; r < GROUND_ROW; r++) set(cols - 1, r, Tile.Castle);

  const bossW = 48;
  const bossH = 48;
  return {
    cols,
    rows: ROWS,
    tiles,
    spawn: { x: 3 * TILE, y: (GROUND_ROW - 1) * TILE },
    enemies,
    boss: { x: (arenaStartCol + 12) * TILE, y: GROUND_ROW * TILE - bossH, w: bossW, h: bossH },
    gateCol,
    arenaStartCol,
    blockCount,
  };
}
