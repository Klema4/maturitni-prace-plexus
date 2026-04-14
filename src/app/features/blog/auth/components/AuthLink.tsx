'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Komponenta pro odkaz na konci auth stránky.
 * @param {Object} props - Vlastnosti komponenty.
 * @param {string} props.text - Text před odkazem.
 * @param {string} props.linkText - Text odkazu.
 * @param {string} props.href - URL odkazu.
 * @returns {JSX.Element} AuthLink komponenta.
 */
export function AuthLink({ text, linkText, href }: { text: string; linkText: string; href: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-center text-sm tracking-tight font-medium">
      <span className="text-zinc-600">{text}</span>
      <ArrowRight className='text-zinc-500' size={16} />
      <Link href={href} className="text-primary hover:underline">
        {linkText}
      </Link>
    </div>
  );
}
