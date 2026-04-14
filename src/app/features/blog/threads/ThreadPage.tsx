"use client";

import { useState } from "react";
import { ThreadHeader } from "@/app/features/threads/components/ThreadHeader";
import { CommentTabs } from "@/app/features/threads/components/CommentTabs";
import { CommentInput } from "@/app/features/threads/components/CommentInput";
import { CommentList } from "@/app/features/threads/components/CommentList";
import { ReportDialog } from "@/app/features/threads/components/ReportDialog";
import {
   SelectDropdown,
   type SortOrder,
} from "@/app/components/blog/ui/Dropdown";
import { useThreadPage } from "@/app/features/threads/hooks/useThreadPage";
import Image from "next/image";
import type { ThreadPageProps } from "@/app/features/threads/types";

/**
 * ThreadPage komponenta
 * Hlavní komponenta pro zobrazení threadu s komentáři.
 * Používá hook useThreadPage pro správu stavu a logiky.
 * @param {ThreadPageProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} ThreadPage komponenta.
 */
export default function ThreadPage({
   threadId,
   initialThread,
}: ThreadPageProps) {
   const [reportingCommentId, setReportingCommentId] = useState<string | null>(
      null,
   );
   const {
      activeTab,
      setActiveTab,
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
   } = useThreadPage(threadId, initialThread?.article.title || null);

   const handleReportClick = (commentId: string) => {
      setReportingCommentId(commentId);
   };

   const handleReportSubmit = async (reason: string) => {
      if (!reportingCommentId) return;
      await handleReport(reportingCommentId, reason);
      setReportingCommentId(null);
   };

   return (
      <>
         <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
            <ThreadHeader articleTitle={articleTitle} />

            <div className="flex flex-wrap items-center justify-between mb-4">
               <CommentTabs activeTab={activeTab} onTabChange={setActiveTab} />
               <div className="flex justify-end my-4">
                  <SelectDropdown<SortOrder>
                     value={sortOrder}
                     onChange={(value) => setSortOrder(value as SortOrder)}
                     options={[
                        { value: "best", label: "Nejlepší" },
                        { value: "newest", label: "Nejnovější" },
                        { value: "oldest", label: "Nejstarší" },
                     ]}
                     placeholder="Vyberte řazení"
                  />
               </div>
            </div>

            {activeTab === "comments" ? (
               <>
                  {isAuthenticated && user && (
                     <CommentInput
                        userAvatar={user.image}
                        userName={user.name}
                        onSubmit={handleAddComment}
                     />
                  )}

                  {loading ? (
                     <section className="flex flex-col items-center justify-center gap-4 mt-6 text-sm text-center tracking-tight font-medium text-zinc-600">
                        <Image
                           src="/doodles/SitReadingDoodle.svg"
                           alt="No Comments"
                           width={128}
                           height={128}
                        />
                        <p>Komentáře se ještě načítají...</p>
                     </section>
                  ) : (
                     <CommentList
                        comments={comments}
                        isAuthenticated={isAuthenticated}
                        userAvatar={user?.image || null}
                        userName={user?.name || "Uživatel"}
                        onRate={handleRate}
                        onReply={handleReply}
                        onReport={handleReportClick}
                        canDeleteComments={canDeleteComments}
                        onDelete={handleDeleteComment}
                        onLoadMore={hasMore ? handleLoadMore : undefined}
                        hasMore={hasMore}
                     />
                  )}
               </>
            ) : (
               <>
                  {loading ? (
                     <section className="flex flex-col items-center justify-center gap-4 mt-6 text-sm text-center tracking-tight font-medium text-zinc-600">
                        <Image
                           src="/doodles/SitReadingDoodle.svg"
                           alt="No Comments"
                           width={128}
                           height={128}
                        />
                        <p>Komentáře se ještě načítají...</p>
                     </section>
                  ) : (
                     <CommentList
                        comments={comments}
                        isAuthenticated={isAuthenticated}
                        userAvatar={user?.image || null}
                        userName={user?.name || "Uživatel"}
                        onRate={handleRate}
                        onReply={handleReply}
                        onReport={handleReportClick}
                        canDeleteComments={canDeleteComments}
                        onDelete={handleDeleteComment}
                        onLoadMore={hasMore ? handleLoadMore : undefined}
                        hasMore={hasMore}
                        emptyMessage={
                           isAuthenticated
                              ? "Žádné komentáře jste ještě nevytvořili. Jakmile něco napíšete, zobrazí se tady."
                              : "Pro zobrazení vašich komentářů se musíte přihlásit."
                        }
                     />
                  )}
               </>
            )}
         </div>

         <ReportDialog
            isOpen={reportingCommentId !== null}
            onClose={() => setReportingCommentId(null)}
            onSubmit={handleReportSubmit}
            entityType="comment"
         />

         {actionError && (
            <div
               role="button"
               tabIndex={-1}
               aria-label="Zavřít dialog"
               className="fixed inset-0 bg-black/25 flex items-center justify-center z-9999 backdrop-blur-xs transition-opacity duration-200 p-4"
               onClick={(e) => {
                  if (e.target === e.currentTarget) {
                     clearActionError();
                  }
               }}
               onKeyDown={(e) => {
                  if (
                     (e.key === "Enter" || e.key === " ") &&
                     e.target === e.currentTarget
                  ) {
                     e.preventDefault();
                     clearActionError();
                  }
               }}
            >
               <div className="w-full max-w-md bg-white rounded-xl overflow-hidden">
                  <div className="p-6">
                     <h3 className="text-xl font-semibold tracking-tight text-dark leading-7">
                        Chyba
                     </h3>
                     <p className="text-sm text-rose-500 font-medium tracking-tight mt-2">
                        {actionError}
                     </p>
                  </div>
                  <div className="px-6 py-4 border-t border-zinc-200 flex justify-end gap-3">
                     <button
                        type="button"
                        onClick={clearActionError}
                        className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium tracking-tight text-zinc-700 hover:bg-zinc-50 transition-colors"
                     >
                        Zavřít
                     </button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}
