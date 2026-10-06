"use client";

/**
 * =====================================================================
 *  EXAM QUESTION MODAL — ป๊อปอัปข้อสอบเมื่อชนบล็อก [?] ใน Section 4
 *  -------------------------------------------------------------------
 *  กติกาเข้มงวด: จับเวลา 60 วินาทีต่อข้อ
 *   • ใช้ deadline (Date.now) + setInterval 200ms → ไม่คลาดเคลื่อนแม้แท็บหน่วง
 *   • resolvedRef รับประกันว่าแต่ละข้อถูกตัดสินเพียงครั้งเดียว
 *     (กันกรณีกดตอบพร้อมกับเวลาหมด)
 *   • หมดเวลา = ผิด → ปิดอัตโนมัติและข้ามไปข้อถัดไป
 *  Component นี้ถูก remount ทุกข้อ (key = index) → state สะอาดเสมอ
 * =====================================================================
 */
import { useEffect, useRef, useState } from "react";
import type { ExamQuestion } from "@/data/types";
import { sfx } from "@/lib/sfx";

export type ExamResult = "correct" | "wrong" | "timeout";

interface Props {
  question: ExamQuestion;
  number: number;
  total: number;
  timeLimit: number;
  /** เรียกทันทีที่ตัดสินผล (ใช้ปรับ HP) */
  onResolve: (result: ExamResult) => void;
  /** เรียกเมื่อปิดป๊อปอัป (กลับไปเล่นต่อ) */
  onClose: () => void;
}

const AUTO_CLOSE_MS = 2600;

export default function ExamQuestionModal({ question, number, total, timeLimit, onResolve, onClose }: Props) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  const resolvedRef = useRef(false);
  const closedRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // เก็บ callback ล่าสุดไว้ใน ref เพื่อกัน stale closure ใน interval
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

  /* ----- นาฬิกาจับเวลา 60 วินาที ----- */
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

  /* ----- คีย์ลัด 1-4 / A-D เลือกคำตอบ, Enter ปิดเมื่อเฉลยแล้ว ----- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (resolvedRef.current) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          close();
        }
        return;
      }
      const map: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
      const i = map[e.key.toLowerCase()];
      if (i !== undefined && i < question.choices.length) {
        e.preventDefault();
        resolveRef.current(i === question.answer ? "correct" : "wrong", i);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question]);

  const danger = timeLeft <= 10;
  const pct = (timeLeft / timeLimit) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3">
      <div className={`rpg-box w-full max-w-2xl p-4 sm:p-6 ${result && result !== "correct" ? "anim-shake" : "anim-pop"}`}>
        {/* หัว: ข้อที่ + นาฬิกา */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="q-block used !h-9 !w-9 !text-sm">?</span>
            <span className="font-pixel text-[10px] text-yellow-300 sm:text-xs">
              ข้อ {String(number).padStart(2, "0")}/{total}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] text-gray-300">TIME</span>
            <span className={`min-w-[3ch] text-right font-pixel text-2xl sm:text-3xl ${danger ? "timer-danger" : "text-yellow-300"}`}>{String(timeLeft).padStart(2, "0")}</span>
          </div>
        </div>
        <div className="hp-bar mb-4">
          <div style={{ width: `${pct}%`, background: danger ? "#ff2a2a" : "#f8d800", transition: "width 0.2s linear" }} />
        </div>

        <p className="mb-4 font-thai text-base font-semibold leading-relaxed sm:text-lg">{question.question}</p>
        <div className="grid gap-2 sm:gap-3">
          {question.choices.map((c, i) => {
            let cls = "bg-white text-black hover:bg-yellow-200";
            if (result) {
              if (i === question.answer) cls = "bg-green-400 text-black";
              else if (i === picked) cls = "bg-red-400 text-black";
              else cls = "bg-gray-400 text-gray-700";
            }
            return (
              <button
                key={i}
                disabled={!!result}
                onClick={() => resolve(i === question.answer ? "correct" : "wrong", i)}
                className={`px-border px-3 py-2.5 text-left font-thai text-sm transition sm:px-4 sm:py-3 sm:text-base ${cls}`}
              >
                <span className="mr-1 font-pixel text-[10px] text-blue-700">{i + 1}.</span> {c}
              </button>
            );
          })}
        </div>

        {result && (
          <div className="anim-pop mt-4 flex flex-wrap items-center justify-between gap-3 border-t-4 border-white/30 pt-3">
            <div className="flex-1 font-thai text-sm sm:text-base">
              {result === "correct" && <div className="text-green-300">⚡ ถูกต้อง! ยิงพลังงาน ATP ใส่บอส −1 HP</div>}
              {result === "wrong" && <div className="text-red-300">💥 ผิด! คุณเสีย 1 หัวใจ</div>}
              {result === "timeout" && <div className="text-red-300">⏰ หมดเวลา! คุณเสีย 1 หัวใจ — ข้ามข้อนี้</div>}
              <div className="mt-1 text-xs text-gray-300 sm:text-sm">💡 {question.explanation}</div>
            </div>
            <button onClick={close} className="px-btn px-btn-primary">
              ไปต่อ ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
