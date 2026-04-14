import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { account } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/user/has-password
 * Kontrola, zda má uživatel nastavené heslo (má account s providerId = "credential")
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

    const credentialAccount = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.userId, session.user.id),
          eq(account.providerId, "credential")
        )
      )
      .limit(1);

    const hasPassword = credentialAccount.length > 0;

    return NextResponse.json({ hasPassword });
  } catch (error) {
    console.error("Error checking password:", error);
    return NextResponse.json(
      { error: "Nepodařilo se zkontrolovat heslo" },
      { status: 500 }
    );
  }
}
