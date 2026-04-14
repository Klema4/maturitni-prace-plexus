"use client";

import { ArrowUpDown, Filter, MessageSquare } from "lucide-react";
import NoData from "@/components/ui/dashboard/NoData";
import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import { Card } from "@/components/ui/dashboard/Card";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { ReportRow } from "./components/ReportRow";
import { useReportsPage } from "./hooks/useReportsPage";

export default function ReportsPage() {
  const {
    reports,
    loading,
    error,
    statusFilter,
    sortOrder,
    showPending,
    showAll,
    toggleSortOrder,
    handleResolve,
    handleDismiss,
  } = useReportsPage();

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Reporty</Heading>
          <Paragraph>Přehled nahlášených komentářů a článků.</Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám reporty...</Paragraph>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Reporty</Heading>
          <Paragraph>Přehled nahlášených komentářů a článků.</Paragraph>
        </header>
        <div className="mt-4">
          <Paragraph color="muted" className="text-red-400">
            {error}
          </Paragraph>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <Heading variant="h1">Reporty</Heading>
        <Paragraph>Přehled nahlášených komentářů a článků.</Paragraph>
      </header>
      <QuickOptions
        options={[
          {
            label: "Čekající",
            variant: statusFilter === "pending" ? "primary" : "outline",
            icon: Filter,
            onClick: showPending,
          },
          {
            label: "Vše",
            variant: statusFilter === "all" ? "primary" : "outline",
            icon: Filter,
            onClick: showAll,
          },
          {
            label: sortOrder === "newest" ? "Nejnovější" : "Nejstarší",
            variant: "outline",
            icon: ArrowUpDown,
            onClick: toggleSortOrder,
          },
          {
            label: "Moderace komentářů",
            variant: "secondary",
            icon: MessageSquare,
            link: "/dashboard/comments",
          },
        ]}
      />
      <div className="mt-2">
        <Paragraph size="small" color="muted">
          Zobrazuji <strong className="text-zinc-200">{reports.length}</strong>{" "}
          {reports.length === 1 ? "report" : reports.length > 1 && reports.length < 5 ? "reporty" : "reportů"}
          {statusFilter === "pending" ? " (čekající)" : ""} ·{" "}
          {sortOrder === "newest" ? "od nejnovějších" : "od nejstarších"}
        </Paragraph>
      </div>
      <section className="mt-4">
        <Card padding="compact">
          {reports.length === 0 ? (
            <NoData />
          ) : (
            <div className="p-2 lg:p-3">
              {reports.map((report) => (
                <ReportRow
                  key={report.id}
                  report={report}
                  onResolve={handleResolve}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          )}
        </Card>
      </section>
    </>
  );
}
