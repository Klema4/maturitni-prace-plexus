import ArticlesSectionPage from '@/app/features/blog/articles/ArticlesSectionPage';

type ArticlesSectionPageRouteProps = {
  params: Promise<{ section: string }>;
};

/**
 * Stránka se seznamem článků podle sekce.
 */
export default async function ArticlesSectionPageRoute({ params }: ArticlesSectionPageRouteProps) {
  const { section } = await params;
  return <ArticlesSectionPage sectionSlug={section} />;
}
