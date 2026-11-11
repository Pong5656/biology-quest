/**
 * =====================================================================
 *  OLYMPIAD BANK — คลังโจทย์แข่งขัน (สอวน. / IJSO / ชีววิทยาโอลิมปิก)
 *  -------------------------------------------------------------------
 *  แยกไฟล์เป็น part เพื่อให้อ่าน/แก้ไขง่าย
 *  ใช้:  olympiadQuestions(chapterId) → ExamQuestion[]
 * =====================================================================
 */
import type { ExamQuestion } from "../types";
import { OLY as P1 } from "./part1";
import { OLY as P2 } from "./part2";
import { OLY as P3 } from "./part3";
import { OLY as P4 } from "./part4";
import { OLY as P5 } from "./part5";
import { OLY as P6 } from "./part6";
import { OLY as P7 } from "./part7";
import { OLY as P8 } from "./part8";

const ALL: Record<number, ExamQuestion[]> = {
  ...P1,
  ...P2,
  ...P3,
  ...P4,
  ...P5,
  ...P6,
  ...P7,
  ...P8,
};

/** คืนข้อสอบแข่งขันของบทนั้น (ถ้าไม่มีคืน array ว่าง) */
export function olympiadQuestions(chapterId: number): ExamQuestion[] {
  return ALL[chapterId] ?? [];
}

/** จำนวนบทที่มีคลังโจทย์แข่งขัน */
export const OLYMPIAD_CHAPTERS = Object.keys(ALL).length;

/** จำนวนโจทย์แข่งขันทั้งหมด */
export const OLYMPIAD_TOTAL = Object.values(ALL).reduce((sum, list) => sum + list.length, 0);
