"use client";

import { Input, Textarea } from "@/components/ui/dashboard/Inputs";

interface ArticleMetaFieldsProps {
  title: string;
  description: string;
  keywords: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onKeywordsChange: (value: string) => void;
}

export default function ArticleMetaFields({
  title,
  description,
  keywords,
  onTitleChange,
  onDescriptionChange,
  onKeywordsChange,
}: ArticleMetaFieldsProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Název článku"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Např. Jak stavět dashboard, který není generický"
      />

      <Textarea
        label="Krátké shrnutí"
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="Krátké shrnutí o čem článek je"
        rows={4}
        className="min-h-[120px]"
      />

      <Input
        label="Keywords"
        value={keywords}
        onChange={(event) => onKeywordsChange(event.target.value)}
        placeholder="např. AI, dashboard, analytika"
        description="Odděl jednotlivá keywords čárkou."
      />
    </div>
  );
}
