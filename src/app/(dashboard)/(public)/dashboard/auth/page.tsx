import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardLoginPage from "@/app/features/dashboard/auth/DashboardLoginPage";
import { getHasDashboardAccess } from "@/app/features/dashboard/core/dashboardAccess";
import { auth } from "@/lib/auth";

/**
 * Route `/dashboard/auth`
 * Přesměruje přihlášené uživatele podle dashboard přístupu a jinak renderuje login stránku.
 *
 * @returns {Promise<JSX.Element>} Přihlašovací stránka pro dashboard.
 */
export default async function Page() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (session?.user?.id) {
    const hasDashboardAccess = await getHasDashboardAccess(session.user.id);
    redirect(hasDashboardAccess ? "/dashboard" : "/");
  }

  return <DashboardLoginPage />;
}

