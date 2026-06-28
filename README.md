# Course3D — Platforma kursu druku 3D

Platforma e-learningowa dla kursu druku 3D w cenie **999 PLN**, w której skład
wchodzi drukarka **Bambu Lab A1 Mini**. Interfejs w całości w języku polskim,
dostępny pod adresem [kurs.magbase.pl](https://kurs.magbase.pl).

Kurs prowadzony jest w modelu zamkniętym — konta tworzy administrator i wysyła
zaproszenia e-mail, na podstawie których kursant ustawia własną nazwę
użytkownika oraz hasło.

---

## Spis treści

- [Funkcje](#funkcje)
- [Stos technologiczny](#stos-technologiczny)
- [Struktura katalogów](#struktura-katalogów)
- [Uruchomienie](#uruchomienie)
- [Zmienne środowiskowe](#zmienne-środowiskowe)
- [Przepływ zaproszeń](#przepływ-zaproszeń)
- [Migracje bazy danych](#migracje-bazy-danych)
- [Import CSV](#import-csv)
- [Poradnik: synchronizacja kursora z filmem](#poradnik-synchronizacja-kursora-z-filmem)

---

## Funkcje

### Zarządzanie użytkownikami
- **Panel administracyjny** — tworzenie, edycja roli/nazwy oraz usuwanie kont, wyszukiwanie i filtrowanie po roli
- **System zaproszeń e-mail** — administrator tworzy konto, Resend wysyła link do ustawienia hasła i nazwy użytkownika
- **Import użytkowników z CSV** — masowe tworzenie kont i wysyłka zaproszeń
- **Awatary użytkowników** — zdjęcie profilowe wyświetlane w topbarze i przy postach
- **Status online** — zielona kropka przy nazwie użytkownika (aktywny = aktywność < 5 min); heartbeat co 60 sekund aktualizuje `lastActiveAt` w bazie

### Kurs
- **16 modułów, 108 lekcji** — pełna struktura kursu druku 3D (MODUŁ 0–15) załadowana do bazy SQL
- **Odtwarzacz wideo** — integracja z Mux (`muxAssetId`, `muxPlaybackId`)
- **Śledzenie postępu** — `LessonProgress` z `watchedSeconds` i `completed`
- **Znaczniki czasu** — `timestamps` JSON synchronizujące treść lekcji z odtwarzaczem wideo
- **Sidebar z rozdziałami** — lista lekcji po lewej stronie; narzędzia admina przypięte na dole (nie scrollują się razem z listą lekcji)

### Społeczność
- **Forum** — posty z komentarzami, zagnieżdżone odpowiedzi, załączniki
- **Wiadomości prywatne** — bezpośredni czat między użytkownikami
- **Ogłoszenia** — specjalne posty admina wyróżnione w feedzie
- **Status online przy postach** — zielona kropka przy nazwie autora posta i komentarza

### Wiki
- **Artykuły** — baza wiedzy z kategoriami (kody HMS, wymiana części, tutoriale)
- **Edytor HTML** — pełna kontrola formatowania treści
- **Zarządzanie** — admin może tworzyć, edytować i usuwać artykuły przez `/admin/wiki/new`
- **Widok czytelnika** — `/wiki` — lista artykułów pogrupowanych po kategorii; `/wiki/[slug]` — treść artykułu

### Wyszukiwarka globalna
- **Pole wyszukiwania w topbarze** — szuka jednocześnie w lekcjach, postach i artykułach Wiki
- **Debounce 300 ms** — zapytanie do `/api/search?q=...` wysyłane dopiero po chwili przerwy w pisaniu
- **Wyniki z ikonami** — lekcje (🎓), posty społeczności (💬), artykuły Wiki (📄)

### Integracja BambuLab
- **Logowanie przez token** — połączenie konta BambuLab przez token w panelu drukarki
- **Wybór drukarki** — lista urządzeń z chmury; przełączanie między drukarkami
- **Panel statusu** — temperatura, prędkość, stan druku w czasie rzeczywistym (polling REST)
- **Podgląd kamery** — pobieranie URL strumienia RTSP przez endpoint `ttcode`; wyświetlanie do skopiowania (kompatybilny z VLC/OBS)
- **Wylogowanie z BambuLab** — przycisk "Wyloguj z BambuLab" widoczny zawsze, niezależnie od liczby drukarek

### Profil użytkownika
- **Strona profilu** — `/profil/[userId]` — awatar, status online, postęp w kursie, ostatnie posty
- **Akcje admina na profilu** — zmiana roli, resetowanie hasła (tylko dla innych użytkowników)

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
| Baza danych        | PostgreSQL (Supabase)                |
| Uwierzytelnianie   | Własny JWT (jose, HS256) + Auth.js   |
| Hashowanie haseł   | bcryptjs                             |
| E-mail             | Resend + React Email                 |
| Walidacja          | Zod                                  |
| Wideo              | Mux                                  |

---

## Struktura katalogów

```
.
├── prisma/
│   ├── schema.prisma              # Pełny schemat bazy danych (źródło prawdy)
│   ├── seed.ts                    # Konto administratora startowego
│   └── sql-archive/               # Historyczne, jednorazowe skrypty SQL (już zaaplikowane)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── set-password/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         # Sidebar + topbar
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── kurs/[chapterId]/[lessonId]/page.tsx
│   │   │   ├── spolecznosc/page.tsx
│   │   │   ├── wiadomosci/page.tsx
│   │   │   ├── profil/[userId]/page.tsx
│   │   │   ├── drukarka/page.tsx  # Panel BambuLab
│   │   │   └── wiki/
│   │   │       ├── page.tsx       # Lista artykułów Wiki
│   │   │       └── [slug]/page.tsx
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── users/page.tsx
│   │   │       ├── chapters/page.tsx
│   │   │       ├── ogloszenia/page.tsx
│   │   │       └── wiki/
│   │   │           ├── new/page.tsx
│   │   │           └── [slug]/page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       ├── users/             # CRUD + CSV import + zaproszenia
│   │       ├── chapters/          # CRUD rozdziałów i lekcji
│   │       ├── posts/             # Posty i komentarze
│   │       ├── messages/          # Wiadomości prywatne
│   │       ├── wiki/              # CRUD artykułów Wiki
│   │       ├── search/            # GET ?q= — wyszukiwanie globalne
│   │       ├── heartbeat/         # POST — aktualizacja lastActiveAt
│   │       └── bambulab/          # connect, devices, status, camera
│   ├── components/
│   │   ├── ui/                    # shadcn/ui
│   │   ├── layout/                # sidebar.tsx, topbar.tsx
│   │   ├── community/             # post-card, comment-tree, post-feed
│   │   ├── shared/                # online-dot, admin-badge, avatar
│   │   ├── admin/                 # users-table, wiki-article-form
│   │   ├── chapters/              # chapter-list, lessons-manager
│   │   └── printer/               # printer-panel, camera
│   └── lib/
│       ├── auth.ts / auth.config.ts
│       ├── online-status.ts       # isOnline(lastActiveAt)
│       ├── prisma.ts
│       └── format-time.ts
```

---

## Uruchomienie

Wymagania: Node.js 18+, dostęp do bazy PostgreSQL (Supabase).

```bash
# 1. Instalacja zależności
npm install

# 2. Konfiguracja środowiska
cp .env.example .env
# Uzupełnij DATABASE_URL, DIRECT_URL, AUTH_SECRET itd.

# 3. Wygenerowanie klienta Prisma
npx prisma generate

# 4. Uruchomienie migracji ręcznych w Supabase SQL Editor
# (patrz: prisma/migrations-manual.sql)

# 5. (Opcjonalnie) Utworzenie konta administratora startowego
npm run db:seed
# Login: admin@course3d.pl / Hasło: admin123

# 6. (Opcjonalnie) Załadowanie struktury kursu
# Uruchom prisma/course-structure.sql w Supabase SQL Editor

# 7. Start w trybie deweloperskim
npm run dev
```

Aplikacja będzie dostępna pod `http://localhost:3000`.

---

## Zmienne środowiskowe

| Zmienna                  | Opis                                                        |
| ------------------------ | ----------------------------------------------------------- |
| `DATABASE_URL`           | Połączenie z PostgreSQL (pooler dla Supabase)               |
| `DIRECT_URL`             | Bezpośrednie połączenie (migracje Prisma)                   |
| `AUTH_SECRET`            | **Wymagany**, min. 32 znaki — podpis JWT (`openssl rand -base64 32`) |
| `NEXTAUTH_SECRET`        | Alias `AUTH_SECRET` (kompatybilność wsteczna)               |
| `NEXTAUTH_URL`           | Bazowy URL aplikacji                                        |
| `RESEND_API_KEY`         | Klucz API Resend (opcjonalny w dev)                         |
| `RESEND_FROM_EMAIL`      | Adres nadawcy zaproszeń                                     |
| `NEXT_PUBLIC_APP_URL`    | Publiczny URL używany w linkach zaproszeń                   |
| `BAMBULAB_CLIENT_ID`     | Client ID aplikacji BambuLab Cloud                          |
| `BAMBULAB_CLIENT_SECRET` | Client Secret aplikacji BambuLab Cloud                      |
| `BAMBULAB_REDIRECT_URI`  | URI przekierowania OAuth BambuLab                           |

---

## Uwierzytelnianie

Logowanie korzysta z **własnego, lekkiego mechanizmu JWT** opartego o bibliotekę
[`jose`](https://github.com/panva/jose) (algorytm **HS256**), a nie ze standardowego
przepływu NextAuth/Auth.js (który domyślnie tworzy szyfrowany token JWE niekompatybilny
z weryfikacją w edge-middleware).

- **Logowanie** — formularz wysyła `POST /api/auth/login`. Endpoint weryfikuje hasło
  (`bcrypt.compare`), podpisuje token HS256 (payload: `id`, `username`, `role` — bez
  danych wrażliwych, bo token jest jedynie podpisany, nie szyfrowany) i ustawia cookie
  `authjs.session-token` (`httpOnly`, `sameSite=lax`, `secure` przy HTTPS, ważność 30 dni).
- **Ochrona tras** — `src/middleware.ts` weryfikuje token (`jwtVerify`) przy każdym żądaniu;
  przekierowuje niezalogowanych na `/login`, a trasy `/admin/*` wymagają roli `ADMIN`.
- **Odczyt sesji po stronie serwera** — `auth()` z `src/lib/auth.ts`; `encode`/`decode`
  NextAuth są nadpisane na ten sam format HS256, aby format tokenu był spójny wszędzie.
- **Sekret** — `AUTH_SECRET` jest **wymagany** (min. 32 znaki); jego brak zatrzymuje
  aplikację na starcie (`src/lib/auth-secret.ts`) — bez cichego fallbacku.
- **Ochrona przed brute-force** — `POST /api/auth/login` ma rate limiting per IP
  (`src/lib/rate-limit.ts`).
- Avatar użytkownika (base64) **nie** jest zapisywany w tokenie — jest dociągany z bazy
  przy budowaniu sesji (token musi zmieścić się w limicie ~4 KB cookie).

---

## Przepływ zaproszeń

1. Administrator w `/admin/users` klika **„Dodaj użytkownika"** i podaje e-mail.
2. System tworzy rekord `User` z losowym `inviteToken` (32 znaki hex) oraz `inviteExpires` (ważność 7 dni).
3. Resend wysyła e-mail z linkiem: `…/set-password?token=xxx`.
4. Użytkownik otwiera link, ustawia **nazwę użytkownika** i **hasło**.
5. Token zostaje wyczyszczony, `emailVerified` ustawione — konto jest aktywne.

> **Uwaga:** pole „Nazwa użytkownika" na stronie ustawiania hasła to login wyświetlany na platformie, nie adres e-mail. E-mail jest już przypisany do konta przez administratora.

---

## Migracje bazy danych

Projekt korzysta z **ręcznych migracji SQL** uruchamianych w Supabase SQL Editor
(bez Prisma CLI `migrate`).

### 1. Migracja podstawowa (wymagana przed deploymentem)

Uruchom plik `prisma/migrations-manual.sql` w Supabase SQL Editor:

```sql
-- Dodaje kolumnę lastActiveAt do tabeli User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP(3);

-- Tworzy tabelę WikiArticle
CREATE TABLE IF NOT EXISTS "WikiArticle" ( ... );
```

### 2. Struktura kursu (opcjonalna)

Uruchom plik `prisma/course-structure.sql` w Supabase SQL Editor, aby wstawić
16 modułów i 108 lekcji kursu druku 3D do tabel `Chapter` i `Lesson`.

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
adresy są pomijane, a podsumowanie (utworzone / pominięte / błędy) jest wyświetlane po imporcie.

---

## Poradnik: synchronizacja kursora z filmem

Platforma obsługuje **znaczniki czasu** (`timestamps`) w lekcjach, które
automatycznie synchronizują treść tekstową lekcji z pozycją odtwarzacza wideo.
Dzięki temu, gdy kursant przewija wideo lub klika znacznik, kursor w dokumencie
przesuwa się do odpowiedniego fragmentu.

### Jak to działa

Każda lekcja może mieć pole `timestamps` w formacie JSON — tablicę obiektów
z sekundą i kotwicą:

```json
[
  { "seconds": 0,   "anchor": "wprowadzenie" },
  { "seconds": 45,  "anchor": "pierwsze-warstwy" },
  { "seconds": 120, "anchor": "kalibracja" },
  { "seconds": 300, "anchor": "druk-testowy" }
]
```

### Jak dodać znaczniki do lekcji

1. Otwórz panel admina: `/admin/chapters` → wybierz rozdział → kliknij lekcję.
2. W polu **„Znaczniki czasu (JSON)"** wpisz tablicę znaczników (przykład powyżej).
3. W polu **„Treść lekcji"** (Tiptap) dodaj nagłówki lub sekcje z identyfikatorami
   HTML pasującymi do `anchor`, np.:
   ```html
   <h2 id="pierwsze-warstwy">Pierwsze warstwy</h2>
   ```
4. Zapisz lekcję.

### Działanie po stronie kursanta

- **Kliknięcie znacznika czasu** w liście pod wideo → odtwarzacz skacze do danej sekundy
  i treść lekcji przewija się do kotwicy `anchor`.
- **Przewijanie wideo** → co sekundę sprawdzany jest aktualny czas; gdy przekroczy
  próg kolejnego znacznika, treść lekcji automatycznie przewija się do odpowiedniej sekcji
  (a aktywny znacznik jest podświetlony).

### Przykład kompletnego layoutu lekcji

```
┌─────────────────────────────────────────────┐
│              Odtwarzacz wideo                │
├──────────────────┬──────────────────────────┤
│  Znaczniki czasu │  Treść lekcji            │
│  0:00 Wstęp     │  <h2 id="wstep">Wstęp    │
│  0:45 Warstwy ◀ │  ...                      │
│  2:00 Kalibracja│  <h2 id="warstwy">...     │
└──────────────────┴──────────────────────────┘
```

Strzałka `◀` oznacza aktualnie aktywny znacznik (podświetlony na podstawie
pozycji wideo).
