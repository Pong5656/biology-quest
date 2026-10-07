"use client";

/**
 * =====================================================================
 *  I18N — ระบบสลับภาษา TH/EN (ค่าเริ่มต้น: ไทย เสมอ)
 *  แปล "UI ทั้งหมด" + ชื่อบท/เล่ม/World
 *  เนื้อหาบทเรียนในสไลด์/ข้อสอบยังคงเป็นภาษาไทย (เนื้อหาหลักของหลักสูตร)
 * =====================================================================
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "th" | "en";

const DICT: Record<string, { th: string; en: string }> = {
  /* ---------- Title / Map ---------- */
  "map.subtitle": { th: "สสวท. • ชีววิทยา ม.4 - ม.6", en: "IPST • Biology G10-G12" },
  "map.title": { th: "ผจญภัยชีววิทยา 8-Bit", en: "8-Bit Biology Quest" },
  "map.pName": { th: "ชื่อผู้เล่น", en: "Player Name" },
  "map.defName": { th: "นักชีววิทยา", en: "Bio Student" },
  "map.first": { th: "⏏ หน้าแรก", en: "⏏ TITLE" },
  "map.reset": { th: "ล้างเซฟ", en: "RESET" },
  "map.resetAsk": { th: "ล้างความคืบหน้าทั้งหมด?", en: "Erase all progress?" },
  "map.inProgress": { th: "กำลังเรียน", en: "IN PROGRESS" },
  "map.book": { th: "เล่ม", en: "BOOK" },
  "map.legendPlay": { th: "🟨 พร้อมเล่น", en: "🟨 PLAYABLE" },
  "map.legendClear": { th: "🟩 ผ่านบอสแล้ว 👑", en: "🟩 BOSS CLEARED 👑" },
  "map.legendParts": { th: "▮▮▮ = ความคืบหน้า 4 ส่วน", en: "▮▮▮ = 4-PART PROGRESS" },
  "map.legendContent": { th: "✅ เนื้อหาครบทั้ง 25 บท", en: "✅ ALL 25 CHAPTERS UNLOCKED" },
  "map.comingSoon": { th: "COMING SOON", en: "COMING SOON" },
  "map.csText": { th: "ด่านนี้ยังสร้างไม่เสร็จ! ลองเล่นบทต้นแบบ บทที่ 11 การสังเคราะห์ด้วยแสง (ม.5 เล่ม 3) ก่อนนะ", en: "This chapter is not ready yet. Try Chapter 11: Photosynthesis (G11 Book 3) first!" },
  "map.csClose": { th: "ปิด", en: "CLOSE" },
  "map.csGo": { th: "ไปบทที่ 11 ➔", en: "GO TO CH.11 ➔" },

  /* ---------- Chapter header ---------- */
  "ch.back": { th: "⬅ แผนที่", en: "⬅ MAP" },
  "ch.book": { th: "เล่ม", en: "BOOK" },
  "ch.cleared": { th: "👑 ผ่านแล้ว • คะแนนสูงสุด", en: "👑 CLEARED • BEST SCORE" },
  "ch.notReady": { th: "เนื้อหาบทนี้กำลังพัฒนา", en: "This chapter is under development" },
  "ch.backMap": { th: "⬅ กลับแผนที่", en: "⬅ WORLD MAP" },

  /* ---------- Section names ---------- */
  "sec.1": { th: "สรุปเนื้อหา", en: "SUMMARY" },
  "sec.2": { th: "เรียนทีละสไลด์", en: "LESSONS" },
  "sec.3": { th: "มินิเกมคีย์เวิร์ด", en: "KEYWORDS" },
  "sec.4": { th: "บอสข้อสอบจริง", en: "BOSS EXAM" },

  /* ---------- Section 1 ---------- */
  "s1.board": { th: "สรุปเนื้อหา: ", en: "SUMMARY: " },
  "s1.start": { th: "เริ่มเรียน ➔", en: "START LEARNING ➔" },

  /* ---------- Section 2 ---------- */
  "s2.prof": { th: "ศ.ดร.คลอโรฟิลล์", en: "Prof. Chlorophyll" },
  "s2.back": { th: "◀ ย้อนกลับ", en: "◀ BACK" },
  "s2.skip": { th: "ข้าม ▶▶", en: "SKIP ▶▶" },
  "s2.next": { th: "ถัดไป ➔", en: "NEXT ➔" },
  "s2.done": { th: "ไปมินิเกม ➔", en: "MINI-GAME ➔" },

  /* ---------- Section 3 ---------- */
  "s3.title": { th: "มินิเกมคีย์เวิร์ด", en: "KEYWORD MINI-GAME" },
  "s3.goal": { th: "ตอบถูกให้ครบ", en: "CLEAR ALL" },
  "s3.hit": { th: "คลิกบล็อก [ ? ] ที่", en: "HIT BLOCK [ ? ] #" },
  "s3.jump": { th: "🆙 กระโดดชน!", en: "🆙 JUMP & HIT!" },
  "s3.correct": { th: "✅ ถูกต้อง!", en: "✅ CORRECT!" },
  "s3.wrong": { th: "ยังไม่ใช่! ลองคิดอีกครั้ง", en: "NOT YET! THINK AGAIN" },
  "s3.retry": { th: "↻ ลองใหม่", en: "↻ RETRY" },
  "s3.next": { th: "บล็อกถัดไป ➔", en: "NEXT BLOCK ➔" },
  "s3.finish": { th: "สรุปผล ➔", en: "FINISH ➔" },
  "s3.clear": { th: "KEYWORDS CLEAR!", en: "KEYWORDS CLEAR!" },
  "s3.done": { th: "เก็บคำสำคัญครบ", en: "ALL KEYWORDS FOUND" },
  "s3.mistakes": { th: "ผิดไป", en: "MISTAKES" },
  "s3.warn": { th: "⚠️ ต่อไปคือบอสข้อสอบจริง 20 ข้อ จับเวลา 60 วินาทีต่อข้อ!", en: "⚠️ NEXT: 20-QUESTION BOSS EXAM, 60s PER QUESTION!" },
  "s3.goBoss": { th: "👾 บุกปราสาทบอส ➔", en: "👾 STORM THE BOSS KEEP ➔" },

  /* ---------- Section 4 : Boss exam ---------- */
  "s4.rules": { th: "กติกา", en: "RULES" },
  "s4.r1": { th: "🏃 วิ่งไปทางขวา ชนบล็อก [?] จากด้านล่างเพื่อเปิดข้อสอบ (20 ข้อ)", en: "🏃 RUN RIGHT — HIT [?] BLOCKS FROM BELOW TO OPEN QUESTIONS (20 Qs)" },
  "s4.r2": { th: "⏱️ จับเวลา 60 วินาที ต่อข้อ — หมดเวลาถือว่าผิด", en: "⏱️ 60s PER QUESTION — TIMEOUT COUNTS AS WRONG" },
  "s4.r3": { th: "⚡ ตอบถูก = ยิงพลังงานใส่บอส (−1 HP บอส) + เหรียญ +1", en: "⚡ CORRECT = FIRE AT BOSS (BOSS −1 HP) + 1 COIN" },
  "s4.r4": { th: "💥 ตอบผิด / หมดเวลา / โดนศัตรู / ตกหลุม = −1 ❤️", en: "💥 WRONG / TIMEOUT / HIT / PIT = −1 ❤" },
  "s4.r5": { th: "❤️ คุณมี {a} หัวใจ — บอสมี {b} HP • เก็บ ❤️ ในฉากเพื่อเติมเลือด", en: "❤️ YOU HAVE {a} HP — BOSS HAS {b} HP • GRAB ❤️ TO HEAL" },
  "s4.r6": { th: "🪙 ใช้เหรียญแลกคำใบ้: ✂️ ตัดตัวเลือก (3 🪙) / 💡 คำใบ้ (2 🪙)", en: "🪙 SPEND COINS: ✂️ 50/50 (3🪙) / 💡 HINT (2🪙)" },
  "s4.review": { th: "📖 ทบทวนก่อน", en: "📖 REVIEW FIRST" },
  "s4.controls": { th: "⌨️ A/D หรือ ← → เดิน • Space / W / ↑ กระโดด (กดซ้ำกลางอากาศ = กระโดดคู่) • ชนบล็อก [?] จากด้านล่าง • ตอบด้วยปุ่ม 1-4", en: "⌨️ A/D or ← → MOVE • SPACE / W / ↑ JUMP (PRESS AGAIN IN AIR = DOUBLE JUMP) • HIT [?] FROM BELOW • ANSWER WITH 1-4" },
  "s4.pad": { th: "ปุ่มจอ", en: "TOUCH" },
  "s4.combo": { th: "COMBO", en: "COMBO" },
  "s4.winText": { th: "คุณปราบ {b} สำเร็จ! 👑", en: "You defeated {b}! 👑" },
  "s4.answered": { th: "📝 ตอบแล้ว", en: "📝 ANSWERED" },
  "s4.correct": { th: "✅ ถูก", en: "✅ CORRECT" },
  "s4.accuracy": { th: "🎯 แม่นยำ", en: "🎯 ACCURACY" },
  "s4.hpLeft": { th: "❤️ เหลือ", en: "❤️ HP LEFT" },
  "s4.best": { th: "🏆 สถิติส่วนตัว", en: "🏆 PERSONAL BEST" },
  "s4.retry": { th: "↻ ลองใหม่", en: "↻ RETRY" },
  "s4.review2": { th: "📖 ทบทวนบทเรียน", en: "📖 REVIEW" },
  "s4.map": { th: "🗺️ กลับแผนที่", en: "🗺️ WORLD MAP" },
  "s4.rank": { th: "RANK", en: "RANK" },
  "s4.rankS": { th: "สมบูรณ์แบบ! ตอบถูกหมดและไม่เสียเลือดเลย", en: "FLAWLESS! NO DAMAGE TAKEN" },
  "s4.rankA": { th: "เก่งมาก! เกือบสมบูรณ์แบบแล้ว", en: "EXCELLENT! ALMOST FLAWLESS" },
  "s4.rankB": { th: "ทำได้ดี! ฝึกอีกนิดเพื่อ S RANK", en: "NICE FIGHT! TRAIN FOR S RANK" },
  "s4.rankC": { th: "ผ่านไปได้ด้วยดี! ทบทวนแล้วกลับมาใหม่", en: "SURVIVED! REVIEW AND RETRY" },

  /* ---------- Toasts ---------- */
  "t.pit": { th: "😵 ตกหลุม! −1 ❤️", en: "😵 PIT! −1 ❤" },
  "t.enemy": { th: "🦠 โดน! −1 ❤️", en: "🦠 HIT! −1 ❤" },
  "t.heal": { th: "❤️ ฟื้นฟู +1", en: "❤️ HEAL +1" },
  "t.full": { th: "❤️ MAX +250 คะแนน", en: "❤️ FULL +250 PTS" },
  "t.star": { th: "⭐ พลังทอง! 3 วินาที", en: "⭐ GOLD POWER! 3s" },
  "t.empty": { th: "บล็อกนี้ว่างเปล่า — ข้อสอบหมดแล้ว", en: "BLOCK EMPTY — NO MORE QUESTIONS" },

  /* ---------- Modal ---------- */
  "m.question": { th: "ข้อ", en: "Q" },
  "m.correct": { th: "⚡ ถูกต้อง! ยิงพลังงานใส่บอส −1 HP", en: "⚡ CORRECT! BOSS −1 HP" },
  "m.wrong": { th: "💥 ผิด! คุณเสีย 1 หัวใจ", en: "💥 WRONG! YOU LOSE 1 HP" },
  "m.timeout": { th: "⏰ หมดเวลา! คุณเสีย 1 หัวใจ — ข้ามข้อนี้", en: "⏰ TIME UP! YOU LOSE 1 HP — SKIPPED" },
  "m.go": { th: "ไปต่อ ▶", en: "CONTINUE ▶" },
  "m.hint": { th: "💡 คำใบ้", en: "💡 HINT" },
  "m.fifty": { th: "✂️ ตัดตัวเลือก", en: "✂️ 50/50" },
  "m.noCoins": { th: "เหรียญไม่พอ!", en: "NOT ENOUGH COINS!" },
  "m.streak": { th: "ถูกติดกัน", en: "STREAK" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}
const Ctx = createContext<I18nCtx>({ lang: "th", setLang: () => {}, toggle: () => {}, t: (k) => k });

const LS_KEY = "bioquest.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("th");

  // อ่านค่าที่บันทึก (ค่าเริ่มต้น: ไทย)
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved === "en") setLangState("en");
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(LS_KEY, l);
  }, []);
  const toggle = useCallback(() => {
    setLangState((cur) => {
      const next = cur === "th" ? "en" : "th";
      localStorage.setItem(LS_KEY, next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const entry = DICT[key];
      let s = entry ? entry[lang] : key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
      return s;
    },
    [lang],
  );

  return <Ctx.Provider value={{ lang, setLang, toggle, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}

/** ปุ่มสลับภาษา TH/EN แบบพิกเซล */
export function LangButton({ className = "" }: { className?: string }) {
  const { lang, toggle } = useI18n();
  return (
    <button
      onClick={toggle}
      title={lang === "th" ? "Switch to English" : "สลับเป็นภาษาไทย"}
      className={`px-btn !px-2 !py-2 !text-[10px] ${className}`}
    >
      {lang === "th" ? "🇹 TH" : "🇧 EN"}
    </button>
  );
}
