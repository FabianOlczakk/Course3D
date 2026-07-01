"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
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
  Building2,
  Users,
  Zap,
  Shield,
  Award,
  Mail,
  Sun,
  Moon,
  Phone,
  BookOpen,
  MessageCircle,
  Trophy,
  Bell,
  BarChart2,
  FileText,
  Lock,
  Wifi,
  Layers,
  Palette,
  Clock,
} from "lucide-react";

// --- Theme Switcher (taki sam jak na platformie: klasy dark/light na <html>) ---

function useLandingTheme() {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const raw = localStorage.getItem("theme") ?? "dark";
    const resolved: "dark" | "light" = raw === "light" ? "light"
      : raw === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
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

// --- Countdown Timer ---

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

// --- FDM Animation ---

function FdmAnimation() {
  const totalLayers = 14;
  const [currentLayer, setCurrentLayer] = useState(0);
  const [extruderX, setExtruderX] = useState(0); // 0..1
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setExtruderX((prev) => {
        const next = prev + direction * 0.04;
        if (next >= 1) {
          setDirection(-1);
          setCurrentLayer((l) => (l >= totalLayers - 1 ? 0 : l + 1));
          return 1;
        }
        if (next <= 0) {
          setDirection(1);
          setCurrentLayer((l) => (l >= totalLayers - 1 ? 0 : l + 1));
          return 0;
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [direction]);

  const bedY = 220;
  const layerH = 10;
  const svgW = 280;
  const extruderW = 36;
  const extruderH = 28;
  const printAreaX = 40;
  const printAreaW = svgW - 80;

  const extruderXPx = printAreaX + extruderX * printAreaW - extruderW / 2;
  const currentPrintedTop = bedY - currentLayer * layerH;
  const extruderYPx = currentPrintedTop - extruderH - 4;

  return (
    <div className="relative mx-auto max-w-sm">
      <div
        className="rounded-2xl border p-4 shadow-glow"
        style={{
          borderColor: "var(--border-glow)",
          background: "var(--bg-card)",
        }}
      >
        <p
          className="mb-2 text-center text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--accent)" }}
        >
          FDM w akcji
        </p>
        <svg width="100%" viewBox={`0 0 ${svgW} 260`} style={{ display: "block" }}>
          {/* Vertical frame rails */}
          <rect x="20" y="20" width="4" height={bedY - 20} rx="2" fill="var(--border-subtle)" />
          <rect x={svgW - 24} y="20" width="4" height={bedY - 20} rx="2" fill="var(--border-subtle)" />

          {/* Horizontal gantry rod */}
          <rect
            x="18"
            y={extruderYPx - 6}
            width={svgW - 36}
            height="4"
            rx="2"
            fill="var(--border-glow)"
          />

          {/* Extruder head */}
          <motion.g
            animate={{ x: extruderXPx }}
            transition={{ duration: 0 }}
          >
            <rect
              x={0}
              y={extruderYPx - 5}
              width={extruderW}
              height={extruderH}
              rx="4"
              fill="var(--accent)"
              opacity={0.9}
            />
            {/* Nozzle */}
            <polygon
              points={`${extruderW / 2 - 5},${extruderYPx + extruderH - 5} ${extruderW / 2 + 5},${extruderYPx + extruderH - 5} ${extruderW / 2},${extruderYPx + extruderH + 6}`}
              fill="var(--accent)"
            />
            {/* Hot tip glow */}
            <circle
              cx={extruderW / 2}
              cy={extruderYPx + extruderH + 4}
              r="3"
              fill="var(--accent-glow)"
              opacity={0.8}
            />
          </motion.g>

          {/* Printed layers */}
          {Array.from({ length: currentLayer }).map((_, i) => {
            const y = bedY - (i + 1) * layerH;
            return (
              <motion.rect
                key={i}
                x={printAreaX}
                y={y}
                width={printAreaW}
                height={layerH - 1}
                rx="2"
                initial={{ scaleX: 0, originX: "left" }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                fill="var(--accent)"
                opacity={0.15 + (i / totalLayers) * 0.5}
              />
            );
          })}

          {/* Current partial layer */}
          <rect
            x={printAreaX}
            y={bedY - (currentLayer + 1) * layerH}
            width={extruderX * printAreaW}
            height={layerH - 1}
            rx="2"
            fill="var(--accent)"
            opacity={0.7}
          />

          {/* Bed */}
          <rect
            x="18"
            y={bedY}
            width={svgW - 36}
            height="8"
            rx="3"
            fill="var(--bg-elevated)"
            stroke="var(--border-glow)"
            strokeWidth="1"
          />
          {/* Bed heat lines */}
          {[0.2, 0.4, 0.6, 0.8].map((pct) => (
            <line
              key={pct}
              x1={18 + pct * (svgW - 36)}
              y1={bedY + 2}
              x2={18 + pct * (svgW - 36)}
              y2={bedY + 6}
              stroke="var(--accent)"
              strokeWidth="1"
              opacity="0.4"
            />
          ))}

          {/* Layer counter */}
          <text
            x={svgW / 2}
            y={bedY + 26}
            textAnchor="middle"
            fontSize="10"
            fill="var(--text-secondary)"
            fontFamily="monospace"
          >
            Warstwa {currentLayer}/{totalLayers}
          </text>
        </svg>

        {/* Floating badges */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute -right-3 -top-3 rounded-xl border px-3 py-2 text-xs font-semibold shadow-glow"
          style={{
            borderColor: "var(--border-glow)",
            background: "var(--bg-elevated)",
            color: "var(--accent)",
          }}
        >
          250 mm/s
        </motion.div>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.8 }}
          className="absolute -bottom-3 -left-3 rounded-xl border px-3 py-2 text-xs font-semibold shadow-glow"
          style={{
            borderColor: "var(--border-glow)",
            background: "var(--bg-elevated)",
            color: "var(--accent)",
          }}
        >
          Auto-kalibracja
        </motion.div>
      </div>
    </div>
  );
}

// --- Floating Particles ---

function Particles() {
  const count = 18;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const size = 2 + Math.random() * 4;
        const left = Math.random() * 100;
        const duration = 8 + Math.random() * 12;
        const delay = Math.random() * 8;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              bottom: "-10px",
              background: "var(--accent)",
              opacity: 0.25 + Math.random() * 0.3,
            }}
            animate={{ y: [0, -(300 + Math.random() * 400)], opacity: [0.3, 0] }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );
}

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
          transition={{ duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
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
    desc: "Od rozpakowania drukarki po zaawansowane modelowanie — krok po kroku, w języku polskim. Lekcje z sygnaturami czasowymi.",
  },
  {
    icon: Printer,
    title: "Bambu Lab A1 Mini w zestawie",
    desc: "Otrzymujesz fizyczną drukarkę 3D: auto-poziomowanie, multi-kolor AMS Lite, WiFi, 250 mm/s. Gotową do druku od razu.",
  },
  {
    icon: Boxes,
    title: "Interaktywne lekcje",
    desc: "Quizy, śledzenie postępów, wiki, forum i wiadomości prywatne do prowadzącego — kompletna platforma edukacyjna.",
  },
  {
    icon: MessagesSquare,
    title: "Społeczność i wsparcie",
    desc: "Zadawaj pytania, dziel się wydrukami i pisz bezpośrednio do prowadzących. Certyfikat po ukończeniu.",
  },
];

const pricingPoints = [
  "Drukarka Bambu Lab A1 Mini (auto-poziomowanie, AMS Lite, WiFi)",
  "Filament PLA + PETG na start",
  "Dożywotni dostęp do platformy kursu",
  "Wszystkie przyszłe aktualizacje materiałów",
  "Dostęp do społeczności i wsparcia",
  "Certyfikat ukończenia kursu",
  "Materiały do pobrania (projekty, pliki STL)",
];


const platformFeatures = [
  { icon: Play, title: "Lekcje wideo z timestampami", desc: "Przeskakuj do konkretnych fragmentów, ucz się we własnym tempie." },
  { icon: BookOpen, title: "Interaktywne quizy", desc: "Sprawdzaj wiedzę po każdym module, natychmiastowy feedback." },
  { icon: Users, title: "Forum społeczności", desc: "Dyskutuj, zadawaj pytania, dziel się projektami z innymi kursantami." },
  { icon: MessageCircle, title: "Wiadomości do prowadzącego", desc: "Prywatny kontakt z instruktorem bezpośrednio przez platformę." },
  { icon: FileText, title: "Wiki z wiedzą", desc: "Baza wiedzy z poradnikami, profilami slicera i parametrami druku." },
  { icon: BarChart2, title: "Śledzenie postępów", desc: "Widź które lekcje masz za sobą i ile zostało do certyfikatu." },
  { icon: Trophy, title: "Certyfikaty", desc: "Po ukończeniu modułów otrzymujesz certyfikat potwierdzający umiejętności." },
  { icon: Bell, title: "Ogłoszenia i aktualności", desc: "Nie przegap nowych lekcji, live sessions i aktualizacji materiałów." },
];

const faqItems = [
  {
    q: "Co dokładnie dostaję w pakiecie?",
    a: "Pakiet zawiera fizyczną drukarkę Bambu Lab A1 Mini z AMS Lite (multi-kolor), filament PLA i PETG na start, oraz dożywotni dostęp do interaktywnej platformy kursowej z materiałami wideo, quizami, forum i społecznością.",
  },
  {
    q: "Czy potrzebuję wcześniejszej wiedzy o druku 3D?",
    a: "Nie. Kurs jest zaprojektowany od zera — prowadzi Cię od pierwszego uruchomienia drukarki i instalacji slicera aż po zaawansowane techniki modelowania i optymalizację parametrów druku.",
  },
  {
    q: "Jak długo mam dostęp do kursu?",
    a: "Dostęp jest dożywotni. Płacisz raz, korzystasz na zawsze, włącznie ze wszystkimi przyszłymi aktualizacjami materiałów i nowymi lekcjami.",
  },
  {
    q: "Jakie filament są w zestawie i czym się różnią?",
    a: "Dostajesz PLA i PETG. PLA jest łatwy w druku, biodegradowalny i idealny dla początkujących — świetnie trzyma detale, dostępny w wielu kolorach. PETG jest mocniejszy, odporny na temperaturę i wilgoć, nadaje się do części funkcjonalnych i dopuszczonych do kontaktu z żywnością.",
  },
  {
    q: "Czym wyróżnia się Bambu Lab A1 Mini?",
    a: "To jedna z najbardziej zaawansowanych drukarek w swojej klasie: automatyczne poziomowanie łoża (ABS), druk wielokolorowy z modułem AMS Lite (do 4 kolorów), prędkość 250 mm/s, pole robocze 180×180×180 mm, WiFi z apką mobilną i pełna auto-kalibracja. Działa od razu po wyjęciu z pudełka.",
  },
  {
    q: "Czy mogę kupić kurs dla firmy lub szkoły?",
    a: "Tak! Oferujemy specjalne warunki dla firm i grup. Skontaktuj się z nami na kurs@magbase.pl lub pod numerem +48 571 082 475 — przygotujemy ofertę szytą na miarę.",
  },
  {
    q: "Jak wygląda wysyłka drukarki?",
    a: "Drukarka jest wysyłana kurierem na terenie Polski. Czas dostawy to zazwyczaj 2–5 dni roboczych od potwierdzenia zamówienia. Drukarka dostarczana jest w oryginalnym opakowaniu fabrycznym.",
  },
  {
    q: "Czy kurs obejmuje slicowanie?",
    a: "Tak. Kurs szczegółowo omawia Bambu Studio — oficjalny slicer do drukarek Bambu Lab. Nauczysz się ustawiać parametry dla różnych filamentów, obsługiwać AMS Lite do druku wielokolorowego i eksportować pliki G-code.",
  },
  {
    q: "Co to jest AMS Lite i do czego służy?",
    a: "AMS Lite (Automatic Material System) to moduł do automatycznej zmiany filamentu podczas druku. Pozwala drukować modele w 4 kolorach lub materiałach bez ręcznej ingerencji. Kurs uczy jak go skonfigurować i używać.",
  },
  {
    q: "Czy będę mógł modelować własne projekty?",
    a: "Tak. Kurs obejmuje podstawy modelowania 3D w bezpłatnych programach (Tinkercad, Fusion 360). Pod koniec kursu będziesz potrafić zaprojektować i wydrukować własny projekt od zera.",
  },
  {
    q: "Co to znaczy automatyczne poziomowanie łoża (ABL)?",
    a: "Auto Bed Leveling (ABL) to system, który automatycznie mapuje nierówności powierzchni roboczej i kompensuje je podczas druku. Dzięki temu pierwsza warstwa jest zawsze idealnie przyczepiona — bez ręcznego kalibrowania śrubek.",
  },
  {
    q: "Jak wygląda platforma kursowa?",
    a: "Platforma to aplikacja webowa dostępna na komputerze i telefonie. Znajdziesz tam lekcje wideo z timestampami, quizy, wiki z wiedzą, forum społeczności, prywatne wiadomości do prowadzącego, śledzenie postępów i certyfikaty.",
  },
  {
    q: "Czy jest forum lub społeczność?",
    a: "Tak. Do kursu dołączona jest zamknięta społeczność kursantów, gdzie możesz zadawać pytania, dzielić się wydrukami, wymieniać plikami STL i uzyskiwać feedback od prowadzących i innych uczestników.",
  },
  {
    q: "Jak szybka jest drukarka Bambu Lab A1 Mini?",
    a: "A1 Mini drukuje z prędkością do 250 mm/s — to kilkukrotnie szybciej niż większość popularnych drukarek. Model, który w standardowej drukarce zajmuje 6 godzin, na A1 Mini wydrukujesz w 1,5–2 godziny.",
  },
  {
    q: "Jaki jest rozmiar pola roboczego?",
    a: "Pole robocze A1 Mini wynosi 180×180×180 mm. To wystarczy na większość codziennych projektów: uchwyty, figurki, części mechaniczne, dekoracje, gadżety biurowe i wiele więcej.",
  },
  {
    q: "Czy drukarka wymaga WiFi?",
    a: "WiFi jest zintegrowane i umożliwia wysyłanie plików przez sieć oraz monitorowanie druku przez aplikację mobilną Bambu Handy. Kurs uczy jak to skonfigurować. Możesz też drukować przez kartę SD.",
  },
  {
    q: "Jak długo trwa kurs?",
    a: "Program składa się z ponad 40 lekcji wideo. Przy regularnej nauce (3–4 godziny tygodniowo) ukończysz kurs w 6–8 tygodni. Możesz jednak uczyć się w dowolnym tempie — dostęp jest dożywotni.",
  },
  {
    q: "Czy otrzymam certyfikat?",
    a: "Tak. Po ukończeniu wszystkich modułów i zaliczeniu quizów otrzymujesz certyfikat ukończenia kursu w formie cyfrowej, który możesz dodać do portfolio lub CV.",
  },
  {
    q: "Czy kurs będzie aktualizowany?",
    a: "Tak. Wraz z pojawieniem się nowych wersji slicera, nowych funkcji drukarki lub nowych technik druku, materiały kursowe są aktualizowane. Wszystkie aktualizacje są bezpłatne dla posiadaczy dostępu.",
  },
  {
    q: "Co jeśli drukarka będzie miała problem techniczny?",
    a: "Bambu Lab oferuje wsparcie techniczne i gwarancję na drukarkę. Kurs obejmuje też moduł diagnostyczny — nauczysz się rozwiązywać najczęstsze problemy samodzielnie. W razie potrzeby możesz też skontaktować się z nami na kurs@magbase.pl.",
  },
  {
    q: "Czy mogę drukować z zewnętrznych plików STL?",
    a: "Oczywiście. Możesz drukować pliki STL z serwisów takich jak Thingiverse, Printables, MakerWorld (oficjalna platforma Bambu Lab) i innych. Kurs uczy jak importować, skalować i optymalizować cudze modele.",
  },
  {
    q: "Czy druk 3D jest dla mnie odpowiedni jeśli jestem seniorką/seniorem?",
    a: "Tak. Bambu Lab A1 Mini jest zaprojektowana tak, żeby była łatwa w obsłudze dla każdego. Kurs jest nagrany w języku polskim, spokojnym tempem i z dużą ilością powtórzeń. Wielu naszych uczestników to osoby 50+.",
  },
  {
    q: "Czy mogę kupić tylko dostęp do kursu bez drukarki?",
    a: "Aktualnie oferujemy jeden pakiet: drukarka + kurs. To celowy wybór — kurs jest zaprojektowany tak, żebyś uczył się drukując naprawdę, a nie tylko na filmach.",
  },
  {
    q: "Jak wygląda płatność?",
    a: "Płacisz jednorazowo przelewem, BLIK-iem lub kartą. Dla firm wystawiamy fakturę VAT. Możliwa jest też płatność ratalna — skontaktuj się z nami po szczegóły.",
  },
  {
    q: "Jak mogę się skontaktować w razie pytań?",
    a: "Napisz na kurs@magbase.pl lub zadzwoń pod +48 571 082 475. Odpowiadamy w ciągu 24 godzin w dni robocze. Możesz też zadać pytanie bezpośrednio przez platformę kursową po zakupie.",
  },
];

// --- Sub-components ---

function NavBar() {
  const { theme, toggle } = useLandingTheme();

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-md"
      style={{
        borderColor: "var(--border-subtle)",
        background: "color-mix(in srgb, var(--bg-base) 80%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span
          className="flex items-center gap-2 text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          <Sparkles className="h-5 w-5" style={{ color: "var(--accent)" }} />
          Kurs druku 3D
        </span>
        <div className="flex items-center gap-3">
          <a
            href="#cennik"
            className="hidden text-sm transition-colors hover:text-text-primary sm:block"
            style={{ color: "var(--text-secondary)" }}
          >
            Cennik
          </a>
          <a
            href="#business"
            className="hidden text-sm transition-colors hover:text-text-primary sm:block"
            style={{ color: "var(--text-secondary)" }}
          >
            Dla firm
          </a>
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
            aria-label="Przełącz motyw"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
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

function CountdownSection() {
  const target = new Date("2026-08-15T00:00:00");
  const { days, hours, minutes, seconds } = useCountdown(target);

  return (
    <div
      className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 rounded-2xl border px-6 py-5"
      style={{ borderColor: "var(--border-glow)", background: "var(--bg-elevated)" }}
    >
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        <Clock className="h-4 w-4" />
        Kurs startuje 15 sierpnia 2026
      </p>
      <div className="flex gap-4">
        {[
          { val: days, label: "dni" },
          { val: hours, label: "godz" },
          { val: minutes, label: "min" },
          { val: seconds, label: "sek" },
        ].map(({ val, label }) => (
          <div key={label} className="flex flex-col items-center">
            <span
              className="w-14 rounded-xl py-2 text-center text-2xl font-extrabold tabular-nums"
              style={{ background: "var(--bg-card)", color: "var(--accent)" }}
            >
              {String(val).padStart(2, "0")}
            </span>
            <span className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-28 text-center">
      <Particles />
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
          className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
          style={{
            borderColor: "var(--border-glow)",
            background: "var(--bg-elevated)",
            color: "var(--text-secondary)",
          }}
        >
          <Sparkles className="h-4 w-4" style={{ color: "var(--accent)" }} />
          Druk 3D od zera do mistrza
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gradient-to-br from-[var(--text-primary)] via-purple-300 to-purple-500 bg-clip-text text-5xl font-extrabold leading-tight text-transparent md:text-6xl lg:text-7xl"
        >
          Kurs Druku 3D<br />z Bambu Lab A1 Mini
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mt-6 max-w-2xl text-lg"
          style={{ color: "var(--text-secondary)" }}
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
            className="inline-flex items-center gap-2 rounded-md border px-6 py-3.5 text-base font-medium transition-colors hover:border-[var(--border-glow)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            <Play className="h-4 w-4" />
            Poznaj szczegóły
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <CountdownSection />
        </motion.div>
      </div>
    </section>
  );
}

function PrinterSection() {
  const specsLeft = [
    { icon: Zap, label: "Prędkość druku", val: "250 mm/s" },
    { icon: Layers, label: "Pole robocze", val: "180×180×180 mm" },
    { icon: Palette, label: "Multi-kolor AMS Lite", val: "do 4 kolorów" },
    { icon: Wifi, label: "Łączność", val: "WiFi + microSD" },
  ];
  const specsRight = [
    { icon: Shield, label: "Poziomowanie łoża", val: "Auto-ABL" },
    { icon: Zap, label: "Kalibracja", val: "Pełny auto-start" },
    { icon: Printer, label: "Technologia", val: "FDM / FFF" },
    { icon: Award, label: "Gwarancja", val: "12 miesięcy" },
  ];

  return (
    <section className="px-6 py-24" style={{ background: "var(--bg-elevated)" }}>
      <div className="mx-auto max-w-6xl">
        <FadeUp className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--text-primary)" }}>
            Bambu Lab A1 Mini — drukarka w zestawie
          </h2>
          <p className="mx-auto mt-3 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            Nie musisz szukać drukarki na własną rękę. Dostajesz jedną z najlepszych maszyn
            na rynku — gotową do druku od razu po dostawie.
          </p>
        </FadeUp>

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-2">
          <FdeUp delay={0.05}>
            <FdmAnimation />
          </FdeUp>

          <FadeUp delay={0.15}>
            <div className="grid gap-3 sm:grid-cols-2">
              {[...specsLeft, ...specsRight].map((s) => (
                <div
                  key={s.label}
                  className="flex items-start gap-3 rounded-xl border p-4"
                  style={{ borderColor: "var(--border-subtle)", background: "var(--bg-card)" }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "var(--accent-glow)" }}
                  >
                    <s.icon className="h-4 w-4" style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{s.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// small helper to allow FdeUp alias
function FdeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <FadeUp delay={delay}>{children}</FadeUp>;
}

function FilamentsSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeUp className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--text-primary)" }}>
            Filament PLA i PETG — dostarczamy w zestawie
          </h2>
          <p className="mx-auto mt-3 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            Dwa podstawowe i najważniejsze materiały do druku 3D, każdy z unikalnym zastosowaniem.
          </p>
        </FadeUp>

        <StaggerGrid className="mt-12 grid gap-6 md:grid-cols-2">
          {[
            {
              name: "PLA",
              subtitle: "Polilaktyd — idealny dla początkujących",
              color: "#a855f7",
              points: [
                "Najłatwiejszy do drukowania materiał",
                "Biodegradowalny — przyjazny środowisku",
                "Dostępny w dziesiątkach kolorów",
                "Świetna dokładność wymiarowa",
                "Niskie temperatury druku (190–220°C)",
                "Idealne do figurek, dekoracji, gadżetów",
              ],
            },
            {
              name: "PETG",
              subtitle: "Politereftalan etylenu — wytrzymałość i funkcjonalność",
              color: "#22d3ee",
              points: [
                "Znacznie mocniejszy od PLA",
                "Odporny na temperaturę do ~80°C",
                "Odporny na wilgoć i chemikalia",
                "Dopuszczony do kontaktu z żywnością",
                "Elastyczniejszy, mniej kruchy",
                "Idealny do części mechanicznych i funkcjonalnych",
              ],
            },
          ].map((f) => (
            <div
              key={f.name}
              className="glow-card rounded-2xl border p-8"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full"
                  style={{ background: `${f.color}33`, border: `2px solid ${f.color}` }}
                />
                <div>
                  <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {f.name}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{f.subtitle}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {f.points.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}

function PlatformSection() {
  return (
    <section className="px-6 py-24" style={{ background: "var(--bg-elevated)" }}>
      <div className="mx-auto max-w-6xl">
        <FadeUp className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--text-primary)" }}>
            Platforma kursowa — wszystko w jednym miejscu
          </h2>
          <p className="mx-auto mt-3 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            Nowoczesna platforma edukacyjna z narzędziami, które realnie wspierają naukę.
          </p>
        </FadeUp>

        <StaggerGrid className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {platformFeatures.map((f) => (
            <div
              key={f.title}
              className="glow-card group rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-all group-hover:scale-110"
                style={{ background: "var(--accent-glow)" }}
              >
                <f.icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeUp className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--text-primary)" }}>
            Wszystko, czego potrzebujesz
          </h2>
          <p className="mx-auto mt-3 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            Kompleksowy program nauczania połączony z prawdziwym sprzętem i społecznością.
          </p>
        </FadeUp>

        <StaggerGrid className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="glow-card group rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div
                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-all group-hover:scale-105"
                style={{ background: "var(--accent-glow)" }}
              >
                <f.icon className="h-6 w-6" style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}


function PricingSection() {
  return (
    <section id="cennik" className="px-6 py-24" style={{ background: "var(--bg-elevated)" }}>
      <div className="mx-auto max-w-5xl">
        <FadeUp className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--text-primary)" }}>
            Prosty cennik
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Jednorazowa opłata. Drukarka i dostęp do kursu w jednym pakiecie.
          </p>
        </FadeUp>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Individual */}
          <FadeUp delay={0.05}>
            <div
              className="glow-border glow-card relative flex h-full flex-col overflow-hidden rounded-2xl border p-8"
              style={{ borderColor: "var(--border-glow)" }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500" />
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
              >
                Pakiet indywidualny
              </span>
              <div className="mt-5">
                <div className="flex items-end gap-2">
                  <span className="bg-gradient-to-br from-[var(--text-primary)] to-purple-400 bg-clip-text text-5xl font-extrabold text-transparent">
                    1 999 zł
                  </span>
                  <span className="mb-1.5 text-sm" style={{ color: "var(--text-muted)" }}>jednorazowo</span>
                </div>
                <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  Drukarka Bambu Lab A1 Mini + dożywotni dostęp do platformy
                </p>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {pricingPoints.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--accent)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{p}</span>
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
            <div
              id="business"
              className="glow-card flex h-full flex-col rounded-2xl border p-8"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <span
                className="inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                style={{ borderColor: "var(--border-glow)", color: "var(--accent)" }}
              >
                Dla firm i instytucji
              </span>
              <div className="mt-5">
                <div className="flex items-center gap-2">
                  <Building2 className="h-6 w-6" style={{ color: "var(--accent)" }} />
                  <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    Cena do negocjacji
                  </span>
                </div>
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  Kupujesz dla więcej niż jednej osoby? Masz szkołę, firmę produkcyjną
                  lub chcesz wyposażyć pracownię? Przygotujemy ofertę dopasowaną.
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
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--accent)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{p}</span>
                  </li>
                ))}
              </ul>

              <a
                href="mailto:kurs@magbase.pl"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md border px-6 py-3.5 text-base font-semibold transition-all hover:bg-[var(--accent-glow)]"
                style={{ borderColor: "var(--border-glow)", color: "var(--text-primary)" }}
              >
                <Mail className="h-5 w-5" style={{ color: "var(--accent)" }} />
                Napisz do nas
              </a>
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={0.1} className="mt-6 flex flex-col items-center gap-1 text-center text-sm text-text-muted">
          <span>
            Masz pytania? Napisz na{" "}
            <a
              href="mailto:kurs@magbase.pl"
              className="underline-offset-2 hover:underline"
              style={{ color: "var(--accent)" }}
            >
              kurs@magbase.pl
            </a>{" "}
            lub zadzwoń{" "}
            <a
              href="tel:+48571082475"
              className="underline-offset-2 hover:underline"
              style={{ color: "var(--accent)" }}
            >
              +48 571 082 475
            </a>
          </span>
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
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--text-primary)" }}>
            Najczęstsze pytania
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Nie znalazłeś odpowiedzi? Napisz do nas na kurs@magbase.pl.
          </p>
        </FadeUp>

        <div className="mt-10 space-y-3">
          {faqItems.map((item, i) => (
            <FadeUp key={i} delay={Math.min(i * 0.04, 0.4)}>
              <div
                className="glow-card overflow-hidden rounded-xl border"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="font-medium pr-4" style={{ color: "var(--text-primary)" }}>
                    {item.q}
                  </span>
                  <motion.div
                    animate={{ rotate: open === i ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
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
                      <p
                        className="px-5 pb-5 text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
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
    <section className="relative overflow-hidden px-6 py-24 text-center" style={{ background: "var(--bg-elevated)" }}>
      <Particles />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(157,107,255,0.12), transparent)",
        }}
      />
      <FadeUp className="relative mx-auto max-w-2xl">
        <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--text-primary)" }}>
          Gotowy, żeby zacząć drukować?
        </h2>
        <p className="mx-auto mt-4 max-w-lg" style={{ color: "var(--text-secondary)" }}>
          Drukarka dostarczana pod drzwi, kurs dostępny od pierwszego dnia.
          Jedna opłata — dożywotni dostęp do wiedzy i społeczności.
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
            className="inline-flex items-center gap-2 text-sm hover:text-text-primary"
            style={{ color: "var(--text-secondary)" }}
          >
            <Building2 className="h-4 w-4" />
            Oferta dla firm →
          </a>
        </div>
        <div className="mt-6 flex flex-col items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <a href="mailto:kurs@magbase.pl" className="flex items-center gap-2 hover:text-text-secondary transition-colors">
            <Mail className="h-4 w-4" style={{ color: "var(--accent)" }} />
            kurs@magbase.pl
          </a>
          <a href="tel:+48571082475" className="flex items-center gap-2 hover:text-text-secondary transition-colors">
            <Phone className="h-4 w-4" style={{ color: "var(--accent)" }} />
            +48 571 082 475
          </a>
        </div>
      </FadeUp>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="border-t px-6 py-10"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <span
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: "var(--text-muted)" }}
          >
            <Sparkles className="h-4 w-4" style={{ color: "var(--accent)" }} />
            Kurs druku 3D
          </span>

          <div className="flex flex-wrap justify-center gap-5 text-sm" style={{ color: "var(--text-muted)" }}>
            <a href="mailto:kurs@magbase.pl" className="hover:text-text-secondary transition-colors flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              kurs@magbase.pl
            </a>
            <a href="tel:+48571082475" className="hover:text-text-secondary transition-colors flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              +48 571 082 475
            </a>
            <a href="#cennik" className="hover:text-text-secondary transition-colors">Cennik</a>
            <a href="#business" className="hover:text-text-secondary transition-colors">Dla firm</a>
          </div>
        </div>

        <div
          className="mt-6 flex flex-wrap justify-center gap-5 border-t pt-6 text-xs"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
        >
          <Link href="/polityka-prywatnosci" className="hover:text-text-secondary transition-colors">
            Polityka prywatności
          </Link>
          <Link href="/regulamin" className="hover:text-text-secondary transition-colors">
            Regulamin platformy
          </Link>
          <Link href="/warunki" className="hover:text-text-secondary transition-colors">
            Warunki świadczenia usług
          </Link>
          <span>© {new Date().getFullYear()} Wszelkie prawa zastrzeżone.</span>
        </div>
      </div>
    </footer>
  );
}

// --- Main export ---

export default function LandingClient() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <PrinterSection />
      <FilamentsSection />
      <PlatformSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
