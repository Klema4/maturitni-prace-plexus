'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession } from '../api/auth.api';

/**
 * Hook pro kontrolu session a přesměrování přihlášených uživatelů.
 * Používá se na stránkách jako login/register, kde už přihlášení uživatelé nemají být.
 * 
 * @param {string} redirectTo - URL pro přesměrování, pokud je uživatel přihlášen (výchozí: `/account/profile`).
 * @returns {Object} Objekt s `checkingSession` booleanem indikujícím, zda se ještě kontroluje session.
 */
export function useAuthSessionRedirect(redirectTo: string = '/account/profile') {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getCurrentSession();
        if (session.data?.user) {
          router.push(redirectTo);
          router.refresh();
          return;
        }
      } catch (error) {
        // Pokud není přihlášen, pokračovat normálně
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router, redirectTo]);

  return { checkingSession };
}
