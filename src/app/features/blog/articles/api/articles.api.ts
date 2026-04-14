import { ArticleProps } from "@/app/features/blog/articles/types";
import { getNewestPublishedArticle, getLatestArticles as getLatestArticlesService } from "@/app/features/blog/articles/services/articles.service";
import { getUserFavoriteTagIds } from "@/lib/repositories/favoriteTagsRepository";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GetHeroArticle
 * Získá data nejnovějšího publikovaného článku v databázi
 * 
 * @returns {Promise<ArticleProps>} Data nejnovějšího publikovaného článku
 */
export async function getHeroArticle(): Promise<ArticleProps | null> {
    const heroArticle = await getNewestPublishedArticle();
    if (!heroArticle) {
        return null;
    }
    return heroArticle;
}

/**
 * getLatestArticles
 * Získá data nejnovějších publikovaných článků v databázi.
 * Pokud je uživatel přihlášen a má oblíbené tagy, filtruje články podle nich.
 *
 * @param {number} [limit=8] - Maximální počet článků, který se má načíst.
 * @returns {Promise<{ articles: ArticleProps[]; personalized: boolean }>} Data článků a zda je feed personalizovaný.
 */
export async function getLatestArticles(limit: number = 8): Promise<{ articles: ArticleProps[]; personalized: boolean }> {
    let userId: string | undefined;
    try {
        const headersList = await headers();
        const session = await auth.api.getSession({ headers: headersList });
        userId = session?.user?.id;
    } catch {
        userId = undefined;
    }

    const tagIds = userId ? await getUserFavoriteTagIds(userId) : [];
    const personalized = tagIds.length > 0;
    const articles = await getLatestArticlesService(limit, userId);

    return { articles, personalized };
}