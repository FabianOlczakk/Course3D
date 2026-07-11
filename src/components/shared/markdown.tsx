"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renderuje Markdown asystenta AI ze stylem dopasowanym do reszty platformy. Linki otwierają się w nowej karcie. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed [&_p]:m-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: c }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2 hover:opacity-80">
              {c}
            </a>
          ),
          ul: ({ children: c }) => <ul className="list-disc space-y-1 pl-5">{c}</ul>,
          ol: ({ children: c }) => <ol className="list-decimal space-y-1 pl-5">{c}</ol>,
          strong: ({ children: c }) => <strong className="font-semibold text-[var(--text-primary)]">{c}</strong>,
          code: ({ children: c }) => (
            <code className="rounded bg-[var(--bg-elevated)] px-1 py-0.5 font-mono text-[0.85em]">{c}</code>
          ),
          h1: ({ children: c }) => <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">{c}</h3>,
          h2: ({ children: c }) => <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">{c}</h3>,
          h3: ({ children: c }) => <h4 className="font-display text-sm font-semibold text-[var(--text-primary)]">{c}</h4>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
