"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Copy, Check, Mail } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInviteUrl(null);
    setEmailSent(false);
    setLoading(true);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Nie udało się utworzyć użytkownika.");
      return;
    }

    setInviteUrl(data.inviteUrl ?? null);
    setEmailSent(true);
    setEmail("");
    router.refresh();
  }

  function copyLink() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) {
      setInviteUrl(null);
      setEmailSent(false);
      setError(null);
      setEmail("");
      setCopied(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          Dodaj użytkownika
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj użytkownika</DialogTitle>
          <DialogDescription>
            Podaj adres e-mail. System wyśle zaproszenie do ustawienia hasła i nazwy użytkownika.
          </DialogDescription>
        </DialogHeader>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">Adres e-mail</Label>
              <Input
                id="new-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="kursant@przyklad.pl"
              />
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
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Tworzenie..." : "Utwórz i wyślij zaproszenie"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
              <Check className="h-4 w-4 shrink-0 text-green-400" />
              <p className="text-sm text-green-400">Konto zostało utworzone.</p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
              <Mail className="h-4 w-4 shrink-0 text-blue-400" />
              <p className="text-sm text-blue-300">
                Próba wysłania e-maila. Jeśli nie doszedł (brak własnej domeny w Resend), skopiuj link poniżej i wyślij ręcznie.
              </p>
            </div>

            {inviteUrl && (
              <div className="space-y-2">
                <Label>Link do ustawienia hasła</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={inviteUrl}
                    className="font-mono text-xs"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Link wygasa po 7 dniach. Kliknij pole, aby zaznaczyć — lub użyj przycisku kopiowania.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => { setEmailSent(false); setInviteUrl(null); }}>
                Dodaj kolejnego
              </Button>
              <Button onClick={() => handleOpenChange(false)}>Zamknij</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
