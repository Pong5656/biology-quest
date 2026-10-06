/**
 * เครื่องเสียง 8-bit แบบง่าย ๆ ด้วย Web Audio API (square wave)
 * ไม่ต้องใช้ไฟล์เสียงภายนอก — ใช้ได้เฉพาะฝั่ง client
 */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** เล่นโน้ตทีละตัว [ความถี่ Hz, ระยะเวลา s] ต่อเนื่องกัน */
function playNotes(notes: [number, number][], type: OscillatorType = "square", volume = 0.08) {
  const ac = getCtx();
  if (!ac) return;
  let t = ac.currentTime;
  for (const [freq, dur] of notes) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur);
    t += dur;
  }
}

export const sfx = {
  /** เสียงกดปุ่ม / เลื่อนสไลด์ */
  blip: () => playNotes([[880, 0.06]]),
  /** เสียงกระโดดชนบล็อก */
  bump: () => playNotes([[196, 0.08], [147, 0.1]]),
  /** เสียงเหรียญ */
  coin: () => playNotes([[988, 0.08], [1319, 0.25]]),
  /** ตอบถูก */
  correct: () => playNotes([[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.25]]),
  /** ตอบผิด / โดนดาเมจ */
  wrong: () => playNotes([[220, 0.12], [185, 0.12], [147, 0.3]], "sawtooth"),
  /** ผ่านด่าน */
  clear: () =>
    playNotes([
      [392, 0.1], [523, 0.1], [659, 0.1], [784, 0.1],
      [1047, 0.1], [1319, 0.1], [1568, 0.35],
    ]),
  /** Game Over */
  gameOver: () => playNotes([[392, 0.25], [370, 0.25], [349, 0.25], [330, 0.6]]),
  /** เสียงเตือนเวลาใกล้หมด */
  tick: () => playNotes([[1200, 0.04]], "square", 0.05),
  /** บอสโดนโจมตี */
  hit: () => playNotes([[110, 0.08], [90, 0.15]], "sawtooth", 0.12),
  /** กระโดด */
  jump: () => playNotes([[330, 0.04], [520, 0.08]], "square", 0.05),
  /** เหยียบศัตรู */
  stomp: () => playNotes([[600, 0.04], [300, 0.08]], "square", 0.07),
  /** ยิงพลังงาน ATP ใส่บอส */
  fireball: () => playNotes([[1400, 0.03], [900, 0.03], [600, 0.06]], "square", 0.06),
  /** ระเบิด */
  explode: () => playNotes([[80, 0.12], [60, 0.2]], "sawtooth", 0.12),
  /** ตกหลุม */
  fall: () => playNotes([[600, 0.08], [400, 0.08], [250, 0.15]], "triangle", 0.1),
  /** ชนะบอส */
  victory: () =>
    playNotes([
      [523, 0.12], [523, 0.12], [523, 0.12], [523, 0.3],
      [415, 0.3], [466, 0.3], [523, 0.15], [466, 0.1], [523, 0.5],
    ]),
};
