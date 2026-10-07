import type { EnglishPack } from "./types";
import { pack1 } from "./pack1";
import { pack2 } from "./pack2";
import { pack3 } from "./pack3";
import { pack4 } from "./pack4";
import { pack5 } from "./pack5";
import { pack6 } from "./pack6";
import { pack7 } from "./pack7";
import { pack8 } from "./pack8";
import { pack9 } from "./pack9";
import { pack10 } from "./pack10";
import { pack11 } from "./pack11";
import { pack12 } from "./pack12";
import { pack13 } from "./pack13";

const ALL: Record<number, EnglishPack> = { ...pack1, ...pack2, ...pack3, ...pack4, ...pack5, ...pack6, ...pack7, ...pack8, ...pack9, ...pack10, ...pack11, ...pack12, ...pack13 };

export function getEnglishPack(chapterId: number): EnglishPack | null {
  return ALL[chapterId] ?? null;
}

export type { EnglishPack } from "./types";
