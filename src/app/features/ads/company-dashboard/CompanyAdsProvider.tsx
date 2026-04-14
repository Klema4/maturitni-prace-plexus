"use client";

import {
  createContext,
  ReactNode,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { CompanyAdsContextResponse } from "./types";
import { getCompanyAdsContext } from "./api/companyAds.api";
import {
  buildCompanyAdsWorkspacePath,
  normalizeCompanyAdsWorkspacePathname,
} from "@/lib/utils/companyAdsRouting";

type CompanyAdsContextValue = CompanyAdsContextResponse & {
  loading: boolean;
  error: string | null;
  refreshContext: () => Promise<void>;
  switchOrganization: (organizationId: string) => void;
  buildCompanyHref: (pathname: string, organizationId?: string | null) => string;
};

const CompanyAdsContext = createContext<CompanyAdsContextValue | null>(null);

export function CompanyAdsProvider({
  children,
  companyId,
}: {
  children: ReactNode;
  companyId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<CompanyAdsContextResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildCompanyHref = (targetPathname: string, organizationId?: string | null) => {
    const nextOrganizationId =
      organizationId ?? state?.activeOrganization.id ?? companyId;

    if (!nextOrganizationId) {
      return normalizeCompanyAdsWorkspacePathname(targetPathname);
    }

    return buildCompanyAdsWorkspacePath(nextOrganizationId, targetPathname);
  };

  const loadContext = useEffectEvent(async () => {
    try {
      setLoading(true);
      setError(null);
      const json = (await getCompanyAdsContext(companyId)) as CompanyAdsContextResponse;
      
      // Stav aktualizuj jen tehdy, když se opravdu změnil, aby nevznikaly smyčky přerenderování
      setState(prev => {
        if (JSON.stringify(prev) === JSON.stringify(json)) return prev;
        return json;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepodařilo se načíst kontext firmy.");
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    void loadContext();
  }, [companyId]); // `loadContext` je záměrně mimo dependency list, aby nevznikaly smyčky při nestabilní referenci

  useEffect(() => {
    if (!state?.activeOrganization?.id) {
      return;
    }

    const activeOrganizationId = state.activeOrganization.id;
    const normalizedPath = normalizeCompanyAdsWorkspacePathname(pathname);

    if (companyId !== activeOrganizationId) {
      startTransition(() => {
        router.replace(
          buildCompanyAdsWorkspacePath(activeOrganizationId, normalizedPath),
        );
      });
    }
  }, [companyId, pathname, router, state?.activeOrganization?.id]);

  const refreshContext = async () => {
    await loadContext();
  };

  const switchOrganization = (organizationId: string) => {
    const normalizedPath = normalizeCompanyAdsWorkspacePathname(pathname);
    document.cookie = `activeAdsOrganizationId=${organizationId}; Max-Age=${60 * 60 * 24 * 30}; Path=/; SameSite=Lax`;
    startTransition(() => {
      router.push(buildCompanyAdsWorkspacePath(organizationId, normalizedPath));
    });
  };

  const value: CompanyAdsContextValue = {
    organizations: state?.organizations ?? [],
    activeOrganization: state?.activeOrganization ?? (null as never),
    role: state?.role ?? "viewer",
    canManage: state?.canManage ?? false,
    loading,
    error,
    refreshContext,
    switchOrganization,
    buildCompanyHref,
  };

  return <CompanyAdsContext value={value}>{children}</CompanyAdsContext>;
}

export function useCompanyAdsContext() {
  const context = useContext(CompanyAdsContext);

  if (!context) {
    throw new Error("useCompanyAdsContext must be used within CompanyAdsProvider");
  }

  return context;
}
