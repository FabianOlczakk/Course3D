"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import {
  ArrowRight,
  Home,
  Sparkles,
  Layers,
  Zap,
  Box,
  Printer,
  GraduationCap,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";

// Theme hook
function useDemoTheme() {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const raw = localStorage.getItem("theme") ?? "dark";
    const resolved: "dark" | "light" =
      raw === "light"
        ? "light"
        : raw === "system"
        ? window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
        : "dark";
    setThemeState(resolved);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(resolved);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(next);
    localStorage.setItem("theme", next);
  };

  return { theme, toggle };
}

// Parallax layer component
function ParallaxLayer({
  children,
  speed = 0.5,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 200]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div ref={ref} style={{ y: smoothY }} className={className}>
      {children}
    </motion.div>
  );
}

// Scale on scroll component
function ScaleOnScroll({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <motion.div ref={ref} style={{ scale, opacity }} className={className}>
      {children}
    </motion.div>
  );
}

// Reveal component
function RevealOnScroll({
  children,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const variants = {
    up: { y: 60 },
    down: { y: -60 },
    left: { x: 60 },
    right: { x: -60 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...variants[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Sticky scale section
function StickyScaleSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.6]);

  return (
    <div ref={containerRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div style={{ scale, opacity }} className="text-center">
          <motion.div
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl"
            style={{ background: "var(--accent-glow)" }}
          >
            <Printer className="h-12 w-12" style={{ color: "var(--accent)" }} />
          </motion.div>
          <h2 className="text-5xl font-extrabold md:text-6xl" style={{ color: "var(--text-primary)" }}>
            Sticky Scale Effect
          </h2>
          <p className="mt-4 text-xl" style={{ color: "var(--text-secondary)" }}>
            Element skaluje się podczas przewijania
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Horizontal scroll section
function HorizontalScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66.666%"]);

  const cards = [
    {
      icon: Layers,
      title: "Multi-Layer Parallax",
      desc: "Różne warstwy poruszają się z różnymi prędkościami",
      color: "#a855f7",
    },
    {
      icon: Zap,
      title: "Scroll Triggers",
      desc: "Animacje uruchamiane przy konkretnych pozycjach scroll",
      color: "#22d3ee",
    },
    {
      icon: Box,
      title: "3D Transforms",
      desc: "Rotacje i perspektywa bazowane na pozycji scrolla",
      color: "#f59e0b",
    },
  ];

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      <div className="sticky top-0 flex h-screen items-center">
        <motion.div style={{ x }} className="flex gap-8 px-6">
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex h-[400px] w-[400px] shrink-0 flex-col items-center justify-center rounded-3xl border p-8 text-center"
              style={{
                borderColor: "var(--border-glow)",
                background: "var(--bg-elevated)",
              }}
            >
              <div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
                style={{ background: `${card.color}22`, border: `2px solid ${card.color}` }}
              >
                <card.icon className="h-10 w-10" style={{ color: card.color }} />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {card.title}
              </h3>
              <p className="mt-3 text-lg" style={{ color: "var(--text-secondary)" }}>
                {card.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Floating elements background
function FloatingElements() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => {
        const size = 40 + Math.random() * 80;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = 15 + Math.random() * 15;
        const delay = Math.random() * 5;

        return (
          <motion.div
            key={i}
            className="absolute rounded-2xl opacity-10"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${top}%`,
              background: "var(--accent)",
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, 30, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

// Nav
function DemoNav() {
  const { theme, toggle } = useDemoTheme();

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-md"
      style={{
        borderColor: "var(--border-subtle)",
        background: "color-mix(in srgb, var(--bg-base) 80%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          <Home className="h-5 w-5" style={{ color: "var(--accent)" }} />
          Powrót do strony głównej
        </Link>
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:bg-[var(--bg-elevated)]"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}

// Hero with parallax
function ParallaxHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      <FloatingElements />

      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(157,107,255,0.3), transparent)",
        }}
      />

      {/* Content */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2"
          style={{
            borderColor: "var(--border-glow)",
            background: "var(--bg-elevated)",
          }}
        >
          <Sparkles className="h-5 w-5" style={{ color: "var(--accent)" }} />
          <span style={{ color: "var(--text-secondary)" }}>Zaawansowane animacje parallax</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="bg-gradient-to-br from-[var(--text-primary)] via-purple-300 to-purple-500 bg-clip-text text-6xl font-extrabold leading-tight text-transparent md:text-7xl lg:text-8xl"
        >
          Scroll Animations
          <br />
          Demo
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mx-auto mt-8 max-w-2xl text-xl"
          style={{ color: "var(--text-secondary)" }}
        >
          Demonstracja nowoczesnych technik animacji: parallax wielowarstwowy, scroll-triggered transforms, sticky
          scaling i horizontal scroll sections.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-10"
        >
          <a
            href="#content"
            className="glow-btn inline-flex items-center gap-2 rounded-md px-8 py-4 text-lg font-semibold text-white shadow-glow"
          >
            Przewiń w dół
            <ArrowRight className="h-5 w-5" />
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        style={{ color: "var(--text-muted)" }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm">Przewiń</span>
          <ArrowRight className="h-5 w-5 rotate-90" />
        </div>
      </motion.div>
    </div>
  );
}

// Layered parallax section
function LayeredParallaxSection() {
  return (
    <section id="content" className="relative min-h-screen overflow-hidden py-32">
      <div className="mx-auto max-w-6xl px-6">
        <RevealOnScroll>
          <div className="text-center">
            <h2 className="text-5xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              Multi-Layer Parallax
            </h2>
            <p className="mt-4 text-xl" style={{ color: "var(--text-secondary)" }}>
              Różne elementy poruszają się z różnymi prędkościami
            </p>
          </div>
        </RevealOnScroll>

        <div className="relative mt-20 grid gap-8 md:grid-cols-3">
          <ParallaxLayer speed={0.3}>
            <RevealOnScroll delay={0.1} direction="up">
              <div
                className="rounded-2xl border p-8"
                style={{ borderColor: "var(--border-subtle)", background: "var(--bg-elevated)" }}
              >
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: "var(--accent-glow)" }}
                >
                  <GraduationCap className="h-7 w-7" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Wolny Parallax
                </h3>
                <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
                  Ta karta porusza się wolno (speed: 0.3)
                </p>
              </div>
            </RevealOnScroll>
          </ParallaxLayer>

          <ParallaxLayer speed={0.6}>
            <RevealOnScroll delay={0.2} direction="up">
              <div
                className="rounded-2xl border p-8"
                style={{ borderColor: "var(--border-glow)", background: "var(--bg-elevated)" }}
              >
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: "var(--accent-glow)" }}
                >
                  <Zap className="h-7 w-7" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Średni Parallax
                </h3>
                <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
                  Ta karta porusza się średnio (speed: 0.6)
                </p>
              </div>
            </RevealOnScroll>
          </ParallaxLayer>

          <ParallaxLayer speed={1}>
            <RevealOnScroll delay={0.3} direction="up">
              <div
                className="rounded-2xl border p-8"
                style={{ borderColor: "var(--border-subtle)", background: "var(--bg-elevated)" }}
              >
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: "var(--accent-glow)" }}
                >
                  <Layers className="h-7 w-7" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Szybki Parallax
                </h3>
                <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
                  Ta karta porusza się szybko (speed: 1.0)
                </p>
              </div>
            </RevealOnScroll>
          </ParallaxLayer>
        </div>
      </div>
    </section>
  );
}

// Scale reveal section
function ScaleRevealSection() {
  return (
    <section className="relative py-32" style={{ background: "var(--bg-elevated)" }}>
      <div className="mx-auto max-w-4xl px-6">
        <RevealOnScroll>
          <div className="text-center">
            <h2 className="text-5xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              Scale on Scroll
            </h2>
            <p className="mt-4 text-xl" style={{ color: "var(--text-secondary)" }}>
              Elementy skalują się gdy wchodzą i wychodzą z ekranu
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-20 space-y-32">
          {[
            { title: "Krok 1", desc: "Element pojawia się małym scale" },
            { title: "Krok 2", desc: "Rośnie do normalnego rozmiaru" },
            { title: "Krok 3", desc: "Kurczy się przed zniknięciem" },
          ].map((item, i) => (
            <ScaleOnScroll key={i}>
              <div
                className="rounded-3xl border p-12 text-center"
                style={{ borderColor: "var(--border-glow)", background: "var(--bg-card)" }}
              >
                <h3 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {item.title}
                </h3>
                <p className="mt-3 text-lg" style={{ color: "var(--text-secondary)" }}>
                  {item.desc}
                </p>
              </div>
            </ScaleOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

// Feature grid with stagger
function FeatureGrid() {
  const features = [
    {
      icon: Layers,
      title: "Multi-Layer Parallax",
      desc: "Różne warstwy z różnymi prędkościami",
    },
    {
      icon: Zap,
      title: "Scroll Triggers",
      desc: "Animacje przy konkretnych pozycjach",
    },
    {
      icon: Box,
      title: "3D Transforms",
      desc: "Rotacje i perspektywa 3D",
    },
    {
      icon: Sparkles,
      title: "Smooth Springs",
      desc: "Płynne przejścia z fizyką",
    },
  ];

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-32">
      <div className="mx-auto max-w-6xl px-6">
        <RevealOnScroll>
          <div className="text-center">
            <h2 className="text-5xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              Techniki Animacji
            </h2>
            <p className="mt-4 text-xl" style={{ color: "var(--text-secondary)" }}>
              Kolekcja nowoczesnych efektów scroll
            </p>
          </div>
        </RevealOnScroll>

        <div ref={ref} className="mt-20 grid gap-6 md:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-2xl border p-8 transition-all hover:-translate-y-2"
              style={{ borderColor: "var(--border-subtle)", background: "var(--bg-elevated)" }}
            >
              <div
                className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                style={{ background: "var(--accent-glow)" }}
              >
                <feature.icon className="h-8 w-8" style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {feature.title}
              </h3>
              <p className="mt-3 text-lg" style={{ color: "var(--text-secondary)" }}>
                {feature.desc}
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--accent)" }}>
                Zobacz więcej
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Final CTA with parallax
function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-32 text-center"
      style={{ background: "var(--bg-elevated)" }}
    >
      <FloatingElements />

      <motion.div style={{ y, opacity }} className="relative mx-auto max-w-3xl px-6">
        <h2 className="text-5xl font-extrabold md:text-6xl" style={{ color: "var(--text-primary)" }}>
          Wrażenia z animacji?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-xl" style={{ color: "var(--text-secondary)" }}>
          Te techniki można zastosować do dowolnej strony. Framer Motion + React + Tailwind = nieskończone możliwości.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="glow-btn inline-flex items-center gap-2 rounded-md px-8 py-4 text-lg font-semibold text-white shadow-glow"
          >
            <Home className="h-5 w-5" />
            Powrót do strony głównej
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

// Main component
export default function DemoClient() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <DemoNav />
      <ParallaxHero />
      <LayeredParallaxSection />
      <HorizontalScrollSection />
      <StickyScaleSection />
      <ScaleRevealSection />
      <FeatureGrid />
      <FinalCTA />
    </div>
  );
}
