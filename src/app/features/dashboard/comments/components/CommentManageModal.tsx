"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Ban, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/dashboard/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/dashboard/Modal";
import { Textarea } from "@/components/ui/dashboard/Inputs";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import type { DashboardComment } from "../types";

type ModalView = "menu" | "hide" | "edit" | "ban" | "delete";

/**
 * Modal správy komentáře v dashboardu.
 * Zobrazuje menu velkých akcí a uvnitř modalu řeší potvrzení / inputy.
 *
 * @param {Object} props - Props komponenty.
 * @param {boolean} props.isOpen - Zda je modal otevřený.
 * @param {() => void} props.onClose - Callback pro zavření modalu.
 * @param {DashboardComment} props.comment - Komentář.
 * @param {(commentId: string, reason: string) => Promise<void> | void} props.onHide - Skrytí komentáře.
 * @param {(commentId: string) => Promise<void> | void} props.onUnhide - Zobrazení komentáře.
 * @param {(userId: string) => Promise<void> | void} props.onBanUser - Zabanování autora.
 * @param {(commentId: string, newContent: string) => Promise<void> | void} props.onEditAsAdmin - Admin editace.
 * @param {(commentId: string) => Promise<void> | void} props.onDelete - Smazání komentáře.
 * @returns {JSX.Element} Modal správy komentáře.
 */
export function CommentManageModal({
  isOpen,
  onClose,
  comment,
  onHide,
  onUnhide,
  onBanUser,
  onEditAsAdmin,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  comment: DashboardComment;
  onHide: (commentId: string, reason: string) => Promise<void> | void;
  onUnhide: (commentId: string) => Promise<void> | void;
  onBanUser: (userId: string) => Promise<void> | void;
  onEditAsAdmin: (commentId: string, newContent: string) => Promise<void> | void;
  onDelete: (commentId: string) => Promise<void> | void;
}) {
  const [view, setView] = useState<ModalView>("menu");
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [hideReason, setHideReason] = useState("");
  const [editContent, setEditContent] = useState(comment.content);

  const authorName = useMemo(
    () => `${comment.author.name} ${comment.author.surname}`.trim(),
    [comment.author.name, comment.author.surname],
  );

  const resetLocalState = () => {
    setView("menu");
    setActionError(null);
    setHideReason("");
    setEditContent(comment.content);
    setLoading(false);
  };

  const handleClose = () => {
    resetLocalState();
    onClose();
  };

  const runAction = async (fn: () => Promise<void>) => {
    setLoading(true);
    setActionError(null);
    try {
      await fn();
      handleClose();
    } catch (actionErrorValue) {
      setActionError(
        actionErrorValue instanceof Error ? actionErrorValue.message : "Nastala chyba",
      );
      setLoading(false);
    }
  };

  const title =
    view === "menu"
      ? "Správa komentáře"
      : view === "hide"
        ? comment.isHidden
          ? "Zobrazit komentář"
          : "Skrýt komentář"
        : view === "edit"
          ? "Upravit komentář"
          : view === "ban"
            ? "Zabanovat uživatele"
            : "Smazat komentář";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalHeader onClose={handleClose}>{title}</ModalHeader>
      <ModalBody className="space-y-4">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/30 p-3">
          <Heading variant="h6" className="mb-1">
            {authorName}
          </Heading>
          <Paragraph size="small" color="muted">
            {comment.thread?.article?.title
              ? `Vlákno: ${comment.thread.article.title}`
              : `Vlákno: ${comment.threadId}`}
          </Paragraph>
        </div>

        {actionError ? (
          <div className="flex items-start gap-3 rounded-lg bg-rose-500/10 p-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-400" />
            <Paragraph className="text-rose-300">{actionError}</Paragraph>
          </div>
        ) : null}

        {view === "menu" ? (
          <div className="space-y-2">
            {comment.isHidden ? (
              <Button
                href="#"
                variant="outline"
                onClick={() => runAction(() => Promise.resolve(onUnhide(comment.id)).then(() => {}))}
                disabled={loading}
                className="w-full cursor-pointer justify-start tracking-tight"
              >
                <Eye size={16} />
                Zobrazit komentář
              </Button>
            ) : (
              <Button
                href="#"
                variant="danger"
                onClick={() => setView("hide")}
                disabled={loading}
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
              disabled={loading}
              className="py-3 justify-center w-full cursor-pointer tracking-tight"
            >
              <Pencil size={16} />
              Upravit obsah
            </Button>
            <Button
              href="#"
              variant="outline"
              onClick={() => setView("ban")}
              disabled={loading}
              className="py-3 justify-center w-full cursor-pointer tracking-tight"
            >
              <Ban size={16} />
              Zabanovat autora
            </Button>
            <Button
              href="#"
              variant="danger"
              onClick={() => setView("delete")}
              disabled={loading}
              className="py-3 justify-center w-full cursor-pointer tracking-tight"
            >
              <Trash2 size={16} />
              Smazat komentář
            </Button>
          </div>
        ) : null}

        {view === "hide" ? (
          <div className="space-y-3">
            <Textarea
              label="Důvod moderace"
              value={hideReason}
              onChange={(event) => setHideReason(event.target.value)}
              placeholder="Zadejte důvod skrytí…"
              rows={3}
              maxLength={512}
            />
          </div>
        ) : null}

        {view === "edit" ? (
          <div className="space-y-3">
            <Textarea
              label="Nový obsah"
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
              placeholder="Upravený obsah komentáře…"
              rows={5}
              maxLength={1000}
            />
            {comment.originalContent ? (
              <details>
                <summary className="cursor-pointer text-xs font-medium tracking-tight text-zinc-500">
                  Původní obsah
                </summary>
                <div className="mt-2 rounded-lg bg-zinc-900/60 p-3">
                  <Paragraph size="small" color="muted">
                    {comment.originalContent}
                  </Paragraph>
                </div>
              </details>
            ) : null}
          </div>
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
            <div className="space-y-1">
              <Paragraph className="text-zinc-200">
                Opravdu chcete tento komentář smazat? Akci nelze vrátit zpět.
              </Paragraph>
            </div>
          </div>
        ) : null}
      </ModalBody>

      <ModalFooter>
        {view === "menu" ? (
          <Button
            href="#"
            variant="outline"
            onClick={handleClose}
            className="cursor-pointer tracking-tight"
          >
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

            {view === "hide" ? (
              <Button
                href="#"
                variant="danger"
                onClick={() =>
                  runAction(() =>
                    Promise.resolve(onHide(comment.id, hideReason.trim())).then(() => {}),
                  )
                }
                disabled={loading || !hideReason.trim()}
                className="cursor-pointer tracking-tight"
              >
                {loading ? "Zpracovávám…" : "Skrýt"}
              </Button>
            ) : null}

            {view === "edit" ? (
              <Button
                href="#"
                variant="primary"
                onClick={() =>
                  runAction(() =>
                    Promise.resolve(onEditAsAdmin(comment.id, editContent.trim())).then(() => {}),
                  )
                }
                disabled={loading || !editContent.trim()}
                className="cursor-pointer tracking-tight"
              >
                {loading ? "Zpracovávám…" : "Uložit"}
              </Button>
            ) : null}

            {view === "ban" ? (
              <Button
                href="#"
                variant="danger"
                onClick={() =>
                  runAction(() =>
                    Promise.resolve(onBanUser(comment.author.id)).then(() => {}),
                  )
                }
                disabled={loading}
                className="cursor-pointer tracking-tight"
              >
                {loading ? "Zpracovávám…" : "Zabanovat"}
              </Button>
            ) : null}

            {view === "delete" ? (
              <Button
                href="#"
                variant="danger"
                onClick={() =>
                  runAction(() => Promise.resolve(onDelete(comment.id)).then(() => {}))
                }
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

