/**
 * KeywordProps
 * Rozhraní pro samotný klíčový výraz (Keyword)
 * @interface KeywordProps
 * @property {string} id - ID klíčového výrazu
 * @property {string} name - Název klíčového výrazu
 */
export interface KeywordProps {
    id: string;
    name: string;
}

/**
 * ArticleKeywordRelationProps
 * @description Implementace schéma pro jeden klíčový výraz článku
 * @interface ArticleKeywordRelationProps
 * @property {string} articleId - ID článku
 * @property {string} keywordId - ID klíčového výrazu
 * @property {KeywordProps} keyword - Klíčový výraz
 */
export interface ArticleKeywordRelationProps {
    articleId: string;
    keywordId: string;
    keyword?: KeywordProps;
}

/**
 * TagProps
 * @description Implementace schéma pro jeden tag článku
 * @interface TagProps
 * @property {string} id - ID tagu
 * @property {string} name - Název tagu
 * @property {string} description - Popis tagu
 */
export interface TagProps {
    id: string;
    name: string;
    description?: string | null;
}

/**
 * ArticleTagRelationProps
 * @description Implementace schéma pro jeden tag článku
 * @interface ArticleTagRelationProps
 * @property {string} articleId - ID článku
 * @property {string} tagId - ID tagu
 * @property {TagProps} tag - Tag
 */
export interface ArticleTagRelationProps {
    articleId: string;
    tagId: string;
    tag?: TagProps;
}

/**
 * ArticleProps
 * @description Implementace schéma pro jeden článek včetně jeho informací, metadat a autora
 * @interface ArticleProps
 * @property {string} id - ID článku
 * @property {string} title - Nadpis článku
 * @property {string} slug - Slug článku
 * @property {string} description - Popis článku
 * @property {string} imageUrl - URL obrázku článku
 * @property {string} status - Status článku
 * @property {number} readingTime - Čas na přečtení článku v minutách
 * @property {number} viewCount - Počet zobrazení článku
 * @property {number} likesCount - Počet lajků článku
 * @property {number} dislikesCount - Počet dislajků článku
 * @property {Date} createdAt - Datum vytvoření článku
 * @property {Date} updatedAt - Datum poslední úpravy článku
 * @property {Date | null} deletedAt - Datum smazání článku
 * @property {UserProps | null} author - Autor článku
 * @property {TagProps[] | null} tags - Tagy článku
 * @property {KeywordProps[] | null} keywords - Klíčová slova článku
 */
export interface ArticleProps {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    status?: "draft" | "need_factcheck" | "need_read" | "published";
    readingTime?: number | null;
    viewCount?: number;
    likesCount?: number;
    dislikesCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
    author?: {
        id: string;
        name: string;
        surname?: string;
        image?: string | null;
    } | null;
    tags?: TagProps[];
    keywords?: KeywordProps[];
}

/**
 * ArticlesGridProps
 * @description Vlastnosti pro ArticlesGrid komponentu
 * @interface ArticlesGridProps
 * @property {string} title - Nadpis gridu
 * @property {string} description - Popis gridu
 * @property {ArticleProps[]} articles - Články
 * @property {boolean} loadMoreButton - Příznak pro zobrazení tlačítka na načíst další články
 * @property {Object} pagination - Pagination pro stránkování
 * @property {Object} filters - Filtry
 * @property {string} search - Vyhledávací query
 * @property {string} sort - Řazení
 * @property {number} page - Stránka
 * @property {number} limit - Limit na jednu stránku nebo počet článků před zobrazením možnosti načíst další
 */
export interface ArticlesGridProps {
    title?: string;
    description?: string;
    articles: ArticleProps[];
    loadMoreButton?: boolean;
    pagination?: {
        total: number;
        page: number;
        limit: number;
    };
    filters?: {
        tags?: string[];
        keywords?: string[];
        status?: "draft" | "need_factcheck" | "need_read" | "published";
        sort?: "newest" | "oldest" | "most_viewed" | "least_viewed" | "most_liked" | "least_liked";
    };
    search?: string;
    sort?: "newest" | "oldest" | "most_viewed" | "least_viewed" | "most_liked" | "least_liked";
    page?: number;
    limit?: number;
}
