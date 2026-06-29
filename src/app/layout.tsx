import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Kurs druku 3D — BambuLab A1 mini",
  description:
    "Platforma kursu druku 3D z drukarką BambuLab A1 mini. Naucz się druku 3D od podstaw.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pl"
      className={`dark ${dmSans.variable} ${spaceGrotesk.variable}`}
    >
      <body className="font-sans">
        {children}
        <div className="fixed bottom-2 right-2 text-xs text-muted-foreground/40 select-none pointer-events-none">
          v0.9.1
        </div>
      </body>
    </html>
  );
}
