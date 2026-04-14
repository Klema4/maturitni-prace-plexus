import ArticlesListPage from '@/app/features/blog/articles/ArticlesListPage';

type ArticlesPageProps = {
  searchParams?: Promise<{ tag?: string }>;
};

/**
 * Stránka se seznamem všech článků.
 */
export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const tag = resolvedSearchParams?.tag;

  return <ArticlesListPage tagSlug={tag} />;
}
