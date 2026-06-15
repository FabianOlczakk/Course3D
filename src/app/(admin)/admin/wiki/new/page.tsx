import { WikiArticleForm } from "@/components/admin/wiki-article-form";

export const metadata = { title: "Nowy artykuł Wiki | Admin" };

export default function NewWikiArticlePage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <WikiArticleForm />
    </div>
  );
}
