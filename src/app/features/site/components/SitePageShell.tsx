import type { ReactNode } from 'react';

import { Footer, Navbar } from '@/app/components/blog';
import { Prose } from '@/components/common/Prose';

/**
 * Sdílený layout pro statické stránky (O nás / Kariéra / Kontakt).
 * Drží jednotnou šířku, header a typografii bez doménové logiky.
 *
 * @param {object} props - Props komponenty.
 * @param {string} props.title - Hlavní nadpis stránky.
 * @param {string} props.lead - Krátký úvodní text pod nadpisem.
 * @param {ReactNode} props.children - Obsah stránky.
 * @returns {JSX.Element} Renderovaný layout statické stránky.
 */
export function SitePageShell({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto flex flex-col gap-8 my-8 mt-32 px-4">
        <header className="flex flex-col gap-3">
          <h1 className="newsreader text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-zinc-900">
            {title}
          </h1>
          <p className="text-zinc-600 text-lg max-w-3xl leading-relaxed tracking-tight">{lead}</p>
        </header>

        <Prose>{children}</Prose>
      </main>

      <Footer />
    </div>
  );
}

