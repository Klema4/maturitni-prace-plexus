'use client';

import Link from 'next/link';
import { AuthLayout } from './components/AuthLayout';
import { AuthHeader } from './components/AuthHeader';
import { ResetPasswordForm } from './components/ResetPasswordForm';

/**
 * Stránka pro zapomenuté heslo
 * 
 * Umožňuje uživatelům požádat o reset hesla.
 */
export default function ResetPasswordRequestPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <AuthHeader 
          title="Zapomenuté heslo" 
          description="Zadejte svůj email a pošleme vám odkaz pro reset hesla" 
        />
        <ResetPasswordForm />
        <div className="text-center text-sm">
          <Link href="/account/auth/log-in" className="text-primary hover:underline tracking-tight font-medium">
            ← Zpět na přihlášení
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
