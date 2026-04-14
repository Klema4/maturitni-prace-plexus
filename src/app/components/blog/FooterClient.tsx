'use client';

import Link from 'next/link';
import { Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';

export interface FooterLink {
  href: string;
  label: string;
}

export interface FooterLinksGroup {
  [category: string]: FooterLink[];
}

interface FooterClientProps {
  sectionLinks?: FooterLink[];
  brandName: string;
}

const EMPTY_SECTION_LINKS: FooterLink[] = [];

/**
 * Klientská patička blogu.
 * @param {FooterClientProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} Footer.
 */
export default function FooterClient({
  sectionLinks = EMPTY_SECTION_LINKS,
  brandName,
}: FooterClientProps) {
  const year = new Date().getFullYear();
  const staticLinks: FooterLinksGroup = {
    'O našem magazínu': [
      { href: '/about-us', label: 'O našem magazínu' },
      { href: '/career', label: 'Kariéra' },
      { href: '/contact', label: 'Kontakt' },
    ],
    'Pro firmy': [
      { href: '/firmy/registrace', label: 'Registrace firmy' },
      { href: '/frmy', label: 'Vstup do firmy' },
    ],
    'Právní informace': [
      { href: '/privacy-policy', label: 'Ochrana osobních údajů' },
      { href: '/terms-of-service', label: 'Podmínky použití' },
    ],
  };

  // Dynamické sekce z DB
  const dynamicLinks: FooterLinksGroup = sectionLinks.length > 0 
    ? { 'Sekce': sectionLinks }
    : {};

  const footerLinks: FooterLinksGroup = {
    ...staticLinks,
    ...dynamicLinks,
  };

  const socialLinks = [
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
  ];

  return (
    <footer className="max-w-screen-2xl mx-auto w-full px-4 lg:px-8 mt-12 mb-4 lg:mb-8">
      {/* Horní část */}
      <div className="rounded-lg lg:rounded-xl bg-white/75 py-12 md:py-16 px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-zinc-800 tracking-tighter text-lg lg:text-xl font-bold mb-4">{category}</h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={`${category}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-zinc-600 tracking-tight font-medium text-sm hover:text-zinc-800 transition-colors cursor-pointer"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>

      {/* Spodní část */}
      <div className="rounded-lg lg:rounded-xl bg-primary text-white tracking-tight font-medium py-6 mt-4 px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm">
              <span className="newsreader text-base font-normal tracking-tight">
                © {year} {brandName}. Všechna práva vyhrazena.
              </span>
              <Link href="/privacy-policy" className="text-xs font-normal hover:text-zinc-200 transition-colors">
                Ochrana osobních údajů
              </Link>
              <Link href="/terms-of-service" className="text-xs font-normal hover:text-zinc-200 transition-colors">
                Podmínky použití
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="text-zinc-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <Icon size={20} />
                  </Link>
                );
              })}
            </div>
          </div>
      </div>
    </footer>
  );
}
