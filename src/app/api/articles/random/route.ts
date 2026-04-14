import { NextResponse } from "next/server";
import { getRandomArticle } from "@/lib/repositories/articlesRepository";

/**
 * GET /api/articles/random
 * Přesměrování na náhodný článek
 */
export async function GET() {
  try {
    const article = await getRandomArticle();

    if (!article) {
      return NextResponse.redirect(new URL("/articles", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
    }

    // Přesměruj na detail článku
    return NextResponse.redirect(
      new URL(`/article/${article.slug}`, process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
    );
  } catch (error) {
    console.error("Error getting random article:", error);
    return NextResponse.redirect(new URL("/articles", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
  }
}
