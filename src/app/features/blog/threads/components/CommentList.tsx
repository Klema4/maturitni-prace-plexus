"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/app/components/blog/ui/Button";
import { RefreshCcw } from "lucide-react";
import { CommentItem } from "./CommentItem";
import { CommentInput } from "./CommentInput";
import { getCommentReplies } from "@/app/features/threads/api/threads.api";
import type { CommentData } from "@/app/features/threads/types";

/**
 * CommentList komponenta
 * Zobrazuje seznam komentářů s možností načtení dalších a odpovědí.
 * @param {Object} props - Vlastnosti komponenty.
 * @param {CommentData[]} props.comments - Pole komentářů.
 * @param {boolean} props.isAuthenticated - Zda je uživatel přihlášen.
 * @param {string | null} props.userAvatar - URL avatara uživatele.
 * @param {string} props.userName - Jméno uživatele.
 * @param {(commentId: string, isLike: boolean) => Promise<void>} props.onRate - Obslužná funkce při hodnocení komentáře.
 * @param {(commentId: string, content: string) => Promise<void>} props.onReply - Obslužná funkce při vytvoření odpovědi.
 * @param {(commentId: string) => void} [props.onReport] - Obslužná funkce při kliknutí na report.
 * @param {() => Promise<void>} [props.onLoadMore] - Obslužná funkce pro načtení dalších komentářů.
 * @param {boolean} [props.hasMore] - Zda jsou k dispozici další komentáře.
 * @param {string} [props.emptyMessage] - Vlastní zpráva pro prázdný stav.
 * @returns {JSX.Element} CommentList komponenta.
 */
export function CommentList({
   comments,
   isAuthenticated,
   userAvatar,
   userName,
   onRate,
   onReply,
   onReport,
   canDeleteComments = false,
   onDelete,
   onLoadMore,
   hasMore = false,
   emptyMessage,
}: {
   comments: CommentData[];
   isAuthenticated: boolean;
   userAvatar: string | null;
   userName: string;
   onRate: (commentId: string, isLike: boolean) => Promise<void>;
   onReply: (commentId: string, content: string) => Promise<void>;
   onReport?: (commentId: string) => void;
   canDeleteComments?: boolean;
   onDelete?: (commentId: string) => Promise<void>;
   onLoadMore?: () => Promise<void>;
   hasMore?: boolean;
   emptyMessage?: string;
}) {
   const [replyingTo, setReplyingTo] = useState<string | null>(null);
   const [repliesMap, setRepliesMap] = useState<Record<string, CommentData[]>>(
      {},
   );
   const [loadingReplies, setLoadingReplies] = useState<
      Record<string, boolean>
   >({});

   const loadReplies = async (commentId: string) => {
      if (repliesMap[commentId] || loadingReplies[commentId]) return;

      setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
      try {
         const replies = await getCommentReplies(commentId);
         setRepliesMap((prev) => ({ ...prev, [commentId]: replies }));
      } catch (error) {
         console.error("Error loading replies:", error);
      } finally {
         setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
      }
   };

   const handleReply = async (commentId: string, content: string) => {
      await onReply(commentId, content);
      setReplyingTo(null);
      // Reload replies
      if (repliesMap[commentId]) {
         await loadReplies(commentId);
      }
   };

   if (comments.length === 0) {
      return (
         <section className="flex flex-col items-center justify-center gap-4 mt-6 text-sm text-center tracking-tight font-medium text-zinc-600">
            <Image
               src="/doodles/SitReadingDoodle.svg"
               alt="No Comments"
               width={128}
               height={128}
            />
            <p className="max-w-sm mx-auto">
               {emptyMessage ||
                  "Zeje to tu prázdnotou. Možná je čas být prvním, co se na to podívá?"}
            </p>
         </section>
      );
   }

   return (
      <section className="space-y-6">
         {comments.map((comment) => (
            <div key={comment.id}>
               <CommentItem
                  comment={comment}
                  isAuthenticated={isAuthenticated}
                  onRate={onRate}
                  onReply={(commentId) => {
                     setReplyingTo(commentId);
                     loadReplies(commentId);
                  }}
                  onReport={onReport}
                  canDelete={canDeleteComments}
                  onDelete={onDelete}
                  replies={
                     comment.repliesCount > 0 && (
                        <div className="space-y-4">
                           {repliesMap[comment.id]?.map((reply) => (
                              <CommentItem
                                 key={reply.id}
                                 comment={reply}
                                 isAuthenticated={isAuthenticated}
                                 onRate={onRate}
                                 onReply={() => {}}
                                 onReport={onReport}
                                 canDelete={canDeleteComments}
                                 onDelete={onDelete}
                              />
                           ))}
                           {loadingReplies[comment.id] && (
                              <p className="text-sm text-zinc-500">
                                 Načítání odpovědí...
                              </p>
                           )}
                        </div>
                     )
                  }
               />

               {replyingTo === comment.id && isAuthenticated && (
                  <div className="mt-4 ml-12">
                     <CommentInput
                        userAvatar={userAvatar}
                        userName={userName}
                        onSubmit={(content) => handleReply(comment.id, content)}
                        parentId={comment.id}
                        placeholder="Napište odpověď..."
                     />
                  </div>
               )}
            </div>
         ))}

         {hasMore && onLoadMore && (
            <Button
               type="button"
               variant="subtle"
               size="md"
               className="mt-2 tracking-tight cursor-pointer w-full"
               onClick={onLoadMore}
            >
               <RefreshCcw size={14} />
               Zobrazit další komentáře…
            </Button>
         )}
      </section>
   );
}
