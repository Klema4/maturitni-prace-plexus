"use client";

import { useState } from "react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import {
  AlertCircle,
  Ban,
  Eye,
  EyeOff,
  Pencil,
  Shield,
  Trash2,
} from "lucide-react";
import Avatar from "@/components/ui/dashboard/Avatar";
import Button from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/dashboard/Modal";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import type { DashboardComment } from "../types";

export function CommentCard({
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
  onEditAsAdmin: (
    commentId: string,
    newContent: string,
  ) => Promise<void> | void;
  onDelete: (commentId: string) => Promise<void> | void;
}) {
  const [showHideModal, setShowHideModal] = useState(false);
  const [hideReason, setHideReason] = useState("");
  const [showBanModal, setShowBanModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editContent, setEditContent] = useState(comment.content);
  const [actionLoading, setActionLoading] = useState(false);

  const authorName = `${comment.author.name} ${comment.author.surname}`;
  const contentExcerpt =
    comment.content.length > 120
      ? `${comment.content.slice(0, 120)}...`
      : comment.content;

  const handleHide = async () => {
    if (!hideReason.trim()) {
      return;
    }

    setActionLoading(true);
    try {
      await onHide(comment.id, hideReason);
      setShowHideModal(false);
      setHideReason("");
    } catch (actionErrorValue) {
      setActionError(
        actionErrorValue instanceof Error
          ? actionErrorValue.message
          : "Nastala chyba",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnhide = async () => {
    setActionLoading(true);
    try {
      await onUnhide(comment.id);
    } catch (actionErrorValue) {
      setActionError(
        actionErrorValue instanceof Error
          ? actionErrorValue.message
          : "Nastala chyba",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = async () => {
    setActionLoading(true);
    try {
      await onBanUser(comment.author.id);
      setShowBanModal(false);
    } catch (actionErrorValue) {
      setActionError(
        actionErrorValue instanceof Error
          ? actionErrorValue.message
          : "Nastala chyba",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAsAdmin = async () => {
    if (!editContent.trim()) {
      return;
    }

    setActionLoading(true);
    try {
      await onEditAsAdmin(comment.id, editContent);
      setShowEditModal(false);
    } catch (actionErrorValue) {
      setActionError(
        actionErrorValue instanceof Error
          ? actionErrorValue.message
          : "Nastala chyba",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await onDelete(comment.id);
      setShowDeleteModal(false);
    } catch (actionErrorValue) {
      setActionError(
        actionErrorValue instanceof Error
          ? actionErrorValue.message
          : "Nastala chyba",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Card padding="compact">
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Avatar
                src={comment.author.image || undefined}
                alt={authorName}
                size="md"
              />
              <div>
                <Heading variant="h5">{authorName}</Heading>
                <Paragraph size="small" className="text-zinc-500">
                  {format(new Date(comment.createdAt), "d.M.yyyy HH:mm", {
                    locale: cs,
                  })}
                </Paragraph>
              </div>
              {comment.isHidden && (
                <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-medium tracking-tight text-yellow-400">
                  Skryto
                </span>
              )}
              {(comment.reportsCount ?? 0) > 0 && (
                <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-medium tracking-tight text-red-400">
                  {comment.reportsCount} reportů
                </span>
              )}
            </div>
            <div className="mb-2 rounded-lg bg-zinc-800/50 p-3">
              <Paragraph size="small" className="text-zinc-300">
                {contentExcerpt}
              </Paragraph>
              {comment.moderationReason && (
                <Paragraph size="small" className="mt-2 text-yellow-400">
                  Důvod moderace: {comment.moderationReason}
                </Paragraph>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
            {comment.isHidden ? (
              <Button
                href="#"
                variant="outline"
                onClick={handleUnhide}
                disabled={actionLoading}
                className="cursor-pointer tracking-tight"
              >
                <Eye size={16} />
                Zobrazit
              </Button>
            ) : (
              <Button
                href="#"
                variant="danger"
                onClick={() => setShowHideModal(true)}
                disabled={actionLoading}
                className="cursor-pointer tracking-tight"
              >
                <EyeOff size={16} />
                Skrýt
              </Button>
            )}
            <Button
              href="#"
              variant="outline"
              onClick={() => setShowBanModal(true)}
              disabled={actionLoading}
              className="cursor-pointer tracking-tight"
            >
              <Ban size={16} />
              Ban
            </Button>
            <Button
              href="#"
              variant="outline"
              onClick={() => {
                setEditContent(comment.content);
                setShowEditModal(true);
              }}
              disabled={actionLoading}
              className="cursor-pointer tracking-tight"
            >
              <Pencil size={16} />
              Upravit
            </Button>
            <Button
              href="#"
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              disabled={actionLoading}
              className="cursor-pointer tracking-tight"
            >
              <Trash2 size={16} />
              Smazat
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        size="md"
      >
        <ModalHeader onClose={() => setShowEditModal(false)}>
          <span className="flex items-center gap-2">
            <Shield size={18} />
            Upravit komentář (admin)
          </span>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Nový obsah
              </label>
              <textarea
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                placeholder="Upravený obsah komentáře..."
                className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 tracking-tight text-zinc-200"
                rows={5}
                maxLength={1000}
              />
              {comment.originalContent && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-zinc-500">
                    Původní obsah
                  </summary>
                  <p className="mt-1 rounded bg-zinc-900 p-2 text-sm text-zinc-400">
                    {comment.originalContent}
                  </p>
                </details>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            href="#"
            variant="outline"
            onClick={() => setShowEditModal(false)}
            className="cursor-pointer tracking-tight"
          >
            Zrušit
          </Button>
          <Button
            href="#"
            variant="primary"
            onClick={handleEditAsAdmin}
            disabled={actionLoading || !editContent.trim()}
            className="cursor-pointer tracking-tight"
          >
            {actionLoading ? "Zpracovávám..." : "Uložit"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showHideModal}
        onClose={() => setShowHideModal(false)}
        size="sm"
      >
        <ModalHeader onClose={() => setShowHideModal(false)}>
          Skrýt komentář
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Důvod skrytí
              </label>
              <textarea
                value={hideReason}
                onChange={(event) => setHideReason(event.target.value)}
                placeholder="Zadejte důvod moderace..."
                className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 tracking-tight text-zinc-200"
                rows={3}
                maxLength={512}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            href="#"
            variant="outline"
            onClick={() => setShowHideModal(false)}
            className="cursor-pointer tracking-tight"
          >
            Zrušit
          </Button>
          <Button
            href="#"
            variant="danger"
            onClick={handleHide}
            disabled={actionLoading || !hideReason.trim()}
            className="cursor-pointer tracking-tight"
          >
            {actionLoading ? "Zpracovávám..." : "Skrýt"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="sm"
      >
        <ModalHeader onClose={() => setShowDeleteModal(false)}>
          Smazat komentář
        </ModalHeader>
        <ModalBody>
          <Paragraph className="text-zinc-200">
            Opravdu chcete tento komentář smazat? Akci nelze vrátit zpět.
          </Paragraph>
        </ModalBody>
        <ModalFooter>
          <Button
            href="#"
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
            className="cursor-pointer tracking-tight"
          >
            Zrušit
          </Button>
          <Button
            href="#"
            variant="danger"
            onClick={handleDelete}
            disabled={actionLoading}
            className="cursor-pointer tracking-tight"
          >
            {actionLoading ? "Zpracovávám..." : "Smazat"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={actionError !== null}
        onClose={() => setActionError(null)}
        size="sm"
      >
        <ModalHeader onClose={() => setActionError(null)}>Chyba</ModalHeader>
        <ModalBody>
          <Paragraph className="text-red-400">{actionError}</Paragraph>
        </ModalBody>
        <ModalFooter>
          <Button
            href="#"
            variant="outline"
            onClick={() => setActionError(null)}
            className="cursor-pointer tracking-tight"
          >
            Zavřít
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        size="sm"
      >
        <ModalHeader onClose={() => setShowBanModal(false)}>
          Zabanovat uživatele
        </ModalHeader>
        <ModalBody>
          <div className="flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-yellow-400" />
            <div>
              <Paragraph className="mb-1 text-zinc-200">
                Opravdu chcete zabanovat uživatele {authorName}?
              </Paragraph>
              <Paragraph size="small" color="muted">
                Zabanovaný uživatel nebude moci komentovat.
              </Paragraph>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            href="#"
            variant="outline"
            onClick={() => setShowBanModal(false)}
            className="cursor-pointer tracking-tight"
          >
            Zrušit
          </Button>
          <Button
            href="#"
            variant="danger"
            onClick={handleBan}
            disabled={actionLoading}
            className="cursor-pointer tracking-tight"
          >
            {actionLoading ? "Zpracovávám..." : "Zabanovat"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
