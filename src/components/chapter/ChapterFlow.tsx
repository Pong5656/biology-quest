"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { findChapterMeta, SECTIONS } from "@/data/curriculum";
import { getChapterContent } from "@/data/chapters";
import { getEnglishPack } from "@/data/en";
import { usePlayer } from "@/lib/usePlayer";
import { LangButton, useI18n } from "@/lib/i18n";
import { sfx } from "@/lib/sfx";
import SummaryBoard from "./SummaryBoard";
import TheorySlides from "./TheorySlides";
import KeywordCheck from "./KeywordCheck";
import BossExam from "./BossExam";

/**
 * =====================================================================
 *  CHAPTER FLOW — ควบคุมลำดับ 4 Section ของแต่ละบท
 *   Section 1 สรุปเนื้อหา → 2 สไลด์ทฤษฎี → 3 มินิเกมคีย์เวิร์ด → 4 บอสข้อสอบ
 *  ปลดล็อกทีละขั้น (stage) และบันทึกลงฐานข้อมูล
 * =====================================================================
 */
export default function ChapterFlow({ chapterId }: { chapterId: number }) {
  const { t, lang } = useI18n();
  const meta = findChapterMeta(chapterId)!;
  const content = getChapterContent(chapterId);
  const en = lang === "en" ? getEnglishPack(chapterId) : null;
  const { progress, loading, saveChapter } = usePlayer();
  const stage = progress[chapterId]?.stage ?? 1;
  const [section, setSection] = useState<number | null>(null);
  const chapterTitle = lang === "en" ? meta.chapter.titleEn : meta.chapter.title;

  // เปิดที่ section ล่าสุดที่ปลดล็อก (หลังโหลดเซฟเสร็จ)
  useEffect(() => {
    if (!loading && section === null) setSection(Math.min(4, stage));
  }, [loading, stage, section]);

  if (!content) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#212529] p-6">
        <div className="rpg-box max-w-md p-6 text-center font-thai">
          <div className="text-5xl">🚧</div>
          <div className="mt-3 text-lg font-bold">
            บทที่ {chapterId}: {meta.chapter.title}
          </div>
          <p className="mt-2 text-sm text-gray-300">เนื้อหาบทนี้กำลังพัฒนา</p>
          <Link href="/" className="px-btn px-btn-thai mt-5 inline-block">
            ⬅ กลับแผนที่
          </Link>
        </div>
      </div>
    );
  }

  if (loading || section === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-black">
        <div className="anim-blink font-pixel text-sm text-white">LOADING...</div>
      </div>
    );
  }

  /** ผ่าน section n → ปลดล็อก n+1 แล้วไปต่อ */
  const complete = (n: number) => {
    void saveChapter(chapterId, { stage: n + 1 });
    if (n < 4) setSection(n + 1);
  };

  const goto = (n: number) => {
    if (n > stage) {
      sfx.bump();
      return;
    }
    sfx.blip();
    setSection(n);
  };

  return (
    <div className="min-h-screen bg-[#212529]">
      {/* ---------- แถบหัวบท + Stepper 4 Section ---------- */}
      <header className="sticky top-0 z-30 border-b-4 border-white bg-black">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-3">
            <Link href="/" className="px-btn px-btn-thai !px-3 !py-2 !text-xs" onClick={() => sfx.blip()}>
              {t("ch.back")}
            </Link>
            <div className="leading-tight">
              <div className="font-pixel text-[9px] text-yellow-300">
                WORLD {meta.world.id} • {lang === "en" ? meta.world.gradeEn : meta.world.grade} • {t("ch.book")} {meta.bookId}
              </div>
              <div className="font-thai text-sm font-bold text-white sm:text-base">
                {meta.chapter.emoji} {lang === "en" ? `CH ${chapterId}: ` : `บทที่ ${chapterId} `}
                {chapterTitle}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {progress[chapterId]?.bossCleared && (
              <div className="font-thai text-xs text-yellow-300">
                {t("ch.cleared")} {progress[chapterId].bestScore.toLocaleString()}
              </div>
            )}
            <LangButton />
          </div>
        </div>
        <nav className="mx-auto grid max-w-6xl grid-cols-4 gap-1 px-3 pb-2 sm:gap-2">
          {SECTIONS.map((s) => {
            const locked = s.no > stage;
            const active = s.no === section;
            const done = s.no < stage || (s.no === 4 && progress[chapterId]?.bossCleared);
            return (
              <button
                key={s.no}
                onClick={() => goto(s.no)}
                className={`border-4 px-1 py-1 text-center transition ${
                  active ? "border-yellow-300 bg-yellow-300 text-black" : locked ? "border-gray-700 bg-gray-800 text-gray-500" : "border-white bg-[#0d1b4c] text-white hover:bg-[#1a2b6c]"
                }`}
              >
                <div className="font-pixel text-[8px] sm:text-[9px]">
                  {locked ? "🔒" : done ? "★" : s.icon} SEC {s.no}
                </div>
                <div className="font-thai text-[11px] font-semibold sm:text-sm">
                  <span className="sm:hidden">{lang === "en" ? `S${s.no}` : s.short}</span>
                  <span className="hidden sm:inline">{lang === "en" ? t(`sec.${s.no}`) : s.name}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </header>

      {/* ============ SECTION 1 ============ */}
      {section === 1 && <SummaryBoard data={en?.summary ?? content.summary} chapterTitle={chapterTitle} onNext={() => complete(1)} />}

      {/* ============ SECTION 2 ============ */}
      {section === 2 && <TheorySlides key={`slides-${lang}`} slides={en?.slides ?? content.slides} onComplete={() => complete(2)} />}

      {/* ============ SECTION 3 ============ */}
      {section === 3 && <KeywordCheck key={`kw-${lang}`} questions={en?.keywords ?? content.keywords} onComplete={() => complete(3)} />}

      {/* ============ SECTION 4 ============ */}
      {section === 4 && (
        <BossExam
          key={`boss-${lang}`}
          chapterId={chapterId}
          boss={content.boss}
          onAttempt={() => void saveChapter(chapterId, { stage: 4, attempt: true })}
          onVictory={(score) => void saveChapter(chapterId, { stage: 5, bossCleared: true, score })}
          onRetryLearning={() => setSection(1)}
        />
      )}

    </div>
  );
}
