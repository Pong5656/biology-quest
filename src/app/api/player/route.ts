import { NextResponse } from "next/server";
import { getDb, isDbConfigured } from "@/db";
import { players } from "@/db/schema";

export const dynamic = "force-dynamic";

/** POST /api/player — ตั้งชื่อผู้เล่น / อัปเดตเหรียญ { playerId, name?, coins? } */
export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "db not configured" }, { status: 503 });
  }
  const body = (await req.json()) as { playerId?: string; name?: string; coins?: number };
  if (!body.playerId) return NextResponse.json({ error: "playerId is required" }, { status: 400 });

  const name = (body.name ?? "").trim().slice(0, 20);
  const coins = typeof body.coins === "number" ? Math.max(0, Math.floor(body.coins)) : undefined;

  const [row] = await getDb()
    .insert(players)
    .values({ playerId: body.playerId, name: name || "นักชีววิทยา", coins: coins ?? 0 })
    .onConflictDoUpdate({
      target: players.playerId,
      set: {
        ...(name ? { name } : {}),
        ...(coins !== undefined ? { coins } : {}),
      },
    })
    .returning();
  return NextResponse.json(row);
}