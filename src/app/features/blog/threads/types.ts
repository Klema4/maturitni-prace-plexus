/**
 * CommentData
 * Typ komentáře s autorem a metadaty.
 * @interface CommentData
 * @property {string} id - ID komentáře
 * @property {string} content - Obsah komentáře
 * @property {number} likesCount - Počet lajků
 * @property {number} dislikesCount - Počet dislajků
 * @property {Date | string} createdAt - Datum vytvoření
 * @property {Date | string} updatedAt - Datum poslední úpravy
 * @property {Object} author - Autor komentáře
 * @property {string} author.id - ID autora
 * @property {string} author.name - Jméno autora
 * @property {string} author.surname - Příjmení autora
 * @property {string | null} author.image - URL avatara autora
 * @property {number} repliesCount - Počet odpovědí
 * @property {boolean | null} userRating - Hodnocení uživatele (true = like, false = dislike, null = žádné)
 * @property {boolean} [isHidden] - Zda je komentář skrytý
 * @property {boolean} [isModerated] - Zda byl komentář moderován
 * @property {boolean} [editedByAdmin] - Zda byl komentář upraven administrátorem
 * @property {Date | string | null} [editedByAdminAt] - Datum úpravy administrátorem
 * @property {string | null} [originalContent] - Původní obsah před admin úpravou (audit)
 */
export interface CommentData {
  id: string;
  content: string;
  likesCount: number;
  dislikesCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  author: {
    id: string;
    name: string;
    surname: string;
    image: string | null;
  };
  repliesCount: number;
  userRating: boolean | null;
  isHidden?: boolean;
  isModerated?: boolean;
  editedByAdmin?: boolean;
  editedByAdminAt?: Date | string | null;
  originalContent?: string | null;
}

/**
 * ThreadWithArticle
 * Thread s informacemi o článku.
 * @interface ThreadWithArticle
 * @property {string} id - ID threadu
 * @property {Object} article - Informace o článku
 * @property {string} article.id - ID článku
 * @property {string} article.title - Nadpis článku
 */
export interface ThreadWithArticle {
  id: string;
  article: {
    id: string;
    title: string;
  };
}

/**
 * ThreadPageProps
 * Vlastnosti pro ThreadPage komponentu.
 * @interface ThreadPageProps
 * @property {string} threadId - ID threadu
 * @property {ThreadWithArticle | null} initialThread - Počáteční data threadu
 */
export interface ThreadPageProps {
  threadId: string;
  initialThread: ThreadWithArticle | null;
}
