import { notFound } from 'next/navigation';
import { getSectionBySlug } from '@/lib/repositories/sectionsRepository';

/**
 * Vlastnosti pro SectionTagHeader komponentu.
 */
interface SectionTagHeaderProps {
  sectionSlug: string;
  tagSlug: string;
}

/**
 * SectionTagHeader komponenta
 * Zobrazuje hlavičku sekce a tagu.
 */
export default async function SectionTagHeader({ sectionSlug, tagSlug }: SectionTagHeaderProps) {
  const section = await getSectionBySlug(sectionSlug);

  if (!section) {
    notFound();
  }

  const tagName = tagSlug.replace(/-/g, ' ');

  return (
    <div className="w-full px-4 lg:px-8 mt-32 mb-12">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">
          <span>{section.name}</span>
          <span>/</span>
          <span className="text-primary">{tagName}</span>
        </div>
        <h1 className="newsreader text-5xl lg:text-7xl font-medium tracking-tighter text-dark capitalize">
          {tagName}
        </h1>
        <p className="text-zinc-600 text-lg max-w-3xl leading-relaxed">
          Procházíte články v sekci {section.name} s tématem {tagName}.
        </p>
      </div>
    </div>
  );
}
