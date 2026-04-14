import type { CommentData } from "@/app/features/threads/types";
import type { ThreadWithArticle } from "@/app/features/threads/types";

type CommentsResponse = {
   comments: CommentData[];
   canDeleteComments: boolean;
};

function normalizeComment(comment: CommentData): CommentData {
   return {
      ...comment,
      createdAt:
         typeof comment.createdAt === "string"
            ? new Date(comment.createdAt)
            : comment.createdAt,
      updatedAt:
         typeof comment.updatedAt === "string"
            ? new Date(comment.updatedAt)
            : comment.updatedAt,
   };
}

/**
 * getThread
 * Načte thread z API.
 * @param {string} threadId - ID threadu
 * @returns {Promise<ThreadWithArticle | null>} Thread nebo null, pokud neexistuje
 */
export async function getThread(
   threadId: string,
): Promise<ThreadWithArticle | null> {
   try {
      const response = await fetch(`/api/threads/${threadId}`);
      if (!response.ok) {
         return null;
      }
      const data = await response.json();
      return data.thread || null;
   } catch (error) {
      console.error("Error fetching thread:", error);
      return null;
   }
}

/**
 * getComments
 * Načte komentáře pro thread z API.
 * @param {string} threadId - ID threadu
 * @param {Object} options - Možnosti filtrování a řazení
 * @param {'newest' | 'oldest' | 'best'} [options.sortOrder] - Řazení komentářů
 * @param {number} [options.limit] - Limit počtu komentářů
 * @param {number} [options.offset] - Offset pro paginaci
 * @param {boolean} [options.myComments] - Zda zobrazit pouze vlastní komentáře
 * @returns {Promise<CommentData[]>} Pole komentářů
 */
export async function getComments(
   threadId: string,
   options?: {
      sortOrder?: "newest" | "oldest" | "best";
      limit?: number;
      offset?: number;
      myComments?: boolean;
   },
): Promise<CommentsResponse> {
   try {
      const {
         sortOrder = "newest",
         limit = 20,
         offset = 0,
         myComments = false,
      } = options || {};
      const response = await fetch(
         `/api/threads/${threadId}/comments?sortOrder=${sortOrder}&limit=${limit}&offset=${offset}&myComments=${myComments}`,
      );

      if (!response.ok) {
         return { comments: [], canDeleteComments: false };
      }

      const data = await response.json();
      const comments = (data.comments || []).map(normalizeComment);

      return {
         comments,
         canDeleteComments: Boolean(data.canDeleteComments),
      };
   } catch (error) {
      console.error("Error fetching comments:", error);
      return { comments: [], canDeleteComments: false };
   }
}

/**
 * createComment
 * Vytvoří nový komentář.
 * @param {string} threadId - ID threadu
 * @param {string} content - Obsah komentáře
 * @param {string} [parentId] - ID rodičovského komentáře pro odpověď
 * @returns {Promise<CommentData>} Vytvořený komentář
 */
export async function createComment(
   threadId: string,
   content: string,
   parentId?: string,
): Promise<CommentData> {
   const response = await fetch(`/api/threads/${threadId}/comments`, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, parentId }),
   });

   if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Nepodařilo se vytvořit komentář");
   }

   const data = await response.json();
   return normalizeComment(data.comment);
}

/**
 * rateComment
 * Ohodnotí komentář (like/dislike).
 * @param {string} commentId - ID komentáře
 * @param {boolean} isLike - Zda je to like (true) nebo dislike (false)
 * @returns {Promise<{ likesCount: number; dislikesCount: number }>} Aktualizované počty hodnocení
 */
export async function rateComment(
   commentId: string,
   isLike: boolean,
): Promise<{ likesCount: number; dislikesCount: number }> {
   const response = await fetch(`/api/comments/${commentId}/rate`, {
      method: "PATCH",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ isLike }),
   });

   if (!response.ok) {
      throw new Error("Nepodařilo se hodnotit komentář");
   }

   return await response.json();
}

/**
 * getCommentReplies
 * Načte odpovědi na komentář.
 * @param {string} commentId - ID komentáře
 * @returns {Promise<CommentData[]>} Pole odpovědí
 */
export async function getCommentReplies(
   commentId: string,
): Promise<CommentData[]> {
   try {
      const response = await fetch(`/api/comments/${commentId}/replies`);
      if (!response.ok) {
         return [];
      }
      const data = await response.json();
      return (data.replies || []).map(normalizeComment);
   } catch (error) {
      console.error("Error fetching replies:", error);
      return [];
   }
}

/**
 * reportComment
 * Nahlásí komentář jako nevhodný.
 * @param {string} commentId - ID komentáře
 * @param {string} reason - Důvod reportu
 * @returns {Promise<void>}
 */
export async function reportComment(
   commentId: string,
   reason: string,
): Promise<void> {
   const response = await fetch(`/api/comments/${commentId}/report`, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
   });

   if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Nepodařilo se nahlásit komentář");
   }
}

/**
 * deleteComment
 * Smaže komentář moderátorem/adminem.
 * @param {string} commentId - ID komentáře
 * @returns {Promise<void>}
 */
export async function deleteComment(commentId: string): Promise<void> {
   const response = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
   });

   if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Nepodařilo se smazat komentář");
   }
}
