/**
 * ArticleContentBlock
 * Typ jednoho obsahového bloku článku.
 * Reprezentuje sekci s nadpisem a textem.
 * @interface ArticleContentBlock
 * @property {string} id - ID bloku, používá se pro anchor odkazy
 * @property {string} title - Nadpis sekce
 * @property {string} text - Obsah sekce
 */
export interface ArticleContentBlock {
  id: string;
  title: string;
  text: string;
}

/**
 * RelatedArticle
 * Typ jednoho souvisejícího článku.
 * @interface RelatedArticle
 * @property {string} id - ID článku
 * @property {string} title - Nadpis článku
 * @property {string} category - Kategorie článku
 * @property {string} [imageUrl] - URL obrázku článku
 * @property {string} articleUrl - URL detailu článku
 */
export interface RelatedArticle {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  articleUrl: string;
}

/**
 * ArticleDetailData
 * Data pro zobrazení detailu článku.
 * @interface ArticleDetailData
 * @property {string} id - ID článku
 * @property {string} title - Nadpis článku
 * @property {string} slug - Slug článku
 * @property {string} description - Popis článku
 * @property {string} [imageUrl] - URL obrázku článku
 * @property {unknown} content - Obsah článku (JSONB)
 * @property {string} authorName - Jméno autora
 * @property {string | null} authorAvatar - Avatar autora
 * @property {string} publishedAt - Datum publikace (ISO string)
 * @property {number | null} readingTime - Čas na přečtení v minutách
 * @property {number} viewCount - Počet zobrazení
 * @property {number} likesCount - Počet lajků
 * @property {number} dislikesCount - Počet dislajků
 * @property {boolean} ratingEnabled - Zda je povoleno hodnocení
 * @property {boolean} commentsEnabled - Zda jsou povoleny komentáře
 * @property {string | null} threadId - ID threadu pro komentáře
 */
export interface ArticleDetailData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  content: unknown;
  premiumOnly: boolean;
  authorName: string;
  authorAvatar: string | null;
  publishedAt: string;
  updatedAt: string;
  readingTime: number | null;
  viewCount: number;
  likesCount: number;
  dislikesCount: number;
  ratingEnabled: boolean;
  commentsEnabled: boolean;
  threadId: string | null;
}

/**
 * ArticleHeaderProps
 * Vlastnosti pro ArticleHeader komponentu.
 * @interface ArticleHeaderProps
 * @property {string} backHref - URL, kam vede tlačítko zpět.
 * @property {string} date - Datum publikace článku.
 * @property {string} title - Nadpis článku.
 * @property {string} description - Krátký perex článku.
 * @property {string} authorName - Jméno autora článku.
 * @property {string} [heroImageUrl] - URL hero obrázku na pozadí.
 */
export interface ArticleHeaderProps {
  backHref: string;
  backLabel?: string;
  date: string;
  updatedAt?: string;
  publishedAtIso?: string;
  title: string;
  description: string;
  authorName: string;
  authorAvatar?: string | null;
  readingTime?: number | null;
  viewCount?: number;
  heroImageUrl?: string;
}
