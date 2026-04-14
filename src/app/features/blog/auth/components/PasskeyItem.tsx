'use client';

import { useState } from 'react';
import { Button } from '@/app/components/blog/ui/Button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import { Lock, Pencil, Trash2 } from 'lucide-react';
import { formatPublishedAt } from '@/lib/utils/date';

/**
 * Typ passkey pro UI.
 */
export interface Passkey {
  id: string;
  name: string | null;
  credentialID: string;
  deviceType: string | null;
  backedUp: boolean;
  createdAt: Date | string;
}

/**
 * Props pro `PasskeyItem`.
 */
interface PasskeyItemProps {
  passkey: Passkey;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => Promise<void>;
  disabled?: boolean;
}

/**
 * Řádek s jedním passkey.
 * @param {PasskeyItemProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} PasskeyItem.
 */
export default function PasskeyItem({
  passkey,
  onDelete,
  onRename,
  disabled = false,
}: PasskeyItemProps) {
  const [draftName, setDraftName] = useState(passkey.name ?? '');
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const displayName = passkey.name?.trim() ? passkey.name : 'Bez názvu';

  const openRename = () => {
    setDraftName(passkey.name ?? '');
    setIsRenameOpen(true);
  };

  const closeRename = () => {
    if (isSaving) return;
    setIsRenameOpen(false);
  };

  /**
   * Uloží nový název passkey.
   * @returns {Promise<void>} Promise.
   */
  const saveRename = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      await onRename(passkey.id, draftName.trim());
      setIsRenameOpen(false);
    } catch {
      /* chyba v PasskeyCard */
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Lock size={20} className="text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-md text-dark font-semibold tracking-tight truncate">{displayName}</p>
            <p className="text-sm text-zinc-700 font-medium tracking-tight">
              {passkey.backedUp ? 'Zálohováno' : 'Nezálohováno'} • {formatPublishedAt(passkey.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openRename}
            disabled={disabled}
            className="size-10! p-0! cursor-pointer"
            aria-label="Přejmenovat passkey"
          >
            <Pencil size={16} />
          </Button>
          <Button
            type="button"
            variant="subtleDanger"
            size="sm"
            onClick={() => onDelete(passkey.id)}
            disabled={disabled}
            className="size-10! p-0! cursor-pointer"
            aria-label="Smazat passkey"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      <Modal isOpen={isRenameOpen} onClose={closeRename} size="sm">
        <ModalHeader onClose={closeRename}>Přejmenovat passkey</ModalHeader>
        <ModalBody className="space-y-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 tracking-tight">Název</label>
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Např. iPhone, MacBook…"
              disabled={disabled || isSaving}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm font-medium tracking-tight"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void saveRename();
                }
              }}
            />
          </div>
          <p className="text-xs text-zinc-500 font-medium tracking-tight">
            Pokud necháte pole prázdné, zobrazí se „Bez názvu“.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={closeRename}
            disabled={disabled || isSaving}
            className="tracking-tight cursor-pointer flex-1"
          >
            Zrušit
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => void saveRename()}
            disabled={disabled || isSaving}
            className="tracking-tight cursor-pointer flex-1"
          >
            Uložit
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
