'use client';

import Image from 'next/image';

/**
 * ThreadHeader komponenta
 * Zobrazuje hlavičku threadu s názvem článku.
 * @param {Object} props - Vlastnosti komponenty.
 * @param {string} props.articleTitle - Název článku.
 * @returns {JSX.Element} ThreadHeader komponenta.
 */
export function ThreadHeader({ articleTitle }: { articleTitle: string }) {
  return (
    <section className="max-w-5xl mx-auto my-10 flex flex-col items-center justify-center gap-2">
      <Image src="/doodles/MessyDoodle.svg" alt="Thread" width={256} height={256} />
      <h2 className="newsreader text-base lg:text-lg font-medium tracking-tight text-zinc-600 mt-4">
        Diskuze k článku
      </h2>
      <p className="text-center newsreader text-3xl lg:text-4xl font-medium tracking-tighter text-dark">
        {articleTitle}
      </p>
    </section>
  );
}
