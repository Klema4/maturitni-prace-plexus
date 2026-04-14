import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { getDashboardUserPermissionsService } from "@/lib/services/dashboardAccessService";
import {
  listDashboardReportsService,
  resolveDashboardReportService,
} from "@/lib/services/dashboardReportsService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const userPermissions = await getDashboardUserPermissionsService(
      session.user.id,
    );
    if (!hasPermission(userPermissions, PERMISSIONS.REPORTS_VIEW)) {
      return NextResponse.json(
        { error: "Nemáte oprávnění k zobrazení reportů" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const reports = await listDashboardReportsService({
      status: searchParams.get("status") as
        | "pending"
        | "reviewed"
        | "resolved"
        | "dismissed"
        | null,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
      sortOrder:
        (searchParams.get("sortOrder") as "newest" | "oldest") || "newest",
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst reporty" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const userPermissions = await getDashboardUserPermissionsService(
      session.user.id,
    );
    if (!hasPermission(userPermissions, PERMISSIONS.REPORTS_MANAGE)) {
      return NextResponse.json(
        { error: "Nemáte oprávnění k řešení reportů" },
        { status: 403 },
      );
    }

    const body = await request.json();
    if (!body?.reportId || !body?.action || !["resolve", "dismiss"].includes(body.action)) {
      return NextResponse.json(
        { error: "Neplatná data pro řešení reportu" },
        { status: 400 },
      );
    }

    const report = await resolveDashboardReportService({
      reportId: body.reportId,
      moderatorId: session.user.id,
      action: body.action,
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error resolving report:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nepodařilo se vyřešit report",
      },
      { status: 500 },
    );
  }
}
