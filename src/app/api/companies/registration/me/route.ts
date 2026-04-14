import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMyOrganizationApplicationService } from "@/lib/services/adsService";

/**
 * GET /api/companies/registration/me
 * Stav poslední žádosti přihlášeného uživatele
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const application = await getMyOrganizationApplicationService(session.user.id);
    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error fetching company registration status:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst stav žádosti" },
      { status: 500 },
    );
  }
}
