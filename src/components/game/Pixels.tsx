"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { sfx } from "@/lib/sfx";

/* ---------- ปุ่มพิกเซล ---------- */
type BtnVariant = "default" | "primary" | "success" | "danger" | "warning";
interface PxButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  thai?: boolean;
  children: ReactNode;
}
export function PxButton({ variant = "default", thai = false, children, onClick, className = "", ...rest }: PxButtonProps) {
  const v = variant === "default" ? "" : `px-btn-${variant}`;
  return (
    <button
      {...rest}
      className={`px-btn ${v} ${thai ? "px-btn-thai" : ""} ${className}`}
      onClick={(e) => {
        sfx.blip();
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}

/* ---------- หัวใจ HP ---------- */
export function Hearts({ hp, max, label }: { hp: number; max: number; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="font-pixel text-[10px] text-white">{label}</span>}
      <div className="flex gap-1 text-2xl leading-none">
        {Array.from({ length: max }).map((_, i) => (
          <span key={i} className={i < hp ? "drop-shadow-[2px_2px_0_#000]" : "opacity-30 grayscale"}>
            {i < hp ? "❤️" : "🖤"}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- หลอด HP ---------- */
export function HpBar({ hp, max, color }: { hp: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));
  return (
    <div className="hp-bar w-full">
      <div style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/* ---------- ตัวละครผู้เล่น (พิกเซลด้วย CSS grid) ---------- */
const PLAYER_SPRITE = [
  "....RRRRR...",
  "...RRRRRRRRR",
  "...SSSKKS...",
  "..SKSKKKSKS.",
  "..SKSSKKKSSS",
  "..SSKKKKSSSS",
  "....SSSSSS..",
  "...RRBRRR...",
  "..RRRBRRBRR.",
  ".RRRRBBBBRRR",
  ".SSRBYBBYBSS",
  ".SSSBBBBBBSS",
  "..BBBBBBBB..",
  ".BBB....BBB.",
  ".KKK....KKK.",
  "KKKK....KKKK",
];
const PLAYER_COLORS: Record<string, string> = {
  R: "#00a844",
  S: "#fcbcb0",
  K: "#4a2800",
  B: "#0058f8",
  Y: "#f8d800",
};

/* ---------- ศาสตราจารย์ NPC ---------- */
const PROF_SPRITE = [
  "....WWWWW...",
  "...WWWWWWW..",
  "..WWSSSSSWW.",
  "..WSSSSSSSW.",
  "..SSGGSGGSS.",
  "..SSKKSKKSS.",
  "..SSSSSSSSS.",
  "..SSSWWWSSS.",
  "...SWWWWWS..",
  "....WWWWW...",
  "..CCCCCCCCC.",
  ".CCCCTTTCCCC",
  ".CSCCTTTCCSC",
  ".CSCCCCCCCSC",
  "..CCCCCCCCC.",
  "..KKK...KKK.",
];
const PROF_COLORS: Record<string, string> = {
  W: "#ffffff",
  S: "#fcbcb0",
  G: "#00a800",
  K: "#000000",
  C: "#e6e6e6",
  T: "#0058f8",
};

export function Sprite({ rows, colors, px = 4, className = "" }: { rows: string[]; colors: Record<string, string>; px?: number; className?: string }) {
  const w = rows[0].length;
  const h = rows.length;
  // สร้าง box-shadow พิกเซลทีละจุด
  const shadows: string[] = [];
  rows.forEach((row, y) => {
    row.split("").forEach((ch, x) => {
      const c = colors[ch];
      if (c) shadows.push(`${x * px}px ${y * px}px 0 0 ${c}`);
    });
  });
  return (
    <div className={className} style={{ width: w * px, height: h * px, position: "relative" }} aria-hidden>
      <div style={{ width: px, height: px, boxShadow: shadows.join(","), position: "absolute", top: 0, left: 0 }} />
    </div>
  );
}

export function PlayerAvatar({ px = 4, className = "" }: { px?: number; className?: string }) {
  return <Sprite rows={PLAYER_SPRITE} colors={PLAYER_COLORS} px={px} className={className} />;
}
export function ProfessorAvatar({ px = 5, className = "" }: { px?: number; className?: string }) {
  return <Sprite rows={PROF_SPRITE} colors={PROF_COLORS} px={px} className={className} />;
}

/* ---------- ท้องฟ้า + เมฆ + พื้นอิฐ (ฉากหลังมาตรฐาน) ---------- */
export function SkyScene({ children, bg = "#5c94fc" }: { children: ReactNode; bg?: string }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: bg }}>
      <div className="px-cloud" style={{ top: "8%", animationDuration: "40s" }} />
      <div className="px-cloud" style={{ top: "22%", animationDuration: "55s", animationDelay: "-20s" }} />
      <div className="px-cloud" style={{ top: "40%", animationDuration: "48s", animationDelay: "-35s" }} />
      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
      <div className="brick-ground absolute bottom-0 left-0 right-0 h-16" />
    </div>
  );
}
