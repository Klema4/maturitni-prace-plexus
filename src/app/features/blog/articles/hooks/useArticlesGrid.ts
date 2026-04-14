'use client';

import { useState } from "react";
import type { ArticleProps } from "@/app/features/blog/articles/types";
import type { ArticleCard as ArticleCardApi } from "@/lib/schemas/articlesSchema";

/**
 * useArticlesGrid
 * Hook pro správu stavu gridu článků včetně načítání dalších článků z API.
 * Přijímá počáteční články a limit na jednu dávku a vrací položky,
 * stav načítání, informaci o dalším obsahu a handler pro načtení více článků.
 *
 * @param {ArticleProps[]} initialArticles - Počáteční seznam článků předaný ze serverové komponenty.
 * @param {number} limit - Počet článků, který se má načíst při jednom požadavku.
 * @returns {{
 *  items: ArticleProps[];
 *  isLoadingMore: boolean;
 *  hasMore: boolean;
 *  handleLoadMore: () => Promise<void>;
 * }} Stav a ovládací funkce pro grid článků.
 */
export function useArticlesGrid(initialArticles: ArticleProps[], limit: number) {
    const [items, setItems] = useState<ArticleProps[]>(initialArticles);
    const [offset, setOffset] = useState<number>(initialArticles.length);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(initialArticles.length >= limit);

    const handleLoadMore = async () => {
        try {
            setIsLoadingMore(true);

            const params = new URLSearchParams();
            params.set("limit", String(limit));
            params.set("offset", String(offset));

            const response = await fetch(`/api/articles?${params.toString()}`);
            if (!response.ok) {
                throw new Error("Failed to fetch more articles");
            }

            const data = await response.json();

            const newArticles: ArticleProps[] = (data.articles || []).map((article: ArticleCardApi) => ({
                id: article.id,
                title: article.title,
                slug: article.slug,
                description: article.description ?? undefined,
                imageUrl: article.imageUrl ?? undefined,
                status: "published",
                readingTime: article.readingTime ?? null,
                createdAt: new Date(article.publishedAt),
                author: {
                    id: "",
                    name: article.authorName,
                    surname: undefined,
                    image: article.authorAvatar,
                },
            }));

            setItems((prev) => [...prev, ...newArticles]);
            setOffset((prev) => prev + newArticles.length);
            setHasMore(newArticles.length >= limit);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    return {
        items,
        isLoadingMore,
        hasMore,
        handleLoadMore,
    };
}

