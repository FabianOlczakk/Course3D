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
    let done = false;
    let tries = 0;
    const iv = setInterval(() => {
      tries += 1;
      const el = document.getElementById(`${prefix}${id}`);
      if (el) {
        done = true;
        clearInterval(iv);
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-[var(--accent)]", "rounded-[10px]");
        setTimeout(
          () => el.classList.remove("ring-2", "ring-[var(--accent)]"),
          2500
        );
      }
      // szukaj przez ~6 s (dane mogą się doczytywać), potem przestań
      if (done || tries > 20) clearInterval(iv);
    }, 300);
    return () => clearInterval(iv);
  }, [sp, param, prefix]);
  return null;
}
