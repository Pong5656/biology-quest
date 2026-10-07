import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __bioQuestPostgresqlPool?: Pool;
};

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Lazy connection: สร้าง Pool เฉพาะเมื่อมี DATABASE_URL เท่านั้น
 * ทำให้ Deploy ได้โดยไม่ต้องมีฐานข้อมูล — เกมเล่นได้ครบทุกบท
 * API /api/health, /api/progress, /api/player จะตอบ 503 อย่างสุภาพ
 * จนกว่าจะตั้ง DATABASE_URL (ใช่เซฟความคืบหน้าข้ามเครื่อง)
 * เปิดใช้เต็มรูปแบบ: ตั้ง Env DATABASE_URL แล้วรัน `npx drizzle-kit push`
 */
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  if (!globalForDb.__bioQuestPostgresqlPool) {
    globalForDb.__bioQuestPostgresqlPool = new Pool({ connectionString: url });
  }
  return drizzle(globalForDb.__bioQuestPostgresqlPool);
}