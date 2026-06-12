import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FileText, ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LessonPlayer } from "@/components/lessons/lesson-player";

function contentToHtml(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export default async function LessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: { chapter: { select: { id: true, title: true } } },
  });

  if (!lesson) notFound();

  const html = contentToHtml(lesson.contentJson);

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {lesson.chapter.title}
      </Link>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <LessonPlayer videoUrl={lesson.videoUrl} />
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="text-text-secondary">{lesson.description}</p>
            )}
          </div>
        </div>

        <div className="glow-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-text-primary">
              Treść lekcji
            </h2>
          </div>
          {html ? (
            <div
              className="lesson-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="text-text-secondary">
              Treść tej lekcji nie została jeszcze dodana.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
