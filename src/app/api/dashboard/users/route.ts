import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listDashboardUsersService } from "@/lib/services/dashboardUsersService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const result = await listDashboardUsersService({
      query: searchParams.get("query"),
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
      stats: searchParams.get("stats") === "true",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst uživatele" },
      { status: 500 },
    );
  }
}
