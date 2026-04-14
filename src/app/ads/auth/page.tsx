import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdsAuthPage from "@/app/features/ads/auth/AdsAuthPage";
import { auth } from "@/lib/auth";
import { resolveCompanyAdsRedirectDestination } from "@/lib/services/companyAdsRoutingService";

export const dynamic = "force-dynamic";

/**
 * Route `/ads/auth`.
 * Pokud je uživatel již přihlášen, přesměruje ho do firemního workspace
 * (nebo na registraci firmy). Nepřihlášeným uživatelům zobrazí
 * přihlašovací stránku pro firemní reklamy.
 * @returns {Promise<JSX.Element | never>} Login stránka nebo redirect.
 */
export default async function Page() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (session?.user?.id) {
    const destination = await resolveCompanyAdsRedirectDestination();
    redirect(destination);
  }

  return <AdsAuthPage />;
}

