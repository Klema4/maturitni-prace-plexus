'use client';

import { useState } from 'react';
import { Button } from '@/app/components/blog/ui/Button';
import { Input } from '@/app/components/blog/ui/Inputs';
import { requestPasswordReset } from '../api/auth.api';

/**
 * Komponenta pro formulář resetu hesla (odeslání emailu).
 * @returns {JSX.Element} ResetPasswordForm komponenta.
 */
export function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const result = await requestPasswordReset({ email });

      if (result.error) {
        setError(result.error.message || 'Odeslání emailu selhalo');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při odesílání emailu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-lg border border-zinc-200 shadow-sm">
        {error && (
          <div className="p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm tracking-tight">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm tracking-tight">
            Email s odkazem pro reset hesla byl odeslán. Zkontrolujte svou schránku.
          </div>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading || success}
          autoComplete="email"
          variant="light"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading || success}
        >
          {loading ? 'Odesílám...' : 'Odeslat odkaz'}
        </Button>
      </form>
    </div>
  );
}
