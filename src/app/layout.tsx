import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Course3D — Kurs druku 3D",
  description:
    "Platforma kursu druku 3D z drukarką Bambu Lab A1 Mini. Naucz się druku 3D od podstaw.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="dark">
      <body className={inter.className}>
        {children}
        <div className="fixed bottom-2 right-2 text-xs text-muted-foreground/40 select-none pointer-events-none">
          v0.1.3
        </div>
      </body>
    </html>
  );
}
