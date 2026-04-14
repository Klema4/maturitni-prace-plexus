import ArticlePreviewPage from "@/app/features/dashboard/articles/preview/ArticlePreviewPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <ArticlePreviewPage articleId={id} />;
}
