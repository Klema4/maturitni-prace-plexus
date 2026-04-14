import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SettingsContent from "./SettingsContent";

/**
 * Stránka nastavení účtu (server component).
 * Provede server-side auth check a zobrazí nastavení účtu.
 * @returns {Promise<JSX.Element>} Nastavení účtu.
 */
export default async function SettingsPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id) {
    redirect("/account/auth/log-in");
  }

  return <SettingsContent />;
}

