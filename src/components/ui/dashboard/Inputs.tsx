'use client'

import { useId } from 'react';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'cva';

const inputVariants = cva({
  base: "w-full bg-zinc-800/75 border border-zinc-700/50 rounded-md text-white text-sm tracking-tight font-medium focus:outline-none focus:ring-2 focus:ring-white/75 transition-all placeholder:text-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed",
  variants: {
    variant: {
      default: "px-3 py-2.5",
      error: "border-rose-500 focus:ring-rose-500/20",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface BaseProps {
  label?: string;
  error?: string;
  description?: string;
}

/**
 * Textový vstup (input type text, password, email, atd.)
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseProps, VariantProps<typeof inputVariants> {}

export function Input({ label, error, description, className, variant, ...props }: InputProps) {
  const id = useId();
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium tracking-tight text-white">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(inputVariants({ variant: error ? 'error' : variant }), className)}
        {...props}
      />
      {description && !error && (
        <p className="text-xs tracking-tight font-medium text-zinc-500">{description}</p>
      )}
      {error && (
        <p className="text-xs tracking-tight font-medium text-rose-500">{error}</p>
      )}
    </div>
  );
}

/**
 * Textová oblast (textarea)
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, BaseProps, VariantProps<typeof inputVariants> {}

export function Textarea({ label, error, description, className, variant, ...props }: TextareaProps) {
  const id = useId();
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium tracking-tight text-white">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={clsx(inputVariants({ variant: error ? 'error' : variant }), "min-h-[100px] resize-y", className)}
        {...props}
      />
      {description && !error && (
        <p className="text-xs tracking-tight font-medium text-zinc-500">{description}</p>
      )}
      {error && (
        <p className="text-xs tracking-tight font-medium text-rose-500">{error}</p>
      )}
    </div>
  );
}

/**
 * Přepínač (přepínač)
 */
export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  showLabel?: boolean;
}

export function Toggle({ label, description, className, checked, showLabel = true, ...props }: ToggleProps) {
  const id = useId();
  
  const toggleSwitch = (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input 
        id={id}
        type="checkbox" 
        checked={checked}
        className="sr-only peer" 
        {...props} 
      />
      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer-checked:bg-indigo-700/50 transition-colors relative">
        <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full transition-all duration-200 shadow-sm ${checked ? 'left-[22px]' : 'left-[2px]'}`}></div>
      </div>
    </label>
  );

  if (!showLabel) {
    return toggleSwitch;
  }

  return (
    <div className={clsx("flex items-start justify-between gap-4 py-1", className)}>
      <div className="space-y-0.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium tracking-tight text-white cursor-pointer">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs tracking-tight font-medium text-zinc-500">{description}</p>
        )}
      </div>
      {toggleSwitch}
    </div>
  );
}
