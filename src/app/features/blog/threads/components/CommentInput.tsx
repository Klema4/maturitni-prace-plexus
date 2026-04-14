'use client';

import { useState } from 'react';
import { Avatar } from '@/app/components/blog/ui/Avatar';
import { Button } from '@/app/components/blog/ui/Button';
import { Send } from 'lucide-react';

/**
 * CommentInput komponenta
 * Vstupní pole pro vytvoření nového komentáře nebo odpovědi.
 * @param {Object} props - Vlastnosti komponenty.
 * @param {string | null} props.userAvatar - URL avatara uživatele.
 * @param {string} props.userName - Jméno uživatele.
 * @param {(content: string, parentId?: string) => Promise<void>} props.onSubmit - Obslužná funkce při odeslání komentáře.
 * @param {string} [props.parentId] - ID rodičovského komentáře pro odpověď.
 * @param {string} [props.placeholder] - Zástupný text.
 * @returns {JSX.Element} CommentInput komponenta.
 */
export function CommentInput({
  userAvatar,
  userName,
  onSubmit,
  parentId,
  placeholder = 'Napište svůj názor na tento článek...',
}: {
  userAvatar: string | null;
  userName: string;
  onSubmit: (content: string, parentId?: string) => Promise<void>;
  parentId?: string;
  placeholder?: string;
}) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmedContent, parentId);
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="bg-white/80 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <Avatar src={userAvatar || undefined} alt={userName} size="md" />
        <div className="flex-1 space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={1000}
            disabled={isSubmitting}
            className="w-full min-h-24 resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium tracking-tight text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-xs tracking-tight text-zinc-500">{content.length}/1000</p>
            <div className="flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="tracking-tight cursor-pointer"
                disabled={!content.trim() || isSubmitting}
                onClick={handleSubmit}
              >
                <Send size={16} />
                Odeslat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
