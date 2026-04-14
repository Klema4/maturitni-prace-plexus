'use client';

import { AuthLayout } from './components/AuthLayout';
import { AuthHeader } from './components/AuthHeader';
import { ChangeEmailForm } from './components/ChangeEmailForm';

/**
 * Stránka pro změnu emailu
 */
export default function ChangeEmailPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <AuthHeader 
          title="Změna emailu" 
          description="Zadejte nový email. Ověřovací email bude odeslán na novou adresu." 
        />
        <ChangeEmailForm />
      </div>
    </AuthLayout>
  );
}
