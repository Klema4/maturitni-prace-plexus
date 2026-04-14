import { z } from "zod";

/**
 * Schéma pro statistiky Overview
 */
export const OverviewStatsSchema = z.object({
  todayViews: z.number().int().nonnegative(),
  averageTimeOnPage: z.number().nonnegative(),
  topArticle: z.object({
    id: z.string().uuid(),
    title: z.string(),
    viewCount: z.number().int().nonnegative(),
  }).nullable(),
  totalUsers: z.number().int().nonnegative(),
  totalArticles: z.number().int().nonnegative(),
  totalComments: z.number().int().nonnegative(),
});

/**
 * Schéma pro statistiky Analytics
 */
export const AnalyticsStatsSchema = z.object({
  totalViews: z.number().int().nonnegative(),
  totalUsers: z.number().int().nonnegative(),
  totalArticles: z.number().int().nonnegative(),
  growthRate: z.number(),
  viewsLastMonth: z.number().int().nonnegative(),
  usersLastMonth: z.number().int().nonnegative(),
  articlesLastMonth: z.number().int().nonnegative(),
});

/**
 * Schéma pro návštěvnost v čase
 */
export const ViewsOverTimeSchema = z.object({
  date: z.string(),
  views: z.number().int().nonnegative(),
});

/**
 * Schéma pro aktivní uživatele v čase
 */
export const ActiveUsersOverTimeSchema = z.object({
  date: z.string(),
  activeUsers: z.number().int().nonnegative(),
});
