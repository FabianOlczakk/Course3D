import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WikiArticleForm } from "@/components/admin/wiki-article-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edytuj Wiki | Admin" };

export default async function EditWikiArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.wikiArticle.findUnique({
    where: { slug: params.slug },
    select: { id: true, title: true, slug: true, content: true, category: true, published: true },
  });
  if (!article) notFound();
  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <WikiArticleForm initial={article} />
    </div>
  );
}
