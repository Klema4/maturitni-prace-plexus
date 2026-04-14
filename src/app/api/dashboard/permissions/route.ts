import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createDashboardRoleService,
  deleteDashboardRoleService,
  getDashboardPermissionsService,
  updateDashboardRoleService,
} from "@/lib/services/dashboardPermissionsService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const result = await getDashboardPermissionsService({
      roleId: searchParams.get("id"),
      users: searchParams.get("users") === "true",
    });

    if ("role" in result && !result.role) {
      return NextResponse.json({ error: "Role nenalezena" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst role" },
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

    const role = await createDashboardRoleService(await request.json());
    return NextResponse.json({ role }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se vytvořit roli" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const body = await request.json();
    if (!body?.id) {
      return NextResponse.json({ error: "Chybí id role" }, { status: 400 });
    }

    const role = await updateDashboardRoleService(body.id, body);
    if (!role) {
      return NextResponse.json({ error: "Role nenalezena" }, { status: 404 });
    }

    return NextResponse.json({ role });
  } catch (error: any) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se aktualizovat roli" },
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

    const roleId = new URL(request.url).searchParams.get("id");
    if (!roleId) {
      return NextResponse.json({ error: "Chybí id role" }, { status: 400 });
    }

    const success = await deleteDashboardRoleService(roleId);
    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se smazat roli" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat roli" },
      { status: 500 },
    );
  }
}
