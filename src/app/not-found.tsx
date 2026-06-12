import Link from "next/link";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--accent-glow)] shadow-glow">
        <Compass className="h-10 w-10 text-[var(--accent)]" />
      </div>
      <h1 className="mt-6 text-6xl font-black text-text-primary">404</h1>
      <h2 className="mt-2 text-xl font-bold text-text-primary">
        Nie znaleziono strony
      </h2>
      <p className="mt-2 max-w-md text-text-secondary">
        Strona, której szukasz, nie istnieje lub została przeniesiona.
      </p>
      <Link
        href="/dashboard"
        className="glow-btn mt-6 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium text-white"
      >
        <Home className="h-4 w-4" />
        Wróć do pulpitu
      </Link>
    </div>
  );
}
