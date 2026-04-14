import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCommentsForModerationService } from "@/lib/services/commentsService";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { getDashboardUserPermissionsService } from "@/lib/services/dashboardAccessService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const userPermissions = await getDashboardUserPermissionsService(
      session.user.id,
    );
    if (
      !hasPermission(userPermissions, PERMISSIONS.COMMENTS_MODERATE) &&
      !hasPermission(userPermissions, PERMISSIONS.COMMENTS_VIEW)
    ) {
      return NextResponse.json(
        { error: "Nemáte oprávnění k zobrazení komentářů pro moderaci" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const comments = await getCommentsForModerationService({
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
      includeHidden: searchParams.get("includeHidden") !== "false",
      includeModerated: searchParams.get("includeModerated") !== "false",
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments for moderation:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst komentáře pro moderaci" },
      { status: 500 },
    );
  }
}
