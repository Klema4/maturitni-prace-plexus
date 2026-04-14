'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/blog/ui/Button';
import { Input } from '@/app/components/blog/ui/Inputs';
import { ArrowRight, Loader2 } from 'lucide-react';
import { changeUserEmail } from '../api/auth.api';

/**
 * Komponenta pro formulář změny emailu přihlášeného uživatele.
 * @returns {JSX.Element} ChangeEmailForm komponenta.
 */
export function ChangeEmailForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const result = await changeUserEmail({
        newEmail,
        callbackURL: '/account/profile',
      });

      if (result.error) {
        setError(result.error.message || 'Změna emailu selhala');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/account/profile');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při změně emailu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm tracking-tight font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm tracking-tight font-medium">
            Ověřovací email byl odeslán na novou adresu. Zkontrolujte svou schránku.
          </div>
        )}

        <Input
          label="Nový email"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
          disabled={loading || success}
          autoComplete="email"
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
              Odesílám...
            </>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ArrowRight className='text-white' size={16} />
              Změnit email
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
