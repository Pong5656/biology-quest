import { NextResponse } from "next/server";
import { getDb, isDbConfigured } from "@/db";
import { players } from "@/db/schema";

export const dynamic = "force-dynamic";

function noDb() {
  return NextResponse.json(
    { error: "DATABASE_URL ไม่ได้ตั้งค่า — เซฟได้เฉพาะในเครื่อง", db: "not-configured" },
    { status: 503 },
  );
}

/** POST /api/player — ตั้งชื่อผู้เล่น { playerId, name } */
export async function POST(req: Request) {
  const body = (await req.json()) as { playerId?: string; name?: string };
  if (!body.playerId) return NextResponse.json({ error: "playerId is required" }, { status: 400 });
  if (!isDbConfigured()) return noDb();

  const name = (body.name ?? "").trim().slice(0, 20) || "นักชีววิทยา";
  try {
    const db = getDb();
    const [row] = await db
      .insert(players)
      .values({ playerId: body.playerId, name })
      .onConflictDoUpdate({ target: players.playerId, set: { name } })
      .returning();
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "failed to save player" }, { status: 500 });
  }
}