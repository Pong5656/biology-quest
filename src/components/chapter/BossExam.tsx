"use client";

/**
 * =====================================================================
 *  SECTION 4 : BOSS EXAM — platformer + ข้อสอบสุ่มจาก pool
 *  -------------------------------------------------------------------
 *  • pool 30+ ข้อ/บท → สุ่ม 20 ข้อต่อรอบ (เล่นซ้ำได้ไม่น่าเบื่อ)
 *  • HP: บอส = 70% ของจำนวนข้อ / ผู้เล่น = ที่เหลือ (เกมจบได้เสมอ)
 *  • ไอเทมในด่าน: 🪙 เหรียญ (สะสมข้ามรอบ + +50 คะแนน)
 *                  ❤️ หัวใจ (ฟื้นฟู 1 HP)   ⭐ ดาว (พลัง 3 วิ)
 *  • คำใบ้แลกเหรียญในหน้าข้อสอบ: ✂️ 50/50 (3🪙) / 💡 hint (2🪙)
 *  • คอมโบ: ตอบถูกติดกัน → คะแนน ×2 ×3 ×4
 *  • รางวัล: S / A / B / C ตามความแม่นยำ + HP ที่เหลือ
 * =====================================================================
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { BossConfig, ExamQuestion } from "@/data/types";
import { PlatformerEngine, VIEW_H, VIEW_W, type EngineCallbacks } from "@/game/engine";
import { Hearts, HpBar, PxButton } from "@/components/game/Pixels";
import ExamQuestionModal, { type ExamResult } from "./ExamQuestionModal";
import TouchPad from "./TouchPad";
import { useI18n } from "@/lib/i18n";
import { usePlayer } from "@/lib/usePlayer";
import { getEnglishPack } from "@/data/en";
import { sfx } from "@/lib/sfx";

interface Props {
  chapterId: number;
  boss: BossConfig;
  onAttempt: () => void;
  onVictory: (score: number) => void;
  onRetryLearning: () => void;
}

/** wrapper: เปลี่ยน key เพื่อเริ่มรอบใหม่แบบสะอาด */
export default function BossExam(props: Props) {
  const [run, setRun] = useState(0);
  return <BossRun key={run} {...props} skipIntro={run > 0} onRestart={() => setRun((r) => r + 1)} />;
}

/* ---------- สุ่มข้อจาก pool: สุ่มตำแหน่ง แล้วสลับตัวเลือก ---------- */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function prepareExam(pool: ExamQuestion[], examSize: number): ExamQuestion[] {
  const pick = Math.min(examSize, pool.length);
  return shuffle(pool)
    .slice(0, pick)
    .map((q) => {
      const order = shuffle(q.choices.map((_, i) => i));
      return { ...q, choices: order.map((i) => q.choices[i]), answer: order.indexOf(q.answer) };
    });
}

type Phase = "intro" | "playing" | "question" | "cutscene" | "victory" | "gameover";

function BossRun({ chapterId, boss, onAttempt, onVictory, onRetryLearning, skipIntro, onRestart }: Props & { skipIntro: boolean; onRestart: () => void }) {
  const { t, lang } = useI18n();
  const { coins: bankCoins, loading: playerLoading, saveCoins } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PlatformerEngine | null>(null);
  const enPack = lang === "en" ? getEnglishPack(chapterId) : null;
  const pool = enPack?.questions?.length ? enPack.questions : boss.questions;
  const bossName = enPack?.bossName ?? boss.name;
  const bossTitle = enPack?.bossTitle ?? boss.title;
  const bossTaunt = enPack?.bossTaunt ?? boss.taunt;
  const total = Math.min(boss.examSize ?? 20, pool.length);
  const [questions] = useState(() => prepareExam(pool, total));

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
  const [showPad, setShowPad] = useState(false);
  const coinsReady = useRef(false);
  const [endReason, setEndReason] = useState("");
  const [runCoins, setRunCoins] = useState(0); // เหรียญสุทธิรอบนี้ (ลบได้เมื่อใช้จากกระเป๋า)
  const bankRef = useRef(0); // กระเป๋าเหรียญสะสม (จากฐานข้อมูล)
  useEffect(() => {
    if (playerLoading) return;
    bankRef.current = bankCoins;
    coinsReady.current = true;
  }, [bankCoins, playerLoading]);
  const totalCoins = Math.max(0, bankCoins + runCoins);

  /* ----- ref: ค่าจริงสำหรับ logic (callback engine อ่านค่าล่าสุดเสมอ) ----- */
  const phaseRef = useRef<Phase>("intro");
  const playerHpRef = useRef(boss.playerHp);
  const bossHpRef = useRef(boss.hp);
  const qIndexRef = useRef(0);
  const streakRef = useRef(0); // ตอบถูกติดกัน
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

  /* ----- callbacks จาก engine (ผ่าน ref) ----- */
  const handlers = useRef<EngineCallbacks>({
    onQuestionBlock: () => {},
    onHazard: () => {},
    onStomp: () => {},
    onCoin: () => {},
    onHeal: () => {},
    onStar: () => {},
    onBossDefeated: () => {},
    onDeathDone: () => {},
  });
  handlers.current = {
    onQuestionBlock: () => {
      if (phaseRef.current !== "playing") return;
      if (qIndexRef.current >= total) {
        showToast(t("t.empty"));
        return;
      }
      engineRef.current?.pause();
      setActiveQ(qIndexRef.current);
      go("question");
    },
    onHazard: (kind) => {
      if (phaseRef.current !== "playing") return;
      showToast(kind === "pit" ? t("t.pit") : t("t.enemy"));
      if (damagePlayer()) startDeath(kind === "pit" ? "pit" : "hit");
    },
    onStomp: () => {
      addScore(100);
    },
    onCoin: () => {
      setRunCoins((c) => c + 1);
      addScore(50);
    },
    onHeal: () => {
      if (phaseRef.current !== "playing") return;
      if (playerHpRef.current < boss.playerHp) {
        playerHpRef.current += 1;
        setPlayerHp(playerHpRef.current);
        showToast(t("t.heal"));
      } else {
        addScore(250);
        showToast(t("t.full"));
      }
    },
    onStar: () => {
      if (phaseRef.current !== "playing") return;
      showToast(t("t.star"));
    },
    onBossDefeated: () => {
      const final = scoreRef.current + playerHpRef.current * 500 + runCoinsRef.current * 10;
      scoreRef.current = final;
      setScore(final);
      sfx.victory();
      go("victory");
      onVictory(final);
    },
    onDeathDone: () => go("gameover"),
  };
  const runCoinsRef = useRef(0);
  // mirror state → ref เพื่ออ่านใน callback
  useEffect(() => {
    runCoinsRef.current = runCoins;
  }, [runCoins]);

  /* ----- สร้าง/ทำลาย engine ----- */
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new PlatformerEngine(canvasRef.current, total, boss.hp, {
      onQuestionBlock: () => handlers.current.onQuestionBlock(),
      onHazard: (k) => handlers.current.onHazard(k),
      onStomp: () => handlers.current.onStomp(),
      onCoin: () => handlers.current.onCoin(),
      onHeal: () => handlers.current.onHeal(),
      onStar: () => handlers.current.onStar(),
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

  // ตรวจอุปกรณ์สัมผัส + แถบความคืบหน้า + บันทึกเหรียญตอนจบรอบ
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0 || window.innerWidth < 900;
    setShowPad(coarse);
    const id = setInterval(() => setProgress(engineRef.current?.progress ?? 0), 250);
    return () => {
      clearInterval(id);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      // ห้ามเซฟจนกว่ากระเป๋าจะโหลดเสร็จ ไม่งั้นเหรียญเก่าจะถูกทับเป็น 0
      if (coinsReady.current) void saveCoins(Math.max(0, bankRef.current + runCoinsRef.current));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startGame = useCallback(() => {
    sfx.coin();
    onAttempt();
    go("playing");
    engineRef.current?.resume();
    canvasRef.current?.focus();
  }, [go, onAttempt]);

  useEffect(() => {
    if (skipIntro) startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----- ผลการตอบข้อสอบ (คอมโบ + เหรียญ) ----- */
  const handleResolve = (r: ExamResult) => {
    qIndexRef.current += 1;
    setAnswered(qIndexRef.current);
    if (r === "correct") {
      streakRef.current += 1;
      const mult = Math.min(4, 1 + Math.floor(streakRef.current / 3));
      bossHpRef.current = Math.max(0, bossHpRef.current - 1);
      setBossHp(bossHpRef.current);
      correctRef.current += 1;
      setCorrect(correctRef.current);
      setRunCoins((c) => c + 1); // ตอบถูก = ได้เหรียญ +1
      runCoinsRef.current += 1;
      addScore(1000 * mult);
      engineRef.current?.fireProjectile(bossHpRef.current);
    } else {
      streakRef.current = 0;
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
      startDeath("hp");
    } else if (qIndexRef.current >= total) {
      setEndReason("exam");
      sfx.gameOver();
      go("gameover");
    } else {
      go("playing");
      engine?.resume();
    }
  };

  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
  const streak = streakRef.current;
  const mult = Math.min(4, 1 + Math.floor(streak / 3));
  const rank =
    correct === total && playerHp === boss.playerHp ? "S" : correct >= 18 ? "A" : correct >= 13 ? "B" : "C";

  return (
    <main className={`mx-auto w-full max-w-5xl px-2 pt-3 sm:px-4 ${showPad ? "pb-28" : "pb-6"}`}>
      {/* ================= HUD ================= */}
      <div className="px-border mb-3 grid grid-cols-2 items-center gap-2 bg-black px-3 py-2 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <div className="font-pixel text-[9px] text-gray-400">PLAYER</div>
          <div className="scale-90 origin-left sm:scale-100">
            <Hearts hp={playerHp} max={boss.playerHp} />
          </div>
        </div>
        <div className="order-3 col-span-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-pixel text-[10px] text-white sm:order-none sm:col-span-1 sm:text-xs">
          <span>
            📝 <span className="text-yellow-300">{String(answered).padStart(2, "0")}</span>/{total}
          </span>
          <span>
            ✅ <span className="text-green-400">{correct}</span>
          </span>
          <span>
            {t("s4.combo")} <span className={mult > 1 ? "text-orange-400" : "text-gray-400"}>×{mult}</span>
          </span>
          <span title="coins (กระเป๋า + รอบนี้)">
            🪙 <span className="text-yellow-300">{totalCoins}</span>
          </span>
          <span>
            SCORE <span className="text-yellow-300">{String(score).padStart(6, "0")}</span>
          </span>
        </div>
        <div className="text-right">
          <div className="font-thai text-xs font-bold text-red-400">👾 {bossName}</div>
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
      <div className="relative mx-auto w-full" style={{ maxWidth: `max(320px, calc((100vh - ${showPad ? 210 : 230}px) * ${VIEW_W / VIEW_H}))` }}>
        <canvas
          ref={canvasRef}
          tabIndex={0}
          className="pixel-canvas px-border block w-full bg-[#5c94fc] outline-none"
          style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
          aria-label="game-boss-exam"
        />
        {toast && (
          <div className="anim-pop pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap border-4 border-black bg-white px-3 py-1 font-thai text-sm font-bold text-black">
            {toast}
          </div>
        )}
      </div>

      {/* ================= ควบคุม ================= */}
      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        <p className="font-thai text-[11px] text-gray-300 sm:text-sm">{t("s4.controls")}</p>
        <button type="button" className="px-btn !px-2 !py-2 !text-[10px]" onClick={() => setShowPad((v) => !v)}>
          {t("s4.pad")} {showPad ? "ON" : "OFF"}
        </button>
      </div>
      {showPad && (
        <TouchPad
          onLeft={(d) => engineRef.current?.setTouch("left", d)}
          onRight={(d) => engineRef.current?.setTouch("right", d)}
          onJump={(d) => engineRef.current?.setTouch("jump", d)}
        />
      )}

      {/* ================= ข้อสอบ ================= */}
      {phase === "question" && activeQ !== null && (
        <ExamQuestionModal
          key={activeQ}
          question={questions[activeQ]}
          number={activeQ + 1}
          total={total}
          timeLimit={boss.questionTime}
          streak={streak}
          coins={totalCoins}
          onSpend={(n) => {
            if (bankRef.current + runCoinsRef.current < n) return false;
            runCoinsRef.current -= n; // อาจติดลบ (ใช้จากกระเป๋า) — จะรวมบันทึกตอนจบรอบ
            setRunCoins((c) => c - n);
            return true;
          }}
          onResolve={handleResolve}
          onClose={handleClose}
        />
      )}

      {/* ================= INTRO ================= */}
      {phase === "intro" && (
        <Overlay>
          <div className="anim-boss-idle text-7xl drop-shadow-[6px_6px_0_#000]">{boss.title.includes("👾") ? "👾" : "👾"}</div>
          <div className="px-border mt-4 bg-red-700 px-5 py-2 text-center">
            <div className="font-pixel text-[10px] text-yellow-300">BOSS • {bossTitle}</div>
            <div className="font-thai text-2xl font-bold">{bossName}</div>
          </div>
          <p className="mt-4 max-w-lg text-center font-thai text-sm italic text-red-200 sm:text-base">“{bossTaunt}”</p>
          <div className="rpg-box mt-5 w-full max-w-lg p-4 font-thai text-sm leading-relaxed sm:text-base">
            <div className="mb-2 font-pixel text-[10px] text-yellow-300">{t("s4.rules")}</div>
            {t("s4.r1")}
            <br />
            {t("s4.r2")}
            <br />
            {t("s4.r3")}
            <br />
            {t("s4.r4")}
            <br />
            {t("s4.r5", { a: boss.playerHp, b: boss.hp })}
            <br />
            {t("s4.r6")}
          </div>
          <div className="mt-5 flex gap-3">
            <PxButton thai onClick={onRetryLearning}>
              {t("s4.review")}
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
          <div
            className="anim-pop mt-3 border-4 border-black px-6 py-2 font-pixel text-3xl"
            style={{ background: rank === "S" ? "#f8d800" : rank === "A" ? "#80d010" : rank === "B" ? "#209cee" : "#fc9838", color: "#000" }}
          >
            {t("s4.rank")}: {rank}
          </div>
          <div className="font-thai text-sm text-yellow-300">{t(`s4.rank${rank}`)}</div>
          <div className="rpg-box mt-4 w-full max-w-md p-5 text-center font-thai">
            <div className="text-lg">{t("s4.winText", { b: bossName })}</div>
            <div className="mt-1 text-sm text-yellow-300">
              +{playerHp * 500} HP bonus + {runCoins * 10} 🪙 bonus
            </div>
            <Stats answered={answered} total={total} correct={correct} accuracy={accuracy} score={score} hp={playerHp} maxHp={boss.playerHp} t={t} />
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <PxButton thai onClick={onRestart}>
              {t("s4.retry")}
            </PxButton>
            <Link href="/" className="px-btn px-btn-success px-btn-thai">
              {t("s4.map")}
            </Link>
          </div>
        </Overlay>
      )}

      {/* ================= GAME OVER ================= */}
      {phase === "gameover" && (
        <Overlay>
          <div className="text-7xl">💀</div>
          <div className="px-border mt-4 bg-black px-6 py-3 font-pixel text-2xl text-red-500 sm:text-4xl">GAME OVER</div>
          <div className="rpg-box mt-4 w-full max-w-md p-5 text-center font-thai">
            <div className="text-red-300">
              {endReason === "hp" ? t("t.enemy") : t("t.empty")}
            </div>
            <div className="mt-1 text-sm">{bossName} — HP {bossHp}/{boss.hp}</div>
            <Stats answered={answered} total={total} correct={correct} accuracy={accuracy} score={score} hp={playerHp} maxHp={boss.playerHp} t={t} />
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <PxButton variant="danger" thai onClick={onRestart}>
              {t("s4.retry")}
            </PxButton>
            <PxButton thai onClick={onRetryLearning}>
              {t("s4.review2")}
            </PxButton>
            <Link href="/" className="px-btn px-btn-thai">
              {t("s4.map")}
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

function Stats({
  answered,
  total,
  correct,
  accuracy,
  score,
  hp,
  maxHp,
  t,
}: {
  answered: number;
  total: number;
  correct: number;
  accuracy: number;
  score: number;
  hp: number;
  maxHp: number;
  t: (k: string) => string;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 text-left text-sm">
      <div className="border-2 border-white/30 p-2">
        {t("s4.answered")}: {answered}/{total}
      </div>
      <div className="border-2 border-white/30 p-2">
        {t("s4.correct")}: {correct}
      </div>
      <div className="border-2 border-white/30 p-2">
        {t("s4.accuracy")}: {accuracy}%
      </div>
      <div className="border-2 border-white/30 p-2">
        {t("s4.hpLeft")}: {hp}/{maxHp}
      </div>
      <div className="col-span-2 border-2 border-yellow-300 p-2 text-center font-pixel text-xs text-yellow-300">SCORE {String(score).padStart(6, "0")}</div>
    </div>
  );
}
