import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { reportComment } from "@/lib/services/reportsService";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ commentId: string }>;
};

const ReportCommentSchema = z.object({
  reason: z.string().min(1, "Důvod reportu nemůže být prázdný").max(2000, "Důvod reportu může mít maximálně 2000 znaků"),
});

/**
 * POST /api/comments/[commentId]/report
 * Reportování komentáře
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
        { error: "Pro reportování komentáře se musíte přihlásit" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validace těla požadavku
    const validatedBody = ReportCommentSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: validatedBody.error.issues[0]?.message || "Neplatná data pro report" },
        { status: 400 }
      );
    }

    const { reason } = validatedBody.data;

    const report = await reportComment(session.user.id, commentId, reason);

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error reporting comment:", error);
    const errorMessage = error instanceof Error ? error.message : "Nepodařilo se nahlásit komentář";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
