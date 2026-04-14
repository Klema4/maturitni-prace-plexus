import { getThread as getThreadService, getThreadComments } from "@/lib/services/commentsService";
import type { ThreadWithArticle as RepositoryThreadWithArticle } from "@/lib/repositories/commentsRepository";
import type { CommentWithAuthor } from "@/lib/repositories/commentsRepository";
import type { ThreadWithArticle } from "@/app/features/threads/types";

/**
 * getThreadWithArticle
 * Načte thread s informacemi o článku a transformuje ho do formátu pro feature.
 * @param {string} threadId - ID threadu
 * @returns {Promise<ThreadWithArticle | null>} Thread s článkem nebo null, pokud neexistuje
 */
export async function getThreadWithArticle(threadId: string): Promise<ThreadWithArticle | null> {
  const thread = await getThreadService(threadId);
  if (!thread) {
    return null;
  }
  
  // Transformace z repository formátu do feature formátu
  return {
    id: thread.id,
    article: {
      id: thread.article.id,
      title: thread.article.title,
    },
  };
}

/**
 * getThreadCommentsForPage
 * Načte komentáře pro thread s možností filtrování a řazení.
 * @param {string} threadId - ID threadu
 * @param {Object} options - Možnosti filtrování a řazení
 * @param {string} [options.userId] - ID uživatele pro filtrování vlastních komentářů
 * @param {'newest' | 'oldest' | 'best'} [options.sortOrder] - Řazení komentářů
 * @param {number} [options.limit] - Limit počtu komentářů
 * @param {number} [options.offset] - Offset pro paginaci
 * @returns {Promise<CommentWithAuthor[]>} Pole komentářů
 */
export async function getThreadCommentsForPage(
  threadId: string,
  options?: {
    userId?: string;
    sortOrder?: 'newest' | 'oldest' | 'best';
    limit?: number;
    offset?: number;
  }
): Promise<CommentWithAuthor[]> {
  return await getThreadComments(threadId, options);
}
