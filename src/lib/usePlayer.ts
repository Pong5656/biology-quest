"use client";

import { useCallback, useEffect, useState } from "react";

export interface ChapterProgress {
  chapterId: number;
  stage: number; // section สูงสุดที่ปลดล็อก (1-4), 5 = ผ่านบอสแล้ว
  bossCleared: boolean;
  bestScore: number;
  attempts: number;
}

const STORAGE_KEY = "bioquest.playerId";

function getPlayerId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

/** โหลด/บันทึกข้อมูลผู้เล่นกับฐานข้อมูล (ค่าความคืบหน้าไม่มีวันลดลง) */
export function usePlayer() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [name, setName] = useState("นักชีววิทยา");
  const [coins, setCoins] = useState(0);
  const [progress, setProgress] = useState<Record<number, ChapterProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = getPlayerId();
    setPlayerId(id);
    fetch(`/api/progress?playerId=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { player?: { name?: string; coins?: number }; chapters?: ChapterProgress[] } | null) => {
        if (!data) return;
        if (data.player?.name) setName(data.player.name);
        setCoins(data.player?.coins ?? 0);
        const map: Record<number, ChapterProgress> = {};
        for (const c of data.chapters ?? []) map[c.chapterId] = c;
        setProgress(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveChapter = useCallback(
    async (chapterId: number, patch: { stage?: number; bossCleared?: boolean; score?: number; attempt?: boolean }) => {
      // optimistic update
      setProgress((prev) => {
        const cur = prev[chapterId] ?? { chapterId, stage: 1, bossCleared: false, bestScore: 0, attempts: 0 };
        return {
          ...prev,
          [chapterId]: {
            chapterId,
            stage: Math.max(cur.stage, patch.stage ?? 1),
            bossCleared: cur.bossCleared || !!patch.bossCleared,
            bestScore: Math.max(cur.bestScore, patch.score ?? 0),
            attempts: cur.attempts + (patch.attempt ? 1 : 0),
          },
        };
      });
      if (!playerId) return;
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, chapterId, ...patch }),
        });
      } catch {
        /* ออฟไลน์ยังเล่นต่อได้ */
      }
    },
    [playerId],
  );

  const saveName = useCallback(
    async (newName: string) => {
      const n = newName.trim().slice(0, 20) || "นักชีววิทยา";
      setName(n);
      if (!playerId) return;
      try {
        await fetch("/api/player", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, name: n }),
        });
      } catch {
        /* ignore */
      }
    },
    [playerId],
  );

  /** บันทึกเหรียญทั้งหมดในกระเป๋า (idempotent — เรียกซ้ำได้) */
  const saveCoins = useCallback(
    async (total: number) => {
      if (!playerId) return;
      try {
        await fetch("/api/player", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, coins: total }),
        });
      } catch {
        /* ignore */
      }
    },
    [playerId],
  );

  const resetAll = useCallback(async () => {
    setProgress({});
    setCoins(0);
    if (!playerId) return;
    try {
      await fetch(`/api/progress?playerId=${encodeURIComponent(playerId)}`, { method: "DELETE" });
      await fetch("/api/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, coins: 0 }),
      });
    } catch {
      /* ignore */
    }
  }, [playerId]);

  return { playerId, name, coins, progress, loading, saveChapter, saveName, saveCoins, resetAll };
}
