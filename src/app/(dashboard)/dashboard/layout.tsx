import DashboardAccessGate from "@/app/features/dashboard/core/DashboardAccessGate";
import DashboardShell from "@/app/features/dashboard/core/DashboardShell";

export const dynamic = "force-dynamic";

/**
 * DashboardLayout
 * Server layout pro chráněné části dashboardu.
 * Ověří session i oprávnění a následně obalí obsah shell UI.
 *
 * @param {Object} props - Props layoutu.
 * @param {React.ReactNode} props.children - Obsah stránky.
 * @returns {Promise<JSX.Element>} Layout pro dashboard.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardAccessGate>
      <DashboardShell>{children}</DashboardShell>
    </DashboardAccessGate>
  );
}
