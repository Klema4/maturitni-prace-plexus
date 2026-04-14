'use client';

import Image from 'next/image';
import { ArrowLeft, Clock } from 'lucide-react';
import { Avatar, Button } from '@/app/components/blog/ui';
import { ArticleHeaderProps } from '../../article-detail/types';

/**
 * ArticleHero komponenta
 * Zobrazuje pozadí s obrázkem, navbar, tlačítko zpět, datum, nadpis, perex a autora.
 * @param {ArticleHeaderProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} ArticleHero komponenta.
 */
export default function ArticleHero({ backHref, date, title, description, authorName, heroImageUrl = 'https://images.unsplash.com/photo-1473181488821-2d23949a045a?q=80&w=1600&auto=format&fit=crop' }: ArticleHeaderProps) {
  return (
    <>
      <div className="w-full h-[60vh] md:h-156 absolute top-0 left-0 -z-1">
        <Image
          src={heroImageUrl}
          alt="Article hero"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full h-[60vh] lg:h-128 bg-linear-to-b from-black/0 via-black/50 to-black">
        <section className="w-full px-6 lg:px-8 h-[60vh] lg:h-128 mt-8">
          <div className="max-w-5xl mx-auto">
            <Button
              href={backHref}
              variant="subtle"
              size="sm"
              className="mb-12 w-fit backdrop-blur-sm hover:bg-primary! hover:text-white!"
            >
              <ArrowLeft size={16} />
              Zpět na články
            </Button>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-white">
                <Clock size={16} />
                <p className="text-sm font-medium tracking-tight">{date}</p>
              </div>
              <h1 className="newsreader text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tighter text-white max-w-3xl">
                {title}
              </h1>
              <p className="text-base lg:text-lg text-white tracking-tight max-w-3xl">
                {description}
              </p>
              <div className="flex items-center gap-4">
                <Avatar src={undefined} alt={authorName} size="sm" variant="dark" />
                <p className="text-sm text-white font-medium tracking-tight">{authorName}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

