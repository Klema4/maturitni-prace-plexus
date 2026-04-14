'use client';

/**
 * API obal funkce pro profil uživatele.
 * Poskytuje tenkou vrstvu nad fetch API pro konzistentní použití v feature komponentách.
 */

/**
 * Získání aktuálního přihlášeného uživatele
 * @returns {Promise<any>} Response s uživatelskými daty
 */
export async function getCurrentUser() {
  const response = await fetch('/api/user/me');
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst uživatele');
  }
  return await response.json();
}

/**
 * Aktualizace obrázku uživatele
 * @param {Object} params - Parametry pro aktualizaci obrázku
 * @param {string} params.imageUrl - URL obrázku
 * @returns {Promise<any>} Response s výsledkem aktualizace
 */
export async function updateUserImage({ imageUrl }: { imageUrl: string }) {
  const response = await fetch('/api/user/update-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Nepodařilo se aktualizovat obrázek');
  }

  return await response.json();
}

/**
 * Kontrola, zda má uživatel heslo
 * @returns {Promise<any>} Response s informací o existenci hesla
 */
export async function checkUserHasPassword() {
  const response = await fetch('/api/user/has-password');
  if (!response.ok) {
    throw new Error('Nepodařilo se zkontrolovat heslo');
  }
  return await response.json();
}

/**
 * Získání oblíbených tagů uživatele
 * @returns {Promise<any>} Response s oblíbenými tagy
 */
export async function getFavoriteTags() {
  const response = await fetch('/api/user/favorite-tags');
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst oblíbené tagy');
  }
  return await response.json();
}

/**
 * Přidání oblíbeného tagu
 * @param {Object} params - Parametry pro přidání tagu
 * @param {string} params.tagId - ID tagu
 * @returns {Promise<any>} Response s výsledkem operace
 */
export async function addFavoriteTag({ tagId }: { tagId: string }) {
  const response = await fetch('/api/user/favorite-tags', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tagId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Nepodařilo se přidat oblíbený tag');
  }

  return await response.json();
}

/**
 * Odebrání oblíbeného tagu
 * @param {Object} params - Parametry pro odebrání tagu
 * @param {string} params.tagId - ID tagu
 * @returns {Promise<any>} Response s výsledkem operace
 */
export async function removeFavoriteTag({ tagId }: { tagId: string }) {
  const response = await fetch('/api/user/favorite-tags', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tagId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Nepodařilo se odebrat oblíbený tag');
  }

  return await response.json();
}

/**
 * Získání stavu předplatného pro aktuálního uživatele
 * @returns {Promise<{ hasSubscription: boolean; isActive: boolean; startDate: string | null; endDate: string | null }>} Stav předplatného
 */
export async function getCurrentSubscriptionStatus() {
  const response = await fetch('/api/subscription/me');

  if (!response.ok) {
    // Pro neautorizované uživatele vrátíme "bez předplatného" bez vyhození chyby
    if (response.status === 401) {
      return {
        hasSubscription: false,
        isActive: false,
        startDate: null,
        endDate: null,
      };
    }

    throw new Error('Nepodařilo se načíst předplatné');
  }

  return await response.json();
}
