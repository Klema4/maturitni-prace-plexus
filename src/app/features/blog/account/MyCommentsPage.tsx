'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/app/components/blog/ui/Card';
import { Loader2, MessageSquare, ExternalLink, Clock3, ThumbsUp, ThumbsDown } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

type UserComment = {
  id: string;
  threadId: string;
  content: string;
  likesCount: number;
  dislikesCount: number;
  createdAt: string;
  isHidden: boolean;
  article: {
    id: string;
    title: string;
    slug: string;
  };
};

/**
 * MyCommentsPage
 * Stránka Moje komentáře – seznam komentářů přihlášeného uživatele.
 */
export default function MyCommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/user/me/comments');
      if (res.status === 401) {
        router.push('/account/auth/log-in');
        return;
      }
      const data = await res.json();
      setComments(data.comments ?? []);
      setLoading(false);
    };
    void load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="text-primary animate-spin" size={32} />
        <p className="text-zinc-600 tracking-tight">Načítám komentáře...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="newsreader text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-dark">
          Mé komentáře
        </h1>
        <p className="text-zinc-600 text-base max-w-2xl font-medium tracking-tight">
          Přehled všech Vašich komentářů pod články.
        </p>
      </div>

      {comments.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare size={48} className="text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-600 tracking-tight">
            Zatím jste nepsali žádné komentáře.
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 mt-4 text-primary font-medium hover:underline tracking-tight cursor-pointer"
          >
            Prohlédnout články
            <ExternalLink size={16} />
          </Link>
        </Card>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id}>
              <Card className="p-4 hover:bg-zinc-50/80 transition-colors">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={`/thread/${c.threadId}`}
                      className="font-semibold text-dark hover:text-primary transition-colors tracking-tight cursor-pointer line-clamp-1"
                    >
                      <span className="line-clamp-1">{c.article.title}</span>
                    </Link>
                    <Link
                      href={`/thread/${c.threadId}`}
                      className="text-zinc-500 hover:text-primary shrink-0 cursor-pointer"
                      title="Přejít k diskuzi"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                  <p className="flex items-center gap-1 text-zinc-700 text-sm font-medium tracking-tight line-clamp-2 leading-relaxed">
                    <MessageSquare size={14} />
                    {c.content}
                  </p>
                  <div className="flex items-center justify-between text-xs font-medium tracking-tight text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock3 size={14} />
                      {format(new Date(c.createdAt), 'd. M. yyyy, HH:mm', {
                        locale: cs,
                      })}
                    </span>
                    {c.isHidden && (
                      <span className="text-amber-600">Skryto moderátorem</span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="flex items-center gap-1">
                        {c.likesCount} <ThumbsUp className='text-green-700' size={14} />
                      </span>
                      <span className="flex items-center gap-1">
                        {c.dislikesCount} <ThumbsDown className='text-red-700' size={14} />
                      </span>
                    </span>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
