import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import type { ArticleContentBlock } from '@/app/features/blog/article-detail/types';
import ArticleShareCard from '@/app/features/blog/article-detail/components/ArticleShareCard';

interface ArticleSidebarProps {
  blocks: ArticleContentBlock[];
  shareTitle?: string;
}

export default function ArticleSidebar({
  blocks,
  shareTitle,
}: ArticleSidebarProps) {
  const tocBlocks = blocks.filter((block) => block.title);

  return (
    <aside className="flex flex-col gap-4">
      <div className="sticky top-24 overflow-hidden">
        {tocBlocks.length > 0 ? (
          <div className="rounded-xl bg-primary/10 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-tight text-zinc-700">
              <BookOpen size={16} />
              Obsah článku
            </h3>
            <ul className="flex flex-col gap-0.5">
              {tocBlocks.map((block) => (
                <li key={block.id}>
                  <Link
                    href={`#${block.id}`}
                    className="block w-full rounded-lg px-2 py-1.5 text-sm font-medium tracking-tight text-zinc-600 transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    {block.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <ArticleShareCard
          shareTitle={shareTitle}
          className={tocBlocks.length > 0 ? 'mt-2' : undefined}
        />
      </div>
    </aside>
  );
}
