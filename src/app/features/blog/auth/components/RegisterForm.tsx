'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/blog/ui/Button';
import { Input } from '@/app/components/blog/ui/Inputs';
import { ArrowRight, Loader2 } from 'lucide-react';
import { signUpWithEmail } from '../api/auth.api';
import { useAuthSessionRedirect } from '../hooks/useAuthSessionRedirect';

/**
 * Komponenta pro registrační formulář.
 * @returns {JSX.Element} RegisterForm komponenta.
 */
export function RegisterForm() {
  const router = useRouter();
  const { checkingSession } = useAuthSessionRedirect();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
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

    setLoading(true);

    try {
      const result = await signUpWithEmail({
        email: formData.email,
        password: formData.password,
        name: `${formData.name} ${formData.surname}`.trim(),
      });

      if (result.error) {
        setError(result.error.message || 'Registrace selhala');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/account/auth/log-in');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při registraci');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="text-zinc-400 animate-spin" size={24} />
        </div>
      </div>
    );
  }

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
            Registrace úspěšná! Přesměrovávám na přihlášení...
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Jméno"
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            disabled={loading}
            variant="light"
          />

          <Input
            label="Příjmení"
            type="text"
            value={formData.surname}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, surname: e.target.value }))
            }
            required
            disabled={loading}
            variant="light"
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="text"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          required
          disabled={loading}
          variant="light"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Heslo"
            name="new-password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            required
            disabled={loading}
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
            disabled={loading}
            autoComplete="off"
            minLength={8}
            spellCheck={false}
            variant="light"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full h-12!"
          disabled={loading || success}
        >
          {loading ? <><Loader2 className='text-white animate-spin' size={16} /> Registruji...</> : <span className="flex items-center justify-center gap-2"><ArrowRight className='text-white' size={16} /> Registrovat se</span>}
        </Button>
      </form>
    </div>
  );
}
