"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Megaphone,
  Users,
} from "lucide-react";
import { useCompanyAdsContext } from "./CompanyAdsProvider";
import type { CompanyAdsOverviewResponse } from "./types";
import {
  EmptyState,
  InvitePill,
  LoadingState,
  MemberPill,
  MetricCard,
  PageSection,
  Panel,
  formatDate,
  formatNumber,
} from "./components";
import { getCompanyAdsOverview } from "./api/companyAds.api";

export default function CompanyAdsOverviewPage() {
  const {
    activeOrganization,
    buildCompanyHref,
    loading: contextLoading,
  } = useCompanyAdsContext();
  const [data, setData] = useState<CompanyAdsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lastFetchedOrgRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  const loadData = useCallback(async () => {
    if (!activeOrganization?.id) {
      return;
    }

    const orgId = activeOrganization.id;

    // Přeskočí načtení, pokud už jsme tuto organizaci načetli nedávno nebo už běží požadavek
    if (lastFetchedOrgRef.current === orgId || inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    try {
      setLoading(true);
      setError(null);
      const json = (await getCompanyAdsOverview(
        orgId,
      )) as CompanyAdsOverviewResponse;
      setData(json);
      lastFetchedOrgRef.current = orgId;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nepodařilo se načíst přehled firmy.",
      );
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [activeOrganization?.id]);

  useEffect(() => {
    if (!activeOrganization?.id || contextLoading) {
      return;
    }

    // `loadData` už hlídá duplicitní a souběžné požadavky
    void loadData();
  }, [activeOrganization?.id, contextLoading, loadData]);

  if (contextLoading || loading) {
    return <LoadingState label="Načítám firemní přehled..." />;
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Přehled se nepodařilo načíst"
        description={error ?? "Zkuste stránku obnovit."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageSection
        title={`Reklamy pro ${data.organization.name}`}
        description="Rychlý souhrn kampaní, týmu a nejbližších kroků pro právě vybranou firmu."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Aktivní kampaně"
          value={formatNumber(data.stats.activeCampaigns)}
          helper={`${formatNumber(data.stats.totalCampaigns)} kampaní celkem`}
          icon={<Megaphone size={18} />}
        />
        <MetricCard
          label="Plánované kampaně"
          value={formatNumber(data.stats.plannedCampaigns)}
          helper="Nejbližší spuštění najdete níže"
          icon={<CalendarDays size={18} />}
        />
        <MetricCard
          label="Celková zobrazení"
          value={formatNumber(data.stats.totalViews)}
          helper="Součet zobrazení napříč firemními kampaněmi"
          icon={<BarChart3 size={18} />}
        />
        <MetricCard
          label="Odhad měsíční útraty"
          value={`${formatNumber(data.estimatedMonthlySpend)} CZK`}
          helper="Orientační rozpočet podle právě aktivních kampaní"
          icon={<CreditCard size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Panel
          title="Nejbližší kampaně"
          description="Co se spouští v dalších dnech a týdnech."
        >
          <div className="space-y-3">
            {data.upcomingCampaigns.length === 0 ? (
              <EmptyState
                title="Žádná kampaň nečeká na spuštění"
                description="Novou kampaň můžete založit přímo z firemního workspace."
              />
            ) : (
              data.upcomingCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold tracking-tight text-dark">
                        {campaign.name}
                      </p>
                      {campaign.description ? (
                        <p className="mt-1 text-sm font-medium tracking-tight text-zinc-500">
                          {campaign.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold tracking-tight text-zinc-600">
                      {formatNumber(campaign.viewCount)} zobrazení
                    </span>
                  </div>
                  <div className="mt-3 text-sm font-medium tracking-tight text-zinc-500">
                    {formatDate(campaign.startingAt)} až{" "}
                    {formatDate(campaign.endingAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel
            title="Tým firmy"
            description="Lidé, kteří mají do této firmy přístup."
          >
            <div className="space-y-3">
              {data.membersPreview.length === 0 ? (
                <EmptyState
                  title="Firma zatím nemá další členy"
                  description="Pozvěte další správce nebo čtenáře do týmové sekce."
                />
              ) : (
                data.membersPreview.map((member) => (
                  <MemberPill key={member.userId} member={member} />
                ))
              )}
            </div>
          </Panel>

          <Panel
            title="Čekající pozvánky"
            description="Koho ještě čeká potvrzení pozvánky."
          >
            <div className="space-y-3">
              {data.pendingInvites.length === 0 ? (
                <EmptyState
                  title="Žádná pozvánka nečeká"
                  description="Jakmile někoho pozvete, objeví se tady jeho stav."
                />
              ) : (
                data.pendingInvites.map((invite) => (
                  <InvitePill key={invite.id} invite={invite} />
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
