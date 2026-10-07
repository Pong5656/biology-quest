import { c, k, q, s } from "../chapters/kit";
import type { ExamQuestion, KeywordQuestion, SummaryBoardData, TheorySlide } from "../types";
import type { EnglishPack } from "./types";
import { lines } from "./lines";

export const card = c;
export const slide = s;
export const key = k;
export const ask = (
  question: string,
  choices: [string, string, string, string],
  answer: 0 | 1 | 2 | 3,
  explanation: string,
  hint: string,
): ExamQuestion => q(question, choices, answer, explanation, hint);

export function lesson(input: {
  bossName: string;
  bossTitle: string;
  bossTaunt: string;
  intro: string;
  equation?: string;
  cards: SummaryBoardData["cards"];
  slides: TheorySlide[];
  keywords: KeywordQuestion[];
  questions: ExamQuestion[];
}): EnglishPack {
  return {
    bossName: input.bossName,
    bossTitle: input.bossTitle,
    bossTaunt: input.bossTaunt,
    summary: { intro: input.intro, equation: input.equation, cards: input.cards },
    slides: input.slides,
    keywords: input.keywords,
    questions: input.questions,
  };
}

export function shell(
  bossName: string,
  bossTitle: string,
  bossTaunt: string,
  intro: string,
  equation: string,
  slides: [string, string][],
  keys: [string, string, [string, string, string], 0 | 1 | 2, string][],
  questions: string[],
): EnglishPack {
  return lesson({
    bossName,
    bossTitle,
    bossTaunt,
    intro,
    equation,
    cards: [
      card("📘", "Core claim", [intro]),
      card("🧪", "How to reason", ["Name the compartment first", "Track the gradient or the control", "Net is not the same as gross"]),
      card("⚠️", "Classic traps", ["A label is not a mechanism", "Correlation is not a fair test", "Direction of flow depends on source and sink"]),
      card("🎯", "On the exam", ["Predict the immediate change", "Then predict the delayed change", "State what would falsify the claim"]),
    ],
    slides: slides.map(([title, text]) => slide(title, text, "📘")),
    keywords: keys.map(([keyword, question, choices, answer, explanation]) => key(keyword, question, choices, answer, explanation)),
    questions: lines(questions),
  });
}
