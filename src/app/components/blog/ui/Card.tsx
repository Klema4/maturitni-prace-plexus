'use client';

import Link from 'next/link';
import { cva, type VariantProps } from 'cva';
import { clsx } from 'clsx';
import React from 'react';

/**
 * Univerzální Card komponenta podle ShadCN stylu.
 * Základní kontejner pro kartu s různými variantami a možnostmi interakce.
 *
 * @param {object} props - Vlastnosti komponenty
 * @param {React.ReactNode} [props.children] - Obsah karty
 * @param {string} [props.href] - URL pro navigaci
 * @param {function} [props.onClick] - Obslužná funkce pro kliknutí
 * @param {"default" | "elevated" | "outline"} [props.variant="default"] - Varianta karty
 * @param {string} [props.className] - Další CSS třídy
 * @returns {JSX.Element} Renderovaná Card komponenta
 */
export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'size'>,
    VariantProps<typeof cardVariants> {
  children?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

const cardVariants = cva({
  base: 'rounded-lg transition-all',
  variants: {
    variant: {
      default: 'bg-white border border-[#E5E7EB]',
      elevated: 'bg-white border border-[#E5E7EB] shadow-sm',
      outline: 'border border-[#E5E7EB] bg-transparent',
    },
    interactive: {
      true: 'cursor-pointer hover:border-[#1A2D35]',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    interactive: false,
  },
});

export function Card({
  children,
  href,
  onClick,
  variant,
  interactive,
  className,
  ...rest
}: CardProps) {
  const cardClasses = clsx(
    cardVariants({
      variant,
      interactive: interactive ?? (href !== undefined || onClick !== undefined),
    }),
    className
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick}>
        <div className={cardClasses} {...rest}>
          {children}
        </div>
      </Link>
    );
  }

  if (onClick) {
    return (
      <div
        className={cardClasses}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={cardClasses} {...rest}>
      {children}
    </div>
  );
}

/**
 * CardHeader komponenta pro hlavičku karty.
 */
export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={clsx('font-bold text-lg mb-2 text-[#1A1A1A]', className)}>{children}</div>;
}

/**
 * CardBody komponenta pro hlavní obsah karty.
 */
export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={clsx('text-sm text-zinc-600', className)}>{children}</div>;
}

/**
 * CardFooter komponenta pro patičku karty.
 */
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={clsx('border-t border-[#E5E7EB] pt-4 mt-4', className)}>{children}</div>
  );
}
