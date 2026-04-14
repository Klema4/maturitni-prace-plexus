import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { getDashboardUserPermissionsService } from "@/lib/services/dashboardAccessService";
import { getDashboardCommentService } from "@/lib/services/dashboardCommentsService";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ commentId: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const { commentId } = await params;
    if (!z.string().uuid().safeParse(commentId).success) {
      return NextResponse.json(
        { error: "Neplatný formát identifikátoru komentáře" },
        { status: 400 },
      );
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
        { error: "Nemáte oprávnění k zobrazení komentáře" },
        { status: 403 },
      );
    }

    const comment = await getDashboardCommentService(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Komentář nenalezen" }, { status: 404 });
    }

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error fetching dashboard comment:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst komentář" },
      { status: 500 },
    );
  }
}

