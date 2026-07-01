"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Printer,
  Sparkles,
  Award,
  BookOpen,
  Users,
  Zap,
  Layers,
  Wifi,
  Box,
  Clock,
  Trophy,
  MessageCircle,
  Headphones,
  ChevronDown,
  Mail,
  Phone,
} from "lucide-react";

// Theme hook
function useLandingTheme() {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const raw = localStorage.getItem("theme") ?? "dark";
    const resolved: "dark" | "light" = raw === "light" ? "light" : "dark";
    setThemeState(resolved);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(resolved);
  }, []);

  return { theme };
}

// Countdown Timer Hook
function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

// FDM Animation with masked shape
function FdmAnimation() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
    }, 35);
    return () => clearInterval(interval);
  }, []);

  const height = (progress / 100) * 176;

  return (
    <div className="relative">
      <div
        className="neo-brutal-card rounded-2xl border-2 border-black p-6"
        style={{
          background: "#1e1e1e",
          boxShadow: "8px 8px 0 #000",
        }}
      >
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#9d6bff]" />
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[#9d6bff]">
            FDM · druk na żywo
          </p>
        </div>

        <div className="relative mx-auto h-[280px] w-full max-w-[320px]">
          <svg viewBox="0 0 320 280" className="h-full w-full">
            <defs>
              <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
              </pattern>

              <mask id="print-mask">
                <rect width="320" height="280" fill="black" />
                <path
                  d="M 160 60 L 150 75 L 155 90 L 145 120 L 140 160 L 135 200 L 125 240 L 195 240 L 185 200 L 180 160 L 175 120 L 165 90 L 170 75 Z"
                  fill="white"
                />
              </mask>
            </defs>

            <rect width="320" height="280" fill="url(#grid)" />

            {/* Frame */}
            <rect x="30" y="20" width="6" height="220" rx="3" fill="#2b2b2b" stroke="#000" strokeWidth="1" />
            <rect x="284" y="20" width="6" height="220" rx="3" fill="#2b2b2b" stroke="#000" strokeWidth="1" />

            {/* Animated printed object with mask */}
            <g mask="url(#print-mask)">
              <rect
                x="60"
                y={240 - height}
                width="200"
                height={height}
                fill="url(#grad)"
                opacity="0.8"
              />
            </g>

            <defs>
              <linearGradient id="grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#9d6bff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#9d6bff" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Bed */}
            <rect x="28" y="240" width="264" height="10" rx="4" fill="#1e1e1e" stroke="#000" strokeWidth="2" />

            {/* Print head */}
            <rect
              x="140"
              y={240 - height - 35}
              width="40"
              height="30"
              rx="6"
              fill="#9d6bff"
              stroke="#000"
              strokeWidth="2"
            />

            <circle
              cx="160"
              cy={240 - height - 10}
              r="4"
              fill="#fff"
              className="animate-pulse"
            />

            <text x="160" y="268" textAnchor="middle" fontSize="11" fontWeight="600" fill="#8a8a8a" fontFamily="monospace">
              Warstwa {Math.floor(progress / 5)}/20
            </text>
          </svg>
        </div>

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          className="absolute -right-4 -top-4 rounded-xl border-2 border-black bg-[#9d6bff] px-4 py-2 text-xs font-bold text-white"
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          do 500 mm/s
        </motion.div>
      </div>
    </div>
  );
}

// Animation helpers
function FadeUp({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
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
          transition={{ duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// Benefits data
const benefits = [
  {
    icon: GraduationCap,
    title: "Interaktywny kurs po polsku",
    desc: "Od rozpakowania drukarki po modelowanie — krok po kroku, z zadaniami.",
    color: "#9d6bff",
  },
  {
    icon: Printer,
    title: "Bambu Lab A1 Mini w zestawie",
    desc: "Otrzymujesz fizyczną drukarkę 3D gotową do druku od razu po dostawie.",
    color: "#3ecf8e",
  },
  {
    icon: Box,
    title: "Filament PLA + PETG",
    desc: "Dwa najważniejsze materiały na start — od razu masz z czego drukować.",
    color: "#5b8def",
  },
  {
    icon: BookOpen,
    title: "Quizy i zadania praktyczne",
    desc: "Sprawdź które lekcje masz za sobą i ile zostało Ci do certyfikatu.",
    color: "#e0944a",
  },
  {
    icon: Award,
    title: "Certyfikat ukończenia",
    desc: "Po ukończeniu kursu otrzymasz certyfikat potwierdzający umiejętności.",
    color: "#9d6bff",
  },
  {
    icon: Trophy,
    title: "Konkursy z nagrodami",
    desc: "Regularne konkursy na platformie z realnymi nagrodami dla kursantów.",
    color: "#3ecf8e",
  },
  {
    icon: Users,
    title: "Społeczność kursantów",
    desc: "Zadawaj pytania, dziel się wydrukami i ucz się razem z innymi kursantami.",
    color: "#5b8def",
  },
  {
    icon: MessageCircle,
    title: "Wiadomości do instruktora",
    desc: "Pisz prywatne wiadomości bezpośrednio do instruktora przez platformę.",
    color: "#e0944a",
  },
  {
    icon: BookOpen,
    title: "Wiki i baza wiedzy",
    desc: "Baza wiedzy z poradnikami, profilami slicera i parametrami druku.",
    color: "#9d6bff",
  },
  {
    icon: Headphones,
    title: "Wsparcie techniczne",
    desc: "Pomoc w konfiguracji, rozwiązywaniu problemów i doborze ustawień.",
    color: "#3ecf8e",
  },
  {
    icon: Sparkles,
    title: "Aktualizacje w cenie",
    desc: "Uczysz się we własnym tempie, a wszystkie przyszłe aktualizacje masz w cenie.",
    color: "#5b8def",
  },
  {
    icon: Clock,
    title: "Dożywotni dostęp",
    desc: "Płacisz raz, korzystasz na zawsze — bez subskrypcji ani ukrytych opłat.",
    color: "#e0944a",
  },
];

// Printer specs
const printerSpecs = [
  { label: "Prędkość druku", value: "do 500 mm/s", icon: Zap },
  { label: "Przyspieszenie", value: "10 000 mm/s²", icon: Zap },
  { label: "Pole robocze", value: "180×180×180 mm", icon: Layers },
  { label: "Łączność", value: "WiFi + microSD", icon: Wifi },
  { label: "Kalibracja", value: "Automatyczna", icon: Award },
  { label: "Rodzaj drukarki", value: "FDM", icon: Printer },
  { label: "Obsługiwane materiały", value: "PLA · PETG · TPU · PVA", icon: Box },
  { label: "Głośność", value: "~45 dB", icon: Headphones },
  { label: "Gwarancja", value: "12 miesięcy", icon: Award },
];

// Platform features
const platformFeatures = [
  {
    icon: BookOpen,
    title: "Lekcje wideo i materiały",
    desc: "Sprawdzaj wiedzę i obserwuj drogę do certyfikatu.",
  },
  {
    icon: Users,
    title: "Społeczność i forum",
    desc: "Wymieniaj się pomysłami i rozwiązaniami z innymi kursantami.",
  },
  {
    icon: Trophy,
    title: "Konkursy i nagrody",
    desc: "Bierz udział w wyzwaniach i wygrywaj rzeczywiste nagrody.",
  },
];

// FAQ data
const faqItems = [
  {
    q: "Czy drukarka jest naprawdę w zestawie?",
    a: "Tak, drukarka Bambu Lab A1 Mini jest fizycznie wysyłana do Ciebie kurierem na terenie Polski w oryginalnym opakowaniu fabrycznym.",
  },
  {
    q: "Czy mogę kupić tylko kurs bez drukarki?",
    a: "Obecnie oferujemy jeden pakiet kompletny: drukarka + kurs. To celowy wybór — program jest zaprojektowany tak, żebyś uczył się drukując naprawdę, a nie tylko oglądając filmy.",
  },
  {
    q: "Czy potrzebuję wcześniejszej wiedzy o druku 3D?",
    a: "Nie. Kurs jest zaprojektowany od zera — prowadzi Cię od pierwszego uruchomienia drukarki aż po zaawansowane techniki modelowania i optymalizację parametrów druku.",
  },
  {
    q: "Jak długo mam dostęp do kursu?",
    a: "Dostęp jest dożywotni. Płacisz raz, korzystasz na zawsze, włącznie ze wszystkimi przyszłymi aktualizacjami materiałów i nowymi lekcjami.",
  },
  {
    q: "Co to znaczy \"interaktywny kurs\"?",
    a: "Oprócz filmów dostajesz quizy po każdym module, zadania praktyczne do wykonania, forum społeczności, prywatne wiadomości do instruktora, wiki z wiedzą i system śledzenia postępów.",
  },
  {
    q: "Jakie filamenty są w zestawie?",
    a: "Dostajesz PLA i PETG — dwa podstawowe materiały. PLA jest łatwy w druku, biodegradowalny, idealny dla początkujących. PETG jest mocniejszy, odporny na temperaturę i wilgoć, nadaje się do części funkcjonalnych.",
  },
  {
    q: "Czym wyróżnia się Bambu Lab A1 Mini?",
    a: "To jedna z najbardziej zaawansowanych drukarek w swojej klasie: automatyczne poziomowanie, druk wielokolorowy z AMS Lite, prędkość 500 mm/s, WiFi z aplikacją mobilną i pełna auto-kalibracja.",
  },
  {
    q: "Czy będę mógł modelować własne projekty?",
    a: "Tak. Kurs obejmuje podstawy modelowania 3D w bezpłatnych programach. Pod koniec będziesz potrafić zaprojektować i wydrukować własny projekt od zera.",
  },
  {
    q: "Czy otrzymam certyfikat?",
    a: "Tak. Po ukończeniu wszystkich modułów i zaliczeniu quizów otrzymujesz certyfikat ukończenia kursu w formie cyfrowej.",
  },
  {
    q: "Czy mogę kupić kurs dla firmy?",
    a: "Tak! Oferujemy specjalne warunki dla firm i grup. Skontaktuj się z nami na kurs@magbase.pl — przygotujemy ofertę szytą na miarę.",
  },
  {
    q: "Jak wygląda wysyłka drukarki?",
    a: "Drukarka jest wysyłana kurierem na terenie Polski. Czas dostawy to zazwyczaj 2–5 dni roboczych od potwierdzenia zamówienia.",
  },
  {
    q: "Co jeśli drukarka będzie miała problem?",
    a: "Bambu Lab oferuje wsparcie techniczne i gwarancję. Kurs obejmuje też moduł diagnostyczny — nauczysz się rozwiązywać najczęstsze problemy samodzielnie.",
  },
  {
    q: "Jak długo trwa kurs?",
    a: "Program składa się z ponad 40 lekcji. Przy regularnej nauce (3–4 godziny tygodniowo) ukończysz kurs w 6–8 tygodni. Możesz jednak uczyć się w dowolnym tempie.",
  },
  {
    q: "Czy kurs będzie aktualizowany?",
    a: "Tak. Wraz z pojawieniem się nowych funkcji drukarki lub nowych technik druku, materiały są aktualizowane. Wszystkie aktualizacje są bezpłatne.",
  },
  {
    q: "Jak mogę się skontaktować?",
    a: "Napisz na kurs@magbase.pl lub zadzwoń pod +48 571 082 475. Odpowiadamy w ciągu 24 godzin w dni robocze.",
  },
];

export default function LandingClient() {
  const { theme } = useLandingTheme();
  const target = new Date("2026-09-01T00:00:00");
  const { days, hours, minutes, seconds } = useCountdown(target);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ background: "#161616", color: "#ededed", minHeight: "100vh" }}>
      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 border-b-2 border-black backdrop-blur-md"
        style={{ background: "rgba(22, 22, 22, 0.95)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-xl font-bold text-white">
            <Sparkles className="h-5 w-5 text-[#9d6bff]" />
            Interaktywny kurs druku 3D
          </span>
          <div className="flex items-center gap-3">
            <a href="#omnie" className="hidden text-sm text-[#b4b4b4] transition-colors hover:text-white sm:block">
              O mnie
            </a>
            <a href="#cennik" className="hidden text-sm text-[#b4b4b4] transition-colors hover:text-white sm:block">
              Cennik
            </a>
            <a href="#faq" className="hidden text-sm text-[#b4b4b4] transition-colors hover:text-white sm:block">
              FAQ
            </a>
            <Link
              href="/login"
              className="neo-brutal-btn rounded-lg border-2 border-black bg-[#9d6bff] px-6 py-2 text-sm font-bold text-white"
              style={{ boxShadow: "4px 4px 0 #000" }}
            >
              Zaloguj się
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden px-6 py-24" style={{ background: "#9d6bff" }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-1.5 text-sm font-bold text-black"
            style={{ boxShadow: "3px 3px 0 #000" }}
          >
            <Sparkles className="h-4 w-4" />
            Druk 3D od podstaw
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold leading-tight text-white md:text-6xl lg:text-7xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Interaktywny kurs<br />druku 3D online.<br />
            <span style={{ color: "#000" }}>Bambu Lab A1 Mini gratis!</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-white"
          >
            Naucz się drukowania 3D od praktyka z realnym biznesem produkcyjnym.
            Otrzymasz drukarkę Bambu Lab A1 Mini, zestaw filamentów oraz pełny dostęp do interaktywnej platformy kursowej.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/login"
              className="neo-brutal-btn rounded-lg border-2 border-black bg-white px-8 py-4 text-lg font-bold text-black"
              style={{ boxShadow: "6px 6px 0 #000" }}
            >
              Przejdź do kursu →
            </Link>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 inline-flex flex-col items-center gap-4 rounded-2xl border-2 border-black bg-white p-6"
            style={{ boxShadow: "8px 8px 0 #000" }}
          >
            <p className="text-sm font-bold uppercase tracking-wider text-black">
              <Clock className="mr-2 inline h-4 w-4" />
              Kurs startuje 1 września 2026
            </p>
            <div className="flex gap-4">
              {[
                { val: days, label: "dni" },
                { val: hours, label: "godz" },
                { val: minutes, label: "min" },
                { val: seconds, label: "sek" },
              ].map(({ val, label }, idx) => (
                <div key={label} className="flex flex-col items-center">
                  <div
                    className="rounded-xl border-2 border-black px-4 py-3 text-2xl font-extrabold tabular-nums"
                    style={{
                      background: idx === 3 ? "#9d6bff" : "#1e1e1e",
                      color: idx === 3 ? "#fff" : "#9d6bff",
                      boxShadow: "3px 3px 0 #000",
                      minWidth: "64px",
                    }}
                  >
                    {String(val).padStart(2, "0")}
                  </div>
                  <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-black">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="mt-2 rounded-full border-2 border-black bg-[#161616] px-6 py-2"
              style={{ boxShadow: "4px 4px 0 #000" }}
            >
              <span className="text-2xl font-bold text-white">1 999 zł</span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Benefits Section */}
      <section className="px-6 py-24" style={{ background: "#161616" }}>
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="mb-4 text-center text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Co dostajesz w pakiecie?
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-[#b4b4b4]">
              Kompleksowy program nauczania połączony z prawdziwym sprzętem, społecznością i konkursami z nagrodami.
            </p>
          </FadeUp>

          <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="neo-brutal-card rounded-xl border-2 border-black p-6"
                style={{
                  background: "#1e1e1e",
                  boxShadow: "5px 5px 0 #000",
                }}
              >
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border-2 border-black"
                  style={{ background: benefit.color }}
                >
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#b4b4b4]">{benefit.desc}</p>
              </div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Printer Section */}
      <section className="px-6 py-24" style={{ background: "#1c1c1c" }}>
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#3ecf8e] px-4 py-1.5 text-sm font-bold text-black">
              <Printer className="h-4 w-4" />
              Drukarka w zestawie
            </div>
          </FadeUp>

          <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:items-center">
            <FadeUp>
              <FdmAnimation />
            </FadeUp>

            <FadeUp delay={0.1}>
              <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Bambu Lab A1 Mini — najlepsza drukarka na start
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[#b4b4b4]">
                Bambu Lab A1 Mini to <strong className="text-white">najlepsza drukarka dla początkujących na świecie</strong> — łączy prostotę obsługi z jakością znaną z maszyn profesjonalnych. Auto-poziomowanie, cicha praca i błyskawiczny druk sprawiają, że pierwszy udany wydruk zrobisz dosłownie w kilkanaście minut po rozpakowaniu.
              </p>
              <p className="mt-3 text-base leading-relaxed text-[#8a8a8a]">
                Nie musisz niczego składać ani kalibrować ręcznie — drukarka sama przygotowuje się do pracy, a Ty od razu skupiasz się na nauce i tworzeniu.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {printerSpecs.slice(0, 6).map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-start gap-3 rounded-xl border-2 border-black p-4"
                    style={{
                      background: "#161616",
                      boxShadow: "3px 3px 0 #000",
                    }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-black"
                      style={{ background: "#9d6bff" }}
                    >
                      <spec.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8a8a]">{spec.label}</p>
                      <p className="mt-1 text-sm font-bold text-white">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {printerSpecs.slice(6).map((spec) => (
              <div
                key={spec.label}
                className="flex items-start gap-3 rounded-xl border-2 border-black p-4"
                style={{
                  background: "#161616",
                  boxShadow: "3px 3px 0 #000",
                }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-black"
                  style={{ background: "#5b8def" }}
                >
                  <spec.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8a8a]">{spec.label}</p>
                  <p className="mt-1 text-sm font-bold text-white">{spec.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filament Section */}
      <section className="px-6 py-24" style={{ background: "#161616" }}>
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="mb-4 text-center text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Filament PLA i PETG — w zestawie
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-[#b4b4b4]">
              Dwa podstawowe i najważniejsze materiały do druku 3D, każdy z unikalnym zastosowaniem.
            </p>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-2">
            <FadeUp delay={0.05}>
              <div
                className="neo-brutal-card rounded-2xl border-2 border-black p-8"
                style={{
                  background: "#1e1e1e",
                  boxShadow: "6px 6px 0 #000",
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-full border-2 border-black"
                    style={{ background: "#a855f7" }}
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-white">PLA</h3>
                    <p className="text-sm text-[#8a8a8a]">Polilaktyd — idealny dla początkujących</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {[
                    "Najłatwiejszy do drukowania materiał",
                    "Biodegradowalny — przyjazny środowisku",
                    "Dostępny w dziesiątkach kolorów",
                    "Świetna dokładność wymiarowa",
                    "Niskie temperatury druku (190–220°C)",
                    "Idealne do figurek i dekoracji",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#a855f7]" />
                      <span className="text-sm text-[#b4b4b4]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div
                className="neo-brutal-card rounded-2xl border-2 border-black p-8"
                style={{
                  background: "#1e1e1e",
                  boxShadow: "6px 6px 0 #000",
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-full border-2 border-black"
                    style={{ background: "#22d3ee" }}
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-white">PETG</h3>
                    <p className="text-sm text-[#8a8a8a]">Wytrzymałość i funkcjonalność</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {[
                    "Znacznie mocniejszy od PLA",
                    "Odporny na temperaturę do ~80°C",
                    "Odporny na wilgoć i chemikalia",
                    "Dopuszczony do kontaktu z żywnością",
                    "Elastyczniejszy, mniej kruchy",
                    "Idealny do części mechanicznych",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#22d3ee]" />
                      <span className="text-sm text-[#b4b4b4]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="px-6 py-24" style={{ background: "#1c1c1c" }}>
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="mb-4 text-center text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Platforma kursowa
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-[#b4b4b4]">
              Nowoczesna platforma edukacyjna z narzędziami, które realnie wspierają naukę — lekcje, quizy, społeczność i postępy w jednym panelu.
            </p>
          </FadeUp>

          <StaggerGrid className="grid gap-6 md:grid-cols-3">
            {platformFeatures.map((feature, idx) => (
              <div
                key={feature.title}
                className="neo-brutal-card rounded-xl border-2 border-black p-6"
                style={{
                  background: "#161616",
                  boxShadow: "5px 5px 0 #000",
                }}
              >
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border-2 border-black"
                  style={{ background: ["#9d6bff", "#3ecf8e", "#e0944a"][idx] }}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#b4b4b4]">{feature.desc}</p>
              </div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* About Me Section */}
      <section id="omnie" className="px-6 py-24" style={{ background: "#161616" }}>
        <div className="mx-auto max-w-4xl">
          <FadeUp>
            <h2 className="mb-8 text-center text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Cześć, nazywam się Fabian Olczak
            </h2>
            <div className="space-y-4 text-lg leading-relaxed text-[#b4b4b4]">
              <p>
                Od trzech lat zajmuję się drukiem 3D, a od ponad roku prowadzę własną firmę <strong className="text-white">Magbase</strong>, w której projektuję i produkuję gotowe produkty — wykorzystując druk 3D, druk UV i laser. Na co dzień pracuję na drukarkach Bambu Lab (m.in. H2C, P1S i A1), więc sprzęt, który dostajesz w zestawie kursu, znam nie z teorii, ale z codziennej, produkcyjnej eksploatacji — od pierwszego wydruku po skalowanie produkcji do tysięcy sztuk.
              </p>
              <p>
                Ten kurs to połączenie dwóch rzeczy, którymi żyję na co dzień: praktycznej wiedzy o druku 3D zdobytej w realnym biznesie oraz zaplecza technicznego, dzięki któremu pokażę Ci nie tylko <em className="text-white">jak</em> drukować, ale też <em className="text-white">dlaczego</em> to działa — i jak uniknąć błędów, które kosztowały mnie setki godzin i kilogramy zmarnowanego filamentu.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Lat doświadczenia", value: "3+" },
                { label: "Wydrukowanych sztuk", value: "10 000+" },
                { label: "Godzin nagrań", value: "40+" },
                { label: "Zadowolonych kursantów", value: "100+" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border-2 border-black p-6 text-center"
                  style={{
                    background: "#1e1e1e",
                    boxShadow: "4px 4px 0 #000",
                  }}
                >
                  <div className="text-3xl font-extrabold text-[#9d6bff]">{stat.value}</div>
                  <div className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#8a8a8a]">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="cennik" className="px-6 py-24" style={{ background: "#1c1c1c" }}>
        <div className="mx-auto max-w-5xl">
          <FadeUp>
            <h2 className="mb-4 text-center text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Jednorazowa opłata
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-[#b4b4b4]">
              Drukarka i dostęp do kursu w jednym pakiecie.
            </p>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-2">
            <FadeUp delay={0.05}>
              <div
                className="neo-brutal-card rounded-2xl border-2 border-black p-8"
                style={{
                  background: "#161616",
                  boxShadow: "8px 8px 0 #000",
                }}
              >
                <div className="mb-2 inline-flex rounded-full border-2 border-black bg-[#9d6bff] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Pakiet indywidualny
                </div>
                <div className="mt-5">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-extrabold text-white">1 999 zł</span>
                    <span className="mb-2 text-sm text-[#8a8a8a]">jednorazowo</span>
                  </div>
                  <p className="mt-2 text-sm text-[#b4b4b4]">
                    Drukarka Bambu Lab A1 Mini + dożywotni dostęp do platformy
                  </p>
                </div>

                <ul className="mt-6 space-y-3">
                  {[
                    "Drukarka Bambu Lab A1 Mini",
                    "Filament PLA + PETG na start",
                    "Dożywotni dostęp do platformy kursu",
                    "Wszystkie przyszłe aktualizacje materiałów",
                    "Dostęp do społeczności, konkursów i wsparcia",
                    "Certyfikat ukończenia kursu",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3ecf8e]" />
                      <span className="text-sm text-[#b4b4b4]">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className="neo-brutal-btn mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-[#9d6bff] px-6 py-4 text-base font-bold text-white"
                  style={{ boxShadow: "5px 5px 0 #000" }}
                >
                  Kup teraz
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div
                className="neo-brutal-card rounded-2xl border-2 border-black p-8"
                style={{
                  background: "#161616",
                  boxShadow: "8px 8px 0 #000",
                }}
              >
                <div className="mb-2 inline-flex rounded-full border-2 border-black bg-[#3ecf8e] px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
                  Dla firm i instytucji
                </div>
                <div className="mt-5">
                  <div className="text-2xl font-bold text-white">Cena do negocjacji</div>
                  <p className="mt-2 text-sm text-[#b4b4b4]">
                    Kupujesz dla więcej niż jednej osoby? Masz szkołę, firmę produkcyjną lub chcesz wyposażyć pracownię? Przygotujemy ofertę dopasowaną.
                  </p>
                </div>

                <ul className="mt-6 space-y-3">
                  {[
                    "Zniżki od 2 pakietów wzwyż",
                    "Dedykowany opiekun konta",
                    "Faktura VAT",
                    "Możliwość płatności w ratach",
                    "Szkolenia live dla Twojego zespołu",
                    "Priorytetowe wsparcie techniczne",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3ecf8e]" />
                      <span className="text-sm text-[#b4b4b4]">{item}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="mailto:kurs@magbase.pl"
                  className="neo-brutal-btn mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-6 py-4 text-base font-bold text-black"
                  style={{ boxShadow: "5px 5px 0 #000" }}
                >
                  <Mail className="h-5 w-5" />
                  Napisz do nas
                </a>
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.1}>
            <div className="mt-8 text-center">
              <p className="text-sm text-[#8a8a8a]">
                Masz pytania? Napisz na{" "}
                <a href="mailto:kurs@magbase.pl" className="font-semibold text-[#9d6bff] underline-offset-2 hover:underline">
                  kurs@magbase.pl
                </a>{" "}
                lub zadzwoń{" "}
                <a href="tel:+48571082475" className="font-semibold text-[#9d6bff] underline-offset-2 hover:underline">
                  +48 571 082 475
                </a>
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-6 py-24" style={{ background: "#161616" }}>
        <div className="mx-auto max-w-3xl">
          <FadeUp>
            <h2 className="mb-4 text-center text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Najczęstsze pytania
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-[#b4b4b4]">
              Nie znalazłeś odpowiedzi? Napisz do nas na <a href="mailto:kurs@magbase.pl" className="font-semibold text-[#9d6bff] underline-offset-2 hover:underline">kurs@magbase.pl</a>
            </p>
          </FadeUp>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <FadeUp key={i} delay={Math.min(i * 0.04, 0.4)}>
                <div
                  className="overflow-hidden rounded-xl border-2 border-black"
                  style={{
                    background: "#1e1e1e",
                    boxShadow: "4px 4px 0 #000",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[#252525]"
                  >
                    <span className="pr-4 font-bold text-white">{item.q}</span>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="h-5 w-5 text-[#8a8a8a]" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="border-t-2 border-black px-5 pb-5 pt-4 text-sm leading-relaxed text-[#b4b4b4]">
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

      {/* Final CTA Section */}
      <section className="relative overflow-hidden px-6 py-24" style={{ background: "#9d6bff" }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <FadeUp>
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Gotowy, żeby zacząć drukować?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white">
              Drukarka dostarczana pod drzwi, kurs dostępny od pierwszego dnia. Jedna opłata — dożywotni dostęp do wiedzy i społeczności.
            </p>
            <Link
              href="/login"
              className="neo-brutal-btn mt-8 inline-flex items-center gap-2 rounded-lg border-2 border-black bg-white px-8 py-4 text-lg font-bold text-black"
              style={{ boxShadow: "6px 6px 0 #000" }}
            >
              Zacznij teraz — 1 999 zł
              <ArrowRight className="h-5 w-5" />
            </Link>

            <div className="mt-8 flex flex-col items-center gap-2 text-sm text-white">
              <a href="mailto:kurs@magbase.pl" className="flex items-center gap-2 transition-colors hover:text-black">
                <Mail className="h-4 w-4" />
                kurs@magbase.pl
              </a>
              <a href="tel:+48571082475" className="flex items-center gap-2 transition-colors hover:text-black">
                <Phone className="h-4 w-4" />
                +48 571 082 475
              </a>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-black px-6 py-12" style={{ background: "#161616" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 text-lg font-bold text-white">
                <Sparkles className="h-5 w-5 text-[#9d6bff]" />
                Interaktywny kurs druku 3D
              </div>
              <p className="mt-3 text-sm text-[#8a8a8a]">
                Kurs druku 3D z prawdziwą drukarką Bambu Lab A1 Mini i dożywotnim dostępem do platformy. Prowadzi Fabian Olczak (Magbase).
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Nawigacja</h4>
              <div className="space-y-2 text-sm">
                <div><a href="#omnie" className="text-[#8a8a8a] transition-colors hover:text-white">O mnie</a></div>
                <div><a href="#cennik" className="text-[#8a8a8a] transition-colors hover:text-white">Cennik</a></div>
                <div><a href="#faq" className="text-[#8a8a8a] transition-colors hover:text-white">FAQ</a></div>
                <div><Link href="/login" className="text-[#8a8a8a] transition-colors hover:text-white">Zaloguj się</Link></div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Kontakt</h4>
              <div className="space-y-2 text-sm text-[#8a8a8a]">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:kurs@magbase.pl" className="transition-colors hover:text-white">kurs@magbase.pl</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+48571082475" className="transition-colors hover:text-white">+48 571 082 475</a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t-2 border-black pt-8 text-center">
            <p className="text-xs text-[#8a8a8a]">
              © 2026 Interaktywny kurs druku 3D · Magbase. Wszelkie prawa zastrzeżone.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs">
              <Link href="/polityka-prywatnosci" className="text-[#8a8a8a] transition-colors hover:text-white">
                Polityka prywatności
              </Link>
              <Link href="/regulamin" className="text-[#8a8a8a] transition-colors hover:text-white">
                Regulamin platformy
              </Link>
              <Link href="/warunki" className="text-[#8a8a8a] transition-colors hover:text-white">
                Warunki świadczenia usług
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
