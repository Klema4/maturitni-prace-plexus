import { cva } from "cva";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Heading } from "./TextUtils";

interface QuickOption {
    label: string;
    icon: LucideIcon;
    onClick?: () => void;
    link?: string;
    variant?: "primary" | "secondary" | "success" | "danger" | "outline";
    disabled?: boolean;
}

interface QuickOptionsProps {
    options: QuickOption[];
}

const quickOptionsVariants = cva({
    base: "flex flex-wrap justify-between items-center gap-2 my-2",
});

const quickOptionItemVariants = cva({
    base: "flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm tracking-tight font-medium cursor-pointer active:scale-[0.98] transition-all",
    variants: {
        variant: {
            primary: "bg-zinc-800 border border-zinc-700/50 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-600",
            secondary: "bg-zinc-800 border border-zinc-700/50 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-600",
            success: "bg-green-800 border border-green-700/50 text-white hover:bg-green-700 hover:border-green-600",
            danger: "bg-rose-900 border border-rose-700/50 text-white hover:bg-rose-800 hover:border-rose-600",
            outline: "bg-transparent border border-zinc-700/50 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600",
        },
        disabled: {
            true: "opacity-50 cursor-not-allowed hover:bg-inherit hover:border-inherit active:scale-100",
            false: "",
        },
    },
    defaultVariants: {
        variant: "primary",
        disabled: false,
    },
});

/**
 * Komponenta QuickOptions pro rychlé zobrazování tlačítek/odkazů s ikonami.
 * @param {QuickOptionsProps} props - Konfigurace možností k vykreslení.
 * @returns {JSX.Element} Renderovaný panel s rychlými možnostmi.
 */
export default function QuickOptions({ options }: QuickOptionsProps) {
    return (
        <div className={quickOptionsVariants()}>
            <Heading variant="h6">Rychlé možnosti</Heading>
            <div className="flex items-center gap-2">
                {options.map((option) => {
                    const OptionIcon = option.icon;
                    const itemClass = quickOptionItemVariants({ 
                        variant: option.variant ?? "primary",
                        disabled: option.disabled ?? false,
                    });
                    const labelElement = (
                        <span className="hidden sm:inline">{option.label}</span>
                    );
                    if (option.link) {
                        return (
                            <Link href={option.link} key={option.label} className={itemClass}>
                                {OptionIcon && <OptionIcon className="text-current" size={16} />}
                                {labelElement}
                            </Link>
                        );
                    }
                    return (
                        <button
                            type="button"
                            onClick={option.onClick}
                            disabled={option.disabled}
                            key={option.label}
                            className={itemClass}
                        >
                            {OptionIcon && <OptionIcon className="text-current" size={16} />}
                            {labelElement}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}