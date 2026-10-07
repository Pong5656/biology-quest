/**
 * =====================================================================
 *  PLATFORMER ENGINE — Vanilla JS + HTML5 Canvas
 *  -------------------------------------------------------------------
 *  • Fixed timestep 60Hz (requestAnimationFrame + accumulator) → ฟิสิกส์นิ่ง
 *  • แรงโน้มถ่วง / ความเร็ว / ความเร่ง / แรงเสียดทาน
 *  • AABB vs tile collision (แยกแกน X แล้ว Y)
 *  • Coyote time + Jump buffer + กระโดดสูงต่ำตามการกดค้าง
 *  • ศัตรูเดินไปมา (เหยียบได้), หลุม, บล็อก [?] ที่ชนจากด้านล่าง
 *  • Projectile ยิงบอส, cutscene บอสพ่าย, cutscene ผู้เล่นตาย
 *
 *  Engine ไม่รู้เรื่องข้อสอบ/HP — แจ้งเหตุการณ์ผ่าน callbacks ให้ React ตัดสิน
 * =====================================================================
 */
import { buildLevel, GROUND_ROW, TILE, Tile, type LevelData } from "./level";
import { buildSprites, type SpriteSheet } from "./sprites";
import { sfx } from "@/lib/sfx";

/* ---------- ค่าคงที่ฟิสิกส์ (หน่วย px, วินาที) ---------- */
export const VIEW_W = 384;
export const VIEW_H = 224;
const STEP = 1 / 60;
const GRAVITY = 920; // ขึ้นลอยนุ่ม
const FALL_GRAVITY = 1080; // ตกลงมาไม่กระชาก (ไม่ใช้ตัวคูณ 2.4 แบบเดิม)
const JUMP_V = 448; // กระโดดสูงขึ้น ~1 ช่วงบล็อก
const DOUBLE_JUMP_V = 400;
const JUMP_CUT = 1.45;
const MAX_RUN = 132;
const ACCEL = 1400; // เร่งทันที ไม่รู้สึกหน่วงตอนกดเดิน
const AIR_ACCEL = 1100;
const FRICTION = 1400;
const MAX_FALL = 300;
const COYOTE = 0.1;
const JUMP_BUFFER = 0.14;
const INVINCIBLE = 1.5;
const ENEMY_SPEED = 30;

export interface EngineCallbacks {
  /** ชนบล็อก [?] จากด้านล่าง (engine เปลี่ยนเป็นบล็อกใช้แล้วเอง) */
  onQuestionBlock: () => void;
  /** โดนศัตรูหรือตกหลุม (engine ให้อมตะชั่วคราวแล้ว) */
  onHazard: (kind: "enemy" | "pit") => void;
  /** เหยียบศัตรูสำเร็จ */
  onStomp: () => void;
  /** เก็บเหรียญ */
  onCoin: () => void;
  /** เก็บหัวใจ (ฟื้นฟู 1 HP) */
  onHeal: () => void;
  /** เก็บดาว (พลัง 3 วินาที) */
  onStar: () => void;
  /** cutscene บอสระเบิดจบแล้ว */
  onBossDefeated: () => void;
  /** cutscene ผู้เล่นตายจบแล้ว */
  onDeathDone: () => void;
}

interface Body {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
}
interface Enemy extends Body {
  alive: boolean;
  squishT: number; // >0 = กำลังแบน
  active: boolean;
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}
interface FloatText {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}
interface Projectile {
  x: number;
  y: number;
  vx: number;
  hpAfter: number;
}
interface Bump {
  col: number;
  row: number;
  t: number;
}

type Mode = "play" | "paused" | "bossDefeat" | "dying";

export class PlatformerEngine {
  private ctx: CanvasRenderingContext2D;
  private level: LevelData;
  private sprites: SpriteSheet;
  private cb: EngineCallbacks;

  private mode: Mode = "play";
  private raf = 0;
  private last = 0;
  private acc = 0;
  private time = 0;
  private camX = 0;

  /* input (ทั้งคีย์บอร์ดและปุ่มสัมผัสเขียนมาที่นี่) */
  private keys = { left: false, right: false, jump: false };
  private touch = { left: false, right: false, jump: false };
  private jumpBuffer = 0;
  private coyote = 0;

  private player: Body & { facing: 1 | -1; invincible: number; hurtFlash: number; runDist: number; knock: number; starT: number; airJumps: number };
  private lastSafe = { x: 0, y: 0 };
  private enemies: Enemy[] = [];
  private items: { kind: "coin" | "heart" | "star"; x: number; y: number; taken: boolean }[] = [];
  private particles: Particle[] = [];
  private texts: FloatText[] = [];
  private projectiles: Projectile[] = [];
  private bumps: Bump[] = [];
  private pendingBlockHit = -1; // หน่วงให้เห็นบล็อกเด้งก่อนเปิดคำถาม

  private boss = { x: 0, y: 0, w: 48, h: 48, hp: 1, maxHp: 1, hitT: 0, alive: true, defeatT: 0 };
  private defeatRequested = false;
  private deathT = 0;
  private callbackFired = false;

  constructor(canvas: HTMLCanvasElement, blockCount: number, bossHp: number, cb: EngineCallbacks) {
    canvas.width = VIEW_W;
    canvas.height = VIEW_H;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.imageSmoothingEnabled = false;
    this.cb = cb;
    this.level = buildLevel(blockCount);
    this.sprites = buildSprites();

    const s = this.level.spawn;
    // hitbox แคบกว่าสไปรต์เล็กน้อย — กันขอบพิกเซลเกี่ยวด่านโดยไม่ตั้งใจ
    this.player = { x: s.x + 1, y: s.y + 1, w: 10, h: 15, vx: 0, vy: 0, onGround: false, facing: 1, invincible: 0, hurtFlash: 0, runDist: 0, knock: 0, starT: 0, airJumps: 1 };
    this.lastSafe = { ...s };
    this.enemies = this.level.enemies.map((e) => ({ x: e.x, y: e.y, w: 14, h: 14, vx: -ENEMY_SPEED, vy: 0, onGround: false, alive: true, squishT: 0, active: false }));
    this.items = this.level.items.map((it) => ({ ...it, taken: false }));
    const b = this.level.boss;
    this.boss = { ...this.boss, x: b.x, y: b.y, w: b.w, h: b.h, hp: bossHp, maxHp: bossHp };
  }

  /* =================== Public API =================== */
  start() {
    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp, { passive: false });
    window.addEventListener("blur", this.clearInput);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }
  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.clearInput);
  }
  pause() {
    if (this.mode === "play") this.mode = "paused";
    this.clearInput();
  }
  resume() {
    if (this.mode === "paused") this.mode = "play";
    this.clearInput();
  }
  /** ปุ่มสัมผัสบนมือถือ */
  setTouch(key: "left" | "right" | "jump", down: boolean) {
    if (key === "jump" && down && !this.touch.jump) this.jumpBuffer = JUMP_BUFFER;
    this.touch[key] = down;
  }
  /** ตอบถูก → ยิงลูกพลังงาน ATP ไปหาบอส */
  fireProjectile(hpAfter: number) {
    const p = this.player;
    this.projectiles.push({ x: p.x + p.w, y: p.y + 4, vx: 160, hpAfter });
    this.addText(p.x - 8, p.y - 10, "+1000", "#f8d800");
    for (let i = 0; i < 10; i++) this.addParticle(p.x + 6, p.y + 4, "#f8d800");
    sfx.fireball();
  }
  /** ตอบผิด/หมดเวลา → กระพริบแดง */
  hurtFlash() {
    this.player.hurtFlash = 0.8;
    this.addText(this.player.x - 4, this.player.y - 10, "-1 ❤", "#ff4060");
  }
  /** HP บอสเป็น 0 → รอกระสุนถึงแล้วเล่นฉากระเบิด */
  startBossDefeat() {
    this.defeatRequested = true;
    this.mode = "bossDefeat";
    this.callbackFired = false;
    this.clearInput();
  }
  /** HP ผู้เล่นเป็น 0 → ฉากตาย */
  killPlayer() {
    this.mode = "dying";
    this.deathT = 0;
    this.callbackFired = false;
    this.player.vy = -320;
    this.player.vx = 0;
    this.clearInput();
  }
  get progress() {
    return Math.min(1, this.player.x / (this.level.arenaStartCol * TILE));
  }

  /* =================== Input =================== */
  private clearInput = () => {
    this.keys = { left: false, right: false, jump: false };
    this.touch = { left: false, right: false, jump: false };
    this.jumpBuffer = 0;
  };
  private mapKey(e: KeyboardEvent): "left" | "right" | "jump" | null {
    switch (e.code) {
      case "ArrowLeft":
      case "KeyA":
        return "left";
      case "ArrowRight":
      case "KeyD":
        return "right";
      case "Space":
      case "ArrowUp":
      case "KeyW":
        return "jump";
    }
    return null;
  }
  private onKeyDown = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    const k = this.mapKey(e);
    if (!k) return;
    e.preventDefault();
    if (this.mode !== "play") return;
    // ตั้งค่าทันทีในเฟรมที่กด — ไม่รอ React
    if (k === "jump" && !e.repeat && !this.keys.jump) this.jumpBuffer = JUMP_BUFFER;
    this.keys[k] = true;
  };
  private onKeyUp = (e: KeyboardEvent) => {
    const k = this.mapKey(e);
    if (k) this.keys[k] = false;
  };
  private get input() {
    return {
      left: this.keys.left || this.touch.left,
      right: this.keys.right || this.touch.right,
      jump: this.keys.jump || this.touch.jump,
    };
  }

  /* =================== Tile helpers =================== */
  private tileAt(c: number, r: number): number {
    if (c < 0 || c >= this.level.cols) return Tile.Castle; // ขอบซ้าย/ขวาเป็นกำแพง
    if (r < 0 || r >= this.level.rows) return Tile.Empty;
    return this.level.tiles[r * this.level.cols + c];
  }
  private setTile(c: number, r: number, t: number) {
    this.level.tiles[r * this.level.cols + c] = t;
  }
  private solid(c: number, r: number) {
    return this.tileAt(c, r) !== Tile.Empty;
  }

  /** เคลื่อนที่แกน X พร้อมชนกำแพง — คืน true ถ้าชน */
  private moveX(b: Body, dt: number): boolean {
    b.x += b.vx * dt;
    const top = Math.floor(b.y / TILE);
    const bottom = Math.floor((b.y + b.h - 0.01) / TILE);
    if (b.vx > 0) {
      const col = Math.floor((b.x + b.w - 0.01) / TILE);
      for (let r = top; r <= bottom; r++)
        if (this.solid(col, r)) {
          b.x = col * TILE - b.w;
          return true;
        }
    } else if (b.vx < 0) {
      const col = Math.floor(b.x / TILE);
      for (let r = top; r <= bottom; r++)
        if (this.solid(col, r)) {
          b.x = (col + 1) * TILE;
          return true;
        }
    }
    return false;
  }

  /** เคลื่อนที่แกน Y — คืนคอลัมน์ที่หัวชน (ถ้ามี) */
  private moveY(b: Body, dt: number): number[] {
    b.y += b.vy * dt;
    b.onGround = false;
    const left = Math.floor(b.x / TILE);
    const right = Math.floor((b.x + b.w - 0.01) / TILE);
    const heads: number[] = [];
    if (b.vy > 0) {
      const row = Math.floor((b.y + b.h - 0.01) / TILE);
      for (let c = left; c <= right; c++)
        if (this.solid(c, row)) {
          b.y = row * TILE - b.h;
          b.vy = 0;
          b.onGround = true;
          break;
        }
    } else if (b.vy < 0) {
      const row = Math.floor(b.y / TILE);
      for (let c = left; c <= right; c++) if (this.solid(c, row)) heads.push(c);
      if (heads.length) {
        b.y = (row + 1) * TILE;
        b.vy = 0;
      }
    }
    return heads;
  }

  /* =================== Main loop =================== */
  private frame = (now: number) => {
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.acc += dt;
    while (this.acc >= STEP) {
      this.update(STEP);
      this.acc -= STEP;
    }
    this.render();
    this.raf = requestAnimationFrame(this.frame);
  };

  private update(dt: number) {
    if (this.mode === "paused") return; // หยุดโลกทั้งใบระหว่างตอบคำถาม
    this.time += dt;

    // อนิเมชันทั่วไป
    this.bumps = this.bumps.filter((b) => (b.t += dt) < 0.2);
    this.particles = this.particles.filter((p) => {
      p.vy += 500 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return (p.life -= dt) > 0;
    });
    this.texts = this.texts.filter((t) => {
      t.y -= 30 * dt;
      return (t.life -= dt) > 0;
    });
    this.updateProjectiles(dt);
    if (this.boss.hitT > 0) this.boss.hitT -= dt;

    if (this.mode === "play") {
      this.updatePlayer(dt);
      this.updateEnemies(dt);
      this.updateItems();
      this.updateCamera(dt, this.player.x + this.player.w / 2);
      // หน่วงเปิดคำถามหลังบล็อกเด้ง
      if (this.pendingBlockHit >= 0) {
        this.pendingBlockHit -= dt;
        if (this.pendingBlockHit < 0) {
          this.pendingBlockHit = -1;
          this.cb.onQuestionBlock();
        }
      }
    } else if (this.mode === "dying") {
      const p = this.player;
      p.vy += GRAVITY * dt;
      p.y += p.vy * dt;
      this.deathT += dt;
      if (this.deathT > 1.6 && !this.callbackFired) {
        this.callbackFired = true;
        this.cb.onDeathDone();
      }
    } else if (this.mode === "bossDefeat") {
      this.updateBossDefeat(dt);
    }
  }

  private updatePlayer(dt: number) {
    const p = this.player;
    const inp = this.input;
    const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);

    if (p.knock > 0) p.knock -= dt;
    if (p.invincible > 0) p.invincible -= dt;
    if (p.hurtFlash > 0) p.hurtFlash -= dt;

    if (p.starT > 0) p.starT -= dt;

    // แนวนอน: เร่ง/เบรก
    if (dir !== 0 && p.knock <= 0) {
      p.vx += dir * (p.onGround ? ACCEL : AIR_ACCEL) * dt;
      p.vx = Math.max(-MAX_RUN, Math.min(MAX_RUN, p.vx));
      p.facing = dir as 1 | -1;
    } else if (p.onGround) {
      const f = FRICTION * dt;
      p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f;
    }

    // กระโดดคู่: ครั้งแรกใช้ coyote, ครั้งที่สองใช้ airJumps (รีเซ็ตเมื่อแตะพื้น)
    if (p.onGround) p.airJumps = 1;
    this.coyote = p.onGround ? COYOTE : this.coyote - dt;
    this.jumpBuffer -= dt;
    if (this.jumpBuffer > 0 && (this.coyote > 0 || p.airJumps > 0)) {
      const second = this.coyote <= 0;
      if (second) p.airJumps -= 1;
      p.vy = second ? -DOUBLE_JUMP_V : -JUMP_V;
      this.jumpBuffer = 0;
      this.coyote = 0;
      sfx.jump();
      if (second) {
        for (let i = 0; i < 5; i++) this.addParticle(p.x + 4, p.y + p.h, "#fcfcfc");
      }
    }

    // ตกนุ่ม: ไม่คูณแรงโน้มถ่วงแรงตอนปล่อยปุ่ม
    const risingCut = p.vy < 0 && !inp.jump;
    const g = risingCut ? GRAVITY * JUMP_CUT : p.vy > 40 ? FALL_GRAVITY : GRAVITY;
    p.vy = Math.min(MAX_FALL, p.vy + g * dt);

    if (this.moveX(p, dt)) p.vx = 0;
    const heads = this.moveY(p, dt);
    if (heads.length) this.handleHeadHit(heads);

    // จุดเกิดใหม่ล่าสุด (ยืนบนพื้นมั่นคงทั้งสองข้าง)
    if (p.onGround) {
      const row = Math.floor((p.y + p.h + 1) / TILE);
      if (this.solid(Math.floor(p.x / TILE), row) && this.solid(Math.floor((p.x + p.w - 0.01) / TILE), row)) {
        this.lastSafe = { x: p.x, y: p.y };
      }
    }
    p.runDist += Math.abs(p.vx) * dt;

    // ตกหลุม
    if (p.y > this.level.rows * TILE + 32) {
      sfx.fall();
      p.x = this.lastSafe.x;
      p.y = this.lastSafe.y - 2;
      p.vx = 0;
      p.vy = 0;
      p.invincible = INVINCIBLE;
      this.cb.onHazard("pit");
    }
  }

  /** หัวชนบล็อก — เลือกบล็อกที่ทับซ้อนมากที่สุด */
  private handleHeadHit(cols: number[]) {
    const p = this.player;
    const row = Math.floor((p.y - 1) / TILE);
    let best = cols[0];
    let bestOverlap = -1;
    for (const c of cols) {
      const overlap = Math.min(p.x + p.w, (c + 1) * TILE) - Math.max(p.x, c * TILE);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        best = c;
      }
    }
    const t = this.tileAt(best, row);
    if (t === Tile.Question) {
      this.setTile(best, row, Tile.Used);
      this.bumps.push({ col: best, row, t: 0 });
      for (let i = 0; i < 6; i++) this.addParticle(best * TILE + 8, row * TILE, "#f8d800");
      sfx.coin();
      this.pendingBlockHit = 0.18;
      // ศัตรูที่ยืนบนบล็อกจะกระเด็น (เหมือนเกมต้นฉบับ)
    } else if (t === Tile.Brick || t === Tile.Used || t === Tile.Stone) {
      this.bumps.push({ col: best, row, t: 0 });
      sfx.bump();
    }
  }

  private updateEnemies(dt: number) {
    const p = this.player;
    for (const e of this.enemies) {
      if (!e.alive) {
        if (e.squishT > 0) e.squishT -= dt;
        continue;
      }
      // เริ่มเดินเมื่อเข้าใกล้หน้าจอ
      if (!e.active) {
        if (e.x < this.camX + VIEW_W + 32) e.active = true;
        else continue;
      }
      e.vy = Math.min(MAX_FALL, e.vy + GRAVITY * dt);
      if (this.moveX(e, dt)) e.vx = -e.vx;
      this.moveY(e, dt);
      // กลับตัวที่ขอบหลุม
      if (e.onGround) {
        const aheadCol = e.vx > 0 ? Math.floor((e.x + e.w + 1) / TILE) : Math.floor((e.x - 1) / TILE);
        const belowRow = Math.floor((e.y + e.h + 1) / TILE);
        if (!this.solid(aheadCol, belowRow)) e.vx = -e.vx;
      }
      if (e.y > this.level.rows * TILE + 32) e.alive = false;

      // ชนผู้เล่น
      const overlapX = Math.min(p.x + p.w, e.x + e.w) - Math.max(p.x, e.x);
      const overlapY = Math.min(p.y + p.h, e.y + e.h) - Math.max(p.y, e.y);
      // ต้องทับกันจริง ๆ ไม่นับการเฉี่ยวขอบ 1 พิกเซล
      if (overlapX > 3 && overlapY > 3) {
        const stomp = p.vy > 0 && p.y + p.h - e.y < 10;
        if (p.starT > 0) {
          // ดาวพลัง: ชนศัตรูแล้วศัตรูตาย (เหมือนมาริโอ)
          e.alive = false;
          e.squishT = 0.5;
          this.addText(e.x, e.y - 8, "+200", "#f8d800");
          sfx.explode();
          continue;
        }
        if (stomp) {
          e.alive = false;
          e.squishT = 0.5;
          p.vy = -320;
          this.addText(e.x, e.y - 8, "+100", "#ffffff");
          sfx.stomp();
          this.cb.onStomp();
        } else if (p.invincible <= 0) {
          p.invincible = INVINCIBLE; // ดาวพลังกันความเสียหายด้วย (starT>0 จะถูกจับในกิ่งก่อน)
          p.knock = 0.25;
          p.vx = (p.x < e.x ? -1 : 1) * 160;
          p.vy = -200;
          sfx.wrong();
          this.cb.onHazard("enemy");
        }
      }
    }
  }

  /** เก็บไอเทม (เหรียญ / หัวใจ / ดาว) */
  private updateItems() {
    const p = this.player;
    for (const it of this.items) {
      if (it.taken) continue;
      const bob = Math.sin(this.time * 3 + it.x * 0.1) * 2;
      const ix = it.x, iy = it.y + bob;
      if (p.x < ix + 12 && p.x + p.w > ix && p.y < iy + 12 && p.y + p.h > iy) {
        it.taken = true;
        if (it.kind === "coin") {
          this.addText(ix - 4, iy - 10, "+50", "#f8d800");
          sfx.coin();
          this.cb.onCoin();
        } else if (it.kind === "heart") {
          this.addText(ix - 4, iy - 10, "+1 ❤", "#ff5c8a");
          sfx.heal();
          this.cb.onHeal();
        } else {
          this.addText(ix - 8, iy - 10, "STAR!", "#f8d800");
          sfx.star();
          p.starT = 3;
          this.cb.onStar();
        }
      }
    }
  }

  private updateProjectiles(dt: number) {
    const b = this.boss;
    this.projectiles = this.projectiles.filter((pr) => {
      pr.vx += 2600 * dt; // เร่งความเร็วเรื่อย ๆ ให้ถึงบอสไว
      pr.x += pr.vx * dt;
      if (Math.random() < 0.6) this.particles.push({ x: pr.x, y: pr.y + 3, vx: -40, vy: (Math.random() - 0.5) * 40, life: 0.25, color: "#fca044", size: 2 });
      if (pr.x >= b.x + 8) {
        b.hp = pr.hpAfter;
        b.hitT = 0.5;
        for (let i = 0; i < 14; i++) this.addParticle(b.x + 12, b.y + 20, i % 2 ? "#f8d800" : "#ffffff");
        sfx.hit();
        return false;
      }
      return true;
    });
  }

  private updateBossDefeat(dt: number) {
    const b = this.boss;
    // รอให้ลูกพลังงานลูกสุดท้ายไปถึงก่อน
    if (this.projectiles.length > 0) {
      this.updateCamera(dt, this.player.x + this.player.w / 2);
      return;
    }
    this.updateCamera(dt, b.x + b.w / 2, 4);
    b.defeatT += dt;
    if (b.alive && Math.floor(b.defeatT * 10) !== Math.floor((b.defeatT - dt) * 10)) {
      for (let i = 0; i < 8; i++) this.addParticle(b.x + Math.random() * b.w, b.y + Math.random() * b.h, ["#f8d800", "#e40058", "#ffffff", "#fca044"][i % 4], 3);
      if (Math.random() < 0.5) sfx.explode();
    }
    if (b.defeatT > 2 && b.alive) {
      b.alive = false;
      // เปิดประตูปราสาท
      for (let r = 0; r < GROUND_ROW; r++) this.setTile(this.level.gateCol, r, Tile.Empty);
      for (let i = 0; i < 40; i++) this.addParticle(b.x + b.w / 2, b.y + b.h / 2, i % 2 ? "#00a800" : "#80d010", 3);
    }
    if (b.defeatT > 3 && !this.callbackFired) {
      this.callbackFired = true;
      this.cb.onBossDefeated();
    }
  }

  private updateCamera(dt: number, targetX: number, speed = 10) {
    const maxX = this.level.cols * TILE - VIEW_W;
    const target = Math.max(0, Math.min(maxX, targetX - VIEW_W * 0.4));
    this.camX += (target - this.camX) * Math.min(1, speed * dt);
  }

  private addParticle(x: number, y: number, color: string, size = 2) {
    this.particles.push({ x, y, vx: (Math.random() - 0.5) * 220, vy: -Math.random() * 220 - 40, life: 0.6 + Math.random() * 0.4, color, size });
  }
  private addText(x: number, y: number, text: string, color: string) {
    this.texts.push({ x, y, text, life: 1, color });
  }

  /* =================== Render =================== */
  private render() {
    const g = this.ctx;
    const cam = Math.round(this.camX);
    const S = this.sprites;

    // ท้องฟ้า
    g.fillStyle = "#5c94fc";
    g.fillRect(0, 0, VIEW_W, VIEW_H);

    // ภูเขา (parallax 0.3)
    for (let i = -1; i < 6; i++) {
      const base = i * 300 - ((cam * 0.3) % 300);
      this.drawHill(base + 40, GROUND_ROW * TILE, i % 2 ? 3 : 5);
    }
    // เมฆ (parallax 0.5)
    for (let i = -1; i < 5; i++) {
      const x = i * 180 - ((cam * 0.5) % 180) + 30;
      this.drawCloud(x, 24 + (i % 3) * 18);
    }

    // พื้นหลังปราสาท
    const arenaX = this.level.arenaStartCol * TILE - cam;
    if (arenaX < VIEW_W) {
      g.fillStyle = "#2a1a3e";
      g.fillRect(arenaX, 0, this.level.cols * TILE, GROUND_ROW * TILE);
      g.fillStyle = "#3a2a5e";
      for (let y = 0; y < GROUND_ROW * TILE; y += 16)
        for (let x = 0; x < 22 * TILE; x += 32) g.fillRect(arenaX + x + ((y / 16) % 2) * 16, y, 15, 15);
    }

    // ไทล์
    const c0 = Math.floor(cam / TILE);
    const c1 = c0 + Math.ceil(VIEW_W / TILE) + 1;
    const qFrame = S.question[Math.floor(this.time * 6) % S.question.length];
    for (let c = c0; c <= c1; c++) {
      for (let r = 0; r < this.level.rows; r++) {
        const t = this.tileAt(c, r);
        if (t === Tile.Empty || c >= this.level.cols) continue;
        const bump = this.bumps.find((b) => b.col === c && b.row === r);
        const off = bump ? -Math.sin((bump.t / 0.2) * Math.PI) * 6 : 0;
        const img = t === Tile.Question ? qFrame : S.tiles[t as Tile];
        if (img) g.drawImage(img, c * TILE - cam, r * TILE + off);
      }
    }

    // บอส
    const b = this.boss;
    if (b.alive) {
      const bx = Math.round(b.x - cam);
      const bob = Math.round(Math.sin(this.time * 3) * 2);
      const blink = (b.hitT > 0 && Math.floor(b.hitT * 20) % 2 === 0) || (this.mode === "bossDefeat" && this.projectiles.length === 0 && Math.floor(this.time * 16) % 2 === 0);
      if (bx > -60 && bx < VIEW_W + 10) {
        g.globalAlpha = blink ? 0.4 : 1;
        g.drawImage(S.boss, bx, b.y + bob, b.w, b.h);
        g.globalAlpha = 1;
        // หลอด HP เหนือหัวบอส
        g.fillStyle = "#000";
        g.fillRect(bx - 2, b.y - 12, b.w + 4, 7);
        g.fillStyle = "#e40058";
        g.fillRect(bx, b.y - 10, Math.round((b.w * Math.max(0, b.hp)) / b.maxHp), 3);
      }
    }

    // ศัตรู
    for (const e of this.enemies) {
      const ex = Math.round(e.x - cam - 1);
      if (ex < -20 || ex > VIEW_W + 20) continue;
      if (e.alive) g.drawImage(Math.floor(this.time * 6) % 2 ? S.enemy.a : S.enemy.b, ex, Math.round(e.y) - 2);
      else if (e.squishT > 0) g.drawImage(S.enemy.squish, ex, Math.round(e.y) - 2);
    }

    // ไอเทม (เหรียญ / หัวใจ / ดาว)
    for (const it of this.items) {
      if (it.taken) continue;
      const x = Math.round(it.x - cam);
      if (x < -16 || x > VIEW_W + 16) continue;
      const bob = Math.round(Math.sin(this.time * 3 + it.x * 0.1) * 2);
      const y = Math.round(it.y + bob);
      if (it.kind === "coin") g.drawImage(S.coin[Math.floor(this.time * 6) % 2], x, y);
      else if (it.kind === "heart") g.drawImage(S.heart, x - 1, y - 1);
      else g.drawImage(S.star[Math.floor(this.time * 8) % 2], x - 1, y - 1);
    }

    // กระสุนพลังงาน
    for (const pr of this.projectiles) {
      const x = Math.round(pr.x - cam);
      g.fillStyle = "#fca044";
      g.fillRect(x - 1, pr.y - 1, 8, 8);
      g.fillStyle = "#f8d800";
      g.fillRect(x, pr.y, 6, 6);
      g.fillStyle = "#fff";
      g.fillRect(x + 1, pr.y + 1, 2, 2);
    }

    // ผู้เล่น
    const p = this.player;
    const flicker = p.invincible > 0 && Math.floor(p.invincible * 15) % 2 === 0;
    if (!flicker) {
      let frame: "stand" | "run1" | "run2" | "jump" = "stand";
      if (this.mode === "dying" || !p.onGround) frame = "jump";
      else if (Math.abs(p.vx) > 5) frame = Math.floor(p.runDist / 10) % 2 ? "run1" : "run2";
      const img = p.facing === 1 ? S.player[frame].r : S.player[frame].l;
      g.drawImage(img, Math.round(p.x - cam - 2), Math.round(p.y));
      if (p.hurtFlash > 0 && Math.floor(p.hurtFlash * 12) % 2 === 0) {
        g.fillStyle = "rgba(255,0,60,0.55)";
        g.fillRect(Math.round(p.x - cam - 2), Math.round(p.y), 16, 16);
      }
      // ดาวพลัง: ตัวละครเป็นสีทองกะพริบ + ดาวอยู่เหนือหัว
      if (p.starT > 0) {
        if (Math.floor(p.starT * 10) % 2 === 0) {
          g.globalCompositeOperation = "source-atop";
          g.fillStyle = "rgba(248,216,0,0.9)";
          g.fillRect(Math.round(p.x - cam - 2), Math.round(p.y), 16, 16);
          g.globalCompositeOperation = "source-over";
        }
        g.drawImage(S.star[Math.floor(this.time * 10) % 2], Math.round(p.x - cam - 2), Math.round(p.y) - 12);
      }
    }

    // อนุภาค
    for (const pt of this.particles) {
      g.fillStyle = pt.color;
      g.fillRect(Math.round(pt.x - cam), Math.round(pt.y), pt.size, pt.size);
    }
    // ตัวเลขลอย
    g.font = "8px 'Press Start 2P', monospace";
    g.textBaseline = "top";
    for (const t of this.texts) {
      g.fillStyle = "#000";
      g.fillText(t.text, Math.round(t.x - cam) + 1, Math.round(t.y) + 1);
      g.fillStyle = t.color;
      g.fillText(t.text, Math.round(t.x - cam), Math.round(t.y));
    }

    // ป้ายลูกศรชี้ไปทางขวาช่วงเริ่มต้น
    if (this.time < 6 && this.mode === "play") {
      g.fillStyle = Math.floor(this.time * 3) % 2 ? "#fff" : "#f8d800";
      g.fillText("GO ▶", 150 - cam, 120);
    }

    // จอมืดลงขณะหยุด
    if (this.mode === "paused") {
      g.fillStyle = "rgba(0,0,0,0.35)";
      g.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }

  private drawHill(x: number, groundY: number, steps: number) {
    const g = this.ctx;
    g.fillStyle = "#00a800";
    for (let i = 0; i < steps; i++) {
      const w = (steps - i) * 16 * 2;
      g.fillRect(Math.round(x - w / 2), groundY - (i + 1) * 10, w, 10);
    }
    g.fillStyle = "#005800";
    g.fillRect(Math.round(x) - 6, groundY - steps * 10 + 8, 2, 4);
    g.fillRect(Math.round(x) + 4, groundY - steps * 10 + 8, 2, 4);
  }
  private drawCloud(x: number, y: number) {
    const g = this.ctx;
    g.fillStyle = "#fcfcfc";
    g.fillRect(Math.round(x), y + 8, 48, 10);
    g.fillRect(Math.round(x) + 8, y, 18, 10);
    g.fillRect(Math.round(x) + 24, y + 3, 16, 8);
  }
}
