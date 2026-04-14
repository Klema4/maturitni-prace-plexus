/**
 * Typ jednoho obsahového bloku článku.
 * Reprezentuje sekci s nadpisem a textem.
 * @property {string} id - ID bloku, používá se pro anchor odkazy.
 * @property {string} title - Nadpis sekce.
 * @property {string} text - Obsah sekce.
 */
export interface ArticleContentBlock {
  id: string;
  title: string;
  text: string;
}

interface ArticleContentProps {
  blocks: ArticleContentBlock[];
}

/**
 * Hlavní obsah článku.
 * Vykresluje jednotlivé obsahové bloky.
 * @param {Object} props - Vlastnosti komponenty.
 * @param {ArticleContentBlock[]} props.blocks - Obsahové bloky článku.
 * @returns {JSX.Element} Vykreslený obsah článku.
 */
export default function ArticleContent({ blocks }: ArticleContentProps) {
  return (
    <article className="flex flex-col gap-10">
      {blocks.map((block) => (
        <section
          key={block.id}
          id={block.id}
          className="flex flex-col gap-4"
        >
          <h2 className="newsreader text-2xl md:text-3xl font-medium tracking-tight text-dark">
            {block.title}
          </h2>
          <p className="text-base md:text-lg text-zinc-700 tracking-tight leading-relaxed">
            {block.text}
          </p>
        </section>
      ))}
    </article>
  );
}
