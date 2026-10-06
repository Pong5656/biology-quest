/**
 * =====================================================================
 *  KIT — ตัวช่วยเขียนเนื้อหาบทเรียนแบบกระชับ
 *  -------------------------------------------------------------------
 *  ใช้:  c() การ์ดสรุป | s() สไลด์ | k() คำถามคีย์เวิร์ด | q() ข้อสอบ
 *        chapter() ประกอบเป็นบทเรียน โดยคำนวณ HP อัตโนมัติจากจำนวนข้อ
 * =====================================================================
 */
import type { ChapterContent, ExamQuestion, KeywordQuestion, SummaryCard, TheorySlide } from "../types";

/** การ์ดสรุป (Section 1) */
export const c = (icon: string, title: string, points: string[]): SummaryCard => ({ icon, title, points });

/** สไลด์ทฤษฎี (Section 2) — ขึ้นบรรทัดใหม่ด้วย \n */
export const s = (title: string, text: string, emoji = "📘", keywords?: string[]): TheorySlide => ({ title, text, emoji, keywords });

/** คำถามคีย์เวิร์ด (Section 3) — 3 ตัวเลือกเสมอ */
export const k = (keyword: string, question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string): KeywordQuestion => ({
  keyword,
  question,
  choices,
  answer,
  explanation,
});

/** ข้อสอบ (Section 4) — 4 ตัวเลือก */
export const q = (question: string, choices: string[], answer: number, explanation: string): ExamQuestion => ({
  question,
  choices,
  answer,
  explanation,
});

/**
 * ประกอบบทเรียน
 * HP คำนวณอัตโนมัติ: บอส = 70% ของจำนวนข้อ, ผู้เล่น = ที่เหลือ
 * (ผลรวม = จำนวนข้อ + 1 → การต่อสู้จบได้เสมอเมื่อตอบครบทุกข้อ)
 */
export function chapter(
  chapterId: number,
  summary: { intro: string; equation?: string; cards: SummaryCard[] },
  slides: TheorySlide[],
  keywords: KeywordQuestion[],
  boss: { name: string; title: string; taunt: string },
  questions: ExamQuestion[],
): ChapterContent {
  const n = questions.length;
  const hp = Math.max(3, Math.ceil(n * 0.7));
  const playerHp = Math.max(3, n + 1 - hp);
  return {
    chapterId,
    summary,
    slides,
    keywords,
    boss: { name: boss.name, title: boss.title, taunt: boss.taunt, hp, playerHp, questionTime: 60, questions },
  };
}
