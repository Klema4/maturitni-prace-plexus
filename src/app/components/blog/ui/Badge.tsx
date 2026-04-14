'use client';

import { cva, type VariantProps } from 'cva';
import { clsx } from 'clsx';
import Link from 'next/link';
import React, { forwardRef } from 'react';

/**
 * Univerzální Badge komponenta pro zobrazení tagů, kategorií a labelek.
 * Může být použita jako button, link nebo statický element.
 * Podporuje různé varianty podle vizuálního stylu značky.
 *
 * @param {object} props - Vlastnosti komponenty
 * @param {React.ReactNode} props.children - Obsah badge
 * @param {"default" | "outline" | "dark"} [props.variant="default"] - Varianta badge
 * @param {string} [props.href] - URL pro navigaci (změní se na Link)
 * @param {function} [props.onClick] - Obslužná funkce pro kliknutí
 * @param {string} [props.className] - Další CSS třídy
 * @returns {JSX.Element} Renderovaná Badge komponenta
 */
export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'size'>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

const badgeVariants = cva({
  base: 'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium tracking-tight transition-all',
  variants: {
    variant: {
      default: 'bg-white border border-zinc-600 text-zinc-600 hover:bg-zinc-100',
      outline: 'border border-zinc-600 text-zinc-600 bg-transparent hover:bg-zinc-100',
      dark: 'bg-zinc-800 text-white border-transparent hover:bg-zinc-800/90',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const Badge = forwardRef<HTMLElement, BadgeProps>(
  ({ children, variant, href, onClick, className, ...rest }, ref) => {
    const badgeClasses = clsx(badgeVariants({ variant }), className);

    if (href) {
      return (
        <Link href={href} className={badgeClasses} ref={ref as any} {...(rest as any)}>
          {children}
        </Link>
      );
    }

    if (onClick) {
      return (
        <button
          ref={ref as React.RefObject<HTMLButtonElement>}
          onClick={onClick}
          className={badgeClasses}
          {...rest}
        >
          {children}
        </button>
      );
    }

    return (
      <span ref={ref as React.RefObject<HTMLSpanElement>} className={badgeClasses} {...rest}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
