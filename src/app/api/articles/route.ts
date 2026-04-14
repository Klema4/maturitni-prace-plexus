import { NextRequest, NextResponse } from "next/server";
import { getArticlesList, getArticlesBySectionList } from "@/lib/services/articlesService";
import { getTagBySlug } from "@/lib/repositories/tagsRepository";

/**
 * GET /api/articles
 * Získání seznamu publikovaných článků s možností vyhledávání a filtrování.
 * Pro přihlášené uživatele s oblíbenými tagy se mimo sekce automaticky filtruje podle nich.
 *
 * Parametry query stringu:
 * - query: vyhledávací dotaz (volitelné)
 * - section: slug sekce (volitelné)
 * - tag: slug tagu (volitelné)
 * - limit: počet článků (výchozí: 20)
 * - offset: posun pro stránkování (výchozí: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || undefined;
    const section = searchParams.get("section") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let articles;

    if (section) {
      articles = await getArticlesBySectionList(section, { tagSlug: tag, limit, offset });
    } else {
      const resolvedTag = tag ? await getTagBySlug(tag) : null;
      const tagIds = resolvedTag ? [resolvedTag.id] : undefined;
      articles = await getArticlesList({ query, limit, offset, tagIds });
    }

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst články" },
      { status: 500 }
    );
  }
}
