import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDashboardOverviewStats,
  getDashboardAnalyticsStats,
  getDashboardViewsOverTime,
  getDashboardActiveUsersOverTime,
  getDashboardCommentsOverTime,
  getDashboardPublishedArticlesOverTime,
  getDashboardSubscriptionsOverTime,
  getDashboardTopArticlesByViews,
} from "@/lib/services/dashboardService";

/**
 * GET /api/dashboard/stats
 * Získání statistik pro Overview stránku
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "overview";
    const days = parseInt(searchParams.get("days") || "30");
    const limit = parseInt(searchParams.get("limit") || "8");

    if (type === "overview") {
      const stats = await getDashboardOverviewStats();
      return NextResponse.json({ stats });
    } else if (type === "analytics") {
      const stats = await getDashboardAnalyticsStats();
      return NextResponse.json({ stats });
    } else if (type === "views-over-time") {
      const data = await getDashboardViewsOverTime(days);
      return NextResponse.json({ data });
    } else if (type === "active-users-over-time") {
      const data = await getDashboardActiveUsersOverTime(days);
      return NextResponse.json({ data });
    } else if (type === "comments-over-time") {
      const data = await getDashboardCommentsOverTime(days);
      return NextResponse.json({ data });
    } else if (type === "published-articles-over-time") {
      const data = await getDashboardPublishedArticlesOverTime(days);
      return NextResponse.json({ data });
    } else if (type === "subscriptions-over-time") {
      const data = await getDashboardSubscriptionsOverTime(days);
      return NextResponse.json({ data });
    } else if (type === "top-articles") {
      const data = await getDashboardTopArticlesByViews(limit);
      return NextResponse.json({ data });
    }

    return NextResponse.json(
      { error: "Neplatný typ statistiky" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst statistiky" },
      { status: 500 }
    );
  }
}
