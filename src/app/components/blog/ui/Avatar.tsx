'use client';

import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'cva';
import { getSafeImageInfo } from '@/lib/utils/image';

/**
 * Univerzální Avatar komponenta pro zobrazení uživatelského avataru.
 * Pokud není předán obrázek (src), zobrazí výchozí ikonu.
 * Podporuje různé velikosti a lze přizpůsobit stylem podle vizuálního stylu značky.
 *
 * @param {object} props - Vstupní vlastnosti komponenty Avatar
 * @param {string} [props.src] - URL obrázku avatara
 * @param {string} [props.alt="Avatar"] - Alternativní text
 * @param {"xs" | "sm" | "md" | "lg"} [props.size="md"] - Velikost avataru
 * @param {string} [props.className] - Další CSS třídy
 * @returns {JSX.Element} Element zobrazující avatar
 */
export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'size'>, VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  className?: string;
}

const SIZE_TO_PX: Record<'xs' | 'sm' | 'md' | 'lg', number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
};

const avatarVariants = cva({
  base: 'inline-flex items-center justify-center rounded-full overflow-hidden border shrink-0',
  variants: {
    size: {
      xs: 'size-8',
      sm: 'size-10',
      md: 'size-12',
      lg: 'size-14',
    },
    variant: {
      default: 'bg-zinc-50 border-zinc-200',
      dark: 'bg-primary border-primary',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

export function Avatar({
  src,
  alt = 'Avatar',
  size = 'md',
  variant = 'default',
  className,
  ...rest
}: AvatarProps) {
  const px = SIZE_TO_PX[size ?? 'md'];
  const { src: safeSrc, isProfileImage } = getSafeImageInfo(src);

  return (
    <span className={clsx(avatarVariants({ size, variant }), className)} {...rest}>
      {safeSrc ? (
        <Image
          src={safeSrc}
          alt={alt}
          width={px}
          height={px}
          unoptimized={isProfileImage}
          className="object-cover w-full h-full"
        />
      ) : (
        <User
          size={Math.round(px * 0.6)}
          className={variant === 'dark' ? 'text-white' : 'text-zinc-500'}
          aria-label={alt}
        />
      )}
    </span>
  );
}
