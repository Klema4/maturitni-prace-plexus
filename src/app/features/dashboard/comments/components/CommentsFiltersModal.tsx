"use client";

import { Filter } from "lucide-react";
import Button from "@/components/ui/dashboard/Button";
import { Toggle } from "@/components/ui/dashboard/Inputs";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/dashboard/Modal";

/**
 * Modal pro filtry seznamu komentářů v dashboardu.
 *
 * @param {Object} props - Props komponenty.
 * @param {boolean} props.isOpen - Zda je modal otevřený.
 * @param {() => void} props.onClose - Callback pro zavření.
 * @param {boolean} props.onlyReported - Jen reportované komentáře.
 * @param {(next: boolean) => void} props.onOnlyReportedChange - Změna onlyReported.
 * @param {boolean} props.hideHidden - Nezobrazovat skryté komentáře.
 * @param {(next: boolean) => void} props.onHideHiddenChange - Změna hideHidden.
 * @returns {JSX.Element} Modal s filtry.
 */
export function CommentsFiltersModal({
  isOpen,
  onClose,
  onlyReported,
  onOnlyReportedChange,
  hideHidden,
  onHideHiddenChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  onlyReported: boolean;
  onOnlyReportedChange: (next: boolean) => void;
  hideHidden: boolean;
  onHideHiddenChange: (next: boolean) => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader onClose={onClose}>
        <span className="flex items-center gap-2">
          <Filter size={18} />
          Filtrování
        </span>
      </ModalHeader>
      <ModalBody className="space-y-2">
        <Toggle
          label="Pouze reportované"
          description="Zobrazí jen komentáře s pending reporty."
          checked={onlyReported}
          onChange={(event) => onOnlyReportedChange(event.target.checked)}
        />
        <Toggle
          label="Skrýt skryté"
          description="Nezobrazovat už skryté komentáře."
          checked={hideHidden}
          onChange={(event) => onHideHiddenChange(event.target.checked)}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          href="#"
          variant="outline"
          onClick={onClose}
          className="cursor-pointer tracking-tight"
        >
          Zavřít
        </Button>
      </ModalFooter>
    </Modal>
  );
}

