"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { LessonPlayer } from "@/components/lessons/lesson-player";
import { useToast } from "@/lib/toast";
import { broadcastProgressUpdate } from "@/lib/use-progress";
import { cn } from "@/lib/utils";

interface NavLesson {
  id: string;
  title: string;
}

export interface LessonTimestamp {
  time: number;
  elementId: string;
}

export interface LessonQuiz {
  triggersAt: number;
  question: string;
  options: string[];
  correctIndex: number;
}

interface LessonViewProps {
  lessonId: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  html: string;
  chapterTitle: string;
  initialCompleted: boolean;
  timestamps: LessonTimestamp[];
  quizzes: LessonQuiz[];
}

export function LessonView({
  lessonId,
  title,
  description,
  videoUrl,
  html,
  chapterTitle,
  initialCompleted,
  timestamps,
  quizzes,
}: LessonViewProps) {
  const toast = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [completed, setCompleted] = useState(initialCompleted);
  const [saving, setSaving] = useState(false);
  const [nav, setNav] = useState<{ prev: NavLesson | null; next: NavLesson | null }>({
    prev: null,
    next: null,
  });

  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const shownQuizzes = useRef<Set<number>>(new Set());
  const [activeQuiz, setActiveQuiz] = useState<LessonQuiz | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  // Pobierz nawigację prev/next.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/lessons/${lessonId}/navigation`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !cancelled) setNav(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const toggleComplete = useCallback(async () => {
    if (saving) return;
    const next = !completed;
    setSaving(true);
    try {
      const res = await fetch(`/api/progress/${lessonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: next }),
      });
      if (!res.ok) throw new Error();
      setCompleted(next);
      broadcastProgressUpdate();
      toast.success(
        next ? "Lekcja oznaczona jako ukończona ✓" : "Oznaczenie cofnięte"
      );
    } catch {
      toast.error("Nie udało się zapisać postępu.");
    } finally {
      setSaving(false);
    }
  }, [completed, lessonId, saving, toast]);

  // Skróty klawiszowe: strzałki lewo/prawo (poza polami tekstowymi).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (activeQuiz) return;
      if (e.key === "ArrowRight" && nav.next) {
        window.location.href = `/kurs/${nav.next.id}`;
      } else if (e.key === "ArrowLeft" && nav.prev) {
        window.location.href = `/kurs/${nav.prev.id}`;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav, activeQuiz]);

  // Synchronizacja czasu wideo: podświetlanie elementów i quizy.
  const handleTimeUpdate = useCallback(
    (currentTime: number) => {
      // Timestamps — znajdź ostatni element, którego czas już minął.
      if (timestamps.length > 0) {
        let current: LessonTimestamp | null = null;
        for (const t of timestamps) {
          if (currentTime >= t.time) current = t;
          else break;
        }
        if (current && current.elementId !== activeElementId) {
          setActiveElementId(current.elementId);
        }
      }

      // Quizy — auto-pauza przy osiągnięciu triggersAt.
      if (quizzes.length > 0 && !activeQuiz) {
        const idx = quizzes.findIndex(
          (q) => currentTime >= q.triggersAt && !shownQuizzes.current.has(q.triggersAt)
        );
        if (idx !== -1) {
          const q = quizzes[idx];
          shownQuizzes.current.add(q.triggersAt);
          videoRef.current?.pause();
          setActiveQuiz(q);
          setQuizAnswer(null);
        }
      }
    },
    [timestamps, quizzes, activeElementId, activeQuiz]
  );

  // Zastosuj podświetlenie do aktywnego elementu w panelu treści.
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    root
      .querySelectorAll(".lesson-highlight")
      .forEach((el) => el.classList.remove("lesson-highlight"));
    if (activeElementId) {
      const el = root.querySelector(`#${CSS.escape(activeElementId)}`);
      if (el) {
        el.classList.add("lesson-highlight");
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeElementId]);

  const closeQuiz = useCallback(() => {
    setActiveQuiz(null);
    setQuizAnswer(null);
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {chapterTitle}
      </Link>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <LessonPlayer
            videoUrl={videoUrl}
            videoRef={videoRef}
            onTimeUpdate={handleTimeUpdate}
          />
          <div>
            <h1 className="text-xl font-bold text-text-primary">{title}</h1>
            {description && (
              <p className="text-text-secondary">{description}</p>
            )}
          </div>
        </div>

        <div className="glow-card relative p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-text-primary">
              Treść lekcji
            </h2>
          </div>

          {html ? (
            <div
              ref={contentRef}
              className="lesson-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="text-text-secondary">
              Treść tej lekcji nie została jeszcze dodana.
            </p>
          )}

          {/* Quiz overlay */}
          {activeQuiz && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-[var(--bg-card)]/95 p-6 backdrop-blur-sm">
              <QuizCard
                quiz={activeQuiz}
                answer={quizAnswer}
                onAnswer={setQuizAnswer}
                onContinue={closeQuiz}
              />
            </div>
          )}

          {/* Przyciski postępu i nawigacji */}
          <div className="mt-6 space-y-4 border-t border-[var(--border-subtle)] pt-4">
            <button
              type="button"
              onClick={toggleComplete}
              disabled={saving}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-60",
                completed
                  ? "border border-green-500/50 bg-green-500/15 text-green-300 shadow-[0_0_12px_rgba(74,222,128,0.25)]"
                  : "bg-green-600 text-white hover:bg-green-500"
              )}
            >
              <Check className="h-4 w-4" />
              {completed ? "Ukończono" : "Oznacz jako ukończone"}
            </button>

            <div className="flex items-center justify-between gap-2">
              {nav.prev ? (
                <Link
                  href={`/kurs/${nav.prev.id}`}
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--border-subtle)] px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-[var(--bg-elevated)] hover:text-text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Poprzednia lekcja
                </Link>
              ) : (
                <span />
              )}

              {nav.next && (
                <Link
                  href={`/kurs/${nav.next.id}`}
                  className="glow-btn inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white"
                >
                  Następna lekcja
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizCard({
  quiz,
  answer,
  onAnswer,
  onContinue,
}: {
  quiz: LessonQuiz;
  answer: number | null;
  onAnswer: (i: number) => void;
  onContinue: () => void;
}) {
  const answered = answer !== null;
  const correct = answer === quiz.correctIndex;

  return (
    <div className="glow-card glow-border w-full max-w-md space-y-4 p-6">
      <h3 className="text-base font-semibold text-text-primary">
        {quiz.question}
      </h3>
      <div className="space-y-2">
        {quiz.options.map((opt, i) => {
          const isChosen = answer === i;
          const isCorrect = i === quiz.correctIndex;
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => onAnswer(i)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:cursor-default",
                !answered &&
                  "border-[var(--border-subtle)] text-text-secondary hover:border-[var(--border-glow)] hover:text-text-primary",
                answered && isCorrect && "border-green-500/60 bg-green-500/15 text-green-300",
                answered &&
                  isChosen &&
                  !isCorrect &&
                  "border-red-500/60 bg-red-500/15 text-red-300",
                answered && !isChosen && !isCorrect && "border-[var(--border-subtle)] text-text-muted"
              )}
            >
              <span>{opt}</span>
              {answered && isCorrect && (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              )}
              {answered && isChosen && !isCorrect && (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="space-y-3">
          <p
            className={cn(
              "text-sm font-medium",
              correct ? "text-green-400" : "text-red-400"
            )}
          >
            {correct ? "Poprawnie ✓" : "Niepoprawnie ✗"}
          </p>
          <button
            type="button"
            onClick={onContinue}
            className="glow-btn w-full rounded-md px-4 py-2 text-sm font-medium text-white"
          >
            Kontynuuj
          </button>
        </div>
      )}
    </div>
  );
}
