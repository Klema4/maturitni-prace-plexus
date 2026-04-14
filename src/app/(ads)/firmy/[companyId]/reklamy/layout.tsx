import type { ReactNode } from "react";
import CompanyAdsShell from "@/app/features/ads/company-dashboard/CompanyAdsShell";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ companyId: string }>;
};

export default async function Layout({ children, params }: LayoutProps) {
  const { companyId } = await params;

  return <CompanyAdsShell companyId={companyId}>{children}</CompanyAdsShell>;
}
