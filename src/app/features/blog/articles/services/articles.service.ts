import { db } from "@/lib/db";
import { articles, users, articleTags, favoriteTags } from "@/lib/schema";
import { desc, eq, and, inArray, isNull } from "drizzle-orm";
import { ArticleProps } from "@/app/features/blog/articles/types";

/**
 * Základní select objekt pro článek včetně autora.
 * Umožňuje znovupoužití stejné struktury pro další dotazy.
 */
const articleWithAuthorSelect = {
    id: articles.id,
    title: articles.title,
    slug: articles.slug,
    description: articles.description,
    imageUrl: articles.imageUrl,
    status: articles.status,
    readingTime: articles.readingTime,
    viewCount: articles.viewCount,
    likesCount: articles.likesCount,
    dislikesCount: articles.dislikesCount,
    createdAt: articles.createdAt,
    updatedAt: articles.updatedAt,
    deletedAt: articles.deletedAt,
    author: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        image: users.image,
    },
} as const;

/**
 * getNewestPublishedArticle
 * Načte nejnovější publikovaný článek včetně základních informací o autorovi.
 * @returns {Promise<ArticleProps | null>} Nejnovější publikovaný článek nebo null, pokud neexistuje.
 */
export async function getNewestPublishedArticle(): Promise<ArticleProps | null> {
    const result = await db
        .select(articleWithAuthorSelect)
        .from(articles)
        .leftJoin(users, eq(articles.authorId, users.id))
        .where(eq(articles.status, "published"))
        .orderBy(desc(articles.createdAt))
        .limit(1);

    const row = result[0];

    if (!row) {
        return null;
    }

    const article: ArticleProps = {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description ?? undefined,
        imageUrl: row.imageUrl ?? undefined,
        status: row.status,
        readingTime: row.readingTime ?? null,
        viewCount: row.viewCount,
        likesCount: row.likesCount,
        dislikesCount: row.dislikesCount,
        createdAt: row.createdAt ?? undefined,
        updatedAt: row.updatedAt ?? undefined,
        deletedAt: row.deletedAt ?? null,
        author: row.author
            ? {
                id: row.author.id,
                name: row.author.name,
                surname: row.author.surname ?? undefined,
                image: row.author.image ?? null,
            }
            : null,
    };

    return article;
}

/**
 * getLatestArticles
 * Získá data nejnovějších publikovaných článků v databázi.
 * Pokud je předáno userId, filtruje články podle oblíbených tagů uživatele.
 * @param {number} [limit=8] - Maximální počet článků, který se má načíst z DB.
 * @param {string} [userId] - ID uživatele pro filtrování podle favorite tags (volitelné).
 * @returns {Promise<ArticleProps[]>} Data nejnovějších publikovaných článků.
 */
export async function getLatestArticles(limit: number = 8, userId?: string): Promise<ArticleProps[]> {
    let favoriteTagIds: string[] | undefined;
    
    // Pokud je userId předán, načteme jeho oblíbené tagy
    if (userId) {
        const userFavoriteTags = await db
            .select({ tagId: favoriteTags.tagId })
            .from(favoriteTags)
            .where(eq(favoriteTags.userId, userId));
        
        favoriteTagIds = userFavoriteTags.map(ft => ft.tagId);
        
        // Pokud má uživatel oblíbené tagy, filtrujeme podle nich
        if (favoriteTagIds.length > 0) {
            const result = await db
                .selectDistinct(articleWithAuthorSelect)
                .from(articles)
                .leftJoin(users, eq(articles.authorId, users.id))
                .innerJoin(articleTags, eq(articles.id, articleTags.articleId))
                .where(
                    and(
                        eq(articles.status, "published"),
                        isNull(articles.deletedAt),
                        inArray(articleTags.tagId, favoriteTagIds)
                    )
                )
                .orderBy(desc(articles.createdAt))
                .limit(limit);

            const mappedArticles: ArticleProps[] = result.map((row) => ({
                id: row.id,
                title: row.title,
                slug: row.slug,
                description: row.description ?? undefined,
                imageUrl: row.imageUrl ?? undefined,
                status: row.status,
                readingTime: row.readingTime ?? null,
                viewCount: row.viewCount,
                likesCount: row.likesCount,
                dislikesCount: row.dislikesCount,
                createdAt: row.createdAt ?? undefined,
                updatedAt: row.updatedAt ?? undefined,
                deletedAt: row.deletedAt ?? null,
                author: row.author
                    ? {
                        id: row.author.id,
                        name: row.author.name,
                        surname: row.author.surname ?? undefined,
                        image: row.author.image ?? null,
                    }
                    : null,
            }));

            const seen = new Set<string>();
            return mappedArticles.filter((a) => {
                if (seen.has(a.id)) return false;
                seen.add(a.id);
                return true;
            });
        }
    }
    
    // Pokud uživatel nemá favorite tags nebo není přihlášen, zobrazíme všechny články
    const result = await db
        .select(articleWithAuthorSelect)
        .from(articles)
        .leftJoin(users, eq(articles.authorId, users.id))
        .where(
            and(
                eq(articles.status, "published"),
                isNull(articles.deletedAt)
            )
        )
        .orderBy(desc(articles.createdAt))
        .limit(limit);

    const mappedArticles: ArticleProps[] = result.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description ?? undefined,
        imageUrl: row.imageUrl ?? undefined,
        status: row.status,
        readingTime: row.readingTime ?? null,
        viewCount: row.viewCount,
        likesCount: row.likesCount,
        dislikesCount: row.dislikesCount,
        createdAt: row.createdAt ?? undefined,
        updatedAt: row.updatedAt ?? undefined,
        deletedAt: row.deletedAt ?? null,
        author: row.author
            ? {
                id: row.author.id,
                name: row.author.name,
                surname: row.author.surname ?? undefined,
                image: row.author.image ?? null,
            }
            : null,
    }));

    return mappedArticles;
}