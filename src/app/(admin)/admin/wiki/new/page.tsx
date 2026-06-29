import { WikiArticleForm } from "@/components/admin/wiki-article-form";

export const metadata = { title: "Nowy artykuł Wiki | Admin" };

export default function NewWikiArticlePage() {
  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <WikiArticleForm />
    </div>
  );
}
