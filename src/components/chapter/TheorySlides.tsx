"use client";

/**
 * =====================================================================
 *  SECTION 2 : THEORY SLIDES — กล่องข้อความ RPG + ศาสตราจารย์ NPC
 *  ข้อความพิมพ์ทีละตัว | ปุ่ม "ถัดไป ➔" / Enter / Space / Z
 * =====================================================================
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { TheorySlide } from "@/data/types";
import { ProfessorAvatar, PxButton } from "@/components/game/Pixels";
import { sfx } from "@/lib/sfx";
import { useI18n } from "@/lib/i18n";

interface Props {
  slides: TheorySlide[];
  onComplete: () => void;
}

export default function TheorySlides({ slides, onComplete }: Props) {
  const { t } = useI18n();
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState(0);
  const slide = slides[idx];
  const done = typed >= slide.text.length;
  const isLast = idx === slides.length - 1;

  // พิมพ์ทีละตัวอักษร
  useEffect(() => {
    setTyped(0);
    const timer = setInterval(() => {
      setTyped((n) => {
        if (n >= slide.text.length) {
          clearInterval(timer);
          return n;
        }
        return n + 2;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [slide.text]);

  const advance = useCallback(() => {
    if (!done) {
      setTyped(slide.text.length);
      return;
    }
    if (isLast) {
      sfx.coin();
      onComplete();
    } else {
      sfx.blip();
      setIdx((i) => i + 1);
    }
  }, [done, isLast, onComplete, slide.text.length]);

  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key.toLowerCase() === "z") {
        e.preventDefault();
        advanceRef.current();
      } else if (e.key === "ArrowLeft") {
        setIdx((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-120px)] max-w-4xl flex-col px-4 pb-8 pt-4" style={{ background: "linear-gradient(#5c94fc 0 70%, #c84c0c 70%)" }}>
      {/* แถบความคืบหน้า */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {slides.map((_, i) => (
            <div key={i} className={`h-3 flex-1 border-2 border-black ${i <= idx ? "bg-yellow-400" : "bg-white/40"}`} />
          ))}
        </div>
        <span className="bg-black px-2 py-1 font-pixel text-[10px] text-white">
          {idx + 1}/{slides.length}
        </span>
      </div>

      {/* ฉาก */}
      <div className="flex flex-1 items-end justify-center gap-8 pb-4 pt-8 sm:gap-16">
        <div className="flex flex-col items-center">
          <div className="mb-2 border-2 border-black bg-white px-2 py-1 font-thai text-xs font-bold text-black">{t("s2.prof")}</div>
          <ProfessorAvatar px={6} className="anim-hop" />
        </div>
        <div key={idx} className="anim-pop mb-6 text-7xl drop-shadow-[4px_4px_0_#000] sm:text-8xl">
          {slide.emoji ?? "📘"}
        </div>
      </div>

      {/* กล่องข้อความ RPG */}
      <div className="rpg-box relative mx-2 p-5 sm:p-6">
        <div className="absolute -top-5 left-4 border-2 border-black bg-white px-3 py-1 font-thai text-sm font-bold text-black sm:text-base">{slide.title}</div>
        <p onClick={advance} className={`min-h-[8.5rem] cursor-pointer whitespace-pre-line pt-2 font-thai text-base leading-relaxed sm:text-lg ${done ? "type-cursor" : ""}`}>
          {slide.text.slice(0, typed)}
        </p>
        {slide.keywords && done && (
          <div className="anim-pop mt-3 flex flex-wrap gap-2">
            {slide.keywords.map((k) => (
              <span key={k} className="border-2 border-yellow-300 bg-yellow-300/10 px-2 py-0.5 font-thai text-xs text-yellow-300 sm:text-sm">
                🔑 {k}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <PxButton thai className="!px-3 !py-2 !text-sm" disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
            {t("s2.back")}
          </PxButton>
          <PxButton variant={isLast && done ? "success" : "primary"} thai onClick={advance}>
            {!done ? t("s2.skip") : isLast ? t("s2.done") : t("s2.next")}
          </PxButton>
        </div>
      </div>
    </main>
  );
}
