"use client";

import { useEffect } from "react";

/**
 * ArticleViewTracker komponenta
 * Klientská komponenta, která při zobrazení článku zaloguje zobrazení přes PATCH /api/articles/[slug].
 * Používá sessionStorage, aby v rámci jedné relace nepočítala stejný článek vícekrát.
 * @param {Object} props - Vlastnosti komponenty.
 * @param {string} props.slug - Slug článku pro logování.
 * @returns {null} Nic nevykresluje, pouze efekt pro logování.
 */
export default function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug || typeof window === "undefined") return;

    const key = `article_viewed_${slug}`;
    if (sessionStorage.getItem(key)) {
      return;
    }
    sessionStorage.setItem(key, "1");

    fetch(`/api/articles/${encodeURIComponent(slug)}`, {
      method: "PATCH",
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Error logging article view:", error);
    });
  }, [slug]);

  return null;
}

