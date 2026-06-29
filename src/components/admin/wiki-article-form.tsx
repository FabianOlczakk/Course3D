"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/lib/toast";

interface WikiArticleData {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string | null;
  published: boolean;
}

export function WikiArticleForm({ initial }: { initial?: WikiArticleData }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toSlug = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) setSlug(toSlug(val));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const body = { title, slug, content, category: category || null, published: true };
      const url = isEdit ? `/api/wiki/${initial!.slug}` : "/api/wiki";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Błąd zapisu."); return; }
      toast.success(isEdit ? "Artykuł zaktualizowany." : "Artykuł utworzony.");
      router.push(`/wiki/${isEdit ? initial!.slug : slug}`);
      router.refresh();
    } catch { toast.error("Błąd połączenia."); }
    finally { setLoading(false); }
  };

  const del = async () => {
    if (!isEdit || !confirm(`Usunąć artykuł „${initial!.title}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/wiki/${initial!.slug}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Nie udało się usunąć."); return; }
      toast.success("Artykuł usunięty.");
      router.push("/wiki");
      router.refresh();
    } catch { toast.error("Błąd połączenia."); }
    finally { setDeleting(false); }
  };

  const inputCls = "w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 py-2 text-sm text-text-primary outline-none focus:border-[var(--border-glow)]";

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/wiki"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[#2e2e2e] bg-[#1e1e1e] text-text-secondary transition-colors hover:border-[var(--accent)] hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-text-primary">
          {isEdit ? "Edytuj artykuł" : "Nowy artykuł Wiki"}
        </h1>
      </div>

      <div className="glow-card space-y-4 p-6">
        <div className="space-y-1">
          <label className="text-sm text-text-secondary">Tytuł *</label>
          <input required value={title} onChange={(e) => handleTitleChange(e.target.value)} className={inputCls} placeholder="np. Kody błędów HMS — lista i opisy" />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-text-secondary">Slug (URL) *</label>
          <input
            required
            value={slug}
            onChange={(e) => setSlug(toSlug(e.target.value))}
            className={inputCls}
            placeholder="kody-bledow-hms"
            pattern="[a-z0-9-]+"
            disabled={isEdit}
          />
          <p className="text-xs text-text-muted">Dostępny jako: /wiki/{slug || "..."}</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-text-secondary">Kategoria</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} placeholder="np. Kody błędów HMS, Konserwacja, Materiały" />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-text-secondary">Treść (HTML) *</label>
          <textarea
            required
            rows={20}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`${inputCls} resize-y font-mono text-xs`}
            placeholder="<h2>Nagłówek</h2><p>Treść artykułu...</p>"
          />
          <p className="text-xs text-text-muted">Obsługiwany HTML. Użyj h2/h3 do nagłówków, p do akapitów, ul/li do list, code/pre do kodu.</p>
        </div>

      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#8a5af0] disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Zapisz zmiany" : "Utwórz artykuł"}
        </button>
        {isEdit && (
          <button type="button" onClick={del} disabled={deleting} className="inline-flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-60">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Usuń
          </button>
        )}
      </div>
    </form>
  );
}
