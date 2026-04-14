import {
  getOverviewStats,
  getAnalyticsStats,
  getViewsOverTime,
  getActiveUsersOverTime,
  getCommentsOverTime,
  getPublishedArticlesOverTime,
  getSubscriptionsOverTime,
  getTopArticlesByViews,
} from "@/lib/repositories/analyticsRepository";

/**
 * Získání statistik pro Overview stránku
 */
export async function getDashboardOverviewStats() {
  return await getOverviewStats();
}

/**
 * Získání statistik pro Analytics stránku
 */
export async function getDashboardAnalyticsStats() {
  return await getAnalyticsStats();
}

/**
 * Získání návštěvnosti v čase
 */
export async function getDashboardViewsOverTime(days: number = 30) {
  return await getViewsOverTime(days);
}

/**
 * Získání aktivních uživatelů v čase
 */
export async function getDashboardActiveUsersOverTime(days: number = 30) {
  return await getActiveUsersOverTime(days);
}

/**
 * Získání komentářů v čase
 */
export async function getDashboardCommentsOverTime(days: number = 30) {
  return await getCommentsOverTime(days);
}

/**
 * Získání počtu publikovaných článků v čase
 */
export async function getDashboardPublishedArticlesOverTime(days: number = 30) {
  return await getPublishedArticlesOverTime(days);
}

/**
 * Získání počtu aktivních předplatných v čase
 */
export async function getDashboardSubscriptionsOverTime(days: number = 30) {
  return await getSubscriptionsOverTime(days);
}

/**
 * Získání top článků podle zobrazení
 */
export async function getDashboardTopArticlesByViews(limit: number = 8) {
  return await getTopArticlesByViews(limit);
}
