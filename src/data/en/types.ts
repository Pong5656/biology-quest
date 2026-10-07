import type { ExamQuestion, KeywordQuestion, SummaryBoardData, TheorySlide } from "../types";

/** ชุดเนื้อหาภาษาอังกฤษของหนึ่งบท — ใช้เมื่อผู้เล่นสลับเป็น EN */
export interface EnglishPack {
  summary: SummaryBoardData;
  slides: TheorySlide[];
  keywords: KeywordQuestion[];
  questions: ExamQuestion[];
  bossName: string;
  bossTitle: string;
  bossTaunt: string;
}
