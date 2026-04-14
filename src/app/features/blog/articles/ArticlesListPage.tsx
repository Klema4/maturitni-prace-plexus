import { Suspense } from "react";
import ArticlesListContainer from "@/app/features/blog/articles/components/ArticlesListContainer";
import { getArticlesList } from "@/lib/services/articlesService";
import { getTagBySlug } from "@/lib/repositories/tagsRepository";

/**
 * ArticlesListLoader
 * Načte iniciální data článků a předá je do kontejneru.
 */
async function ArticlesListLoader({ tagSlug }: { tagSlug?: string }) {
  const resolvedTag = tagSlug ? await getTagBySlug(tagSlug) : null;
  const tagIds = resolvedTag ? [resolvedTag.id] : undefined;

  const initialArticlesData = await getArticlesList({
    limit: 12,
    offset: 0,
    tagIds,
  });
  return (
    <ArticlesListContainer
      initialArticles={JSON.parse(JSON.stringify(initialArticlesData))}
      tag={tagSlug}
    />
  );
}

/**
 * Vlastnosti pro ArticlesListPage.
 */
type ArticlesListPageProps = {
  tagSlug?: string;
};

/**
 * ArticlesListPage
 * Stránka se seznamem všech článků.
 */
export default async function ArticlesListPage({ tagSlug }: ArticlesListPageProps) {
  const resolvedTag = tagSlug ? await getTagBySlug(tagSlug) : null;
  const tagName = resolvedTag?.name ?? (tagSlug ? tagSlug.replace(/-/g, " ").trim() : undefined);

  return (
    <div className="min-h-screen">
      <section className="w-full px-4 lg:px-8 mt-32 mb-12">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-4">
          <h1 className="newsreader text-5xl lg:text-7xl font-medium tracking-tighter text-dark">
            {tagName ? `Štítek: ${tagName}` : "Všechny články"}
          </h1>
          <p className="tracking-tight font-medium text-zinc-600 text-md max-w-2xl leading-relaxed">
            {tagName
              ? `Procházíte články se štítkem ${tagName}.`
              : "Objevte nejnovější zprávy, hloubkové analýzy a zajímavé příběhy z celého světa Plexus. Procházejte naši kompletní knihovnu obsahu."}
          </p>
        </div>
      </section>

      <div className="max-w-screen-2xl mx-auto">
        <Suspense
          fallback={
            <div className="p-8 text-center text-zinc-600 tracking-tight">
              Načítám články...
            </div>
          }
        >
          <ArticlesListLoader tagSlug={tagSlug} />
        </Suspense>
      </div>
    </div>
  );
}
