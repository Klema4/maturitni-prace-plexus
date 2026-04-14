import React, { forwardRef } from "react";
import Link from "next/link";
import { cva, type VariantProps } from 'cva';
import { clsx } from 'clsx';

/**
 * Wrapper pro dropdown menu.
 * @param {DropdownWrapperProps} props - Vlastnosti komponenty.
 * @return {JSX.Element} DropdownWrapper.
 */

const dropdownWrapperVariants = cva({
    base: "origin-top-left overflow-hidden bg-zinc-900 border border-zinc-800/75 z-999 rounded-lg shadow-md transition-all duration-200",
    variants: {
        open: {
            true: "translate-y-0 scale-100 opacity-100 pointer-events-auto visible",
            false: "-translate-y-2 scale-90 opacity-0 pointer-events-none invisible",
        },
    },
    defaultVariants: {
        open: false,
    },
});

export interface DropdownWrapperProps 
    extends React.HTMLAttributes<HTMLDivElement>, 
    Omit<VariantProps<typeof dropdownWrapperVariants>, 'open'> {
    open: boolean;
    children: React.ReactNode;
}

export const DropdownWrapper = forwardRef<HTMLDivElement, DropdownWrapperProps>(
    ({ open, children, className, ...props }, ref) => (
        <div
            ref={ref}
            className={clsx(dropdownWrapperVariants({ open }), className)}
            {...props}
        >
            {children}
        </div>
    )
);

DropdownWrapper.displayName = "DropdownWrapper";

/**
 * Obsah dropdown menu.
 * @param {DropdownContentProps} props - Vlastnosti komponenty.
 * @return {JSX.Element} DropdownContent.
 */

export interface DropdownContentProps {
    children: React.ReactNode;
    className?: string;
}

export function DropdownContent({ children, className }: DropdownContentProps) {
    return <ul className={clsx("space-y-1", className)}>{children}</ul>;
}

/**
 * Položka dropdown menu.
 * @param {DropdownItemProps} props - Vlastnosti komponenty.
 * @return {JSX.Element} DropdownItem.
 */

const dropdownItemVariants = cva({
    base: "flex items-center gap-2 rounded-lg m-1 px-2 py-1.5 text-sm -tracking-[0.01em] font-medium cursor-pointer transition-colors",
    variants: {
        variant: {
            default: "text-zinc-200 hover:bg-zinc-800/75",
            primary: "text-blue-500 hover:bg-blue-600/10",
            secondary: "text-green-500 hover:bg-green-600/10",
            danger: "text-red-300 hover:text-red-400 hover:bg-red-500/5!",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

export interface DropdownItemProps 
    extends React.LiHTMLAttributes<HTMLLIElement>, 
    Omit<VariantProps<typeof dropdownItemVariants>, 'variant'> {
    children: React.ReactNode;
    variant?: VariantProps<typeof dropdownItemVariants>['variant'];
    Icon?: React.ElementType;
}

export function DropdownItem({ variant, children, className, Icon, ...props }: DropdownItemProps) {
    return (
        <li
            className={clsx(dropdownItemVariants({ variant }), className)}
            {...props}
        >
            {Icon && <Icon size={16} />}
            {children}
        </li>
    );
}

/**
 * Oddělovač v dropdown menu.
 * @return {JSX.Element} DropdownDivider.
 */

export interface DropdownDividerProps {
    className?: string;
}

export function DropdownDivider({ className }: DropdownDividerProps = {}) {
    return <li className={clsx("my-1.5 border-t border-zinc-800/75", className)} />;
}

/**
 * Karta v dropdown menu.
 * @param {DropdownCardProps} props - Vlastnosti komponenty.
 * @return {JSX.Element} DropdownCard.
 */

const dropdownCardVariants = cva({
    base: "p-2 bg-zinc-800/50 m-1 rounded-lg transition-colors",
    variants: {
        interactive: {
            true: "hover:bg-zinc-800",
            false: "w-full",
        },
    },
    defaultVariants: {
        interactive: false,
    },
});

export interface DropdownCardProps extends Omit<VariantProps<typeof dropdownCardVariants>, 'interactive'> {
    children: React.ReactNode;
    isHref?: boolean;
    href?: string;
    interactive?: VariantProps<typeof dropdownCardVariants>['interactive'];
    className?: string;
}

export function DropdownCard({ children, isHref, href, className }: DropdownCardProps) {
    const cardClasses = clsx(
        dropdownCardVariants({ interactive: isHref && !!href }),
        className
    );

    if (isHref && href) {
        return (
            <Link href={href}>
                <div className={cardClasses}>{children}</div>
            </Link>
        );
    }

    return (
        <div className={cardClasses}>
            {children}
        </div>
    );
}

