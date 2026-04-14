import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPendingRegistrationsCountService,
  listOrganizationApplicationsService,
} from "@/lib/services/adsService";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { getDashboardUserPermissionsService } from "@/lib/services/dashboardAccessService";
import { ListOrganizationApplicationsQuerySchema } from "@/lib/schemas/organizationApplicationsSchema";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    if (searchParams.get("count") === "true") {
      const count = await getPendingRegistrationsCountService();
      return NextResponse.json({ count });
    }

    const parsedQuery = ListOrganizationApplicationsQuerySchema.safeParse({
      status: searchParams.get("status") || undefined,
    });
    if (!parsedQuery.success) {
      return NextResponse.json({ error: "Neplatný query parametr" }, { status: 400 });
    }

    const applications = await listOrganizationApplicationsService(
      parsedQuery.data.status,
    );
    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error listing organization applications:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst žádosti" },
      { status: 500 },
    );
  }
}
