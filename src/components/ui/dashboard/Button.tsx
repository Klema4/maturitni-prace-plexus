"use client";
import Link from "next/link";
import { Icon, type IconNode } from "lucide-react";
import { cva, type VariantProps } from "cva";
import { clsx } from "clsx";

const buttonVariants = cva({
  base: "cursor-pointer flex items-center justify-center gap-2 px-2 py-1 rounded-lg text-sm font-medium -tracking-[0.01em] transition-all focus:outline-none focus:ring-2 active:scale-[0.96]",
  variants: {
    variant: {
      primary:
        "text-zinc-900 bg-white border-transparent hover:bg-zinc-200 focus:ring-white/40",
      secondary:
        "text-zinc-200 bg-zinc-800 border-transparent hover:bg-zinc-700 focus:ring-zinc-500/40",
      success:
        "text-white bg-lime-600 border-transparent hover:bg-lime-700 focus:ring-lime-500/40",
      danger:
        "text-white bg-red-500 border-transparent hover:bg-red-800 focus:ring-red-800/40",
      outline:
        "border border-zinc-700 text-zinc-200 bg-transparent hover:bg-zinc-800/75 focus:ring-zinc-500/40",
      link: "text-zinc-200 hover:text-white bg-white/5 hover:bg-white/10 focus:ring-white/20",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export interface ButtonProps extends Omit<
  VariantProps<typeof buttonVariants>,
  "variant"
> {
  href?: string;
  children: React.ReactNode;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  UseIcon?: React.ElementType;
  iconNode?: IconNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function Button({
  href,
  children,
  variant,
  UseIcon,
  iconNode,
  onClick,
  className,
  disabled,
}: ButtonProps) {
  const buttonClasses = clsx(buttonVariants({ variant }), className);

  if (onClick) {
    return (
      <button onClick={onClick} className={buttonClasses} disabled={disabled}>
        {UseIcon && <UseIcon size={16} />}
        {iconNode && <Icon iconNode={iconNode} size={16} />}
        {children}
      </button>
    );
  }

  if (!href) {
    return (
      <button className={buttonClasses} disabled={disabled} type="button">
        {UseIcon && <UseIcon size={16} />}
        {iconNode && <Icon iconNode={iconNode} size={16} />}
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={buttonClasses}>
      {UseIcon && <UseIcon size={16} />}
      {iconNode && <Icon iconNode={iconNode} size={16} />}
      {children}
    </Link>
  );
}
