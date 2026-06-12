# Course3D — Platforma kursu druku 3D

Platforma e-learningowa dla kursu druku 3D w cenie **999 PLN**, w której skład
wchodzi drukarka **Bambu Lab A1 Mini**. Interfejs w całości w języku polskim.

Kurs prowadzony jest w modelu zamkniętym — konta tworzy administrator i wysyła
zaproszenia e-mail, na podstawie których kursant ustawia własną nazwę
użytkownika oraz hasło.

---

## Spis treści

- [Funkcje](#funkcje)
- [Stos technologiczny](#stos-technologiczny)
- [Architektura](#architektura)
- [Struktura katalogów](#struktura-katalogów)
- [Plan faz](#plan-faz)
- [Uruchomienie](#uruchomienie)
- [Zmienne środowiskowe](#zmienne-środowiskowe)
- [Przepływ zaproszeń](#przepływ-zaproszeń)
- [Import CSV](#import-csv)

---

## Funkcje

Faza 1 (zrealizowana w tym repozytorium):

1. **Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui** — nowoczesny
   frontend z gotowymi, dostępnymi komponentami UI.
2. **Prisma ORM + PostgreSQL** — pełny schemat bazy danych dla **wszystkich faz**
   (użytkownicy, kursy, lekcje, postępy, wiadomości, społeczność).
3. **NextAuth.js v5 (Auth.js)** — logowanie hasłem, role `ADMIN` / `STUDENT`,
   sesje JWT, ochrona tras przez middleware.
4. **Panel administracyjny użytkowników** — tworzenie, edycja roli/nazwy oraz
   usuwanie kont, wyszukiwanie i filtrowanie po roli.
5. **System zaproszeń e-mail** — administrator tworzy konto, a Resend wysyła link
   do ustawienia hasła i nazwy użytkownika.
6. **Import użytkowników z CSV** — masowe tworzenie kont i wysyłka zaproszeń.

---

## Stos technologiczny

| Warstwa            | Technologia                          |
| ------------------ | ------------------------------------ |
| Framework          | Next.js 14 (App Router)              |
| Język              | TypeScript                           |
| Stylowanie         | Tailwind CSS                         |
| Komponenty UI      | shadcn/ui + Radix UI                 |
| Ikony              | lucide-react                         |
| ORM                | Prisma                               |
| Baza danych        | PostgreSQL (kompatybilne z Supabase) |
| Uwierzytelnianie   | NextAuth.js v5 (Auth.js)             |
| Hashowanie haseł   | bcryptjs                             |
| E-mail             | Resend + React Email                 |
| Walidacja          | Zod                                  |

---

## Architektura

```
                          ┌─────────────────────────────┐
                          │          Przeglądarka        │
                          │   (React Server/Client comp.)│
                          └───────────────┬──────────────┘
                                          │ HTTPS
                          ┌───────────────▼──────────────┐
                          │        Next.js 14 (App)       │
                          │                               │
   ┌──────────────┐       │  ┌────────────┐  ┌─────────┐  │
   │ middleware.ts │◀──────┤  │  Strony /  │  │  Route  │  │
   │ (ochrona      │       │  │  layouty   │  │ Handlers│  │
   │  tras + role) │       │  │ (RSC/SSR)  │  │ (/api)  │  │
   └──────────────┘       │  └─────┬──────┘  └────┬────┘  │
                          │        │              │       │
                          │   ┌────▼──────────────▼────┐  │
                          │   │      lib/auth.ts        │  │
                          │   │   (NextAuth v5, JWT)    │  │
                          │   └────────────┬───────────┘  │
                          └────────────────┼──────────────┘
                                           │
                 ┌─────────────────────────┼─────────────────────┐
                 │                         │                       │
        ┌────────▼────────┐      ┌─────────▼────────┐    ┌─────────▼────────┐
        │   Prisma Client │      │     Resend       │    │  React Email     │
        │        │        │      │  (wysyłka maili) │◀───│  (szablony .tsx) │
        └────────┼────────┘      └──────────────────┘    └──────────────────┘
                 │
        ┌────────▼────────┐
        │   PostgreSQL    │
        │   (Supabase)    │
        └─────────────────┘
```

---

## Struktura katalogów

```
.
├── prisma/
│   ├── schema.prisma          # Pełny schemat (wszystkie fazy)
│   └── seed.ts                # Konto administratora startowego
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx           # Przekierowanie /login lub /dashboard
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── set-password/page.tsx   # Strona linku zaproszenia
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx     # Sidebar + topbar
│   │   │   └── dashboard/page.tsx
│   │   ├── (admin)/
│   │   │   ├── layout.tsx     # Sekcja tylko dla ADMIN
│   │   │   └── admin/users/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── auth/set-password/route.ts
│   │       └── users/
│   │           ├── route.ts            # GET (lista), POST (utwórz+zaproś)
│   │           ├── [id]/route.ts       # PATCH (rola/nazwa), DELETE
│   │           └── import-csv/route.ts # POST (masowy import)
│   ├── components/
│   │   ├── ui/                # Komponenty shadcn/ui
│   │   ├── auth/             # login-form, set-password-form
│   │   ├── admin/           # users-table, *-dialog
│   │   ├── dashboard/      # sidebar, topbar, app-shell
│   │   └── providers.tsx
│   ├── emails/
│   │   └── invite-email.tsx  # Szablon e-maila zaproszenia (PL)
│   ├── lib/
│   │   ├── auth.ts           # Konfiguracja NextAuth v5
│   │   ├── admin-guard.ts    # Ochrona API dla adminów
│   │   ├── prisma.ts         # Singleton Prisma Client
│   │   ├── mail.ts           # Integracja z Resend
│   │   ├── invite.ts         # Generowanie tokenów zaproszeń
│   │   ├── users.ts          # Logika tworzenia użytkownika + zaproszenia
│   │   └── utils.ts          # cn(), formatDate()
│   └── middleware.ts         # Ochrona tras + ról
├── .env.example
├── components.json
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## Plan faz

### Faza 1 — Fundament i zarządzanie użytkownikami ✅ (ten kod)

- [x] Konfiguracja Next.js 14, TypeScript, Tailwind, shadcn/ui
- [x] Pełny schemat Prisma (wszystkie fazy) + PostgreSQL
- [x] NextAuth v5 z rolami ADMIN/STUDENT, middleware
- [x] Panel administracyjny użytkowników (CRUD, role)
- [x] System zaproszeń e-mail (Resend + React Email)
- [x] Import użytkowników z CSV
- [x] Logowanie i strona ustawienia hasła z linku

### Faza 2 — Kurs i odtwarzacz wideo

- [ ] Modele Chapter / Lesson (już w schemacie)
- [ ] Panel admina do tworzenia rozdziałów i lekcji
- [ ] Edytor treści lekcji (Tiptap → `contentJson`)
- [ ] Integracja wideo (Mux: `muxAssetId`, `muxPlaybackId`)
- [ ] Śledzenie postępu (`LessonProgress`, `watchedSeconds`)
- [ ] Znaczniki czasu (`timestamps`) synchronizujące treść z wideo

### Faza 3 — Społeczność i komunikacja

- [ ] Wiadomości prywatne (`Message`) z załącznikami
- [ ] Forum/społeczność (`Post`) z komentarzami
- [ ] Zagnieżdżone komentarze (`Comment` z `parentId`)
- [ ] Powiadomienia

### Faza 4 — Interaktywność i certyfikaty

- [ ] Quizy uruchamiane w trakcie wideo (`quizzes`)
- [ ] Zadania praktyczne (`tasks`)
- [ ] Generowanie certyfikatów ukończenia
- [ ] Statystyki i panel postępów

---

## Uruchomienie

Wymagania: Node.js 18+, dostęp do bazy PostgreSQL.

```bash
# 1. Instalacja zależności
npm install

# 2. Konfiguracja środowiska
cp .env.example .env
#    Uzupełnij DATABASE_URL, DIRECT_URL, AUTH_SECRET itd.

# 3. Wygenerowanie klienta i utworzenie schematu w bazie
npm run db:push

# 4. (Opcjonalnie) Utworzenie konta administratora startowego
npm run db:seed
#    Login: admin@course3d.pl / Hasło: admin123

# 5. Start w trybie deweloperskim
npm run dev
```

Aplikacja będzie dostępna pod `http://localhost:3000`.

> **Tryb deweloperski bez Resend:** jeśli `RESEND_API_KEY` nie jest ustawiony,
> linki zaproszeń są wypisywane w konsoli serwera oraz zwracane w odpowiedzi
> API (i wyświetlane w oknie dialogowym), aby ułatwić testowanie.

---

## Zmienne środowiskowe

| Zmienna               | Opis                                                  |
| --------------------- | ----------------------------------------------------- |
| `DATABASE_URL`        | Połączenie z PostgreSQL (pooler dla Supabase)         |
| `DIRECT_URL`          | Bezpośrednie połączenie (migracje Prisma)             |
| `AUTH_SECRET`         | Sekret NextAuth v5 (`openssl rand -base64 32`)        |
| `NEXTAUTH_SECRET`     | Alias sekretu (kompatybilność wsteczna)               |
| `NEXTAUTH_URL`        | Bazowy URL aplikacji                                  |
| `RESEND_API_KEY`      | Klucz API Resend (opcjonalny w dev)                   |
| `RESEND_FROM_EMAIL`   | Adres nadawcy zaproszeń                               |
| `NEXT_PUBLIC_APP_URL` | Publiczny URL używany w linkach zaproszeń             |

---

## Przepływ zaproszeń

1. Administrator w `/admin/users` klika **„Dodaj użytkownika”** i podaje e-mail.
2. System tworzy rekord `User` z losowym `inviteToken` (32 znaki hex) oraz
   `inviteExpires` (ważność 7 dni).
3. Resend wysyła e-mail z linkiem: `…/set-password?token=xxx`.
4. Użytkownik otwiera link, ustawia nazwę użytkownika i hasło.
5. Token zostaje wyczyszczony, `emailVerified` ustawione — konto jest aktywne.

---

## Import CSV

Plik CSV powinien zawierać kolumnę `email` (wymagana) oraz opcjonalnie `role`
(`ADMIN` lub `STUDENT`, domyślnie `STUDENT`). Przykład:

```csv
email,role
kursant1@przyklad.pl,STUDENT
kursant2@przyklad.pl
nowy.admin@przyklad.pl,ADMIN
```

Każde nowo utworzone konto automatycznie otrzymuje zaproszenie e-mail. Istniejące
adresy są pomijane, a podsumowanie (utworzone / pominięte / błędy) jest
wyświetlane po imporcie.
