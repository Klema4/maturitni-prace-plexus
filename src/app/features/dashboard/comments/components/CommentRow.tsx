"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { MoreHorizontal } from "lucide-react";
import Avatar from "@/components/ui/dashboard/Avatar";
import Button from "@/components/ui/dashboard/Button";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import type { DashboardComment } from "../types";
import { CommentManageModal } from "./CommentManageModal";

/**
 * Řádek komentáře pro dashboard (autor + truncate obsah + vlákno + správa).
 *
 * @param {Object} props - Props komponenty.
 * @param {DashboardComment} props.comment - Komentář.
 * @param {(commentId: string, reason: string) => Promise<void> | void} props.onHide - Skrytí komentáře.
 * @param {(commentId: string) => Promise<void> | void} props.onUnhide - Zobrazení komentáře.
 * @param {(userId: string) => Promise<void> | void} props.onBanUser - Zabanování autora.
 * @param {(commentId: string, newContent: string) => Promise<void> | void} props.onEditAsAdmin - Admin editace.
 * @param {(commentId: string) => Promise<void> | void} props.onDelete - Smazání komentáře.
 * @returns {JSX.Element} Řádek komentáře.
 */
export function CommentRow({
  comment,
  onHide,
  onUnhide,
  onBanUser,
  onEditAsAdmin,
  onDelete,
}: {
  comment: DashboardComment;
  onHide: (commentId: string, reason: string) => Promise<void> | void;
  onUnhide: (commentId: string) => Promise<void> | void;
  onBanUser: (userId: string) => Promise<void> | void;
  onEditAsAdmin: (commentId: string, newContent: string) => Promise<void> | void;
  onDelete: (commentId: string) => Promise<void> | void;
}) {
  const [isManageOpen, setIsManageOpen] = useState(false);

  const authorName = useMemo(
    () => `${comment.author.name} ${comment.author.surname}`.trim(),
    [comment.author.name, comment.author.surname],
  );

  const createdAtLabel = useMemo(() => {
    return format(new Date(comment.createdAt), "d.M.yyyy HH:mm", { locale: cs });
  }, [comment.createdAt]);

  const contentExcerpt = useMemo(() => {
    const text = comment.content.trim();
    return text.length > 180 ? `${text.slice(0, 180)}…` : text;
  }, [comment.content]);

  const article = comment.thread?.article;

  return (
    <>
      <div className="flex flex-col gap-2 border-b border-zinc-800/60 py-3 last:border-b-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar
              src={comment.author.image || undefined}
              alt={authorName}
              size="xs"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Heading variant="h6" className="leading-4!">
                  {authorName}
                </Heading>
                <Paragraph size="extrasmall" color="muted">
                  {createdAtLabel}
                </Paragraph>
                {comment.isHidden ? (
                  <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-medium tracking-tight text-yellow-400">
                    Skryto
                  </span>
                ) : null}
                {(comment.reportsCount ?? 0) > 0 ? (
                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-medium tracking-tight text-red-400">
                    {comment.reportsCount} reportů
                  </span>
                ) : null}
              </div>

              <Paragraph size="small" className="mt-1 text-zinc-200">
                {contentExcerpt}
              </Paragraph>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium tracking-tight text-zinc-500">
                {article?.id ? (
                  <Link
                    href={`/dashboard/articles/${article.id}/edit`}
                    className="hover:underline"
                  >
                    Vlákno: <span className="text-zinc-300">{article.title}</span>
                  </Link>
                ) : (
                  <span>
                    Vlákno: <span className="text-zinc-300">{comment.threadId}</span>
                  </span>
                )}
                <span>
                  Odpovědi: <span className="text-zinc-300">{comment.repliesCount}</span>
                </span>
              </div>
            </div>
          </div>

          <Button
            href="#"
            variant="outline"
            onClick={() => setIsManageOpen(true)}
            className="shrink-0 cursor-pointer tracking-tight"
          >
            <MoreHorizontal size={16} />
            Správa
          </Button>
        </div>
      </div>

      <CommentManageModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        comment={comment}
        onHide={onHide}
        onUnhide={onUnhide}
        onBanUser={onBanUser}
        onEditAsAdmin={onEditAsAdmin}
        onDelete={onDelete}
      />
    </>
  );
}

