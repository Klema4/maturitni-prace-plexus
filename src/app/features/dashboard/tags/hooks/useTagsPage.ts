"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createDashboardTag,
  deleteDashboardTag,
  listDashboardTags,
  updateDashboardTag,
} from "../api/tags.api";
import type { Tag } from "../types";

const initialFormState = {
  tagName: "",
  tagDescription: "",
};

export function useTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formState, setFormState] = useState(initialFormState);

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setTags(await listDashboardTags());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTags();
  }, [loadTags]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTag(null);
    setFormState(initialFormState);
  }, []);

  const openModal = useCallback((tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setFormState({
        tagName: tag.name,
        tagDescription: tag.description || "",
      });
    } else {
      setEditingTag(null);
      setFormState(initialFormState);
    }

    setIsModalOpen(true);
  }, []);

  const setTagName = useCallback((value: string) => {
    setFormState((current) => ({ ...current, tagName: value }));
  }, []);

  const setTagDescription = useCallback((value: string) => {
    setFormState((current) => ({ ...current, tagDescription: value }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      if (editingTag) {
        const updatedTag = await updateDashboardTag(editingTag.id, {
          name: formState.tagName,
          description: formState.tagDescription || null,
        });

        setTags((current) =>
          current.map((tag) => (tag.id === editingTag.id ? updatedTag : tag)),
        );
      } else {
        const createdTag = await createDashboardTag({
          name: formState.tagName,
          description: formState.tagDescription || null,
        });

        setTags((current) => [...current, createdTag]);
      }

      closeModal();
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : "Nastala chyba");
    }
  }, [closeModal, editingTag, formState.tagDescription, formState.tagName]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Opravdu chcete smazat tento štítek?")) {
      return;
    }

    try {
      await deleteDashboardTag(id);
      setTags((current) => current.filter((tag) => tag.id !== id));
    } catch (deleteError) {
      alert(
        deleteError instanceof Error ? deleteError.message : "Nastala chyba",
      );
    }
  }, []);

  return {
    tags,
    loading,
    error,
    isModalOpen,
    editingTag,
    tagName: formState.tagName,
    tagDescription: formState.tagDescription,
    openModal,
    closeModal,
    setTagName,
    setTagDescription,
    handleSave,
    handleDelete,
  };
}
