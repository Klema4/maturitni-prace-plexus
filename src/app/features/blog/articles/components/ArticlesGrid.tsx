"use client";

import { ArticlesGridProps } from "@/app/features/blog/articles/types";
import { Button } from "@/app/components/blog/ui";
import Image from "next/image";
import ArticleCard from "@/app/features/blog/articles/components/ArticleCard";
import { useArticlesGrid } from "@/app/features/blog/articles/hooks/useArticlesGrid";
import { Loader2, RefreshCcw } from "lucide-react";

/**
 * ArticlesGrid
 * @interface ArticlesGridProps
 * @description Grid, který obaluje veškeré články v něm pro responzivnost a deduplikaci kódu.
 */
export default function ArticlesGrid({
  title,
  description,
  articles,
  loadMoreButton,
  limit = 4,
}: ArticlesGridProps) {
  const safeArticles = articles ?? [];
  const { items, isLoadingMore, hasMore, handleLoadMore } = useArticlesGrid(
    safeArticles,
    limit,
  );

  if (articles == null) {
    return (
      <>
        <section className="w-full px-4 lg:px-8 mt-8 py-8">
          <div className="flex flex-col gap-1">
            <h2 className="newsreader text-3xl lg:text-4xl font-medium tracking-tighter leading-tight text-dark">
              {title}
            </h2>
            <p className="text-md lg:text-base text-zinc-600 tracking-tight font-medium max-w-2xl">
              {description}
            </p>
          </div>
        </section>
        <section className="w-full px-4 lg:px-8">
          <div className="bg-white/80 rounded-xl text-center flex flex-col gap-2 items-center justify-center w-full py-12 p-4">
            <Image
              priority
              src="/doodles/ZombieingDoodle.svg"
              alt="Error"
              width={128}
              height={128}
            />
            <h1 className="text-dark font-medium text-2xl lg:text-3xl tracking-tighter newsreader">
              Došlo k chybě
            </h1>
            <p className="text-zinc-500 tracking-tight font-medium text-md lg:text-base">
              Nedokázali jsme načíst žádné články.
              <br />
              Pokud problém přetrvává, kontaktujte nás.
            </p>
          </div>
        </section>
      </>
    );
  }

  if (articles.length < 1) {
    return (
      <>
        <section className="w-full px-4 lg:px-8 mt-8 py-8">
          <div className="flex flex-col gap-1">
            <h2 className="newsreader text-3xl lg:text-4xl font-medium tracking-tighter leading-tight text-dark">
              {title}
            </h2>
            <p className="text-md lg:text-base text-zinc-600 tracking-tight font-medium max-w-2xl">
              {description}
            </p>
          </div>
        </section>
        <section className="w-full px-4 lg:px-8">
          <div className="bg-white/80 rounded-xl text-center flex flex-col gap-2 items-center justify-center w-full py-12 p-4">
            <Image
              priority
              src="/doodles/SittingDoodle.svg"
              alt="No articles"
              width={128}
              height={128}
            />
            <h1 className="text-dark font-medium text-2xl lg:text-3xl tracking-tighter newsreader">
              Kam vše zmizelo?
            </h1>
            <p className="text-zinc-500 tracking-tight font-medium text-md lg:text-base">
              Zatím tu nejsou žádné články. Až nějaké přibudou, zobrazí se zde.
            </p>
          </div>
        </section>
      </>
    );
  }
  const uniqueItems = items.filter(
    (article, index, self) =>
      self.findIndex((a) => a.id === article.id) === index,
  );

  return (
    <>
      <section className="w-full px-4 lg:px-8 mt-8 py-8">
        <div className="flex flex-col gap-1">
          <h2 className="newsreader text-3xl lg:text-4xl font-medium tracking-tighter leading-tight text-dark">
            {title}
          </h2>
          <p className="text-md lg:text-base text-zinc-600 tracking-tight font-medium max-w-2xl">
            {description}
          </p>
        </div>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full px-4 lg:px-8">
        {uniqueItems.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      {loadMoreButton && hasMore && (
        <div className="flex justify-center py-8">
          <Button
            variant="subtle"
            size="sm"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="cursor-pointer h-10 px-4"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Načítám...
              </>
            ) : (
              <>
                <RefreshCcw size={16} /> Načíst další články
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}
