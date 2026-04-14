"use client";

import { Activity, Award, Clock, PieChart } from "lucide-react";
import { Card } from "@/components/ui/dashboard/Card";
import { StatsCard } from "@/components/ui/dashboard/StatsCard";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { OverviewChartCard } from "./components/OverviewChartCard";
import { useOverviewPage } from "./hooks/useOverviewPage";

export default function Overview() {
  const { stats, loading, error } = useOverviewPage();

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Přehled</Heading>
          <Paragraph>Aktuální statistiky a živé grafy magazínu.</Paragraph>
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
          <Heading variant="h1">Přehled</Heading>
          <Paragraph>Aktuální statistiky a živé grafy magazínu.</Paragraph>
        </header>
        <div className="mt-4">
          <Paragraph color="muted" className="text-red-400">
            {error}
          </Paragraph>
        </div>
      </>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("cs-CZ").format(num);
  };

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const topArticleTitle = stats?.topArticle?.title || "Žádný článek";
  const topArticleViews = stats?.topArticle?.viewCount || 0;

  return (
    <>
      <header>
        <Heading variant="h1">Přehled</Heading>
        <Paragraph>Aktuální statistiky a živé grafy magazínu.</Paragraph>
      </header>
      <section className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            icon={<Activity size={20} />}
            label="Dnes"
            value={formatNumber(stats?.todayViews || 0)}
            helperText="Návštěv"
          />
          <StatsCard
            icon={<Clock size={20} />}
            label="Průměrná doba"
            value={formatTime(stats?.averageTimeOnPage || 0)}
            helperText="Minut na stránce"
          />
          <StatsCard
            icon={<Award size={20} />}
            label="Top článek"
            value={
              topArticleTitle.length > 20
                ? `${topArticleTitle.substring(0, 20)}...`
                : topArticleTitle
            }
            helperText={`${formatNumber(topArticleViews)} zobrazení`}
          />
        </div>
      </section>
      <section className="mt-6">
        <Heading variant="h3">Statistiky</Heading>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-4!">
            <OverviewChartCard
              icon={<PieChart size={20} className="text-purple-400" />}
              title="Rozdělení návštěv"
              apiUrl="/api/dashboard/stats?type=views-over-time&days=30"
              valueKey="views"
              categoryLabel="Zobrazení"
              color="violet"
            />
          </Card>
          <Card className="p-4!">
            <OverviewChartCard
              icon={<Activity size={20} className="text-blue-400" />}
              title="Aktivita v reálném čase"
              apiUrl="/api/dashboard/stats?type=active-users-over-time&days=30"
              valueKey="activeUsers"
              categoryLabel="Uživatelé"
              color="blue"
            />
          </Card>
        </div>
      </section>
    </>
  );
}
