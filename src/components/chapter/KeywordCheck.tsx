"use client";

/**
 * =====================================================================
 *  SECTION 3 : KEYWORD CHECK — มินิเกมบล็อก [?] ตรวจคำสำคัญ
 *  ชนบล็อก → คำถามสั้น 3 ตัวเลือก
 *  ถูก = ได้เหรียญ ไปบล็อกถัดไป | ผิด = โดนดาเมจ แล้วลองใหม่
 *  ตอบถูกครบทุกบล็อก → ปลดล็อก Section 4
 * =====================================================================
 */
import { useState } from "react";
import type { KeywordQuestion } from "@/data/types";
import { PlayerAvatar, PxButton } from "@/components/game/Pixels";
import { sfx } from "@/lib/sfx";
import { useI18n } from "@/lib/i18n";

interface Props {
  questions: KeywordQuestion[];
  onComplete: () => void;
}

type Phase = "idle" | "bump" | "ask" | "correct" | "wrong" | "done";

export default function KeywordCheck({ questions, onComplete }: Props) {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [picked, setPicked] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const q = questions[current];

  const hit = (i: number) => {
    if (i !== current || phase !== "idle") {
      if (i > current) sfx.bump();
      return;
    }
    sfx.bump();
    setPhase("bump");
    setTimeout(() => {
      sfx.coin();
      setPhase("ask");
    }, 380);
  };

  const choose = (i: number) => {
    if (phase !== "ask") return;
    setPicked(i);
    if (i === q.answer) {
      sfx.correct();
      setPhase("correct");
    } else {
      sfx.wrong();
      setMistakes((m) => m + 1);
      setPhase("wrong");
    }
  };

  const next = () => {
    setPicked(null);
    if (current === questions.length - 1) {
      sfx.clear();
      setPhase("done");
    } else {
      setCurrent((c) => c + 1);
      setPhase("idle");
    }
  };

  const retry = () => {
    setPicked(null);
    setPhase("ask");
  };

  return (
    <main className="relative mx-auto min-h-[calc(100vh-120px)] max-w-5xl overflow-hidden px-4 pb-24 pt-6" style={{ background: "#5c94fc" }}>
      <div className="brick-ground absolute bottom-0 left-0 right-0 h-16" />

      <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-2">
        <div className="bg-black px-3 py-2 font-thai text-sm text-white">
          🔑 {t("s3.title")} — {t("s3.goal")} <b className="text-yellow-300">{questions.length}</b>
        </div>
        <div className="bg-black px-3 py-2 font-pixel text-[10px] text-white">
          🪙 x{String(phase === "done" ? questions.length : current + (phase === "correct" ? 1 : 0)).padStart(2, "0")} • ✖ {t("s3.mistakes")} {mistakes}
        </div>
      </div>

      {/* แถวบล็อก ? */}
      <div className="relative z-10 flex justify-center gap-3 sm:gap-6">
        {questions.map((kw, i) => {
          const used = i < current || (i === current && (phase === "correct" || phase === "done"));
          const isCurrent = i === current && phase !== "done";
          return (
            <div key={kw.keyword} className="flex flex-col items-center">
              <div
                role="button"
                aria-label={`บล็อกคำถามที่ ${i + 1}`}
                onClick={() => hit(i)}
                className={`q-block !h-14 !w-14 !text-2xl sm:!h-20 sm:!w-20 sm:!text-4xl ${used ? "used" : ""} ${isCurrent && phase === "bump" ? "hit" : ""} ${!used && !isCurrent ? "opacity-60 !animate-none" : ""}`}
              >
                {used ? "🪙" : "?"}
              </div>
              <div className={`mt-2 max-w-[80px] text-center font-thai text-[10px] sm:text-xs ${used ? "text-yellow-200" : "text-white/70"}`}>{used ? kw.keyword : `#${i + 1}`}</div>
            </div>
          );
        })}
      </div>

      {/* ตัวละครเดินไปใต้บล็อกปัจจุบัน */}
      <div className="relative z-10 mt-6 h-20">
        <div
          className="absolute bottom-0 transition-all duration-500"
          style={{ left: `calc(${((Math.min(current, questions.length - 1) + 0.5) / questions.length) * 100}% - 24px)` }}
        >
          <div className={phase === "bump" ? "-translate-y-6 transition-transform" : phase === "wrong" ? "anim-shake" : ""}>
            <PlayerAvatar px={4} className={phase === "idle" || phase === "done" ? "anim-hop" : ""} />
          </div>
        </div>
      </div>

      {/* แผงคำถาม/ผลลัพธ์ */}
      <div className="relative z-10 mx-auto mt-4 max-w-2xl">
        {phase === "idle" && (
          <div className="rpg-box anim-pop p-4 text-center font-thai">
            {t("s3.hit")} {current + 1}
            <div className="mt-3">
              <PxButton variant="warning" thai onClick={() => hit(current)}>
              {t("s3.jump")}
              </PxButton>
            </div>
          </div>
        )}

        {(phase === "ask" || phase === "wrong" || phase === "correct") && (
          <div className={`rpg-box p-5 ${phase === "wrong" ? "anim-shake" : "anim-pop"}`}>
            <div className="mb-1 font-pixel text-[10px] text-yellow-300">KEYWORD: {q.keyword}</div>
            <p className="mb-4 font-thai text-base font-semibold sm:text-lg">{q.question}</p>
            <div className="grid gap-3">
              {q.choices.map((c, i) => {
                let cls = "bg-white text-black hover:bg-yellow-200";
                if (phase === "correct" && i === q.answer) cls = "bg-green-400 text-black";
                else if (phase === "wrong" && i === picked) cls = "bg-red-400 text-black line-through";
                return (
                  <button key={c} disabled={phase !== "ask"} onClick={() => choose(i)} className={`px-border px-4 py-3 text-left font-thai text-sm transition sm:text-base ${cls}`}>
                    <span className="font-pixel text-[10px] text-blue-700">{["ก", "ข", "ค"][i]}.</span> {c}
                  </button>
                );
              })}
            </div>

            {phase === "correct" && (
              <div className="anim-pop mt-4 flex flex-wrap items-center justify-between gap-3 border-t-4 border-white/30 pt-3">
                <div className="font-thai text-sm text-green-300">{t("s3.correct")} {q.explanation}</div>
                <PxButton variant="success" thai onClick={next}>
                  {current === questions.length - 1 ? t("s3.finish") : t("s3.next")}
                </PxButton>
              </div>
            )}
            {phase === "wrong" && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-4 border-white/30 pt-3">
                <div className="flex items-center gap-3">
                  <span className="anim-x font-pixel text-4xl text-red-500 drop-shadow-[3px_3px_0_#000]">✖</span>
                  <span className="font-thai text-sm text-red-300">{t("s3.wrong")}</span>
                </div>
                <PxButton variant="danger" thai onClick={retry}>
                  {t("s3.retry")}
                </PxButton>
              </div>
            )}
          </div>
        )}

        {phase === "done" && (
          <div className="anim-pop flex flex-col items-center gap-4 text-center">
            <div className="px-border bg-green-500 px-6 py-4 font-pixel text-lg text-black sm:text-2xl">{t("s3.clear")}</div>
            <div className="rpg-box p-4 font-thai">
              {t("s3.done")} {questions.length} • {t("s3.mistakes")}: {mistakes}
              <div className="mt-1 text-sm text-red-300">{t("s3.warn")}</div>
            </div>
            <PxButton variant="danger" thai className="!text-lg" onClick={onComplete}>
              {t("s3.goBoss")}
            </PxButton>
          </div>
        )}
      </div>
    </main>
  );
}
