"use client";

import { useId } from "react";
import { clsx } from "clsx";
import { cva, type VariantProps } from "cva";

const inputVariants = cva({
  base: "w-full rounded-lg text-sm tracking-tight font-medium focus:outline-none focus:ring-2 transition-all placeholder:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2.5",
  variants: {
    variant: {
      default:
        "bg-zinc-800/75 border border-zinc-700/50 text-white focus:ring-white/75",
      light: "bg-white border border-zinc-200 text-dark focus:ring-primary",
      error:
        "bg-zinc-800/75 border border-rose-500 text-white focus:ring-rose-500/20",
      errorLight:
        "bg-white border border-rose-500 text-dark focus:ring-rose-500/20",
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
export interface InputProps
  extends
    React.InputHTMLAttributes<HTMLInputElement>,
    BaseProps,
    VariantProps<typeof inputVariants> {}

export function Input({
  label,
  error,
  description,
  className,
  variant,
  ...props
}: InputProps) {
  const id = useId();
  const isLight = variant === "light" || variant === "errorLight";
  const finalVariant = error
    ? variant === "light"
      ? "errorLight"
      : "error"
    : variant || "default";

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className={clsx(
            "block text-sm font-medium tracking-tight",
            isLight ? "text-dark" : "text-white",
          )}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(inputVariants({ variant: finalVariant }), className)}
        {...props}
      />
      {description && !error && (
        <p
          className={clsx(
            "text-xs tracking-tight font-medium",
            isLight ? "text-zinc-600" : "text-zinc-500",
          )}
        >
          {description}
        </p>
      )}
      {error && (
        <p className="text-xs tracking-tight font-medium text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Textová oblast (textarea)
 */
export interface TextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseProps,
    VariantProps<typeof inputVariants> {}

export function Textarea({
  label,
  error,
  description,
  className,
  variant,
  ...props
}: TextareaProps) {
  const id = useId();
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium tracking-tight text-white"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={clsx(
          inputVariants({ variant: error ? "error" : variant }),
          "min-h-[100px] resize-y",
          className,
        )}
        {...props}
      />
      {description && !error && (
        <p className="text-xs tracking-tight font-medium text-zinc-500">
          {description}
        </p>
      )}
      {error && (
        <p className="text-xs tracking-tight font-medium text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Přepínač
 */
export interface ToggleProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
  description?: string;
}

export function Toggle({
  label,
  description,
  className,
  checked,
  ...props
}: ToggleProps) {
  const id = useId();
  return (
    <div
      className={clsx("flex items-start justify-between gap-4 py-1", className)}
    >
      <div className="space-y-0.5">
        <label
          htmlFor={id}
          className="block text-sm font-medium tracking-tight text-white cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs tracking-tight font-medium text-zinc-500">
            {description}
          </p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer mt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          className="sr-only peer"
          {...props}
        />
        <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white/75 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white peer-checked:after:bg-zinc-900 after:border-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white transition-colors"></div>
      </label>
    </div>
  );
}
