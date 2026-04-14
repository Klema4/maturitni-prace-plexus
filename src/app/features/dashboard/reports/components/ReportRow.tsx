"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Flag, MoreHorizontal } from "lucide-react";
import Button from "@/components/ui/dashboard/Button";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import type { Report } from "../types";
import { CommentReportManageModal } from "./CommentReportManageModal";
import { ArticleReportManageModal } from "./ArticleReportManageModal";

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400",
  reviewed: "bg-blue-500/20 text-blue-400",
  resolved: "bg-green-500/20 text-green-400",
  dismissed: "bg-zinc-500/20 text-zinc-400",
} as const;

const statusLabels = {
  pending: "Čeká na přezkoumání",
  reviewed: "Přezkoumáno",
  resolved: "Vyřešeno",
  dismissed: "Zamítnuto",
} as const;

/**
 * Řádek reportu (komentář/článek) s otevřením modalu správy.
 *
 * @param {Object} props - Props komponenty.
 * @param {Report} props.report - Report.
 * @param {(reportId: string) => Promise<void> | void} props.onResolve - Vyřešení reportu.
 * @param {(reportId: string) => Promise<void> | void} props.onDismiss - Zamítnutí reportu.
 * @returns {JSX.Element} Řádek reportu.
 */
export function ReportRow({
  report,
  onResolve,
  onDismiss,
}: {
  report: Report;
  onResolve: (reportId: string) => Promise<void> | void;
  onDismiss: (reportId: string) => Promise<void> | void;
}) {
  const [isManageOpen, setIsManageOpen] = useState(false);

  const createdAtLabel = useMemo(() => {
    return format(new Date(report.createdAt), "d.M.yyyy HH:mm", { locale: cs });
  }, [report.createdAt]);

  return (
    <>
      <div className="flex flex-col gap-2 border-b border-zinc-800/60 py-3 last:border-b-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Flag size={16} className="text-zinc-400" />
              <Heading variant="h6" className="leading-4!">
                Report {report.entityType === "comment" ? "komentáře" : "článku"}
              </Heading>
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium tracking-tight ${statusColors[report.status]}`}
              >
                {statusLabels[report.status]}
              </span>
              <Paragraph size="extrasmall" color="muted">
                {createdAtLabel}
              </Paragraph>
            </div>

            <Paragraph size="small" color="muted" className="truncate">
              Nahlásil:{" "}
              <span className="text-zinc-200 font-semibold">
                {report.reporter.name} {report.reporter.surname}
              </span>{" "}
              ({report.reporter.email})
            </Paragraph>

            <Paragraph size="small" className="mt-2 text-zinc-200">
              <span className="font-semibold">Důvod:</span>{" "}
              {report.reason.length > 220 ? `${report.reason.slice(0, 220)}…` : report.reason}
            </Paragraph>
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

      {report.entityType === "comment" ? (
        <CommentReportManageModal
          isOpen={isManageOpen}
          onClose={() => setIsManageOpen(false)}
          report={report}
          onResolve={onResolve}
          onDismiss={onDismiss}
        />
      ) : (
        <ArticleReportManageModal
          isOpen={isManageOpen}
          onClose={() => setIsManageOpen(false)}
          report={report}
          onResolve={onResolve}
          onDismiss={onDismiss}
        />
      )}
    </>
  );
}

