import { db } from "@/lib/db";
import {
   comments,
   commentThreads,
   users,
   articles,
   commentRatings,
   reports,
} from "@/lib/schema";
import { eq, and, isNull, desc, asc, sql, or, inArray } from "drizzle-orm";

/**
 * Typ komentáře s autorem a odpověďmi
 */
export type CommentWithAuthor = {
   id: string;
   threadId: string;
   userId: string;
   parentId: string | null;
   content: string;
   likesCount: number;
   dislikesCount: number;
   createdAt: Date;
   updatedAt: Date;
   author: {
      id: string;
      name: string;
      surname: string;
      image: string | null;
   };
   repliesCount: number;
   userRating: boolean | null; // true = like, false = dislike, null = žádné hodnocení
   isHidden?: boolean;
   isModerated?: boolean;
   moderationReason?: string | null;
   editedByAdmin?: boolean;
   editedByAdminAt?: Date | null;
   editedByAdminId?: string | null;
   originalContent?: string | null;
   reportsCount?: number;
};

/**
 * Komentář pro dashboard (list/detail) včetně informace o vlákně a článku.
 */
export type DashboardComment = CommentWithAuthor & {
   thread: {
      id: string;
      article: {
         id: string;
         title: string;
         slug: string;
      };
   };
};

/**
 * Typ threadu s článkem
 */
export type ThreadWithArticle = {
   id: string;
   articleId: string;
   isLocked: boolean;
   createdAt: Date;
   article: {
      id: string;
      title: string;
      slug: string;
   };
};

/**
 * Získání komentáře podle ID
 */
export async function getCommentById(commentId: string) {
   const result = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

   return result[0] || null;
}

/**
 * Získání threadu podle ID s informacemi o článku
 */
export async function getThreadById(
   threadId: string,
): Promise<ThreadWithArticle | null> {
   const result = await db
      .select({
         id: commentThreads.id,
         articleId: commentThreads.articleId,
         isLocked: commentThreads.isLocked,
         createdAt: commentThreads.createdAt,
         article: {
            id: articles.id,
            title: articles.title,
            slug: articles.slug,
         },
      })
      .from(commentThreads)
      .innerJoin(articles, eq(commentThreads.articleId, articles.id))
      .where(eq(commentThreads.id, threadId))
      .limit(1);

   return result[0] || null;
}

/**
 * Získání komentářů pro thread s možností řazení a filtrování
 */
export async function getCommentsByThreadId(
   threadId: string,
   options?: {
      userId?: string; // Pro filtrování "Mé komentáře" a získání user rating
      sortOrder?: "newest" | "oldest" | "best"; // best = nejvíce lajků
      limit?: number;
      offset?: number;
      includeHidden?: boolean; // Pro moderátory: zobrazit i skryté komentáře
   },
): Promise<CommentWithAuthor[]> {
   const {
      userId,
      sortOrder = "newest",
      limit = 100,
      offset = 0,
      includeHidden = false,
   } = options || {};

   // Základní query s joinem na uživatele
   const whereConditions = [
      eq(comments.threadId, threadId),
      isNull(comments.deletedAt),
      isNull(comments.parentId), // Pouze top-level komentáře
   ];

   // Filtrování skrytých komentářů pro běžné uživatele
   if (!includeHidden) {
      whereConditions.push(eq(comments.isHidden, false));
   }

   // Filtrování podle userId (Mé komentáře)
   if (userId) {
      whereConditions.push(eq(comments.userId, userId));
   }

   let query = db
      .select({
         id: comments.id,
         threadId: comments.threadId,
         userId: comments.userId,
         parentId: comments.parentId,
         content: comments.content,
         likesCount: comments.likesCount,
         dislikesCount: comments.dislikesCount,
         createdAt: comments.createdAt,
         updatedAt: comments.updatedAt,
         isHidden: comments.isHidden,
         isModerated: comments.isModerated,
         moderationReason: comments.moderationReason,
         editedByAdmin: comments.editedByAdmin,
         editedByAdminAt: comments.editedByAdminAt,
         editedByAdminId: comments.editedByAdminId,
         originalContent: comments.originalContent,
         author: {
            id: users.id,
            name: users.name,
            surname: users.surname,
            image: users.image,
         },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(and(...whereConditions));

   // Řazení
   if (sortOrder === "newest") {
      query = query.orderBy(desc(comments.createdAt)) as any;
   } else if (sortOrder === "oldest") {
      query = query.orderBy(asc(comments.createdAt)) as any;
   } else if (sortOrder === "best") {
      query = query.orderBy(
         desc(comments.likesCount),
         desc(comments.createdAt),
      ) as any;
   }

   // Limit a offset
   query = query.limit(limit).offset(offset) as any;

   const result = await query;

   // Pro každý komentář získat počet odpovědí a user rating
   const commentsWithReplies = await Promise.all(
      result.map(async (comment) => {
         // Počet odpovědí
         const repliesCountResult = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(comments)
            .where(
               and(
                  eq(comments.parentId, comment.id),
                  isNull(comments.deletedAt),
               ),
            );

         const repliesCount = Number(repliesCountResult[0]?.count || 0);

         // User rating (pokud je userId poskytnut)
         let userRating: boolean | null = null;
         if (userId) {
            const ratingResult = await db
               .select({ state: commentRatings.state })
               .from(commentRatings)
               .where(
                  and(
                     eq(commentRatings.commentId, comment.id),
                     eq(commentRatings.userId, userId),
                  ),
               )
               .limit(1);

            userRating = ratingResult[0]?.state ?? null;
         }

         return {
            ...comment,
            repliesCount,
            userRating,
         };
      }),
   );

   return commentsWithReplies;
}

/**
 * Získání odpovědí na komentář
 * @param commentId - ID rodičovského komentáře
 * @param userId - ID přihlášeného uživatele (pro userRating)
 * @param includeHidden - Zda zahrnout skryté komentáře (pro moderátory)
 */
export async function getRepliesByCommentId(
   commentId: string,
   userId?: string,
   includeHidden?: boolean,
): Promise<CommentWithAuthor[]> {
   const whereConditions = [
      eq(comments.parentId, commentId),
      isNull(comments.deletedAt),
   ];

   if (!includeHidden) {
      whereConditions.push(eq(comments.isHidden, false));
   }

   const result = await db
      .select({
         id: comments.id,
         threadId: comments.threadId,
         userId: comments.userId,
         parentId: comments.parentId,
         content: comments.content,
         likesCount: comments.likesCount,
         dislikesCount: comments.dislikesCount,
         createdAt: comments.createdAt,
         updatedAt: comments.updatedAt,
         isHidden: comments.isHidden,
         isModerated: comments.isModerated,
         moderationReason: comments.moderationReason,
         editedByAdmin: comments.editedByAdmin,
         editedByAdminAt: comments.editedByAdminAt,
         editedByAdminId: comments.editedByAdminId,
         originalContent: comments.originalContent,
         author: {
            id: users.id,
            name: users.name,
            surname: users.surname,
            image: users.image,
         },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(and(...whereConditions))
      .orderBy(asc(comments.createdAt));

   // Pro každou odpověď získat user rating
   const repliesWithRating = await Promise.all(
      result.map(async (reply) => {
         let userRating: boolean | null = null;
         if (userId) {
            const ratingResult = await db
               .select({ state: commentRatings.state })
               .from(commentRatings)
               .where(
                  and(
                     eq(commentRatings.commentId, reply.id),
                     eq(commentRatings.userId, userId),
                  ),
               )
               .limit(1);

            userRating = ratingResult[0]?.state ?? null;
         }

         return {
            ...reply,
            repliesCount: 0,
            userRating,
         };
      }),
   );

   return repliesWithRating;
}

/**
 * Typ komentáře uživatele s informacemi o článku
 */
export type UserCommentWithArticle = {
   id: string;
   threadId: string;
   content: string;
   likesCount: number;
   dislikesCount: number;
   createdAt: Date;
   isHidden: boolean;
   article: {
      id: string;
      title: string;
      slug: string;
   };
};

/**
 * Získání komentářů uživatele (pro stránku Moje komentáře)
 */
export async function getCommentsByUserId(
   userId: string,
   options?: { limit?: number; offset?: number },
): Promise<UserCommentWithArticle[]> {
   const { limit = 50, offset = 0 } = options || {};

   const result = await db
      .select({
         id: comments.id,
         threadId: comments.threadId,
         content: comments.content,
         likesCount: comments.likesCount,
         dislikesCount: comments.dislikesCount,
         createdAt: comments.createdAt,
         isHidden: comments.isHidden,
         article: {
            id: articles.id,
            title: articles.title,
            slug: articles.slug,
         },
      })
      .from(comments)
      .innerJoin(commentThreads, eq(comments.threadId, commentThreads.id))
      .innerJoin(articles, eq(commentThreads.articleId, articles.id))
      .where(and(eq(comments.userId, userId), isNull(comments.deletedAt)))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

   return result;
}

/**
 * Vytvoření nového komentáře
 */
export async function createComment(
   threadId: string,
   userId: string,
   content: string,
   parentId?: string | null,
): Promise<CommentWithAuthor> {
   const [newComment] = await db
      .insert(comments)
      .values({
         threadId,
         userId,
         content,
         parentId: parentId || null,
         likesCount: 0,
         dislikesCount: 0,
      })
      .returning();

   // Získat autora
   const authorResult = await db
      .select({
         id: users.id,
         name: users.name,
         surname: users.surname,
         image: users.image,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

   return {
      ...newComment,
      author: authorResult[0]!,
      repliesCount: 0,
      userRating: null,
   };
}

/**
 * Přidání nebo změna hodnocení komentáře (like/dislike)
 */
export async function toggleCommentRating(
   commentId: string,
   userId: string,
   state: boolean, // true = like, false = dislike
): Promise<{ likesCount: number; dislikesCount: number }> {
   // Zkontrolovat, zda už existuje rating
   const existingRating = await db
      .select()
      .from(commentRatings)
      .where(
         and(
            eq(commentRatings.commentId, commentId),
            eq(commentRatings.userId, userId),
         ),
      )
      .limit(1);

   if (existingRating.length > 0) {
      const currentState = existingRating[0].state;

      if (currentState === state) {
         // Stejný rating - odstranit hodnocení
         await db
            .delete(commentRatings)
            .where(
               and(
                  eq(commentRatings.commentId, commentId),
                  eq(commentRatings.userId, userId),
               ),
            );

         // Aktualizovat počty
         if (state) {
            await db
               .update(comments)
               .set({
                  likesCount: sql`${comments.likesCount} - 1`,
               })
               .where(eq(comments.id, commentId));
         } else {
            await db
               .update(comments)
               .set({
                  dislikesCount: sql`${comments.dislikesCount} - 1`,
               })
               .where(eq(comments.id, commentId));
         }
      } else {
         // Změna ratingu (like -> dislike nebo naopak)
         await db
            .update(commentRatings)
            .set({ state })
            .where(
               and(
                  eq(commentRatings.commentId, commentId),
                  eq(commentRatings.userId, userId),
               ),
            );

         // Aktualizovat počty
         if (state) {
            // Změna z dislike na like
            await db
               .update(comments)
               .set({
                  likesCount: sql`${comments.likesCount} + 1`,
                  dislikesCount: sql`${comments.dislikesCount} - 1`,
               })
               .where(eq(comments.id, commentId));
         } else {
            // Změna z like na dislike
            await db
               .update(comments)
               .set({
                  likesCount: sql`${comments.likesCount} - 1`,
                  dislikesCount: sql`${comments.dislikesCount} + 1`,
               })
               .where(eq(comments.id, commentId));
         }
      }
   } else {
      // Nové hodnocení
      await db.insert(commentRatings).values({
         commentId,
         userId,
         state,
      });

      // Aktualizovat počty
      if (state) {
         await db
            .update(comments)
            .set({
               likesCount: sql`${comments.likesCount} + 1`,
            })
            .where(eq(comments.id, commentId));
      } else {
         await db
            .update(comments)
            .set({
               dislikesCount: sql`${comments.dislikesCount} + 1`,
            })
            .where(eq(comments.id, commentId));
      }
   }

   // Vrátit aktuální počty
   const updatedComment = await db
      .select({
         likesCount: comments.likesCount,
         dislikesCount: comments.dislikesCount,
      })
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

   return {
      likesCount: updatedComment[0]!.likesCount,
      dislikesCount: updatedComment[0]!.dislikesCount,
   };
}

/**
 * Skrytí komentáře (moderace)
 */
export async function hideComment(
   commentId: string,
   moderatorId: string,
   reason: string,
) {
   const [updatedComment] = await db
      .update(comments)
      .set({
         isHidden: true,
         isModerated: true,
         moderatedBy: moderatorId,
         moderatedAt: new Date(),
         moderationReason: reason,
      })
      .where(eq(comments.id, commentId))
      .returning();

   return updatedComment;
}

/**
 * Zobrazení komentáře (odvolání moderace)
 */
export async function unhideComment(commentId: string, moderatorId: string) {
   const [updatedComment] = await db
      .update(comments)
      .set({
         isHidden: false,
         // moderationReason může zůstat pro audit
      })
      .where(eq(comments.id, commentId))
      .returning();

   return updatedComment;
}

/**
 * Soft delete komentáře moderátorem/adminem.
 * Maže i přímé odpovědi, aby se v UI nezobrazovaly osiřelé reakce.
 */
export async function softDeleteCommentByModerator(
   commentId: string,
   moderatorId: string,
) {
   const now = new Date();

   const [deletedComment] = await db
      .update(comments)
      .set({
         deletedAt: now,
         updatedAt: now,
         isHidden: true,
         isModerated: true,
         moderatedBy: moderatorId,
         moderatedAt: now,
         moderationReason: "Komentář byl smazán moderátorem",
      })
      .where(and(eq(comments.id, commentId), isNull(comments.deletedAt)))
      .returning();

   if (!deletedComment) {
      return null;
   }

   await db
      .update(comments)
      .set({
         deletedAt: now,
         updatedAt: now,
         isHidden: true,
         isModerated: true,
         moderatedBy: moderatorId,
         moderatedAt: now,
         moderationReason: "Komentář byl smazán moderátorem",
      })
      .where(and(eq(comments.parentId, commentId), isNull(comments.deletedAt)));

   return deletedComment;
}

/**
 * Aktualizace komentáře administrátorem
 */
export async function updateCommentAsAdmin(
   commentId: string,
   adminId: string,
   newContent: string,
) {
   // Získat aktuální komentář
   const currentComment = await getCommentById(commentId);
   if (!currentComment) {
      throw new Error("Komentář nenalezen");
   }

   // Uložit původní obsah do originalContent (pokud tam ještě není)
   const originalContent =
      currentComment.originalContent || currentComment.content;

   const [updatedComment] = await db
      .update(comments)
      .set({
         content: newContent,
         editedByAdmin: true,
         editedByAdminId: adminId,
         editedByAdminAt: new Date(),
         originalContent: originalContent,
         updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId))
      .returning();

   return updatedComment;
}

/**
 * Získání komentářů pro moderaci (skryté nebo nahlášené)
 */
export async function getCommentsForModeration(options?: {
   limit?: number;
   offset?: number;
   includeHidden?: boolean;
   includeModerated?: boolean;
}): Promise<CommentWithAuthor[]> {
   const {
      limit = 50,
      offset = 0,
      includeHidden = true,
      includeModerated = true,
   } = options || {};

   const whereConditions = [isNull(comments.deletedAt)];

   const moderationConditions = [];
   if (includeHidden) {
      moderationConditions.push(eq(comments.isHidden, true));
   }
   if (includeModerated) {
      moderationConditions.push(eq(comments.isModerated, true));
   }
   // Zahrnout i komentáře s pending reporty (i když ještě nejsou skryté)
   moderationConditions.push(
      sql`${comments.id} IN (SELECT entity_id FROM ${reports} WHERE entity_type = 'comment' AND status = 'pending')`,
   );
   whereConditions.push(or(...moderationConditions) as any);

   const result = await db
      .select({
         id: comments.id,
         threadId: comments.threadId,
         userId: comments.userId,
         parentId: comments.parentId,
         content: comments.content,
         likesCount: comments.likesCount,
         dislikesCount: comments.dislikesCount,
         createdAt: comments.createdAt,
         updatedAt: comments.updatedAt,
         isHidden: comments.isHidden,
         isModerated: comments.isModerated,
         moderationReason: comments.moderationReason,
         editedByAdmin: comments.editedByAdmin,
         originalContent: comments.originalContent,
         author: {
            id: users.id,
            name: users.name,
            surname: users.surname,
            image: users.image,
         },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(and(...whereConditions))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

   // Pro každý komentář získat počet odpovědí a reportů
   const commentsWithReplies = await Promise.all(
      result.map(async (comment) => {
         const [repliesCountResult, reportsCountResult] = await Promise.all([
            db
               .select({ count: sql<number>`count(*)::int` })
               .from(comments)
               .where(
                  and(
                     eq(comments.parentId, comment.id),
                     isNull(comments.deletedAt),
                  ),
               ),
            db
               .select({ count: sql<number>`count(*)::int` })
               .from(reports)
               .where(
                  and(
                     eq(reports.entityType, "comment"),
                     eq(reports.entityId, comment.id),
                     eq(reports.status, "pending"),
                  ),
               ),
         ]);

         const repliesCount = Number(repliesCountResult[0]?.count || 0);
         const reportsCount = Number(reportsCountResult[0]?.count || 0);

         return {
            ...comment,
            repliesCount,
            userRating: null,
            reportsCount,
         };
      }),
   );

   return commentsWithReplies;
}

/**
 * Získání všech komentářů pro dashboard (napříč platformou).
 * Podporuje paginaci a základní vyhledávání (autor / obsah / článek).
 */
export async function getDashboardComments(options?: {
   limit?: number;
   offset?: number;
   query?: string;
}): Promise<DashboardComment[]> {
   const { limit = 50, offset = 0, query } = options || {};
   const trimmedQuery = query?.trim();

   const whereConditions = [isNull(comments.deletedAt)];
   if (trimmedQuery) {
      const like = `%${trimmedQuery}%`;
      whereConditions.push(
         sql`(
            ${comments.content} ILIKE ${like}
            OR (${users.name} || ' ' || ${users.surname}) ILIKE ${like}
            OR ${articles.title} ILIKE ${like}
         )` as any,
      );
   }

   const result = await db
      .select({
         id: comments.id,
         threadId: comments.threadId,
         userId: comments.userId,
         parentId: comments.parentId,
         content: comments.content,
         likesCount: comments.likesCount,
         dislikesCount: comments.dislikesCount,
         createdAt: comments.createdAt,
         updatedAt: comments.updatedAt,
         isHidden: comments.isHidden,
         isModerated: comments.isModerated,
         moderationReason: comments.moderationReason,
         editedByAdmin: comments.editedByAdmin,
         originalContent: comments.originalContent,
         author: {
            id: users.id,
            name: users.name,
            surname: users.surname,
            image: users.image,
         },
         thread: {
            id: commentThreads.id,
         },
         articleId: articles.id,
         articleTitle: articles.title,
         articleSlug: articles.slug,
         repliesCount: sql<number>`(
            SELECT count(*)::int
            FROM ${comments} AS c2
            WHERE c2.parent_id = ${comments.id} AND c2.deleted_at IS NULL
         )`,
         reportsCount: sql<number>`(
            SELECT count(*)::int
            FROM ${reports}
            WHERE ${reports.entityType} = 'comment'
              AND ${reports.entityId} = ${comments.id}
              AND ${reports.status} = 'pending'
         )`,
         userRating: sql<null>`NULL`,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .innerJoin(commentThreads, eq(comments.threadId, commentThreads.id))
      .innerJoin(articles, eq(commentThreads.articleId, articles.id))
      .where(and(...whereConditions))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

   return result.map(
      ({ articleId, articleTitle, articleSlug, thread, ...rest }) =>
         ({
            ...rest,
            thread: {
               id: thread.id,
               article: {
                  id: articleId,
                  title: articleTitle,
                  slug: articleSlug,
               },
            },
         }) as DashboardComment,
   );
}

/**
 * Vrátí celkový počet komentářů pro dashboard (pro stránkování).
 * Respektuje stejný `query` filtr jako `getDashboardComments`.
 */
export async function countDashboardComments(options?: { query?: string }): Promise<number> {
   const trimmedQuery = options?.query?.trim();

   const whereConditions = [isNull(comments.deletedAt)];
   if (trimmedQuery) {
      const like = `%${trimmedQuery}%`;
      whereConditions.push(
         sql`(
            ${comments.content} ILIKE ${like}
            OR (${users.name} || ' ' || ${users.surname}) ILIKE ${like}
            OR ${articles.title} ILIKE ${like}
         )` as any,
      );
   }

   const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .innerJoin(commentThreads, eq(comments.threadId, commentThreads.id))
      .innerJoin(articles, eq(commentThreads.articleId, articles.id))
      .where(and(...whereConditions))
      .limit(1);

   return Number(rows[0]?.count ?? 0);
}

/**
 * Detail komentáře pro dashboard.
 */
export async function getDashboardCommentById(commentId: string): Promise<DashboardComment | null> {
   const rows = await db
      .select({
         id: comments.id,
         threadId: comments.threadId,
         userId: comments.userId,
         parentId: comments.parentId,
         content: comments.content,
         likesCount: comments.likesCount,
         dislikesCount: comments.dislikesCount,
         createdAt: comments.createdAt,
         updatedAt: comments.updatedAt,
         isHidden: comments.isHidden,
         isModerated: comments.isModerated,
         moderationReason: comments.moderationReason,
         editedByAdmin: comments.editedByAdmin,
         originalContent: comments.originalContent,
         author: {
            id: users.id,
            name: users.name,
            surname: users.surname,
            image: users.image,
         },
         thread: {
            id: commentThreads.id,
         },
         articleId: articles.id,
         articleTitle: articles.title,
         articleSlug: articles.slug,
         repliesCount: sql<number>`(
            SELECT count(*)::int
            FROM ${comments} AS c2
            WHERE c2.parent_id = ${comments.id} AND c2.deleted_at IS NULL
         )`,
         reportsCount: sql<number>`(
            SELECT count(*)::int
            FROM ${reports}
            WHERE ${reports.entityType} = 'comment'
              AND ${reports.entityId} = ${comments.id}
              AND ${reports.status} = 'pending'
         )`,
         userRating: sql<null>`NULL`,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .innerJoin(commentThreads, eq(comments.threadId, commentThreads.id))
      .innerJoin(articles, eq(commentThreads.articleId, articles.id))
      .where(and(isNull(comments.deletedAt), eq(comments.id, commentId)))
      .limit(1);

   const row = rows[0];
   if (!row) {
      return null;
   }
   const { articleId, articleTitle, articleSlug, thread, ...rest } = row;
   return {
      ...rest,
      thread: {
         id: thread.id,
         article: {
            id: articleId,
            title: articleTitle,
            slug: articleSlug,
         },
      },
   } as DashboardComment;
}
