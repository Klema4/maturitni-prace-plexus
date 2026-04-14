'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Share2, Copy, Check, Twitter, Linkedin } from 'lucide-react';
import type { ArticleContentBlock } from './Content';

/**
 * Vlastnosti pro sidebar článku.
 * Obsahuje seznam sekcí článku a akce pro sdílení.
 * @property {ArticleContentBlock[]} blocks - Obsahové bloky článku pro generování obsahu.
 * @property {() => void} onCopyLink - Obslužná funkce pro zkopírování URL článku.
 * @property {string} [shareTitle] - Titul článku pro předvyplnění textu při sdílení na X.
 */
interface ArticleSidebarProps {
  blocks: ArticleContentBlock[];
  onCopyLink?: () => void;
  shareTitle?: string;
}

/**
 * Sidebar článku s obsahem a akcemi sdílení.
 * Vpravo vedle článku zobrazuje navigaci mezi sekcemi a tlačítka pro sdílení.
 * @param {Object} props - Vlastnosti komponenty.
 * @param {ArticleContentBlock[]} props.blocks - Obsahové bloky článku.
 * @param {() => void} [props.onCopyLink] - Obslužná funkce pro zkopírování URL článku.
 * @param {string} [props.shareTitle] - Titul článku pro sdílení na X.
 * @returns {JSX.Element} Sidebar článku.
 */
const COPY_FEEDBACK_MS = 2000;
const SHARE_PRESS_MS = 200;

export default function ArticleSidebar({ blocks, onCopyLink, shareTitle }: ArticleSidebarProps) {
  const [copied, setCopied] = useState(false);
  const [pressedShare, setPressedShare] = useState<'x' | 'linkedin' | null>(null);

  const getShareUrl = () => (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopyLink = () => {
    if (onCopyLink) {
      onCopyLink();
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  };

  const handleShareX = () => {
    const url = getShareUrl();
    if (!url) return;
    setPressedShare('x');
    setTimeout(() => setPressedShare(null), SHARE_PRESS_MS);
    const params = new URLSearchParams({ url });
    if (shareTitle) params.set('text', shareTitle);
    window.open(`https://twitter.com/intent/tweet?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const url = getShareUrl();
    if (!url) return;
    setPressedShare('linkedin');
    setTimeout(() => setPressedShare(null), SHARE_PRESS_MS);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
  };
  return (
    <aside className="flex flex-col gap-2">
      <div className="sticky top-24 overflow-hidden">
        <div className="p-4 bg-primary/10 rounded-xl">
          <h3 className="text-xs font-semibold tracking-tight text-zinc-700 mb-2 uppercase flex items-center gap-2">
            <BookOpen size={16} />
            Obsah článku
          </h3>
          <ul className="flex flex-col gap-0.5">
            {blocks.map((block) => (
              <li key={block.id}>
                <Link
                  href={`#${block.id}`}
                  className="w-full px-2 py-1.5 block text-sm font-medium text-zinc-600 hover:text-primary tracking-tight cursor-pointer transition-colors rounded-lg hover:bg-primary/10"
                >
                  {block.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-white/75 rounded-xl mt-2">
          <h3 className="text-xs font-semibold tracking-tight text-zinc-700 mb-2 uppercase flex items-center gap-2">
            <Share2 size={16} />
            Sdílet článek
          </h3>
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium tracking-tight cursor-pointer transition-all rounded-lg hover:bg-primary/10 data-[state=success]:bg-primary/20 data-[state=success]:text-primary"
              data-state={copied ? 'success' : undefined}
            >
              {copied ? <Check size={16} className="text-primary shrink-0" /> : <Copy size={16} className="shrink-0" />}
              <span className={copied ? 'text-primary font-medium' : 'text-zinc-600 hover:text-primary'}>{copied ? 'Zkopírováno' : 'Zkopírovat odkaz'}</span>
            </button>
            <button
              type="button"
              onClick={handleShareX}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-zinc-600 hover:text-primary tracking-tight cursor-pointer transition-all rounded-lg hover:bg-primary/10 ${pressedShare === 'x' ? 'scale-[0.98] bg-primary/15' : ''}`}
            >
              <Twitter size={16} />
              Sdílet na X
            </button>
            <button
              type="button"
              onClick={handleShareLinkedIn}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-zinc-600 hover:text-primary tracking-tight cursor-pointer transition-all rounded-lg hover:bg-primary/10 ${pressedShare === 'linkedin' ? 'scale-[0.98] bg-primary/15' : ''}`}
            >
              <Linkedin size={16} />
              Sdílet na LinkedIn
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

