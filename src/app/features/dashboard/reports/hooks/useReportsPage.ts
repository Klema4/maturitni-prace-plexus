"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listDashboardReports,
  updateDashboardReport,
} from "../api/reports.api";
import type { Report, ReportStatus } from "../types";

export function useReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">(
    "pending",
  );
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [limit] = useState(50);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setReports(
        await listDashboardReports({ status: statusFilter, sortOrder, limit }),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
    } finally {
      setLoading(false);
    }
  }, [limit, sortOrder, statusFilter]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const handleResolve = useCallback(
    async (reportId: string) => {
      await updateDashboardReport(reportId, "resolve");
      await fetchReports();
    },
    [fetchReports],
  );

  const handleDismiss = useCallback(
    async (reportId: string) => {
      await updateDashboardReport(reportId, "dismiss");
      await fetchReports();
    },
    [fetchReports],
  );

  const togglePendingFilter = useCallback(() => {
    setStatusFilter((current) => (current === "pending" ? "all" : "pending"));
  }, []);

  const showPending = useCallback(() => {
    setStatusFilter("pending");
  }, []);

  const showAll = useCallback(() => {
    setStatusFilter("all");
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((current) => (current === "newest" ? "oldest" : "newest"));
  }, []);

  return {
    reports,
    loading,
    error,
    statusFilter,
    sortOrder,
    togglePendingFilter,
    showPending,
    showAll,
    toggleSortOrder,
    handleResolve,
    handleDismiss,
  };
}
