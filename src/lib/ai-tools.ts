import type Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

/**
 * Narzędzia dostępne dla asystenta AI — WYŁĄCZNIE odczyt, WYŁĄCZNIE treści
 * kursowe (Wiki, lekcje, posty społeczności). Celowo NIE ma tu dostępu do
 * tabeli User (hasła, e-maile, tokeny zaproszeń), prywatnych wiadomości,
 * zgłoszeń pomocy ani żadnych danych administracyjnych — model nie
 * otrzymuje surowego dostępu SQL do bazy, tylko te konkretne, wąskie
 * zapytania Prisma zdefiniowane poniżej.
 */

/** Spłaszcza dokument Tiptap JSON do czystego tekstu. */
export function tiptapToText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { text?: string; content?: unknown[] };
  if (typeof n.text === "string") return n.text;
  if (Array.isArray(n.content)) {
    return n.content.map(tiptapToText).join(" ") + " ";
  }
  return "";
}

/** Usuwa znaczniki HTML i dekoduje najczęstsze encje — artykuły Wiki są edytowane jako HTML. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Krótki, tani-w-tokenach "spis treści" platformy — same tytuły (bez
 * pełnej treści), dołączany do system promptu, żeby model wiedział co
 * w ogóle istnieje i mógł trafnie dobrać zapytania do search_wiki /
 * search_lessons zamiast zgadywać słowa kluczowe na ślepo.
 */
export async function getPlatformIndex(): Promise<string> {
  const [wiki, chapters] = await Promise.all([
    prisma.wikiArticle.findMany({
      where: { published: true },
      orderBy: { title: "asc" },
      select: { title: true, category: true },
      take: 300,
    }),
    prisma.chapter.findMany({
      orderBy: { order: "asc" },
      select: { title: true, lessons: { orderBy: { order: "asc" }, select: { title: true } } },
    }),
  ]);

  const wikiList = wiki.map((w) => `- ${w.title}${w.category ? ` (${w.category})` : ""}`).join("\n");
  const lessonList = chapters
    .map((c) => `${c.title}:\n` + c.lessons.map((l) => `  - ${l.title}`).join("\n"))
    .join("\n");

  return [
    "SPIS TREŚCI PLATFORMY (same tytuły — użyj search_wiki/search_lessons, aby pobrać treść):",
    "",
    "Artykuły Wiki:",
    wikiList || "(brak)",
    "",
    "Lekcje kursu (wg rozdziałów):",
    lessonList || "(brak)",
  ].join("\n");
}

export interface Citation {
  type: "wiki" | "lesson" | "post";
  title: string;
  url: string;
  excerpt: string;
}

/**
 * Jeśli użytkownik pisze do asystenta ze strony konkretnej lekcji lub
 * artykułu Wiki, pobiera jej treść, żeby model mógł od razu odpowiadać
 * na pytania o "tę lekcję" bez zgadywania, o co chodzi.
 */
export async function getPageContext(pathname: string | null | undefined): Promise<string | null> {
  if (!pathname) return null;

  const lessonMatch = pathname.match(/^\/kurs\/([^/]+)/);
  if (lessonMatch) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonMatch[1] },
      select: { title: true, description: true, contentJson: true },
    });
    if (!lesson) return null;
    const text = lesson.contentJson ? tiptapToText(lesson.contentJson).replace(/\s+/g, " ").trim() : "";
    return [
      `KONTEKST BIEŻĄCEJ STRONY: użytkownik jest teraz na stronie lekcji „${lesson.title}".`,
      lesson.description ? `Opis: ${lesson.description}` : "",
      text ? `Treść lekcji: ${text.slice(0, 4000)}` : "",
      "Jeśli pytanie dotyczy tej lekcji, odpowiadaj na podstawie powyższej treści bez konieczności wywoływania narzędzi.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  const wikiMatch = pathname.match(/^\/wiki\/([^/]+)/);
  if (wikiMatch) {
    const article = await prisma.wikiArticle.findUnique({
      where: { slug: wikiMatch[1] },
      select: { title: true, content: true, published: true },
    });
    if (!article || !article.published) return null;
    return [
      `KONTEKST BIEŻĄCEJ STRONY: użytkownik czyta teraz artykuł Wiki „${article.title}".`,
      `Treść: ${stripHtml(article.content).slice(0, 4000)}`,
      "Jeśli pytanie dotyczy tego artykułu, odpowiadaj na podstawie powyższej treści bez konieczności wywoływania narzędzi.",
    ].join("\n");
  }

  return null;
}

export const AI_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_wiki",
    description:
      "Przeszukuje artykuły Wiki kursu (baza wiedzy: kody błędów, konserwacja, materiały, itp.) po słowie kluczowym. Zwraca listę pasujących artykułów z fragmentem treści i linkiem.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Słowo lub fraza do wyszukania, np. 'mokry filament'." },
      },
      required: ["query"],
    },
  },
  {
    name: "search_lessons",
    description:
      "Przeszukuje lekcje kursu po tytule i opisie. Zwraca listę pasujących lekcji z linkiem. Użyj get_lesson_content, aby pobrać pełną treść konkretnej lekcji.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Słowo lub fraza do wyszukania, np. 'kalibracja stołu'." },
      },
      required: ["query"],
    },
  },
  {
    name: "get_lesson_content",
    description: "Pobiera pełną treść tekstową konkretnej lekcji po jej ID (np. znalezionym przez search_lessons).",
    input_schema: {
      type: "object",
      properties: {
        lessonId: { type: "string", description: "ID lekcji." },
      },
      required: ["lessonId"],
    },
  },
  {
    name: "search_community_posts",
    description:
      "Przeszukuje posty na forum społeczności kursu po treści — przydatne, gdy inny kursant już opisał podobny problem lub rozwiązanie.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Słowo lub fraza do wyszukania." },
      },
      required: ["query"],
    },
  },
];

/**
 * Wykonuje jedno wywołanie narzędzia. Wszelkie znalezione źródła są
 * dopisywane do `citations` (tablica przekazana przez wywołującego —
 * osobna dla każdego żądania czatu, żeby równoległe rozmowy różnych
 * użytkowników się nie mieszały).
 */
export async function executeAiTool(
  name: string,
  input: Record<string, unknown>,
  citations: Citation[]
): Promise<string> {
  const query = typeof input.query === "string" ? input.query : "";

  function addCitation(c: Citation) {
    if (!citations.some((e) => e.url === c.url)) citations.push(c);
  }

  if (name === "search_wiki") {
    if (!query || query.length < 2) return JSON.stringify({ results: [] });
    const articles = await prisma.wikiArticle.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { title: true, slug: true, content: true },
    });
    const results = articles.map((a) => {
      const plain = stripHtml(a.content);
      const idx = plain.toLowerCase().indexOf(query.toLowerCase());
      const excerpt = idx >= 0 ? plain.slice(Math.max(0, idx - 80), idx + 200) : plain.slice(0, 200);
      const citation: Citation = { type: "wiki", title: a.title, url: `/wiki/${a.slug}`, excerpt: excerpt.trim() };
      addCitation(citation);
      return citation;
    });
    return JSON.stringify({ results });
  }

  if (name === "search_lessons") {
    if (!query || query.length < 2) return JSON.stringify({ results: [] });
    const lessons = await prisma.lesson.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, title: true, description: true },
    });
    const results = lessons.map((l) => {
      const citation: Citation = {
        type: "lesson",
        title: l.title,
        url: `/kurs/${l.id}`,
        excerpt: l.description ?? "",
      };
      addCitation(citation);
      return { id: l.id, title: l.title, description: l.description, url: citation.url };
    });
    return JSON.stringify({ results });
  }

  if (name === "get_lesson_content") {
    const lessonId = typeof input.lessonId === "string" ? input.lessonId : "";
    if (!lessonId) return JSON.stringify({ error: "Brak lessonId." });
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, title: true, description: true, contentJson: true },
    });
    if (!lesson) return JSON.stringify({ error: "Nie znaleziono lekcji." });
    const text = lesson.contentJson ? tiptapToText(lesson.contentJson).replace(/\s+/g, " ").trim() : "";
    addCitation({ type: "lesson", title: lesson.title, url: `/kurs/${lesson.id}`, excerpt: lesson.description ?? "" });
    return JSON.stringify({ title: lesson.title, content: text.slice(0, 6000) });
  }

  if (name === "search_community_posts") {
    if (!query || query.length < 2) return JSON.stringify({ results: [] });
    const posts = await prisma.post.findMany({
      where: { content: { contains: query, mode: "insensitive" } },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, content: true },
    });
    const results = posts.map((p) => {
      const idx = p.content.toLowerCase().indexOf(query.toLowerCase());
      const excerpt = idx >= 0 ? p.content.slice(Math.max(0, idx - 80), idx + 200) : p.content.slice(0, 200);
      const citation: Citation = {
        type: "post",
        title: p.title ?? p.content.slice(0, 60),
        url: `/spolecznosc/${p.id}`,
        excerpt: excerpt.trim(),
      };
      addCitation(citation);
      return citation;
    });
    return JSON.stringify({ results });
  }

  return JSON.stringify({ error: `Nieznane narzędzie: ${name}` });
}
