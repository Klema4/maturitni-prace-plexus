'use client'

import { ArticleCard } from "@/components/screens/landing/ArticlesList";
import type { Article } from "@/components/screens/landing/ArticlesList";
import { useEffect, useState } from "react";

/**
 * Načte čtyři nejnovější články z API pro zobrazení na error stránkách.
 */
async function fetchLatestArticles(): Promise<Article[]> {
  const res = await fetch("/api/articles?limit=4");
  if (!res.ok) return [];
  const data = await res.json();
  const raw = (data.articles ?? []) as Array<{
    id: string;
    title: string;
    imageUrl?: string | null;
    category?: string | null;
    authorName: string;
    authorAvatar?: string | null;
    publishedAt: string;
    readingTime?: number | null;
    articleUrl: string;
  }>;
  return raw.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category ?? "",
    authorName: a.authorName,
    authorAvatar: a.authorAvatar ?? undefined,
    publishedAt: a.publishedAt,
    readingTime: a.readingTime ?? null,
    imageUrl: a.imageUrl ?? undefined,
    articleUrl: a.articleUrl,
  }));
}

/**
 * Grid čtyř nejnovějších článků pro error stránky.
 * Zobrazuje nadpis, loading skeletony a ArticleCards.
 */
export function ErrorLatestArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestArticles()
      .then(setArticles)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-12">
      <h2 className="newsreader text-3xl lg:text-4xl font-medium tracking-tighter text-dark mb-6">
        Možná zaujmeme pozornost?
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={`skeleton-${i}`} className="h-80 bg-zinc-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
