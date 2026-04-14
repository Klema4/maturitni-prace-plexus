'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/app/components/blog/ui/Button';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/components/ui/Modal';

/**
 * Dialog pro nahlášení komentáře/článku.
 * @param {ReportDialogProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element | null} ReportDialog.
 */
type ReportDialogEntityType = 'comment' | 'article';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  entityType?: ReportDialogEntityType;
}

export function ReportDialog({
  isOpen,
  onClose,
  onSubmit,
  entityType = 'comment',
}: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError('Důvod reportu nemůže být prázdný');
      return;
    }

    if (trimmedReason.length > 2000) {
      setError('Důvod reportu může mít maximálně 2000 znaků');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(trimmedReason);
      setReason('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se odeslat report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="lg">
      <DialogHeader onClose={handleClose}>
        <div className="flex items-center gap-3">
          <AlertTriangle size={22} className="text-rose-500" />
          <div>
            Nahlásit {entityType === 'comment' ? 'komentář' : 'článek'}
            <p className="text-sm text-zinc-600 font-medium tracking-tight">
              Pomozte nám udržet komunitu bezpečnou
            </p>
          </div>
        </div>
      </DialogHeader>
      <DialogBody className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-600 mb-2 tracking-tight">
            Důvod reportu
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="Popište, proč chcete tento obsah nahlásit..."
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm font-medium tracking-tight"
            rows={5}
            maxLength={2000}
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-zinc-600 font-medium tracking-tight">{reason.length}/2000 znaků</p>
            {error && <p className="text-xs text-rose-500 font-medium tracking-tight">{error}</p>}
          </div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
          <p className="text-xs text-zinc-600 font-medium tracking-tight">
            <strong>Tip:</strong> Uveďte konkrétní důvod, proč považujete tento obsah za nevhodný.
            Vaše hlášení bude přezkoumáno administrátory.
          </p>
        </div>
      </DialogBody>
      <DialogFooter className="gap-3">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handleClose}
          disabled={isSubmitting}
          className="tracking-tight cursor-pointer flex-1"
        >
          Zrušit
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={isSubmitting || !reason.trim()}
          className="tracking-tight cursor-pointer flex-1"
        >
          {isSubmitting ? 'Odesílám...' : 'Nahlásit'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
