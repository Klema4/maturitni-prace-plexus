"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Avatar, Button } from "@/app/components/blog/ui";
import { MessageCircle, Star, ThumbsDown, ThumbsUp, Flag } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ReportDialog } from "@/app/features/blog/threads/components/ReportDialog";

/**
 * ArticleRatingProps
 * Vlastnosti pro ArticleRating komponentu.
 * @interface ArticleRatingProps
 * @property {string} articleId - ID článku
 * @property {string | null} [threadId] - ID threadu pro komentáře
 * @property {number} [commentsCount] - Počet komentářů
 * @property {string} [authorName] - Jméno autora článku
 * @property {string | null} [authorAvatar] - Avatar autora článku
 * @property {string} [authorRole] - Role autora článku
 * @property {number} [initialLikesCount] - Počáteční počet lajků
 * @property {number} [initialDislikesCount] - Počáteční počet dislajků
 * @property {boolean | null} [initialUserRating] - Počáteční hodnocení uživatele (true = like, false = dislike, null = žádné)
 */
interface ArticleRatingProps {
  articleId: string;
  threadId?: string | null;
  commentsCount?: number;
  authorName?: string;
  authorAvatar?: string | null;
  authorRole?: string;
  initialLikesCount?: number;
  initialDislikesCount?: number;
  initialUserRating?: boolean | null;
}

/**
 * ArticleRating komponenta
 * Komponenta pro hodnocení článku s možností like/dislike.
 * @param {ArticleRatingProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} ArticleRating komponenta.
 */
export default function ArticleRating({
  articleId,
  threadId,
  commentsCount = 0,
  authorName = "Neznámý autor",
  authorAvatar = null,
  authorRole = "Autor",
  initialLikesCount = 0,
  initialDislikesCount = 0,
  initialUserRating = null,
}: ArticleRatingProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [dislikesCount, setDislikesCount] = useState(initialDislikesCount);
  const [userRating, setUserRating] = useState<boolean | null>(
    initialUserRating,
  );
  const [isRating, setIsRating] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useEffect(() => {
    const loadSessionAndRating = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          setIsAuthenticated(true);

          // Načíst user rating
          try {
            const response = await fetch(`/api/articles/rating/${articleId}`);
            if (response.ok) {
              const data = await response.json();
              setUserRating(data.rating);
            }
          } catch (error) {
            console.error("Error loading user rating:", error);
          }
        }
      } catch (error) {
        console.error("Error loading session:", error);
      }
    };

    loadSessionAndRating();
  }, [articleId]);

  const handleReportSubmit = async (reason: string) => {
    const response = await fetch(`/api/articles/by-id/${articleId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Nepodařilo se nahlásit článek");
    }
    setShowReportDialog(false);
  };

  const handleRate = async (isLike: boolean) => {
    if (!isAuthenticated || isRating) return;

    setIsRating(true);
    try {
      const response = await fetch(`/api/articles/rate/${articleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isLike }),
      });

      if (!response.ok) {
        throw new Error("Nepodařilo se hodnotit článek");
      }

      const data = await response.json();

      // Aktualizovat počty
      setLikesCount(data.likesCount);
      setDislikesCount(data.dislikesCount);

      // Aktualizovat user rating
      if (userRating === isLike) {
        // Stejný rating - odstranit hodnocení
        setUserRating(null);
      } else {
        // Nový nebo změněný rating
        setUserRating(isLike);
      }
    } catch (error) {
      console.error("Error rating article:", error);
      alert("Nepodařilo se hodnotit článek");
    } finally {
      setIsRating(false);
    }
  };

  // Výpočet průměrného hodnocení (1-5 hvězdiček)
  const totalRatings = likesCount + dislikesCount;
  const averageRating =
    totalRatings > 0 ? ((likesCount / totalRatings) * 5).toFixed(2) : "0.00";

  const fullStars = Math.floor(parseFloat(averageRating));
  const hasHalfStar = parseFloat(averageRating) % 1 >= 0.5;

  return (
    <section className="py-4 px-4 lg:px-8 max-w-screen-2xl mx-auto">
      <div className="max-w-5xl mx-auto">
        <h2 className="newsreader text-3xl font-medium tracking-tighter text-dark mb-4">
          Hodnocení článku
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/75 rounded-xl p-4 sm:h-40">
            <div className="space-y-2">
              <h6 className="text-sm uppercase font-semibold tracking-tight text-zinc-700">
                Autor článku
              </h6>
              <div className="sm:h-40 flex items-center gap-3">
                <Avatar
                  src={authorAvatar || undefined}
                  alt={authorName}
                  size="lg"
                  variant="dark"
                />
                <div className="flex flex-col">
                  <p className="newsreader text-xl font-medium leading-6 tracking-tight text-dark">
                    {authorName}
                  </p>
                  <p className="text-sm font-medium tracking-tight text-zinc-600 leading-4">
                    {authorRole}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/75 rounded-xl p-4 h-40">
            <div className="space-y-2">
              <h6 className="text-sm uppercase font-semibold tracking-tight text-zinc-700">
                Hodnocení
              </h6>
              <p className="text-base lg:text-lg font-bold tracking-tight text-primary">
                {averageRating}
              </p>
              <div className="flex items-center gap-1 text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={`star-${i}`}
                    fill={
                      i < fullStars
                        ? "currentColor"
                        : i === fullStars && hasHalfStar
                          ? "currentColor"
                          : "none"
                    }
                    size={20}
                    className={
                      i < fullStars || (i === fullStars && hasHalfStar)
                        ? "opacity-100"
                        : "opacity-30"
                    }
                  />
                ))}
              </div>
              {isAuthenticated && userRating !== null && (
                <p className="mt-6 flex items-center gap-2 text-sm font-medium tracking-tight text-zinc-600">
                  Hodnotili jste jako{" "}
                  <span
                    className={userRating ? "text-green-800" : "text-red-800"}
                  >
                    {userRating ? (
                      <ThumbsUp size={14} />
                    ) : (
                      <ThumbsDown size={14} />
                    )}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="subtleSuccess"
            size="sm"
            onClick={() => handleRate(true)}
            disabled={!isAuthenticated || isRating}
            className="tracking-tight cursor-pointer"
          >
            <ThumbsUp size={16} />
            <span className="hidden sm:block">Hodnotit pozitivně</span>
          </Button>
          <Button
            variant="subtleDanger"
            size="sm"
            onClick={() => handleRate(false)}
            disabled={!isAuthenticated || isRating}
            className="tracking-tight cursor-pointer"
          >
            <ThumbsDown size={16} />
            <span className="hidden sm:block">Hodnotit negativně</span>
          </Button>
          {threadId ? (
            <Button variant="primary" size="sm" href={`/thread/${threadId}`}>
              <MessageCircle size={16} />
              {commentsCount > 0 ? commentsCount : "Komentáře"}
            </Button>
          ) : (
            <Button variant="primary" size="sm" disabled>
              <MessageCircle size={16} />
              {commentsCount > 0 ? commentsCount : "Komentáře"}
            </Button>
          )}
          {isAuthenticated && (
            <Button
              variant="subtle"
              size="sm"
              onClick={() => setShowReportDialog(true)}
              className="tracking-tight cursor-pointer"
            >
              <Flag size={16} />
              Nahlásit článek
            </Button>
          )}
        </div>
        {!isAuthenticated && (
          <p className="mt-3 text-sm tracking-tight text-zinc-600">
            Chcete článek ohodnotit?{" "}
            <Link
              href="/account/auth/log-in"
              className="font-semibold text-primary hover:underline"
            >
              Přihlaste se
            </Link>{" "}
            nebo{" "}
            <Link
              href="/account/auth/register"
              className="font-semibold text-primary hover:underline"
            >
              se zaregistrujte
            </Link>
            .
          </p>
        )}
      </div>
      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        onSubmit={handleReportSubmit}
        entityType="article"
      />
    </section>
  );
}
