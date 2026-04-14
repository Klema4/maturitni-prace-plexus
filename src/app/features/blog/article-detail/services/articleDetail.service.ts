import {
  getArticleDetail,
  getArticleDetailById,
  getRelatedArticlesForUI,
} from "@/lib/services/articlesService";
import { incrementViewCount } from "@/lib/repositories/articlesRepository";
import type { ArticleDetail } from "@/lib/schemas/articlesSchema";
import type {
  ArticleDetailData,
  ArticleContentBlock,
  RelatedArticle,
} from "@/app/features/blog/article-detail/types";
import { getPublicAdCampaign } from "@/app/features/ads/public/api/publicAds.api";
import type { PublicAdCampaign } from "@/app/features/ads/public/types";
import type { ArticleCard } from "@/lib/schemas/articlesSchema";

interface ArticleExtrasResult {
  article: ArticleDetailData;
  contentBlocks: ArticleContentBlock[];
  relatedArticles: RelatedArticle[];
  adCampaign: PublicAdCampaign | null;
  hasContentAccess: boolean;
}

interface ArticleAccessOptions {
  hasActiveSubscription?: boolean;
  bypassContentGate?: boolean;
  viewerUserId?: string | null;
  trackView?: boolean;
}

/**
 * getArticleBySlugWithExtras
 * Načte článek podle slug včetně souvisejících článků a transformuje obsah na bloky.
 * @param {string} slug - Slug článku
 * @returns {Promise<{ article: ArticleDetailData; contentBlocks: ArticleContentBlock[]; relatedArticles: RelatedArticle[] } | null>} Data článku nebo null, pokud neexistuje
 */
export async function getArticleBySlugWithExtras(
  slug: string,
  options: ArticleAccessOptions = {},
): Promise<ArticleExtrasResult | null> {
  const {
    hasActiveSubscription = false,
    bypassContentGate = false,
    viewerUserId = null,
    trackView = false,
  } = options;
  const [article, adCampaign] = await Promise.all([
    getArticleDetail(slug),
    hasActiveSubscription
      ? Promise.resolve(null)
      : getPublicAdCampaign("article-inline"),
  ]);

  if (!article) {
    return null;
  }

  if (trackView) {
    await incrementViewCount(article.id, viewerUserId);
  }

  const relatedArticlesData = await getRelatedArticlesForUI(article.id, 3);
  return buildArticleExtras(article, adCampaign, relatedArticlesData, {
    hasActiveSubscription,
    bypassContentGate,
    viewerUserId,
    trackView,
  });
}

export async function getArticleByIdWithExtras(
  articleId: string,
  options: ArticleAccessOptions = {},
): Promise<ArticleExtrasResult | null> {
  const {
    hasActiveSubscription = false,
    bypassContentGate = false,
    viewerUserId = null,
    trackView = false,
  } = options;
  const [article, adCampaign] = await Promise.all([
    getArticleDetailById(articleId),
    hasActiveSubscription
      ? Promise.resolve(null)
      : getPublicAdCampaign("article-inline"),
  ]);

  if (!article) {
    return null;
  }

  return buildArticleExtras(article, adCampaign, [], {
    hasActiveSubscription,
    bypassContentGate,
    viewerUserId,
    trackView,
  });
}

function buildArticleExtras(
  article: ArticleDetail,
  adCampaign: PublicAdCampaign | null,
  relatedArticlesData: ArticleCard[],
  options: Required<ArticleAccessOptions>,
): ArticleExtrasResult {
  const hasContentAccess =
    options.bypassContentGate ||
    !article.premiumOnly ||
    options.hasActiveSubscription;
  const safeContent = hasContentAccess ? article.content : null;
  const contentBlocks = hasContentAccess ? parseContentToBlocks(article.content) : [];
  const relatedArticles: RelatedArticle[] = relatedArticlesData.map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl || undefined,
      category: item.category || "Článek",
      articleUrl: item.articleUrl,
    }));

  const articleData: ArticleDetailData = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    description: article.description,
    imageUrl: article.imageUrl,
    content: safeContent,
    premiumOnly: article.premiumOnly,
    authorName: article.authorName,
    authorAvatar: article.authorAvatar,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    readingTime: article.readingTime,
    viewCount: article.viewCount,
    likesCount: article.likesCount,
    dislikesCount: article.dislikesCount,
    ratingEnabled: article.ratingEnabled,
    commentsEnabled: article.commentsEnabled,
    threadId: article.threadId,
  };

  return {
    article: articleData,
    contentBlocks,
    relatedArticles,
    adCampaign: hasContentAccess ? adCampaign : null,
    hasContentAccess,
  };
}

function isTipTapDoc(content: unknown): content is {
  type: string;
  content?: unknown[];
} {
  return (
    typeof content === "object" &&
    content !== null &&
    "type" in content &&
    (content as { type: string }).type === "doc"
  );
}

function getTextFromNode(node: {
  content?: Array<{ text?: string; content?: unknown[] }>;
}): string {
  if (!node.content) return "";
  return node.content
    .map((child) =>
      "text" in child && typeof child.text === "string"
        ? child.text
        : getTextFromNode(child as { content?: Array<{ text?: string; content?: unknown[] }> }),
    )
    .join("");
}

function extractHeadingBlocksFromTipTap(doc: {
  content?: unknown[];
}): ArticleContentBlock[] {
  const blocks: ArticleContentBlock[] = [];
  const content = doc.content ?? [];
  let idx = 0;

  for (const node of content) {
    const n = node as {
      type?: string;
      content?: Array<{ text?: string; content?: unknown[] }>;
    };

    if (n.type === "heading") {
      const title = getTextFromNode(n);
      blocks.push({
        id: `heading-${idx}`,
        title: title || `Sekce ${idx + 1}`,
        text: "",
      });
      idx++;
    }
  }
  return blocks;
}

function parseContentToBlocks(content: unknown): ArticleContentBlock[] {
  if (!content) {
    return [{ id: "empty", title: "", text: "Tento článek zatím nemá obsah." }];
  }

  if (isTipTapDoc(content)) {
    const blocks = extractHeadingBlocksFromTipTap(content);
    return blocks.length > 0 ? blocks : [];
  }

  if (typeof content === "object" && content !== null && "body" in content) {
    return [{ id: "body", title: "", text: (content as { body: string }).body }];
  }

  if (Array.isArray(content)) {
    return content
      .map((block: {
        type?: string;
        id?: string;
        content?: { text?: string; items?: { text: string }[] };
      }, index: number) => {
        const blockContent = block.content || {};

        switch (block.type) {
          case "heading1":
          case "heading2":
          case "heading3":
            return {
              id: block.id || `block-${index}`,
              title: blockContent.text || "",
              text: "",
            };
          case "paragraph":
            return {
              id: block.id || `block-${index}`,
              title: "",
              text: blockContent.text || "",
            };
          case "quote":
            return {
              id: block.id || `block-${index}`,
              title: "",
              text: `„${blockContent.text || ""}"`,
            };
          case "bullet-list":
            return {
              id: block.id || `block-${index}`,
              title: "",
              text: (blockContent.items || [])
                .map((item: { text: string }) => `• ${item.text}`)
                .join("\n"),
            };
          default:
            return {
              id: block.id || `block-${index}`,
              title: "",
              text: blockContent.text || "",
            };
        }
      })
      .filter((block: ArticleContentBlock) => block.title || block.text);
  }

  return [{ id: "unknown", title: "", text: "Obsah nelze zobrazit." }];
}
