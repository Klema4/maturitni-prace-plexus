"use client";

import { Search } from "lucide-react";
import Button from "@/components/ui/dashboard/Button";
import { Input } from "@/components/ui/dashboard/Inputs";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/dashboard/Modal";

/**
 * Modal pro vyhledávání v komentářích (dashboard).
 * Udržuje draft hodnotu v parentu a aplikuje ji až po potvrzení.
 * @param {Object} props - Props komponenty.
 * @param {boolean} props.isOpen - Zda je modal otevřený.
 * @param {() => void} props.onClose - Zavření modalu.
 * @param {string} props.value - Draft query.
 * @param {(next: string) => void} props.onChange - Změna draft query.
 * @param {() => void} props.onSubmit - Potvrzení vyhledávání.
 * @param {() => void} props.onClear - Vymazání vyhledávání.
 * @returns {JSX.Element} Modal s vyhledáváním.
 */
export function CommentsSearchModal({
  isOpen,
  onClose,
  value,
  onChange,
  onSubmit,
  onClear,
}: {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader onClose={onClose}>
        <span className="flex items-center gap-2 tracking-tight">
          <Search size={18} />
          Vyhledávání
        </span>
      </ModalHeader>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <ModalBody className="space-y-3">
          <Input
            label="Hledat"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Autor, obsah nebo článek…"
            maxLength={256}
            autoFocus
          />
        </ModalBody>
        <ModalFooter className="justify-between">
          <Button
            href="#"
            variant="outline"
            onClick={() => {
              onClear();
              onClose();
            }}
            className="cursor-pointer tracking-tight"
          >
            Vymazat
          </Button>
          <div className="flex items-center gap-2">
            <Button
              href="#"
              variant="outline"
              onClick={onClose}
              className="cursor-pointer tracking-tight"
            >
              Zavřít
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="cursor-pointer tracking-tight"
            >
              <Search size={16} />
              Vyhledat
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}

