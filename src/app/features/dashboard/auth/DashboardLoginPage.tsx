'use client';

import { AuthLayout } from "@/app/features/blog/auth/components/AuthLayout";
import { AuthHeader } from "@/app/features/blog/auth/components/AuthHeader";
import { DashboardLoginForm } from "./components/DashboardLoginForm";

/**
 * DashboardLoginPage
 * Stránka pro přihlášení do administrátorského dashboardu.
 * Recykluje veřejný auth layout, ale bez registrace – jen přihlášení.
 *
 * @returns {JSX.Element} Stránka přihlášení do dashboardu.
 */
export default function DashboardLoginPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <AuthHeader
          title="Přihlášení do redakce"
          description="Přihlaste se do administrátorského dashboardu Plexus."
        />
        <DashboardLoginForm />
      </div>
    </AuthLayout>
  );
}

