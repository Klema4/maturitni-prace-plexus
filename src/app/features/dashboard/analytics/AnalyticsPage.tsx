"use client";

import {
  BarChart3,
  BookOpen,
  ChartLine,
  Eye,
  HandCoins,
  MessageSquare,
  Newspaper,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/dashboard/Card";
import { StatsCard } from "@/components/ui/dashboard/StatsCard";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { AnalyticsChartCard } from "./components/AnalyticsChartCard";
import { TopArticlesBarCard } from "./components/TopArticlesBarCard";
import { useAnalyticsPage } from "./hooks/useAnalyticsPage";

export default function Analytics() {
  const { stats, loading, error } = useAnalyticsPage();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("cs-CZ").format(num);
  };

  const formatPercent = (num: number) => {
    const sign = num >= 0 ? "+" : "";
    return `${sign}${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Analytika</Heading>
          <Paragraph>Dlouhodobé grafy a analýzy s ročním přehledem.</Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám statistiky...</Paragraph>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Analytika</Heading>
          <Paragraph>Dlouhodobé grafy a analýzy s ročním přehledem.</Paragraph>
        </header>
        <div className="mt-4">
          <Paragraph color="muted" className="text-red-400">
            {error}
          </Paragraph>
        </div>
      </>
    );
  }

  const viewsGrowth =
    stats && stats.totalViews > 0
      ? ((stats.viewsLastMonth / stats.totalViews) * 100).toFixed(1)
      : "0";
  const usersGrowth =
    stats && stats.totalUsers > 0
      ? ((stats.usersLastMonth / stats.totalUsers) * 100).toFixed(1)
      : "0";

  return (
    <>
      <header>
        <Heading variant="h1">Analytika</Heading>
        <Paragraph>Dlouhodobé grafy a analýzy s ročním přehledem.</Paragraph>
      </header>
      <section className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={<Eye size={20} />}
            label="Celkové zobrazení"
            value={formatNumber(stats?.totalViews || 0)}
            helperText={`+${viewsGrowth}% oproti minulému měsíci`}
            helperClassName="text-green-400"
          />
          <StatsCard
            icon={<Users size={20} />}
            label="Uživatelé"
            value={formatNumber(stats?.totalUsers || 0)}
            helperText={`+${usersGrowth}% oproti minulému měsíci`}
            helperClassName="text-green-400"
          />
          <StatsCard
            icon={<BookOpen size={20} />}
            label="Články"
            value={formatNumber(stats?.totalArticles || 0)}
            helperText={`${stats?.articlesLastMonth || 0} nových tento měsíc`}
            helperClassName="text-blue-400"
          />
          <StatsCard
            icon={<TrendingUp size={20} />}
            label="Růst"
            value={formatPercent(stats?.growthRate || 0)}
            helperText="Průměrný měsíční růst"
            helperClassName="text-green-400"
          />
        </div>
      </section>
      <section className="mt-6">
        <Heading variant="h3">Grafy a analýzy</Heading>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-4!">
            <AnalyticsChartCard
              icon={<ChartLine size={20} className="text-blue-400" />}
              title="Návštěvnost v čase"
              apiUrl="/api/dashboard/stats?type=views-over-time&days=30"
              valueKey="views"
              categoryLabel="Zobrazení"
              color="blue"
            />
          </Card>
          <Card className="p-4!">
            <AnalyticsChartCard
              icon={<Users size={20} className="text-purple-400" />}
              title="Aktivní uživatelé"
              apiUrl="/api/dashboard/stats?type=active-users-over-time&days=30"
              valueKey="activeUsers"
              categoryLabel="Uživatelé"
              color="violet"
            />
          </Card>
          <Card className="p-4!">
            <AnalyticsChartCard
              icon={<MessageSquare size={20} className="text-cyan-400" />}
              title="Komentáře v čase"
              apiUrl="/api/dashboard/stats?type=comments-over-time&days=30"
              valueKey="comments"
              categoryLabel="Komentáře"
              color="cyan"
            />
          </Card>
          <Card className="p-4!">
            <AnalyticsChartCard
              icon={<Newspaper size={20} className="text-emerald-400" />}
              title="Nově publikované články"
              apiUrl="/api/dashboard/stats?type=published-articles-over-time&days=30"
              valueKey="publishedArticles"
              categoryLabel="Publikované články"
              color="emerald"
            />
          </Card>
          <Card className="p-4!">
            <AnalyticsChartCard
              icon={<HandCoins size={20} className="text-amber-400" />}
              title="Počet předplatných v čase"
              apiUrl="/api/dashboard/stats?type=subscriptions-over-time&days=30"
              valueKey="subscriptions"
              categoryLabel="Předplatná"
              color="amber"
            />
          </Card>
          <Card className="p-4! lg:col-span-2">
            <TopArticlesBarCard />
          </Card>
        </div>
      </section>
    </>
  );
}
