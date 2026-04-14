import ArticlesSectionTagPage from '@/app/features/blog/articles/ArticlesSectionTagPage';

type ArticlesSectionTagPageRouteProps = {
  params: Promise<{ section: string; tag: string }>;
};

/**
 * Stránka se seznamem článků podle sekce a tagu.
 */
export default async function ArticlesSectionTagPageRoute({ params }: ArticlesSectionTagPageRouteProps) {
  const { section, tag } = await params;
  return <ArticlesSectionTagPage sectionSlug={section} tagSlug={tag} />;
}
