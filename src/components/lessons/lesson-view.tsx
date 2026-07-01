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
  Star,
} from "lucide-react";
import { LessonPlayer } from "@/components/lessons/lesson-player";
import { LessonNotes } from "@/components/lessons/lesson-notes";
import { useToast } from "@/lib/toast";
import { broadcastProgressUpdate } from "@/lib/use-progress";
import { cn } from "@/lib/utils";
import { injectDarkBackground } from "@/lib/inject-dark-bg";
import { CopyLinkButton } from "@/components/shared/copy-link-button";

interface NavLesson {
  id: string;
  title: string;
}

export interface LessonTimestamp {
  time: number;
  elementId: string;
}

// Skrypt wstrzykiwany do iframe: rysuje fioletowy kursor, który PŁYNNIE
// przechodzi (interpolacja po offsetTop) między kolejnymi sekcjami treści w
// zależności od czasu wideo, oraz podświetla aktualną sekcję.
function buildCursorScript(timestamps: LessonTimestamp[]): string {
  const data = JSON.stringify(timestamps ?? []);
  return `<style>
    body{position:relative;padding-left:16px !important;}
    #__ts_cursor{position:absolute;left:2px;width:3px;border-radius:2px;background:#9d6bff;box-shadow:0 0 8px rgba(157,107,255,.7);transition:top .28s linear,height .28s linear;z-index:99999;}
    .__ts_active{background:rgba(157,107,255,.10);border-radius:6px;transition:background .3s ease;}
  </style>
  <script>(function(){
    var TS=${data};
    if(!TS.length)return;
    var cur=document.createElement('div');cur.id='__ts_cursor';cur.style.top='0px';cur.style.height='24px';
    function attach(){if(document.body)document.body.appendChild(cur);}
    if(document.body)attach();else document.addEventListener('DOMContentLoaded',attach);
    function box(id){var el=document.getElementById(id);if(!el)return null;return {top:el.offsetTop,h:el.offsetHeight,el:el};}
    function hl(el){var a=document.querySelectorAll('.__ts_active');for(var i=0;i<a.length;i++)a[i].classList.remove('__ts_active');if(el)el.classList.add('__ts_active');}
    function update(t){
      var i=-1;for(var k=0;k<TS.length;k++){if(t>=TS[k].time)i=k;else break;}
      if(i<0){var f=box(TS[0].elementId);if(f){cur.style.top=f.top+'px';cur.style.height=f.h+'px';}return;}
      var c=box(TS[i].elementId);if(!c)return;
      var nt=TS[i+1];
      if(!nt){cur.style.top=c.top+'px';cur.style.height=c.h+'px';hl(c.el);return;}
      var n=box(nt.elementId);if(!n){cur.style.top=c.top+'px';cur.style.height=c.h+'px';hl(c.el);return;}
      var dur=nt.time-TS[i].time;var p=dur>0?Math.min(1,Math.max(0,(t-TS[i].time)/dur)):0;
      cur.style.top=(c.top+(n.top-c.top)*p)+'px';
      cur.style.height=(c.h+(n.h-c.h)*p)+'px';
      var active=p<0.5?c.el:n.el;hl(active);
      try{active.scrollIntoView({behavior:'smooth',block:'nearest'});}catch(e){}
    }
    window.addEventListener('message',function(e){if(e.data&&e.data.type==='COURSE_TIME')update(e.data.time);});
  })();<\/script>`;
}

function injectCursor(html: string, timestamps: LessonTimestamp[]): string {
  const s = buildCursorScript(timestamps);
  if (html.includes("</body>")) return html.replace("</body>", s + "</body>");
  return html + s;
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
  extraDescription: string | null;
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
  extraDescription,
  videoUrl,
  html,
  chapterTitle,
  initialCompleted,
  timestamps,
  quizzes,
}: LessonViewProps) {
  const toast = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [completed, setCompleted] = useState(initialCompleted);
  const [saving, setSaving] = useState(false);
  const [nav, setNav] = useState<{ prev: NavLesson | null; next: NavLesson | null }>({
    prev: null,
    next: null,
  });
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  const enrichedHtml = useMemo(() => {
    if (!html) return "";
    // Wstrzykuj ciemne tło tylko jeśli HTML nie ma już naszych ciemnych stylów.
    const base = html.includes("background: #0a0a")
      ? html
      : injectDarkBackground(html);
    return injectCursor(base, timestamps);
  }, [html, timestamps]);

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
      if (next) {
        setRating(0);
        setShowRating(true);
      } else {
        toast.success("Oznaczenie cofnięte");
      }
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
      // Wyślij czas do iframe treści lekcji — kursor interpoluje pozycję.
      iframeRef.current?.contentWindow?.postMessage(
        { type: "COURSE_TIME", time: currentTime },
        "*"
      );

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
    [quizzes, activeQuiz]
  );

  const closeQuiz = useCallback(() => {
    setActiveQuiz(null);
    setQuizAnswer(null);
    videoRef.current?.play().catch(() => {});
  }, []);

  async function submitRating(stars: number) {
    setShowRating(false);
    toast.success("Lekcja oznaczona jako ukończona ✓");
    if (stars > 0) {
      await fetch(`/api/lessons/${lessonId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: stars }),
      }).catch(() => {});
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      {/* Rating modal */}
      {showRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glow-card w-full max-w-sm space-y-5 p-7 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Lekcja ukończona!</h3>
            <p className="text-sm text-[var(--text-secondary)]">Jak oceniasz tę lekcję?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn("h-8 w-8", s <= rating ? "fill-yellow-400 text-yellow-400" : "text-[var(--text-muted)]")}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void submitRating(0)}
                className="flex-1 rounded-[8px] border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              >
                Pomiń
              </button>
              <button
                type="button"
                disabled={rating === 0}
                onClick={() => void submitRating(rating)}
                className="flex-1 rounded-[8px] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Wyślij ocenę
              </button>
            </div>
          </div>
        </div>
      )}

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
        <CopyLinkButton
          path={`/kurs/${lessonId}`}
          className="ml-auto flex items-center gap-1.5 rounded-md border border-[var(--border-subtle)] px-2.5 py-1 text-xs text-text-secondary transition-colors hover:border-[var(--accent)] hover:text-text-primary"
          label="Kopiuj link do lekcji"
        />
      </div>

      {/* Split screen — pełna szerokość */}
      <div className="grid flex-1 overflow-hidden lg:grid-cols-2">
        {/* Lewa strona: wideo + info + przyciski */}
        <div className="flex flex-col overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <div className="px-2 pt-2">
            <LessonPlayer
              videoUrl={videoUrl}
              videoRef={videoRef}
              onTimeUpdate={handleTimeUpdate}
            />
          </div>
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

            <LessonNotes lessonId={lessonId} />

            {extraDescription && (
              <div
                className="lesson-content border-t border-[var(--border-subtle)] pt-4"
                dangerouslySetInnerHTML={{ __html: extraDescription }}
              />
            )}
          </div>
        </div>

        {/* Prawa strona: treść lekcji w iframe (obsługuje JS, CSS, animacje) */}
        <div className="relative flex overflow-hidden bg-[var(--bg-base)]">
          {html ? (
            <iframe
              ref={iframeRef}
              srcDoc={enrichedHtml}
              className="h-full w-full flex-1 border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Treść lekcji"
            />
          ) : (
            <div className="flex h-full w-full flex-1 items-center justify-center p-8 text-center text-text-secondary">
              <div className="flex flex-col items-center">
                <FileText className="mb-3 h-10 w-10 opacity-40" />
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
