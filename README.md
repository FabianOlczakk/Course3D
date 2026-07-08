# Interaktywny Kurs Druku 3D

A closed-enrollment e-learning platform for a 3D printing course. Accounts are
created by an administrator, who sends an email invite; the student follows
the link to set their own username and password. The UI is entirely in
Polish and is deployed at [kurs.magbase.pl](https://kurs.magbase.pl).

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database migrations](#database-migrations)
- [Authentication](#authentication)
- [Invite flow](#invite-flow)
- [CSV import](#csv-import)
- [Video timestamps](#video-timestamps)
- [Popularity ranking](#popularity-ranking)

---

## Features

### User management
- **Admin panel** (`/admin/users`) — create, edit (role/username), delete accounts; search and filter by role
- **Email invites** — admin creates an account, Resend sends a link to set username/password
- **CSV bulk import** — create many accounts at once, each gets an automatic invite email
- **Avatars** — profile picture shown in the topbar, sidebar and next to posts/comments
- **Online status** — a green dot next to a username when `lastActiveAt` is under 5 minutes old; a client-side heartbeat updates it every 60s
- **Privacy toggles** — a user can hide their course progress and/or online status from other students (admins always see both)
- **Newsletter consent** — every user is opted in by default; can unsubscribe from their profile settings, and every campaign/transactional email carries a small unsubscribe link in the footer

### Course
- Chapters → lessons structure, managed at `/admin/chapters`
- **Mux video player** with per-lesson `timestamps` (JSON) that keep the lesson text in sync with playback position — see [Video timestamps](#video-timestamps)
- **Progress tracking** — `LessonProgress` (`watchedSeconds`, `completed`) per user/lesson
- **Per-lesson notes and ratings**
- Sidebar chapter list with a live progress bar

### Community
- **Forum** (`/spolecznosc`) — posts with nested comments, attachments, upvote/downvote
- **Popularity sort** — posts and top-level comments are ranked with a Wilson-score-based algorithm (see [Popularity ranking](#popularity-ranking))
- **Private messages** (`/wiadomosci`) — direct chat between users; SYSTEM-authored messages cannot be sent to admin accounts
- **Announcements** (`/ogloszenia`) — admin-authored posts pinned/highlighted in the feed
- **@mentions** — typing `@username` in a post/comment links to that user's profile; renaming a username rewrites existing mentions

### Wiki
- Knowledge base articles with categories, managed at `/admin/wiki`
- Rich HTML editor for article content
- Reader view at `/wiki` (grouped by category) and `/wiki/[slug]`

### Static pages ("Strony")
- Admin-authored standalone pages at `/strony/[slug]`, with `PUBLIC` / `USERS` / `ADMIN` visibility
- `PUBLIC` pages are reachable without logging in (bypassed in `src/middleware.ts`)

### Forms ("Formularze")
- Admin-built surveys/forms at `/admin/formularze` — question types `TEXT`, `TEXTAREA`, `NUMBER`, `CHECKBOX`, `RADIO`
- Visibility targeting: `ALL` (everyone), `ACTIVE` (existing users at creation time), `NEW` (users who join after)
- Optional "skip" toggle per form; response viewer per form

### Email campaigns
- Admin can compose and send one-off email campaigns at `/admin/email`
- Recipients: `ALL` users, users with `NEWSLETTER` consent, or a `SPECIFIC` list of addresses
- Test-send to a single address before a full send; history table of every past campaign with status (`DRAFT` / `SENDING` / `SENT` / `FAILED`)

### Global search
- Topbar search box queries lessons, posts and wiki articles at once (`/api/search?q=...`), debounced 300ms

### Support tickets
- Users can submit a support ticket (`/api/support`); admins triage them at `/admin` (see `SupportTicket` model)

### Developer panel
- `/admin/developer` — surfaces the app version (`src/lib/version.ts`), PM2 logs, and a one-click deploy trigger (see [Environment variables](#environment-variables))

### User profile
- `/profil/[userId]` — avatar, online status, course progress, recent posts
- Admin actions on another user's profile: change role, force password reset

---

## Tech stack

| Layer              | Technology                            |
| ------------------ | -------------------------------------- |
| Framework          | Next.js 14 (App Router)                |
| Language           | TypeScript                             |
| Styling            | Tailwind CSS + CSS custom properties   |
| UI components      | shadcn/ui + Radix UI                   |
| Icons              | lucide-react                           |
| ORM                | Prisma                                 |
| Database           | PostgreSQL (Supabase)                  |
| Auth               | Custom JWT (jose, HS256) + Auth.js     |
| Password hashing   | bcryptjs                               |
| Email              | Resend + React Email                   |
| Validation         | Zod                                    |
| Video              | Mux                                    |
| Fonts              | Self-hosted (DM Sans, Space Grotesk) via `next/font/local` |

> Fonts are vendored under `src/fonts/` and loaded with `next/font/local` rather
> than `next/font/google`, so `next build` never depends on outbound network
> access to `fonts.gstatic.com` — this avoids build failures on hosts with
> restricted or unreliable internet access.

---

## Project structure

```
.
├── prisma/
│   ├── schema.prisma              # Full database schema (source of truth)
│   ├── seed.ts                    # Seeds a starter admin account
│   └── sql-archive/               # Historical one-off SQL scripts (already applied to prod)
├── src/
│   ├── app/
│   │   ├── (auth)/                # login, forgot/reset/set-password
│   │   ├── (dashboard)/           # Authenticated app shell (sidebar + topbar)
│   │   │   ├── dashboard/
│   │   │   ├── kurs/[lessonId]/
│   │   │   ├── spolecznosc/       # Forum
│   │   │   ├── wiadomosci/        # Messages
│   │   │   ├── ogloszenia/        # Announcements
│   │   │   ├── wiki/
│   │   │   ├── profil/[userId]/
│   │   │   ├── profile/           # Own account settings
│   │   │   └── admin/
│   │   │       ├── developer/
│   │   │       ├── email/         # Email campaigns
│   │   │       └── formularze/    # Forms
│   │   ├── (admin)/admin/         # users, chapters, wiki, oceny, ogloszenia, strony
│   │   ├── strony/[slug]/         # Public/standalone static pages
│   │   └── api/                   # Route handlers, one folder per resource
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives + StyledSelect
│   │   ├── layout/                # sidebar.tsx, topbar.tsx
│   │   ├── community/             # post-card, comment-tree, post-feed
│   │   ├── admin/                 # users-table, forms-manager, email-campaign-manager, ...
│   │   ├── chapters/               # chapter-list, lessons-manager
│   │   └── shared/                 # online-dot, admin-badge, highlight-target
│   ├── emails/                    # React Email templates (invite, reset-password)
│   ├── fonts/                     # Self-hosted DM Sans / Space Grotesk .ttf files
│   └── lib/                       # auth.ts, prisma.ts, mail.ts, version.ts, ...
```

---

## Getting started

Requirements: Node.js 18+, a PostgreSQL database (Supabase recommended).

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET, etc. — see below.

# 3. Generate the Prisma client
npx prisma generate

# 4. Push the schema to your database
npm run db:push

# 5. (Optional) Create a starter admin account
npm run db:seed

# 6. Start the dev server
npm run dev
```

The app runs at `http://localhost:3000`.

---

## Environment variables

See `.env.example` for a ready-to-copy template. Reference:

| Variable                 | Description                                                          |
| ------------------------- | --------------------------------------------------------------------- |
| `DATABASE_URL`            | Pooled PostgreSQL connection (used by Prisma Client at runtime)      |
| `DIRECT_URL`              | Direct (non-pooled) connection, used for `prisma db push`/migrations |
| `AUTH_SECRET`             | **Required**, min. 32 chars — signs the session JWT (`openssl rand -base64 32`) |
| `NEXTAUTH_SECRET`         | Alias of `AUTH_SECRET`, kept for Auth.js compatibility                |
| `NEXTAUTH_URL`            | Base URL of the app                                                    |
| `NEXT_PUBLIC_APP_URL`     | Public URL used in invite/reset links and email templates             |
| `RESEND_API_KEY`          | Resend API key (invites, password resets, campaigns)                 |
| `RESEND_FROM_EMAIL`       | Sender address for outgoing email                                     |
| `DEPLOY_SCRIPT`           | Optional — absolute path to a deploy script the admin developer panel can trigger |
| `PM2_OUT_LOG` / `PM2_ERR_LOG` | Optional — absolute paths to PM2 stdout/stderr logs shown in the developer panel |
| `APP_LOG_DIR`             | Optional — directory for application log files (defaults to `./logs`) |

`AUTH_SECRET` is validated at import time (`src/lib/auth-secret.ts`) — the app
refuses to start (including at build time, since `middleware.ts` imports it)
if it is missing or shorter than 32 characters.

---

## Database migrations

The schema in `prisma/schema.prisma` is the source of truth, applied with:

```bash
npm run db:push
```

Older one-off manual SQL scripts (applied directly against Supabase before the
project settled on `prisma db push`) live in `prisma/sql-archive/` — kept for
historical reference only, not part of the build or deploy process.

`prisma/migrations-forms-email.sql` is a manual, idempotent SQL equivalent of
the Forms/Email-campaign schema additions, for environments that prefer
running a plain SQL script over `prisma db push`. Run it once against the
production database, then it can be moved into `sql-archive/`.

---

## Authentication

Login uses a **custom, lightweight JWT** signed with
[`jose`](https://github.com/panva/jose) (HS256) rather than Auth.js's default
encrypted JWE flow, which isn't easily verifiable from edge middleware.

- **Login** — the form posts to `POST /api/auth/login`. The handler verifies
  the password (`bcrypt.compare`), signs an HS256 token (payload: `id`,
  `username`, `role` — no sensitive data, since the token is signed but not
  encrypted) and sets an `authjs.session-token` cookie (`httpOnly`,
  `sameSite=lax`, `secure` over HTTPS, 30-day expiry).
- **Route protection** — `src/middleware.ts` verifies the token
  (`jwtVerify`) on every request, redirects unauthenticated users to
  `/login`, and requires the `ADMIN` role for `/admin/*` routes. Paths under
  `/strony/` bypass this check (public static pages).
- **Server-side session** — `auth()` in `src/lib/auth.ts`; Auth.js's
  `encode`/`decode` are overridden to the same HS256 format so tokens are
  consistent everywhere.
- **Secret** — `AUTH_SECRET` is required (min. 32 chars); its absence stops
  the app at import time (`src/lib/auth-secret.ts`), with no silent fallback.
- **Brute-force protection** — `POST /api/auth/login` is rate-limited per IP
  (`src/lib/rate-limit.ts`).
- The user's avatar (base64) is **not** stored in the token — it's fetched
  from the database when building the session, keeping the cookie under the
  ~4KB browser limit.

---

## Invite flow

1. An admin clicks **"Dodaj użytkownika"** in `/admin/users` and enters an email.
2. The system creates a `User` record with a random `inviteToken` (32 hex
   chars) and `inviteExpires` (7-day validity).
3. Resend sends an email with a link: `…/set-password?token=xxx`.
4. The user opens the link and sets their **username** and **password**.
5. The token is cleared and `emailVerified` is set — the account is active.

> The "Nazwa użytkownika" field on the set-password page is the login name
> shown across the platform, not the email address — the email is already
> attached to the account by the admin.

---

## CSV import

The CSV file should have an `email` column (required) and an optional `role`
column (`ADMIN` or `STUDENT`, default `STUDENT`):

```csv
email,role
student1@example.com,STUDENT
student2@example.com
new.admin@example.com,ADMIN
```

Every newly created account automatically receives an invite email. Existing
addresses are skipped, and a summary (created / skipped / errors) is shown
after the import.

---

## Video timestamps

Lessons support a `timestamps` JSON field that keeps the lesson text
synchronized with the video player's playback position.

### How it works

Each lesson can have a `timestamps` array of `{ seconds, anchor }` objects:

```json
[
  { "seconds": 0,   "anchor": "wprowadzenie" },
  { "seconds": 45,  "anchor": "pierwsze-warstwy" },
  { "seconds": 120, "anchor": "kalibracja" },
  { "seconds": 300, "anchor": "druk-testowy" }
]
```

### Adding timestamps to a lesson

1. Open `/admin/chapters` → pick a chapter → click a lesson.
2. In **"Znaczniki czasu (JSON)"**, enter the array shown above.
3. In the lesson content editor, add headings/sections with matching HTML
   `id`s, e.g. `<h2 id="pierwsze-warstwy">Pierwsze warstwy</h2>`.
4. Save the lesson.

### Student-facing behavior

- Clicking a timestamp in the list under the video seeks the player to that
  second and scrolls the lesson content to the matching anchor.
- While the video plays, the current time is checked; crossing a timestamp
  threshold auto-scrolls the lesson content to the matching section and
  highlights the active timestamp.

---

## Popularity ranking

Posts (`?sort=popular`, the default) and top-level comments are ranked with a
**Wilson score lower bound** on the upvote/downvote ratio, blended with a
small activity bonus and a time-decay factor so that older content doesn't
permanently dominate the feed:

```ts
function wilsonScore(up: number, down: number): number {
  const n = up + down;
  if (n === 0) return 0;
  const z = 1.96; // 95% confidence
  const p = up / n;
  return (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) / (1 + (z * z) / n);
}

function postScore(up: number, down: number, commentCount: number, createdAt: Date): number {
  const ageHours = (Date.now() - createdAt.getTime()) / 3_600_000;
  const activityBonus = Math.log1p(commentCount) * 0.15;
  const decayFactor = 1 / Math.pow(ageHours + 2, 0.8);
  return (wilsonScore(up, down) + activityBonus) * decayFactor;
}
```

`?sort=new` falls back to plain chronological, cursor-based pagination —
popularity sort uses page-number pagination instead, since the ranking order
shifts as votes/comments come in.
