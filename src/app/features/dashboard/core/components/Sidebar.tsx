'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon, IconNode } from "lucide-react";
import { Icon } from "lucide-react";
import {
  DropdownWrapper,
  DropdownContent,
  DropdownItem,
  DropdownDivider,
  DropdownCard,
} from "@/components/ui/dashboard/Dropdown";
import { useDropdown } from "@/utils/dropdown";
import { getSidebarProfileData } from "@/app/features/dashboard/core/api/sidebar.api";
import { signOut } from "@/app/features/blog/auth/api/auth.api";
import { ArrowUpRight, BookMarked, LogOut, Menu, UserCog } from "lucide-react";
import { dashboardPages } from "@/app/features/dashboard/core/dashboardNavigation";
import { getSafeImageInfo } from "@/lib/utils/image";

/**
 * Kontext pro stav sidebaru v dashboardu.
 * @returns {SidebarContextType} Stav a akce sidebaru.
 */
type SidebarContextType = {
  open: boolean;
  toggle: () => void;
  close: () => void;
  openSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);
  const openSidebar = () => setOpen(true);

  return (
    <SidebarContext.Provider value={{ open, toggle, close, openSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
};

/**
 * Odkaz v sidebaru.
 * @return {JSX.Element} SidebarLink.
 */
function SidebarLink({
    href,
    Icon: IconComponent,
    children
}: {
    href: string;
    Icon?: LucideIcon;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <li className="w-full">
            <Link
                href={href}
                className={
                    `w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm tracking-tight font-medium text-zinc-300 hover:bg-zinc-900/75 hover:text-white transition-colors cursor-pointer` +
                    (isActive ? " bg-zinc-900 text-white!" : "")
                }
            >
                {IconComponent && <IconComponent size={16} />}
                {children}
            </Link>
        </li>
    );
}

/**
 * Skupina odkazů v sidebaru.
 * @return {JSX.Element} SidebarGroup.
 */
function SidebarGroup({
    title,
    UseIcon,
    iconNode,
    children,
}: {
    title: string;
    UseIcon?: React.ElementType;
    iconNode?: IconNode;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-6 space-y-2.5">
            <h3 className="text-zinc-500 text-xs uppercase font-semibold tracking-widest flex items-center gap-2">
                {UseIcon && <UseIcon size={16} />}
                {iconNode && <Icon iconNode={iconNode} size={16} />}
                {title}
            </h3>
            <ul className="space-y-1">
                {children}
            </ul>
        </div>
    );
}

/**
 * Oddělovač skupin.
 * @return {JSX.Element} SidebarGroupDivider.
 */
function SidebarGroupDivider() {
    return (
        <div className="my-2 border-t border-zinc-900" />
    );
}

/**
 * Scrollovatelný obsah sidebaru.
 * @return {JSX.Element} SidebarContent.
 */
function SidebarContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative max-h-[calc(100vh-6rem)] h-full overflow-y-auto">
            {children}
        </div>
    );
}

/**
 * Hlavička sidebaru s profilem a akcemi.
 * @returns {JSX.Element} SidebarHeader.
 */
function SidebarHeader() {
    const router = useRouter();
    const { toggle } = useSidebar();
    const { toggleRef, dropdownRef, open, toggleDropdown, closeDropdown } = useDropdown();
    const [profile, setProfile] = useState<{
        name: string;
        surname: string;
        image: string | null;
        maxStorageBytes: number | null;
    } | null>(null);
    const [usedStorageBytes, setUsedStorageBytes] = useState(0);

    const DEFAULT_QUOTA_LIMIT_BYTES = 2 * 1024 * 1024 * 1024;

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024)
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    useEffect(() => {
        let disposed = false;

        const loadSidebarData = async () => {
            try {
                const { profile: user, usedStorageBytes } =
                    await getSidebarProfileData();
                if (disposed) return;

                if (user) {
                    setProfile({
                        name: user.name ?? "",
                        surname: user.surname ?? "",
                        image: user.image ?? null,
                        maxStorageBytes:
                            typeof user.maxStorageBytes === "number"
                                ? user.maxStorageBytes
                                : null,
                    });
                }

                setUsedStorageBytes(usedStorageBytes);
            } catch (error) {
                console.error("Sidebar data load failed:", error);
            }
        };

        loadSidebarData();
        return () => {
            disposed = true;
        };
    }, []);

    const fullName = useMemo(() => {
        if (!profile) return "Načítám...";
        const name = `${profile.name} ${profile.surname}`.trim();
        return name || "Uživatel";
    }, [profile]);

    const initials = useMemo(() => {
        if (!profile) return "U";
        const first = profile.name?.charAt(0) ?? "";
        const second = profile.surname?.charAt(0) ?? "";
        return `${first}${second}`.toUpperCase() || "U";
    }, [profile]);

  const profileImageInfo = profile?.image
    ? getSafeImageInfo(profile.image)
    : { src: null, isProfileImage: false };

    const used = Math.max(0, usedStorageBytes);
    const quotaLimitBytes =
        typeof profile?.maxStorageBytes === "number"
            ? profile.maxStorageBytes
            : DEFAULT_QUOTA_LIMIT_BYTES;
    const safeQuotaLimitBytes = Math.max(0, quotaLimitBytes);
    const remainingBytes = Math.max(0, safeQuotaLimitBytes - used);
    const quotaPercent =
        safeQuotaLimitBytes === 0
            ? 100
            : Math.min(100, Math.round((used / safeQuotaLimitBytes) * 100));

    const handleAccountManagement = () => {
        closeDropdown();
        router.push("/account/settings");
    };

    const handleSignOut = async () => {
        closeDropdown();

        try {
            await signOut();
            router.push("/account/auth/log-in");
            router.refresh();
        } catch (error) {
            console.error("Sidebar sign out failed:", error);
        }
    };

    return (
        <div className="relative">
            <div
                ref={toggleRef as React.RefObject<HTMLDivElement>}
                role="button"
                tabIndex={0}
                aria-label="Profil uživatele"
                onClick={toggleDropdown}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleDropdown();
                    }
                }}
                className="cursor-pointer py-1.5 px-2.5 flex items-center gap-2.5 bg-zinc-900/75 rounded-lg mb-4 hover:bg-zinc-900 transition-colors"
            >
                {profile?.image ? (
                  profileImageInfo.src ? (
                    <Image
                        src={profileImageInfo.src}
                        alt={fullName}
                        width={32}
                        height={32}
                        unoptimized={profileImageInfo.isProfileImage}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300">
                      {initials}
                    </div>
                  )
                ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300">
                        {initials}
                    </div>
                )}
                <div>
                    <h5 className="text-sm -tracking-[0.01em] font-bold text-zinc-200">{fullName}</h5>
                    <p className="text-xs -tracking-[0.01em] font-medium text-zinc-400">Uživatel</p>
                </div>
                <button
                    onClick={toggle}
                    className="ml-auto cursor-pointer text-zinc-400 hover:text-white transition-colors flex lg:hidden items-center"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={20} />
                </button>
            </div>
            <DropdownWrapper
                ref={dropdownRef}
                open={open}
                className="w-full absolute top-18 lg:top-14"
            >
                <DropdownContent>
                    <DropdownCard isHref href="/dashboard/quota" className="flex items-center gap-3 px-2.5">
                        <div className="flex w-min">
                            <div className="relative w-7 h-7">
                                <div className="absolute inset-0 rounded-full border-4 border-zinc-700" />
                                <div
                                    className="absolute inset-0 rounded-full border-4 border-zinc-200"
                                    style={{
                                        maskImage: `conic-gradient(#000 0% ${quotaPercent}%, transparent ${quotaPercent}% 100%)`,
                                        WebkitMaskImage: `conic-gradient(#000 0% ${quotaPercent}%, transparent ${quotaPercent}% 100%)`,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="w-full text-sm text-gray-950 dark:text-white">
                            <p className="font-semibold text-sm -tracking-[0.01em] text-zinc-200">Kvóta: {quotaPercent} %</p>
                            <p className="text-xs font-medium text-zinc-400"><span className="font-medium">{formatBytes(remainingBytes)}</span> z {formatBytes(safeQuotaLimitBytes)} zbývá</p>
                        </div>
                    </DropdownCard>
                    <DropdownDivider />
                    <DropdownItem Icon={LogOut} variant="danger" onClick={() => void handleSignOut()}>Odhlásit se</DropdownItem>
                    <DropdownDivider />
                    <DropdownItem Icon={UserCog} onClick={handleAccountManagement}>Správa účtu</DropdownItem>
                    <DropdownItem Icon={BookMarked} onClick={closeDropdown}>Dokumentace</DropdownItem>
                </DropdownContent>
            </DropdownWrapper>
        </div>
    );
}

/**
 * Sidebar pro dashboard.
 * @returns {JSX.Element} Sidebar.
 */
export default function Sidebar() {
    const { open } = useSidebar();

    return (
        <div
            className={
                `bg-zinc-950 lg:bg-transparent absolute lg:relative w-full lg:w-81 h-full text-white p-6
                transition-transform duration-300 z-40
                ${open ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0`
            }
        >
            <SidebarHeader />
            <SidebarContent>
                {dashboardPages.map((group) => (
                    <SidebarGroup key={group.id} title={group.category} UseIcon={group.icon}>
                        {group.pages.map((page) => (
                            <React.Fragment key={page.id}>
                                {page.dividerBefore && <SidebarGroupDivider />}
                                <SidebarLink href={page.href} Icon={page.icon}>
                                    {page.name}
                                </SidebarLink>
                            </React.Fragment>
                        ))}
                    </SidebarGroup>
                ))}
            </SidebarContent>
        </div>
    );
}

