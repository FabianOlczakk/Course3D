"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  color?: string | null;
}

/** Rozwijana lista wyboru w stylu strony (zamiast natywnego <select>). */
export function StyledSelect({
  value,
  onChange,
  options,
  placeholder = "Wybierz…",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] pl-3 pr-9 text-left text-sm text-text-primary outline-none transition-colors hover:border-[var(--border-glow)] focus:border-[var(--accent)]"
      >
        {selected?.color && (
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: selected.color }}
          />
        )}
        <span className={cn("truncate", !selected && "text-[var(--text-muted)]")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full min-w-[180px] overflow-auto rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] py-1 shadow-xl">
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors",
                  active
                    ? "bg-[#9d6bff1a] text-[var(--accent-soft)]"
                    : "text-text-secondary hover:bg-[#ffffff09] hover:text-text-primary"
                )}
              >
                {o.color && (
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: o.color }}
                  />
                )}
                <span className="flex-1 truncate">{o.label}</span>
                {active && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
