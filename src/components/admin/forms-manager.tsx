"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Eye, ToggleLeft, ToggleRight, X, ClipboardList } from "lucide-react";
import { StyledSelect } from "@/components/ui/styled-select";

type QuestionType = "TEXT" | "TEXTAREA" | "NUMBER" | "CHECKBOX" | "RADIO";
type FormVisibility = "ALL" | "ACTIVE" | "NEW";

interface Question { id?: string; text: string; type: QuestionType; options?: string[]; required: boolean; order: number; }
interface Form { id: string; title: string; description?: string; visibility: FormVisibility; allowSkip: boolean; active: boolean; createdAt: string; _count: { questions: number; responses: number }; }
interface FormResponse { id: string; answers: Record<string, unknown>; skipped: boolean; createdAt: string; user: { id: string; username: string | null; email: string }; }

const VIS_LABELS: Record<FormVisibility, string> = { ALL: "Wszyscy", ACTIVE: "Aktywni", NEW: "Nowi" };
const VIS_COLORS: Record<FormVisibility, string> = { ALL: "var(--accent)", ACTIVE: "#3ecf8e", NEW: "#e0944a" };
const Q_LABELS: Record<QuestionType, string> = { TEXT: "Tekst (krótki)", TEXTAREA: "Tekst (długi)", NUMBER: "Liczba", CHECKBOX: "Checkboxy (wiele)", RADIO: "Radio (jeden)" };

export function FormsManager() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [responsesForm, setResponsesForm] = useState<{ title: string; questions: Question[] } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<FormVisibility>("ALL");
  const [allowSkip, setAllowSkip] = useState(true);
  const [active, setActive] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() { setLoading(true); try { const r = await fetch("/api/forms"); if (r.ok) setForms((await r.json()).forms); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);

  function addQuestion() { setQuestions(q => [...q, { text: "", type: "TEXT", required: false, order: q.length }]); }
  function removeQuestion(idx: number) { setQuestions(q => q.filter((_, i) => i !== idx).map((q2, i) => ({ ...q2, order: i }))); }
  function updateQuestion(idx: number, patch: Partial<Question>) { setQuestions(q => q.map((q2, i) => i === idx ? { ...q2, ...patch } : q2)); }
  function addOption(qIdx: number) { const q = questions[qIdx]; updateQuestion(qIdx, { options: [...(q.options ?? []), ""] }); }
  function addOtherOption(qIdx: number) { const q = questions[qIdx]; updateQuestion(qIdx, { options: [...(q.options ?? []).filter(o => o !== "__other__"), "__other__"] }); }
  function updateOption(qIdx: number, oIdx: number, val: string) { const q = questions[qIdx]; const opts = [...(q.options ?? [])]; opts[oIdx] = val; updateQuestion(qIdx, { options: opts }); }
  function removeOption(qIdx: number, oIdx: number) { const q = questions[qIdx]; updateQuestion(qIdx, { options: (q.options ?? []).filter((_, i) => i !== oIdx) }); }

  async function handleCreate() {
    if (!title.trim()) return setError("Tytuł jest wymagany.");
    if (questions.length === 0) return setError("Dodaj przynajmniej jedno pytanie.");
    setSaving(true); setError(null);
    try {
      const r = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description, visibility, allowSkip, active, questions }) });
      if (!r.ok) { const d = await r.json(); setError(d.error ?? "Błąd."); return; }
      setCreating(false); resetForm(); await load();
    } finally { setSaving(false); }
  }

  function resetForm() { setTitle(""); setDescription(""); setVisibility("ALL"); setAllowSkip(true); setActive(true); setQuestions([]); setError(null); }
  async function toggleActive(id: string, current: boolean) { await fetch(`/api/forms/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !current }) }); await load(); }
  async function handleDelete(id: string) { if (!confirm("Usunąć formularz? Wszystkie odpowiedzi zostaną usunięte.")) return; await fetch(`/api/forms/${id}`, { method: "DELETE" }); await load(); }
  async function openResponses(formId: string, formTitle: string) {
    setViewingId(formId);
    const [rr, fr] = await Promise.all([fetch(`/api/forms/${formId}/responses`).then(r => r.json()), fetch(`/api/forms/${formId}`).then(r => r.json())]);
    setResponses(rr.responses ?? []); setResponsesForm({ title: formTitle, questions: fr.form?.questions ?? [] });
  }

  if (viewingId) return (
    <div className="mx-auto max-w-5xl space-y-4 p-6 md:p-8">
      <div className="flex items-center gap-3">
        <button onClick={() => setViewingId(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm">← Wróć</button>
        <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">Odpowiedzi: {responsesForm?.title}</h2>
        <span className="text-sm text-[var(--text-muted)]">({responses.length})</span>
      </div>
      {responses.length === 0 ? <div className="glow-card p-8 text-center text-[var(--text-muted)]">Brak odpowiedzi</div> : (
        <div className="space-y-3">
          {responses.map(r => (
            <div key={r.id} className="glow-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--text-primary)] text-sm">{r.user.username ?? r.user.email}</span>
                <span className="text-xs text-[var(--text-muted)]">{new Date(r.createdAt).toLocaleString("pl")}</span>
              </div>
              {r.skipped ? <span className="text-xs text-[var(--text-muted)] italic">Pominięty</span> : (
                <div className="space-y-1">
                  {(responsesForm?.questions ?? []).map(q => (
                    <div key={q.id} className="text-sm"><span className="text-[var(--text-secondary)]">{q.text}: </span><span className="text-[var(--text-primary)]">{String(r.answers[q.id!] ?? "—")}</span></div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (creating) return (
    <div className="mx-auto max-w-5xl space-y-4 p-6 md:p-8">
      <div className="flex items-center gap-3">
        <button onClick={() => { setCreating(false); resetForm(); }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm">← Wróć</button>
        <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">Nowy formularz</h2>
      </div>
      <div className="glow-card p-5 space-y-4">
        <div className="space-y-1"><label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Tytuł *</label><input value={title} onChange={e => setTitle(e.target.value)} className="input w-full" placeholder="np. Ankieta powitalna" /></div>
        <div className="space-y-1"><label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Opis (opcjonalny)</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="input w-full min-h-[72px] resize-y" placeholder="Krótki opis formularza..." /></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1"><label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Widoczność</label>
            <StyledSelect
              value={visibility}
              onChange={(v) => setVisibility(v as FormVisibility)}
              options={[
                { value: "ALL", label: "Wszyscy zalogowani" },
                { value: "ACTIVE", label: "Aktywni (przed datą)" },
                { value: "NEW", label: "Nowi (po dacie)" },
              ]}
            />
          </div>
          <div className="space-y-1"><label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Można pominąć</label>
            <button type="button" onClick={() => setAllowSkip(v => !v)} className={`input w-full text-left text-sm font-medium ${allowSkip ? "text-[var(--accent-soft)]" : "text-[var(--text-muted)]"}`}>{allowSkip ? "Tak — przycisk Pomiń widoczny" : "Nie — obowiązkowy"}</button>
          </div>
          <div className="space-y-1"><label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Aktywny</label>
            <button type="button" onClick={() => setActive(v => !v)} className={`input w-full text-left text-sm font-medium ${active ? "text-[var(--accent-soft)]" : "text-[var(--text-muted)]"}`}>{active ? "Tak — widoczny" : "Nie — ukryty"}</button>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Pytania ({questions.length})</h3>
        {questions.map((q, idx) => (
          <div key={idx} className="glow-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--accent)] w-5">{idx + 1}.</span>
              <input value={q.text} onChange={e => updateQuestion(idx, { text: e.target.value })} className="input flex-1" placeholder="Treść pytania..." />
              <button onClick={() => removeQuestion(idx)} className="shrink-0 text-[var(--text-muted)] hover:text-red-400"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              <StyledSelect
                value={q.type}
                onChange={(t) => updateQuestion(idx, { type: t as QuestionType, options: ["CHECKBOX", "RADIO"].includes(t) ? [""] : undefined })}
                options={Object.entries(Q_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                className="w-56"
              />
              <button type="button" onClick={() => updateQuestion(idx, { required: !q.required })} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${q.required ? "bg-[var(--accent-glow)] text-[var(--accent-soft)]" : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"}`}>{q.required ? "Wymagane" : "Opcjonalne"}</button>
            </div>
            {(q.type === "CHECKBOX" || q.type === "RADIO") && (
              <div className="space-y-2 pl-4 border-l-2 border-[var(--border-subtle)]">
                {(q.options ?? []).map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    {opt === "__other__" ? <span className="input flex-1 text-sm text-[var(--text-muted)] italic py-1">Opcja „Inne" + pole tekstowe</span> : <input value={opt} onChange={e => updateOption(idx, oi, e.target.value)} className="input flex-1 text-sm" placeholder={`Opcja ${oi + 1}`} />}
                    <button onClick={() => removeOption(idx, oi)} className="text-[var(--text-muted)] hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                <div className="flex gap-3 pt-1">
                  <button onClick={() => addOption(idx)} className="text-xs text-[var(--accent)] hover:underline">+ Dodaj opcję</button>
                  {!(q.options ?? []).includes("__other__") && <button onClick={() => addOtherOption(idx)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">+ Opcja „Inne"</button>}
                </div>
              </div>
            )}
          </div>
        ))}
        <button onClick={addQuestion} className="flex w-full items-center gap-2 rounded-lg border border-dashed border-[var(--border-subtle)] px-4 py-3 text-sm text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"><Plus className="h-4 w-4" /> Dodaj pytanie</button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button onClick={handleCreate} disabled={saving} className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity">{saving ? "Zapisywanie..." : "Utwórz formularz"}</button>
        <button onClick={() => { setCreating(false); resetForm(); }} className="px-5 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">Anuluj</button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-[var(--accent)]" />
            <h1 className="font-display text-[20px] font-semibold text-[var(--text-primary)]">Formularze</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Twórz ankiety i formularze dla kursantów</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"><Plus className="h-4 w-4" /> Nowy formularz</button>
      </div>
      {loading ? <div className="glow-card p-8 text-center text-[var(--text-muted)] text-sm">Ładowanie...</div> : forms.length === 0 ? <div className="glow-card p-10 text-center text-[var(--text-muted)]">Brak formularzy. Utwórz pierwszy.</div> : (
        <div className="glow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[var(--border-subtle)]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Tytuł</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide hidden sm:table-cell">Widoczność</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide hidden md:table-cell">Pytania</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide hidden md:table-cell">Odpowiedzi</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Aktywny</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>
              {forms.map(f => (
                <tr key={f.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors">
                  <td className="px-4 py-3"><div className="font-medium text-[var(--text-primary)]">{f.title}</div>{f.description && <div className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">{f.description}</div>}</td>
                  <td className="px-4 py-3 hidden sm:table-cell"><span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold" style={{ background: VIS_COLORS[f.visibility] + "22", color: VIS_COLORS[f.visibility] }}>{VIS_LABELS[f.visibility]}</span></td>
                  <td className="px-4 py-3 text-center text-[var(--text-secondary)] hidden md:table-cell">{f._count.questions}</td>
                  <td className="px-4 py-3 text-center text-[var(--text-secondary)] hidden md:table-cell">{f._count.responses}</td>
                  <td className="px-4 py-3 text-center"><button onClick={() => toggleActive(f.id, f.active)}>{f.active ? <ToggleRight className="h-5 w-5 text-[var(--accent)] mx-auto" /> : <ToggleLeft className="h-5 w-5 text-[var(--text-muted)] mx-auto" />}</button></td>
                  <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1">
                    <button onClick={() => openResponses(f.id, f.title)} className="rounded-md p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]" title="Odpowiedzi"><Eye className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(f.id)} className="rounded-md p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--bg-elevated)]" title="Usuń"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
