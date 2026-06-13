import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  GraduationCap,
  MessagesSquare,
  Printer,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Course3D — Kurs druku 3D z Bambu Lab A1 Mini",
};

const features = [
  {
    icon: GraduationCap,
    title: "Kompletny kurs wideo",
    desc: "Od rozpakowania drukarki po zaawansowane modelowanie — krok po kroku, w języku polskim.",
  },
  {
    icon: Printer,
    title: "Bambu Lab A1 Mini w zestawie",
    desc: "Otrzymujesz fizyczną drukarkę 3D, gotową do pracy zaraz po dostawie.",
  },
  {
    icon: Boxes,
    title: "Interaktywne lekcje",
    desc: "Treść zsynchronizowana z wideo, quizy i praktyczne zadania utrwalające wiedzę.",
  },
  {
    icon: MessagesSquare,
    title: "Społeczność i wsparcie",
    desc: "Zadawaj pytania, dziel się wydrukami i pisz bezpośrednio do prowadzących.",
  },
];

const pricingPoints = [
  "Drukarka Bambu Lab A1 Mini",
  "Dożywotni dostęp do platformy kursu",
  "Wszystkie aktualizacje materiałów",
  "Dostęp do społeczności i wsparcia",
  "Certyfikat ukończenia kursu",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-text-primary">
      {/* Nawigacja */}
      <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-[var(--accent)]" />
            Course3D
          </span>
          <Link
            href="/login"
            className="glow-btn rounded-md px-4 py-2 text-sm font-medium text-white"
          >
            Zaloguj się
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(168,85,247,0.20), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-glow)] bg-[var(--bg-elevated)] px-4 py-1.5 text-sm text-text-secondary">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            Druk 3D od zera do mistrza
          </span>
          <h1 className="bg-gradient-to-br from-white via-purple-200 to-purple-400 bg-clip-text text-5xl font-extrabold leading-tight text-transparent md:text-6xl">
            Kurs Druku 3D z Bambu Lab A1 Mini
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            Naucz się drukowania 3D od podstaw. Otrzymasz prawdziwą drukarkę
            Bambu Lab A1 Mini oraz pełny dostęp do interaktywnej platformy
            kursu.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="glow-btn inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-semibold text-white"
            >
              Zaloguj się do kursu
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#cennik"
              className="rounded-md border border-[var(--border-subtle)] px-6 py-3 text-base font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Zobacz cennik
            </a>
          </div>
        </div>
      </section>

      {/* Funkcje */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold">
            Wszystko, czego potrzebujesz
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-text-secondary">
            Kompleksowy program nauczania połączony z prawdziwym sprzętem.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="glow-card p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent-glow)]">
                  <f.icon className="h-6 w-6 text-[var(--accent)]" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cennik */}
      <section id="cennik" className="px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-bold">Prosty cennik</h2>
          <p className="mt-3 text-center text-text-secondary">
            Jednorazowa opłata. Drukarka i dostęp do kursu w jednym.
          </p>
          <div className="glow-card glow-border mt-10 p-8 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-text-muted">
              Pełny pakiet
            </p>
            <p className="mt-4">
              <span className="bg-gradient-to-br from-white to-purple-300 bg-clip-text text-6xl font-extrabold text-transparent">
                999 zł
              </span>
            </p>
            <p className="mt-2 text-text-secondary">
              Drukarka Bambu Lab A1 Mini + dostęp do platformy
            </p>
            <ul className="mt-8 space-y-3 text-left">
              {pricingPoints.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--accent)]" />
                  <span className="text-text-secondary">{p}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="glow-btn mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-base font-semibold text-white"
            >
              Zaloguj się do kursu
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stopka */}
      <footer className="border-t border-[var(--border-subtle)] px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-text-muted sm:flex-row">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            Course3D
          </span>
          <span>© {new Date().getFullYear()} Course3D. Wszelkie prawa zastrzeżone.</span>
        </div>
      </footer>
    </div>
  );
}
