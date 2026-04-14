"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { BarChart3, Eye, Megaphone, TimerReset } from "lucide-react";
import { useCompanyAdsContext } from "./CompanyAdsProvider";
import { getCompanyAdsAnalytics } from "./api/companyAds.api";
import type { CompanyAdsAnalyticsResponse } from "./types";
import {
  EmptyState,
  LoadingState,
  MetricCard,
  PageSection,
  Panel,
  formatDate,
  formatNumber,
} from "./components";

export default function CompanyAdsAnalyticsPage() {
  const { activeOrganization, loading: contextLoading } =
    useCompanyAdsContext();
  const [data, setData] = useState<CompanyAdsAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lastFetchedOrgRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  const loadData = useEffectEvent(async () => {
    const orgId = activeOrganization?.id;
    if (!orgId) return;

    if (inFlightRef.current && lastFetchedOrgRef.current === orgId) return;
    if (lastFetchedOrgRef.current === orgId && data) return;

    try {
      inFlightRef.current = true;
      setLoading(true);
      setError(null);
      const json = await getCompanyAdsAnalytics(orgId);
      setData(json);
      lastFetchedOrgRef.current = orgId;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nepodařilo se načíst analytiku firmy.",
      );
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!activeOrganization?.id || contextLoading) return;
    void loadData();
  }, [activeOrganization?.id, contextLoading, loadData]);

  if (contextLoading || loading) {
    return <LoadingState label="Načítám analytiku firmy..." />;
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Analytika není dostupná"
        description={error ?? "Zkuste stránku obnovit."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageSection
        title="Výkon reklam vaší firmy"
        description="Jen data kampaní, které skutečně patří vybrané firmě."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Celková zobrazení"
          value={formatNumber(data.stats.totalViews)}
          helper="Součet view count napříč všemi kampaněmi firmy"
          icon={<Eye size={18} />}
        />
        <MetricCard
          label="Aktivní"
          value={formatNumber(data.stats.activeCampaigns)}
          helper="Kampaně běžící právě teď"
          icon={<Megaphone size={18} />}
        />
        <MetricCard
          label="Plánované"
          value={formatNumber(data.stats.plannedCampaigns)}
          helper="Kampaně čekající na spuštění"
          icon={<TimerReset size={18} />}
        />
        <MetricCard
          label="Dokončené"
          value={formatNumber(data.stats.finishedCampaigns)}
          helper="Historie kampaní firmy"
          icon={<BarChart3 size={18} />}
        />
      </div>

      <Panel
        title="Top kampaně podle zobrazení"
        description="Kampaně s nejvyšším počtem zobrazení v rámci právě vybrané firmy."
      >
        <div className="space-y-3">
          {data.topCampaigns.length === 0 ? (
            <EmptyState
              title="Zatím není co porovnávat"
              description="Jakmile kampaně nasbírají zobrazení, projeví se tady pořadí výkonu."
            />
          ) : (
            data.topCampaigns.map((campaign, index) => (
              <div
                key={campaign.id}
                className="rounded-xl border border-black/6 bg-zinc-50/70 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold tracking-tight text-dark">
                      {campaign.name}
                    </p>
                    <p className="mt-1 text-sm font-medium tracking-tight text-zinc-500">
                      #{index + 1} podle zobrazení
                    </p>
                    <p className="mt-1 text-sm font-medium tracking-tight text-zinc-500">
                      {formatDate(campaign.startingAt)} až{" "}
                      {formatDate(campaign.endingAt)}
                    </p>
                  </div>
                  <div className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold tracking-tight text-dark">
                    {formatNumber(campaign.viewCount)} zobrazení
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
