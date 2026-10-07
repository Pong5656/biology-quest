"use client";

/**
 * ปุ่มบังคับบนจอ — ผูก pointer event แบบ non-passive โดยตรง
 * เพื่อให้กดแล้วตัวละครขยับในเฟรมถัดไปทันที (ไม่ผ่าน click delay ของเบราว์เซอร์)
 */
import { useEffect, useRef } from "react";

interface Props {
  onLeft: (down: boolean) => void;
  onRight: (down: boolean) => void;
  onJump: (down: boolean) => void;
}

function bindHold(el: HTMLButtonElement, setDown: (down: boolean) => void) {
  const down = (e: PointerEvent) => {
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    setDown(true);
  };
  const up = (e: PointerEvent) => {
    e.preventDefault();
    setDown(false);
  };
  el.addEventListener("pointerdown", down, { passive: false });
  el.addEventListener("pointerup", up, { passive: false });
  el.addEventListener("pointercancel", up, { passive: false });
  el.addEventListener("lostpointercapture", up);
  return () => {
    el.removeEventListener("pointerdown", down);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", up);
    el.removeEventListener("lostpointercapture", up);
  };
}

export default function TouchPad({ onLeft, onRight, onJump }: Props) {
  const leftRef = useRef<HTMLButtonElement>(null);
  const rightRef = useRef<HTMLButtonElement>(null);
  const jumpRef = useRef<HTMLButtonElement>(null);
  const cb = useRef({ onLeft, onRight, onJump });
  cb.current = { onLeft, onRight, onJump };

  useEffect(() => {
    const clean: Array<() => void> = [];
    if (leftRef.current) clean.push(bindHold(leftRef.current, (d) => cb.current.onLeft(d)));
    if (rightRef.current) clean.push(bindHold(rightRef.current, (d) => cb.current.onRight(d)));
    if (jumpRef.current) clean.push(bindHold(jumpRef.current, (d) => cb.current.onJump(d)));
    return () => clean.forEach((fn) => fn());
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
      <div className="pointer-events-auto mx-auto flex max-w-xl items-end justify-between">
        <div className="flex gap-3">
          <button ref={leftRef} type="button" aria-label="left" className="touch-btn h-[72px] w-[72px] bg-[#2a2a2a] text-2xl">
            ◀
          </button>
          <button ref={rightRef} type="button" aria-label="right" className="touch-btn h-[72px] w-[72px] bg-[#2a2a2a] text-2xl">
            ▶
          </button>
        </div>
        <button ref={jumpRef} type="button" aria-label="jump" className="touch-btn h-[84px] w-[84px] rounded-full bg-[#e40058] text-xl">
          A
        </button>
      </div>
    </div>
  );
}
