'use client';

import { clsx } from 'clsx';
import React from 'react';

/**
 * Univerzální Container komponenta pro konzistentní layout a padding.
 *
 * @param {object} props - Vlastnosti komponenty
 * @param {React.ReactNode} props.children - Obsah kontejneru
 * @param {"sm" | "md" | "lg" | "xl" | "full"} [props.size="lg"] - Maximální šířka kontejneru
 * @param {string} [props.className] - Další CSS třídy
 * @returns {JSX.Element} Renderovaná Container komponenta
 */
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-4xl',
  md: 'max-w-6xl',
  lg: 'max-w-8xl',
  xl: 'max-w-9xl',
  full: 'max-w-full',
};

export function Container({ children, size = 'lg', className, ...rest }: ContainerProps) {
  return (
    <div className={clsx('container mx-auto px-4 md:px-8', sizeClasses[size], className)} {...rest}>
      {children}
    </div>
  );
}
