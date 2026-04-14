"use client";

import { AuthLayout } from "@/app/features/blog/auth/components/AuthLayout";
import { AuthHeader } from "@/app/features/blog/auth/components/AuthHeader";
import { AdsLoginForm } from "@/app/features/ads/auth/components/AdsLoginForm";

/**
 * AdsAuthPage
 * Stránka pro přihlášení k firemním reklamám.
 * Recykluje veřejný auth layout, ale po přihlášení vede uživatele
 * do vstupního bodu `/frmy`, odkud je přesměrován do organizace
 * nebo na registraci firmy.
 * @returns {JSX.Element} Stránka přihlášení pro firemní reklamy.
 */
export default function AdsAuthPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <AuthHeader
          title="Přihlášení k firemním reklamám"
          description="Přihlaste se do firemního prostoru pro správu reklam."
        />
        <AdsLoginForm />
      </div>
    </AuthLayout>
  );
}

