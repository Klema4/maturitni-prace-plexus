import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { moderateComment } from "@/lib/services/commentsService";
import { getEffectivePermissionsForUser } from "@/lib/repositories/rolesRepository";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ commentId: string }>;
};

const HideCommentSchema = z.object({
  reason: z.string().min(1, "Důvod moderace nemůže být prázdný").max(512, "Důvod moderace může mít maximálně 512 znaků"),
});

/**
 * POST /api/comments/[commentId]/hide
 * Skrytí komentáře (moderace)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { commentId } = await params;

    // Validace commentId
    if (!z.string().uuid().safeParse(commentId).success) {
      return NextResponse.json(
        { error: "Neplatný formát identifikátoru komentáře" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Pro moderaci komentáře se musíte přihlásit" },
        { status: 401 }
      );
    }

    // Kontrola oprávnění
    const userPermissions = await getEffectivePermissionsForUser(session.user.id);
    if (!hasPermission(userPermissions, PERMISSIONS.COMMENTS_MODERATE)) {
      return NextResponse.json(
        { error: "Nemáte oprávnění k moderaci komentářů" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validace těla požadavku
    const validatedBody = HideCommentSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: validatedBody.error.issues[0]?.message || "Neplatná data pro moderaci" },
        { status: 400 }
      );
    }

    const { reason } = validatedBody.data;

    const comment = await moderateComment(commentId, session.user.id, reason);

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error hiding comment:", error);
    const errorMessage = error instanceof Error ? error.message : "Nepodařilo se skrýt komentář";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
