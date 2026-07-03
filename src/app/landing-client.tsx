"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

// ── Theme (same as platform) ──────────────────────────────────────────────────
function useLandingTheme() {
  useEffect(() => {
    const raw = localStorage.getItem("theme") ?? "dark";
    const resolved = raw === "light" ? "light" : "dark";
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(resolved);
  }, []);
}

// ── Countdown ─────────────────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setT({
        days: Math.floor(diff / 86400000),
        hours: Math.floor(diff / 3600000) % 24,
        minutes: Math.floor(diff / 60000) % 60,
        seconds: Math.floor(diff / 1000) % 60,
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

const SG = "var(--font-space-grotesk), system-ui, sans-serif";

// ── Auto-playing Frame Sequence (looping) ──────────────────────────────────
function AutoPlayFrameSequence({
  startFrame = 8,
  endFrame = 74,
  basePath = "/sequence",
  fps = 24,
}: {
  startFrame?: number;
  endFrame?: number;
  basePath?: string;
  fps?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const frameCount = endFrame - startFrame + 1;

  // Preload klatek
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];
    for (let i = startFrame; i <= endFrame; i++) {
      const img = new Image();
      img.src = `${basePath}/${i}.png`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) setImagesLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === frameCount) setImagesLoaded(true);
      };
      images.push(img);
    }
    imagesRef.current = images;
  }, [startFrame, endFrame, basePath, frameCount]);

  // Rysowanie + pętla klatek
  useEffect(() => {
    if (!imagesLoaded) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function drawFrame(index: number) {
      const img = imagesRef.current[index];
      if (!img || !canvas || !ctx || !img.complete || img.naturalWidth === 0) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;
      if (imgRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = img.width * (canvas.height / img.height);
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = img.height * (canvas.width / img.width);
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    function resize() {
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawFrame(frameRef.current);
    }

    resize();
    window.addEventListener("resize", resize);

    const interval = setInterval(() => {
      frameRef.current = (frameRef.current + 1) % frameCount;
      drawFrame(frameRef.current);
    }, 1000 / fps);

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(interval);
    };
  }, [imagesLoaded, frameCount, fps]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      {!imagesLoaded && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#3a3a3a", fontSize: 14 }}>
          Ładowanie animacji…
        </div>
      )}
    </div>
  );
}

// ── FDM Animation ─────────────────────────────────────────────────────────────
function FdmAnimation() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 0.5)), 35);
    return () => clearInterval(id);
  }, []);

  const height = (progress / 100) * 176;

  return (
    <div style={{ position: "relative", height: 400, background: "#141414", border: "2px solid #000", borderRadius: 16, boxShadow: "8px 8px 0 #000", overflow: "hidden" }}>
      {/* grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#ffffff08 1px,transparent 1px),linear-gradient(90deg,#ffffff08 1px,transparent 1px)", backgroundSize: "26px 26px" }} />
      {/* live badge */}
      <div style={{ position: "absolute", top: 14, left: 14, display: "flex", alignItems: "center", gap: 7, background: "#9d6bff", border: "2px solid #000", borderRadius: 100, padding: "5px 12px", fontFamily: SG, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", boxShadow: "2px 2px 0 #000" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }} /> Druk FDM
      </div>
      {/* SVG print */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 280 300" style={{ width: "100%", maxWidth: 280, height: "auto" }}>
          <defs>
            <linearGradient id="fdm-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#9d6bff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#9d6bff" stopOpacity="0.9" />
            </linearGradient>
            <mask id="fdm-mask">
              <rect width="280" height="300" fill="black" />
              <path d="M 140 60 L 130 75 L 135 92 L 125 125 L 120 165 L 115 210 L 105 255 L 175 255 L 165 210 L 160 165 L 155 125 L 145 92 L 150 75 Z" fill="white" />
            </mask>
          </defs>
          {/* frame */}
          <rect x="28" y="20" width="5" height="220" rx="2" fill="#2b2b2b" stroke="#000" strokeWidth="1" />
          <rect x="247" y="20" width="5" height="220" rx="2" fill="#2b2b2b" stroke="#000" strokeWidth="1" />
          {/* printed fill */}
          <g mask="url(#fdm-mask)">
            <rect x="55" y={255 - height} width="170" height={height} fill="url(#fdm-grad)" opacity="0.85" />
          </g>
          {/* bed */}
          <rect x="26" y="255" width="228" height="9" rx="3" fill="#1e1e1e" stroke="#000" strokeWidth="2" />
          {/* gantry */}
          <rect x="26" y={255 - height - 38} width="228" height="6" rx="2" fill="#2b2b2b" stroke="#000" strokeWidth="1" />
          {/* print head */}
          <rect x="122" y={255 - height - 52} width="36" height="26" rx="5" fill="#9d6bff" stroke="#000" strokeWidth="2" />
          <circle cx="140" cy={255 - height - 26} r="4" fill="#fff" style={{ animation: "pulse 1s ease-in-out infinite" }} />
          <text x="140" y="282" textAnchor="middle" fontSize="11" fontWeight="600" fill="#8a8a8a" fontFamily="monospace">
            Warstwa {Math.floor(progress / 5)}/20
          </text>
        </svg>
      </div>
      {/* speed badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: 14, right: 14, background: "#161616", border: "2px solid #000", borderRadius: 100, padding: "6px 13px", fontFamily: SG, fontSize: 12, fontWeight: 600, color: "#b89dff", boxShadow: "3px 3px 0 #000" }}
      >
        do 500 mm/s
      </motion.div>
    </div>
  );
}

// ── FadeUp animation helper ───────────────────────────────────────────────────
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay }}>
      {children}
    </motion.div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqData: [string, string][] = [
  ["Co dokładnie dostaję w pakiecie?", "Drukarkę Bambu Lab A1 Mini, po kilogramie filamentu PLA i PETG na start, dożywotni dostęp do platformy kursowej, dostęp do społeczności, kontakt z instruktorami oraz certyfikat ukończenia."],
  ["Czy potrzebuję wcześniejszej wiedzy o druku 3D?", "Nie. Kurs prowadzi od zera — od rozpakowania drukarki, krok po kroku."],
  ["Jak długo mam dostęp do kursu?", "Dożywotnio, wraz ze wszystkimi przyszłymi aktualizacjami materiałów."],
  ["Czy mogę kupić kurs dla firmy lub szkoły?", "Tak. Przygotujemy ofertę z rabatem, fakturą VAT i szkoleniami live dla zespołu."],
  ["Jak wygląda wysyłka drukarki?", "Drukarka dostarczana z dniem startu kursu, paczkomatem lub kurierem pod wskazany adres, gotowa do pracy po rozpakowaniu."],
  ["Jak wygląda platforma kursowa?", "Lekcje wideo z timestampami, quizy, forum, wiki, wiadomości do prowadzących i śledzenie postępów — wszystko w jednym miejscu."],
  ["Jak długo trwa kurs?", "Uczysz się we własnym tempie, a dostęp do platformy jest dożywotni — decydujesz sam, ile czasu potrzebujesz."],
  ["Czy otrzymam certyfikat?", "Tak. Po ukończeniu modułów otrzymasz certyfikat potwierdzający Twoje umiejętności."],
  ["Czy kurs będzie aktualizowany?", "Tak. Wszystkie przyszłe aktualizacje materiałów są w cenie pakietu."],
  ["Co jeśli drukarka będzie miała problem techniczny?", "Oferujemy wsparcie techniczne i 12 miesieczną gwarancję na drukarkę. Kurs obejmuje też moduł diagnostyczny — nauczysz się rozwiązywać najczęstsze problemy samodzielnie. W razie potrzeby napisz do nas na kurs@magbase.pl."],
  ["Czy mogę kupić tylko dostęp do kursu bez drukarki?", "Napisz do nas na kurs@magbase.pl — ustalimy indywidualne warunki."],
  ["Jak wygląda płatność?", "Jest to jednorazowa opłata kartą, przelewem lub za pomocą BLIK."],
];

const benefits = [
  { color: "#9d6bff", icon: "M22 10 12 5 2 10l10 5 10-5ZM6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5", title: "Interaktywny kurs po polsku", desc: "Od rozpakowania drukarki — krok po kroku, z zadaniami." },
  { color: "#3ecf8e", icon: "M4 9h16v11H4ZM8 9V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4M8 14h8v6H8Z", title: "Bambu Lab A1 Mini w zestawie", desc: "Otrzymujesz fizyczną drukarkę 3D gotową do druku w dniu startu kursu." },
  { color: "#5b8def", icon: "m12 2 9 5v10l-9 5-9-5V7ZM12 12l9-5M12 12v10M12 12 3 7", title: "Filament PLA + PETG", desc: "Po kilogramie dwóch najważniejszych materiałów na start — od razu masz z czego drukować." },
  { color: "#e0944a", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", title: "Interaktywne quizy", desc: "Sprawdzaj wiedzę po każdym module i otrzymuj natychmiastowy feedback." },
  { color: "#9d6bff", icon: "M3 3v18h18M7 12h3v6M12 8h3v10M17 5h3v13", title: "Śledzenie postępów", desc: "Sprawdź które lekcje masz za sobą i ile zostało Ci do certyfikatu." },
  { color: "#3ecf8e", icon: "M12 8a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-3.5 5.5-1.5 8 5-3 5 3-1.5-8", title: "Certyfikat ukończenia", desc: "Po ukończeniu kursu otrzymasz certyfikat potwierdzający umiejętności." },
  { color: "#e0944a", icon: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M6 4h12v5a6 6 0 0 1-12 0ZM9 18h6M10 22h4M12 14v4", title: "Konkursy z nagrodami", desc: "Regularne konkursy na platformie z realnymi nagrodami dla kursantów." },
  { color: "#5b8def", icon: "M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5A8.5 8.5 0 1 1 21 11.5Z", title: "Forum i społeczność", desc: "Zadawaj pytania, dziel się wydrukami i ucz się razem z innymi kursantami." },
  { color: "#9d6bff", icon: "M3 5h18v14H3ZM3 7l9 6 9-6", title: "Kontakt z prowadzącym", desc: "Pisz prywatne wiadomości bezpośrednio do instruktorów i innych użytkowników przez platformę." },
  { color: "#3ecf8e", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z", title: "Wiki z wiedzą", desc: "Baza wiedzy z poradnikami i rozwiązaniem najczęstszych problemów." },
  { color: "#5b8def", icon: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0", title: "Ogłoszenia i live", desc: "Nie przegap nowych lekcji, sesji live i aktualizacji materiałów." },
  { color: "#e0944a", icon: "M18.4 5.6A9 9 0 1 0 21 12M21 3v6h-6", title: "Dożywotni dostęp", desc: "Uczysz się we własnym tempie, a wszystkie przyszłe aktualizacje masz w cenie." },
];

// ── Main Component ────────────────────────────────────────────────────────────
export function LandingClient() {
  useLandingTheme();
  const target = new Date("2026-09-01T00:00:00");
  const { days, hours, minutes, seconds } = useCountdown(target);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const pad = (n: number) => String(n).padStart(2, "0");
  const buyUrl = `https://magbase.pl/?add-to-cart=2695&quantity=${quantity}`;

  const s = {
    body: { fontFamily: "var(--font-dm-sans), system-ui, sans-serif", color: "#ededed", background: "#161616", overflowX: "hidden" as const },
    maxW: { maxWidth: 1140, margin: "0 auto", padding: "0 24px" },
    sg: "var(--font-space-grotesk), system-ui, sans-serif" as const,
  };

  return (
    <div style={s.body}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(22,22,22,0.95)", backdropFilter: "blur(8px)", borderBottom: "2px solid #000" }}>
        <div style={{ ...s.maxW, padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <a href="#top" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src="/logo.png" alt="Interaktywny Kurs Druku 3D" style={{ height: 36, width: "auto" }} draggable={false} />
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[["#co-dostajesz", "Co dostajesz"], ["#platforma", "Platforma"], ["#o-mnie", "O mnie"], ["#cennik", "Cennik"], ["#firmy", "Dla firm"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} style={{ textDecoration: "none", fontWeight: 600, fontSize: 13.5, color: "#b4b4b4", padding: "9px 11px", borderRadius: 7, transition: "color .15s", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#ededed")}
                onMouseLeave={e => (e.currentTarget.style.color = "#b4b4b4")}
              >{label}</a>
            ))}
            <a href="/login" style={{ textDecoration: "none", fontWeight: 600, fontSize: 13.5, color: "#b4b4b4", padding: "9px 11px", borderRadius: 7, transition: "color .15s", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ededed")}
              onMouseLeave={e => (e.currentTarget.style.color = "#b4b4b4")}
            >Zaloguj się</a>
            <a href="#cennik" style={{ textDecoration: "none", fontWeight: 700, fontSize: 13.5, color: "#fff", padding: "10px 16px", marginLeft: 4, background: "#9d6bff", border: "2px solid #000", borderRadius: 9, boxShadow: "3px 3px 0 #000", transition: "transform .1s, box-shadow .1s", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translate(1px,1px)"; e.currentTarget.style.boxShadow = "2px 2px 0 #000"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "3px 3px 0 #000"; }}
            >Kup kurs</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <header id="top" style={{ background: "#9d6bff", borderBottom: "2px solid #000", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.08) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        <div style={{ ...s.maxW, padding: "70px 24px 80px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 52, alignItems: "center", position: "relative" }}>
          {/* left */}
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: SG, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", background: "#161616", color: "#fff", border: "2px solid #000", borderRadius: 100, padding: "7px 14px", boxShadow: "3px 3px 0 #000" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9d6bff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" /></svg>
              Druk 3D od podstaw
            </span>
            <h1 style={{ fontSize: 60, lineHeight: 1.08, fontWeight: 700, letterSpacing: "-0.03em", margin: "22px 0 20px", color: "#161616", textWrap: "balance", fontFamily: SG }}>
              Interaktywny kurs<br />druku 3D online.<br />
              <span style={{ display: "inline-block", marginTop: 10, background: "#161616", color: "#fff", padding: "2px 12px", border: "2px solid #000", borderRadius: 6 }}>Bambu Lab A1 Mini gratis!</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.55, fontWeight: 500, maxWidth: 520, margin: "0 0 30px", color: "#1c1c1c" }}>
              Naucz się drukowania 3D od osoby, która prowadzi firme zajmującą się drukiem 3D. W cenie otrzymasz drukarkę Bambu Lab A1 Mini, zestaw filamentów oraz pełny dostęp do interaktywnej platformy kursowej.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
              <a href="/login" style={{ textDecoration: "none", fontFamily: SG, fontWeight: 600, fontSize: 16, padding: "15px 26px", background: "#161616", color: "#fff", border: "2px solid #000", borderRadius: 11, boxShadow: "5px 5px 0 #fff", transition: "transform .1s, box-shadow .1s", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translate(2px,2px)"; e.currentTarget.style.boxShadow = "3px 3px 0 #fff"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "5px 5px 0 #fff"; }}
              >Przejdź do kursu →</a>
              <a href="#platforma" style={{ textDecoration: "none", fontFamily: SG, fontWeight: 600, fontSize: 16, padding: "15px 26px", background: "#fff", color: "#161616", border: "2px solid #000", borderRadius: 11, boxShadow: "5px 5px 0 #161616", transition: "transform .1s, box-shadow .1s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translate(2px,2px)"; e.currentTarget.style.boxShadow = "3px 3px 0 #161616"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "5px 5px 0 #161616"; }}
              >Dowiedz się więcej</a>
            </div>
          </motion.div>

          {/* right — countdown card */}
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <div style={{ background: "#161616", border: "2px solid #000", borderRadius: 18, boxShadow: "8px 8px 0 #000", padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: SG, fontSize: 12.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#cfcfcf" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9d6bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                Kurs startuje 1 września 2026
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9, marginTop: 18 }}>
                {[
                  { val: days, label: "dni", accent: false },
                  { val: hours, label: "godz", accent: false },
                  { val: minutes, label: "min", accent: false },
                  { val: seconds, label: "sek", accent: true },
                ].map(({ val, label, accent }) => (
                  <div key={label} style={{ background: accent ? "#9d6bff" : "#242424", border: "2px solid #000", borderRadius: 11, padding: "15px 4px", textAlign: "center" }}>
                    <div style={{ fontFamily: SG, fontSize: 34, fontWeight: 700, lineHeight: 1, color: accent ? "#fff" : "#f0f0f0" }}>{pad(val)}</div>
                    <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 6, color: accent ? "#f0e9ff" : "#8a8a8a" }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: "2px dashed #333", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#7a7a7a" }}>Cena pakietu indywidualnego</span>
                <span style={{ fontFamily: SG, fontSize: 25, fontWeight: 700, color: "#f0f0f0" }}>1 999 zł</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ── BENEFITS ────────────────────────────────────────────────────── */}
      <section id="co-dostajesz" style={{ background: "#161616", borderBottom: "2px solid #000" }}>
        <div style={{ ...s.maxW, padding: "70px 24px" }}>
          <FadeUp>
            <div style={{ maxWidth: 660 }}>
              <span style={{ display: "inline-block", fontFamily: SG, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", background: "#9d6bff", color: "#fff", border: "2px solid #000", borderRadius: 100, padding: "6px 13px", boxShadow: "2px 2px 0 #000" }}>Co dostajesz</span>
              <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.03em", margin: "16px 0 12px", color: "#f0f0f0", fontFamily: SG }}>Wszystko czego potrzebujesz</h2>
              <p style={{ fontSize: 17, fontWeight: 500, margin: 0, lineHeight: 1.5, color: "#8a8a8a" }}>Kompleksowy program nauczania połączony z prawdziwym sprzętem, interaktywną platformą z kursami, zadaniami, społecznością i wiele więcej!</p>
            </div>
          </FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 40 }}>
            {benefits.map((b, i) => (
              <FadeUp key={b.title} delay={i * 0.05}>
                <div style={{ background: "#1e1e1e", border: "2px solid #000", borderRadius: 14, boxShadow: "5px 5px 0 #000", padding: 22 }}>
                  <div style={{ display: "grid", placeItems: "center", width: 48, height: 48, background: b.color, border: "2px solid #000", borderRadius: 11, color: "#161616" }}>
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={b.icon} /></svg>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, margin: "16px 0 7px", color: "#ededed" }}>{b.title}</h3>
                  <p style={{ fontSize: 13.5, lineHeight: 1.5, margin: 0, fontWeight: 400, color: "#8a8a8a" }}>{b.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRINTER + FDM ───────────────────────────────────────────────── */}
      <section style={{ background: "#1c1c1c", borderBottom: "2px solid #000" }}>
        <div style={{ ...s.maxW, padding: "70px 24px", display: "grid", gridTemplateColumns: "0.92fr 1.08fr", gap: 50, alignItems: "center" }}>
          <FadeUp>
            <FdmAnimation />
          </FadeUp>
          <FadeUp delay={0.1}>
            <span style={{ display: "inline-block", fontFamily: SG, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", background: "#9d6bff", color: "#fff", border: "2px solid #000", borderRadius: 100, padding: "6px 13px", boxShadow: "2px 2px 0 #000" }}>Drukarka w zestawie</span>
            <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.03em", margin: "16px 0 14px", color: "#f0f0f0", fontFamily: SG }}>Bambu Lab A1 Mini — najlepsza drukarka na start</h2>
            <p style={{ fontSize: 16.5, fontWeight: 400, lineHeight: 1.6, margin: "0 0 14px", color: "#b4b4b4" }}>
              Uważana za <strong style={{ color: "#ededed", fontWeight: 700 }}>najlepszą drukarkę dla początkujących na świecie</strong>, łączy prostotę obsługi z jakością znaną z maszyn profesjonalnych. Auto-poziomowanie i kalibracja, cicha praca i błyskawiczny druk sprawiają, że pierwszy udany wydruk zrobisz dosłownie w kilkadziesiąt minut po rozpakowaniu.
            </p>
            <p style={{ fontSize: 16.5, fontWeight: 400, lineHeight: 1.6, margin: "0 0 26px", color: "#b4b4b4" }}>
              Nie musisz niczego składać ani kalibrować ręcznie — drukarka sama przygotowuje się do pracy, a Ty od razu skupiasz się na nauce i tworzeniu.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {[
                ["Prędkość druku", "do 500 mm/s"],
                ["Przyspieszenie", "10 000 mm/s²"],
                ["Pole robocze", "180×180×180 mm"],
                ["Poziomowanie i kalibracja", "Automatyczne"],
                ["Kamera i status", "Podgląd live przez aplikacje"],
                ["Temp. dyszy", "do 300°C"],
                ["Materiały", "PLA · PETG · TPU · PVA"],
                ["Łączność", "WiFi + microSD"],
                ["Gwarancja", "12 miesięcy"],
              ].map(([label, val]) => (
                <div key={label} style={{ background: "#1e1e1e", border: "2px solid #000", borderRadius: 11, padding: 14 }}>
                  <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.04em", color: "#7a7a7a" }}>{label}</div>
                  <div style={{ fontFamily: SG, fontSize: 17, fontWeight: 600, marginTop: 4, color: "#ededed" }}>{val}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FILAMENT ────────────────────────────────────────────────────── */}
      <section style={{ background: "#161616", borderBottom: "2px solid #000" }}>
        <div style={{ ...s.maxW, padding: "70px 24px" }}>
          <FadeUp>
            <div style={{ maxWidth: 660 }}>
              <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px", color: "#f0f0f0", fontFamily: SG }}>Filament PLA i PETG — w zestawie</h2>
              <p style={{ fontSize: 17, fontWeight: 500, margin: 0, lineHeight: 1.5, color: "#8a8a8a" }}>Po kilogramie dwóch podstawowych i najważniejszych materiałów do druku 3D, każdy z unikalnym zastosowaniem.</p>
            </div>
          </FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 40 }}>
            {[
              {
                abbr: "PLA", color: "#3ecf8e", name: "PLA", sub: "Idealny dla początkujących",
                items: [["#3ecf8e", "Najłatwiejszy do drukowania materiał"], ["#3ecf8e", "Biodegradowalny — przyjazny środowisku"], ["#3ecf8e", "Dostępny w dziesiątkach kolorów"], ["#3ecf8e", "Świetna dokładność wymiarowa"], ["#3ecf8e", "Niskie temperatury druku (190–220°C)"], ["#3ecf8e", "Idealny do figurek, dekoracji, gadżetów"]],
              },
              {
                abbr: "PETG", color: "#5b8def", name: "PETG", sub: "Wytrzymałość i funkcjonalność",
                items: [["#5b8def", "Znacznie mocniejszy od PLA"], ["#5b8def", "Odporny na temperaturę do ~80°C"], ["#5b8def", "Odporny na wilgoć i chemikalia"], ["#5b8def", "Idealny do części mechanicznych"]],
              },
            ].map((fil) => (
              <FadeUp key={fil.abbr}>
                <div style={{ background: "#1e1e1e", border: "2px solid #000", borderRadius: 16, boxShadow: "6px 6px 0 #000", padding: 30 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ display: "grid", placeItems: "center", width: 54, height: 54, background: fil.color, border: "2px solid #000", borderRadius: 12, fontFamily: SG, fontWeight: 700, fontSize: fil.abbr === "PETG" ? 15 : 17, color: "#161616" }}>{fil.abbr}</div>
                    <div>
                      <div style={{ fontFamily: SG, fontSize: 21, fontWeight: 600, color: "#f0f0f0" }}>{fil.name}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: "#8a8a8a" }}>{fil.sub}</div>
                    </div>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "flex", flexDirection: "column", gap: 11 }}>
                    {fil.items.map(([c, text]) => (
                      <li key={text} style={{ display: "flex", gap: 10, fontSize: 14.5, fontWeight: 500, color: "#c4c4c4" }}>
                        <span style={{ color: c, flex: "none" }}>✔</span>{text}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM SHOWCASE ───────────────────────────────────────────── */}
      <section id="platforma" style={{ background: "#1c1c1c", borderBottom: "2px solid #000" }}>
        <div style={{ ...s.maxW, padding: "70px 24px" }}>
          <FadeUp>
            <div style={{ maxWidth: 660 }}>
              <span style={{ display: "inline-block", fontFamily: SG, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", background: "#9d6bff", color: "#fff", border: "2px solid #000", borderRadius: 100, padding: "6px 13px", boxShadow: "2px 2px 0 #000" }}>Platforma kursowa</span>
              <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.03em", margin: "16px 0 12px", color: "#f0f0f0", fontFamily: SG }}>Wszystko w jednym miejscu</h2>
              <p style={{ fontSize: 17, fontWeight: 500, margin: 0, lineHeight: 1.5, color: "#8a8a8a" }}>Nowoczesna platforma edukacyjna z narzędziami, które realnie wspierają naukę — lekcje, quizy, społeczność i postępy w jednym panelu.</p>
            </div>
          </FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 26, marginTop: 40, alignItems: "center" }}>
            <FadeUp>
              <div style={{ width: "100%", height: 340, border: "2px solid #000", borderRadius: 16, boxShadow: "8px 8px 0 #000", overflow: "hidden", background: "#141414" }}>
                <AutoPlayFrameSequence startFrame={8} endFrame={74} basePath="/sequence" fps={24} />
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { color: "#9d6bff", icon: "M5 3l14 9-14 9V3Z", title: "Lekcje wideo z timestampami", desc: "Przeskakuj do konkretnych fragmentów i ucz się we własnym tempie." },
                  { color: "#3ecf8e", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", title: "Quizy i śledzenie postępów", desc: "Sprawdzaj wiedzę i obserwuj drogę do certyfikatu." },
                  { color: "#5b8def", icon: "M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5A8.5 8.5 0 1 1 21 11.5Z", title: "Forum, wiki i wiadomości", desc: "Społeczność, baza wiedzy i bezpośredni kontakt z prowadzącymi." },
                ].map((item) => (
                  <div key={item.title} style={{ display: "flex", gap: 13, alignItems: "flex-start", background: "#1e1e1e", border: "2px solid #000", borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "grid", placeItems: "center", width: 38, height: 38, flex: "none", background: item.color, border: "2px solid #000", borderRadius: 9, color: "#161616" }}>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                    </div>
                    <div>
                      <div style={{ fontFamily: SG, fontWeight: 600, fontSize: 15, color: "#ededed" }}>{item.title}</div>
                      <p style={{ margin: "3px 0 0", fontSize: 13, color: "#8a8a8a", lineHeight: 1.45 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── ABOUT ME ────────────────────────────────────────────────────── */}
      <section id="o-mnie" style={{ background: "#161616", borderBottom: "2px solid #000" }}>
        <div style={{ ...s.maxW, padding: "70px 24px", display: "grid", gridTemplateColumns: "0.8fr 1.2fr", gap: 48, alignItems: "center" }}>
          <FadeUp>
            <div style={{ position: "relative" }}>
              <div style={{ width: "100%", height: 460, border: "2px solid #000", borderRadius: 16, boxShadow: "8px 8px 0 #9d6bff", overflow: "hidden", background: "#141414" }}>
                <img
                  src="/img/designing.png"
                  alt="Fabian Olczak"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <div style={{ position: "absolute", bottom: 14, left: 14, background: "#9d6bff", border: "2px solid #000", borderRadius: 100, padding: "7px 14px", fontFamily: SG, fontSize: 12, fontWeight: 600, color: "#fff", boxShadow: "3px 3px 0 #000" }}>Twój prowadzący</div>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <span style={{ display: "inline-block", fontFamily: SG, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", background: "#1e1e1e", color: "#b89dff", border: "2px solid #000", borderRadius: 100, padding: "6px 13px", boxShadow: "2px 2px 0 #000" }}>O mnie</span>
            <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.03em", margin: "16px 0 18px", color: "#f0f0f0", fontFamily: SG }}>Cześć, nazywam się Fabian Olczak</h2>
            <p style={{ fontSize: 16.5, fontWeight: 400, lineHeight: 1.65, margin: "0 0 14px", color: "#b4b4b4" }}>
              Od trzech lat zajmuję się drukiem 3D, a od ponad dwóch lat prowadzę własną firmę <strong style={{ color: "#ededed", fontWeight: 700 }}>Magbase</strong>, w której projektuję i produkuję gotowe produkty — wykorzystując m.in. druk 3D, druk UV i laser. Na co dzień pracuję na drukarkach Bambu Lab (m.in. H2C, P1S i A1), więc sprzęt, który dostajesz w zestawie kursu, znam nie z teorii, ale z codziennej, produkcyjnej eksploatacji — od pierwszego wydruku po skalowanie produkcji do tysięcy sztuk.
            </p>
            <p style={{ fontSize: 16.5, fontWeight: 400, lineHeight: 1.65, margin: "0 0 26px", color: "#b4b4b4" }}>
              Ten kurs to połączenie dwóch rzeczy, którymi zajmuję się na co dzień: praktycznej wiedzy o druku 3D zdobytej w realnym biznesie oraz zaplecza technicznego, dzięki któremu pokażę Ci nie tylko <em style={{ color: "#ededed", fontStyle: "normal", fontWeight: 600 }}>„jak coś kliknąć"</em>, ale przede wszystkim <strong style={{ color: "#ededed", fontWeight: 700 }}>dlaczego coś działa tak, a nie inaczej.</strong>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                { val: "ponad 3 lata", color: "#9d6bff", sub: "w druku 3D" },
                { val: "Magbase.pl", color: "#3ecf8e", sub: "własna firma produkcyjna" },
                { val: "tysiące", color: "#5b8def", sub: "wydrukowanych sztuk" },
                { val: "Bambu Lab", color: "#e0944a", sub: "H2C · P1S · A1" },
              ].map((stat) => (
                <div key={stat.val} style={{ background: "#1e1e1e", border: "2px solid #000", borderRadius: 11, padding: "12px 16px", boxShadow: "3px 3px 0 #000" }}>
                  <div style={{ fontFamily: SG, fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.val}</div>
                  <div style={{ fontSize: 12, color: "#8a8a8a", marginTop: 2 }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="cennik" style={{ background: "#1c1c1c", borderBottom: "2px solid #000" }}>
        <div style={{ ...s.maxW, padding: "70px 24px" }}>
          <FadeUp>
            <div style={{ maxWidth: 660 }}>
              <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px", color: "#f0f0f0", fontFamily: SG }}>Prosty cennik</h2>
              <p style={{ fontSize: 17, fontWeight: 500, margin: 0, lineHeight: 1.5, color: "#8a8a8a" }}>Jednorazowa opłata. Drukarka i dostęp do kursu w jednym pakiecie.</p>
            </div>
          </FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 22, marginTop: 40, alignItems: "start" }}>
            {/* Individual */}
            <FadeUp>
              <div style={{ background: "#9d6bff", border: "2px solid #000", borderRadius: 18, boxShadow: "8px 8px 0 #000", padding: 36, position: "relative" }}>
                <div style={{ position: "absolute", top: -14, right: 28, background: "#161616", border: "2px solid #000", borderRadius: 100, padding: "6px 15px", fontFamily: SG, fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "#fff", boxShadow: "3px 3px 0 #000" }}>Najpopularniejszy</div>
                <h3 style={{ fontSize: 23, fontWeight: 600, margin: 0, color: "#161616" }}>Pakiet indywidualny</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "14px 0 4px" }}>
                  <span style={{ fontFamily: SG, fontSize: 52, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, color: "#161616" }}>1 999 zł</span>
                  <span style={{ fontWeight: 600, fontSize: 15, color: "#2a2a2a" }}>jednorazowo</span>
                </div>
                <p style={{ fontSize: 14.5, fontWeight: 600, margin: "8px 0 24px", color: "#1c1c1c" }}>Drukarka Bambu Lab A1 Mini + dożywotni dostęp do platformy</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 11 }}>
                  {["Drukarka Bambu Lab A1 Mini", "Po 1kg filamentu PLA i PETG na start", "Dożywotni dostęp do platformy kursu", "Wszystkie przyszłe aktualizacje materiałów", "Dostęp do społeczności, konkursów i wsparcia", "Certyfikat ukończenia kursu", "Indywidualny kontakt z prowadzącymi"].map((item) => (
                    <li key={item} style={{ display: "flex", gap: 10, fontSize: 14.5, fontWeight: 600, color: "#161616" }}>
                      <span style={{ flex: "0 0 auto" }}>✔</span>{item}
                    </li>
                  ))}
                </ul>

                {/* Quantity selector */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1c1c1c", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Liczba pakietów</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 0, background: "#161616", border: "2px solid #000", borderRadius: 10, overflow: "hidden", width: "fit-content", boxShadow: "3px 3px 0 #000" }}>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={{ width: 44, height: 44, background: "transparent", border: "none", borderRight: "2px solid #333", cursor: "pointer", fontSize: 22, fontWeight: 700, color: "#9d6bff", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >−</button>
                    <span style={{ minWidth: 52, textAlign: "center", fontFamily: SG, fontWeight: 700, fontSize: 20, color: "#fff" }}>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      style={{ width: 44, height: 44, background: "transparent", border: "none", borderLeft: "2px solid #333", cursor: "pointer", fontSize: 22, fontWeight: 700, color: "#9d6bff", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >+</button>
                  </div>
                  {quantity > 1 && (
                    <p style={{ fontSize: 12, color: "#1c1c1c", marginTop: 6, fontWeight: 600 }}>
                      Łącznie: {(quantity * 1999).toLocaleString("pl-PL")} zł · Dla większych ilości dostępne są rabaty
                    </p>
                  )}
                </div>

                <a
                  href={buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", textAlign: "center", textDecoration: "none", fontFamily: SG, fontWeight: 600, fontSize: 17, padding: 16, background: "#161616", color: "#fff", border: "2px solid #000", borderRadius: 12, boxShadow: "5px 5px 0 #fff", transition: "transform .1s, box-shadow .1s", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translate(2px,2px)"; e.currentTarget.style.boxShadow = "3px 3px 0 #fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "5px 5px 0 #fff"; }}
                >
                  Kup teraz →
                </a>
              </div>
            </FadeUp>

            {/* Business */}
            <FadeUp delay={0.1}>
              <div id="firmy" style={{ background: "#1e1e1e", border: "2px solid #000", borderRadius: 18, boxShadow: "8px 8px 0 #000", padding: 36 }}>
                <h3 style={{ fontSize: 23, fontWeight: 600, margin: 0, color: "#f0f0f0" }}>Dla firm i instytucji</h3>
                <div style={{ fontFamily: SG, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", margin: "14px 0 8px", color: "#f0f0f0" }}>Cena indywidualna</div>
                <p style={{ fontSize: 14, fontWeight: 400, color: "#8a8a8a", lineHeight: 1.55, margin: "0 0 24px" }}>Kupujesz dla więcej niż jednej osoby? Dla szkoły lub firmy? Przygotujemy ofertę dopasowaną do Ciebie.</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 11 }}>
                  {["Zniżki dla większych ilości", "Faktura VAT", "Szkolenia dla Twojego zespołu", "Priorytetowe wsparcie techniczne"].map((item) => (
                    <li key={item} style={{ display: "flex", gap: 10, fontSize: 14, fontWeight: 500, color: "#c4c4c4" }}>
                      <span style={{ color: "#9d6bff", flex: "none" }}>✔</span>{item}
                    </li>
                  ))}
                </ul>
                <a href="#kontakt" style={{ display: "block", textAlign: "center", textDecoration: "none", fontFamily: SG, fontWeight: 600, fontSize: 17, padding: 16, background: "#9d6bff", color: "#fff", border: "2px solid #000", borderRadius: 12, boxShadow: "5px 5px 0 #000", transition: "transform .1s, box-shadow .1s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translate(2px,2px)"; e.currentTarget.style.boxShadow = "3px 3px 0 #000"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "5px 5px 0 #000"; }}
                >Napisz do nas</a>
              </div>
            </FadeUp>
          </div>

          {/* Contact bar */}
          <div id="kontakt" style={{ marginTop: 24, background: "#9d6bff", color: "#161616", border: "2px solid #000", borderRadius: 16, boxShadow: "6px 6px 0 #000", padding: "26px 30px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <span style={{ fontFamily: SG, fontSize: 17, fontWeight: 600 }}>Masz pytania? Napisz do nas lub zadzwoń.</span>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="mailto:kurs@magbase.pl" style={{ textDecoration: "none", fontWeight: 700, background: "#161616", color: "#fff", border: "2px solid #000", borderRadius: 100, padding: "10px 18px" }}>kurs@magbase.pl</a>
              <a href="tel:+48571082475" style={{ textDecoration: "none", fontWeight: 700, background: "#fff", color: "#161616", border: "2px solid #000", borderRadius: 100, padding: "10px 18px" }}>+48 571 082 475</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ background: "#161616", borderBottom: "2px solid #000" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "70px 24px" }}>
          <FadeUp>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px", color: "#f0f0f0", fontFamily: SG }}>Najczęstsze pytania</h2>
              <p style={{ fontSize: 16, fontWeight: 500, margin: 0, color: "#8a8a8a" }}>Nie znalazłeś odpowiedzi? Napisz do nas na <a href="mailto:kurs@magbase.pl" style={{ fontWeight: 700, color: "#b89dff" }}>kurs@magbase.pl</a>.</p>
            </div>
          </FadeUp>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 36 }}>
            {faqData.map(([q, a], i) => (
              <div key={i} style={{ background: "#1e1e1e", border: "2px solid #000", borderRadius: 12, boxShadow: "3px 3px 0 #000", overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", background: "transparent", border: 0, cursor: "pointer", fontFamily: SG, textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "17px 20px", fontSize: 16, fontWeight: 600, color: "#ededed" }}
                >
                  <span>{q}</span>
                  <span style={{ flex: "none", display: "grid", placeItems: "center", width: 29, height: 29, background: "#9d6bff", border: "2px solid #000", borderRadius: 8, fontSize: 18, fontWeight: 700, lineHeight: 1, color: "#fff" }}>
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ padding: "0 20px 19px", fontSize: 14.5, lineHeight: 1.6, fontWeight: 400, color: "#9a9a9a" }}
                  >
                    {a}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section style={{ background: "#9d6bff", borderBottom: "2px solid #000", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#00000010 1px,transparent 1px),linear-gradient(90deg,#00000010 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        <div style={{ position: "relative", maxWidth: 820, margin: "0 auto", padding: "82px 24px", textAlign: "center" }}>
          <FadeUp>
            <h2 style={{ fontSize: 50, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px", lineHeight: 1.05, color: "#161616", fontFamily: SG }}>Gotowy, żeby zacząć drukować?</h2>
            <p style={{ fontSize: 18, fontWeight: 600, margin: "0 auto 32px", maxWidth: 560, lineHeight: 1.5, color: "#1c1c1c" }}>Drukarka dostarczana pod drzwi, kurs dostępny od pierwszego dnia. Jedna opłata — dożywotni dostęp do wiedzy i społeczności.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
              <a href="#cennik" style={{ textDecoration: "none", fontFamily: SG, fontWeight: 600, fontSize: 18, padding: "16px 28px", background: "#161616", color: "#fff", border: "2px solid #000", borderRadius: 12, boxShadow: "5px 5px 0 #fff", transition: "transform .1s, box-shadow .1s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translate(2px,2px)"; e.currentTarget.style.boxShadow = "3px 3px 0 #fff"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "5px 5px 0 #fff"; }}
              >Zacznij teraz — 1 999 zł</a>
              <a href="#firmy" style={{ textDecoration: "none", fontFamily: SG, fontWeight: 600, fontSize: 18, padding: "16px 28px", background: "#fff", color: "#161616", border: "2px solid #000", borderRadius: 12, boxShadow: "5px 5px 0 #161616", transition: "transform .1s, box-shadow .1s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translate(2px,2px)"; e.currentTarget.style.boxShadow = "3px 3px 0 #161616"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "5px 5px 0 #161616"; }}
              >Oferta dla firm →</a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: "#101010", color: "#8a8a8a" }}>
        <div style={{ ...s.maxW, padding: "52px 24px 40px", display: "grid", gridTemplateColumns: "1.6fr 0.8fr 0.8fr 1fr", gap: 32 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, background: "#9d6bff", border: "2px solid #000", borderRadius: 9, color: "#fff", fontFamily: SG, fontWeight: 700, fontSize: 12 }}>3D</span>
              <span style={{ fontFamily: SG, fontWeight: 600, fontSize: 15, color: "#ededed" }}>Interaktywny kurs druku 3D</span>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: "14px 0 16px", maxWidth: 300 }}>Kurs druku 3D z drukarką Bambu Lab A1 Mini i dożywotnim dostępem do platformy.</p>
            {/* Company data */}
            <div style={{ fontSize: 12, lineHeight: 1.7, color: "#4a4a4a" }}>
              <div style={{ fontFamily: SG, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5f5f5f", marginBottom: 6 }}>Dane firmy</div>
              <div>NAZWA: Magbase Fabian Olczak</div>
              <div>NIP: 5993285713</div>
              <div>VAT-UE: PL5993285713</div>
              <div>REGON: 543409622</div>
              <div style={{ marginTop: 4, fontFamily: "monospace", fontSize: 10 }}>NUMER KONTA: PL70 1140 2004 0000 3602 8626 9283</div>
            </div>
          </div>
          {/* Nav */}
          <div>
            <div style={{ fontFamily: SG, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5f5f5f" }}>Nawigacja</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
              {[["#co-dostajesz", "Co dostajesz"], ["#o-mnie", "O mnie"], ["#platforma", "Platforma"], ["#cennik", "Cennik"], ["#firmy", "Dla firm"], ["#faq", "FAQ"]].map(([href, label]) => (
                <a key={href} href={href} style={{ textDecoration: "none", fontSize: 14, fontWeight: 500, color: "#8a8a8a", transition: "color .15s" }} onMouseEnter={e => (e.currentTarget.style.color = "#ededed")} onMouseLeave={e => (e.currentTarget.style.color = "#8a8a8a")}>{label}</a>
              ))}
              <a href="/login" style={{ textDecoration: "none", fontSize: 14, fontWeight: 500, color: "#8a8a8a", transition: "color .15s", cursor: "pointer" }} onMouseEnter={e => (e.currentTarget.style.color = "#ededed")} onMouseLeave={e => (e.currentTarget.style.color = "#8a8a8a")}>Zaloguj się</a>
            </div>
          </div>
          {/* Contact */}
          <div>
            <div style={{ fontFamily: SG, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5f5f5f" }}>Kontakt</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
              <a href="mailto:kurs@magbase.pl" style={{ textDecoration: "none", fontSize: 14, fontWeight: 500, color: "#8a8a8a", transition: "color .15s" }} onMouseEnter={e => (e.currentTarget.style.color = "#ededed")} onMouseLeave={e => (e.currentTarget.style.color = "#8a8a8a")}>kurs@magbase.pl</a>
              <a href="tel:+48571082475" style={{ textDecoration: "none", fontSize: 14, fontWeight: 500, color: "#8a8a8a", transition: "color .15s" }} onMouseEnter={e => (e.currentTarget.style.color = "#ededed")} onMouseLeave={e => (e.currentTarget.style.color = "#8a8a8a")}>+48 571 082 475</a>
            </div>
          </div>
          {/* Legal */}
          <div>
            <div style={{ fontFamily: SG, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5f5f5f" }}>Dokumenty</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
              {[["Polityka prywatności", "/strony/polityka-prywatnosci"], ["Regulamin platformy", "/strony/regulamin"], ["Warunki świadczenia usług", "/strony/warunki"]].map(([label, href]) => (
                <a key={href} href={href} style={{ textDecoration: "none", fontSize: 14, fontWeight: 500, color: "#8a8a8a", transition: "color .15s" }} onMouseEnter={e => (e.currentTarget.style.color = "#ededed")} onMouseLeave={e => (e.currentTarget.style.color = "#8a8a8a")}>{label}</a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "2px solid #222" }}>
          <div style={{ ...s.maxW, padding: "18px 24px", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", fontSize: 12.5 }}>
            <span>© 2026 Interaktywny kurs druku 3D · Magbase. Wszelkie prawa zastrzeżone.</span>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              {[["Polityka prywatności", "/strony/polityka-prywatnosci"], ["Regulamin platformy", "/strony/regulamin"], ["Warunki świadczenia usług", "/strony/warunki"]].map(([label, href]) => (
                <a key={href} href={href} style={{ textDecoration: "none", color: "#8a8a8a", transition: "color .15s" }} onMouseEnter={e => (e.currentTarget.style.color = "#ededed")} onMouseLeave={e => (e.currentTarget.style.color = "#8a8a8a")}>{label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
