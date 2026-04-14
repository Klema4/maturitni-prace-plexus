"use client";

import { useEffect, useState } from "react";

/**
 * React hook pro stav synchronizovaný s localStorage.
 * Bezpečné pro Next.js (běží až na klientovi).
 *
 * @param {string} key - Klíč v localStorage.
 * @param {T} initialValue - Výchozí hodnota, pokud klíč neexistuje.
 * @returns {[T, (next: T) => void]} Hodnota a setter.
 */
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // ignorujeme - použijeme initialValue
    } finally {
      setHasHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hasHydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignorujeme
    }
  }, [hasHydrated, key, value]);

  return [value, setValue] as const;
}

