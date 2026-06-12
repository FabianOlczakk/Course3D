import { prisma } from "@/lib/prisma";
import {
  ChaptersManager,
  type ManagedChapter,
} from "@/components/chapters/chapters-manager";

export default async function AdminChaptersPage() {
  const chaptersRaw = await prisma.chapter.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { lessons: true } } },
  });

  const initial: ManagedChapter[] = chaptersRaw.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    iconUrl: c.iconUrl,
    order: c.order,
    lessonCount: c._count.lessons,
  }));

  return <ChaptersManager initial={initial} />;
}
