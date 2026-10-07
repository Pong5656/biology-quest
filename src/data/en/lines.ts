import { ask } from "./build";
import type { ExamQuestion } from "../types";

/** One exam item: stem||A||B||C||D||index||why||hint */
export function lines(rows: string[]): ExamQuestion[] {
  return rows.map((row) => {
    const [question, a, b, c, d, ans, explanation, hint] = row.split("||");
    const answer = Number(ans) as 0 | 1 | 2 | 3;
    return ask(question!, [a!, b!, c!, d!], answer, explanation!, hint!);
  });
}
