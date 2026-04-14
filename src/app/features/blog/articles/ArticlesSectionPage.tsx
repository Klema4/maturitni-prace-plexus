import { Suspense } from 'react';
import SectionHeader from '@/app/features/blog/articles/components/SectionHeader';
import ArticlesListContainer from '@/app/features/blog/articles/components/ArticlesListContainer';

/**
 * Vlastnosti pro ArticlesSectionPage.
 */
interface ArticlesSectionPageProps {
  sectionSlug: string;
}

/**
 * ArticlesSectionPage
 * Stránka se seznamem článků v dané sekci.
 */
export default function ArticlesSectionPage({ sectionSlug }: ArticlesSectionPageProps) {
  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="w-full px-4 lg:px-8 mt-32 mb-12 animate-pulse">
            <div className="h-16 w-64 bg-zinc-100 rounded-md mb-4" />
            <div className="h-8 w-full max-w-2xl bg-zinc-100 rounded-md" />
          </div>
        }
      >
        <SectionHeader sectionSlug={sectionSlug} />
      </Suspense>

      <Suspense
        fallback={
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ArticlesListContainer section={sectionSlug} />
      </Suspense>
    </div>
  );
}
