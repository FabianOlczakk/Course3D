"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
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

export default function LandingClient() {
  const { theme } = useLandingTheme();
  const target = new Date("2026-09-01T00:00:00");
  const { days, hours, minutes, seconds } = useCountdown(target);

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
          <Link
            href="/login"
            className="neo-brutal-btn rounded-lg border-2 border-black bg-[#9d6bff] px-6 py-2 text-sm font-bold text-white"
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            Zaloguj się
          </Link>
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

      {/* Benefits Section - Will be completed with extracted content */}
      <section className="px-6 py-24" style={{ background: "#161616" }}>
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="mb-12 text-center text-4xl font-bold text-white">
              Co dostajesz w pakiecie?
            </h2>
          </FadeUp>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Benefits cards will go here - waiting for extracted content */}
            <p className="col-span-full text-center text-[#8a8a8a]">
              Loading complete content...
            </p>
          </div>
        </div>
      </section>

      {/* Printer Section */}
      <section className="px-6 py-24" style={{ background: "#1c1c1c" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <FadeUp>
              <FdmAnimation />
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="text-4xl font-bold text-white">
                Bambu Lab A1 Mini — najlepsza drukarka na start
              </h2>
              <p className="mt-4 text-lg text-[#b4b4b4]">
                Nie musisz szukać drukarki na własną rękę. Dostajesz jedną z najlepszych maszyn na rynku.
              </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-black px-6 py-10" style={{ background: "#161616" }}>
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm text-[#8a8a8a]">
            © 2026 Interaktywny kurs druku 3D. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
    </div>
  );
}
