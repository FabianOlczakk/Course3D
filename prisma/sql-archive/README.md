# Archive of manual SQL scripts

One-off migration scripts that were run by hand in the Supabase SQL editor.
Kept here purely as historical documentation — they have **already been
applied** to the production database and are not part of the automated build
or deploy process.

`prisma/schema.prisma` is the source of truth for the schema, applied with
`npm run db:push`.

- `migrations-manual.sql` — added `lastActiveAt` and the `WikiArticle` table.
- `course-structure.sql` — course structure (Chapter/Lesson).
- `bambulab-migration.sql` — BambuLab connection table (BambuLab integration has since been removed from the app).
- `migrations-extra.sql` — added `Lesson.extraDescription` and `User.progressPrivate`.
- `migrations-v0.9.9.sql` — added `User.activityPrivate` and comment voting.
- `migrations-redesign.sql` — added `Category`/`Announcement` as real tables instead of post-marker hacks.
