'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/blog/ui/Button';
import { Input } from '@/app/components/blog/ui/Inputs';
import { resetPasswordWithToken } from '../api/auth.api';

/**
 * Komponenta pro formulář nastavení nového hesla s tokenem.
 * @param {Object} props - Vlastnosti komponenty.
 * @param {string} props.token - Token pro reset hesla.
 * @returns {JSX.Element} ResetPasswordTokenForm komponenta.
 */
export function ResetPasswordTokenForm({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validace
    if (formData.password !== formData.confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    if (formData.password.length < 8) {
      setError('Heslo musí mít alespoň 8 znaků');
      return;
    }

    if (!token) {
      setError('Chybí token pro reset hesla');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPasswordWithToken({
        newPassword: formData.password,
        token: token,
      });

      if (result.error) {
        setError(result.error.message || 'Reset hesla selhal');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/account/auth/log-in');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při resetu hesla');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-8 rounded-lg border border-zinc-200 shadow-sm"
      >
        {error && (
          <div className="p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm tracking-tight">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm tracking-tight">
            Heslo bylo úspěšně změněno! Přesměrovávám na přihlášení...
          </div>
        )}

        <Input
          label="Nové heslo"
          name="new-password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          required
          disabled={loading || success}
          autoComplete="new-password"
          minLength={8}
          spellCheck={false}
          variant="light"
        />

        <Input
          label="Potvrzení hesla"
          name="confirm-new-password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              confirmPassword: e.target.value,
            }))
          }
          required
          disabled={loading || success}
          autoComplete="off"
          minLength={8}
          spellCheck={false}
          variant="light"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading || success}
        >
          {loading ? 'Ukládám...' : 'Nastavit nové heslo'}
        </Button>
      </form>
    </div>
  );
}
