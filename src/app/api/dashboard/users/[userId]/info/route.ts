import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { getDashboardUserPermissionsService } from "@/lib/services/dashboardAccessService";
import { updateDashboardUserInfoService } from "@/lib/services/dashboardUsersService";

type RouteParams = {
  params: Promise<{ userId: string }>;
};

const UpdateUserInfoSchema = z.object({
  name: z.string().min(1).max(100),
  surname: z.string().min(1).max(100),
  email: z.string().email().max(255),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const userPermissions = await getDashboardUserPermissionsService(
      session.user.id,
    );
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

    const validatedBody = UpdateUserInfoSchema.safeParse(await request.json());
    if (!validatedBody.success) {
      return NextResponse.json({ error: "Neplatná data" }, { status: 400 });
    }

    const success = await updateDashboardUserInfoService({
      userId,
      name: validatedBody.data.name,
      surname: validatedBody.data.surname,
      email: validatedBody.data.email,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se změnit informace o uživateli" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user info:", error);
    return NextResponse.json(
      { error: "Nepodařilo se změnit informace o uživateli" },
      { status: 500 },
    );
  }
}

