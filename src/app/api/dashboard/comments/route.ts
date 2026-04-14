import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { getDashboardUserPermissionsService } from "@/lib/services/dashboardAccessService";
import { listDashboardCommentsService } from "@/lib/services/dashboardCommentsService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const userPermissions = await getDashboardUserPermissionsService(session.user.id);
    if (
      !hasAnyPermission(
        userPermissions,
        PERMISSIONS.COMMENTS_VIEW,
        PERMISSIONS.COMMENTS_MODERATE,
      )
    ) {
      return NextResponse.json(
        { error: "Nemáte oprávnění k zobrazení komentářů" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const query = searchParams.get("q") || undefined;

    const { items, total } = await listDashboardCommentsService({ limit, offset, query });
    return NextResponse.json({ comments: items, total });
  } catch (error) {
    console.error("Error fetching dashboard comments:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst komentáře" },
      { status: 500 },
    );
  }
}

