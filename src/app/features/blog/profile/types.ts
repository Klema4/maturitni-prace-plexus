/**
 * Typy pro profile feature
 */

/**
 * UserData
 * Základní data uživatele pro profilovou stránku
 */
export interface UserData {
  id: string;
  name: string;
  surname: string;
  email: string;
  image: string | null;
  createdAt: Date;
}

/**
 * SubscriptionStatus
 * Informace o stavu předplatného pro profilovou stránku
 */
export interface SubscriptionStatus {
  hasSubscription: boolean;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
}

/**
 * Tag
 * Základní typ tagu
 */
export interface Tag {
  id: string;
  name: string;
  description: string | null;
}

/**
 * FavoriteTag
 * Oblíbený tag uživatele
 */
export interface FavoriteTag extends Tag {
  userId: string;
}
