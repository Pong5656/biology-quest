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
import type { ChapterContent } from "../types";
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

export const CHAPTER_CONTENT: Record<number, ChapterContent> = {
  1: chapter1,
  2: chapter2,
  3: chapter3,
  4: chapter4,
  5: chapter5,
  6: chapter6,
  7: chapter7,
  8: chapter8,
  9: chapter9,
  10: chapter10,
  11: chapter11,
  12: chapter12,
  13: chapter13,
  14: chapter14,
  15: chapter15,
  16: chapter16,
  17: chapter17,
  18: chapter18,
  19: chapter19,
  20: chapter20,
  21: chapter21,
  22: chapter22,
  23: chapter23,
  24: chapter24,
  25: chapter25,
};

export function getChapterContent(id: number): ChapterContent | null {
  return CHAPTER_CONTENT[id] ?? null;
}

export function isChapterAvailable(id: number): boolean {
  return id in CHAPTER_CONTENT;
}
