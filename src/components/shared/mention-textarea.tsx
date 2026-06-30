"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UserSuggestion {
  id: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  autoFocus?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export function MentionTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
  autoFocus,
  textareaRef: externalRef,
}: Props) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = externalRef ?? internalRef;

  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(-1);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const detectMention = useCallback((text: string, cursorPos: number) => {
    const before = text.slice(0, cursorPos);
    const match = before.match(/@([\w.]*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionStart(cursorPos - match[0].length);
      setSelectedIdx(0);
    } else {
      setMentionQuery(null);
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (mentionQuery === null) { setSuggestions([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const q = mentionQuery || "a"; // search something if empty
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
        if (res.ok) setSuggestions(((await res.json()).users ?? []).slice(0, 6));
      } catch { /* ignore */ }
    }, 180);
  }, [mentionQuery]);

  function insertMention(user: UserSuggestion) {
    const name = user.username ?? user.email.split("@")[0];
    const cursorPos = ref.current?.selectionStart ?? mentionStart + (mentionQuery?.length ?? 0) + 1;
    const before = value.slice(0, mentionStart);
    const after = value.slice(cursorPos);
    const newVal = `${before}@${name} ${after}`;
    onChange(newVal);
    setMentionQuery(null);
    setSuggestions([]);
    setTimeout(() => {
      if (ref.current) {
        const pos = before.length + name.length + 2;
        ref.current.focus();
        ref.current.setSelectionRange(pos, pos);
      }
    }, 0);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    detectMention(e.target.value, e.target.selectionStart ?? e.target.value.length);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" || e.key === "Tab") {
      const s = suggestions[selectedIdx];
      if (s) { e.preventDefault(); insertMention(s); }
    } else if (e.key === "Escape") { setMentionQuery(null); setSuggestions([]); }
  }

  return (
    <div className="relative flex-1">
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        autoFocus={autoFocus}
        className={className}
      />
      {suggestions.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full max-w-xs overflow-hidden rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl">
          {suggestions.map((u, i) => {
            const name = u.username ?? u.email;
            return (
              <button
                key={u.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); insertMention(u); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                  i === selectedIdx
                    ? "bg-[var(--accent-glow)] text-[var(--accent-soft)]"
                    : "text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                {u.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.avatarUrl} alt={name} className="h-6 w-6 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-semibold text-white">
                    {name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className="font-medium">@{name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
