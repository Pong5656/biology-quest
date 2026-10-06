"use client";

/**
 * =====================================================================
 *  SECTION 4 : BOSS EXAM — เกม platformer เล่นได้จริง + ข้อสอบ 20 ข้อ
 *  -------------------------------------------------------------------
 *  • วิ่ง/กระโดด (WASD / ลูกศร / Space หรือปุ่มสัมผัสบนมือถือ)
 *  • ชนบล็อก [?] จากด้านล่าง → เกมหยุด → ข้อสอบ (จับเวลา 60 วิ)
 *      ถูก   → ยิงลูกพลังงานใส่บอส (บอส −1 HP) + คะแนน
 *      ผิด/หมดเวลา → ผู้เล่น −1 HP แล้วข้ามข้อ
 *  • โดนศัตรู/ตกหลุม → ผู้เล่น −1 HP
 *  • บอส HP = 0 → ชนะ | ผู้เล่น HP = 0 → GAME OVER
 *
 *  การจัดการ state: ค่า HP/ข้อที่/คะแนน เก็บทั้งใน ref (ให้ callback ของ
 *  engine อ่านค่าล่าสุดเสมอ) และใน state (ไว้แสดงผล)
 * =====================================================================
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { BossConfig, ExamQuestion } from "@/data/types";
import { PlatformerEngine, VIEW_H, VIEW_W, type EngineCallbacks } from "@/game/engine";
import { Hearts, HpBar, PxButton } from "@/components/game/Pixels";
import ExamQuestionModal, { type ExamResult } from "./ExamQuestionModal";
import { sfx } from "@/lib/sfx";

interface Props {
  boss: BossConfig;
  onAttempt: () => void;
  onVictory: (score: number) => void;
  onRetryLearning: () => void;
}

/** wrapper: เปลี่ยน key เพื่อเริ่มรอบใหม่แบบสะอาด (engine + state ใหม่ทั้งหมด) */
export default function BossExam(props: Props) {
  const [run, setRun] = useState(0);
  return <BossRun key={run} {...props} skipIntro={run > 0} onRestart={() => setRun((r) => r + 1)} />;
}

/* ---------- สุ่มลำดับข้อ + สลับตัวเลือก ---------- */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function prepareExam(qs: ExamQuestion[]): ExamQuestion[] {
  return shuffle(qs).map((q) => {
    const order = shuffle(q.choices.map((_, i) => i));
    return { ...q, choices: order.map((i) => q.choices[i]), answer: order.indexOf(q.answer) };
  });
}

type Phase = "intro" | "playing" | "question" | "cutscene" | "victory" | "gameover";

function BossRun({ boss, onAttempt, onVictory, onRetryLearning, skipIntro, onRestart }: Props & { skipIntro: boolean; onRestart: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PlatformerEngine | null>(null);
  const [questions] = useState(() => prepareExam(boss.questions));
  const total = questions.length;

  /* ----- state สำหรับแสดงผล ----- */
  const [phase, setPhase] = useState<Phase>("intro");
  const [playerHp, setPlayerHp] = useState(boss.playerHp);
  const [bossHp, setBossHp] = useState(boss.hp);
  const [answered, setAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [activeQ, setActiveQ] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isTouch, setIsTouch] = useState(false);
  const [endReason, setEndReason] = useState("");

  /* ----- ref: ค่าจริงสำหรับ logic ----- */
  const phaseRef = useRef<Phase>("intro");
  const playerHpRef = useRef(boss.playerHp);
  const bossHpRef = useRef(boss.hp);
  const qIndexRef = useRef(0);
  const correctRef = useRef(0);
  const scoreRef = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);
  const addScore = (n: number) => {
    scoreRef.current += n;
    setScore(scoreRef.current);
  };
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };
  /** ลด HP ผู้เล่น — คืน true ถ้าตาย */
  const damagePlayer = () => {
    playerHpRef.current = Math.max(0, playerHpRef.current - 1);
    setPlayerHp(playerHpRef.current);
    return playerHpRef.current <= 0;
  };
  const startDeath = (reason: string) => {
    setEndReason(reason);
    go("cutscene");
    sfx.gameOver();
    engineRef.current?.resume();
    engineRef.current?.killPlayer();
  };

  /* ----- callbacks จาก engine (ผ่าน ref เพื่ออ่านค่าล่าสุดเสมอ) ----- */
  const handlers = useRef<EngineCallbacks>({
    onQuestionBlock: () => {},
    onHazard: () => {},
    onStomp: () => {},
    onBossDefeated: () => {},
    onDeathDone: () => {},
  });
  handlers.current = {
    onQuestionBlock: () => {
      if (phaseRef.current !== "playing") return;
      if (qIndexRef.current >= total) {
        showToast("บล็อกนี้ว่างเปล่า — ข้อสอบหมดแล้ว");
        return;
      }
      engineRef.current?.pause();
      setActiveQ(qIndexRef.current);
      go("question");
    },
    onHazard: (kind) => {
      if (phaseRef.current !== "playing") return;
      showToast(kind === "pit" ? "😵 ตกหลุม! −1 ❤️" : "🦠 โดนแบคทีเรีย! −1 ❤️");
      if (damagePlayer()) startDeath(kind === "pit" ? "ตกหลุมจนหัวใจหมด" : "ถูกแบคทีเรียโจมตีจนหัวใจหมด");
    },
    onStomp: () => addScore(100),
    onBossDefeated: () => {
      const final = scoreRef.current + playerHpRef.current * 500;
      scoreRef.current = final;
      setScore(final);
      sfx.victory();
      go("victory");
      onVictory(final);
    },
    onDeathDone: () => go("gameover"),
  };

  /* ----- สร้าง/ทำลาย engine ----- */
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new PlatformerEngine(canvasRef.current, total, boss.hp, {
      onQuestionBlock: () => handlers.current.onQuestionBlock(),
      onHazard: (k) => handlers.current.onHazard(k),
      onStomp: () => handlers.current.onStomp(),
      onBossDefeated: () => handlers.current.onBossDefeated(),
      onDeathDone: () => handlers.current.onDeathDone(),
    });
    engineRef.current = engine;
    engine.start();
    engine.pause(); // รอผู้เล่นกดเริ่ม
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [total, boss.hp]);

  // ตรวจอุปกรณ์สัมผัส + แถบความคืบหน้าด่าน
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0);
    const id = setInterval(() => setProgress(engineRef.current?.progress ?? 0), 250);
    return () => {
      clearInterval(id);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const startGame = useCallback(() => {
    sfx.coin();
    onAttempt();
    go("playing");
    engineRef.current?.resume();
    canvasRef.current?.focus();
  }, [go, onAttempt]);

  // รอบใหม่ (หลังกดลองใหม่) ข้ามหน้า intro
  useEffect(() => {
    if (skipIntro) startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----- ผลการตอบข้อสอบ ----- */
  const handleResolve = (r: ExamResult) => {
    qIndexRef.current += 1;
    setAnswered(qIndexRef.current);
    if (r === "correct") {
      bossHpRef.current = Math.max(0, bossHpRef.current - 1);
      setBossHp(bossHpRef.current);
      correctRef.current += 1;
      setCorrect(correctRef.current);
      addScore(1000);
      engineRef.current?.fireProjectile(bossHpRef.current);
    } else {
      damagePlayer();
      engineRef.current?.hurtFlash();
    }
  };
  const handleClose = () => {
    setActiveQ(null);
    const engine = engineRef.current;
    if (bossHpRef.current <= 0) {
      go("cutscene");
      engine?.resume();
      engine?.startBossDefeat();
    } else if (playerHpRef.current <= 0) {
      startDeath("ตอบผิด/หมดเวลาจนหัวใจหมด");
    } else if (qIndexRef.current >= total) {
      setEndReason("ข้อสอบครบ 20 ข้อแล้ว แต่บอสยังไม่พ่าย");
      sfx.gameOver();
      go("gameover");
    } else {
      go("playing");
      engine?.resume();
    }
  };

  /* ----- ปุ่มสัมผัส ----- */
  const touchProps = (key: "left" | "right" | "jump") => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      engineRef.current?.setTouch(key, true);
    },
    onPointerUp: () => engineRef.current?.setTouch(key, false),
    onPointerCancel: () => engineRef.current?.setTouch(key, false),
    onLostPointerCapture: () => engineRef.current?.setTouch(key, false),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;

  return (
    <main className="mx-auto w-full max-w-5xl px-2 pb-6 pt-3 sm:px-4">
      {/* ================= HUD ================= */}
      <div className="px-border mb-3 grid grid-cols-2 items-center gap-2 bg-black px-3 py-2 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <div className="font-pixel text-[9px] text-gray-400">PLAYER</div>
          <div className="scale-90 origin-left sm:scale-100">
            <Hearts hp={playerHp} max={boss.playerHp} />
          </div>
        </div>
        <div className="order-3 col-span-2 flex items-center justify-center gap-4 font-pixel text-[10px] text-white sm:order-none sm:col-span-1 sm:text-xs">
          <span>
            📝 <span className="text-yellow-300">{String(answered).padStart(2, "0")}</span>/{total}
          </span>
          <span>
            ✅ <span className="text-green-400">{correct}</span>
          </span>
          <span>
            SCORE <span className="text-yellow-300">{String(score).padStart(6, "0")}</span>
          </span>
        </div>
        <div className="text-right">
          <div className="font-thai text-xs font-bold text-red-400">👾 {boss.name}</div>
          <div className="ml-auto w-full max-w-[200px]">
            <HpBar hp={bossHp} max={boss.hp} color="#e40058" />
          </div>
          <div className="font-pixel text-[9px] text-gray-400">
            HP {bossHp}/{boss.hp}
          </div>
        </div>
      </div>

      {/* แถบความคืบหน้าด่าน */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm">🏃</span>
        <div className="relative h-3 flex-1 border-2 border-white bg-black">
          <div className="h-full bg-green-500" style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="text-sm">🏰</span>
      </div>

      {/* ================= CANVAS ================= */}
      <div className="relative mx-auto w-full" style={{ maxWidth: `max(320px, calc((100vh - ${isTouch ? 330 : 250}px) * ${VIEW_W / VIEW_H}))` }}>
        <canvas
          ref={canvasRef}
          tabIndex={0}
          className="pixel-canvas px-border block w-full bg-[#5c94fc] outline-none"
          style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
          aria-label="เกมบอสข้อสอบ"
        />
        {toast && (
          <div className="anim-pop pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap border-4 border-black bg-white px-3 py-1 font-thai text-sm font-bold text-black">
            {toast}
          </div>
        )}
      </div>

      {/* ================= ปุ่มควบคุม ================= */}
      {isTouch ? (
        <div className="mx-auto mt-4 flex max-w-xl select-none items-center justify-between px-2">
          <div className="flex gap-3">
            <button aria-label="ซ้าย" className="touch-btn h-16 w-16 bg-[#3c3c3c] text-xl" {...touchProps("left")}>
              ◀
            </button>
            <button aria-label="ขวา" className="touch-btn h-16 w-16 bg-[#3c3c3c] text-xl" {...touchProps("right")}>
              ▶
            </button>
          </div>
          <button aria-label="กระโดด" className="touch-btn h-20 w-20 rounded-full bg-[#e40058] text-lg" {...touchProps("jump")}>
            A
          </button>
        </div>
      ) : (
        <div className="mt-3 text-center font-thai text-xs text-gray-300 sm:text-sm">
          ⌨️ <b>A/D</b> หรือ <b>← →</b> เดิน • <b>Space / W / ↑</b> กระโดด (กดค้างกระโดดสูง) • ชนบล็อก <span className="font-pixel text-yellow-300">[?]</span> จากด้านล่างเพื่อเปิดข้อสอบ • ตอบด้วยปุ่ม <b>1-4</b>
        </div>
      )}

      {/* ================= ข้อสอบ ================= */}
      {phase === "question" && activeQ !== null && (
        <ExamQuestionModal
          key={activeQ}
          question={questions[activeQ]}
          number={activeQ + 1}
          total={total}
          timeLimit={boss.questionTime}
          onResolve={handleResolve}
          onClose={handleClose}
        />
      )}

      {/* ================= INTRO ================= */}
      {phase === "intro" && (
        <Overlay>
          <div className="anim-boss-idle text-7xl drop-shadow-[6px_6px_0_#000]">👾</div>
          <div className="px-border mt-4 bg-red-700 px-5 py-2 text-center">
            <div className="font-pixel text-[10px] text-yellow-300">BOSS • {boss.title}</div>
            <div className="font-thai text-2xl font-bold">{boss.name}</div>
          </div>
          <p className="mt-4 max-w-lg text-center font-thai text-sm italic text-red-200 sm:text-base">“{boss.taunt}”</p>
          <div className="rpg-box mt-5 w-full max-w-lg p-4 font-thai text-sm leading-relaxed sm:text-base">
            <div className="mb-2 font-pixel text-[10px] text-yellow-300">กติกา</div>
            🏃 วิ่งไปทางขวา ชนบล็อก <b className="text-yellow-300">[?]</b> จากด้านล่างเพื่อเปิดข้อสอบ ({total} ข้อ)
            <br />⏱️ จับเวลา <b>{boss.questionTime} วินาที</b> ต่อข้อ — หมดเวลาถือว่าผิด
            <br />⚡ ตอบถูก = ยิงพลังงานใส่บอส (−1 HP บอส)
            <br />💥 ตอบผิด / หมดเวลา / โดนศัตรู / ตกหลุม = −1 ❤️
            <br />❤️ คุณมี {boss.playerHp} หัวใจ — บอสมี {boss.hp} HP
          </div>
          <div className="mt-5 flex gap-3">
            <PxButton thai onClick={onRetryLearning}>
              📖 ทบทวนก่อน
            </PxButton>
            <PxButton variant="danger" onClick={startGame}>
              FIGHT !
            </PxButton>
          </div>
        </Overlay>
      )}

      {/* ================= VICTORY ================= */}
      {phase === "victory" && (
        <Overlay>
          <div className="text-7xl">🏆</div>
          <div className="px-border mt-4 bg-yellow-400 px-6 py-3 font-pixel text-2xl text-black sm:text-4xl">YOU WIN!</div>
          <div className="rpg-box mt-5 w-full max-w-md p-5 text-center font-thai">
            <div className="text-lg">
              คุณปราบ <b>{boss.name}</b> สำเร็จ! 👑
            </div>
            <Stats answered={answered} total={total} correct={correct} accuracy={accuracy} score={score} hp={playerHp} maxHp={boss.playerHp} />
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <PxButton thai onClick={onRestart}>
              ↻ เล่นอีกครั้ง
            </PxButton>
            <Link href="/" className="px-btn px-btn-success px-btn-thai">
              🗺️ กลับแผนที่
            </Link>
          </div>
        </Overlay>
      )}

      {/* ================= GAME OVER ================= */}
      {phase === "gameover" && (
        <Overlay>
          <div className="text-7xl">💀</div>
          <div className="px-border mt-4 bg-black px-6 py-3 font-pixel text-2xl text-red-500 sm:text-4xl">GAME OVER</div>
          <div className="rpg-box mt-5 w-full max-w-md p-5 text-center font-thai">
            <div className="text-red-300">{endReason}</div>
            <div className="mt-1 text-sm">
              {boss.name} เหลือ HP {bossHp}/{boss.hp}
            </div>
            <Stats answered={answered} total={total} correct={correct} accuracy={accuracy} score={score} hp={playerHp} maxHp={boss.playerHp} />
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <PxButton variant="danger" thai onClick={onRestart}>
              ↻ ลองใหม่
            </PxButton>
            <PxButton thai onClick={onRetryLearning}>
              📖 ทบทวนบทเรียน
            </PxButton>
            <Link href="/" className="px-btn px-btn-thai">
              🗺️ แผนที่
            </Link>
          </div>
        </Overlay>
      )}
    </main>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return <div className="anim-pop fixed inset-0 z-40 flex flex-col items-center justify-center overflow-y-auto bg-black/85 p-4">{children}</div>;
}

function Stats({ answered, total, correct, accuracy, score, hp, maxHp }: { answered: number; total: number; correct: number; accuracy: number; score: number; hp: number; maxHp: number }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 text-left text-sm">
      <div className="border-2 border-white/30 p-2">📝 ตอบแล้ว: {answered}/{total}</div>
      <div className="border-2 border-white/30 p-2">✅ ถูก: {correct} ข้อ</div>
      <div className="border-2 border-white/30 p-2">🎯 แม่นยำ: {accuracy}%</div>
      <div className="border-2 border-white/30 p-2">❤️ เหลือ: {hp}/{maxHp}</div>
      <div className="col-span-2 border-2 border-yellow-300 p-2 text-center font-pixel text-xs text-yellow-300">SCORE {String(score).padStart(6, "0")}</div>
    </div>
  );
}
