/**
 * =====================================================================
 *  TYPES — โครงสร้างข้อมูลกลางของหลักสูตร
 *  ทุกบทใช้ ChapterContent เดียวกัน → UI ทั้ง 4 Section อ่านจากตรงนี้
 * =====================================================================
 */

/* ---------- แผนที่หลักสูตร (เมนู) ---------- */
export interface ChapterMeta {
  id: number; // เลขบท 1-25
  title: string;
  emoji: string;
}
export interface Book {
  id: number; // เล่ม 1-6
  title: string;
  chapters: ChapterMeta[];
}
export interface World {
  id: number; // World 1-3
  grade: string; // "ม.4"
  gradeFull: string; // "มัธยมศึกษาปีที่ 4"
  color: string; // สีหลักของ World
  sky: string; // สีพื้นหลัง
  books: Book[];
}

/* ---------- SECTION 1: Summary Board ---------- */
export interface SummaryCard {
  icon: string;
  title: string;
  points: string[];
}
export interface SummaryBoardData {
  intro: string;
  equation?: string; // สมการ/คีย์หลักที่โชว์บนแบนเนอร์
  cards: SummaryCard[];
}

/* ---------- SECTION 2: Theory Slides ---------- */
export interface TheorySlide {
  title: string;
  text: string; // ขึ้นบรรทัดใหม่ด้วย \n
  emoji?: string;
  keywords?: string[]; // คำสำคัญที่โชว์เป็นป้ายใต้กล่องข้อความ
}

/* ---------- SECTION 3: Keyword Check ---------- */
export interface KeywordQuestion {
  keyword: string; // คำสำคัญที่กำลังทดสอบ
  question: string;
  choices: [string, string, string]; // 3 ตัวเลือกเสมอ
  answer: 0 | 1 | 2;
  explanation: string;
}

/* ---------- SECTION 4: Boss Exam ---------- */
export interface ExamQuestion {
  question: string;
  choices: string[]; // 4 ตัวเลือก
  answer: number; // index ที่ถูก
  explanation: string;
}
export interface BossConfig {
  name: string;
  title: string; // ฉายา
  taunt: string; // คำท้าทายตอนเปิดฉาก
  hp: number; // HP บอส
  playerHp: number; // HP ผู้เล่น
  questionTime: number; // วินาทีต่อข้อ (กติกา: 60)
  questions: ExamQuestion[]; // 20 ข้อ
}

/* ---------- เนื้อหาเต็มของ 1 บท ---------- */
export interface ChapterContent {
  chapterId: number;
  summary: SummaryBoardData; // Section 1
  slides: TheorySlide[]; // Section 2
  keywords: KeywordQuestion[]; // Section 3
  boss: BossConfig; // Section 4
}
