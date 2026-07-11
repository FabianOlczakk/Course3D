"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminUser } from "@/components/admin/types";

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [username, setUsername] = useState(user.username ?? "");
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<string>(user.role);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl);
  const [aiTokens, setAiTokens] = useState<string>(String(user.aiTokens));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetInfo, setResetInfo] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username || null,
        email,
        role,
        avatarUrl,
        aiTokens: Math.max(0, Number(aiTokens) || 0),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Nie udało się zapisać zmian.");
      return;
    }

    onOpenChange(false);
    router.refresh();
  }

  async function handleSendReset() {
    setResetInfo(null);
    setResetLink(null);
    const res = await fetch(`/api/users/${user.id}/send-reset`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Nie udało się wygenerować linku.");
      return;
    }
    setResetInfo(
      data.emailSent
        ? "Link do resetu hasła został wysłany na e-mail."
        : "Nie udało się wysłać e-maila. Skopiuj link poniżej:"
    );
    setResetLink(data.resetUrl);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edytuj użytkownika</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-username">Nazwa użytkownika</Label>
            <Input
              id="edit-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="brak"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Adres e-mail</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Awatar</Label>
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="awatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm text-muted-foreground">Brak awatara</span>
              )}
              {avatarUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAvatarUrl(null)}
                >
                  Usuń awatar
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-ai-tokens">Tokeny AI</Label>
            <Input
              id="edit-ai-tokens"
              type="number"
              min={0}
              value={aiTokens}
              onChange={(e) => setAiTokens(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Pula tokenów zużywanych przy rozmowie z asystentem AI. Po wyczerpaniu użytkownik nie może wysyłać
              nowych wiadomości.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Rola</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Kursant</SelectItem>
                <SelectItem value="ADMIN">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2 rounded-md border border-[var(--border-subtle)] p-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSendReset}
            >
              Wyślij link do resetu hasła
            </Button>
            {resetInfo && (
              <p className="text-xs text-muted-foreground">{resetInfo}</p>
            )}
            {resetLink && (
              <p className="break-all rounded bg-[var(--bg-elevated)] p-2 text-xs text-text-secondary">
                {resetLink}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
