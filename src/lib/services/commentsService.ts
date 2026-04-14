import {
   getThreadById,
   getCommentsByThreadId,
   getRepliesByCommentId,
   createComment,
   toggleCommentRating,
   hideComment,
   unhideComment,
   softDeleteCommentByModerator,
   updateCommentAsAdmin,
   getCommentsForModeration,
   type CommentWithAuthor,
   type ThreadWithArticle,
} from "@/lib/repositories/commentsRepository";
import { getUserById } from "@/lib/repositories/userRepository";

/**
 * Získání threadu s článkem
 */
export async function getThread(
   threadId: string,
): Promise<ThreadWithArticle | null> {
   return await getThreadById(threadId);
}

/**
 * Získání komentářů pro thread
 */
export async function getThreadComments(
   threadId: string,
   options?: {
      userId?: string;
      sortOrder?: "newest" | "oldest" | "best";
      limit?: number;
      offset?: number;
      includeHidden?: boolean;
   },
): Promise<CommentWithAuthor[]> {
   return await getCommentsByThreadId(threadId, options);
}

/**
 * Získání odpovědí na komentář
 * @param commentId - ID rodičovského komentáře
 * @param userId - ID přihlášeného uživatele (pro userRating)
 * @param includeHidden - Zda zahrnout skryté komentáře (pro moderátory)
 */
export async function getCommentReplies(
   commentId: string,
   userId?: string,
   includeHidden?: boolean,
): Promise<CommentWithAuthor[]> {
   return await getRepliesByCommentId(commentId, userId, includeHidden);
}

/**
 * Vytvoření nového komentáře
 */
export async function addComment(
   threadId: string,
   userId: string,
   content: string,
   parentId?: string | null,
): Promise<CommentWithAuthor> {
   // Kontrola, zda není uživatel zabanován
   const user = await getUserById(userId);
   if (!user) {
      throw new Error("Uživatel nenalezen");
   }

   if (user.isBanned) {
      throw new Error("Zabanovaní uživatelé nemohou komentovat");
   }

   // Validace obsahu
   const trimmedContent = content.trim();
   if (!trimmedContent || trimmedContent.length === 0) {
      throw new Error("Komentář nemůže být prázdný");
   }

   if (trimmedContent.length > 1000) {
      throw new Error("Komentář může mít maximálně 1000 znaků");
   }

   return await createComment(threadId, userId, trimmedContent, parentId);
}

/**
 * Přepnutí hodnocení komentáře
 */
export async function rateComment(
   commentId: string,
   userId: string,
   isLike: boolean,
): Promise<{ likesCount: number; dislikesCount: number }> {
   return await toggleCommentRating(commentId, userId, isLike);
}

/**
 * Skrytí komentáře (moderace)
 */
export async function moderateComment(
   commentId: string,
   moderatorId: string,
   reason: string,
) {
   const trimmedReason = reason.trim();
   if (!trimmedReason || trimmedReason.length === 0) {
      throw new Error("Důvod moderace nemůže být prázdný");
   }

   if (trimmedReason.length > 512) {
      throw new Error("Důvod moderace může mít maximálně 512 znaků");
   }

   return await hideComment(commentId, moderatorId, trimmedReason);
}

/**
 * Zobrazení komentáře (odvolání moderace)
 */
export async function unmoderateComment(
   commentId: string,
   moderatorId: string,
) {
   return await unhideComment(commentId, moderatorId);
}

/**
 * Smazání komentáře moderátorem/adminem
 */
export async function deleteCommentAsModerator(
   commentId: string,
   moderatorId: string,
) {
   const deletedComment = await softDeleteCommentByModerator(
      commentId,
      moderatorId,
   );
   if (!deletedComment) {
      throw new Error("Komentář nenalezen");
   }

   return deletedComment;
}

/**
 * Úprava komentáře administrátorem
 */
export async function editCommentAsAdmin(
   commentId: string,
   adminId: string,
   newContent: string,
) {
   const trimmedContent = newContent.trim();
   if (!trimmedContent || trimmedContent.length === 0) {
      throw new Error("Komentář nemůže být prázdný");
   }

   if (trimmedContent.length > 1000) {
      throw new Error("Komentář může mít maximálně 1000 znaků");
   }

   return await updateCommentAsAdmin(commentId, adminId, trimmedContent);
}

/**
 * Získání komentářů pro moderaci
 */
export async function getCommentsForModerationService(options?: {
   limit?: number;
   offset?: number;
   includeHidden?: boolean;
   includeModerated?: boolean;
}): Promise<CommentWithAuthor[]> {
   return await getCommentsForModeration(options);
}
