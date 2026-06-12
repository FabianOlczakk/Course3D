// Względny czas po polsku, np. "2 godz. temu", "wczoraj".
export function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "przed chwilą";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min temu`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "wczoraj";
  if (days < 7) return `${days} dni temu`;
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

// Krótki czas dla wiadomości (HH:MM).
export function shortTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
