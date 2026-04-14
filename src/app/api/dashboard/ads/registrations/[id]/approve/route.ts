import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  approveOrganizationApplicationService,
  OrganizationApplicationInvalidStateError,
  OrganizationApplicationNotFoundError,
} from "@/lib/services/adsService";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { getDashboardUserPermissionsService } from "@/lib/services/dashboardAccessService";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const userPermissions = await getDashboardUserPermissionsService(
      session.user.id,
    );
    if (!hasPermission(userPermissions, PERMISSIONS.ADS_ORGS_MANAGE)) {
      return NextResponse.json(
        { error: "Nemáte oprávnění k správě firemních registrací" },
        { status: 403 },
      );
    }

    const params = await context.params;
    const application = await approveOrganizationApplicationService(
      params.id,
      session.user.id,
    );

    return NextResponse.json({ application });
  } catch (error) {
    if (error instanceof OrganizationApplicationNotFoundError) {
      return NextResponse.json({ error: "Žádost nenalezena" }, { status: 404 });
    }
    if (error instanceof OrganizationApplicationInvalidStateError) {
      return NextResponse.json(
        { error: "Žádost není ve stavu pro schválení" },
        { status: 409 },
      );
    }

    console.error("Error approving organization application:", error);
    return NextResponse.json(
      { error: "Nepodařilo se schválit žádost" },
      { status: 500 },
    );
  }
}
