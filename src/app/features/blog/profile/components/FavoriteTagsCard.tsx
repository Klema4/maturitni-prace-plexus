'use client';

import { useState, useEffect } from 'react';
import { Tag, X, Plus, Loader2 } from 'lucide-react';
import { getFavoriteTags, addFavoriteTag, removeFavoriteTag } from '../api/profile.api';
import type { Tag as TagType } from '../types';

/**
 * Karta pro správu oblíbených štítků.
 * @returns {JSX.Element} FavoriteTagsCard.
 */
export default function FavoriteTagsCard() {
  const [favoriteTags, setFavoriteTags] = useState<TagType[]>([]);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [favoritesResult, allTagsResult] = await Promise.all([
        getFavoriteTags(),
        fetch('/api/tags').then(res => res.json()),
      ]);

      if (favoritesResult.tags) {
        setFavoriteTags(favoritesResult.tags);
      }

      if (allTagsResult.tags) {
        setAllTags(allTagsResult.tags);
      }
    } catch (err: any) {
      setError(err.message || 'Nepodařilo se načíst tagy');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (tagId: string) => {
    if (favoriteTags.some(t => t.id === tagId)) {
      return; // Tag už je v oblíbených
    }

    setAdding(true);
    setError(null);
    try {
      await addFavoriteTag({ tagId });
      // Optimisticky aktualizujeme pouze lokální stav, nemusíme znovu načítat celou stránku
      const addedTag = allTags.find((tag) => tag.id === tagId);
      if (addedTag) {
        setFavoriteTags((prev) => [...prev, addedTag]);
      }
    } catch (err: any) {
      setError(err.message || 'Nepodařilo se přidat tag');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    setError(null);
    try {
      await removeFavoriteTag({ tagId });
      // Optimisticky odstraníme tag pouze z lokálního stavu
      setFavoriteTags((prev) => prev.filter((tag) => tag.id !== tagId));
    } catch (err: any) {
      setError(err.message || 'Nepodařilo se odebrat tag');
    }
  };

  const filteredTags = allTags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (tag.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const isNotFavorite = !favoriteTags.some(ft => ft.id === tag.id);
    return matchesSearch && isNotFavorite;
  });

  const favoriteTagIds = new Set(favoriteTags.map(t => t.id));

  if (loading) {
    return (
      <div className="w-full p-6 bg-white/75 rounded-xl">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="text-zinc-400 animate-spin" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white/75 rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <Tag size={24} className="text-primary shrink-0" />
        <h2 className="newsreader text-2xl lg:text-3xl font-medium tracking-tighter leading-tight text-dark">Oblíbené štítky</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm tracking-tight">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Oblíbené tagy */}
        <div>
          <h3 className="text-md font-semibold tracking-tight text-dark mb-3">Vaše oblíbené štítky</h3>
          {favoriteTags.length === 0 ? (
            <div className="text-center py-6 bg-zinc-50 rounded-lg border border-zinc-200">
              <Tag size={32} className="text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-500 tracking-tight">Nemáte žádné oblíbené štítky</p>
              <p className="text-xs text-zinc-400 tracking-tight mt-1">Přidejte štítky níže pro personalizaci obsahu</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {favoriteTags.map((tag) => (
                <div
                  key={tag.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-sm tracking-tight"
                >
                  <span className="text-dark font-medium">{tag.name}</span>
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    type="button"
                    disabled={adding}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Přidat nové tagy */}
        <div>
          <h3 className="text-md font-semibold tracking-tight text-dark mb-3">Přidat štítky</h3>
          
          {/* Vyhledávání */}
          <div className="mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Vyhledat štítky..."
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-dark text-sm tracking-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Seznam dostupných tagů */}
          {filteredTags.length === 0 ? (
            <div className="text-center py-4 bg-zinc-50 rounded-lg border border-zinc-200">
              <p className="text-sm text-zinc-500 tracking-tight">
                {searchQuery ? 'Žádné štítky neodpovídají vyhledávání' : 'Všechny dostupné štítky jsou již v oblíbených'}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {filteredTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag.id)}
                  disabled={adding || favoriteTagIds.has(tag.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm tracking-tight text-dark hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <Plus size={14} />
                  <span className="font-medium">{tag.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {favoriteTags.length > 0 && (
          <div className="pt-4 border-t border-zinc-200">
            <p className="text-xs text-zinc-500 tracking-tight">
              Články na hlavní stránce budou filtrovány podle vašich oblíbených štítků.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
