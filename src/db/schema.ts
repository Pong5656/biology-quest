import { pgTable, text, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";

/** ผู้เล่น (ระบุตัวด้วย playerId ที่สร้างฝั่ง client และเก็บใน localStorage) */
export const players = pgTable("players", {
  playerId: text("player_id").primaryKey(),
  name: text("name").notNull().default("นักชีววิทยา"),
  /** กระเป๋าเหรียญสะสมจากการเล่น (ใช้แลกคำใบ้ในด่านบอส) */
  coins: integer("coins").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * ความคืบหน้ารายบท
 * - stage: section สูงสุดที่ปลดล็อกแล้ว (1=สรุป, 2=สไลด์, 3=คีย์เวิร์ด, 4=บอส, 5=ผ่านบอสแล้ว)
 * - bossCleared: ชนะบอสแล้วหรือยัง
 * - bestScore: คะแนนสูงสุดในโหมดบอส
 * - attempts: จำนวนครั้งที่ท้าบอส
 */
export const chapterProgress = pgTable(
  "chapter_progress",
  {
    playerId: text("player_id").notNull(),
    chapterId: integer("chapter_id").notNull(),
    stage: integer("stage").notNull().default(1),
    bossCleared: boolean("boss_cleared").notNull().default(false),
    bestScore: integer("best_score").notNull().default(0),
    attempts: integer("attempts").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.playerId, t.chapterId] })],
);

export type ChapterProgressRow = typeof chapterProgress.$inferSelect;
