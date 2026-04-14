'use client';

import { clsx } from 'clsx';
import React from 'react';

/**
 * Univerzální Separator komponenta pro horizontální oddělovače.
 *
 * @param {object} props - Vlastnosti komponenty
 * @param {"horizontal" | "vertical"} [props.orientation="horizontal"] - Orientace separatoru
 * @param {string} [props.className] - Další CSS třídy
 * @returns {JSX.Element} Renderovaná Separator komponenta
 */
export interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Separator({ orientation = 'horizontal', className, ...rest }: SeparatorProps) {
  return (
    <hr
      className={clsx(
        'border-0 bg-zinc-800/50',
        orientation === 'horizontal' ? 'w-full h-px' : 'h-full w-px',
        className
      )}
      {...rest}
    />
  );
}
