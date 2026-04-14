import Link from "next/link";
import { cva, type VariantProps } from 'cva';
import { clsx } from 'clsx';

/**
 * Karta pro dashboard.
 * @param {CardProps} props - Vlastnosti komponenty.
 * @return {JSX.Element} Card.
 */

const cardVariants = cva({
    base: "bg-zinc-900/75 border border-zinc-800/25 rounded-xl transition-colors text-zinc-200",
    variants: {
        padding: {
            default: "p-4 lg:p-6",
            compact: "p-2 lg:p-2",
        },
        interactive: {
            true: "cursor-pointer hover:bg-zinc-900",
            false: "",
        },
    },
    defaultVariants: {
        padding: "default",
        interactive: false,
    },
});

export interface CardProps extends Omit<VariantProps<typeof cardVariants>, 'padding' | 'interactive'> {
    children?: React.ReactNode;
    href?: string;
    hrefBlank?: boolean;
    padding?: VariantProps<typeof cardVariants>['padding'];
    interactive?: VariantProps<typeof cardVariants>['interactive'];
    className?: string;
    onClick?: () => void;
}

export function Card({ children, href, hrefBlank, className, onClick, padding, interactive }: CardProps) {
    const cardClasses = clsx(
        cardVariants({ 
            padding, 
            interactive: interactive ?? (href !== undefined) 
        }),
        className
    );

    if (href) {
        return (
            <Link href={href} target={hrefBlank ? "_blank" : "_self"} onClick={onClick}>
                <div className={cardClasses}>
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
            >
                {children}
            </div>
        );
    }

    return (
        <div className={cardClasses}>
            {children}
        </div>
    );
}

/**
 * Hlavička karty.
 * @param {CardHeaderProps} props - Vlastnosti komponenty.
 * @return {JSX.Element} CardHeader.
 */

export interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={clsx("font-bold tracking-tight text-lg mb-2", className)}>
            {children}
        </div>
    );
}

/**
 * Tělo karty.
 * @param {CardBodyProps} props - Vlastnosti komponenty.
 * @return {JSX.Element} CardBody.
 */

export interface CardBodyProps {
    children: React.ReactNode;
    className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
    return (
        <div className={clsx("text-sm text-zinc-400", className)}>
            {children}
        </div>
    );
}

/**
 * Patička karty.
 * @param {CardFooterProps} props - Vlastnosti komponenty.
 * @return {JSX.Element} CardFooter.
 */

export interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <div className={clsx("border-t border-zinc-800/75 pt-2 mt-2", className)}>
            {children}
        </div>
    );
}
