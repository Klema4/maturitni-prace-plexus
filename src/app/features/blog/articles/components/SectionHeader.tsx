import { notFound } from "next/navigation";
import { getSectionBySlug } from "@/lib/repositories/sectionsRepository";

/**
 * Vlastnosti pro SectionHeader komponentu.
 */
interface SectionHeaderProps {
  sectionSlug: string;
}

/**
 * SectionHeader komponenta
 * Zobrazuje hlavičku sekce s názvem a popisem.
 */
export default async function SectionHeader({
  sectionSlug,
}: SectionHeaderProps) {
  const section = await getSectionBySlug(sectionSlug);

  if (!section) {
    notFound();
  }

  return (
    <div className="w-full px-4 lg:px-8 mt-32 mb-12">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-4">
        <h1 className="newsreader text-5xl lg:text-7xl font-medium tracking-tighter text-dark">
          {section.name}
        </h1>
        {section.description && (
          <p className="tracking-tight font-medium text-zinc-600 text-md max-w-2xl leading-relaxed">
            {section.description}
          </p>
        )}
      </div>
    </div>
  );
}
