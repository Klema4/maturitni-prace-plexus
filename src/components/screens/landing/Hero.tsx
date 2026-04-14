'use client';

import { Avatar, Button } from '@/app/components/blog/ui';
import { ArrowUpRight, Dices } from 'lucide-react';
import { formatPublishedAt } from '@/lib/utils/date';

/**
 * Props pro `Hero`.
 */
interface HeroProps {
  category?: string;
  title: string;
  description: string;
  authorName?: string;
  authorAvatar?: string;
  publishedAt?: string;
  articleUrl?: string;
  heroImageUrl?: string;
}

/**
 * Hero sekce pro zvýrazněný článek.
 * @param {HeroProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} Hero.
 */
export default function Hero({
  category = 'ARTICLE',
  title,
  description,
  authorName,
  authorAvatar,
  publishedAt,
  articleUrl = '#',
  heroImageUrl,
}: HeroProps) {
  const backgroundImage = heroImageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop';

  return (
    <section
      className="relative w-full min-h-[60vh] md:min-h-[70vh] px-4 lg:px-8 my-8"
    >
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-zinc-950/90 via-zinc-950/75 to-zinc-900/40" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-10 rounded-3xl px-6 py-8 md:px-10 md:py-12">
        <div className="flex-1 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/70 border border-zinc-700/60">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
              {category}
            </span>
            <span className="h-1 w-1 rounded-full bg-amber-400" />
            <span className="text-[11px] font-medium tracking-tight text-zinc-300">
              Doporučený článek Plexus
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
            {title}
          </h1>

          <p className="text-sm md:text-base tracking-tight text-zinc-300 max-w-2xl">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {(authorName || authorAvatar) && (
              <div className="flex items-center gap-3">
                {authorAvatar && (
                  <Avatar
                    src={authorAvatar}
                    alt={authorName ?? 'Autor článku'}
                    size="sm"
                  />
                )}
                <div className="flex flex-col">
                  {authorName && (
                    <span className="text-sm font-medium tracking-tight text-white">
                      {authorName}
                    </span>
                  )}
                  {publishedAt && (
                    <span className="text-xs tracking-tight text-zinc-400">
                      {formatPublishedAt(publishedAt)}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                href={articleUrl}
                variant="primary"
                size="md"
                className="tracking-tight"
              >
                <span>Číst článek</span>
                <ArrowUpRight size={16} />
              </Button>
              <Button
                href="/clanky"
                variant="ghost"
                size="sm"
                className="tracking-tight"
              >
                <Dices size={14} />
                <span>Procházet další témata</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
