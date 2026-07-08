import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const dmSans = localFont({
  src: [
    { path: "../fonts/dm-sans-400.ttf", weight: "400", style: "normal" },
    { path: "../fonts/dm-sans-500.ttf", weight: "500", style: "normal" },
    { path: "../fonts/dm-sans-600.ttf", weight: "600", style: "normal" },
    { path: "../fonts/dm-sans-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-dm-sans",
});
const spaceGrotesk = localFont({
  src: [
    { path: "../fonts/space-grotesk-500.ttf", weight: "500", style: "normal" },
    { path: "../fonts/space-grotesk-600.ttf", weight: "600", style: "normal" },
    { path: "../fonts/space-grotesk-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Interaktywny Kurs Druku 3D",
  description:
    "Platforma Interaktywnego Kursu Druku 3D. Naucz się druku 3D od podstaw.",
};

// Prevents flash of wrong theme before React hydrates.
const themeScript = `(function(){try{var t=localStorage.getItem('theme')||'dark';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):t;document.documentElement.classList.add(r);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pl"
      className={`dark ${dmSans.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
