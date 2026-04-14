import { db } from "@/lib/db";
import {
  articles,
  users,
  tags,
  keywords,
  articleTags,
  articleKeywords,
  sections,
  sectionTags,
  commentThreads,
  articleRatings,
  articleViews,
} from "@/lib/schema";
import { eq, desc, and, isNull, like, or, sql, inArray } from "drizzle-orm";
import { normalizeSlug } from "@/lib/utils/slug";

/**
 * Načte tagy pro množinu článků v jednom dotazu.
 */
export async function getArticleTagsByArticleIds(
  articleIds: string[],
): Promise<Record<string, { id: string; name: string; description: string | null }[]>> {
  if (articleIds.length === 0) {
    return {};
  }

  const rows = await db
    .select({
      articleId: articleTags.articleId,
      id: tags.id,
      name: tags.name,
      description: tags.description,
    })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(inArray(articleTags.articleId, articleIds));

  const map: Record<string, { id: string; name: string; description: string | null }[]> = {};
  for (const row of rows) {
    if (!map[row.articleId]) {
      map[row.articleId] = [];
    }
    map[row.articleId].push({
      id: row.id,
      name: row.name,
      description: row.description,
    });
  }

  return map;
}

/**
 * Typ článku s autorem pro seznamy
 */
export type ArticleWithAuthor = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  status: "draft" | "need_factcheck" | "need_read" | "published";
  readingTime: number | null;
  viewCount: number;
  likesCount: number;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    surname: string;
    image: string | null;
  } | null;
};

/**
 * Typ článku s autorem a tagy pro detail
 */
export type ArticleWithAuthorAndTags = ArticleWithAuthor & {
  content: unknown;
  premiumOnly: boolean;
  ratingEnabled: boolean;
  commentsEnabled: boolean;
  dislikesCount: number;
  updatedAt: Date;
  tags: { id: string; name: string; description: string | null }[];
  keywords: { id: string; name: string }[];
  threadId: string | null;
};

function normalizeKeywordNames(keywordNames: string[]) {
  return Array.from(
    new Set(
      keywordNames
        .map((keywordName) => keywordName.trim().replace(/\s+/g, " "))
        .filter(Boolean),
    ),
  );
}

export async function syncArticleKeywords(
  articleId: string,
  keywordNames: string[],
) {
  await db
    .delete(articleKeywords)
    .where(eq(articleKeywords.articleId, articleId));

  const normalizedKeywordNames = normalizeKeywordNames(keywordNames);
  if (normalizedKeywordNames.length === 0) {
    return;
  }

  await db
    .insert(keywords)
    .values(normalizedKeywordNames.map((name) => ({ name })))
    .onConflictDoNothing();

  const persistedKeywords = await db
    .select({
      id: keywords.id,
      name: keywords.name,
    })
    .from(keywords)
    .where(inArray(keywords.name, normalizedKeywordNames));

  if (persistedKeywords.length === 0) {
    return;
  }

  await db.insert(articleKeywords).values(
    persistedKeywords.map((keyword) => ({
      articleId,
      keywordId: keyword.id,
    })),
  );
}

/**
 * Získání publikovaných článků pro hlavní stránku a seznam
 */
export async function getPublishedArticles(
  limit: number = 10,
  offset: number = 0,
): Promise<ArticleWithAuthor[]> {
  try {
    const result = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        description: articles.description,
        imageUrl: articles.imageUrl,
        status: articles.status,
        readingTime: articles.readingTime,
        viewCount: articles.viewCount,
        likesCount: articles.likesCount,
        createdAt: articles.createdAt,
        author: {
          id: users.id,
          name: users.name,
          surname: users.surname,
          image: users.image,
        },
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(and(eq(articles.status, "published"), isNull(articles.deletedAt)))
      .orderBy(desc(articles.createdAt))
      .limit(limit)
      .offset(offset);

    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Získání publikovaných článků filtrovaných podle oblíbených tagů uživatele
 */
export async function getPublishedArticlesByTagIds(
  tagIds: string[],
  limit: number = 10,
  offset: number = 0,
): Promise<ArticleWithAuthor[]> {
  if (tagIds.length === 0) {
    return getPublishedArticles(limit, offset);
  }

  const result = await db
    .selectDistinct({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      description: articles.description,
      imageUrl: articles.imageUrl,
      status: articles.status,
      readingTime: articles.readingTime,
      viewCount: articles.viewCount,
      likesCount: articles.likesCount,
      createdAt: articles.createdAt,
      author: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        image: users.image,
      },
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .innerJoin(articleTags, eq(articles.id, articleTags.articleId))
    .where(
      and(
        eq(articles.status, "published"),
        isNull(articles.deletedAt),
        inArray(articleTags.tagId, tagIds),
      ),
    )
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

/**
 * Získání hero článku (nejnovější publikovaný s obrázkem)
 */
export async function getHeroArticle(): Promise<ArticleWithAuthor | null> {
  const result = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      description: articles.description,
      imageUrl: articles.imageUrl,
      status: articles.status,
      readingTime: articles.readingTime,
      viewCount: articles.viewCount,
      likesCount: articles.likesCount,
      createdAt: articles.createdAt,
      author: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        image: users.image,
      },
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(
      and(
        eq(articles.status, "published"),
        isNull(articles.deletedAt),
        sql`${articles.imageUrl} IS NOT NULL AND ${articles.imageUrl} != ''`,
      ),
    )
    .orderBy(desc(articles.createdAt))
    .limit(1);

  return result[0] || null;
}

/**
 * Získání článku podle slug pro detail
 */
export async function getArticleBySlug(
  slug: string,
): Promise<ArticleWithAuthorAndTags | null> {
  const exactSlug = slug.trim();
  const normalizedSlug = normalizeSlug(exactSlug);

  const findBySlug = async (slugValue: string) =>
    db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        description: articles.description,
        imageUrl: articles.imageUrl,
        content: articles.content,
        status: articles.status,
        premiumOnly: articles.premiumOnly,
        ratingEnabled: articles.ratingEnabled,
        commentsEnabled: articles.commentsEnabled,
        readingTime: articles.readingTime,
        viewCount: articles.viewCount,
        likesCount: articles.likesCount,
        dislikesCount: articles.dislikesCount,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        threadId: commentThreads.id,
        author: {
          id: users.id,
          name: users.name,
          surname: users.surname,
          image: users.image,
        },
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .leftJoin(commentThreads, eq(articles.id, commentThreads.articleId))
      .where(and(eq(articles.slug, slugValue), isNull(articles.deletedAt)))
      .limit(1);

  const result = await findBySlug(exactSlug);
  const matchedArticle =
    result[0] ??
    (normalizedSlug && normalizedSlug !== exactSlug
      ? (await findBySlug(normalizedSlug))[0]
      : null);

  if (!matchedArticle) return null;

  // Získat tagy článku
  const articleTagsResult = await db
    .select({
      id: tags.id,
      name: tags.name,
      description: tags.description,
    })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, matchedArticle.id));

  const articleKeywordsResult = await db
    .select({
      id: keywords.id,
      name: keywords.name,
    })
    .from(articleKeywords)
    .innerJoin(keywords, eq(articleKeywords.keywordId, keywords.id))
    .where(eq(articleKeywords.articleId, matchedArticle.id));

  return {
    ...matchedArticle,
    tags: articleTagsResult,
    keywords: articleKeywordsResult,
  };
}

/**
 * Získání článku podle ID
 */
export async function getArticleById(
  id: string,
): Promise<ArticleWithAuthorAndTags | null> {
  const result = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      description: articles.description,
      imageUrl: articles.imageUrl,
      content: articles.content,
      status: articles.status,
      premiumOnly: articles.premiumOnly,
      ratingEnabled: articles.ratingEnabled,
      commentsEnabled: articles.commentsEnabled,
      readingTime: articles.readingTime,
      viewCount: articles.viewCount,
      likesCount: articles.likesCount,
      dislikesCount: articles.dislikesCount,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      threadId: commentThreads.id,
      author: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        image: users.image,
      },
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .leftJoin(commentThreads, eq(articles.id, commentThreads.articleId))
    .where(and(eq(articles.id, id), isNull(articles.deletedAt)))
    .limit(1);

  if (!result[0]) return null;

  // Získat tagy článku
  const articleTagsResult = await db
    .select({
      id: tags.id,
      name: tags.name,
      description: tags.description,
    })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, result[0].id));

  const articleKeywordsResult = await db
    .select({
      id: keywords.id,
      name: keywords.name,
    })
    .from(articleKeywords)
    .innerJoin(keywords, eq(articleKeywords.keywordId, keywords.id))
    .where(eq(articleKeywords.articleId, result[0].id));

  return {
    ...result[0],
    tags: articleTagsResult,
    keywords: articleKeywordsResult,
  };
}

/**
 * Získání souvisejících článků (stejné tagy)
 */
export async function getRelatedArticles(
  articleId: string,
  limit: number = 3,
): Promise<ArticleWithAuthor[]> {
  // Nejprve získat tagy aktuálního článku
  const currentArticleTags = await db
    .select({ tagId: articleTags.tagId })
    .from(articleTags)
    .where(eq(articleTags.articleId, articleId));

  if (currentArticleTags.length === 0) {
    // Pokud nemá tagy, vrátit nejnovější články
    return getPublishedArticles(limit, 0);
  }

  const tagIds = currentArticleTags.map((t) => t.tagId);

  // Najít články se stejnými tagy
  const relatedArticleIds = await db
    .select({ articleId: articleTags.articleId })
    .from(articleTags)
    .where(
      and(
        inArray(articleTags.tagId, tagIds),
        sql`${articleTags.articleId} != ${articleId}`,
      ),
    )
    .groupBy(articleTags.articleId)
    .limit(limit);

  if (relatedArticleIds.length === 0) {
    return getPublishedArticles(limit, 0);
  }

  const result = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      description: articles.description,
      imageUrl: articles.imageUrl,
      status: articles.status,
      readingTime: articles.readingTime,
      viewCount: articles.viewCount,
      likesCount: articles.likesCount,
      createdAt: articles.createdAt,
      author: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        image: users.image,
      },
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(
      and(
        inArray(
          articles.id,
          relatedArticleIds.map((r) => r.articleId),
        ),
        eq(articles.status, "published"),
        isNull(articles.deletedAt),
      ),
    )
    .orderBy(desc(articles.createdAt))
    .limit(limit);

  return result;
}

/**
 * Vyhledávání článků podle query
 */
export async function searchArticles(
  query: string,
  limit: number = 20,
  offset: number = 0,
): Promise<ArticleWithAuthor[]> {
  try {
    const searchPattern = `%${query}%`;
    const result = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        description: articles.description,
        imageUrl: articles.imageUrl,
        status: articles.status,
        readingTime: articles.readingTime,
        viewCount: articles.viewCount,
        likesCount: articles.likesCount,
        createdAt: articles.createdAt,
        author: {
          id: users.id,
          name: users.name,
          surname: users.surname,
          image: users.image,
        },
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(
        and(
          eq(articles.status, "published"),
          isNull(articles.deletedAt),
          or(
            like(articles.title, searchPattern),
            like(articles.description, searchPattern),
          ),
        ),
      )
      .orderBy(desc(articles.createdAt))
      .limit(limit)
      .offset(offset);

    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Inkrementace počtu zobrazení
 */
export async function incrementViewCount(
  articleId: string,
  userId?: string | null,
): Promise<void> {
  const now = new Date();

  await db
    .update(articles)
    .set({
      viewCount: sql`${articles.viewCount} + 1`,
    })
    .where(eq(articles.id, articleId));

  await db.insert(articleViews).values({
    articleId,
    userId: userId ?? null,
    createdAt: now,
  });
}

/**
 * Získání náhodného publikovaného článku
 */
export async function getRandomArticle(): Promise<ArticleWithAuthor | null> {
  const result = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      description: articles.description,
      imageUrl: articles.imageUrl,
      status: articles.status,
      readingTime: articles.readingTime,
      viewCount: articles.viewCount,
      likesCount: articles.likesCount,
      createdAt: articles.createdAt,
      author: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        image: users.image,
      },
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(eq(articles.status, "published"), isNull(articles.deletedAt)))
    .orderBy(sql`RANDOM()`)
    .limit(1);

  return result[0] || null;
}

/**
 * Získání článků pro konkrétní sekci (podle slugu sekce)
 * Sekce je definována sadou tagů. Článek patří do sekce, pokud má alespoň jeden z jejích tagů.
 */
export async function getArticlesBySection(
  sectionSlug: string,
  options?: {
    tagSlug?: string;
    limit?: number;
    offset?: number;
  },
): Promise<ArticleWithAuthor[]> {
  const { tagSlug, limit = 20, offset = 0 } = options || {};

  try {
    const exactSectionSlug = sectionSlug.trim();

    const sectionResult = await db
      .select({ id: sections.id, name: sections.name })
      .from(sections)
      .where(eq(sections.slug, exactSectionSlug))
      .limit(1);

    if (sectionResult.length === 0) {
      return [];
    }
    const sectionId = sectionResult[0].id;

    // 2. Získáme všechny tagy patřící do této sekce
    const sectionTagsList = await db
      .select({ tagId: sectionTags.tagId })
      .from(sectionTags)
      .where(eq(sectionTags.sectionId, sectionId));

    let tagIds = sectionTagsList.map((st) => st.tagId);

    // Fallback: Pokud sekce nemá žádné tagy, zkusíme najít tag se stejným názvem jako sekce
    if (tagIds.length === 0) {
      const fallbackTag = await db
        .select({ id: tags.id })
        .from(tags)
        .where(sql`LOWER(${tags.name}) = LOWER(${sectionResult[0].name})`)
        .limit(1);

      if (fallbackTag.length > 0) {
        tagIds = [fallbackTag[0].id];
      }
    }

    // Pokud stále nemáme žádné tagy, nemáme co filtrovat
    if (tagIds.length === 0) {
      return [];
    }

    // Pokud je specifikován konkrétní tag v rámci sekce, vyfiltrujeme jen ten
    if (tagSlug) {
      const specificTag = await db
        .select({ id: tags.id })
        .from(tags)
        .where(sql`LOWER(${tags.name}) = LOWER(${tagSlug.replace(/-/g, " ")})`)
        .limit(1);

      if (specificTag.length > 0) {
        const sId = specificTag[0].id;
        if (tagIds.includes(sId)) {
          tagIds = [sId];
        } else {
          return [];
        }
      } else {
        return [];
      }
    }

    // 3. Najdeme články, které mají alespoň jeden z těchto tagů
    const result = await db
      .selectDistinct({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        description: articles.description,
        imageUrl: articles.imageUrl,
        status: articles.status,
        readingTime: articles.readingTime,
        viewCount: articles.viewCount,
        likesCount: articles.likesCount,
        createdAt: articles.createdAt,
        author: {
          id: users.id,
          name: users.name,
          surname: users.surname,
          image: users.image,
        },
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .innerJoin(articleTags, eq(articles.id, articleTags.articleId))
      .where(
        and(
          eq(articles.status, "published"),
          isNull(articles.deletedAt),
          inArray(articleTags.tagId, tagIds),
        ),
      )
      .orderBy(desc(articles.createdAt))
      .limit(limit)
      .offset(offset);

    return result as ArticleWithAuthor[];
  } catch (error) {
    throw error;
  }
}

/**
 * Získání všech článků pro dashboard (včetně draftů)
 */
export async function getAllArticlesForDashboard(options?: {
  status?: "draft" | "need_factcheck" | "need_read" | "published";
  limit?: number;
  offset?: number;
}): Promise<ArticleWithAuthor[]> {
  const { status, limit = 50, offset = 0 } = options || {};

  const conditions = [isNull(articles.deletedAt)];
  if (status) {
    conditions.push(eq(articles.status, status));
  }

  const result = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      description: articles.description,
      imageUrl: articles.imageUrl,
      status: articles.status,
      readingTime: articles.readingTime,
      viewCount: articles.viewCount,
      likesCount: articles.likesCount,
      createdAt: articles.createdAt,
      author: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        image: users.image,
      },
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

/**
 * Změna stavu článku
 */
export async function updateArticleStatus(
  articleId: string,
  status: "draft" | "need_factcheck" | "need_read" | "published",
): Promise<boolean> {
  try {
    await db
      .update(articles)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, articleId));
    return true;
  } catch (error) {
    console.error("Error updating article status:", error);
    return false;
  }
}

/**
 * Aktualizace článku
 */
export async function updateArticle(
  articleId: string,
  data: {
    title?: string;
    description?: string | null;
    slug?: string;
    imageUrl?: string | null;
    content?: unknown;
    authorId?: string;
    status?: "draft" | "need_factcheck" | "need_read" | "published";
    premiumOnly?: boolean;
    ratingEnabled?: boolean;
    commentsEnabled?: boolean;
    tagIds?: string[];
    keywords?: string[];
  },
): Promise<boolean> {
  try {
    const updateData: {
      title?: string;
      description?: string | null;
      slug?: string;
      imageUrl?: string | null;
      content?: unknown;
      authorId?: string;
      status?: "draft" | "need_factcheck" | "need_read" | "published";
      premiumOnly?: boolean;
      ratingEnabled?: boolean;
      commentsEnabled?: boolean;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.authorId !== undefined) updateData.authorId = data.authorId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.premiumOnly !== undefined)
      updateData.premiumOnly = data.premiumOnly;
    if (data.ratingEnabled !== undefined)
      updateData.ratingEnabled = data.ratingEnabled;
    if (data.commentsEnabled !== undefined)
      updateData.commentsEnabled = data.commentsEnabled;

    await db.update(articles).set(updateData).where(eq(articles.id, articleId));

    // Aktualizace tagů, pokud jsou poskytnuty
    if (data.tagIds !== undefined) {
      // Smazat všechny existující tagy
      await db.delete(articleTags).where(eq(articleTags.articleId, articleId));

      // Přidat nové tagy
      if (data.tagIds.length > 0) {
        await db.insert(articleTags).values(
          data.tagIds.map((tagId) => ({
            articleId,
            tagId,
          })),
        );
      }
    }

    if (data.keywords !== undefined) {
      await syncArticleKeywords(articleId, data.keywords);
    }

    return true;
  } catch (error) {
    console.error("Error updating article:", error);
    return false;
  }
}

/**
 * Smazání článku (soft delete)
 */
export async function deleteArticle(articleId: string): Promise<boolean> {
  try {
    await db
      .update(articles)
      .set({ deletedAt: new Date() })
      .where(eq(articles.id, articleId));
    return true;
  } catch (error) {
    console.error("Error deleting article:", error);
    return false;
  }
}

/**
 * Přidání nebo změna hodnocení článku (like/dislike)
 */
export async function toggleArticleRating(
  articleId: string,
  userId: string,
  state: boolean, // true = like, false = dislike
): Promise<{ likesCount: number; dislikesCount: number }> {
  // Zkontrolovat, zda už existuje rating
  const existingRating = await db
    .select()
    .from(articleRatings)
    .where(
      and(
        eq(articleRatings.articleId, articleId),
        eq(articleRatings.userId, userId),
      ),
    )
    .limit(1);

  if (existingRating.length > 0) {
    const currentState = existingRating[0].state;

    if (currentState === state) {
      // Stejný rating - odstranit hodnocení
      await db
        .delete(articleRatings)
        .where(
          and(
            eq(articleRatings.articleId, articleId),
            eq(articleRatings.userId, userId),
          ),
        );

      // Aktualizovat počty
      if (state) {
        await db
          .update(articles)
          .set({
            likesCount: sql`${articles.likesCount} - 1`,
          })
          .where(eq(articles.id, articleId));
      } else {
        await db
          .update(articles)
          .set({
            dislikesCount: sql`${articles.dislikesCount} - 1`,
          })
          .where(eq(articles.id, articleId));
      }
    } else {
      // Změna ratingu (like -> dislike nebo naopak)
      await db
        .update(articleRatings)
        .set({ state })
        .where(
          and(
            eq(articleRatings.articleId, articleId),
            eq(articleRatings.userId, userId),
          ),
        );

      // Aktualizovat počty
      if (state) {
        // Změna z dislike na like
        await db
          .update(articles)
          .set({
            likesCount: sql`${articles.likesCount} + 1`,
            dislikesCount: sql`${articles.dislikesCount} - 1`,
          })
          .where(eq(articles.id, articleId));
      } else {
        // Změna z like na dislike
        await db
          .update(articles)
          .set({
            likesCount: sql`${articles.likesCount} - 1`,
            dislikesCount: sql`${articles.dislikesCount} + 1`,
          })
          .where(eq(articles.id, articleId));
      }
    }
  } else {
    // Nové hodnocení
    await db.insert(articleRatings).values({
      articleId,
      userId,
      state,
    });

    // Aktualizovat počty
    if (state) {
      await db
        .update(articles)
        .set({
          likesCount: sql`${articles.likesCount} + 1`,
        })
        .where(eq(articles.id, articleId));
    } else {
      await db
        .update(articles)
        .set({
          dislikesCount: sql`${articles.dislikesCount} + 1`,
        })
        .where(eq(articles.id, articleId));
    }
  }

  // Vrátit aktuální počty
  const updatedArticle = await db
    .select({
      likesCount: articles.likesCount,
      dislikesCount: articles.dislikesCount,
    })
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1);

  return {
    likesCount: updatedArticle[0]!.likesCount,
    dislikesCount: updatedArticle[0]!.dislikesCount,
  };
}

/**
 * Získání hodnocení uživatele pro článek
 */
export async function getUserArticleRating(
  articleId: string,
  userId: string,
): Promise<boolean | null> {
  const result = await db
    .select({ state: articleRatings.state })
    .from(articleRatings)
    .where(
      and(
        eq(articleRatings.articleId, articleId),
        eq(articleRatings.userId, userId),
      ),
    )
    .limit(1);

  return result[0]?.state ?? null;
}
