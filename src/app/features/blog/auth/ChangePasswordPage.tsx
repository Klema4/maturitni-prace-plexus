'use client';

import { AuthLayout } from './components/AuthLayout';
import { AuthHeader } from './components/AuthHeader';
import { ChangePasswordForm } from './components/ChangePasswordForm';

/**
 * Stránka pro změnu hesla (když je uživatel přihlášen)
 */
export default function ChangePasswordPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <AuthHeader 
          title="Změna hesla" 
          description="Zadejte aktuální heslo a nové heslo." 
        />
        <ChangePasswordForm />
      </div>
    </AuthLayout>
  );
}
