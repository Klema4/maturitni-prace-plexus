export interface AnalyticsStats {
  totalViews: number;
  totalUsers: number;
  totalArticles: number;
  growthRate: number;
  viewsLastMonth: number;
  usersLastMonth: number;
  articlesLastMonth: number;
}

export interface AnalyticsChartPoint {
  date: string;
  [key: string]: string | number | undefined;
}

export interface TopArticleRow {
  id: string;
  title: string;
  viewCount: number;
}
