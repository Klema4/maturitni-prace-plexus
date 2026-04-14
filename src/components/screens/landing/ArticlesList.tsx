'use client';

import { Avatar } from '@/app/components/blog/ui';
import { formatPublishedAt } from '@/lib/utils/date';
import { clsx } from 'clsx';
import { Clock3 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { normalizeSlug } from '@/lib/utils/slug';

/**
 * Typ článku pro list/grid na landing stránce.
 */
export interface Article {
    id: string;
    title: string;
    authorName: string;
    authorAvatar?: string;
    publishedAt: string;
    readingTime?: number | null;
    imageUrl?: string;
    articleUrl: string;
    tags?: { id: string; name: string; description?: string | null }[];
}

interface ArticlesListProps {
  articles: Article[];
  title?: string;
  description?: string;
  className?: string;
  showHeading?: boolean;
}

/**
 * Grid seznam článků.
 * @param {ArticlesListProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} ArticlesList.
 */
export default function ArticlesList({
  articles,
  title = 'To nejnovější z naší redakce',
  description,
  className,
  showHeading = true,
}: ArticlesListProps) {
  return (
    <section className={clsx('w-full px-4 lg:px-8 mt-48', className)}>
      <div className="flex flex-col gap-8">
        {showHeading ? (
          <div className="flex flex-col gap-3">
            <h2 className="newsreader text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-dark">
              {title}
            </h2>
            {description ? (
              <p className="text-sm text-zinc-600 tracking-tight max-w-2xl">{description}</p>
            ) : null}
          </div>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ArticleCardProps {
    article: Article;
}

/**
 * Karta článku v gridu.
 * @param {ArticleCardProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} ArticleCard.
 */
export function ArticleCard({ article }: ArticleCardProps) {
    const visibleTags = (article.tags ?? []).slice(0, 2);
    const router = useRouter();

    const articleHref = article.articleUrl || '/';

    return (
        <article
            role="link"
            tabIndex={0}
            className="flex flex-col bg-white hover:bg-primary/5 rounded-lg border border-zinc-200 hover:border-primary/15 transition-all overflow-hidden group cursor-pointer"
            onClick={() => router.push(articleHref)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(articleHref);
                }
            }}
        >
            {article.imageUrl ? (
                <Image
                    width={1024}
                    height={512}
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                />
            ) : (
                <div className="w-full h-48 bg-zinc-100" aria-hidden="true" />
            )}

            <div className="flex flex-col flex-1 p-5">
                {visibleTags.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        {visibleTags.map((tag) => (
                            <Link
                                key={tag.id}
                                href={`/articles?tag=${encodeURIComponent(normalizeSlug(tag.name))}`}
                                className="text-xs uppercase font-medium text-zinc-500 tracking-tight hover:text-primary cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {tag.name}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <span className="text-xs uppercase font-medium text-zinc-500 mb-2 tracking-tight">
                        Článek
                    </span>
                )}

                <h4 className="newsreader text-lg lg:text-xl font-medium tracking-tight text-dark mb-2 line-clamp-2 transition-colors group-hover:text-primary">
                    {article.title}
                </h4>

                <div className="flex items-center mt-auto gap-0">
                    <Avatar
                        src={article.authorAvatar}
                        alt={article.authorName}
                        size="xs"
                        className="mr-2"
                    />
                    <span className="text-xs text-dark font-medium tracking-tight">
                        {article.authorName}
                    </span>
                    <span className="mx-1 text-zinc-400">•</span>
                    <span className="text-xs text-zinc-600 font-medium tracking-tight">
                        {formatPublishedAt(article.publishedAt)}
                    </span>
                    {article.readingTime ? (
                        <>
                            <span className="mx-1 text-zinc-400">•</span>
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-600 font-medium tracking-tight">
                                <Clock3 size={12} />
                                {article.readingTime} min
                            </span>
                        </>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
