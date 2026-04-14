import { cva, type VariantProps } from 'cva';
import { clsx } from 'clsx';

/**
 * Typografické komponenty pro dashboard.
 * @param {HeadingProps} props - Vlastnosti komponenty.
 * @return {JSX.Element} Heading.
 */

const headingVariants = cva({
    base: "text-zinc-200 font-semibold tracking-tight",
    variants: {
        variant: {
            h1: "text-3xl lg:text-4xl",
            h2: "text-2xl lg:text-3xl",
            h3: "text-xl lg:text-2xl",
            h4: "text-lg lg:text-xl",
            h5: "text-base lg:text-lg",
            h6: "text-sm lg:text-base",
        },
    },
    defaultVariants: {
        variant: "h1",
    },
});

export interface HeadingProps extends Omit<VariantProps<typeof headingVariants>, 'variant'> {
    variant?: VariantProps<typeof headingVariants>['variant'];
    className?: string;
    children: React.ReactNode;
}

export function Heading({ 
    variant = "h1", 
    className, 
    children 
}: HeadingProps) {
    const Tag = variant as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

    return (
        <Tag className={clsx(headingVariants({ variant }), className)}>
            {children}
        </Tag>
    );
}

/**
 * Odstavec pro dashboard.
 * @param {ParagraphProps} props - Vlastnosti komponenty.
 * @return {JSX.Element} Paragraph.
 */

const paragraphVariants = cva({
    base: "tracking-tight",
    variants: {
        size: {
            default: "text-md!",
            extrasmall: "text-xs!",
            small: "text-sm!",
            large: "text-lg!",
        },
        variant: {
            default: "text-zinc-400",
            muted: "text-zinc-500!",
        },
        color: {
            default: "text-zinc-400!",
            muted: "text-zinc-500!",
            primary: "text-white!",
            success: "text-green-400!",
            warning: "text-yellow-400!",
            danger: "text-red-400!",
        },
        fontWeight: {
            normal: "font-normal!",
            medium: "font-medium!",
            semibold: "font-semibold!",
            bold: "font-bold!",
            extrabold: "font-extrabold!",
        },
        textAlign: {
            left: "text-left!",
            center: "text-center!",
            right: "text-right!",
        },
    },
    defaultVariants: {
        size: "default",
        variant: "default",
        color: "default",
        fontWeight: "medium",
        textAlign: "left",
    },
});

export interface ParagraphProps extends Omit<VariantProps<typeof paragraphVariants>, 'size' | 'variant' | 'color' | 'fontWeight' | 'textAlign'> {
    size?: VariantProps<typeof paragraphVariants>['size'];
    variant?: VariantProps<typeof paragraphVariants>['variant'];
    color?: VariantProps<typeof paragraphVariants>['color'];
    fontWeight?: VariantProps<typeof paragraphVariants>['fontWeight'];
    textAlign?: VariantProps<typeof paragraphVariants>['textAlign'];
    className?: string;
    children: React.ReactNode;
}

export function Paragraph({ 
    size = "default", 
    variant = "default", 
    color = "default", 
    fontWeight = "medium", 
    textAlign = "left", 
    className, 
    children 
}: ParagraphProps) {
    return (
        <p className={clsx(paragraphVariants({ size, variant, color, fontWeight, textAlign }), className)}>
            {children}
        </p>
    );
}

