"use client";

import { useState } from "react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { CheckCircle, Flag, XCircle } from "lucide-react";
import Button from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import type { Report } from "../types";

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

export function ReportCard({
  report,
  onResolve,
  onDismiss,
}: {
  report: Report;
  onResolve: (reportId: string) => Promise<void> | void;
  onDismiss: (reportId: string) => Promise<void> | void;
}) {
  const [actionLoading, setActionLoading] = useState(false);

  const handleResolve = async () => {
    setActionLoading(true);
    try {
      await onResolve(report.id);
    } catch (actionError) {
      alert(actionError instanceof Error ? actionError.message : "Nastala chyba");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = async () => {
    setActionLoading(true);
    try {
      await onDismiss(report.id);
    } catch (actionError) {
      alert(actionError instanceof Error ? actionError.message : "Nastala chyba");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Card className="p-4!">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Flag size={16} className="text-zinc-400" />
            <Heading variant="h5">
              Report {report.entityType === "comment" ? "komentáře" : "článku"}
            </Heading>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium tracking-tight ${statusColors[report.status]}`}
            >
              {statusLabels[report.status]}
            </span>
          </div>
          <Paragraph size="small" className="mb-2 text-zinc-400">
            Nahlásil: <strong>{report.reporter.name} {report.reporter.surname}</strong>{" "}
            ({report.reporter.email})
          </Paragraph>
          <div className="mb-2 rounded-lg bg-zinc-800/50 p-3">
            <Paragraph size="small" className="text-zinc-300">
              <strong>Důvod:</strong> {report.reason}
            </Paragraph>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>
              Vytvořeno:{" "}
              {format(new Date(report.createdAt), "d.M.yyyy HH:mm", {
                locale: cs,
              })}
            </span>
            {report.reviewedAt && (
              <span>
                Přezkoumáno:{" "}
                {format(new Date(report.reviewedAt), "d.M.yyyy HH:mm", {
                  locale: cs,
                })}
              </span>
            )}
          </div>
        </div>
        {report.status === "pending" && (
          <div className="flex items-center gap-2">
            <Button
              href="#"
              variant="success"
              onClick={handleResolve}
              disabled={actionLoading}
              className="cursor-pointer tracking-tight"
            >
              <CheckCircle size={16} />
              Vyřešit
            </Button>
            <Button
              href="#"
              variant="outline"
              onClick={handleDismiss}
              disabled={actionLoading}
              className="cursor-pointer tracking-tight"
            >
              <XCircle size={16} />
              Zamítnout
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
