/**
 * =====================================================================
 *  แผนที่หลักสูตรชีววิทยา ม.ปลาย (สสวท.) — ครบ 3 World / 6 เล่ม / 25 บท
 *  ไฟล์นี้กำหนด "เมนู" เท่านั้น เนื้อหาจริงของแต่ละบทอยู่ใน src/data/chapters/
 * =====================================================================
 */
import type { ChapterMeta, World } from "./types";

export const WORLDS: World[] = [
  {
    id: 1,
    grade: "ม.4",
    gradeFull: "มัธยมศึกษาปีที่ 4",
    color: "#f8b800",
    sky: "#5c94fc",
    books: [
      {
        id: 1,
        title: "ชีววิทยา เล่ม 1",
        chapters: [
          { id: 1, title: "การศึกษาชีววิทยา", emoji: "🔬" },
          { id: 2, title: "เคมีที่เป็นพื้นฐานของสิ่งมีชีวิต", emoji: "⚗️" },
          { id: 3, title: "เซลล์และการทำงานของเซลล์", emoji: "🦠" },
        ],
      },
      {
        id: 2,
        title: "ชีววิทยา เล่ม 2",
        chapters: [
          { id: 4, title: "โครโมโซมและสารพันธุกรรม", emoji: "🧬" },
          { id: 5, title: "การถ่ายทอดลักษณะทางพันธุกรรม", emoji: "👪" },
          { id: 6, title: "เทคโนโลยีทางดีเอ็นเอ", emoji: "🧪" },
          { id: 7, title: "วิวัฒนาการ", emoji: "🦕" },
        ],
      },
    ],
  },
  {
    id: 2,
    grade: "ม.5",
    gradeFull: "มัธยมศึกษาปีที่ 5",
    color: "#00a800",
    sky: "#3cbcfc",
    books: [
      {
        id: 3,
        title: "ชีววิทยา เล่ม 3",
        chapters: [
          { id: 8, title: "การสืบพันธุ์ของพืชดอก", emoji: "🌸" },
          { id: 9, title: "โครงสร้างและการเจริญเติบโตของพืชดอก", emoji: "🌿" },
          { id: 10, title: "การลำเลียงของพืช", emoji: "💧" },
          { id: 11, title: "การสังเคราะห์ด้วยแสง", emoji: "☀️" },
          { id: 12, title: "การควบคุมการเจริญเติบโตและการตอบสนองของพืช", emoji: "🌻" },
        ],
      },
      {
        id: 4,
        title: "ชีววิทยา เล่ม 4",
        chapters: [
          { id: 13, title: "ระบบย่อยอาหาร", emoji: "🍔" },
          { id: 14, title: "ระบบหายใจ", emoji: "🫁" },
          { id: 15, title: "ระบบหมุนเวียนเลือดและระบบน้ำเหลือง", emoji: "🫀" },
          { id: 16, title: "ระบบภูมิคุ้มกัน", emoji: "🛡️" },
          { id: 17, title: "ระบบขับถ่าย", emoji: "🚽" },
        ],
      },
    ],
  },
  {
    id: 3,
    grade: "ม.6",
    gradeFull: "มัธยมศึกษาปีที่ 6",
    color: "#e40058",
    sky: "#6844fc",
    books: [
      {
        id: 5,
        title: "ชีววิทยา เล่ม 5",
        chapters: [
          { id: 18, title: "ระบบประสาทและอวัยวะรับความรู้สึก", emoji: "🧠" },
          { id: 19, title: "การเคลื่อนที่ของสิ่งมีชีวิต", emoji: "🦿" },
          { id: 20, title: "ระบบต่อมไร้ท่อ", emoji: "💉" },
          { id: 21, title: "ระบบสืบพันธุ์และการเจริญเติบโต", emoji: "👶" },
          { id: 22, title: "พฤติกรรมของสัตว์", emoji: "🐒" },
        ],
      },
      {
        id: 6,
        title: "ชีววิทยา เล่ม 6",
        chapters: [
          { id: 23, title: "ความหลากหลายทางชีวภาพ", emoji: "🦋" },
          { id: 24, title: "ระบบนิเวศและประชากร", emoji: "🌍" },
          { id: 25, title: "มนุษย์กับความยั่งยืนของทรัพยากรธรรมชาติและสิ่งแวดล้อม", emoji: "♻️" },
        ],
      },
    ],
  },
];

/** หา meta ของบท พร้อม World/Book ที่สังกัด */
export function findChapterMeta(id: number): { chapter: ChapterMeta; bookId: number; bookTitle: string; world: World } | null {
  for (const world of WORLDS)
    for (const book of world.books)
      for (const chapter of book.chapters)
        if (chapter.id === id) return { chapter, bookId: book.id, bookTitle: book.title, world };
  return null;
}

/** ชื่อ 4 Section ใช้ร่วมกันทั้งแอป */
export const SECTIONS = [
  { no: 1, icon: "📜", name: "สรุปเนื้อหา", short: "สรุป" },
  { no: 2, icon: "📖", name: "เรียนทีละสไลด์", short: "เรียน" },
  { no: 3, icon: "🔑", name: "มินิเกมคีย์เวิร์ด", short: "คีย์เวิร์ด" },
  { no: 4, icon: "👾", name: "บอสข้อสอบจริง", short: "บอส" },
] as const;
