import type { ReactNode } from "react";
import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdsDashboardService } from "@/lib/services/adsService";

/**
 * AdsDashboardLayout komponenta.
 * Zajišťuje server-side kontrolu přihlášení a oprávnění pro přístup
 * k reklamnímu dashboardu. Pouze uživatelé se schváleným členstvím v organizaci
 * (onboardingStatus === "active") mají přístup. Nelze obejít client-side navigací.
 * @param {Object} props - Vlastnosti pro layout.
 * @param {ReactNode} props.children - Vnořený obsah dashboardu.
 * @returns {Promise<JSX.Element>} Layout obalující obsah reklamního dashboardu.
 */
async function AdsDashboardAuthGate({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id) {
    redirect("/account/auth/log-in");
  }

  const canAccess = await canAccessAdsDashboardService(session.user.id);
  if (!canAccess) {
    redirect("/firmy/registrace?reason=no_org_access");
  }

  return <>{children}</>;
}

export default function AdsDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AdsDashboardAuthGate>{children}</AdsDashboardAuthGate>
    </Suspense>
  );
}

