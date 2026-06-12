"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileFormProps {
  initialUsername: string | null;
  initialAvatarUrl: string | null;
  email: string;
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

export function ProfileForm({
  initialUsername,
  initialAvatarUrl,
  email,
}: ProfileFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(initialUsername ?? "");
  const [avatar, setAvatar] = useState<string | null>(initialAvatarUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initials = (username || email).slice(0, 2).toUpperCase();

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Plik jest zbyt duży (maks. 2 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, avatarUrl: avatar }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nie udało się zapisać profilu.");
        return;
      }
      setSuccess("Profil został zaktualizowany.");
      router.refresh();
    } catch {
      setError("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glow-card space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          Dane profilu
        </h2>
        <p className="text-sm text-text-secondary">
          Zmień nazwę użytkownika i zdjęcie profilowe.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          {avatar && <AvatarImage src={avatar} alt="Avatar" />}
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickFile}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            Zmień zdjęcie
          </Button>
          <p className="mt-1 text-xs text-text-muted">PNG/JPG do 2 MB.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" value={email} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Nazwa użytkownika</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Twoja nazwa"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}

      <Button type="submit" disabled={loading} className="glow-btn text-white">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Zapisz zmiany
      </Button>
    </form>
  );
}
