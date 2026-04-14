'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/blog/ui/Button';
import { Lock, Plus, Loader2 } from 'lucide-react';
import { addUserPasskey, deleteUserPasskey, listUserPasskeys, updateUserPasskeyName } from '../api/auth.api';
import PasskeyItem, { type Passkey } from './PasskeyItem';

/**
 * Sekce s passkeys.
 * @returns {JSX.Element} PasskeyCard.
 */
export default function PasskeyCard() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPasskeyName, setNewPasskeyName] = useState('');

  useEffect(() => {
    void loadPasskeys();
  }, []);

  const loadPasskeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listUserPasskeys();
      if (result.data) {
        setPasskeys(
          result.data.map((pk: any) => ({
            ...pk,
            createdAt: pk.createdAt instanceof Date ? pk.createdAt.toISOString() : pk.createdAt,
          })) as Passkey[],
        );
      }
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při načítání passkey');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPasskey = async () => {
    setPasskeyLoading(true);
    setError(null);

    try {
      const result = await addUserPasskey({
        name: newPasskeyName || undefined,
      });

      if (result.error) {
        setError(result.error.message || 'Přidání passkey selhalo');
      } else {
        setNewPasskeyName('');
        await loadPasskeys();
      }
    } catch (err: any) {
      setError(err.message || 'Chyba při přidávání passkey');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleDeletePasskey = async (passkeyId: string) => {
    if (!confirm('Opravdu chcete smazat tento passkey?')) return;

    setPasskeyLoading(true);
    setError(null);

    try {
      await deleteUserPasskey({ id: passkeyId });
      await loadPasskeys();
    } catch (err: any) {
      setError(err.message || 'Chyba při mazání passkey');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleRenamePasskey = async (passkeyId: string, name: string) => {
    setPasskeyLoading(true);
    setError(null);
    try {
      await updateUserPasskeyName({ id: passkeyId, name });
      await loadPasskeys();
    } catch (err: any) {
      setError(err.message || 'Chyba při ukládání názvu passkey');
      throw err;
    } finally {
      setPasskeyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-6 bg-white/75 rounded-xl">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="text-zinc-400 animate-spin" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white/75 rounded-xl">
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="newsreader text-2xl lg:text-3xl font-medium tracking-tighter leading-tight text-dark">Přístupové klíče</h2>
        <p className="text-zinc-600 text-sm font-medium max-w-3xl leading-relaxed tracking-tight">Přidávejte nebo odebírejte přístupové klíče pro bezpečnější přihlášení bez nutnosti hesla.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm tracking-tight">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Přidat nový passkey */}
        <div className="flex items-center gap-3">
          <Lock size={20} className="text-primary mt-0.5 shrink-0" />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newPasskeyName}
              onChange={(e) => setNewPasskeyName(e.target.value)}
              placeholder="Název passkey (volitelné)"
              className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-dark text-sm tracking-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={passkeyLoading}
            />
            <Button
              onClick={handleAddPasskey}
              disabled={passkeyLoading}
              variant="primary"
              size="md"
              className="size-10! p-0!"
            >
              {passkeyLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Plus size={16} />
              )}
            </Button>
          </div>
        </div>

        {/* Seznam passkey */}
        {passkeys.length === 0 ? (
          <div className="text-center py-8">
            <Lock size={32} className="text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 tracking-tight">Nemáte žádné passkey</p>
            <p className="text-xs text-zinc-400 tracking-tight mt-1">Přidejte passkey pro bezpečnější přihlášení</p>
          </div>
        ) : (
          <div className="space-y-4">
            {passkeys.map((passkey) => (
              <PasskeyItem
                key={passkey.id}
                passkey={passkey}
                onDelete={handleDeletePasskey}
                onRename={handleRenamePasskey}
                disabled={passkeyLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
