import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateDashboardUserRoleService } from "@/lib/services/dashboardUsersService";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ userId: string }>;
};

const UpdateUserRoleSchema = z.object({
  roleId: z.string().uuid(),
  add: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const { userId } = await params;
    if (!z.string().uuid().safeParse(userId).success) {
      return NextResponse.json(
        { error: "Neplatný formát identifikátoru uživatele" },
        { status: 400 },
      );
    }

    const validatedBody = UpdateUserRoleSchema.safeParse(await request.json());
    if (!validatedBody.success) {
      return NextResponse.json({ error: "Neplatná data" }, { status: 400 });
    }

    const success = await updateDashboardUserRoleService({
      userId,
      roleId: validatedBody.data.roleId,
      add: validatedBody.data.add,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se změnit roli uživatele" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Nepodařilo se změnit roli uživatele" },
      { status: 500 },
    );
  }
}
