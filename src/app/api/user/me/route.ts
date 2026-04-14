import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/services/userService";

/**
 * GET /api/user/me
 * Získání aktuálního přihlášeného uživatele včetně surname
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    const user = await getCurrentUser(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: "Uživatel nenalezen" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst uživatele" },
      { status: 500 }
    );
  }
}
