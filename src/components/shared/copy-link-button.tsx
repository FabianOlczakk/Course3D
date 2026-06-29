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
    const url = `${window.location.origin}${path}`;
    try {
      // navigator.clipboard działa tylko w bezpiecznym kontekście (https/
      // localhost). Na zwykłym http (np. LAN) używamy fallbacku z execCommand.
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ostateczność: pokaż link do ręcznego skopiowania.
      window.prompt("Skopiuj link:", url);
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
