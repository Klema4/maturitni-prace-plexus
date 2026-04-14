'use client'

import { Card } from "@/components/ui/dashboard/Card";
import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/dashboard/Modal";
import Button from "@/components/ui/dashboard/Button";
import { Input } from "@/components/ui/dashboard/Inputs";
import { Plus, Edit, Trash2, Hash, Save } from "lucide-react";
import { useTagsPage } from "./hooks/useTagsPage";

export default function Tags() {
  const {
    tags,
    loading,
    error,
    isModalOpen,
    editingTag,
    tagName,
    tagDescription,
    openModal,
    closeModal,
    setTagName,
    setTagDescription,
    handleSave,
    handleDelete,
  } = useTagsPage();

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Štítky</Heading>
          <Paragraph>Spravuj štítky a kategorie článků.</Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám štítky...</Paragraph>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Štítky</Heading>
          <Paragraph>Spravuj štítky a kategorie článků.</Paragraph>
        </header>
        <div className="mt-4">
          <Paragraph color="muted" className="text-red-400">{error}</Paragraph>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <Heading variant="h1">Štítky</Heading>
        <Paragraph>Spravuj štítky a kategorie článků.</Paragraph>
      </header>
      
      <QuickOptions options={[
        { label: "Nový štítek", variant: "primary", icon: Plus, onClick: () => openModal() },
      ]} />

      <section className="mt-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {tags.map((tag) => (
            <Card key={tag.id} onClick={() => openModal(tag)} interactive className="p-3!">
              <div className="flex items-start justify-between mb-2">
                <Heading variant="h6">{tag.name}</Heading>
                <div className="flex items-center gap-1">
                  <button 
                    className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
                    onClick={() => openModal(tag)}
                  >
                    <Edit size={16} className="text-zinc-400" />
                  </button>
                  <button 
                    className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
                    onClick={() => handleDelete(tag.id)}
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
              {tag.description && (
                <Paragraph size="small" className="mt-2 truncate">{tag.description}</Paragraph>
              )}
            </Card>
          ))}
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={closeModal} size="sm">
        <ModalHeader onClose={closeModal}>
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-blue-400" />
            <span>{editingTag ? 'Upravit štítek' : 'Nový štítek'}</span>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <Input
            label="Název štítku"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="Zadej název..."
            maxLength={32}
            description={`${tagName.length}/32`}
          />
          <Input
            label="Popis"
            value={tagDescription}
            onChange={(e) => setTagDescription(e.target.value)}
            placeholder="Zadej krátký popis..."
            maxLength={128}
            description={`${tagDescription.length}/128`}
          />
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-end gap-2">
            <Button href="#" variant="outline" onClick={closeModal}>
              Zrušit
            </Button>
            <Button href="#" variant="primary" onClick={handleSave} UseIcon={Save}>
              Uložit
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
}
