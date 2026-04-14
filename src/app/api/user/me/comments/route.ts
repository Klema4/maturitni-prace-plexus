import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCommentsByUserId } from "@/lib/repositories/commentsRepository";

/**
 * GET /api/user/me/comments
 * Získání komentářů přihlášeného uživatele.
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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const comments = await getCommentsByUserId(session.user.id, { limit, offset });

    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json(
      { error: "Nepodařilo se načíst komentáře" },
      { status: 500 }
    );
  }
}
