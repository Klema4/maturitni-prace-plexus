import { redirect } from "next/navigation";
import { resolveCompanyAdsRedirectDestination } from "@/lib/services/companyAdsRoutingService";

export const dynamic = "force-dynamic";

/**
 * Route `/frmy`.
 * Vstupní bod pro firemní reklamy – podle stavu uživatele
 * přesměruje buď do firemního workspace, na registraci firmy,
 * nebo na přihlašovací stránku reklam `/ads/auth`.
 * @returns {Promise<never>} Okamžité přesměrování na cílovou URL.
 */
export default async function Page() {
  const destination = await resolveCompanyAdsRedirectDestination();
  redirect(destination);
}

