'use client';

import { authClient } from '@/lib/auth-client';
import { mapAuthClientErrorMessage } from '../mapAuthClientErrorMessage';

/**
 * API obal funkce pro autentizaci uživatelů.
 * Poskytuje tenkou vrstvu nad klienta BetterAuth pro konzistentní použití v feature komponentách.
 */

/**
 * Přihlášení uživatele pomocí emailu a hesla.
 * @param {Object} params - Parametry pro přihlášení.
 * @param {string} params.email - Email uživatele.
 * @param {string} params.password - Heslo uživatele.
 * @returns {Promise} Výsledek z BetterAuth signIn.email.
 */
export async function signInWithEmail({ email, password }: { email: string; password: string }) {
  const result = await authClient.signIn.email({ email, password });
  if (result.error?.message) {
    return {
      ...result,
      error: {
        ...result.error,
        message: mapAuthClientErrorMessage(result.error.message),
      },
    };
  }
  return result;
}

/**
 * Přihlášení uživatele pomocí passkey (WebAuthn).
 * @param {Object} params - Parametry pro přihlášení.
 * @param {boolean} [params.autoFill=false] - Zda použít automatické vyplnění.
 * @param {Object} [params.fetchOptions] - Volitelné obslužné funkce pro úspěch a chybu.
 * @returns {Promise} Výsledek z BetterAuth signIn.passkey.
 */
export async function signInWithPasskey({ 
  autoFill = false, 
  fetchOptions 
}: { 
  autoFill?: boolean; 
  fetchOptions?: { onSuccess?: () => void; onError?: (context: any) => void } 
}) {
  return await authClient.signIn.passkey({ 
    autoFill, 
    fetchOptions 
  });
}

/**
 * Registrace nového uživatele pomocí emailu a hesla.
 * @param {Object} params - Parametry pro registraci.
 * @param {string} params.email - Email uživatele.
 * @param {string} params.password - Heslo uživatele.
 * @param {string} params.name - Celé jméno uživatele (jméno + příjmení).
 * @returns {Promise} Výsledek z BetterAuth signUp.email.
 */
export async function signUpWithEmail({ 
  email, 
  password, 
  name 
}: { 
  email: string; 
  password: string; 
  name: string 
}) {
  return await authClient.signUp.email({ email, password, name });
}

/**
 * Požádat o reset hesla - odešle email s odkazem.
 * @param {Object} params - Parametry pro reset hesla.
 * @param {string} params.email - Email uživatele.
 * @returns {Promise} Výsledek z BetterAuth požadavekPasswordReset.
 */
export async function requestPasswordReset({ email }: { email: string }) {
  return await authClient.requestPasswordReset({ email });
}

/**
 * Reset hesla pomocí tokenu z emailu.
 * @param {Object} params - Parametry pro reset hesla.
 * @param {string} params.newPassword - Nové heslo.
 * @param {string} params.token - Token z reset emailu.
 * @returns {Promise} Výsledek z BetterAuth resetPassword.
 */
export async function resetPasswordWithToken({ 
  newPassword, 
  token 
}: { 
  newPassword: string; 
  token: string 
}) {
  return await authClient.resetPassword({ newPassword, token });
}

/**
 * Změna hesla přihlášeného uživatele.
 * @param {Object} params - Parametry pro změnu hesla.
 * @param {string} params.currentPassword - Aktuální heslo.
 * @param {string} params.newPassword - Nové heslo.
 * @returns {Promise} Výsledek z BetterAuth changePassword.
 */
export async function changeUserPassword({ 
  currentPassword, 
  newPassword 
}: { 
  currentPassword: string; 
  newPassword: string 
}) {
  return await authClient.changePassword({ currentPassword, newPassword });
}

/**
 * Změna emailu přihlášeného uživatele.
 * @param {Object} params - Parametry pro změnu emailu.
 * @param {string} params.newEmail - Nový email.
 * @param {string} [params.callbackURL] - URL pro přesměrování po změně.
 * @returns {Promise} Výsledek z BetterAuth changeEmail.
 */
export async function changeUserEmail({ 
  newEmail, 
  callbackURL 
}: { 
  newEmail: string; 
  callbackURL?: string 
}) {
  return await authClient.changeEmail({ newEmail, callbackURL });
}

/**
 * Získat seznam passkey přihlášeného uživatele.
 * @returns {Promise} Výsledek z BetterAuth passkey.listUserPasskeys.
 */
export async function listUserPasskeys() {
  return await authClient.passkey.listUserPasskeys();
}

/**
 * Přidat nový passkey pro přihlášeného uživatele.
 * @param {Object} params - Parametry pro přidání passkey.
 * @param {string} [params.name] - Volitelný název passkey.
 * @returns {Promise} Výsledek z BetterAuth passkey.addPasskey.
 */
export async function addUserPasskey({ name }: { name?: string }) {
  return await authClient.passkey.addPasskey({ name });
}

/**
 * Uložit nový zobrazovaný název passkey.
 * @param {Object} params - Parametry úpravy.
 * @param {string} params.id - ID passkey.
 * @param {string} params.name - Nový název (může být prázdný řetězec).
 * @returns {Promise<unknown>} JSON odpověď z API.
 */
export async function updateUserPasskeyName({ id, name }: { id: string; name: string }) {
  const response = await fetch('/api/auth/passkey/update-passkey', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, name }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Uložení názvu passkey selhalo');
  }

  return await response.json();
}

/**
 * Smazat passkey přihlášeného uživatele.
 * @param {Object} params - Parametry pro smazání passkey.
 * @param {string} params.id - ID passkey k smazání.
 * @returns {Promise} Response z API koncový bodu.
 */
export async function deleteUserPasskey({ id }: { id: string }) {
  const response = await fetch('/api/auth/passkey/delete-passkey', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Smazání passkey selhalo');
  }

  return await response.json();
}

/**
 * Získat aktuální session uživatele.
 * @returns {Promise} Výsledek z BetterAuth getSession.
 */
export async function getCurrentSession() {
  return await authClient.getSession();
}

/**
 * Odhlásit aktuálního uživatele.
 * @returns {Promise} Výsledek z BetterAuth signOut.
 */
export async function signOut() {
  return await authClient.signOut();
}
