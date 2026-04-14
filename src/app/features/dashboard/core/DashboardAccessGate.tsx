import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { getHasDashboardAccess } from "@/app/features/dashboard/core/dashboardAccess";

export default async function DashboardAccessGate({
  children,
}: {
  children: ReactNode;
}) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id) {
    redirect("/dashboard/auth");
  }

  const hasDashboardAccess = await getHasDashboardAccess(session.user.id);
  if (!hasDashboardAccess) {
    redirect("/");
  }

  return <>{children}</>;
}
