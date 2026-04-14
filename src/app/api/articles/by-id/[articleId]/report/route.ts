import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { reportArticle } from "@/lib/services/reportsService";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ articleId: string }>;
};

const ReportArticleSchema = z.object({
  reason: z
    .string()
    .min(1, "Důvod reportu nemůže být prázdný")
    .max(2000, "Důvod reportu může mít maximálně 2000 znaků"),
});

/**
 * POST /api/articles/by-id/[articleId]/report
 * Reportování článku
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { articleId } = await params;

    // Validace articleId
    if (!z.string().uuid().safeParse(articleId).success) {
      return NextResponse.json(
        { error: "Neplatný formát identifikátoru článku" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Pro reportování článku se musíte přihlásit" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validace těla požadavku
    const validatedBody = ReportArticleSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: validatedBody.error.issues[0]?.message || "Neplatná data pro report" },
        { status: 400 }
      );
    }

    const { reason } = validatedBody.data;

    const report = await reportArticle(session.user.id, articleId, reason);

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error reporting article:", error);
    const errorMessage = error instanceof Error ? error.message : "Nepodařilo se nahlásit článek";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

