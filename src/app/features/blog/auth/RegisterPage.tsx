'use client';

import { AuthLayout } from './components/AuthLayout';
import { AuthHeader } from './components/AuthHeader';
import { AuthLink } from './components/AuthLink';
import { RegisterForm } from './components/RegisterForm';

/**
 * Registrační stránka
 * 
 * Umožňuje uživatelům zaregistrovat se pomocí emailu a hesla.
 */
export default function RegisterPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <AuthHeader 
          title="Registrace" 
          description="Vytvořte si účet a získejte více od toho, co Plexus nabízí" 
        />
        <RegisterForm />
        <AuthLink 
          text="Již máte účet?" 
          linkText="Přihlásit se" 
          href="/account/auth/log-in" 
        />
      </div>
    </AuthLayout>
  );
}
