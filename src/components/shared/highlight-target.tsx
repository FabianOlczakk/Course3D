"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Po wejściu z bezpośredniego linku (?<param>=<id>) przewija do elementu
 * o id `${prefix}${id}` i chwilowo go podświetla.
 */
export function HighlightTarget({
  param,
  prefix,
}: {
  param: string;
  prefix: string;
}) {
  const sp = useSearchParams();
  useEffect(() => {
    const id = sp.get(param);
    if (!id) return;
    const t = setTimeout(() => {
      const el = document.getElementById(`${prefix}${id}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-[var(--accent)]", "rounded-[10px]");
      setTimeout(
        () => el.classList.remove("ring-2", "ring-[var(--accent)]"),
        2500
      );
    }, 400);
    return () => clearTimeout(t);
  }, [sp, param, prefix]);
  return null;
}
