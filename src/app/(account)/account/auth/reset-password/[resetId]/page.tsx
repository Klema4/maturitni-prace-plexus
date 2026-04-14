import { Suspense } from 'react';
import ResetPasswordTokenPage from '@/app/features/blog/auth/ResetPasswordTokenPage';
import { AuthLayout } from '@/app/features/blog/auth/components/AuthLayout';
import { AuthHeader } from '@/app/features/blog/auth/components/AuthHeader';
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Nastavení nového hesla",
};

type PageProps = {
  params: Promise<{ resetId: string }>;
};

/**
 * Obalová komponenta pro přístup k params uvnitř Suspense boundary.
 */
async function ResetPasswordTokenWrapper({ params }: PageProps) {
  const { resetId } = await params;
  return <ResetPasswordTokenPage resetId={resetId} />;
}

/**
 * Stránka pro reset hesla s tokenem
 * 
 * Umožňuje uživatelům nastavit nové heslo pomocí tokenu z emailu.
 */
export default function ResetPasswordTokenRoute({ params }: PageProps) {
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
      <ResetPasswordTokenWrapper params={params} />
    </Suspense>
  );
}
