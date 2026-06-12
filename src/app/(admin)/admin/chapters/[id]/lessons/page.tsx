import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  LessonsManager,
  type ManagedLesson,
} from "@/components/lessons/lessons-manager";

export default async function AdminLessonsPage({
  params,
}: {
  params: { id: string };
}) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: params.id },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  if (!chapter) notFound();

  const initial: ManagedLesson[] = chapter.lessons.map((l) => ({
    id: l.id,
    title: l.title,
    description: l.description,
    videoUrl: l.videoUrl,
    contentJson: l.contentJson,
    order: l.order,
  }));

  return (
    <LessonsManager
      chapterId={chapter.id}
      chapterTitle={chapter.title}
      initial={initial}
    />
  );
}
