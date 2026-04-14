import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ArticleDetailPage from "@/app/features/blog/article-detail/ArticleDetailPage";
import { getArticleBySlugWithExtras } from "@/app/features/blog/article-detail/services/articleDetail.service";
import { auth } from "@/lib/auth";
import { getHasActiveSubscriptionService } from "@/lib/services/subscriptionsService";
import { getArticleDetail } from "@/lib/services/articlesService";
import { getDashboardSettingsService } from "@/lib/services/dashboardSettingsService";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * generateMetadata
 * Nastaví title/description pro detail článku (název článku v tabu).
 * @param {{ params: Promise<{ slug: string }> }} props - Next route props.
 * @returns {Promise<Metadata>} Metadata pro detail článku.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [article, settings] = await Promise.all([
    getArticleDetail(slug),
    getDashboardSettingsService(),
  ]);

  if (!article) {
    return {
      title: "Článek",
      description: settings?.seoDescription ?? undefined,
    };
  }

  const siteTitle = settings?.seoName ?? settings?.name ?? "Plexus";
  const description =
    article.description ??
    settings?.seoDescription ??
    "Článek na Plexusu.";
  const ogImageUrl = article.imageUrl ?? settings?.seoImageUrl ?? null;
  const canonicalUrl = settings?.seoUrl
    ? `${settings.seoUrl.replace(/\/$/, "")}/article/${article.slug}`
    : undefined;

  return {
    title: article.title,
    description,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      type: "article",
      siteName: siteTitle,
      title: article.title,
      description,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
    },
    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title: article.title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}

/**
 * Obalová komponenta pro přístup k params uvnitř Suspense boundary.
 */
async function ArticleDetailWrapper({ params }: PageProps) {
  const { slug } = await params;
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  const hasActiveSubscription = session?.user?.id
    ? await getHasActiveSubscriptionService(session.user.id)
    : false;

  const data = await getArticleBySlugWithExtras(slug, {
    hasActiveSubscription,
    viewerUserId: session?.user?.id ?? null,
    trackView: true,
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
      hasContentAccess={data.hasContentAccess}
    />
  );
}

/**
 * Stránka detailu článku.
 * Serverová komponenta s Suspense boundary pro fixnutí blocking route erroru.
 */
export default function ArticleDetailPageRoute({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ArticleDetailWrapper params={params} />
    </Suspense>
  );
}
