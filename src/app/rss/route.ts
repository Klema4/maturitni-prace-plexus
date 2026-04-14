import { NextResponse } from "next/server";
import RSS from "rss";
import { getArticlesList } from "@/lib/services/articlesService";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
const RSS_LIMIT = 50;

/**
 * GET /rss
 * Generuje RSS feed z publikovaných článků v databázi.
 * Plně server-side, žádná client logika.
 */
export async function GET() {
  const articles = await getArticlesList({
    limit: RSS_LIMIT,
    offset: 0,
  });

  const feed = new RSS({
    title: "Plexus",
    description:
      "Blogový a komplexní redakční systém s vlastní reklamní platformou a analytickými nástroji",
    feed_url: `${BASE_URL}/rss`,
    site_url: BASE_URL,
    language: "cs",
  });

  for (const article of articles) {
    const fullUrl = `${BASE_URL}${article.articleUrl}`;
    feed.item({
      title: article.title,
      description: article.description ?? "",
      url: fullUrl,
      date: new Date(article.publishedAt).toUTCString(),
    });
  }

  return new NextResponse(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
