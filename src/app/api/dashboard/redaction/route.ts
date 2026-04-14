import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  listDashboardRedactionMembersService,
  updateDashboardUserRoleService,
} from "@/lib/services/dashboardUsersService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const rolesOnly = new URL(request.url).searchParams.get("roles") === "true";
    return NextResponse.json(
      await listDashboardRedactionMembersService({ rolesOnly }),
    );
  } catch (error) {
    console.error("Error fetching redaction members:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst členy redakce" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const body = await request.json();
    if (!body?.userId || !body?.roleId) {
      return NextResponse.json(
        { error: "Chybí userId nebo roleId" },
        { status: 400 },
      );
    }

    const success = await updateDashboardUserRoleService({
      userId: body.userId,
      roleId: body.roleId,
      add: true,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se přidat roli" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error adding role:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se přidat roli" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const roleId = searchParams.get("roleId");

    if (!userId || !roleId) {
      return NextResponse.json(
        { error: "Chybí userId nebo roleId" },
        { status: 400 },
      );
    }

    const success = await updateDashboardUserRoleService({
      userId,
      roleId,
      add: false,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se odebrat roli" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing role:", error);
    return NextResponse.json(
      { error: "Nepodařilo se odebrat roli" },
      { status: 500 },
    );
  }
}
