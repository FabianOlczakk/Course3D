"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Globe, Lock, Pencil, Plus, Trash2, Users, X, Check, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

type Visibility = "PUBLIC" | "USERS" | "ADMIN";

interface Page {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

const VIS_LABELS: Record<Visibility, { label: string; color: string; icon: React.ReactNode }> = {
  PUBLIC: { label: "Publiczna", color: "bg-green-500/15 text-green-400", icon: <Globe className="h-3 w-3" /> },
  USERS: { label: "Kursanci", color: "bg-blue-500/15 text-blue-400", icon: <Users className="h-3 w-3" /> },
  ADMIN: { label: "Tylko admin", color: "bg-[var(--accent-glow)] text-[var(--accent-soft)]", icon: <Lock className="h-3 w-3" /> },
};

function VisBadge({ v }: { v: Visibility }) {
  const d = VIS_LABELS[v];
  return (
    <span className={`inline-flex items-center gap-1 rounded-[4px] px-2 py-0.5 text-[10px] font-semibold ${d.color}`}>
      {d.icon} {d.label}
    </span>
  );
}

const emptyForm = { title: "", slug: "", content: "", description: "", visibility: "USERS" as Visibility };

export function AdminPagesClient() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Page | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pages?all=1");
      if (res.ok) setPages((await res.json()).pages ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setCreating(true);
  }

  function openEdit(p: Page) {
    setCreating(false);
    setForm({ title: p.title, slug: p.slug, content: p.content, description: p.description ?? "", visibility: p.visibility });
    setEditing(p);
  }

  function closeForm() { setCreating(false); setEditing(null); }

  async function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/pages/${editing.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const data = await res.json();
          setPages((prev) => prev.map((p) => p.id === editing.id ? data.page : p));
          closeForm();
        }
      } else {
        const res = await fetch("/api/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const data = await res.json();
          setPages((prev) => [data.page, ...prev]);
          closeForm();
        }
      }
    } finally { setSaving(false); }
  }

  async function deletePage(slug: string) {
    if (!confirm("Usunąć stronę?")) return;
    setDeleting(slug);
    try {
      const res = await fetch(`/api/pages/${slug}`, { method: "DELETE" });
      if (res.ok) setPages((prev) => prev.filter((p) => p.slug !== slug));
    } finally { setDeleting(null); }
  }

  const showForm = creating || !!editing;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-[var(--accent)]" />
          <h1 className="font-display text-[20px] font-semibold text-[var(--text-primary)]">Strony</h1>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nowa strona
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glow-card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text-primary)]">
              {editing ? "Edytuj stronę" : "Nowa strona"}
            </h2>
            <button type="button" onClick={closeForm} className="rounded-[6px] p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-[var(--text-muted)]">Tytuł *</label>
              <input
                value={form.title}
                onChange={(e) => {
                  const t = e.target.value;
                  setForm((f) => ({
                    ...f, title: t,
                    slug: f.slug || t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                  }));
                }}
                placeholder="Tytuł strony"
                className="w-full rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-[var(--text-muted)]">Slug (URL)</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="slug-url"
                className="w-full rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[var(--text-muted)]">Krótki opis</label>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Opis strony (opcjonalny)"
              className="w-full rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[var(--text-muted)]">Treść (HTML)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={14}
              placeholder="<p>Treść strony w HTML...</p>"
              className="w-full resize-y rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 font-mono text-[12.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[12px] font-semibold text-[var(--text-muted)]">Widoczność</label>
            <p className="mb-2 text-[11px] text-[var(--text-muted)]">
              Strony <strong>publiczne</strong> są osobnymi stronami (bez sidebaru, dostępne bez logowania). Strony <strong>Kursanci/Admin</strong> są osadzone w platformie.
            </p>
            <div className="flex gap-2 flex-wrap">
              {(["PUBLIC", "USERS", "ADMIN"] as Visibility[]).map((v) => {
                const d = VIS_LABELS[v];
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, visibility: v }))}
                    className={`inline-flex items-center gap-1.5 rounded-[6px] border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                      form.visibility === v
                        ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent-soft)]"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    {d.icon} {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeForm} className="rounded-[6px] px-4 py-2 text-[13px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
              Anuluj
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || !form.title.trim()}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editing ? "Zapisz" : "Utwórz"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="glow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
          </div>
        ) : pages.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--text-muted)]">Brak stron. Utwórz pierwszą.</p>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {pages.map((page) => (
              <div key={page.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <FileText className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[var(--text-primary)]">{page.title}</span>
                    <VisBadge v={page.visibility} />
                  </div>
                  {page.description && (
                    <p className="mt-0.5 text-[12px] text-[var(--text-muted)] line-clamp-1">{page.description}</p>
                  )}
                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">/strony/{page.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/strony/${page.slug}`}
                    target="_blank"
                    className="rounded-[6px] p-2 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                    title="Podgląd"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEdit(page)}
                    className="rounded-[6px] p-2 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                    title="Edytuj"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void deletePage(page.slug)}
                    disabled={deleting === page.slug}
                    className="rounded-[6px] p-2 text-[var(--text-muted)] transition-colors hover:text-red-400 disabled:opacity-50"
                    title="Usuń"
                  >
                    {deleting === page.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
