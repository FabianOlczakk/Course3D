"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Loader2, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileFormProps {
  initialUsername: string | null;
  initialAvatarUrl: string | null;
  email: string;
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const CROP_SIZE = 300;

function CropModal({
  src,
  onConfirm,
  onCancel,
}: {
  src: string;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offsetX, oy: offsetY };
  }, [offsetX, offsetY]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !dragStart.current) return;
    setOffsetX(dragStart.current.ox + (e.clientX - dragStart.current.mx));
    setOffsetY(dragStart.current.oy + (e.clientY - dragStart.current.my));
  }, [dragging]);

  const onMouseUp = useCallback(() => { setDragging(false); dragStart.current = null; }, []);

  function handleConfirm() {
    const canvas = document.createElement("canvas");
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext("2d")!;
    const img = imgRef.current!;
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const previewSize = CROP_SIZE; // same as display size
    const scaleRatio = naturalW / previewSize;
    ctx.drawImage(
      img,
      (-offsetX * scaleRatio) / scale,
      (-offsetY * scaleRatio) / scale,
      (previewSize * scaleRatio) / scale,
      (previewSize * scaleRatio) / scale,
      0, 0, CROP_SIZE, CROP_SIZE
    );
    onConfirm(canvas.toDataURL("image/jpeg", 0.9));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-2xl">
        <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Przytnij zdjęcie profilowe</p>
        <div
          className="relative mx-auto overflow-hidden rounded-full"
          style={{ width: CROP_SIZE, height: CROP_SIZE, cursor: dragging ? "grabbing" : "grab" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt="crop"
            draggable={false}
            style={{
              position: "absolute",
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
              transformOrigin: "center",
              maxWidth: "none",
              userSelect: "none",
              width: "100%",
            }}
          />
          {/* Circle overlay */}
          <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-card)]" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <ZoomOut className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="flex-1"
          />
          <ZoomIn className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
        </div>
        <p className="mt-1 text-center text-[11px] text-[var(--text-muted)]">Przeciągnij aby wyśrodkować · przewiń suwak aby powiększyć</p>
        <div className="mt-4 flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            <X className="h-4 w-4" /> Anuluj
          </Button>
          <Button type="button" className="glow-btn flex-1 text-white" onClick={handleConfirm}>
            <Check className="h-4 w-4" /> Zastosuj
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProfileForm({ initialUsername, initialAvatarUrl, email }: ProfileFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(initialUsername ?? "");
  const [avatar, setAvatar] = useState<string | null>(initialAvatarUrl);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initials = (username || email).slice(0, 2).toUpperCase();

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (file.size > MAX_AVATAR_BYTES) { setError("Plik jest zbyt duży (maks. 2 MB)."); return; }
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
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
      if (!res.ok) { setError(data.error ?? "Nie udało się zapisać profilu."); return; }
      setSuccess("Profil został zaktualizowany.");
      router.refresh();
    } catch {
      setError("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {cropSrc && (
        <CropModal
          src={cropSrc}
          onConfirm={(dataUrl) => { setAvatar(dataUrl); setCropSrc(null); }}
          onCancel={() => setCropSrc(null)}
        />
      )}
      <form onSubmit={onSubmit} className="glow-card space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Dane profilu</h2>
          <p className="text-sm text-text-secondary">Zmień nazwę użytkownika i zdjęcie profilowe.</p>
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {avatar && <AvatarImage src={avatar} alt="Avatar" />}
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
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
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Twoja nazwa" />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-400">{success}</p>}

        <Button type="submit" disabled={loading} className="glow-btn text-white">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Zapisz zmiany
        </Button>
      </form>
    </>
  );
}
