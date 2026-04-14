import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  rejectOrganizationApplicationService,
  OrganizationApplicationInvalidStateError,
  OrganizationApplicationNotFoundError,
} from "@/lib/services/adsService";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { getDashboardUserPermissionsService } from "@/lib/services/dashboardAccessService";
import { ReviewOrganizationApplicationSchema } from "@/lib/schemas/organizationApplicationsSchema";

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

    const validatedBody = ReviewOrganizationApplicationSchema.safeParse(
      await request.json(),
    );
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: "Neplatná data", details: validatedBody.error.issues },
        { status: 400 },
      );
    }

    const params = await context.params;
    const application = await rejectOrganizationApplicationService(
      params.id,
      session.user.id,
      validatedBody.data,
    );

    return NextResponse.json({ application });
  } catch (error: any) {
    if (error instanceof OrganizationApplicationNotFoundError) {
      return NextResponse.json({ error: "Žádost nenalezena" }, { status: 404 });
    }
    if (error instanceof OrganizationApplicationInvalidStateError) {
      return NextResponse.json(
        { error: "Žádost není ve stavu pro zamítnutí" },
        { status: 409 },
      );
    }

    console.error("Error rejecting organization application:", error);
    return NextResponse.json(
      { error: error?.message || "Nepodařilo se zamítnout žádost" },
      { status: 400 },
    );
  }
}
