"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// Skrypt wstrzykiwany do iframe treści lekcji: nasłuchuje czasu wideo z rodzica
// i podświetla element [data-ts] odpowiadający bieżącemu czasowi.
const TIMESTAMP_LISTENER = `<script>
window.addEventListener('message', function(e) {
  if (!e.data || e.data.type !== 'COURSE_TIME') return;
  var t = e.data.time;
  var els = document.querySelectorAll('[data-ts]');
  var active = null;
  els.forEach(function(el) {
    var ts = el.getAttribute('data-ts');
    var parts = ts.split(':').map(Number);
    var sec = parts.length === 2 ? parts[0]*60 + parts[1] : parts[0];
    if (t >= sec) active = el;
  });
  els.forEach(function(el) { el.classList.remove('active'); });
  if (active) {
    active.classList.add('active');
    active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
<\/script>
<style>[data-ts].active{background:rgba(168,85,247,0.18);border-left:3px solid #a855f7;padding-left:8px;border-radius:4px;box-shadow:0 0 12px rgba(168,85,247,0.25);transition:all .3s ease;}</style>`;

function injectTimestampScript(html: string): string {
  if (html.includes("</body>")) {
    return html.replace("</body>", TIMESTAMP_LISTENER + "</body>");
  }
  return html + TIMESTAMP_LISTENER;
}

// Parsuje "2:30" -> 150 sekund.
function parseTs(ts: string): number {
  const parts = ts.split(":").map(Number);
  return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0];
}

// Wyciąga posortowane wartości data-ts (w sekundach) z surowego HTML.
function extractDataTs(html: string): number[] {
  const matches = Array.from(html.matchAll(/data-ts=["']([^"']+)["']/g));
  return matches.map((m) => parseTs(m[1])).sort((a, b) => a - b);
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [cursorPercent, setCursorPercent] = useState(0);

  const [completed, setCompleted] = useState(initialCompleted);
  const [saving, setSaving] = useState(false);
  const [nav, setNav] = useState<{ prev: NavLesson | null; next: NavLesson | null }>({
    prev: null,
    next: null,
  });

  const enrichedHtml = useMemo(
    () => (html ? injectTimestampScript(html) : ""),
    [html]
  );
  const dataTsList = useMemo(() => extractDataTs(html || ""), [html]);

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
      // Wyślij czas do iframe treści lekcji (synchronizacja [data-ts]).
      iframeRef.current?.contentWindow?.postMessage(
        { type: "COURSE_TIME", time: currentTime },
        "*"
      );

      // Pasek kursora: pozycja na podstawie indeksu aktywnego data-ts.
      if (dataTsList.length > 0) {
        let activeIdx = -1;
        for (let i = 0; i < dataTsList.length; i++) {
          if (currentTime >= dataTsList[i]) activeIdx = i;
          else break;
        }
        const pct =
          activeIdx < 0
            ? 0
            : dataTsList.length === 1
              ? 100
              : (activeIdx / (dataTsList.length - 1)) * 100;
        setCursorPercent(pct);
      }

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
    [timestamps, quizzes, activeElementId, activeQuiz, dataTsList]
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
    <div className="flex h-[calc(100vh-56px)] flex-col">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-4 py-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {chapterTitle}
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-sm font-medium text-text-primary truncate">{title}</span>
      </div>

      {/* Split screen — pełna szerokość */}
      <div className="grid flex-1 overflow-hidden lg:grid-cols-2">
        {/* Lewa strona: wideo + info + przyciski */}
        <div className="flex flex-col overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <LessonPlayer
            videoUrl={videoUrl}
            videoRef={videoRef}
            onTimeUpdate={handleTimeUpdate}
          />
          <div className="flex-1 space-y-4 p-4">
            <div>
              <h1 className="text-xl font-bold text-text-primary">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-text-secondary">{description}</p>
              )}
            </div>

            {/* Przyciski postępu i nawigacji */}
            <div className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
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
                    Poprzednia
                  </Link>
                ) : (
                  <span />
                )}
                {nav.next && (
                  <Link
                    href={`/kurs/${nav.next.id}`}
                    className="glow-btn inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white"
                  >
                    Następna
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Prawa strona: treść lekcji w iframe (obsługuje JS, CSS, animacje) */}
        <div className="relative flex overflow-hidden bg-[var(--bg-base)]">
          {html ? (
            <>
              {/* Pionowy pasek kursora wskazujący bieżącą sekcję */}
              {dataTsList.length > 0 && (
                <div className="relative w-6 flex-shrink-0 bg-[var(--bg-elevated)]">
                  <div
                    className="absolute left-0 w-6 transition-all duration-300"
                    style={{ top: `${cursorPercent}%` }}
                  >
                    <div className="ml-1 h-3 w-3 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]" />
                  </div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                srcDoc={enrichedHtml}
                className="h-full w-full flex-1 border-0"
                sandbox="allow-scripts allow-same-origin"
                title="Treść lekcji"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-text-secondary">
              <div>
                <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>Treść tej lekcji nie została jeszcze dodana.</p>
              </div>
            </div>
          )}

          {/* Quiz overlay nad iframe */}
          {activeQuiz && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--bg-card)]/95 p-6 backdrop-blur-sm">
              <QuizCard
                quiz={activeQuiz}
                answer={quizAnswer}
                onAnswer={setQuizAnswer}
                onContinue={closeQuiz}
              />
            </div>
          )}
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
