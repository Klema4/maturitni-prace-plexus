import ArticleContent from "@/app/features/blog/article-detail/components/ArticleContent";
import ArticleSidebar from "@/app/features/blog/article-detail/components/ArticleSidebar";
import RelatedArticlesSection from "@/app/features/blog/article-detail/components/RelatedArticles";
import ArticleRating from "@/app/features/blog/article-detail/components/ArticleRating";
import ArticlePremiumGate from "@/app/features/blog/article-detail/components/ArticlePremiumGate";
import { formatPublishedAt } from "@/lib/utils/date";
import type {
  ArticleDetailData,
  ArticleContentBlock,
  RelatedArticle,
} from "@/app/features/blog/article-detail/types";
import ArticleHeader from "@/app/features/blog/article-detail/components/ArticleHeader";
import type { PublicAdCampaign } from "@/app/features/ads/public/types";

/**
 * ArticleDetailPageProps
 * Vlastnosti pro ArticleDetailPage komponentu.
 * @interface ArticleDetailPageProps
 * @property {ArticleDetailData} article - Data článku
 * @property {ArticleContentBlock[]} contentBlocks - Obsahové bloky článku
 * @property {RelatedArticle[]} relatedArticles - Související články
 */
interface ArticleDetailPageProps {
  article: ArticleDetailData;
  contentBlocks: ArticleContentBlock[];
  relatedArticles: RelatedArticle[];
  adCampaign: PublicAdCampaign | null;
  backHref?: string;
  backLabel?: string;
  isPreview?: boolean;
  hasContentAccess?: boolean;
}

/**
 * ArticleDetailPage komponenta
 * Hlavní komponenta pro zobrazení detailu článku.
 * Zobrazuje hero sekci, obsah, sidebar, hodnocení a související články.
 * @param {ArticleDetailPageProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} ArticleDetailPage komponenta.
 */
export default function ArticleDetailPage({
  article,
  contentBlocks,
  relatedArticles,
  adCampaign,
  backHref = "/articles",
  backLabel = "Zpět na články",
  isPreview = false,
  hasContentAccess = true,
}: ArticleDetailPageProps) {
  const isLocked = !isPreview && article.premiumOnly && !hasContentAccess;

  return (
    <div className="min-h-screen">
      <ArticleHeader
        backHref={backHref}
        backLabel={backLabel}
        date={formatPublishedAt(new Date(article.publishedAt))}
        updatedAt={article.updatedAt}
        publishedAtIso={article.publishedAt}
        title={article.title}
        description={article.description || ""}
        authorName={article.authorName}
        authorAvatar={article.authorAvatar}
        readingTime={article.readingTime}
        viewCount={article.viewCount}
        heroImageUrl={article.imageUrl || undefined}
      />

      <div className="h-128 md:h-172" />

      <section className="pt-16 pb-8 px-4 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {isLocked ? (
            <ArticlePremiumGate />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-12">
              <ArticleContent
                blocks={contentBlocks}
                rawContent={article.content}
                adCampaign={adCampaign}
              />
              <ArticleSidebar blocks={contentBlocks} shareTitle={article.title} />
            </div>
          )}
        </div>
      </section>

      {!isPreview && !isLocked && article.ratingEnabled && (
        <ArticleRating
          articleId={article.id}
          threadId={article.threadId}
          authorName={article.authorName}
          authorAvatar={article.authorAvatar}
          authorRole="Autor"
          initialLikesCount={article.likesCount}
          initialDislikesCount={article.dislikesCount}
        />
      )}

      {!isPreview && !isLocked && relatedArticles.length > 0 && (
        <RelatedArticlesSection articles={relatedArticles} />
      )}
    </div>
  );
}
