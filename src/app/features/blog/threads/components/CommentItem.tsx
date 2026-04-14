"use client";

import { useState, useEffect } from "react";
import { Avatar } from "@/app/components/blog/ui/Avatar";
import { Button } from "@/app/components/blog/ui/Button";
import {
   MessageCircle,
   ThumbsUp,
   ThumbsDown,
   Flag,
   Shield,
   Trash2,
} from "lucide-react";
import { formatPublishedAt } from "@/lib/utils/date";
import type { CommentData } from "@/app/features/threads/types";

/**
 * CommentItem komponenta
 * Zobrazuje jeden komentář s možností lajkování a odpovědi.
 * @param {Object} props - Vlastnosti komponenty.
 * @param {CommentData} props.comment - Data komentáře.
 * @param {boolean} props.isAuthenticated - Zda je uživatel přihlášen.
 * @param {(commentId: string, isLike: boolean) => Promise<void>} props.onRate - Obslužná funkce při hodnocení komentáře.
 * @param {(commentId: string) => void} props.onReply - Obslužná funkce při kliknutí na odpověď.
 * @param {(commentId: string) => void} [props.onReport] - Obslužná funkce při kliknutí na report.
 * @param {React.ReactNode} [props.replies] - Vnořené odpovědi.
 * @returns {JSX.Element} CommentItem komponenta.
 */
export function CommentItem({
   comment,
   isAuthenticated,
   onRate,
   onReply,
   onReport,
   canDelete = false,
   onDelete,
   replies,
}: {
   comment: CommentData;
   isAuthenticated: boolean;
   onRate: (commentId: string, isLike: boolean) => Promise<void>;
   onReply: (commentId: string) => void;
   onReport?: (commentId: string) => void;
   canDelete?: boolean;
   onDelete?: (commentId: string) => Promise<void>;
   replies?: React.ReactNode;
}) {
   const [likesCount, setLikesCount] = useState(comment.likesCount);
   const [dislikesCount, setDislikesCount] = useState(comment.dislikesCount);
   const [userRating, setUserRating] = useState<boolean | null>(
      comment.userRating,
   );
   const [isRating, setIsRating] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [deleteError, setDeleteError] = useState<string | null>(null);

   useEffect(() => {
      setLikesCount(comment.likesCount);
      setDislikesCount(comment.dislikesCount);
      setUserRating(comment.userRating);
   }, [comment.likesCount, comment.dislikesCount, comment.userRating]);

   const handleRate = async (isLike: boolean) => {
      if (!isAuthenticated || isRating) return;

      const previousRating = userRating;
      const newRating = previousRating === isLike ? null : isLike;

      // Optimistic update
      if (previousRating === true && newRating === null) {
         setLikesCount((prev) => Math.max(0, prev - 1));
      } else if (previousRating === false && newRating === null) {
         setDislikesCount((prev) => Math.max(0, prev - 1));
      } else if (previousRating === true && newRating === false) {
         setLikesCount((prev) => Math.max(0, prev - 1));
         setDislikesCount((prev) => prev + 1);
      } else if (previousRating === false && newRating === true) {
         setDislikesCount((prev) => Math.max(0, prev - 1));
         setLikesCount((prev) => prev + 1);
      } else if (previousRating === null && newRating === true) {
         setLikesCount((prev) => prev + 1);
      } else if (previousRating === null && newRating === false) {
         setDislikesCount((prev) => prev + 1);
      }

      setUserRating(newRating);
      setIsRating(true);

      try {
         await onRate(comment.id, isLike);
      } catch (error) {
         // Revert on error
         setLikesCount(comment.likesCount);
         setDislikesCount(comment.dislikesCount);
         setUserRating(previousRating);
         console.error("Error rating comment:", error);
      } finally {
         setIsRating(false);
      }
   };

   const handleDelete = async () => {
      if (!onDelete || isDeleting) return;
      setIsDeleting(true);
      try {
         await onDelete(comment.id);
         setShowDeleteModal(false);
      } catch (error) {
         console.error("Error deleting comment:", error);
         setDeleteError(
            error instanceof Error
               ? error.message
               : "Nepodařilo se smazat komentář",
         );
      } finally {
         setIsDeleting(false);
      }
   };

   const authorName = `${comment.author.name} ${comment.author.surname}`;
   const createdAtDate =
      comment.createdAt instanceof Date
         ? comment.createdAt
         : typeof comment.createdAt === "string"
            ? new Date(comment.createdAt)
            : new Date();
   const updatedAtDate =
      comment.updatedAt instanceof Date
         ? comment.updatedAt
         : typeof comment.updatedAt === "string"
            ? new Date(comment.updatedAt)
            : null;
   const formattedDate = formatPublishedAt(createdAtDate);
   const isEdited =
      comment.editedByAdmin ||
      (updatedAtDate !== null &&
         updatedAtDate.getTime() > createdAtDate.getTime());

   // Formátování data admin editace
   const editedByAdminDate = comment.editedByAdminAt
      ? comment.editedByAdminAt instanceof Date
         ? comment.editedByAdminAt
         : typeof comment.editedByAdminAt === "string"
            ? new Date(comment.editedByAdminAt)
            : null
      : null;
   const formattedAdminEditDate = editedByAdminDate
      ? formatPublishedAt(editedByAdminDate)
      : null;

   return (
      <>
         <article className="flex gap-3">
            <Avatar
               src={comment.author.image || undefined}
               alt={authorName}
               size="md"
            />
            <div className="min-w-0 flex-1">
               <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                     <h6 className="text-md font-semibold tracking-tight text-zinc-800">
                        {authorName}
                     </h6>
                     {comment.isHidden && comment.isModerated && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded tracking-tight">
                           Skryto (moderováno)
                        </span>
                     )}
                     {comment.editedByAdmin && (
                        <span
                           className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded tracking-tight flex items-center gap-1 cursor-help"
                           title={
                              comment.originalContent
                                 ? `Původní obsah: ${comment.originalContent}`
                                 : undefined
                           }
                        >
                           <Shield size={12} />
                           Upraveno administrátorem
                        </span>
                     )}
                  </div>
                  <p className="text-zinc-500 tracking-tight font-medium leading-4 text-sm">
                     {formattedDate}
                     {isEdited && " (upraveno)"}
                  </p>
                  {comment.editedByAdmin && formattedAdminEditDate && (
                     <p className="text-zinc-400 tracking-tight font-medium leading-4 text-xs">
                        Upraveno: {formattedAdminEditDate}
                     </p>
                  )}
               </div>

               <p className="text-md tracking-tight font-medium text-zinc-600 my-2">
                  {comment.content}
               </p>

               <footer className="w-full">
                  <div className="-mx-1 w-full max-w-full overflow-x-auto flex items-center justify-between">
                     <div className="flex min-w-max items-center gap-1 px-1 text-xs font-medium tracking-tight text-zinc-500">
                        <Button
                           type="button"
                           variant="subtle"
                           size="sm"
                           className={`hover:bg-green-300/50! tracking-tight cursor-pointer text-xs! shrink-0 whitespace-nowrap ${userRating === true ? "hover:bg-primary/10! text-primary" : ""
                              }`}
                           disabled={!isAuthenticated || isRating}
                           onClick={() => handleRate(true)}
                        >
                           <ThumbsUp size={14} /> {likesCount}
                        </Button>
                        <Button
                           type="button"
                           variant="subtle"
                           size="sm"
                           className={`hover:bg-red-700/10! tracking-tight cursor-pointer text-xs! shrink-0 whitespace-nowrap ${userRating === false ? "hover:bg-primary/10! text-primary" : ""
                              }`}
                           disabled={!isAuthenticated || isRating}
                           onClick={() => handleRate(false)}
                        >
                           <ThumbsDown size={14} /> {dislikesCount}
                        </Button>
                        {isAuthenticated && (
                           <>
                              {onReport && (
                                 <Button
                                    type="button"
                                    variant="subtleDanger"
                                    size="sm"
                                    className="size-8! p-0! tracking-tight cursor-pointer text-xs! shrink-0 whitespace-nowrap"
                                    onClick={() => onReport(comment.id)}
                                 >
                                    <Flag size={14} />
                                 </Button>
                              )}
                              {canDelete && onDelete && (
                                 <Button
                                    type="button"
                                    variant="subtleDanger"
                                    size="sm"
                                    className="size-8! p-0! tracking-tight cursor-pointer text-xs! shrink-0 whitespace-nowrap"
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={isDeleting}
                                 >
                                    <Trash2 size={14} />
                                 </Button>
                              )}
                           </>
                        )}
                     </div>
                     {isAuthenticated && (
                        <Button
                           type="button"
                           variant="subtle"
                           size="sm"
                           className="tracking-tight cursor-pointer text-xs! shrink-0 whitespace-nowrap"
                           onClick={() => onReply(comment.id)}
                        >
                           <MessageCircle size={14} />
                           {comment.repliesCount > 0 && comment.repliesCount}
                        </Button>
                     )}
                  </div>
               </footer>

               {replies && <div className="mt-4 ml-8 space-y-4">{replies}</div>}
            </div>
         </article>

         {showDeleteModal && (
            <div
               role="button"
               tabIndex={-1}
               aria-label="Zavřít dialog"
               className="fixed inset-0 bg-black/25 flex items-center justify-center z-9999 backdrop-blur-xs transition-opacity duration-200 p-4"
               onClick={(e) => {
                  if (e.target === e.currentTarget && !isDeleting) {
                     setShowDeleteModal(false);
                  }
               }}
               onKeyDown={(e) => {
                  if (
                     (e.key === "Enter" || e.key === " ") &&
                     e.target === e.currentTarget &&
                     !isDeleting
                  ) {
                     e.preventDefault();
                     setShowDeleteModal(false);
                  }
               }}
            >
               <div className="w-full max-w-md bg-white rounded-xl overflow-hidden">
                  <div className="p-6">
                     <h3 className="text-xl font-semibold tracking-tight text-dark leading-7">
                        Smazat komentář
                     </h3>
                     <p className="text-sm text-zinc-600 font-medium tracking-tight mt-2">
                        Opravdu chcete tento komentář smazat? Akci nelze vrátit zpět.
                     </p>
                     {deleteError && (
                        <p className="text-sm text-rose-500 font-medium tracking-tight mt-3">
                           {deleteError}
                        </p>
                     )}
                  </div>

                  <div className="px-6 py-4 border-t border-zinc-200 flex justify-end gap-3">
                     <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={() => {
                           setDeleteError(null);
                           setShowDeleteModal(false);
                        }}
                        disabled={isDeleting}
                        className="tracking-tight cursor-pointer flex-1"
                     >
                        Zrušit
                     </Button>
                     <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="tracking-tight cursor-pointer flex-1"
                     >
                        {isDeleting ? "Mažu..." : "Smazat"}
                     </Button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}
