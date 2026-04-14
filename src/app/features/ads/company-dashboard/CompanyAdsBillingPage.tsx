"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CreditCard, Mail, Megaphone } from "lucide-react";
import { Button } from "@/app/components/blog/ui/Button";
import { useCompanyAdsContext } from "./CompanyAdsProvider";
import { getCompanyAdsBilling } from "./api/companyAds.api";
import type { CompanyAdsBillingResponse } from "./types";
import {
  EmptyState,
  LoadingState,
  MetricCard,
  PageSection,
  Panel,
  formatDate,
  formatNumber,
} from "./components";

export default function CompanyAdsBillingPage() {
  const { activeOrganization, loading: contextLoading } =
    useCompanyAdsContext();
  const [data, setData] = useState<CompanyAdsBillingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedOrgRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  const loadData = useCallback(async () => {
    const orgId = activeOrganization?.id;
    if (!orgId) return;

    if (lastFetchedOrgRef.current === orgId || inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    try {
      setLoading(true);
      setError(null);
      const json = await getCompanyAdsBilling(orgId);
      setData(json);
      lastFetchedOrgRef.current = orgId;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nepodařilo se načíst platební přehled firmy.",
      );
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [activeOrganization?.id]);

  useEffect(() => {
    if (!activeOrganization?.id || contextLoading) return;
    void loadData();
  }, [activeOrganization?.id, contextLoading, loadData]);

  if (contextLoading || loading) {
    return <LoadingState label="Načítám platební přehled..." />;
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Platby nejsou dostupné"
        description={error ?? "Zkuste stránku obnovit."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageSection
        title="Platební přehled firmy"
        description="Orientační pohled na aktivní kampaně, rozpočet a kontakt pro řešení plateb."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Aktivní kampaně"
          value={formatNumber(data.activeCampaigns.length)}
          helper="Základ modelového výpočtu nákladů"
          icon={<Megaphone size={18} />}
        />
        <MetricCard
          label="Měsíční odhad"
          value={`${formatNumber(data.estimatedMonthlySpend)} CZK`}
          helper="5 000 CZK za aktivní kampaň"
          icon={<CreditCard size={18} />}
        />
        <MetricCard
          label="Billing kontakt"
          value={data.supportEmail}
          helper="Podpora pro změny a otázky k účtu"
          icon={<Mail size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Panel
          title="Aktivní kampaně v platebním okně"
          description="Kampaně, které právě vstupují do výpočtu orientačního rozpočtu."
        >
          <div className="space-y-3">
            {data.activeCampaigns.length === 0 ? (
              <EmptyState
                title="Žádná aktivní kampaň"
                description="Jakmile se spustí kampaň, objeví se tady i v billing přehledu."
              />
            ) : (
              data.activeCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="rounded-xl border border-black/6 bg-zinc-50/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-dark">
                        {campaign.name}
                      </p>
                      <p className="mt-1 text-sm font-medium tracking-tight text-zinc-500">
                        {formatDate(campaign.startingAt)} až{" "}
                        {formatDate(campaign.endingAt)}
                      </p>
                    </div>
                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold tracking-tight text-zinc-600">
                      {formatNumber(campaign.viewCount)} zobrazení
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel
          title="Jak s těmito daty pracovat"
          description="Přehled slouží jako průběžná orientace, ne jako ostrá fakturace."
        >
          <div className="space-y-4 text-sm font-medium leading-relaxed tracking-tight text-zinc-600">
            <p>{data.pricingNote}</p>
            <p>
              Všechny částky i kampaně se vztahují pouze k právě vybrané firmě.
            </p>
            <Button
              href={`mailto:${data.supportEmail}`}
              variant="primary"
              size="sm"
              className="bg-dark text-white"
            >
              Napsat na podporu
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
