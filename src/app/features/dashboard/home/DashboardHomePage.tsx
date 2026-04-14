import { headers } from "next/headers";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getEffectivePermissionsForUser } from "@/lib/repositories/rolesRepository";
import { getPendingRegistrationsCountService } from "@/lib/services/adsService";
import { getDashboardOverviewStats } from "@/lib/services/dashboardService";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { CategorySection } from "@/app/features/dashboard/core/components/CategorySection";
import { RegistrationsTodoWidget } from "@/app/features/dashboard/home/components/RegistrationsTodoWidget";
import { StatsCard } from "@/components/ui/dashboard/StatsCard";
import { Eye, Users, BookOpen } from "lucide-react";
import { dashboardPages } from "@/app/features/dashboard/core/dashboardNavigation";

/**
 * Hlavní stránka dashboardu s přehledem sekcí a TODO widgetem pro firemní registrace.
 */
async function DashboardHomeContent() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  const [overviewStats, registrationsTodoCount] = await (async () => {
    let pending = 0;

    if (session?.user?.id) {
      const userPermissions = await getEffectivePermissionsForUser(
        session.user.id,
      );
      if (hasPermission(userPermissions, PERMISSIONS.ADS_ORGS_MANAGE)) {
        pending = await getPendingRegistrationsCountService();
      }
    }

    const stats = await getDashboardOverviewStats();
    return [stats, pending] as const;
  })();

  return (
    <>
      <header>
        <Heading variant="h1">Hlavní stránka</Heading>
        <Paragraph>Vítej zpět, uživateli. Přesuň se rychle pomocí kartiček níže.</Paragraph>
      </header>
      <section className="mt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatsCard
            icon={<Eye size={20} />}
            label="Dnešní návštěvy"
            value={new Intl.NumberFormat("cs-CZ").format(
              overviewStats.todayViews,
            )}
            helperText="Zobrazení publikovaných článků dnes"
          />
          <StatsCard
            icon={<Users size={20} />}
            label="Registrovaní uživatelé"
            value={new Intl.NumberFormat("cs-CZ").format(
              overviewStats.totalUsers,
            )}
            helperText="Celkový počet účtů"
          />
          <StatsCard
            icon={<BookOpen size={20} />}
            label="Publikované články"
            value={new Intl.NumberFormat("cs-CZ").format(
              overviewStats.totalArticles,
            )}
            helperText="Aktivní články v magazínu"
          />
        </div>
      </section>
      <section className="mt-6">
        <div className="flex flex-col gap-4">
          {registrationsTodoCount > 0 && (
            <RegistrationsTodoWidget pendingCount={registrationsTodoCount} />
          )}
          {dashboardPages.map((category, index) => (
            <CategorySection
              key={category.category}
              category={category}
              showDivider={index !== dashboardPages.length - 1}
            />
          ))}
        </div>
      </section>
    </>
  );
}

export default function Overview() {
  return (
    <Suspense fallback={null}>
      <DashboardHomeContent />
    </Suspense>
  );
}

