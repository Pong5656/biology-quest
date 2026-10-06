"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WORLDS } from "@/data/curriculum";
import { isChapterAvailable } from "@/data/chapters";
import type { ChapterMeta } from "@/data/types";
import { usePlayer, type ChapterProgress } from "@/lib/usePlayer";
import { PlayerAvatar, ProfessorAvatar, PxButton, SkyScene } from "@/components/game/Pixels";
import { sfx } from "@/lib/sfx";

const LAST_CHAPTER_KEY = "bioquest.lastChapter";
const STARTED_KEY = "bioquest.started";

/**
 * หน้าแรก: Title Screen → World Map (เลือก ม.4 / ม.5 / ม.6 → เล่ม → บท)
 */
export default function HomeScreen() {
  const router = useRouter();
  const { name, progress, loading, saveName, resetAll } = usePlayer();
  const [started, setStarted] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [worldIdx, setWorldIdx] = useState(1); // เริ่มที่ ม.5 (มีบทต้นแบบ)
  const [lastChapter, setLastChapter] = useState(11);
  const [comingSoon, setComingSoon] = useState<ChapterMeta | null>(null);

  // จำสถานะจาก session/localStorage (อ่านหลัง mount เพื่อไม่ให้ hydration ไม่ตรงกัน)
  useEffect(() => {
    if (sessionStorage.getItem(STARTED_KEY)) setStarted(true);
    const last = Number(localStorage.getItem(LAST_CHAPTER_KEY));
    if (last) {
      setLastChapter(last);
      const wi = WORLDS.findIndex((w) => w.books.some((b) => b.chapters.some((c) => c.id === last)));
      if (wi >= 0) setWorldIdx(wi);
    }
  }, []);
  useEffect(() => {
    if (!loading) setNameInput(name === "นักชีววิทยา" ? "" : name);
  }, [loading, name]);

  const openChapter = (ch: ChapterMeta) => {
    if (!isChapterAvailable(ch.id)) {
      sfx.bump();
      setComingSoon(ch);
      return;
    }
    sfx.coin();
    localStorage.setItem(LAST_CHAPTER_KEY, String(ch.id));
    router.push(`/chapter/${ch.id}`);
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-black">
        <div className="anim-blink font-pixel text-sm text-white">LOADING...</div>
      </div>
    );
  }

  /* ---------------- TITLE SCREEN ---------------- */
  if (!started) {
    return (
      <SkyScene>
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 pb-24 text-center">
          <div className="anim-pop">
            <div className="font-pixel text-[10px] text-white drop-shadow-[2px_2px_0_#000] sm:text-xs">สสวท. • ชีววิทยา ม.4 - ม.6</div>
            <h1 className="mt-3 font-pixel text-4xl text-yellow-300 drop-shadow-[6px_6px_0_#000] sm:text-6xl">BIO QUEST</h1>
            <div className="mt-3 inline-block bg-black px-4 py-2 font-thai text-lg font-bold text-white sm:text-2xl">ผจญภัยชีววิทยา 8-Bit</div>
          </div>
          <div className="flex items-end gap-6">
            <PlayerAvatar px={6} className="anim-hop" />
            <div className="q-block !h-20 !w-20 !text-3xl">?</div>
            <ProfessorAvatar px={5} />
          </div>
          <div className="rpg-box w-full max-w-md p-5 text-left">
            <label className="font-thai text-sm text-gray-300" htmlFor="pname">
              ชื่อผู้เล่น
            </label>
            <input
              id="pname"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="นักชีววิทยา"
              maxLength={20}
              className="mt-1 w-full border-4 border-white bg-black px-3 py-2 font-thai text-lg text-white outline-none focus:border-yellow-300"
            />
            <PxButton
              variant="primary"
              className="mt-4 w-full"
              onClick={() => {
                sfx.coin();
                void saveName(nameInput);
                sessionStorage.setItem(STARTED_KEY, "1");
                setStarted(true);
              }}
            >
              ▶ START GAME
            </PxButton>
          </div>
          <div className="anim-blink font-pixel text-[10px] text-white drop-shadow-[2px_2px_0_#000]">PRESS START</div>
        </div>
      </SkyScene>
    );
  }

  /* ---------------- WORLD MAP ---------------- */
  const world = WORLDS[worldIdx];
  const totalChapters = WORLDS.reduce((s, w) => s + w.books.reduce((a, b) => a + b.chapters.length, 0), 0);
  const cleared = Object.values(progress).filter((p) => p.bossCleared).length;

  return (
    <SkyScene bg={world.sky}>
      {/* HUD */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 font-pixel text-[10px] text-white sm:text-xs">
          <span className="bg-black/70 px-3 py-2 font-thai text-sm font-bold">👤 {name}</span>
          <span className="bg-black/70 px-3 py-2">👑 {cleared}/{totalChapters}</span>
          <span className="hidden bg-black/70 px-3 py-2 font-thai text-xs sm:inline">▶ กำลังเรียน {started} บท</span>
        </div>
        <div className="flex gap-2">
          <PxButton
            thai
            className="!px-3 !py-2 !text-xs"
            onClick={() => {
              sessionStorage.removeItem(STARTED_KEY);
              setStarted(false);
            }}
          >
            ⏏ หน้าแรก
          </PxButton>
          <PxButton
            variant="danger"
            thai
            className="!px-3 !py-2 !text-xs"
            onClick={() => {
              if (window.confirm("ล้างความคืบหน้าทั้งหมด?")) void resetAll();
            }}
          >
            ล้างเซฟ
          </PxButton>
        </div>
      </header>

      {/* เลือกระดับชั้น (World) */}
      <nav className="mx-auto mt-2 grid w-full max-w-5xl grid-cols-3 gap-3 px-4 sm:gap-5">
        {WORLDS.map((w, i) => (
          <button
            key={w.id}
            onClick={() => {
              sfx.blip();
              setWorldIdx(i);
            }}
            className={`px-border px-2 py-3 text-center transition-transform ${i === worldIdx ? "-translate-y-1 text-black" : "bg-black/70 text-white hover:bg-black/90"}`}
            style={i === worldIdx ? { background: w.color } : undefined}
          >
            <div className="font-pixel text-[9px] sm:text-[10px]">WORLD {w.id}</div>
            <div className="font-thai text-lg font-bold sm:text-2xl">{w.grade}</div>
            <div className="hidden font-thai text-xs sm:block">{w.gradeFull}</div>
          </button>
        ))}
      </nav>

      {/* หนังสือ + บท */}
      <main className="mx-auto mt-8 w-full max-w-5xl flex-1 space-y-8 px-4 pb-28">
        {world.books.map((book) => (
          <section key={book.id} className="nes-container is-dark with-title !bg-black/75">
            <p className="title font-thai !text-base !font-bold">
              📕 เล่ม {book.id}: {book.title}
            </p>
            <div className="map-path flex flex-wrap items-start justify-center gap-x-6 gap-y-14 pt-14 sm:justify-start">
              {book.chapters.map((ch) => (
                <ChapterNode
                  key={ch.id}
                  ch={ch}
                  available={isChapterAvailable(ch.id)}
                  progress={progress[ch.id]}
                  hasAvatar={ch.id === lastChapter}
                  onClick={() => openChapter(ch)}
                />
              ))}
            </div>
          </section>
        ))}

        {/* คำอธิบายสัญลักษณ์ */}
        <div className="flex flex-wrap justify-center gap-3 bg-black/70 px-4 py-3 text-center font-thai text-xs text-white">
          <span>🟨 พร้อมเล่น</span>
          <span>🟩 ผ่านบอสแล้ว 👑</span>
          <span>▮▮▮▮ = ความคืบหน้า 4 ส่วน</span>
          <span className="text-yellow-300">
            ✅ เนื้อหาครบทั้ง {totalChapters} บท (ข้อสอบรวม {(totalChapters * 20).toLocaleString()} ข้อ)
          </span>
        </div>
      </main>

      {/* Popup บทที่ยังไม่มีเนื้อหา */}
      {comingSoon && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4" onClick={() => setComingSoon(null)}>
          <div className="rpg-box anim-pop w-full max-w-md p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl">🚧</div>
            <div className="mt-3 font-pixel text-[10px] text-yellow-300">COMING SOON</div>
            <div className="mt-2 font-thai text-lg font-bold">
              บทที่ {comingSoon.id}: {comingSoon.title}
            </div>
            <p className="mt-3 font-thai text-sm text-gray-300">
              ด่านนี้ยังสร้างไม่เสร็จ! ลองเล่นบทต้นแบบ <b className="text-yellow-300">บทที่ 11 การสังเคราะห์ด้วยแสง</b> (ม.5 เล่ม 3) ก่อนนะ
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <PxButton thai onClick={() => setComingSoon(null)}>
                ปิด
              </PxButton>
              <PxButton
                variant="success"
                thai
                onClick={() => {
                  setComingSoon(null);
                  localStorage.setItem(LAST_CHAPTER_KEY, "11");
                  router.push("/chapter/11");
                }}
              >
                ไปบทที่ 11 ➔
              </PxButton>
            </div>
          </div>
        </div>
      )}
    </SkyScene>
  );
}

/* ---------- โหนดบทบนแผนที่ ---------- */
function ChapterNode({ ch, available, progress, hasAvatar, onClick }: { ch: ChapterMeta; available: boolean; progress?: ChapterProgress; hasAvatar: boolean; onClick: () => void }) {
  const stage = progress?.stage ?? (available ? 1 : 0);
  const done = progress?.bossCleared ?? false;
  const sectionsDone = done ? 4 : Math.max(0, stage - 1);

  return (
    <div className="relative flex w-[104px] flex-col items-center sm:w-[120px]">
      {hasAvatar && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2">
          <PlayerAvatar px={3} className="anim-hop" />
        </div>
      )}
      <button
        onClick={onClick}
        title={ch.title}
        className={`px-border relative grid h-16 w-16 place-items-center transition-transform hover:scale-105 ${
          done ? "bg-green-500" : available ? "bg-yellow-400 q-glow-soft" : "bg-gray-600"
        }`}
      >
        <span className={`text-2xl ${available ? "" : "opacity-50 grayscale"}`}>{ch.emoji}</span>
        <span className="absolute -left-3 -top-3 bg-black px-1 font-pixel text-[9px] text-white">{ch.id}</span>
        {done && <span className="absolute -right-3 -top-4 text-xl">👑</span>}
        {!available && <span className="absolute -bottom-2 -right-2 text-base">🚧</span>}
      </button>
      {/* ความคืบหน้า 4 Section */}
      <div className="mt-2 flex gap-[3px]">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={`h-2 w-4 border border-black ${n <= sectionsDone ? "bg-yellow-300" : "bg-white/25"}`} />
        ))}
      </div>
      <div className={`mt-2 text-center font-thai text-[11px] leading-tight sm:text-xs ${available ? "text-white" : "text-gray-400"}`}>{ch.title}</div>
      {available && !done && <div className="anim-blink mt-1 font-pixel text-[8px] text-yellow-300">PLAY!</div>}
    </div>
  );
}
