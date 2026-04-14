"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, FileText, Flag, XCircle } from "lucide-react";
import Button from "@/components/ui/dashboard/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/dashboard/Modal";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { apiFetchOrThrow } from "@/lib/utils/api";
import type { Report } from "../types";

type DashboardArticle = {
  id: string;
  title: string;
  slug: string;
  status?: string;
};

/**
 * Modal správy reportu pro článek.
 * Primárně slouží pro rychlé rozhodnutí reportu + proklik na editaci článku.
 *
 * @param {Object} props - Props komponenty.
 * @param {boolean} props.isOpen - Zda je modal otevřený.
 * @param {() => void} props.onClose - Callback pro zavření.
 * @param {Report} props.report - Report.
 * @param {(reportId: string) => Promise<void> | void} props.onResolve - Vyřešení reportu.
 * @param {(reportId: string) => Promise<void> | void} props.onDismiss - Zamítnutí reportu.
 * @returns {JSX.Element} Modal správy reportu článku.
 */
export function ArticleReportManageModal({
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
  const [article, setArticle] = useState<DashboardArticle | null>(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchArticle = async () => {
      setArticleLoading(true);
      setActionError(null);
      try {
        const response = await apiFetchOrThrow(`/api/dashboard/articles/${report.entityId}`);
        const json = await response.json();
        setArticle((json.article ?? null) as DashboardArticle | null);
      } catch (loadError) {
        setActionError(loadError instanceof Error ? loadError.message : "Nastala chyba");
      } finally {
        setArticleLoading(false);
      }
    };

    void fetchArticle();
  }, [isOpen, report.entityId]);

  const closeAll = () => {
    setLoading(false);
    setActionError(null);
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
      <ModalHeader onClose={closeAll}>Správa reportu (článek)</ModalHeader>
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
          {articleLoading ? (
            <Paragraph size="small" color="muted">
              Načítám článek…
            </Paragraph>
          ) : article ? (
            <>
              <div className="mb-1 flex items-center gap-2">
                <FileText size={16} className="text-zinc-400" />
                <Heading variant="h6">{article.title}</Heading>
              </div>
              <Paragraph size="small" color="muted">
                Slug: <span className="text-zinc-300">{article.slug}</span>
                {article.status ? (
                  <>
                    {" "}
                    · Stav: <span className="text-zinc-300">{article.status}</span>
                  </>
                ) : null}
              </Paragraph>
              <div className="mt-3">
                <Link
                  href={`/dashboard/articles/${article.id}/edit`}
                  className="inline-block text-sm font-medium tracking-tight text-primary hover:underline"
                >
                  Otevřít editaci článku →
                </Link>
              </div>
            </>
          ) : (
            <Paragraph size="small" color="muted">
              Článek se nepodařilo načíst.
            </Paragraph>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button
            href="#"
            variant="success"
            onClick={() => run(() => Promise.resolve(onResolve(report.id)).then(() => {}))}
            disabled={loading}
            className="w-full cursor-pointer justify-start tracking-tight"
          >
            <CheckCircle size={16} />
            Označit report jako vyřešený
          </Button>
          <Button
            href="#"
            variant="outline"
            onClick={() => run(() => Promise.resolve(onDismiss(report.id)).then(() => {}))}
            disabled={loading}
            className="w-full cursor-pointer justify-start tracking-tight"
          >
            <XCircle size={16} />
            Zamítnout report
          </Button>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button
          href="#"
          variant="outline"
          onClick={closeAll}
          className="cursor-pointer tracking-tight"
        >
          Zavřít
        </Button>
      </ModalFooter>
    </Modal>
  );
}

