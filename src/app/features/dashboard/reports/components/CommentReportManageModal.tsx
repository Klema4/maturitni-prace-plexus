"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Ban, CheckCircle, Eye, EyeOff, Flag, Pencil, Trash2, XCircle } from "lucide-react";
import Button from "@/components/ui/dashboard/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/dashboard/Modal";
import { Textarea } from "@/components/ui/dashboard/Inputs";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { apiFetchOrThrow } from "@/lib/utils/api";
import type { Report } from "../types";
import type { DashboardComment } from "../../comments/types";
import {
  banCommentAuthor,
  deleteComment,
  editCommentAsAdmin,
  hideComment,
  unhideComment,
} from "../../comments/api/comments.api";

type View = "menu" | "hide" | "edit" | "ban" | "delete";

/**
 * Modal správy reportu pro komentář.
 * Umožní moderovat komentář a zároveň vyřešit/zamítnout report.
 *
 * @param {Object} props - Props komponenty.
 * @param {boolean} props.isOpen - Zda je modal otevřený.
 * @param {() => void} props.onClose - Callback pro zavření.
 * @param {Report} props.report - Report.
 * @param {(reportId: string) => Promise<void> | void} props.onResolve - Vyřešení reportu.
 * @param {(reportId: string) => Promise<void> | void} props.onDismiss - Zamítnutí reportu.
 * @returns {JSX.Element} Modal správy reportu komentáře.
 */
export function CommentReportManageModal({
  isOpen,
  onClose,
  report,
  onResolve,
  onDismiss,
}: {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
  onResolve: (reportId: string) => Promise<void> | void;
  onDismiss: (reportId: string) => Promise<void> | void;
}) {
  const [comment, setComment] = useState<DashboardComment | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [hideReason, setHideReason] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchComment = async () => {
      setCommentLoading(true);
      setActionError(null);
      try {
        const response = await apiFetchOrThrow(`/api/dashboard/comments/${report.entityId}`);
        const json = await response.json();
        setComment((json.comment ?? null) as DashboardComment | null);
        setEditContent(((json.comment?.content ?? "") as string) || "");
      } catch (loadError) {
        setActionError(loadError instanceof Error ? loadError.message : "Nastala chyba");
      } finally {
        setCommentLoading(false);
      }
    };

    void fetchComment();
  }, [isOpen, report.entityId]);

  const authorName = useMemo(() => {
    if (!comment) return "";
    return `${comment.author.name} ${comment.author.surname}`.trim();
  }, [comment]);

  const article = comment?.thread?.article;

  const closeAll = () => {
    setView("menu");
    setLoading(false);
    setActionError(null);
    setHideReason("");
    onClose();
  };

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    setActionError(null);
    try {
      await fn();
      closeAll();
    } catch (actionErrorValue) {
      setActionError(actionErrorValue instanceof Error ? actionErrorValue.message : "Nastala chyba");
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeAll} size="md">
      <ModalHeader onClose={closeAll}>Správa reportu (komentář)</ModalHeader>
      <ModalBody className="space-y-4">
        <div className="rounded-lg bg-zinc-800/50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Flag size={16} className="text-zinc-400" />
            <Heading variant="h6">Důvod reportu</Heading>
          </div>
          <Paragraph size="small" className="text-zinc-200">
            {report.reason}
          </Paragraph>
          <Paragraph size="extrasmall" color="muted" className="mt-2">
            Nahlásil: {report.reporter.name} {report.reporter.surname} ({report.reporter.email})
          </Paragraph>
        </div>

        {actionError ? (
          <div className="flex items-start gap-3 rounded-lg bg-rose-500/10 p-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-400" />
            <Paragraph className="text-rose-300">{actionError}</Paragraph>
          </div>
        ) : null}

        <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/30 p-3">
          {commentLoading ? (
            <Paragraph size="small" color="muted">
              Načítám komentář…
            </Paragraph>
          ) : comment ? (
            <>
              <Heading variant="h6" className="mb-1">
                {authorName}
              </Heading>
              <Paragraph size="small" className="text-zinc-200">
                {comment.content.length > 240 ? `${comment.content.slice(0, 240)}…` : comment.content}
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
                    Vlákno: <span className="text-zinc-300">{report.entityId}</span>
                  </span>
                )}
                {(comment.reportsCount ?? 0) > 0 ? (
                  <span>
                    Pending reporty: <span className="text-zinc-300">{comment.reportsCount}</span>
                  </span>
                ) : null}
                {comment.isHidden ? (
                  <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-medium tracking-tight text-yellow-400">
                    Skryto
                  </span>
                ) : null}
              </div>
            </>
          ) : (
            <Paragraph size="small" color="muted">
              Komentář se nepodařilo načíst.
            </Paragraph>
          )}
        </div>

        {view === "menu" ? (
          <div className="space-y-2">
            {comment?.isHidden ? (
              <Button
                href="#"
                variant="outline"
                onClick={() => comment && run(() => Promise.resolve(unhideComment(comment.id)))}
                disabled={loading || !comment}
                className="py-3 justify-center w-full cursor-pointer tracking-tight"
              >
                <Eye size={16} />
                Zobrazit komentář
              </Button>
            ) : (
              <Button
                href="#"
                variant="danger"
                onClick={() => setView("hide")}
                disabled={loading || !comment}
                className="py-3 justify-center w-full cursor-pointer tracking-tight"
              >
                <EyeOff size={16} />
                Skrýt komentář
              </Button>
            )}

            <Button
              href="#"
              variant="outline"
              onClick={() => setView("edit")}
              disabled={loading || !comment}
              className="py-3 justify-center w-full cursor-pointer tracking-tight"
            >
              <Pencil size={16} />
              Upravit obsah
            </Button>

            <Button
              href="#"
              variant="outline"
              onClick={() => setView("ban")}
              disabled={loading || !comment}
              className="py-3 justify-center w-full cursor-pointer tracking-tight"
            >
              <Ban size={16} />
              Zabanovat autora
            </Button>

            <Button
              href="#"
              variant="danger"
              onClick={() => setView("delete")}
              disabled={loading || !comment}
              className="py-3 justify-center w-full cursor-pointer tracking-tight"
            >
              <Trash2 size={16} />
              Smazat komentář
            </Button>

            <div className="mt-4 grid grid-cols-1 gap-2 border-t border-zinc-800/60 pt-4">
              <Button
                href="#"
                variant="success"
                onClick={() => run(() => Promise.resolve(onResolve(report.id)).then(() => {}))}
                disabled={loading}
                className="py-3 justify-center w-full cursor-pointer tracking-tight"
              >
                <CheckCircle size={16} />
                Označit report jako vyřešený
              </Button>
              <Button
                href="#"
                variant="outline"
                onClick={() => run(() => Promise.resolve(onDismiss(report.id)).then(() => {}))}
                disabled={loading}
                className="py-3 justify-center w-full cursor-pointer tracking-tight"
              >
                <XCircle size={16} />
                Zamítnout report
              </Button>
            </div>
          </div>
        ) : null}

        {view === "hide" ? (
          <Textarea
            label="Důvod moderace"
            value={hideReason}
            onChange={(event) => setHideReason(event.target.value)}
            placeholder="Zadejte důvod skrytí…"
            rows={3}
            maxLength={512}
          />
        ) : null}

        {view === "edit" ? (
          <Textarea
            label="Nový obsah"
            value={editContent}
            onChange={(event) => setEditContent(event.target.value)}
            placeholder="Upravený obsah komentáře…"
            rows={5}
            maxLength={1000}
          />
        ) : null}

        {view === "ban" ? (
          <div className="flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-yellow-400" />
            <div className="space-y-1">
              <Paragraph className="text-zinc-200">
                Opravdu chcete zabanovat uživatele <strong>{authorName}</strong>?
              </Paragraph>
              <Paragraph size="small" color="muted">
                Zabanovaný uživatel nebude moci komentovat.
              </Paragraph>
            </div>
          </div>
        ) : null}

        {view === "delete" ? (
          <div className="flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-400" />
            <Paragraph className="text-zinc-200">
              Opravdu chcete tento komentář smazat? Akci nelze vrátit zpět.
            </Paragraph>
          </div>
        ) : null}
      </ModalBody>

      <ModalFooter>
        {view === "menu" ? (
          <Button href="#" variant="outline" onClick={closeAll} className="cursor-pointer tracking-tight">
            Zavřít
          </Button>
        ) : (
          <div className="flex w-full justify-end gap-2">
            <Button
              href="#"
              variant="outline"
              onClick={() => setView("menu")}
              disabled={loading}
              className="cursor-pointer tracking-tight"
            >
              Zpět
            </Button>

            {view === "hide" && comment ? (
              <Button
                href="#"
                variant="danger"
                onClick={() => run(() => Promise.resolve(hideComment(comment.id, hideReason.trim())).then(() => {}))}
                disabled={loading || !hideReason.trim()}
                className="cursor-pointer tracking-tight"
              >
                {loading ? "Zpracovávám…" : "Skrýt"}
              </Button>
            ) : null}

            {view === "edit" && comment ? (
              <Button
                href="#"
                variant="primary"
                onClick={() => run(() => Promise.resolve(editCommentAsAdmin(comment.id, editContent.trim())).then(() => {}))}
                disabled={loading || !editContent.trim()}
                className="cursor-pointer tracking-tight"
              >
                {loading ? "Zpracovávám…" : "Uložit"}
              </Button>
            ) : null}

            {view === "ban" && comment ? (
              <Button
                href="#"
                variant="danger"
                onClick={() => run(() => Promise.resolve(banCommentAuthor(comment.author.id)).then(() => {}))}
                disabled={loading}
                className="cursor-pointer tracking-tight"
              >
                {loading ? "Zpracovávám…" : "Zabanovat"}
              </Button>
            ) : null}

            {view === "delete" && comment ? (
              <Button
                href="#"
                variant="danger"
                onClick={() => run(() => Promise.resolve(deleteComment(comment.id)).then(() => {}))}
                disabled={loading}
                className="cursor-pointer tracking-tight"
              >
                {loading ? "Zpracovávám…" : "Smazat"}
              </Button>
            ) : null}
          </div>
        )}
      </ModalFooter>
    </Modal>
  );
}

