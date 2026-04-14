'use client';

import ArticlesSearchInput from '@/components/articles/ArticlesSearchInput';

export interface ArticlesToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
}

/**
 * Toolbar s vyhledáváním a filtry pro stránku článků.
 */
export default function ArticlesToolbar({
  query,
  onQueryChange,
}: ArticlesToolbarProps) {
  return (
    <section className="w-full px-4 lg:px-8 mt-10">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <ArticlesSearchInput
            placeholder="Hledat články podle názvu, tématu nebo autora..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
