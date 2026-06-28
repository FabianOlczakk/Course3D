# Archiwum ręcznych skryptów SQL

Jednorazowe skrypty migracji uruchamiane ręcznie w edytorze SQL Supabase.
Przechowywane wyłącznie jako dokumentacja historyczna — **zostały już
zaaplikowane** na bazie produkcyjnej i nie są częścią automatycznego procesu
budowania ani deploya.

Źródłem prawdy dla schematu jest `prisma/schema.prisma` (stosowany przez
`npm run db:push`).

- `migrations-manual.sql` — dodanie `lastActiveAt` oraz tabeli `WikiArticle`.
- `course-structure.sql` — struktura kursu (Chapter/Lesson).
- `bambulab-migration.sql` — tabela połączeń BambuLab.
