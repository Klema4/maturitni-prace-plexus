'use client';

import { useState } from 'react';
import { Check, Copy, Linkedin, Share2, Twitter } from 'lucide-react';

interface ArticleShareCardProps {
  shareTitle?: string;
  className?: string;
}

const COPY_FEEDBACK_MS = 2000;
const SHARE_PRESS_MS = 200;

export default function ArticleShareCard({
  shareTitle,
  className,
}: ArticleShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [pressedShare, setPressedShare] = useState<'x' | 'linkedin' | null>(
    null,
  );

  const getShareUrl = () =>
    typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  };

  const handleShareX = () => {
    const url = getShareUrl();

    if (!url) {
      return;
    }

    setPressedShare('x');
    setTimeout(() => setPressedShare(null), SHARE_PRESS_MS);

    const params = new URLSearchParams({ url });

    if (shareTitle) {
      params.set('text', shareTitle);
    }

    window.open(
      `https://twitter.com/intent/tweet?${params.toString()}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleShareLinkedIn = () => {
    const url = getShareUrl();

    if (!url) {
      return;
    }

    setPressedShare('linkedin');
    setTimeout(() => setPressedShare(null), SHARE_PRESS_MS);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div
      className={[
        'rounded-xl bg-white/75 p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-tight text-zinc-700">
        <Share2 size={16} />
        Sdílet článek
      </h3>
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={handleCopyLink}
          className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium tracking-tight transition-all hover:bg-primary/10 data-[state=success]:bg-primary/20 data-[state=success]:text-primary"
          data-state={copied ? 'success' : undefined}
        >
          {copied ? (
            <Check size={16} className="shrink-0 text-primary" />
          ) : (
            <Copy
              size={16}
              className="shrink-0 text-zinc-600 group-hover:text-primary"
            />
          )}
          <span
            className={
              copied
                ? 'font-medium text-primary'
                : 'text-zinc-600 group-hover:text-primary'
            }
          >
            {copied ? 'Zkopírováno' : 'Zkopírovat odkaz'}
          </span>
        </button>
        <button
          type="button"
          onClick={handleShareX}
          className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium tracking-tight text-zinc-600 transition-all hover:bg-primary/10 hover:text-primary ${
            pressedShare === 'x' ? 'scale-[0.98] bg-primary/15' : ''
          }`}
        >
          <Twitter size={16} />
          Sdílet na X
        </button>
        <button
          type="button"
          onClick={handleShareLinkedIn}
          className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium tracking-tight text-zinc-600 transition-all hover:bg-primary/10 hover:text-primary ${
            pressedShare === 'linkedin' ? 'scale-[0.98] bg-primary/15' : ''
          }`}
        >
          <Linkedin size={16} />
          Sdílet na LinkedIn
        </button>
      </div>
    </div>
  );
}
