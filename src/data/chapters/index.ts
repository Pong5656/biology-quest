/**
 * =====================================================================
 *  CHAPTER REGISTRY — ลงทะเบียนเนื้อหาของแต่ละบทที่นี่
 *  -------------------------------------------------------------------
 *  ทุกบท (1-25) มีเนื้อหาครบทั้ง 4 Section:
 *   1) สรุปเนื้อหา  2) สไลด์ทฤษฎี  3) มินิเกมคีย์เวิร์ด  4) บอสข้อสอบ 20 ข้อ
 *
 *  วิธีแก้ไขเนื้อหา: เปิดไฟล์ ch{บทที่}.ts แล้วแก้ข้อมูลได้เลย
 *  วิธีเพิ่มบทใหม่: คัดลอก _template.ts แล้ว import + เพิ่มในตารางนี้
 * =====================================================================
 */
import type { ChapterContent, ExamQuestion } from "../types";
import { extrasM4 } from "./extras/m4";
import { extrasM5 } from "./extras/m5";
import { extrasM6 } from "./extras/m6";
import { chapter1 } from "./ch01";
import { chapter2 } from "./ch02";
import { chapter3 } from "./ch03";
import { chapter4 } from "./ch04";
import { chapter5 } from "./ch05";
import { chapter6 } from "./ch06";
import { chapter7 } from "./ch07";
import { chapter8 } from "./ch08";
import { chapter9 } from "./ch09";
import { chapter11 } from "./ch11-photosynthesis";
import { chapter10 } from "./ch10";
import { chapter12 } from "./ch12";
import { chapter13 } from "./ch13";
import { chapter14 } from "./ch14";
import { chapter15 } from "./ch15";
import { chapter16 } from "./ch16";
import { chapter17 } from "./ch17";
import { chapter18 } from "./ch18";
import { chapter19 } from "./ch19";
import { chapter20 } from "./ch20";
import { chapter21 } from "./ch21";
import { chapter22 } from "./ch22";
import { chapter23 } from "./ch23";
import { chapter24 } from "./ch24";
import { chapter25 } from "./ch25";

/**
 * รวมคลังข้อสอบเสริม (ยาก) เข้า pool ของแต่ละบท
 * pool = ข้อเดิม 20 + ข้อเสริม 10-12 = 30+ ข้อ → สุ่มเล่น 20 ข้อ/รอบ
 */
const ALL_EXTRAS: Record<number, ExamQuestion[]> = { ...extrasM4, ...extrasM5, ...extrasM6 };
function withExtras(content: ChapterContent): ChapterContent {
  const extra = ALL_EXTRAS[content.chapterId];
  if (!extra || extra.length === 0) return content;
  return { ...content, boss: { ...content.boss, questions: [...content.boss.questions, ...extra] } };
}

export const CHAPTER_CONTENT: Record<number, ChapterContent> = {
  1: withExtras(chapter1),
  2: withExtras(chapter2),
  3: withExtras(chapter3),
  4: withExtras(chapter4),
  5: withExtras(chapter5),
  6: withExtras(chapter6),
  7: withExtras(chapter7),
  8: withExtras(chapter8),
  9: withExtras(chapter9),
  10: withExtras(chapter10),
  11: withExtras(chapter11),
  12: withExtras(chapter12),
  13: withExtras(chapter13),
  14: withExtras(chapter14),
  15: withExtras(chapter15),
  16: withExtras(chapter16),
  17: withExtras(chapter17),
  18: withExtras(chapter18),
  19: withExtras(chapter19),
  20: withExtras(chapter20),
  21: withExtras(chapter21),
  22: withExtras(chapter22),
  23: withExtras(chapter23),
  24: withExtras(chapter24),
  25: withExtras(chapter25),
};

export function getChapterContent(id: number): ChapterContent | null {
  return CHAPTER_CONTENT[id] ?? null;
}

export function isChapterAvailable(id: number): boolean {
  return id in CHAPTER_CONTENT;
}
