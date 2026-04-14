'use client';

import Link from 'next/link';
import { AuthLayout } from './components/AuthLayout';
import { AuthHeader } from './components/AuthHeader';
import { AuthLink } from './components/AuthLink';
import { LoginForm } from './components/LoginForm';

/**
 * Přihlašovací stránka
 * 
 * Umožňuje uživatelům přihlásit se pomocí:
 * - Email + Password
 * - Passkey (WebAuthn)
 */
export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <AuthHeader 
          title="Přihlášení" 
          description="Přihlaste se do svého účtu" 
        />
        <LoginForm />
        <AuthLink 
          text="Nemáte účet?" 
          linkText="Zaregistrovat se" 
          href="/account/auth/register" 
        />
      </div>
    </AuthLayout>
  );
}
