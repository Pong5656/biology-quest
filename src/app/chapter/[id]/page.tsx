import { notFound } from "next/navigation";
import { findChapterMeta } from "@/data/curriculum";
import ChapterFlow from "@/components/chapter/ChapterFlow";

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chapterId = Number(id);
  if (!Number.isInteger(chapterId) || !findChapterMeta(chapterId)) notFound();
  return <ChapterFlow chapterId={chapterId} />;
}
