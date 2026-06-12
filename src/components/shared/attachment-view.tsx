"use client";

import { Download, FileText } from "lucide-react";
import { isImage, formatFileSize, type Attachment } from "@/lib/attachments-client";

// Wyświetlanie listy załączników: obrazy inline, pozostałe jako link do pobrania.
export function AttachmentView({ attachments }: { attachments: Attachment[] }) {
  if (!attachments?.length) return null;
  return (
    <div className="mt-2 flex flex-col gap-2">
      {attachments.map((att, i) =>
        isImage(att) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <a key={i} href={att.url} download={att.name} target="_blank" rel="noreferrer">
            <img
              src={att.url}
              alt={att.name}
              className="max-h-64 max-w-full rounded-lg border border-[var(--border-subtle)]"
            />
          </a>
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
    </div>
  );
}
