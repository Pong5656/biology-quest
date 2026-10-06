"use client";

/**
 * =====================================================================
 *  SECTION 1 : SUMMARY BOARD — กระดานภารกิจสรุปเนื้อหา 1 หน้า
 * =====================================================================
 */
import type { SummaryBoardData } from "@/data/types";
import { ProfessorAvatar, PxButton } from "@/components/game/Pixels";
import { sfx } from "@/lib/sfx";

interface Props {
  data: SummaryBoardData;
  chapterTitle: string;
  onNext: () => void;
}

export default function SummaryBoard({ data, chapterTitle, onNext }: Props) {
  return (
    <main className="mx-auto max-w-6xl px-3 py-6 sm:px-6">
      {/* กระดานไม้ */}
      <div
        className="px-border relative p-4 sm:p-6"
        style={{
          background: "repeating-linear-gradient(0deg, #8b5a2b 0px, #8b5a2b 22px, #6b4220 22px, #6b4220 24px)",
        }}
      >
        <div className="mb-5 flex flex-col items-center gap-2 text-center">
          <div className="bg-black px-3 py-1 font-pixel text-[10px] text-yellow-300">QUEST BOARD</div>
          <h1 className="font-thai text-2xl font-bold text-white drop-shadow-[3px_3px_0_#000] sm:text-3xl">📜 สรุปเนื้อหา: {chapterTitle}</h1>
        </div>

        {/* คำแนะนำจากศาสตราจารย์ */}
        <div className="mb-5 flex items-start gap-3">
          <ProfessorAvatar px={4} className="shrink-0" />
          <div className="nes-balloon from-left !m-0 flex-1 font-thai text-sm text-black sm:text-base">{data.intro}</div>
        </div>

        {/* สมการหลัก */}
        {data.equation && (
          <div className="mb-6 border-4 border-black bg-yellow-300 px-3 py-3 text-center font-thai text-base font-bold text-black shadow-[4px_4px_0_#000] sm:text-xl">
            ⭐ {data.equation}
          </div>
        )}

        {/* การ์ดหัวข้อ (กระดาษปักหมุด) */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.cards.map((card, i) => (
            <article
              key={card.title}
              className="relative border-4 border-black bg-[#fdf6e3] p-4 text-black shadow-[6px_6px_0_rgba(0,0,0,0.5)]"
              style={{ transform: `rotate(${[-1, 0.8, -0.5, 1, -0.8, 0.5][i % 6]}deg)` }}
            >
              <span className="absolute -top-3 left-1/2 h-5 w-5 -translate-x-1/2 border-2 border-black bg-red-600" />
              <h2 className="mb-2 flex items-center gap-2 border-b-4 border-dashed border-black/30 pb-2 font-thai text-lg font-bold">
                <span className="text-2xl">{card.icon}</span> {card.title}
              </h2>
              <ul className="space-y-1 font-thai text-sm leading-relaxed">
                {card.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="font-pixel text-[8px] leading-6 text-red-600">▶</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <PxButton
            variant="success"
            thai
            className="!text-lg"
            onClick={() => {
              sfx.coin();
              onNext();
            }}
          >
            เริ่มเรียน ➔
          </PxButton>
        </div>
      </div>
    </main>
  );
}
