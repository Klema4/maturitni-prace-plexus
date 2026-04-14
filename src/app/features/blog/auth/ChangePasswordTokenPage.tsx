'use client';

import Link from 'next/link';
import { AuthLayout } from './components/AuthLayout';
import { AuthHeader } from './components/AuthHeader';
import { ResetPasswordTokenForm } from './components/ResetPasswordTokenForm';

/**
 * Stránka pro změnu hesla s tokenem
 * 
 * Umožňuje uživatelům nastavit nové heslo pomocí tokenu z emailu.
 * @param {Object} props - Vlastnosti komponenty.
 * @param {string} props.changeId - Token pro změnu hesla z URL parametru.
 */
export default function ChangePasswordTokenPage({ changeId }: { changeId: string }) {
  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <AuthHeader 
          title="Nastavit nové heslo" 
          description="Zadejte nové heslo pro svůj účet" 
        />
        <ResetPasswordTokenForm token={changeId} />
        <div className="text-center text-sm">
          <Link href="/account/auth/log-in" className="text-primary hover:underline tracking-tight font-medium">
            ← Zpět na přihlášení
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
