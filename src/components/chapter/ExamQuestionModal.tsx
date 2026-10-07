"use client";

/**
 * =====================================================================
 *  EXAM QUESTION MODAL — ป๊อปอัปข้อสอบเมื่อชนบล็อก [?]
 *  -------------------------------------------------------------------
 *  • จับเวลา 60 วิ/ข้อ (deadline + setInterval 200ms, ไม่คลาดเคลื่อน)
 *  • resolvedRef: ตัดสินผลได้เพียงครั้งเดียว (กัน click + timeout ซ้ำ)
 *  • ระบบคำใบ้แลกเหรียญ:
 *      ✂️ 50/50 = ตัดตัวเลือกผิด 2 ตัว (3 🪙)
 *      💡 HINT = คำใบ้สั้น (2 🪙) — ใช้ได้เฉพาะข้อยู่อินเดีย hint
 * =====================================================================
 */
import { useEffect, useRef, useState } from "react";
import type { ExamQuestion } from "@/data/types";
import { useI18n } from "@/lib/i18n";
import { sfx } from "@/lib/sfx";

export type ExamResult = "correct" | "wrong" | "timeout";

const FIFTY_COST = 3;
const HINT_COST = 2;
const AUTO_CLOSE_MS = 2600;

interface Props {
  question: ExamQuestion;
  number: number;
  total: number;
  timeLimit: number;
  streak: number; // ถูกติดกัน (แสดงใน HUD)
  coins: number; // เหรียญในมือ (เพื่อ disabled ปุ่ม)
  /** หักเหรียญ; คืน true ถ้าสำเร็จ */
  onSpend: (n: number) => boolean;
  onResolve: (result: ExamResult) => void;
  onClose: () => void;
}

export default function ExamQuestionModal({ question, number, total, timeLimit, streak, coins, onSpend, onResolve, onClose }: Props) {
  const { t } = useI18n();
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [removed, setRemoved] = useState<number[] | null>(null); // 50/50
  const [showHint, setShowHint] = useState(false);

  const resolvedRef = useRef(false);
  const closedRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cbRef = useRef({ onResolve, onClose });
  useEffect(() => {
    cbRef.current = { onResolve, onClose };
  }, [onResolve, onClose]);

  const close = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    cbRef.current.onClose();
  };

  const resolve = (r: ExamResult, choice: number | null) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setResult(r);
    setPicked(choice);
    if (r === "correct") sfx.correct();
    else sfx.wrong();
    cbRef.current.onResolve(r);
    closeTimer.current = setTimeout(close, AUTO_CLOSE_MS);
  };
  const resolveRef = useRef(resolve);
  resolveRef.current = resolve;

  /* ----- 60-second timer (deadline-based) ----- */
  useEffect(() => {
    const deadline = Date.now() + timeLimit * 1000;
    let lastTick = -1;
    const id = setInterval(() => {
      if (resolvedRef.current) {
        clearInterval(id);
        return;
      }
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 10 && remaining > 0 && remaining !== lastTick) {
        lastTick = remaining;
        sfx.tick();
      }
      if (remaining <= 0) {
        clearInterval(id);
        resolveRef.current("timeout", null);
      }
    }, 200);
    return () => {
      clearInterval(id);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [timeLimit]);

  /* ----- คีย์ลัด 1-4 เลือก, Enter ปิดเมื่อเฉลยแล้ว ----- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (resolvedRef.current) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          close();
        }
        return;
      }
      const map: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3 };
      const i = map[e.key];
      if (i !== undefined && i < question.choices.length && !(removed ?? []).includes(i)) {
        e.preventDefault();
        resolveRef.current(i === question.answer ? "correct" : "wrong", i);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question, removed]);

  /* ----- คำใบ้ ----- */
  const useFifty = () => {
    if (resolvedRef.current || removed) return;
    if (onSpend(FIFTY_COST)) {
      sfx.blip();
      const wrongs = question.choices.map((_, i) => i).filter((i) => i !== question.answer);
      setRemoved(wrongs.sort(() => Math.random() - 0.5).slice(0, 2));
    } else sfx.bump();
  };
  const useHint = () => {
    if (resolvedRef.current || showHint) return;
    if (!question.hint) return;
    if (onSpend(HINT_COST)) {
      sfx.coin();
      setShowHint(true);
    } else sfx.bump();
  };

  const danger = timeLeft <= 10;
  const pct = (timeLeft / timeLimit) * 100;
  const mult = Math.min(4, 1 + Math.floor(streak / 3));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3">
      <div className={`rpg-box w-full max-w-2xl p-4 sm:p-6 ${result && result !== "correct" ? "anim-shake" : "anim-pop"}`}>
        {/* หัว: ข้อที่ + คอมโบ + เหรียญ + นาฬิกา */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="q-block used !h-9 !w-9 !text-sm">?</span>
            <span className="font-pixel text-[10px] text-yellow-300 sm:text-xs">
              {t("m.question")} {String(number).padStart(2, "0")}/{total}
            </span>
            {streak >= 2 && (
              <span className="border-2 border-orange-400 bg-orange-400/20 px-2 py-0.5 font-pixel text-[9px] text-orange-300">
                🔥 {t("m.streak")} {streak} ×{mult}
              </span>
            )}
            <span className="font-pixel text-[10px] text-yellow-300">🪙 {coins}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] text-gray-300">TIME</span>
            <span className={`min-w-[3ch] text-right font-pixel text-2xl sm:text-3xl ${danger ? "timer-danger" : "text-yellow-300"}`}>{String(timeLeft).padStart(2, "0")}</span>
          </div>
        </div>
        <div className="hp-bar mb-4">
          <div style={{ width: `${pct}%`, background: danger ? "#ff2a2a" : "#f8d800", transition: "width 0.2s linear" }} />
        </div>

        {/* ปุ่มคำใบ้ (ใช้ก่อนตอบ) */}
        {!result && (
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              onClick={useFifty}
              disabled={!!removed || coins < FIFTY_COST}
              className="px-btn px-btn-warning !px-3 !py-2 !text-[10px] disabled:opacity-40"
            >
              ✂️ 50/50 ({FIFTY_COST} 🪙)
            </button>
            <button
              onClick={useHint}
              disabled={showHint || !question.hint || coins < HINT_COST}
              className="px-btn px-btn-primary !px-3 !py-2 !text-[10px] disabled:opacity-40"
              title={question.hint ? t("m.hint") : undefined}
            >
              💡 {t("m.hint")} ({HINT_COST} 🪙)
            </button>
          </div>
        )}

        <p className="mb-4 font-thai text-base font-semibold leading-relaxed sm:text-lg">{question.question}</p>
        <div className="grid gap-2 sm:gap-3">
          {question.choices.map((c, i) => {
            const gone = removed?.includes(i);
            let cls = "bg-white text-black hover:bg-yellow-200";
            if (result) {
              if (i === question.answer) cls = "bg-green-400 text-black";
              else if (i === picked) cls = "bg-red-400 text-black";
              else cls = "bg-gray-400 text-gray-700";
            } else if (gone) cls = "bg-gray-700 text-gray-500 line-through opacity-50";
            return (
              <button key={i} disabled={!!result || gone} onClick={() => resolve(i === question.answer ? "correct" : "wrong", i)} className={`px-border px-3 py-2.5 text-left font-thai text-sm transition sm:px-4 sm:py-3 sm:text-base ${cls}`}>
                <span className="mr-1 font-pixel text-[10px] text-blue-700">{i + 1}.</span> {c}
              </button>
            );
          })}
        </div>

        {/* คำใบ้ที่ซื้อ */}
        {showHint && question.hint && (
          <div className="anim-pop mt-3 border-2 border-yellow-300 bg-yellow-300/10 px-3 py-2 font-thai text-sm text-yellow-200">💡 {question.hint}</div>
        )}

        {/* ผลลัพธ์ */}
        {result && (
          <div className="anim-pop mt-4 flex flex-wrap items-center justify-between gap-3 border-t-4 border-white/30 pt-3">
            <div className="flex-1 font-thai text-sm sm:text-base">
              {result === "correct" && <div className="text-green-300">{t("m.correct")}</div>}
              {result === "wrong" && <div className="text-red-300">{t("m.wrong")}</div>}
              {result === "timeout" && <div className="text-red-300">{t("m.timeout")}</div>}
              <div className="mt-1 text-xs text-gray-300 sm:text-sm">💡 {question.explanation}</div>
            </div>
            <button onClick={close} className="px-btn px-btn-primary">
              {t("m.go")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
