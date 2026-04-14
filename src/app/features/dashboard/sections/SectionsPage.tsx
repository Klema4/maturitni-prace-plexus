"use client";

import { Card } from "@/components/ui/dashboard/Card";
import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/dashboard/Modal";
import Button from "@/components/ui/dashboard/Button";
import { Input, Toggle } from "@/components/ui/dashboard/Inputs";
import { Layers2, Plus, Edit, Trash2, Save } from "lucide-react";
import { useSectionsPage } from "./hooks/useSectionsPage";

export default function Sections() {
  const {
    sections,
    tags,
    loading,
    error,
    isModalOpen,
    editingSection,
    sectionName,
    sectionDescription,
    isPrimary,
    selectedTagIds,
    openModal,
    closeModal,
    setSectionName,
    setSectionDescription,
    setIsPrimary,
    toggleTag,
    handleSave,
    handleDelete,
  } = useSectionsPage();

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Sekce stránek</Heading>
          <Paragraph>Uprav obsah a strukturu sekcí magazínu.</Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám sekce...</Paragraph>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Sekce stránek</Heading>
          <Paragraph>Uprav obsah a strukturu sekcí magazínu.</Paragraph>
        </header>
        <div className="mt-4">
          <Paragraph color="muted" className="text-red-400">
            {error}
          </Paragraph>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <Heading variant="h1">Sekce stránek</Heading>
        <Paragraph>Uprav obsah a strukturu sekcí magazínu.</Paragraph>
      </header>

      <QuickOptions
        options={[
          {
            label: "Nová sekce",
            variant: "primary",
            icon: Plus,
            onClick: () => openModal(),
          },
        ]}
      />

      <section className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sections.map((section) => (
            <Card key={section.id} className="p-4!">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {section.isPrimary && (
                    <div className="size-1.5 bg-white rounded-full animate-pulse" />
                  )}
                  <Heading variant="h6">{section.name}</Heading>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
                    onClick={() => openModal(section)}
                  >
                    <Edit size={16} className="text-zinc-400" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
                    onClick={() => handleDelete(section.id)}
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
              {section.description && (
                <Paragraph size="extrasmall" className="mt-0">
                  {section.description}
                </Paragraph>
              )}
            </Card>
          ))}
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        size="sm"
      >
        <ModalHeader onClose={closeModal}>
          <div className="flex items-center gap-2">
            <Layers2 className="w-5 h-5 text-blue-400" />
            <span>{editingSection ? "Upravit sekci" : "Nová sekce"}</span>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <Input
            label="Název sekce"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            placeholder="Zadej název..."
            maxLength={128}
            description={`${sectionName.length}/128`}
          />
          <Input
            label="Popis"
            value={sectionDescription}
            onChange={(e) => setSectionDescription(e.target.value)}
            placeholder="Zadej popis..."
            maxLength={512}
            description={`${sectionDescription.length}/512`}
          />
          <Toggle
            label="Primární sekce (zobrazí se v navigaci)"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
          />
          <div>
            <Paragraph size="small" className="mb-2 text-zinc-400">
              Tagy sekce
            </Paragraph>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900/40 p-2 space-y-1.5">
              {tags.length === 0 ? (
                <Paragraph size="small" color="muted">
                  Žádné tagy k dispozici
                </Paragraph>
              ) : (
                tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                      className="w-4 h-4 rounded bg-zinc-800 border-zinc-700"
                    />
                    <span>{tag.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-end gap-2">
            <Button
              href="#"
              variant="outline"
              onClick={closeModal}
            >
              Zrušit
            </Button>
            <Button
              href="#"
              variant="primary"
              onClick={handleSave}
              UseIcon={Save}
            >
              Uložit
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
}
