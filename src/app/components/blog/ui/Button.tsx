'use client';

import Link from 'next/link';
import { cva, type VariantProps } from 'cva';
import { clsx } from 'clsx';
import React from 'react';

/**
 * Univerzální Button komponenta podle ShadCN stylu.
 * Může být použita jako button element nebo Link komponenta.
 * Podporuje různé varianty a velikosti podle vizuálního stylu značky.
 *
 * @param {object} props - Vlastnosti komponenty
 * @param {React.ReactNode} props.children - Obsah tlačítka
 * @param {"default" | "primary" | "outline" | "ghost" | "link"} [props.variant="default"] - Varianta tlačítka
 * @param {"sm" | "md" | "lg"} [props.size="md"] - Velikost tlačítka
 * @param {string} [props.href] - URL pro navigaci (změní se na Link)
 * @param {function} [props.onClick] - Obslužná funkce pro kliknutí
 * @param {boolean} [props.disabled] - Zda je tlačítko disabled
 * @param {string} [props.className] - Další CSS třídy
 * @returns {JSX.Element} Renderovaná Button komponenta
 */
export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  href?: string;
  asChild?: boolean;
}

const buttonVariants = cva({
  base: 'cursor-pointer tracking-tight flex gap-2 items-center justify-center rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  variants: {
    variant: {
      default: 'bg-dark text-white hover:bg-dark/90 focus:ring-dark',
      primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
      outline: 'border border-[#E5E7EB] text-dark bg-transparent hover:bg-[#F5F5F5] focus:ring-dark',
      ghost: 'text-dark hover:bg-[#F5F5F5] focus:ring-dark',
      link: 'text-dark underline-offset-4 hover:underline focus:ring-dark',
      subtle: 'bg-white/75 text-dark hover:bg-primary/10 focus:ring-dark',
      subtleSuccess: 'bg-green-500/10 text-green-800 hover:bg-green-500/20 focus:ring-green-500',
      subtleDanger: 'bg-rose-500/10 text-rose-800 hover:bg-rose-500/20 focus:ring-rose-500',
    },  
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export function Button({
  children,
  variant,
  size,
  href,
  onClick,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const buttonClasses = clsx(buttonVariants({ variant, size }), className);

  if (href) {
    return (
      <Link href={href} className={buttonClasses} onClick={onClick as any} {...(rest as any)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={buttonClasses} onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
