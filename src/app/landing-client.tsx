"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  GraduationCap,
  MessagesSquare,
  Printer,
  Sparkles,
  ChevronDown,
  Play,
  Star,
  Building2,
  Users,
  Zap,
  Shield,
  Award,
  Mail,
} from "lucide-react";

// --- Animation helpers ---

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode[];
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// --- Data ---

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
  "Wszystkie przyszłe aktualizacje materiałów",
  "Dostęp do społeczności i wsparcia",
  "Certyfikat ukończenia kursu",
  "Materiały do pobrania (projekty, pliki STL)",
];

const testimonials = [
  {
    name: "Marek Kowalski",
    role: "Hobbysta, Warszawa",
    text: "Po tygodniu od dostawy miałem już wydrukowane pierwsze części do roweru. Kurs tłumaczy wszystko od podstaw.",
    stars: 5,
  },
  {
    name: "Agnieszka Nowak",
    role: "Nauczycielka, Kraków",
    text: "Użyłam kursu żeby wprowadzić druk 3D do szkoły. Świetna platforma, przejrzyste lekcje.",
    stars: 5,
  },
  {
    name: "Tomasz Wiśniewski",
    role: "Inżynier, Wrocław",
    text: "Jako inżynier szukałem szybkiej ścieżki do prototypowania. Kurs spełnił oczekiwania w całości.",
    stars: 5,
  },
];

const faqItems = [
  {
    q: "Co dokładnie dostaję w pakiecie?",
    a: "Pakiet zawiera fizyczną drukarkę Bambu Lab A1 Mini dostarczoną pod wskazany adres oraz dożywotni dostęp do interaktywnej platformy kursowej z materiałami wideo, quizami i społecznością.",
  },
  {
    q: "Czy potrzebuję wcześniejszej wiedzy?",
    a: "Nie. Kurs jest zaprojektowany od zera — prowadzi Cię od pierwszego uruchomienia drukarki aż po zaawansowane techniki modelowania.",
  },
  {
    q: "Jak długo mam dostęp do kursu?",
    a: "Dostęp jest dożywotni. Płacisz raz, korzystasz na zawsze, włącznie ze wszystkimi przyszłymi aktualizacjami materiałów.",
  },
  {
    q: "Czy mogę kupić kurs dla firmy lub drużyny?",
    a: "Tak! Oferujemy specjalne warunki dla firm i grup. Skontaktuj się z nami przez formularz poniżej lub na adres kontakt@course3d.pl — przygotujemy ofertę szytą na miarę.",
  },
  {
    q: "Jak wygląda wysyłka drukarki?",
    a: "Drukarka jest wysyłana kurierem na terenie Polski. Czas dostawy to zazwyczaj 2–5 dni roboczych od potwierdzenia zamówienia.",
  },
];

const stats = [
  { value: "1 200+", label: "kursantów" },
  { value: "4.9 / 5", label: "ocena kursu" },
  { value: "96%", label: "poleca dalej" },
];

// --- Sub-components ---

function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="flex items-center gap-2 text-xl font-bold">
          <Sparkles className="h-5 w-5 text-[var(--accent)]" />
          Course3D
        </span>
        <div className="flex items-center gap-3">
          <a
            href="#cennik"
            className="hidden text-sm text-text-secondary transition-colors hover:text-text-primary sm:block"
          >
            Cennik
          </a>
          <a
            href="#business"
            className="hidden text-sm text-text-secondary transition-colors hover:text-text-primary sm:block"
          >
            Dla firm
          </a>
          <Link
            href="/login"
            className="glow-btn rounded-md px-4 py-2 text-sm font-medium text-white"
          >
            Zaloguj się
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-28 text-center">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 55% at 50% -5%, rgba(157,107,255,0.22), transparent)",
        }}
      />
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-4xl">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-glow)] bg-[var(--bg-elevated)] px-4 py-1.5 text-sm text-text-secondary"
        >
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
          Druk 3D od zera do mistrza
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gradient-to-br from-white via-purple-100 to-purple-400 bg-clip-text text-5xl font-extrabold leading-tight text-transparent md:text-6xl lg:text-7xl"
        >
          Kurs Druku 3D<br />z Bambu Lab A1 Mini
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary"
        >
          Naucz się drukowania 3D od podstaw. Otrzymasz prawdziwą drukarkę
          Bambu Lab A1 Mini oraz pełny dostęp do interaktywnej platformy kursowej.
          Jedna opłata — dożywotni dostęp.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/login"
            className="glow-btn inline-flex items-center gap-2 rounded-md px-7 py-3.5 text-base font-semibold text-white shadow-glow"
          >
            Zacznij teraz — 1 999 zł
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#cennik"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--border-subtle)] px-6 py-3.5 text-base font-medium text-text-secondary transition-colors hover:border-[var(--border-glow)] hover:text-text-primary"
          >
            <Play className="h-4 w-4" />
            Poznaj szczegóły
          </a>
        </motion.div>

        {/* Social proof bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted"
        >
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-0.5">
              <span className="text-xl font-bold text-text-primary">{s.value}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeUp className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Wszystko, czego potrzebujesz
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
            Kompleksowy program nauczania połączony z prawdziwym sprzętem i społecznością.
          </p>
        </FadeUp>

        <StaggerGrid className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="glow-card group p-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-glow)] ring-1 ring-[var(--border-glow)] transition-all group-hover:bg-[rgba(157,107,255,0.2)]">
                <f.icon className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.desc}</p>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}

function WhatYouGetSection() {
  const items = [
    { icon: Zap, text: "Ponad 40 lekcji wideo w jakości HD" },
    { icon: Printer, text: "Drukarka Bambu Lab A1 Mini wysłana kurierem" },
    { icon: Boxes, text: "Projekty i pliki STL do pobrania" },
    { icon: Users, text: "Zamknięta społeczność kursantów" },
    { icon: Shield, text: "Dożywotni dostęp bez ukrytych opłat" },
    { icon: Award, text: "Certyfikat ukończenia kursu" },
  ];

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 50% 60% at 80% 50%, rgba(157,107,255,0.07), transparent)",
        }}
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <FadeUp>
            <h2 className="text-3xl font-bold md:text-4xl">
              Co dokładnie dostajesz?
            </h2>
            <p className="mt-4 text-text-secondary">
              Nie sprzedajemy tylko dostępu do filmów. Dostajesz kompletny
              zestaw startowy — sprzęt, wiedzę i społeczność — gotowy do użycia
              od pierwszego dnia.
            </p>
            <div ref={ref} className="mt-8 grid gap-3 sm:grid-cols-2">
              {items.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3.5"
                >
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                  <span className="text-sm text-text-secondary">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </FadeUp>

          {/* Visual placeholder for printer animation */}
          <FadeUp delay={0.15}>
            <div className="relative mx-auto max-w-sm">
              <div className="aspect-square rounded-2xl border border-[var(--border-glow)] bg-[var(--bg-card)] p-8 shadow-glow-lg">
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[var(--accent-glow)]"
                  >
                    <Printer className="h-12 w-12 text-[var(--accent)]" />
                  </motion.div>
                  <div>
                    <p className="font-semibold text-text-primary">Bambu Lab A1 Mini</p>
                    <p className="mt-1 text-sm text-text-muted">Wart ~1 399 zł osobno</p>
                  </div>
                  <motion.div
                    initial={{ width: "20%" }}
                    animate={{ width: ["20%", "85%", "20%"] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                    className="h-1.5 rounded-full bg-gradient-to-r from-[var(--accent)] to-purple-400"
                  />
                  <p className="text-xs text-text-muted">Drukowanie w toku…</p>
                </div>
              </div>
              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="absolute -right-4 -top-4 rounded-xl border border-[var(--border-glow)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-semibold text-[var(--accent)] shadow-glow"
              >
                🎓 40+ lekcji
              </motion.div>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.8 }}
                className="absolute -bottom-4 -left-4 rounded-xl border border-[var(--border-glow)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-semibold text-[var(--accent)] shadow-glow"
              >
                ✅ Dożywotni dostęp
              </motion.div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeUp className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Co mówią kursanci</h2>
          <p className="mt-3 text-text-secondary">Prawdziwe opinie, bez upiększeń.</p>
        </FadeUp>

        <StaggerGrid className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="glow-card p-6">
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-glow)] text-sm font-bold text-[var(--accent)]">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="cennik" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <FadeUp className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Prosty cennik</h2>
          <p className="mt-3 text-text-secondary">
            Jednorazowa opłata. Drukarka i dostęp do kursu w jednym pakiecie.
          </p>
        </FadeUp>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Individual */}
          <FadeUp delay={0.05}>
            <div className="glow-border glow-card relative flex h-full flex-col overflow-hidden p-8">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500" />
              <span className="inline-block rounded-full bg-[var(--accent-glow)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                Pakiet indywidualny
              </span>
              <div className="mt-5">
                <div className="flex items-end gap-2">
                  <span className="bg-gradient-to-br from-white to-purple-300 bg-clip-text text-5xl font-extrabold text-transparent">
                    1 999 zł
                  </span>
                  <span className="mb-1.5 text-sm text-text-muted">jednorazowo</span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  Drukarka Bambu Lab A1 Mini + dożywotni dostęp do platformy
                </p>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {pricingPoints.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
                    <span className="text-sm text-text-secondary">{p}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className="glow-btn mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-3.5 text-base font-semibold text-white shadow-glow"
              >
                Kup teraz
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </FadeUp>

          {/* Business */}
          <FadeUp delay={0.15}>
            <div id="business" className="glow-card flex h-full flex-col p-8">
              <span className="inline-block rounded-full border border-[var(--border-glow)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                Dla firm i instytucji
              </span>
              <div className="mt-5">
                <div className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-[var(--accent)]" />
                  <span className="text-2xl font-bold text-text-primary">Cena do negocjacji</span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  Kupujesz dla więcej niż jednej osoby? Masz szkołę, firmę produkcyjną
                  lub chcesz wyposażyć pracownię? Przygotujemy ofertę dopasowaną do Twoich potrzeb.
                </p>
              </div>

              <ul className="mt-7 flex-1 space-y-3">
                {[
                  "Zniżki od 2 pakietów wzwyż",
                  "Dedykowany opiekun konta",
                  "Faktura VAT",
                  "Możliwość płatności w ratach",
                  "Szkolenia live dla Twojego zespołu",
                  "Priorytetowe wsparcie techniczne",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
                    <span className="text-sm text-text-secondary">{p}</span>
                  </li>
                ))}
              </ul>

              <a
                href="mailto:kontakt@course3d.pl"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[var(--border-glow)] px-6 py-3.5 text-base font-semibold text-text-primary transition-all hover:bg-[var(--accent-glow)]"
              >
                <Mail className="h-5 w-5 text-[var(--accent)]" />
                Napisz do nas
              </a>
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={0.1} className="mt-6 text-center text-sm text-text-muted">
          Masz pytania? Napisz na{" "}
          <a
            href="mailto:kontakt@course3d.pl"
            className="text-[var(--accent)] underline-offset-2 hover:underline"
          >
            kontakt@course3d.pl
          </a>
        </FadeUp>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <FadeUp className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Najczęstsze pytania</h2>
          <p className="mt-3 text-text-secondary">
            Nie znalazłeś odpowiedzi? Napisz do nas.
          </p>
        </FadeUp>

        <div className="mt-10 space-y-3">
          {faqItems.map((item, i) => (
            <FadeUp key={i} delay={i * 0.06}>
              <div className="glow-card overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-text-primary">{item.q}</span>
                  <motion.div
                    animate={{ rotate: open === i ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChevronDown className="h-5 w-5 shrink-0 text-text-muted" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-text-secondary">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 text-center">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(157,107,255,0.12), transparent)",
        }}
      />
      <FadeUp className="relative mx-auto max-w-2xl">
        <h2 className="text-3xl font-bold md:text-4xl">
          Gotowy, żeby zacząć drukować?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-text-secondary">
          Dołącz do ponad 1 200 kursantów, którzy już tworzą własne projekty 3D.
          Drukarka dostarczana pod drzwi, kurs dostępny od razu.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="glow-btn inline-flex items-center gap-2 rounded-md px-7 py-3.5 text-base font-semibold text-white shadow-glow"
          >
            Zacznij teraz — 1 999 zł
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#business"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
          >
            <Building2 className="h-4 w-4" />
            Oferta dla firm →
          </a>
        </div>
      </FadeUp>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-text-muted sm:flex-row">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
          Course3D
        </span>
        <div className="flex gap-6">
          <a href="mailto:kontakt@course3d.pl" className="hover:text-text-secondary">
            kontakt@course3d.pl
          </a>
          <a href="#cennik" className="hover:text-text-secondary">Cennik</a>
          <a href="#business" className="hover:text-text-secondary">Dla firm</a>
        </div>
        <span>© {new Date().getFullYear()} Course3D. Wszelkie prawa zastrzeżone.</span>
      </div>
    </footer>
  );
}

// --- Main export ---

export default function LandingClient() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-text-primary">
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <WhatYouGetSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
