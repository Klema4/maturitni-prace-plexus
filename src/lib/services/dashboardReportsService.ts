import { getReportsByStatus } from "@/lib/repositories/reportsRepository";
import { listReportsForModeration, resolveReport } from "@/lib/services/reportsService";

export async function listDashboardReportsService(input: {
  status?: "pending" | "reviewed" | "resolved" | "dismissed" | null;
  limit: number;
  offset: number;
  sortOrder: "newest" | "oldest";
}) {
  if (input.status === "pending" || !input.status) {
    return listReportsForModeration({
      limit: input.limit,
      offset: input.offset,
      sortOrder: input.sortOrder,
    });
  }

  return getReportsByStatus(input.status, {
    limit: input.limit,
    offset: input.offset,
    sortOrder: input.sortOrder,
  });
}

export async function resolveDashboardReportService(input: {
  reportId: string;
  moderatorId: string;
  action: "resolve" | "dismiss";
}) {
  return resolveReport(input.reportId, input.moderatorId, input.action);
}
