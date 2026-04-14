import { NextRequest, NextResponse } from "next/server";
import { getArticleDetail, getRelatedArticlesForUI } from "@/lib/services/articlesService";
import { incrementViewCount } from "@/lib/repositories/articlesRepository";
import { auth } from "@/lib/auth";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

/**
 * GET /api/articles/[slug]
 * Získání detailu článku podle slug
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    const article = await getArticleDetail(slug);

    if (!article) {
      return NextResponse.json(
        { error: "Článek nenalezen" },
        { status: 404 }
      );
    }

    // Získat související články
    const relatedArticles = await getRelatedArticlesForUI(article.id, 3);

    return NextResponse.json({ article, relatedArticles });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst článek" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/articles/[slug]
 * Inkrementace počtu zobrazení
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    const article = await getArticleDetail(slug);

    if (!article) {
      return NextResponse.json(
        { error: "Článek nenalezen" },
        { status: 404 }
      );
    }

    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id ?? null;

    await incrementViewCount(article.id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return NextResponse.json(
      { error: "Nepodařilo se aktualizovat počet zobrazení" },
      { status: 500 }
    );
  }
}
