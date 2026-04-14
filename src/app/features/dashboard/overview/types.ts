export interface OverviewStats {
  todayViews: number;
  averageTimeOnPage: number;
  topArticle: {
    id: string;
    title: string;
    viewCount: number;
  } | null;
  totalUsers: number;
  totalArticles: number;
  totalComments: number;
}

export interface OverviewChartPoint {
  date: string;
  views?: number;
  activeUsers?: number;
}
