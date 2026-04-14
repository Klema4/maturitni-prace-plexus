import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listDashboardUserRolesService } from "@/lib/services/dashboardUsersService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const result = await listDashboardUserRolesService();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst role" },
      { status: 500 },
    );
  }
}

