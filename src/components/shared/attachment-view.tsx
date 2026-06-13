"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { isImage, formatFileSize, type Attachment } from "@/lib/attachments-client";
import { ImageLightbox } from "@/components/shared/image-lightbox";

// Wyświetlanie listy załączników: obrazy inline (klik = lightbox), pozostałe jako link do pobrania.
export function AttachmentView({ attachments }: { attachments: Attachment[] }) {
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(
    null
  );

  if (!attachments?.length) return null;
  return (
    <div className="mt-2 flex flex-col gap-2">
      {attachments.map((att, i) =>
        isImage(att) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={att.url}
            alt={att.name}
            className="max-h-64 max-w-full cursor-zoom-in rounded-lg border border-[var(--border-subtle)]"
            onClick={() => setLightbox({ url: att.url, name: att.name })}
          />
        ) : (
          <a
            key={i}
            href={att.url}
            download={att.name}
            className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <FileText className="h-4 w-4 shrink-0 text-[var(--accent)]" />
            <span className="truncate">{att.name}</span>
            {att.size ? (
              <span className="ml-auto shrink-0 text-xs text-text-muted">
                {formatFileSize(att.size)}
              </span>
            ) : null}
            <Download className="h-4 w-4 shrink-0" />
          </a>
        )
      )}
      {lightbox && (
        <ImageLightbox
          src={lightbox.url}
          alt={lightbox.name}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
