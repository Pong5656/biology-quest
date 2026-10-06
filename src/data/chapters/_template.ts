/**
 * =====================================================================
 *  TEMPLATE — คัดลอกไฟล์นี้เพื่อสร้างบทใหม่ (ยังไม่ได้ลงทะเบียน)
 *  เปลี่ยน chapterId ให้ตรงกับ src/data/curriculum.ts
 * =====================================================================
 */
import type { ChapterContent } from "../types";

export const templateChapter: ChapterContent = {
  chapterId: 0,

  /* SECTION 1: SUMMARY BOARD */
  summary: {
    intro: "สรุปภาพรวมของบทใน 1-2 ประโยค",
    equation: "สมการ/แนวคิดหลัก (ไม่บังคับ)",
    cards: [
      { icon: "📌", title: "หัวข้อที่ 1", points: ["ประเด็นสำคัญ 1", "ประเด็นสำคัญ 2"] },
      { icon: "📌", title: "หัวข้อที่ 2", points: ["ประเด็นสำคัญ 1"] },
    ],
  },

  /* SECTION 2: THEORY SLIDES */
  slides: [{ title: "หัวข้อสไลด์", emoji: "📘", text: "บรรทัดที่ 1\nบรรทัดที่ 2", keywords: ["คำสำคัญ"] }],

  /* SECTION 3: KEYWORD CHECK — 3 ตัวเลือกเสมอ */
  keywords: [
    {
      keyword: "คำสำคัญ",
      question: "คำถามสั้น ๆ เกี่ยวกับคำสำคัญ?",
      choices: ["ตัวเลือก ก", "ตัวเลือก ข", "ตัวเลือก ค"],
      answer: 0,
      explanation: "เฉลยสั้น ๆ",
    },
  ],

  /* SECTION 4: BOSS EXAM — 20 ข้อ, เงื่อนไข hp + playerHp ≤ 21 */
  boss: {
    name: "ชื่อบอส",
    title: "ฉายาบอส",
    taunt: "คำท้าทายของบอส",
    hp: 14,
    playerHp: 7,
    questionTime: 60,
    questions: [
      {
        question: "คำถามข้อสอบ?",
        choices: ["ก", "ข", "ค", "ง"],
        answer: 0,
        explanation: "เฉลย",
      },
    ],
  },
};
