import { ArrowRight } from 'lucide-react';
import { Button } from '@/app/components/blog/ui';
import { ArticleCard } from '@/components/screens/landing/ArticlesList';
import type { RelatedArticle } from '@/app/features/blog/article-detail/types';

interface RelatedArticlesSectionProps {
  articles: RelatedArticle[];
}

/**
 * RelatedArticlesSection komponenta
 * Sekce se souvisejícími články pod detailem článku.
 * Zobrazuje nadpis, tlačítko "Všechny články" a grid karet článků.
 * @param {RelatedArticlesSectionProps} props - Vlastnosti komponenty.
 * @param {RelatedArticle[]} props.articles - Pole souvisejících článků.
 * @returns {JSX.Element} Sekce souvisejících článků.
 */
export default function RelatedArticlesSection({ articles }: RelatedArticlesSectionProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h3 className="newsreader text-3xl lg:text-4xl font-medium tracking-tighter text-dark">
            Související články
          </h3>
          <Button
            href="/articles"
            variant="subtle"
            size="sm"
            className="cursor-pointer"
          >
            <ArrowRight size={16} />
            Všechny články
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={{
                id: article.id,
                title: article.title,
                imageUrl: article.imageUrl,
                authorName: 'Redakce Plexus',
                publishedAt: '2025-12-12',
                articleUrl: article.articleUrl,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
