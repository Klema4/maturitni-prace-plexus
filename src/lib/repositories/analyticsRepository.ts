import { db } from "@/lib/db";
import { articles, users, comments, subscriptions, articleViews } from "@/lib/schema";
import { eq, and, isNull, sql, gte, lte, lt, desc } from "drizzle-orm";

/**
 * Typ statistik pro Overview
 */
export type OverviewStats = {
  todayViews: number;
  averageTimeOnPage: number; // v minutách
  topArticle: {
    id: string;
    title: string;
    viewCount: number;
  } | null;
  totalUsers: number;
  totalArticles: number;
  totalComments: number;
};

/**
 * Typ statistik pro Analytics
 */
export type AnalyticsStats = {
  totalViews: number;
  totalUsers: number;
  totalArticles: number;
  growthRate: number; // procentuální růst
  viewsLastMonth: number;
  usersLastMonth: number;
  articlesLastMonth: number;
};

/**
 * Typ statistiky návštěvnosti v čase
 */
export type ViewsOverTime = {
  date: string;
  views: number;
};

/**
 * Typ statistiky aktivních uživatelů v čase
 */
export type ActiveUsersOverTime = {
  date: string;
  activeUsers: number;
};

/**
 * Typ statistiky komentářů v čase
 */
export type CommentsOverTime = {
  date: string;
  comments: number;
};

/**
 * Typ statistiky publikovaných článků v čase
 */
export type PublishedArticlesOverTime = {
  date: string;
  publishedArticles: number;
};

/**
 * Typ statistiky předplatných v čase
 */
export type SubscriptionsOverTime = {
  date: string;
  subscriptions: number;
};

/**
 * Typ top článku pro bar chart
 */
export type TopArticleByViews = {
  id: string;
  title: string;
  viewCount: number;
};

/**
 * Získání statistik pro Overview
 */
export async function getOverviewStats(): Promise<OverviewStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Dnešní zobrazení (podle article view eventů)
  const [todayViewsResult, topArticleResult, totalUsersResult, totalArticlesResult, totalCommentsResult] = await Promise.all([
    db
      .select({
        total: sql<number>`COALESCE(COUNT(${articleViews.id}), 0)`,
      })
      .from(articleViews)
      .innerJoin(articles, eq(articleViews.articleId, articles.id))
      .where(
        and(
          eq(articles.status, "published"),
          isNull(articles.deletedAt),
          gte(articleViews.createdAt, today),
          lt(articleViews.createdAt, tomorrow),
        ),
      ),
    db
      .select({
        id: articles.id,
        title: articles.title,
        viewCount: articles.viewCount,
      })
      .from(articles)
      .where(
        and(
          eq(articles.status, "published"),
          isNull(articles.deletedAt)
        )
      )
      .orderBy(desc(articles.viewCount))
      .limit(1),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(isNull(users.deletedAt)),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(articles)
      .where(
        and(
          eq(articles.status, "published"),
          isNull(articles.deletedAt)
        )
      ),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(comments)
      .where(isNull(comments.deletedAt)),
  ]);

  // Průměrná doba na stránce - simulace (v reálné aplikaci by se měřila pomocí analytics)
  const averageTimeOnPage = 4.5; // placeholder hodnota

  return {
    todayViews: Number(todayViewsResult[0]?.total) || 0,
    averageTimeOnPage,
    topArticle: topArticleResult[0] ? {
      id: topArticleResult[0].id,
      title: topArticleResult[0].title,
      viewCount: topArticleResult[0].viewCount,
    } : null,
    totalUsers: Number(totalUsersResult[0]?.count) || 0,
    totalArticles: Number(totalArticlesResult[0]?.count) || 0,
    totalComments: Number(totalCommentsResult[0]?.count) || 0,
  };
}

/**
 * Získání statistik pro Analytics
 */
export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  const now = new Date();
  const lastMonth = new Date(now);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const twoMonthsAgo = new Date(now);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  const [
    totalViewsResult,
    totalUsersResult,
    totalArticlesResult,
    viewsLastMonthResult,
    usersLastMonthResult,
    articlesLastMonthResult,
    viewsTwoMonthsAgoResult,
  ] = await Promise.all([
    db
      .select({
        total: sql<number>`COALESCE(COUNT(${articleViews.id}), 0)`,
      })
      .from(articleViews)
      .innerJoin(articles, eq(articleViews.articleId, articles.id))
      .where(
        and(
          eq(articles.status, "published"),
          isNull(articles.deletedAt),
        ),
      ),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(isNull(users.deletedAt)),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(articles)
      .where(
        and(
          eq(articles.status, "published"),
          isNull(articles.deletedAt)
        )
      ),
    db
      .select({
        total: sql<number>`COALESCE(COUNT(${articleViews.id}), 0)`,
      })
      .from(articleViews)
      .innerJoin(articles, eq(articleViews.articleId, articles.id))
      .where(
        and(
          eq(articles.status, "published"),
          isNull(articles.deletedAt),
          gte(articleViews.createdAt, lastMonth),
        ),
      ),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(
        and(
          isNull(users.deletedAt),
          gte(users.createdAt, lastMonth)
        )
      ),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(articles)
      .where(
        and(
          eq(articles.status, "published"),
          isNull(articles.deletedAt),
          gte(articles.createdAt, lastMonth)
        )
      ),
    db
      .select({
        total: sql<number>`COALESCE(COUNT(${articleViews.id}), 0)`,
      })
      .from(articleViews)
      .innerJoin(articles, eq(articleViews.articleId, articles.id))
      .where(
        and(
          eq(articles.status, "published"),
          isNull(articles.deletedAt),
          gte(articleViews.createdAt, twoMonthsAgo),
          lt(articleViews.createdAt, lastMonth),
        ),
      ),
  ]);

  const totalViews = Number(totalViewsResult[0]?.total) || 0;
  const totalUsers = Number(totalUsersResult[0]?.count) || 0;
  const totalArticles = Number(totalArticlesResult[0]?.count) || 0;
  const viewsLastMonth = Number(viewsLastMonthResult[0]?.total) || 0;
  const usersLastMonth = Number(usersLastMonthResult[0]?.count) || 0;
  const articlesLastMonth = Number(articlesLastMonthResult[0]?.count) || 0;
  const viewsTwoMonthsAgo = Number(viewsTwoMonthsAgoResult[0]?.total) || 0;

  // Výpočet růstu (porovnání s předchozím měsícem)
  const growthRate = viewsTwoMonthsAgo > 0 
    ? ((viewsLastMonth - viewsTwoMonthsAgo) / viewsTwoMonthsAgo) * 100 
    : 0;

  return {
    totalViews,
    totalUsers,
    totalArticles,
    growthRate: Math.round(growthRate * 10) / 10, // Zaokrouhlení na 1 desetinné místo
    viewsLastMonth,
    usersLastMonth,
    articlesLastMonth,
  };
}

/**
 * Vyplní všechny dny v rozsahu (startDate až dnes); chybějící dny mají hodnotu 0.
 * @param days - Počet dní zpět
 * @param key - Klíč hodnoty v typu T (např. 'views', 'activeUsers')
 * @param rows - Řádky z DB s polem date a hodnotou
 */
function fillMissingDays<T extends { date: string }>(
  days: number,
  key: keyof T & string,
  rows: T[],
  getValue: (row: T) => number,
): T[] {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  const byDate = new Map<string, number>();
  for (const row of rows) {
    const d = typeof row.date === 'string' ? row.date.slice(0, 10) : String(row.date).slice(0, 10);
    byDate.set(d, getValue(row));
  }
  const out: T[] = [];
  const cursor = new Date(startDate);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  while (cursor <= end) {
    const dateStr = cursor.toISOString().slice(0, 10);
    out.push({ date: dateStr, [key]: byDate.get(dateStr) ?? 0 } as T);
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

/**
 * Získání statistiky návštěvnosti v čase (posledních 30 dní)
 */
export async function getViewsOverTime(days: number = 30): Promise<ViewsOverTime[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const result = await db
    .select({
      date: sql<string>`DATE(${articleViews.createdAt})`,
      views: sql<number>`COUNT(${articleViews.id})`,
    })
    .from(articleViews)
    .innerJoin(articles, eq(articleViews.articleId, articles.id))
    .where(
      and(
        eq(articles.status, "published"),
        isNull(articles.deletedAt),
        gte(articleViews.createdAt, startDate),
      ),
    )
    .groupBy(sql`DATE(${articleViews.createdAt})`)
    .orderBy(sql`DATE(${articleViews.createdAt})`);

  const mapped: ViewsOverTime[] = result.map((row) => {
    const dateVal = row.date;
    const dateStr = typeof dateVal === 'string' ? dateVal.slice(0, 10) : new Date(dateVal).toISOString().slice(0, 10);
    return { date: dateStr, views: Number(row.views) || 0 };
  });
  return fillMissingDays<ViewsOverTime>(days, 'views', mapped, (r) => r.views);
}

/**
 * Získání statistiky aktivních uživatelů v čase (posledních 30 dní)
 */
export async function getActiveUsersOverTime(days: number = 30): Promise<ActiveUsersOverTime[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const result = await db
    .select({
      date: sql<string>`DATE(${users.createdAt})`,
      activeUsers: sql<number>`COUNT(*)`,
    })
    .from(users)
    .where(
      and(
        isNull(users.deletedAt),
        gte(users.createdAt, startDate)
      )
    )
    .groupBy(sql`DATE(${users.createdAt})`)
    .orderBy(sql`DATE(${users.createdAt})`);

  const mapped: ActiveUsersOverTime[] = result.map((row) => {
    const dateVal = row.date;
    const dateStr = typeof dateVal === 'string' ? dateVal.slice(0, 10) : new Date(dateVal).toISOString().slice(0, 10);
    return { date: dateStr, activeUsers: Number(row.activeUsers) || 0 };
  });
  return fillMissingDays<ActiveUsersOverTime>(days, 'activeUsers', mapped, (r) => r.activeUsers);
}

/**
 * Získání statistiky komentářů v čase (posledních X dní)
 */
export async function getCommentsOverTime(days: number = 30): Promise<CommentsOverTime[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const result = await db
    .select({
      date: sql<string>`DATE(${comments.createdAt})`,
      comments: sql<number>`COUNT(*)`,
    })
    .from(comments)
    .where(
      and(
        isNull(comments.deletedAt),
        gte(comments.createdAt, startDate)
      )
    )
    .groupBy(sql`DATE(${comments.createdAt})`)
    .orderBy(sql`DATE(${comments.createdAt})`);

  const mapped: CommentsOverTime[] = result.map((row) => {
    const dateVal = row.date;
    const dateStr = typeof dateVal === 'string' ? dateVal.slice(0, 10) : new Date(dateVal).toISOString().slice(0, 10);
    return { date: dateStr, comments: Number(row.comments) || 0 };
  });
  return fillMissingDays<CommentsOverTime>(days, 'comments', mapped, (r) => r.comments);
}

/**
 * Získání počtu nově publikovaných článků v čase (posledních X dní)
 */
export async function getPublishedArticlesOverTime(days: number = 30): Promise<PublishedArticlesOverTime[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const result = await db
    .select({
      date: sql<string>`DATE(${articles.createdAt})`,
      publishedArticles: sql<number>`COUNT(*)`,
    })
    .from(articles)
    .where(
      and(
        eq(articles.status, "published"),
        isNull(articles.deletedAt),
        gte(articles.createdAt, startDate)
      )
    )
    .groupBy(sql`DATE(${articles.createdAt})`)
    .orderBy(sql`DATE(${articles.createdAt})`);

  const mapped: PublishedArticlesOverTime[] = result.map((row) => {
    const dateVal = row.date;
    const dateStr = typeof dateVal === 'string' ? dateVal.slice(0, 10) : new Date(dateVal).toISOString().slice(0, 10);
    return { date: dateStr, publishedArticles: Number(row.publishedArticles) || 0 };
  });
  return fillMissingDays<PublishedArticlesOverTime>(days, 'publishedArticles', mapped, (r) => r.publishedArticles);
}

/**
 * Získání počtu aktivních předplatných v čase (posledních X dní)
 */
export async function getSubscriptionsOverTime(days: number = 30): Promise<SubscriptionsOverTime[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const activeSubscriptions = await db
    .select({
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
    })
    .from(subscriptions);
  const out: SubscriptionsOverTime[] = [];
  const cursor = new Date(startDate);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  while (cursor <= end) {
    const dayStart = new Date(cursor);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(cursor);
    dayEnd.setHours(23, 59, 59, 999);

    const activeCount = activeSubscriptions.reduce((count, sub) => {
      if (!sub.startDate || !sub.endDate) return count;
      const startsBeforeOrOnDay = sub.startDate <= dayEnd;
      const endsAfterOrOnDay = sub.endDate >= dayStart;
      return startsBeforeOrOnDay && endsAfterOrOnDay ? count + 1 : count;
    }, 0);

    out.push({
      date: dayStart.toISOString().slice(0, 10),
      subscriptions: activeCount,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return out;
}

/**
 * Získání top článků podle zobrazení
 */
export async function getTopArticlesByViews(limit: number = 8): Promise<TopArticleByViews[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 20);

  const result = await db
    .select({
      id: articles.id,
      title: articles.title,
      viewCount: sql<number>`COALESCE(COUNT(${articleViews.id}), 0)`,
    })
    .from(articles)
    .leftJoin(articleViews, eq(articleViews.articleId, articles.id))
    .where(
      and(
        eq(articles.status, "published"),
        isNull(articles.deletedAt),
      ),
    )
    .groupBy(articles.id, articles.title)
    .orderBy(desc(sql`COALESCE(COUNT(${articleViews.id}), 0)`))
    .limit(safeLimit);

  return result.map((row) => ({
    id: row.id,
    title: row.title,
    viewCount: Number(row.viewCount) || 0,
  }));
}
