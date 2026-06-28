"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

/** Przycisk kopiujący bezpośredni link (origin + path) do schowka. */
export function CopyLinkButton({
  path,
  className,
  label = "Kopiuj link",
}: {
  path: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      const url = `${window.location.origin}${path}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void copy();
      }}
      className={
        className ??
        "flex items-center gap-1 text-text-muted transition-colors hover:text-[var(--accent-soft)]"
      }
    >
      {copied ? (
        <Check className="h-4 w-4 text-[var(--green)]" />
      ) : (
        <Link2 className="h-4 w-4" />
      )}
    </button>
  );
}
