import { notFound } from "next/navigation";
import ArticleDetailPage from "@/app/features/blog/article-detail/ArticleDetailPage";
import { getArticleByIdWithExtras } from "@/app/features/blog/article-detail/services/articleDetail.service";

interface ArticlePreviewPageProps {
  articleId: string;
}

export default async function ArticlePreviewPage({
  articleId,
}: ArticlePreviewPageProps) {
  const data = await getArticleByIdWithExtras(articleId, {
    bypassContentGate: true,
  });

  if (!data) {
    notFound();
  }

  return (
    <ArticleDetailPage
      article={data.article}
      contentBlocks={data.contentBlocks}
      relatedArticles={data.relatedArticles}
      adCampaign={data.adCampaign}
      backHref={`/dashboard/articles/${articleId}/edit`}
      backLabel="Zpět do editoru"
      isPreview
      hasContentAccess={data.hasContentAccess}
    />
  );
}
