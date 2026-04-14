"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createDashboardSection,
  deleteDashboardSection,
  listDashboardSections,
  listDashboardSectionTags,
  updateDashboardSection,
} from "../api/sections.api";
import type { Section, SectionTag } from "../types";

type SectionFormState = {
  sectionName: string;
  sectionDescription: string;
  isPrimary: boolean;
  selectedTagIds: string[];
};

const initialFormState: SectionFormState = {
  sectionName: "",
  sectionDescription: "",
  isPrimary: false,
  selectedTagIds: [],
};

export function useSectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [tags, setTags] = useState<SectionTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formState, setFormState] = useState(initialFormState);

  const loadSections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [sectionsData, tagsData] = await Promise.all([
        listDashboardSections(),
        listDashboardSectionTags(),
      ]);

      setSections(sectionsData);
      setTags(tagsData);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Nastala chyba",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSections();
  }, [loadSections]);

  const resetForm = useCallback(() => {
    setEditingSection(null);
    setFormState(initialFormState);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const openModal = useCallback((section?: Section) => {
    if (section) {
      setEditingSection(section);
      setFormState({
        sectionName: section.name,
        sectionDescription: section.description || "",
        isPrimary: section.isPrimary,
        selectedTagIds: section.tags.map((tag) => tag.id),
      });
    } else {
      setEditingSection(null);
      setFormState(initialFormState);
    }

    setIsModalOpen(true);
  }, []);

  const setSectionName = useCallback((value: string) => {
    setFormState((current) => ({ ...current, sectionName: value }));
  }, []);

  const setSectionDescription = useCallback((value: string) => {
    setFormState((current) => ({ ...current, sectionDescription: value }));
  }, []);

  const setIsPrimary = useCallback((value: boolean) => {
    setFormState((current) => ({ ...current, isPrimary: value }));
  }, []);

  const toggleTag = useCallback((tagId: string) => {
    setFormState((current) => ({
      ...current,
      selectedTagIds: current.selectedTagIds.includes(tagId)
        ? current.selectedTagIds.filter((id) => id !== tagId)
        : [...current.selectedTagIds, tagId],
    }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const selectedTags = tags.filter((tag) =>
        formState.selectedTagIds.includes(tag.id),
      );

      if (editingSection) {
        const updatedSection = await updateDashboardSection(editingSection.id, {
          name: formState.sectionName,
          description: formState.sectionDescription || null,
          isPrimary: formState.isPrimary,
          tagIds: formState.selectedTagIds,
        });

        setSections((current) =>
          current.map((section) =>
            section.id === editingSection.id
              ? { ...updatedSection, tags: selectedTags }
              : section,
          ),
        );
      } else {
        const createdSection = await createDashboardSection({
          name: formState.sectionName,
          description: formState.sectionDescription || null,
          isPrimary: formState.isPrimary,
          tagIds: formState.selectedTagIds,
        });

        setSections((current) => [
          ...current,
          { ...createdSection, tags: selectedTags },
        ]);
      }

      closeModal();
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : "Nastala chyba");
    }
  }, [closeModal, editingSection, formState, tags]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Opravdu chcete smazat tuto sekci?")) {
      return;
    }

    try {
      await deleteDashboardSection(id);
      setSections((current) =>
        current.filter((section) => section.id !== id),
      );
    } catch (deleteError) {
      alert(
        deleteError instanceof Error ? deleteError.message : "Nastala chyba",
      );
    }
  }, []);

  return {
    sections,
    tags,
    loading,
    error,
    isModalOpen,
    editingSection,
    sectionName: formState.sectionName,
    sectionDescription: formState.sectionDescription,
    isPrimary: formState.isPrimary,
    selectedTagIds: formState.selectedTagIds,
    openModal,
    closeModal,
    setSectionName,
    setSectionDescription,
    setIsPrimary,
    toggleTag,
    handleSave,
    handleDelete,
  };
}
