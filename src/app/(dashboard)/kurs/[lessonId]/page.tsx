import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  LessonView,
  type LessonTimestamp,
  type LessonQuiz,
} from "@/components/lessons/lesson-view";

function contentToHtml(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function parseTimestamps(value: unknown): LessonTimestamp[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (t): t is LessonTimestamp =>
        !!t &&
        typeof t === "object" &&
        typeof (t as LessonTimestamp).time === "number" &&
        typeof (t as LessonTimestamp).elementId === "string"
    )
    .sort((a, b) => a.time - b.time);
}

function parseQuizzes(value: unknown): LessonQuiz[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (q): q is LessonQuiz =>
        !!q &&
        typeof q === "object" &&
        typeof (q as LessonQuiz).triggersAt === "number" &&
        typeof (q as LessonQuiz).question === "string" &&
        Array.isArray((q as LessonQuiz).options) &&
        typeof (q as LessonQuiz).correctIndex === "number"
    )
    .sort((a, b) => a.triggersAt - b.triggersAt);
}

export async function generateMetadata({
  params,
}: {
  params: { lessonId: string };
}): Promise<Metadata> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    select: { title: true },
  });
  return {
    title: lesson ? `${lesson.title} | Course3D` : "Lekcja | Course3D",
  };
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

  const progress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: lesson.id,
      },
    },
    select: { completed: true },
  });

  return (
    <LessonView
      lessonId={lesson.id}
      title={lesson.title}
      description={lesson.description}
      videoUrl={lesson.videoUrl}
      html={contentToHtml(lesson.contentJson)}
      chapterTitle={lesson.chapter.title}
      initialCompleted={progress?.completed ?? false}
      timestamps={parseTimestamps(lesson.timestamps)}
      quizzes={parseQuizzes(lesson.quizzes)}
    />
  );
}
