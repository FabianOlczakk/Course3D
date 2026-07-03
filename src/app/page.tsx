import { LandingClient } from "./landing-client";

export const metadata = {
  title: "Interaktywny Kurs Druku 3D — z drukarką Bambu Lab A1 Mini",
  description:
    "Naucz się drukowania 3D od podstaw. Otrzymasz prawdziwą drukarkę Bambu Lab A1 Mini oraz dożywotni dostęp do interaktywnej platformy kursowej. Jedna opłata — 1 999 zł.",
};

export default function LandingPage() {
  return <LandingClient />;
}
