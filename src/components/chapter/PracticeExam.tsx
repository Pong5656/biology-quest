"use client";

/**
 * แบบทดสอบทีละข้อ — โหลดคลังข้อสอบของบท ทำทีละข้อ
 * ตัวเลือกจัดความกว้างเท่ากัน เฉลยทันที พร้อมเวลาต่อข้อแบบสอบจริง
 */
import { useMemo, useState } from "react";
import type { ExamQuestion } from "@/data/types";
import { PxButton } from "@/components/game/Pixels";
import { sfx } from "@/lib/sfx";
import { useI18n } from "@/lib/i18n";
import ExamQuestionModal from "./ExamQuestionModal";

interface Props {
  title: string;
  questions: ExamQuestion[];
  onExit: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticeExam({ title, questions, onExit }: Props) {
  const { t } = useI18n();
  const deck = useMemo(() => {
    const picked = shuffle(questions).slice(0, Math.min(40, questions.length));
    return picked.map((q) => {
      const order = shuffle(q.choices.map((_, i) => i));
      return { ...q, choices: order.map((i) => q.choices[i]), answer: order.indexOf(q.answer) };
    });
  }, [questions]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(true);
  const [resolved, setResolved] = useState(false);

  if (deck.length === 0) {
    return (
      <div className="p-6 text-center font-thai text-white">
        ยังไม่มีคลังข้อสอบ
        <div className="mt-3">
          <PxButton thai onClick={onExit}>
            กลับ
          </PxButton>
        </div>
      </div>
    );
  }

  if (done) {
    const acc = Math.round((correct / deck.length) * 100);
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <div className="px-border bg-yellow-300 px-4 py-3 font-pixel text-xl text-black">PAPER CLEAR</div>
        <p className="mt-4 font-thai text-white">
          {title}
          <br />
          ถูก {correct}/{deck.length} ({acc}%)
        </p>
        <p className="mt-2 font-thai text-sm text-gray-300">แนววิเคราะห์ A-Level / สอวน. ทำทีละข้อจากคลังของบทนี้</p>
        <div className="mt-5 flex justify-center gap-2">
          <PxButton thai onClick={onExit}>
            กลับมาริโอ
          </PxButton>
        </div>
      </div>
    );
  }

  const q = deck[index];

  return (
    <div className="mx-auto max-w-3xl px-3 py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="font-thai text-sm text-white">
          แบบทดสอบทีละข้อ · {title}
        </div>
        <PxButton thai className="!px-3 !py-2 !text-xs" onClick={onExit}>
          ⬅ มาริโอ
        </PxButton>
      </div>
      <div className="mb-2 font-pixel text-[10px] text-yellow-300">
        {index + 1}/{deck.length} · ✅ {correct}
      </div>
      {open && (
        <ExamQuestionModal
          key={index}
          question={q}
          number={index + 1}
          total={deck.length}
          timeLimit={90}
          streak={0}
          coins={0}
          onSpend={() => false}
          onResolve={(r) => {
            if (!resolved && r === "correct") setCorrect((c) => c + 1);
            setResolved(true);
          }}
          onClose={() => {
            sfx.blip();
            setOpen(false);
            setResolved(false);
            if (index + 1 >= deck.length) setDone(true);
            else {
              setIndex((i) => i + 1);
              setOpen(true);
            }
          }}
        />
      )}
      {!open && <p className="font-thai text-gray-400">{t("m.go")}</p>}
    </div>
  );
}
