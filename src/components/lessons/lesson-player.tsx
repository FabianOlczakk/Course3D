"use client";

import type { RefObject } from "react";
import { PlayCircle } from "lucide-react";

export function LessonPlayer({
  videoUrl,
  videoRef,
  onTimeUpdate,
}: {
  videoUrl: string | null;
  videoRef?: RefObject<HTMLVideoElement>;
  onTimeUpdate?: (currentTime: number) => void;
}) {
  if (!videoUrl) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-text-muted">
        <PlayCircle className="mb-2 h-12 w-12" />
        <p>Brak wideo dla tej lekcji.</p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="h-full w-full"
        onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
      >
        Twoja przeglądarka nie obsługuje odtwarzacza wideo.
      </video>
    </div>
  );
}
