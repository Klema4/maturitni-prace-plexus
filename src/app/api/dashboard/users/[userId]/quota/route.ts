import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { getDashboardUserPermissionsService } from "@/lib/services/dashboardAccessService";
import { updateDashboardUserQuotaService } from "@/lib/services/dashboardUsersService";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ userId: string }>;
};

const UpdateUserQuotaSchema = z.object({
  maxStorageBytes: z.number().int().min(0).max(1_099_511_627_776),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const userPermissions = await getDashboardUserPermissionsService(session.user.id);
    if (!hasPermission(userPermissions, PERMISSIONS.USERS_MANAGE)) {
      return NextResponse.json(
        { error: "Nemáte oprávnění ke správě uživatelů" },
        { status: 403 },
      );
    }

    const { userId } = await params;
    if (!z.string().uuid().safeParse(userId).success) {
      return NextResponse.json(
        { error: "Neplatný formát identifikátoru uživatele" },
        { status: 400 },
      );
    }

    const validatedBody = UpdateUserQuotaSchema.safeParse(await request.json());
    if (!validatedBody.success) {
      return NextResponse.json({ error: "Neplatná data" }, { status: 400 });
    }

    const success = await updateDashboardUserQuotaService({
      userId,
      maxStorageBytes: validatedBody.data.maxStorageBytes,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se změnit kvótu úložiště" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user quota:", error);
    return NextResponse.json(
      { error: "Nepodařilo se změnit kvótu úložiště" },
      { status: 500 },
    );
  }
}

