"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { getComments, getThread } from "@/app/features/threads/api/threads.api";
import type { CommentData } from "@/app/features/threads/types";
import type { SortOrder } from "@/app/components/blog/ui/Dropdown";

/**
 * useThreadPage
 * Hook pro správu stavu thread stránky včetně načítání komentářů, session a uživatelských dat.
 * Spravuje aktivní tab, řazení, komentáře a paginaci.
 *
 * @param {string} threadId - ID threadu
 * @param {string | null} initialArticleTitle - Počáteční nadpis článku
 * @param {number} limit - Počet komentářů na jednu dávku
 * @returns {{
 *   activeTab: 'comments' | 'myComments';
 *   setActiveTab: (tab: 'comments' | 'myComments') => void;
 *   sortOrder: SortOrder;
 *   setSortOrder: (order: SortOrder) => void;
 *   comments: CommentData[];
 *   loading: boolean;
 *   isAuthenticated: boolean;
 *   user: { id: string; name: string; image: string | null } | null;
 *   articleTitle: string;
 *   hasMore: boolean;
 *   handleLoadMore: () => Promise<void>;
 *   handleAddComment: (content: string) => Promise<void>;
 *   handleReply: (commentId: string, content: string) => Promise<void>;
 *   handleRate: (commentId: string, isLike: boolean) => Promise<void>;
 * }} Stav a ovládací funkce pro thread stránku
 */
export function useThreadPage(
   threadId: string,
   initialArticleTitle: string | null,
   limit: number = 20,
) {
   const [activeTab, setActiveTab] = useState<"comments" | "myComments">(
      "comments",
   );
   const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
   const [comments, setComments] = useState<CommentData[]>([]);
   const [loading, setLoading] = useState(true);
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [user, setUser] = useState<{
      id: string;
      name: string;
      image: string | null;
   } | null>(null);
   const [articleTitle, setArticleTitle] = useState(
      initialArticleTitle || "Načítání...",
   );
   const [offset, setOffset] = useState(0);
   const [hasMore, setHasMore] = useState(false);
   const [canDeleteComments, setCanDeleteComments] = useState(false);
   const [actionError, setActionError] = useState<string | null>(null);

   // Načtení session a uživatelských dat
   useEffect(() => {
      const loadSession = async () => {
         try {
            const session = await authClient.getSession();
            if (session.data?.user) {
               setIsAuthenticated(true);
               setUser({
                  id: session.data.user.id,
                  name: session.data.user.name || "Uživatel",
                  image: session.data.user.image || null,
               });
            }
         } catch (error) {
            console.error("Error loading session:", error);
         }
      };

      loadSession();
   }, []);

   // Načtení thread informací
   useEffect(() => {
      const loadThread = async () => {
         try {
            const thread = await getThread(threadId);
            if (thread) {
               setArticleTitle(thread.article.title);
            }
         } catch (error) {
            console.error("Error loading thread:", error);
         }
      };

      if (!initialArticleTitle) {
         loadThread();
      }
   }, [threadId, initialArticleTitle]);

   // Načtení komentářů
   useEffect(() => {
      loadComments();
   }, [threadId, activeTab, sortOrder]);

   const loadComments = async (resetOffset = true) => {
      setLoading(true);
      try {
         const currentOffset = resetOffset ? 0 : offset;
         const { comments: fetchedComments, canDeleteComments: canDelete } =
            await getComments(threadId, {
               sortOrder,
               limit,
               offset: currentOffset,
               myComments: activeTab === "myComments",
            });
         setCanDeleteComments(canDelete);

         if (resetOffset) {
            setComments(fetchedComments);
            setOffset(limit);
         } else {
            setComments((prev) => [...prev, ...fetchedComments]);
            setOffset((prev) => prev + limit);
         }
         setHasMore(fetchedComments.length === limit);
      } catch (error) {
         console.error("Error loading comments:", error);
      } finally {
         setLoading(false);
      }
   };

   const handleAddComment = async (content: string) => {
      if (!isAuthenticated) return;

      try {
         const { createComment } =
            await import("@/app/features/threads/api/threads.api");
         const newComment = await createComment(threadId, content);
         setComments((prev) => [newComment, ...prev]);
      } catch (error: any) {
         console.error("Error creating comment:", error);
         setActionError(error?.message || "Nepodařilo se vytvořit komentář");
      }
   };

   const handleReply = async (commentId: string, content: string) => {
      if (!isAuthenticated) return;

      try {
         const { createComment } =
            await import("@/app/features/threads/api/threads.api");
         await createComment(threadId, content, commentId);
         setComments((prev) =>
            prev.map((comment) =>
               comment.id === commentId
                  ? { ...comment, repliesCount: comment.repliesCount + 1 }
                  : comment,
            ),
         );
      } catch (error: any) {
         console.error("Error creating reply:", error);
         setActionError(error?.message || "Nepodařilo se vytvořit odpověď");
      }
   };

   const handleRate = async (commentId: string, isLike: boolean) => {
      if (!isAuthenticated) return;

      try {
         const { rateComment } =
            await import("@/app/features/threads/api/threads.api");
         const data = await rateComment(commentId, isLike);
         setComments((prev) =>
            prev.map((comment) =>
               comment.id === commentId
                  ? {
                       ...comment,
                       likesCount: data.likesCount,
                       dislikesCount: data.dislikesCount,
                    }
                  : comment,
            ),
         );
      } catch (error) {
         console.error("Error rating comment:", error);
         throw error;
      }
   };

   const handleReport = async (commentId: string, reason: string) => {
      if (!isAuthenticated) return;

      try {
         const { reportComment } =
            await import("@/app/features/threads/api/threads.api");
         await reportComment(commentId, reason);
      } catch (error) {
         console.error("Error reporting comment:", error);
         throw error;
      }
   };

   const handleDeleteComment = async (commentId: string) => {
      if (!isAuthenticated || !canDeleteComments) return;

      try {
         const { deleteComment } =
            await import("@/app/features/threads/api/threads.api");
         await deleteComment(commentId);
         await loadComments(true);
      } catch (error: any) {
         console.error("Error deleting comment:", error);
         throw error;
      }
   };

   const handleLoadMore = async () => {
      await loadComments(false);
   };

   const handleTabChange = (tab: "comments" | "myComments") => {
      setActiveTab(tab);
      setOffset(0);
   };

   const clearActionError = () => {
      setActionError(null);
   };

   return {
      activeTab,
      setActiveTab: handleTabChange,
      sortOrder,
      setSortOrder,
      comments,
      loading,
      isAuthenticated,
      user,
      articleTitle,
      canDeleteComments,
      actionError,
      clearActionError,
      hasMore,
      handleLoadMore,
      handleAddComment,
      handleReply,
      handleRate,
      handleReport,
      handleDeleteComment,
   };
}
