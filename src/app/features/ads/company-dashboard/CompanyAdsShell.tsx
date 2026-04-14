"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Container } from "@/app/components/blog/ui/Container";
import { Card } from "@/app/components/blog/ui/Card";
import { companyAdsNavigation } from "@/app/features/ads/company-dashboard/companyAdsNavigation.constants";
import { CompanyAdsProvider, useCompanyAdsContext } from "@/app/features/ads/company-dashboard/CompanyAdsProvider";
import { CompanyAdsSidebar } from "@/app/features/ads/company-dashboard/components/CompanyAdsSidebar";
import { CompanyAdsWorkspaceHeader } from "@/app/features/ads/company-dashboard/components/CompanyAdsWorkspaceHeader";
import { normalizeCompanyAdsWorkspacePathname } from "@/lib/utils/companyAdsRouting";

function CompanyAdsShellInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    activeOrganization,
    organizations,
    role,
    error,
    loading,
    refreshContext,
    switchOrganization,
    buildCompanyHref,
  } = useCompanyAdsContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activePath =
    companyAdsNavigation.find(
      (item) =>
        normalizeCompanyAdsWorkspacePathname(pathname) === item.href,
    )?.href ?? "/firmy/reklamy";

  return (
    <div className="relative">
      <CompanyAdsSidebar
        activeOrganization={activeOrganization}
        activePath={activePath}
        buildCompanyHref={buildCompanyHref}
        isOpen={isSidebarOpen}
        loading={loading}
        onClose={() => setIsSidebarOpen(false)}
        onRefresh={() => {
          void refreshContext();
          router.refresh();
        }}
        onSwitchOrganization={(organizationId) => switchOrganization(organizationId)}
        organizations={organizations}
        role={role}
      />

      <div className="lg:pl-[292px] xl:pl-[304px]">
        <Container size="xl" className="py-8 md:py-12">
          <div className="flex min-w-0 flex-col gap-6">
            <CompanyAdsWorkspaceHeader
              companyName={activeOrganization?.name}
              onOpenMenu={() => setIsSidebarOpen(true)}
            />

            {error ? (
              <Card className="rounded-xl border-rose-200 bg-rose-50/90 p-4 text-sm font-medium tracking-tight text-rose-700">
                {error}
              </Card>
            ) : null}

            <div>{children}</div>
          </div>
        </Container>
      </div>
    </div>
  );
}

function CompanyAdsShellFallback() {
  return (
    <Container size="xl" className="py-8 md:py-12">
      <Card className="rounded-[28px] border-black/6 bg-white/85 p-6 text-sm font-medium tracking-tight text-zinc-500 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.32)] md:p-8">
        Načítám firemní workspace...
      </Card>
    </Container>
  );
}

export default function CompanyAdsShell({
  children,
  companyId,
}: {
  children: React.ReactNode;
  companyId: string;
}) {
  return (
    <Suspense fallback={<CompanyAdsShellFallback />}>
      <CompanyAdsProvider companyId={companyId}>
        <CompanyAdsShellInner>{children}</CompanyAdsShellInner>
      </CompanyAdsProvider>
    </Suspense>
  );
}
