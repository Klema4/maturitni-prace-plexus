export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export interface Report {
  id: string;
  reporterId: string;
  entityType: "comment" | "article";
  entityId: string;
  reason: string;
  status: ReportStatus;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  reporter: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
  reviewer: {
    id: string;
    name: string;
    surname: string;
    email: string;
  } | null;
}
