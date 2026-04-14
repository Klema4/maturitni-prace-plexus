import { Suspense } from 'react';
import ChangePasswordTokenPage from '@/app/features/blog/auth/ChangePasswordTokenPage';
import { AuthLayout } from '@/app/features/blog/auth/components/AuthLayout';
import { AuthHeader } from '@/app/features/blog/auth/components/AuthHeader';
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Nastavení nového hesla",
};

type PageProps = {
  params: Promise<{ changeId: string }>;
};

/**
 * Obalová komponenta pro přístup k params uvnitř Suspense boundary.
 */
async function ChangePasswordTokenWrapper({ params }: PageProps) {
  const { changeId } = await params;
  return <ChangePasswordTokenPage changeId={changeId} />;
}

/**
 * Stránka pro změnu hesla s tokenem
 * 
 * Umožňuje uživatelům nastavit nové heslo pomocí tokenu z emailu.
 */
export default function ChangePasswordTokenRoute({ params }: PageProps) {
  return (
    <Suspense fallback={
      <AuthLayout>
        <div className="w-full max-w-md space-y-8">
          <AuthHeader 
            title="Načítám..." 
            description="Prosím počkejte" 
          />
        </div>
      </AuthLayout>
    }>
      <ChangePasswordTokenWrapper params={params} />
    </Suspense>
  );
}
