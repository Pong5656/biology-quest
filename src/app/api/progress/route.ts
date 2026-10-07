import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db";
import { chapterProgress, players } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * การเซฟความคืบหน้าข้ามเครื่อง (PostgreSQL ผ่าน Drizzle)
 * ถ้ายังไม่ได้ตั้ง DATABASE_URL: แอปเล่นได้ครบ ระบบนี้ตอบ 503 (ตัวแอปกัน error เอง → เงียบ)
 * เปิดใช้: ตั้ง Env DATABASE_URL แล้วรัน `npx drizzle-kit push` (สร้างตาราง players + chapter_progress)
 */

/** GET /api/progress?playerId=xxx — โหลดข้อมูลผู้เล่น + ความคืบหน้าทุกบท */
export async function GET(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "db not configured" }, { status: 503 });
  }
  const playerId = new URL(req.url).searchParams.get("playerId");
  if (!playerId) return NextResponse.json({ error: "playerId is required" }, { status: 400 });

  await getDb().insert(players).values({ playerId }).onConflictDoNothing();
  const [player] = await getDb().select().from(players).where(eq(players.playerId, playerId));
  const chapters = await getDb().select().from(chapterProgress).where(eq(chapterProgress.playerId, playerId));

  return NextResponse.json({ player, chapters });
}

/**
 * POST /api/progress — บันทึกความคืบหน้าของบท (ค่าไม่มีวันลดลง)
 * body: { playerId, chapterId, stage?, bossCleared?, score?, attempt? }
 */
export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "db not configured" }, { status: 503 });
  }
  const body = (await req.json()) as {
    playerId?: string;
    chapterId?: number;
    stage?: number;
    bossCleared?: boolean;
    score?: number;
    attempt?: boolean;
  };
  if (!body.playerId || typeof body.chapterId !== "number") {
    return NextResponse.json({ error: "playerId and chapterId are required" }, { status: 400 });
  }

  await getDb().insert(players).values({ playerId: body.playerId }).onConflictDoNothing();

  const stage = Math.max(1, Math.min(5, Math.floor(body.stage ?? 1)));
  const [row] = await getDb()
    .insert(chapterProgress)
    .values({
      playerId: body.playerId,
      chapterId: body.chapterId,
      stage,
      bossCleared: !!body.bossCleared,
      bestScore: Math.max(0, Math.floor(body.score ?? 0)),
      attempts: body.attempt ? 1 : 0,
    })
    .onConflictDoUpdate({
      target: [chapterProgress.playerId, chapterProgress.chapterId],
      set: {
        stage: sql`GREATEST(${chapterProgress.stage}, EXCLUDED.stage)`,
        bossCleared: sql`(${chapterProgress.bossCleared} OR EXCLUDED.boss_cleared)`,
        bestScore: sql`GREATEST(${chapterProgress.bestScore}, EXCLUDED.best_score)`,
        attempts: sql`${chapterProgress.attempts} + EXCLUDED.attempts`,
        updatedAt: new Date(),
      },
    })
    .returning();

  return NextResponse.json(row);
}

/** DELETE /api/progress?playerId=xxx — ล้างความคืบหน้าทั้งหมด */
export async function DELETE(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "db not configured" }, { status: 503 });
  }
  const playerId = new URL(req.url).searchParams.get("playerId");
  if (!playerId) return NextResponse.json({ error: "playerId is required" }, { status: 400 });
  await getDb().delete(chapterProgress).where(eq(chapterProgress.playerId, playerId));
  return NextResponse.json({ ok: true });
}