'use client';

import dynamic from 'next/dynamic';
import type { PublicAdCampaign } from '@/app/features/ads/public/types';
import type { ArticleContentBlock } from '@/app/features/blog/article-detail/types';
import { isArticleBlockArray } from '@/app/features/dashboard/articles/content';

const TipTapViewer = dynamic(
  () => import('@/app/features/blog/article-detail/components/TipTapViewer'),
  { ssr: false }
);

interface ArticleContentProps {
  blocks: ArticleContentBlock[];
  /** TipTap JSON pro read-only zobrazení. Když je předán a má type="doc", použije se TipTapViewer. */
  rawContent?: unknown;
  adCampaign?: PublicAdCampaign | null;
}

/**
 * Kontroluje, zda je content TipTap ProseMirror doc.
 */
function isTipTapDoc(content: unknown): content is { type: string } {
  return (
    typeof content === 'object' &&
    content !== null &&
    'type' in content &&
    (content as { type: string }).type === 'doc'
  );
}

/**
 * ArticleContent komponenta
 * Hlavní obsah článku. Pro TipTap JSON používá TipTapViewer, jinak vykresluje bloky.
 * @param {ArticleContentProps} props - Vlastnosti komponenty.
 * @param {ArticleContentBlock[]} props.blocks - Obsahové bloky (pro TOC / fallback render).
 * @param {unknown} [props.rawContent] - Surový obsah (TipTap JSON) pro read-only zobrazení.
 * @returns {JSX.Element} Vykreslený obsah článku.
 */
export default function ArticleContent({
  blocks,
  rawContent,
  adCampaign = null,
}: ArticleContentProps) {
  if (rawContent && (isTipTapDoc(rawContent) || isArticleBlockArray(rawContent))) {
    const headingIds = blocks.map((b) => b.id);
    return (
      <TipTapViewer
        content={rawContent}
        headingIds={headingIds}
        adCampaign={adCampaign}
      />
    );
  }

  return (
    <article className="flex flex-col gap-10">
      {blocks.map((block) => (
        <section key={block.id} id={block.id} className="flex flex-col gap-4">
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
