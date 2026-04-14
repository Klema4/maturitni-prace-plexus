"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ArticlesToolbar } from "@/components/articles";
import ArticlesList, {
  type Article,
} from "@/components/screens/landing/ArticlesList";
import type { ArticleCard } from "@/lib/schemas/articlesSchema";
import { Button } from "@/app/components/blog/ui";
import { Loader2, RefreshCcw } from "lucide-react";

const ARTICLES_PER_PAGE = 12;

/**
 * Vlastnosti pro ArticlesListContainer komponentu.
 */
interface ArticlesListContainerProps {
  section?: string;
  tag?: string;
  initialArticles?: ArticleCard[];
}

/**
 * Kontejner pro seznam článků s vyhledáváním a paginací.
 */
export default function ArticlesListContainer({
  section,
  tag,
  initialArticles,
}: ArticlesListContainerProps) {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>(() => {
    if (initialArticles) {
      return initialArticles.map((article) => ({
        id: article.id,
        title: article.title,
        authorName: article.authorName,
        authorAvatar: article.authorAvatar || undefined,
        publishedAt: article.publishedAt,
        readingTime: article.readingTime ?? null,
        imageUrl: article.imageUrl || undefined,
        articleUrl: article.articleUrl,
        tags: article.tags ?? [],
      }));
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(!initialArticles);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialArticles ? initialArticles.length >= ARTICLES_PER_PAGE : true,
  );
  const [offset, setOffset] = useState(
    initialArticles ? initialArticles.length : 0,
  );
  const offsetRef = useRef(initialArticles ? initialArticles.length : 0);
  const initialFetchDone = useRef(!!initialArticles);

  const fetchArticles = useCallback(
    async (searchQuery: string, loadMore = false) => {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        offsetRef.current = 0;
      }

      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("query", searchQuery.trim());
        if (section) params.set("section", section);
        if (tag) params.set("tag", tag);
        params.set("limit", String(ARTICLES_PER_PAGE));
        params.set("offset", String(loadMore ? offsetRef.current : 0));

        const response = await fetch(`/api/articles?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch articles");

        const data = await response.json();
        const transformedArticles: Article[] = (data.articles || []).map(
          (article: ArticleCard) => ({
            id: article.id,
            title: article.title,
            authorName: article.authorName,
            authorAvatar: article.authorAvatar || undefined,
            publishedAt: article.publishedAt,
            readingTime: article.readingTime ?? null,
            imageUrl: article.imageUrl || undefined,
            articleUrl: article.articleUrl,
            tags: article.tags ?? [],
          }),
        );

        if (loadMore) {
          setArticles((prev) => [...prev, ...transformedArticles]);
        } else {
          setArticles(transformedArticles);
        }

        setHasMore(transformedArticles.length >= ARTICLES_PER_PAGE);
        offsetRef.current =
          (loadMore ? offsetRef.current : 0) + transformedArticles.length;
        setOffset(offsetRef.current);
      } catch (error) {
        console.error("Error fetching articles:", error);
        if (!loadMore) setArticles([]);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [section, tag],
  );

  useEffect(() => {
    if (initialFetchDone.current && !query) {
      initialFetchDone.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchArticles(query, false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, section, tag, fetchArticles]);

  const handleLoadMore = () => {
    fetchArticles(query, true);
  };

  return (
    <>
      <ArticlesToolbar query={query} onQueryChange={setQuery} />
      {isLoading ? (
        <section className="w-full px-4 lg:px-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-zinc-100 animate-pulse rounded-lg h-72"
              />
            ))}
          </div>
        </section>
      ) : articles.length > 0 ? (
        <div className="pb-12">
          <ArticlesList
            articles={articles}
            showHeading={false}
            className="!mt-8"
          />
          {hasMore && (
            <div className="flex justify-center py-8">
              <Button
                variant="subtle"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="cursor-pointer"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Načítám...
                  </>
                ) : (
                  <>
                    <RefreshCcw size={16} />
                    Načíst více článků
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <section className="w-full px-4 lg:px-8 mt-8 min-h-[40vh] flex items-center justify-center">
          <div className="text-center text-zinc-500">
            {query ? (
              <p>
                Žádné články neodpovídají vašemu hledání &quot;{query}&quot;
              </p>
            ) : (
              <p>Zatím tu nejsou žádné články.</p>
            )}
          </div>
        </section>
      )}
    </>
  );
}
