/**
 * =====================================================================
 *  SPRITES — ภาพพิกเซลทั้งหมดของเกม (วาดจาก string → offscreen canvas)
 *  '.' = โปร่งใส, ตัวอักษรอื่น = สีจาก palette
 * =====================================================================
 */
import { TILE, Tile } from "./level";

type Palette = Record<string, string>;

function fromRows(rows: string[], palette: Palette, flip = false): HTMLCanvasElement {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  rows.forEach((row, y) => {
    const padded = row.padEnd(w, ".");
    for (let x = 0; x < w; x++) {
      const color = palette[padded[x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(flip ? w - 1 - x : x, y, 1, 1);
    }
  });
  return c;
}

/* ---------------- ผู้เล่น: นักชีววิทยาหมวกเขียว ---------------- */
const PLAYER_PAL: Palette = { G: "#00a844", S: "#fcbcb0", K: "#4a2800", B: "#0058f8", Y: "#f8d800", W: "#ffffff", L: "#80d010" };
const PLAYER_TOP = [
  ".....GGGGG......",
  "....GGGGGGGGL...",
  "....KKKSSKS.....",
  "...KSKSSSKSSS...",
  "...KSKKSSSKSSS..",
  "...KKSSSSKKKK...",
  ".....SSSSSSS....",
  "....GGBGGG......",
  "...GGGBGGBGGG...",
  "..GGGGBBBBGGGG..",
  "..SSGBYBBYBGSS..",
  "..SSSBBBBBBSSS..",
  "..SSBBBBBBBBSS..",
];
const PLAYER_LEGS = {
  stand: ["....BBB..BBB....", "...KKK....KKK...", "..KKKK....KKKK.."],
  run1: ["...BBB...BBB....", "..KKK.....KKK...", ".KKK.......KK..."],
  run2: [".....BBBBB......", ".....KKKK.......", "....KKKK........"],
  jump: ["..BBB....BBB....", ".KKK......KKK...", "KKK........KK..."],
};

/* ---------------- ศัตรู: แบคทีเรียสีม่วง ---------------- */
const ENEMY_PAL: Palette = { P: "#8838d8", D: "#4c1890", W: "#ffffff", K: "#000000", F: "#fca044" };
const ENEMY_BODY = [
  "......PPPP......",
  "....PPPPPPPP....",
  "...PPPPPPPPPP...",
  "..PPWWPPPPWWPP..",
  "..PWKWPPPPWKWP..",
  ".PPWKKPPPPKKWPP.",
  ".PPPWWPPPPWWPPP.",
  "PPPPPPPPPPPPPPPP",
  "PPPPKKKKKKKKPPPP",
  "PPPKWKWKWKWKKPPP",
  ".PPPPPPPPPPPPPP.",
  "..DDPPPPPPPPDD..",
  "...DDDDDDDDDD...",
];
const ENEMY_FEET = {
  a: ["..FFF......FFF..", ".FFFF......FFFF.", "................"],
  b: ["...FFF....FFF...", "...FFFF..FFFF...", "................"],
};
const ENEMY_SQUISH = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "....PPPPPPPP....",
  "..PPWKPPPPKWPP..",
  ".PPPPPPPPPPPPPP.",
  "PPPPKKKKKKKKPPPP",
  ".DDDDDDDDDDDDDD.",
  "..FFF......FFF..",
  ".FFFF......FFFF.",
  "................",
];

/* ---------------- บอส: จอมมารคลอโรพลาสต์ (24x24 → วาด x2) ---------------- */
const BOSS_PAL: Palette = { G: "#00a800", L: "#80d010", D: "#005800", W: "#ffffff", K: "#000000", Y: "#f8d800", R: "#e40058", T: "#fcfcfc" };
const BOSS_ROWS = [
  "........Y..Y..Y.........",
  "........YYYYYYYY........",
  "........YRYYRYYR........",
  "......GGGGGGGGGGGG......",
  "....GGGGGGGGGGGGGGGG....",
  "...GGLLGGGGGGGGGGLLGGG..",
  "..GGGLLLGGGGGGGGLLLGGGG.",
  "..GGKKGGGGGGGGGGGGKKGGG.",
  ".GGGGKKKGGGGGGGGKKKGGGGG",
  ".GGGWWWWWGGGGGGWWWWWGGGG",
  ".GGGWKKWWGGGGGGWWKKWGGGG",
  ".GGGWKKWWGGGGGGWWKKWGGGG",
  ".GGGGWWWGGGGGGGGWWWGGGGG",
  ".GGGGGGGGGGGGGGGGGGGGGGG",
  ".GGKKKKKKKKKKKKKKKKKKGGG",
  ".GGKTKKTKKTKKTKKTKKTKGGG",
  ".GGKKKKKKKKKKKKKKKKKKGGG",
  ".GGGKTKKTKKTKKTKKTKKGGGG",
  "..GGGKKKKKKKKKKKKKKGGGG.",
  "..GGLLGGGLLGGGGLLGGGLLG.",
  "...GGGGGGGGGGGGGGGGGGG..",
  "....GGGGGGGGGGGGGGGGG...",
  "....DDDD.........DDDD...",
  "...DDDDDD.......DDDDDD..",
];

/* ---------------- Tiles (วาดแบบ procedural) ---------------- */
function tileCanvas(draw: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = TILE;
  c.height = TILE;
  draw(c.getContext("2d")!);
  return c;
}
const QMARK = ["..XXXX..", ".XX..XX.", ".....XX.", "....XX..", "...XX...", "...XX...", "........", "...XX..."];

function questionBlock(fill: string): HTMLCanvasElement {
  return tileCanvas((g) => {
    g.fillStyle = "#000";
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = fill;
    g.fillRect(1, 1, 14, 14);
    g.fillStyle = "#fce4a0";
    g.fillRect(1, 1, 14, 1);
    g.fillRect(1, 1, 1, 14);
    g.fillStyle = "#a85c00";
    g.fillRect(1, 14, 14, 1);
    g.fillRect(14, 1, 1, 14);
    // หมุดมุม
    g.fillStyle = "#000";
    [[2, 2], [13, 2], [2, 13], [13, 13]].forEach(([x, y]) => g.fillRect(x, y, 1, 1));
    // เครื่องหมาย ?
    QMARK.forEach((row, y) =>
      row.split("").forEach((ch, x) => {
        if (ch === "X") {
          g.fillStyle = "#5c2c00";
          g.fillRect(4 + x + 1, 4 + y + 1 - 1, 1, 1);
          g.fillStyle = "#fcfcfc";
          g.fillRect(4 + x, 4 + y - 1, 1, 1);
        }
      }),
    );
  });
}

export interface SpriteSheet {
  player: Record<"stand" | "run1" | "run2" | "jump", { r: HTMLCanvasElement; l: HTMLCanvasElement }>;
  enemy: { a: HTMLCanvasElement; b: HTMLCanvasElement; squish: HTMLCanvasElement };
  boss: HTMLCanvasElement;
  tiles: Partial<Record<Tile, HTMLCanvasElement>>;
  question: HTMLCanvasElement[]; // เฟรมเรืองแสง
}

export function buildSprites(): SpriteSheet {
  const player = {} as SpriteSheet["player"];
  (Object.keys(PLAYER_LEGS) as (keyof typeof PLAYER_LEGS)[]).forEach((k) => {
    const rows = [...PLAYER_TOP, ...PLAYER_LEGS[k]];
    player[k] = { r: fromRows(rows, PLAYER_PAL), l: fromRows(rows, PLAYER_PAL, true) };
  });

  const tiles: SpriteSheet["tiles"] = {
    [Tile.Ground]: tileCanvas((g) => {
      g.fillStyle = "#c84c0c";
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = "#fcbcb0";
      g.fillRect(0, 0, 16, 1);
      g.fillStyle = "#000";
      g.fillRect(0, 7, 16, 1);
      g.fillRect(0, 15, 16, 1);
      g.fillRect(7, 0, 1, 7);
      g.fillRect(15, 8, 1, 7);
      g.fillStyle = "#fc9838";
      g.fillRect(1, 1, 5, 1);
      g.fillRect(9, 9, 5, 1);
    }),
    [Tile.Brick]: tileCanvas((g) => {
      g.fillStyle = "#c84c0c";
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = "#000";
      for (const y of [3, 7, 11, 15]) g.fillRect(0, y, 16, 1);
      for (let row = 0; row < 4; row++) {
        const off = row % 2 === 0 ? 0 : 4;
        for (let x = off; x < 16; x += 8) g.fillRect(x, row * 4, 1, 3);
      }
      g.fillStyle = "#fc9838";
      g.fillRect(0, 0, 16, 1);
    }),
    [Tile.Used]: tileCanvas((g) => {
      g.fillStyle = "#000";
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = "#885818";
      g.fillRect(1, 1, 14, 14);
      g.fillStyle = "#000";
      [[3, 3], [12, 3], [3, 12], [12, 12]].forEach(([x, y]) => g.fillRect(x, y, 1, 1));
    }),
    [Tile.Stone]: tileCanvas((g) => {
      g.fillStyle = "#000";
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = "#c84c0c";
      g.fillRect(1, 1, 14, 14);
      g.fillStyle = "#fc9838";
      g.fillRect(1, 1, 13, 2);
      g.fillRect(1, 1, 2, 13);
      g.fillStyle = "#7c2c00";
      g.fillRect(3, 13, 12, 2);
      g.fillRect(13, 3, 2, 12);
    }),
    [Tile.PipeTopL]: tileCanvas((g) => {
      g.fillStyle = "#000";
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = "#00a800";
      g.fillRect(1, 1, 15, 14);
      g.fillStyle = "#80d010";
      g.fillRect(3, 1, 3, 14);
    }),
    [Tile.PipeTopR]: tileCanvas((g) => {
      g.fillStyle = "#000";
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = "#00a800";
      g.fillRect(0, 1, 15, 14);
      g.fillStyle = "#005800";
      g.fillRect(10, 1, 4, 14);
    }),
    [Tile.PipeL]: tileCanvas((g) => {
      g.fillStyle = "#000";
      g.fillRect(1, 0, 15, 16);
      g.fillStyle = "#00a800";
      g.fillRect(2, 0, 14, 16);
      g.fillStyle = "#80d010";
      g.fillRect(4, 0, 3, 16);
    }),
    [Tile.PipeR]: tileCanvas((g) => {
      g.fillStyle = "#000";
      g.fillRect(0, 0, 15, 16);
      g.fillStyle = "#00a800";
      g.fillRect(0, 0, 14, 16);
      g.fillStyle = "#005800";
      g.fillRect(9, 0, 4, 16);
    }),
    [Tile.Gate]: tileCanvas((g) => {
      g.fillStyle = "#1a1a2e";
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = "#9c9c9c";
      g.fillRect(2, 0, 2, 16);
      g.fillRect(7, 0, 2, 16);
      g.fillRect(12, 0, 2, 16);
      g.fillRect(0, 6, 16, 2);
      g.fillStyle = "#f8d800";
      g.fillRect(7, 6, 2, 2);
    }),
    [Tile.Castle]: tileCanvas((g) => {
      g.fillStyle = "#6c6c6c";
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = "#3c3c3c";
      g.fillRect(0, 7, 16, 1);
      g.fillRect(0, 15, 16, 1);
      g.fillRect(7, 0, 1, 7);
      g.fillRect(15, 8, 1, 7);
      g.fillStyle = "#9c9c9c";
      g.fillRect(0, 0, 7, 1);
      g.fillRect(8, 8, 7, 1);
    }),
  };

  return {
    player,
    enemy: {
      a: fromRows([...ENEMY_BODY, ...ENEMY_FEET.a], ENEMY_PAL),
      b: fromRows([...ENEMY_BODY, ...ENEMY_FEET.b], ENEMY_PAL),
      squish: fromRows(ENEMY_SQUISH, ENEMY_PAL),
    },
    boss: fromRows(BOSS_ROWS, BOSS_PAL),
    tiles,
    question: [questionBlock("#f8b800"), questionBlock("#fcc838"), questionBlock("#fcd860"), questionBlock("#fcc838")],
  };
}
