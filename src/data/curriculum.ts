/**
 * =====================================================================
 *  แผนที่หลักสูตรชีววิทยา ม.ปลาย (สสวท.) — 3 World / 6 เล่ม / 25 บท
 *  (มีชื่อไทย + อังกฤษ สำหรับระบบสลับภาษา TH/EN)
 * =====================================================================
 */
import type { ChapterMeta, World } from "./types";

export const WORLDS: World[] = [
  {
    id: 1,
    grade: "ม.4",
    gradeFull: "มัธยมศึกษาปีที่ 4",
    gradeEn: "Grade 10",
    color: "#f8b800",
    sky: "#5c94fc",
    books: [
      {
        id: 1,
        title: "ชีววิทยา เล่ม 1",
        titleEn: "Biology Book 1",
        chapters: [
          { id: 1, title: "การศึกษาชีววิทยา", titleEn: "Introduction to Biology", emoji: "🔬" },
          { id: 2, title: "เคมีที่เป็นพื้นฐานของสิ่งมีชีวิต", titleEn: "The Chemical Basis of Life", emoji: "⚗️" },
          { id: 3, title: "เซลล์และการทำงานของเซลล์", titleEn: "The Cell and Cell Functions", emoji: "🦠" },
        ],
      },
      {
        id: 2,
        title: "ชีววิทยา เล่ม 2",
        titleEn: "Biology Book 2",
        chapters: [
          { id: 4, title: "โครโมโซมและสารพันธุกรรม", titleEn: "Chromosomes and Genetic Material", emoji: "🧬" },
          { id: 5, title: "การถ่ายทอดลักษณะทางพันธุกรรม", titleEn: "Heredity and Genetics", emoji: "👪" },
          { id: 6, title: "เทคโนโลยีทางดีเอ็นเอ", titleEn: "DNA Technology", emoji: "🧪" },
          { id: 7, title: "วิวัฒนาการ", titleEn: "Evolution", emoji: "🦕" },
        ],
      },
    ],
  },
  {
    id: 2,
    grade: "ม.5",
    gradeFull: "มัธยมศึกษาปีที่ 5",
    gradeEn: "Grade 11",
    color: "#00a800",
    sky: "#3cbcfc",
    books: [
      {
        id: 3,
        title: "ชีววิทยา เล่ม 3",
        titleEn: "Biology Book 3",
        chapters: [
          { id: 8, title: "การสืบพันธุ์ของพืชดอก", titleEn: "Reproduction in Flowering Plants", emoji: "🌸" },
          { id: 9, title: "โครงสร้างและการเจริญเติบโตของพืชดอก", titleEn: "Plant Structure & Growth", emoji: "🌿" },
          { id: 10, title: "การลำเลียงของพืช", titleEn: "Plant Transport", emoji: "💧" },
          { id: 11, title: "การสังเคราะห์ด้วยแสง", titleEn: "Photosynthesis", emoji: "☀️" },
          { id: 12, title: "การควบคุมการเจริญเติบโตและการตอบสนองของพืช", titleEn: "Plant Growth & Response", emoji: "🌻" },
        ],
      },
      {
        id: 4,
        title: "ชีววิทยา เล่ม 4",
        titleEn: "Biology Book 4",
        chapters: [
          { id: 13, title: "ระบบย่อยอาหาร", titleEn: "Digestive System", emoji: "🍔" },
          { id: 14, title: "ระบบหายใจ", titleEn: "Respiratory System", emoji: "🫁" },
          { id: 15, title: "ระบบหมุนเวียนเลือดและระบบน้ำเหลือง", titleEn: "Circulatory & Lymphatic System", emoji: "🫀" },
          { id: 16, title: "ระบบภูมิคุ้มกัน", titleEn: "Immune System", emoji: "🛡️" },
          { id: 17, title: "ระบบขับถ่าย", titleEn: "Excretory System", emoji: "🚽" },
        ],
      },
    ],
  },
  {
    id: 3,
    grade: "ม.6",
    gradeFull: "มัธยมศึกษาปีที่ 6",
    gradeEn: "Grade 12",
    color: "#e40058",
    sky: "#6844fc",
    books: [
      {
        id: 5,
        title: "ชีววิทยา เล่ม 5",
        titleEn: "Biology Book 5",
        chapters: [
          { id: 18, title: "ระบบประสาทและอวัยวะรับความรู้สึก", titleEn: "Nervous & Sensory Systems", emoji: "🧠" },
          { id: 19, title: "การเคลื่อนที่ของสิ่งมีชีวิต", titleEn: "Locomotion in Organisms", emoji: "🦿" },
          { id: 20, title: "ระบบต่อมไร้ท่อ", titleEn: "Endocrine System", emoji: "💉" },
          { id: 21, title: "ระบบสืบพันธุ์และการเจริญเติบโต", titleEn: "Reproduction & Development", emoji: "👶" },
          { id: 22, title: "พฤติกรรมของสัตว์", titleEn: "Animal Behavior", emoji: "🐒" },
        ],
      },
      {
        id: 6,
        title: "ชีววิทยา เล่ม 6",
        titleEn: "Biology Book 6",
        chapters: [
          { id: 23, title: "ความหลากหลายทางชีวภาพ", titleEn: "Biodiversity", emoji: "🦋" },
          { id: 24, title: "ระบบนิเวศและประชากร", titleEn: "Ecosystem & Population", emoji: "🌍" },
          { id: 25, title: "มนุษย์กับความยั่งยืนของทรัพยากรธรรมชาติและสิ่งแวดล้อม", titleEn: "Human & Environmental Sustainability", emoji: "♻️" },
        ],
      },
    ],
  },
];

/** หา meta ของบท พร้อม World/Book ที่สังกัด */
export function findChapterMeta(id: number): { chapter: ChapterMeta; bookId: number; bookTitle: string; bookTitleEn: string; world: World } | null {
  for (const world of WORLDS)
    for (const book of world.books)
      for (const chapter of book.chapters)
        if (chapter.id === id) return { chapter, bookId: book.id, bookTitle: book.title, bookTitleEn: book.titleEn, world };
  return null;
}

/** ชื่อ 4 Section (ไทย) — ส่วนอังกฤษจัดการใน i18n */
export const SECTIONS = [
  { no: 1, icon: "📜", name: "สรุปเนื้อหา", short: "สรุป" },
  { no: 2, icon: "📖", name: "เรียนทีละสไลด์", short: "เรียน" },
  { no: 3, icon: "🔑", name: "มินิเกมคีย์เวิร์ด", short: "คีย์เวิร์ด" },
  { no: 4, icon: "👾", name: "บอสข้อสอบจริง", short: "บอส" },
] as const;
