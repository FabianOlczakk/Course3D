"use client";

import { useEffect, useState } from "react";
import { X, ClipboardList, Loader2 } from "lucide-react";

type QuestionType = "TEXT" | "TEXTAREA" | "NUMBER" | "CHECKBOX" | "RADIO";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[] | null;
  required: boolean;
  order: number;
}

interface PendingForm {
  id: string;
  title: string;
  description?: string | null;
  allowSkip: boolean;
  questions: Question[];
}

/** Modal pokazujący kursantowi formularze, na które jeszcze nie odpowiedział. */
export function PendingFormsModal() {
  const [forms, setForms] = useState<PendingForm[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/forms/pending");
        if (!res.ok) return;
        const d = await res.json();
        if (!cancelled) setForms(d.forms ?? []);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const form = forms[index];
  if (!form) return null;

  function setAnswer(questionId: string, value: unknown) {
    setAnswers((a) => ({ ...a, [questionId]: value }));
  }

  function toggleCheckbox(questionId: string, option: string) {
    const current = (answers[questionId] as string[] | undefined) ?? [];
    const next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
    setAnswer(questionId, next);
  }

  function next() {
    setAnswers({});
    setOtherText({});
    setError(null);
    setIndex((i) => i + 1);
  }

  async function handleSubmit(skipped: boolean) {
    if (!skipped) {
      for (const q of form.questions) {
        if (!q.required) continue;
        const v = answers[q.id];
        const empty =
          v === undefined ||
          v === null ||
          v === "" ||
          (Array.isArray(v) && v.length === 0);
        if (empty) {
          setError("Uzupełnij wszystkie wymagane pola.");
          return;
        }
      }
    }
    setSubmitting(true);
    setError(null);
    try {
      const finalAnswers: Record<string, unknown> = {};
      for (const [qId, v] of Object.entries(answers)) {
        if (Array.isArray(v) && v.includes("__other__") && otherText[qId]?.trim()) {
          finalAnswers[qId] = [...v.filter((o) => o !== "__other__"), otherText[qId].trim()];
        } else if (v === "__other__" && otherText[qId]?.trim()) {
          finalAnswers[qId] = otherText[qId].trim();
        } else {
          finalAnswers[qId] = v;
        }
      }
      const res = await fetch(`/api/forms/${form.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers, skipped }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Nie udało się zapisać odpowiedzi.");
        return;
      }
      next();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glow-card w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-[var(--accent)] shrink-0" />
            <div>
              <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">{form.title}</h2>
              {form.description && <p className="text-sm text-[var(--text-muted)] mt-0.5">{form.description}</p>}
            </div>
          </div>
          {form.allowSkip && (
            <button
              onClick={() => void handleSubmit(true)}
              disabled={submitting}
              className="shrink-0 rounded-md p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              title="Pomiń"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {form.questions.map((q) => (
            <div key={q.id} className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                {q.text}
                {q.required && <span className="text-red-400 ml-1">*</span>}
              </label>

              {q.type === "TEXT" && (
                <input
                  className="input w-full"
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                />
              )}
              {q.type === "TEXTAREA" && (
                <textarea
                  className="input w-full min-h-[80px] resize-y"
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                />
              )}
              {q.type === "NUMBER" && (
                <input
                  type="number"
                  className="input w-full"
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                />
              )}
              {q.type === "RADIO" && (
                <div className="space-y-1.5">
                  {(q.options ?? []).map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === opt}
                        onChange={() => setAnswer(q.id, opt)}
                      />
                      {opt === "__other__" ? "Inne" : opt}
                    </label>
                  ))}
                  {answers[q.id] === "__other__" && (
                    <input
                      className="input w-full mt-1"
                      placeholder="Wpisz odpowiedź..."
                      value={otherText[q.id] ?? ""}
                      onChange={(e) => setOtherText((t) => ({ ...t, [q.id]: e.target.value }))}
                    />
                  )}
                </div>
              )}
              {q.type === "CHECKBOX" && (
                <div className="space-y-1.5">
                  {(q.options ?? []).map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <input
                        type="checkbox"
                        checked={((answers[q.id] as string[] | undefined) ?? []).includes(opt)}
                        onChange={() => toggleCheckbox(q.id, opt)}
                      />
                      {opt === "__other__" ? "Inne" : opt}
                    </label>
                  ))}
                  {((answers[q.id] as string[] | undefined) ?? []).includes("__other__") && (
                    <input
                      className="input w-full mt-1"
                      placeholder="Wpisz odpowiedź..."
                      value={otherText[q.id] ?? ""}
                      onChange={(e) => setOtherText((t) => ({ ...t, [q.id]: e.target.value }))}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={() => void handleSubmit(false)}
          disabled={submitting}
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Wyślij odpowiedź
        </button>
      </div>
    </div>
  );
}
