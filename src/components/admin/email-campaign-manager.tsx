"use client";
import { useState, useEffect } from "react";
import { Plus, Send, Mail, Trash2, X, AlertCircle, CheckCircle, Loader2, Clock } from "lucide-react";

type RecipientType = "ALL" | "NEWSLETTER" | "SPECIFIC";
type CampaignStatus = "DRAFT" | "SENDING" | "SENT" | "FAILED";

interface Campaign {
  id: string;
  subject: string;
  content: string;
  recipientType: RecipientType;
  specificEmails: string[] | null;
  status: CampaignStatus;
  sentAt: string | null;
  recipientCount: number | null;
  testSentTo: string | null;
  createdAt: string;
  createdBy: { username: string | null; email: string };
}

const STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: "Szkic",
  SENDING: "Wysyłanie...",
  SENT: "Wysłano",
  FAILED: "Błąd",
};

const STATUS_COLORS: Record<CampaignStatus, string> = {
  DRAFT: "var(--text-muted)",
  SENDING: "#e0944a",
  SENT: "#3ecf8e",
  FAILED: "#d9536a",
};

const RECIPIENT_LABELS: Record<RecipientType, string> = {
  ALL: "Wszyscy użytkownicy",
  NEWSLETTER: "Newsletter",
  SPECIFIC: "Konkretne adresy",
};

export function EmailCampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [viewing, setViewing] = useState<Campaign | null>(null);

  // Compose state
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipientType, setRecipientType] = useState<RecipientType>("ALL");
  const [specificEmails, setSpecificEmails] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/email-campaigns");
      if (r.ok) setCampaigns((await r.json()).campaigns);
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  function resetCompose() {
    setSubject(""); setContent(""); setRecipientType("ALL"); setSpecificEmails("");
    setTestEmail(""); setError(null); setSuccessMsg(null); setCurrentCampaignId(null);
  }

  async function saveDraft(): Promise<string | null> {
    if (!subject.trim()) { setError("Temat jest wymagany."); return null; }
    if (!content.trim()) { setError("Treść jest wymagana."); return null; }
    setSaving(true); setError(null);
    try {
      const emails = recipientType === "SPECIFIC" ? specificEmails.split(/[\n,]/).map(e => e.trim()).filter(Boolean) : undefined;
      const body = { subject, content, recipientType, specificEmails: emails };
      if (currentCampaignId) {
        const r = await fetch(`/api/email-campaigns/${currentCampaignId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!r.ok) { const d = await r.json(); setError(d.error ?? "Błąd."); return null; }
        return currentCampaignId;
      } else {
        const r = await fetch("/api/email-campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!r.ok) { const d = await r.json(); setError(d.error ?? "Błąd."); return null; }
        const d = await r.json();
        setCurrentCampaignId(d.campaign.id);
        return d.campaign.id;
      }
    } finally { setSaving(false); }
  }

  async function handleSendTest() {
    if (!testEmail.trim()) return setError("Podaj adres e-mail do testu.");
    const id = await saveDraft();
    if (!id) return;
    setTestSending(true); setError(null); setSuccessMsg(null);
    try {
      const r = await fetch(`/api/email-campaigns/${id}/send`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ testEmail: testEmail.trim() }) });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "Błąd wysyłki."); return; }
      setSuccessMsg(`Testowy e-mail wysłano na ${testEmail}`);
    } finally { setTestSending(false); }
  }

  async function handleSendAll() {
    if (!confirm("Wysłać kampanię do wybranych odbiorców? Tej operacji nie można cofnąć.")) return;
    const id = await saveDraft();
    if (!id) return;
    setSending(true); setError(null); setSuccessMsg(null);
    try {
      const r = await fetch(`/api/email-campaigns/${id}/send`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "Błąd wysyłki."); return; }
      setSuccessMsg(`Wysłano do ${d.sent} odbiorców${d.failed > 0 ? `, ${d.failed} błędów` : ""}.`);
      await load();
      setTimeout(() => { setComposing(false); resetCompose(); }, 2000);
    } finally { setSending(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Usunąć kampanię?")) return;
    await fetch(`/api/email-campaigns/${id}`, { method: "DELETE" });
    await load();
  }

  if (composing) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <button onClick={() => { setComposing(false); resetCompose(); }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm">← Wróć</button>
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">Nowa kampania e-mail</h2>
        </div>

        <div className="glow-card p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Temat *</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} className="input w-full" placeholder="Temat wiadomości e-mail..." />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Treść (HTML) *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} className="input w-full min-h-[200px] resize-y font-mono text-sm" placeholder="<p>Treść wiadomości — obsługuje HTML...</p>" />
            <p className="text-xs text-[var(--text-muted)]">Obsługuje HTML. Logo i stopka są dodawane automatycznie.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Odbiorcy</label>
            <div className="flex flex-wrap gap-2">
              {(["ALL", "NEWSLETTER", "SPECIFIC"] as RecipientType[]).map(t => (
                <button key={t} type="button" onClick={() => setRecipientType(t)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${recipientType === t ? "bg-[var(--accent-glow)] text-[var(--accent-soft)]" : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                  {RECIPIENT_LABELS[t]}
                </button>
              ))}
            </div>
            {recipientType === "SPECIFIC" && (
              <textarea value={specificEmails} onChange={e => setSpecificEmails(e.target.value)} className="input w-full min-h-[80px] resize-y font-mono text-sm mt-2" placeholder="email1@przyklad.pl&#10;email2@przyklad.pl&#10;(jeden adres na linię lub oddzielone przecinkiem)" />
            )}
          </div>
        </div>

        <div className="glow-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Wyślij testowo</h3>
          <div className="flex gap-2">
            <input value={testEmail} onChange={e => setTestEmail(e.target.value)} className="input flex-1" placeholder="test@przyklad.pl" type="email" />
            <button onClick={handleSendTest} disabled={testSending} className="flex items-center gap-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors disabled:opacity-50">
              {testSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Test
            </button>
          </div>
        </div>

        {error && <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
        {successMsg && <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400"><CheckCircle className="h-4 w-4 shrink-0" />{successMsg}</div>}

        <div className="flex gap-3">
          <button onClick={handleSendAll} disabled={sending || saving} className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Wysyłanie..." : "Wyślij kampanię"}
          </button>
          <button onClick={() => { setComposing(false); resetCompose(); }} className="px-5 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">Anuluj</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-[var(--text-primary)]">Email</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Wysyłaj kampanie e-mail do kursantów</p>
        </div>
        <button onClick={() => setComposing(true)} className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Nowa kampania
        </button>
      </div>

      {loading ? (
        <div className="glow-card p-8 text-center text-[var(--text-muted)] text-sm">Ładowanie...</div>
      ) : campaigns.length === 0 ? (
        <div className="glow-card p-10 text-center">
          <Mail className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-[var(--text-muted)]">Brak kampanii. Wyślij pierwszą wiadomość.</p>
        </div>
      ) : (
        <div className="glow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Temat</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide hidden sm:table-cell">Odbiorcy</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide hidden md:table-cell">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide hidden lg:table-cell">Data wysyłki</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--text-primary)]">{c.subject}</div>
                    {c.recipientCount != null && c.status === "SENT" && <div className="text-xs text-[var(--text-muted)]">{c.recipientCount} odbiorców</div>}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] hidden sm:table-cell">{RECIPIENT_LABELS[c.recipientType]}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold" style={{ background: STATUS_COLORS[c.status] + "22", color: STATUS_COLORS[c.status] }}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)] text-xs hidden lg:table-cell">
                    {c.sentAt ? new Date(c.sentAt).toLocaleString("pl") : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.status !== "SENT" && (
                      <button onClick={() => handleDelete(c.id)} className="rounded-md p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--bg-elevated)]" title="Usuń">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
