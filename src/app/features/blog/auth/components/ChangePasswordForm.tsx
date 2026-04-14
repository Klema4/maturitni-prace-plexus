'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/blog/ui/Button';
import { Input } from '@/app/components/blog/ui/Inputs';
import { ArrowRight, Loader2 } from 'lucide-react';
import { changeUserPassword } from '../api/auth.api';

/**
 * Komponenta pro formulář změny hesla přihlášeného uživatele.
 * @returns {JSX.Element} ChangePasswordForm komponenta.
 */
export function ChangePasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validace
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Nová hesla se neshodují');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Nové heslo musí mít alespoň 8 znaků');
      return;
    }

    setLoading(true);

    try {
      const result = await changeUserPassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (result.error) {
        setError(result.error.message || 'Změna hesla selhala');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/account/profile');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při změně hesla');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm tracking-tight font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm tracking-tight font-medium">
            Heslo bylo úspěšně změněno. Přesměrovávám na profil...
          </div>
        )}

        <Input
          label="Aktuální heslo"
          name="current-password"
          type="password"
          value={formData.currentPassword}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              currentPassword: e.target.value,
            }))
          }
          required
          disabled={loading || success}
          autoComplete="current-password"
          spellCheck={false}
          variant="light"
        />

        <Input
          label="Nové heslo"
          name="new-password"
          type="password"
          value={formData.newPassword}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
          }
          required
          disabled={loading || success}
          autoComplete="new-password"
          minLength={8}
          spellCheck={false}
          variant="light"
        />

        <Input
          label="Potvrzení nového hesla"
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
          size="md"
          className="w-full h-12!"
          disabled={loading || success}
        >
          {loading ? (
            <>
              <Loader2 className='text-white animate-spin' size={16} />
              Měním heslo...
            </>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ArrowRight className='text-white' size={16} />
              Změnit heslo
            </span>
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button
          href="/account/profile"
          variant="subtle"
          size="sm"
        >
          Zpět na profil
        </Button>
      </div>
    </div>
  );
}
