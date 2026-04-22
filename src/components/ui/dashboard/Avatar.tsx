'use client';

import React from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { clsx } from "clsx";
import { cva } from "cva";
import { getSafeImageInfo } from "@/lib/utils/image";

/**
 * Komponenta Avatar pro zobrazení uživatelského avataru.
 * Pokud není předán obrázek (src), zobrazí výchozí ikonu.
 * Lze nastavit velikost ("small" | "medium" | "large"), alternativní text (alt) a další třídy.
 *
 * @param {object} props - Vstupní vlastnosti komponenty Avatar
 * @param {string} [props.src] - URL obrázku avatara
 * @param {string} [props.alt="Uživatelský avatar"] - Alternativní (popisný) text obrázku nebo ikony
 * @param {"xs" | "sm" | "md" | "lg"} [props.size="md"] - Velikost avataru
 * @param {string} [props.className] - Další CSS třídy pro kontejner
 * @returns {JSX.Element} Element zobrazující avatar uživatele
 */
export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'size'> {
    src?: string;
    alt?: string;
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
}

const SIZE_TO_PX: Record<NonNullable<AvatarProps['size']>, number> = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
};

const avatarVariants = cva({
    base: "inline-flex items-center justify-center rounded-full bg-zinc-800 overflow-hidden border border-zinc-700",
    variants: {
        size: {
            xs: "size-6",
            sm: "size-8",
            md: "size-10",
            lg: "size-12",
        },
    },
    defaultVariants: {
        size: "md",
    },
});

export default function Avatar({
    src,
    alt = "Uživatelský avatar",
    size = "md",
    className,
    ...rest 
}: AvatarProps) {
    const px = SIZE_TO_PX[size ?? "md"];
    const { src: safeSrc, isProfileImage } = getSafeImageInfo(src);

    return (
        <span
            className={clsx(avatarVariants({ size }), className)}
            {...rest}
        >
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
                <User size={Math.round(px * 0.7)} className="text-zinc-400" aria-label={alt} />
            )}
        </span>
    );
}
