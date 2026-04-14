'use client';

import HeroArticle from '@/components/screens/landing/Hero';

/**
 * Hero sekce pro stránku článků.
 * Je to ten samý vizuál jako landing Hero, jen s copy pro archiv článků.
 * @returns {JSX.Element} Hero sekce pro stránku článků.
 */
export default function ArticlesHero() {
  return (
    <HeroArticle
      category="ARCHIVE"
      title="Archiv článků pro týmy, které chtějí růst."
      description="Všechny texty o produktu, designu, marketingu i datech na jednom místě. Kurátorovaný obsah, který můžete rovnou přenést do roadmapy nebo redakční porady."
      authorName="Redakce Plexus"
      publishedAt="2026-01-01 12:00:00"
      articleUrl="/articles"
    />
  );
}
