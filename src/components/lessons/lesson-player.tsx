"use client";

import type { RefObject } from "react";
import { PlayCircle } from "lucide-react";

function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    if (host === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname.startsWith("/embed/")) return url;
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    return null;
  } catch {
    return null;
  }
}

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

  const embed = toYouTubeEmbed(videoUrl);

  if (embed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={embed}
          title="Odtwarzacz lekcji"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
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
