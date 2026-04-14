import type { LucideIcon } from "lucide-react";
import { Bookmark, Building2, CalendarRange, ChartLine, Contact, Container, Flag, HandCoins, Home, Layers2, List, Mails, Megaphone, MessageSquare, Newspaper, PieChart, ScanEye, Settings, Settings2, ToolCase, Users } from "lucide-react";

/**
 * Typ pro jednotlivou stránku v dashboardu
 */
export interface DashboardPage {
    id: string;
    name: string;
    icon: LucideIcon;
    href: string;
    description: string;
    /** Zobrazit oddělovač před touto položkou (např. v Sidebaru). */
    dividerBefore?: boolean;
}

/**
 * Typ pro kategorii stránek
 */
export interface DashboardCategory {
    id: string;
    category: string;
    icon: LucideIcon;
    pages: DashboardPage[];
}

/**
 * Konfigurace všech stránek dashboardu organizovaných do kategorií
 */
export const dashboardPages: DashboardCategory[] = [
    {
        id: "tools",
        category: "Nástroje",
        icon: ToolCase,
        pages: [
            {
                id: "dashboard-home",
                name: "Hlavní stránka",
                icon: Home,
                href: "/dashboard",
                description: "Přejít na hlavní stránku dashboardu",
            },
            {
                id: "analytics",
                name: "Analytika",
                icon: ChartLine,
                href: "/dashboard/analytics",
                description: "Dlouhodobé grafy a analýzy s ročním přehledem",
            },
            {
                id: "overview",
                name: "Přehled",
                icon: PieChart,
                href: "/dashboard/overview",
                description: "Aktuální statistiky a živé grafy magazínu",
            },
        ],
    },
    {
        id: "content",
        category: "Obsah",
        icon: Layers2,
        pages: [
            {
                id: "sections",
                name: "Sekce stránek",
                icon: Layers2,
                href: "/dashboard/sections",
                description: "Uprav obsah a strukturu sekcí magazínu"
            },
            {
                id: "tags",
                name: "Štítky",
                icon: Bookmark,
                href: "/dashboard/tags",
                description: "Spravuj štítky a kategorie článků"
            },
            {
                id: "articles",
                name: "Příspěvky",
                icon: Newspaper,
                href: "/dashboard/articles",
                description: "Piš a nahrávej nové příběhy ze světa",
                dividerBefore: true,
            },
            {
                id: "storage",
                name: "Úložiště",
                icon: Container,
                href: "/dashboard/storage",
                description: "Nahrávej soubory do sdíleného adresáře",
                dividerBefore: true,
            },
        ],
    },
    {
        id: "users",
        category: "Uživatelé",
        icon: Users,
        pages: [
            {
                id: "users-list",
                name: "Seznam uživatelů",
                icon: Contact,
                href: "/dashboard/users",
                description: "Seznam s podrobnosti a statistikami uživatelů"
            },
            {
                id: "subscriptions",
                name: "Předplatná",
                icon: HandCoins,
                href: "/dashboard/subscriptions",
                description: "Spravuj předplatné a fakturace uživatelů"
            },
        ],
    },
    {
        id: "moderation",
        category: "Moderace",
        icon: MessageSquare,
        pages: [
            {
                id: "comments",
                name: "Komentáře",
                icon: MessageSquare,
                href: "/dashboard/comments",
                description: "Spravovat komentáře k článkům"
            },
            {
                id: "reports",
                name: "Reporty",
                icon: Flag,
                href: "/dashboard/reports",
                description: "Hlášený obsah a reporty"
            },
        ],
    },
    {
        id: "ads",
        category: "Reklamy",
        icon: Megaphone,
        pages: [
            {
                id: "ads-organizations",
                name: "Organizace",
                icon: Building2,
                href: "/dashboard/ads/organizations",
                description: "Spravuj reklamní organizace"
            },
            {
                id: "ads-registrations",
                name: "Firemní registrace",
                icon: Mails,
                href: "/dashboard/ads/registrations",
                description: "Schvaluj žádosti firem o vstup do reklamní sítě"
            },
            {
                id: "ads-campaigns",
                name: "Kampaně a reklamy",
                icon: List,
                href: "/dashboard/ads/campaigns",
                description: "Spravuj kampaně a jednotlivé reklamy v systému"
            },
            {
                id: "ads-calendar",
                name: "Kalendář reklam",
                icon: CalendarRange,
                href: "/dashboard/ads/calendar",
                description: "Získej časový přehled o reklamním prostoru"
            },
        ],
    },
    {
        id: "administration",
        category: "Administrace",
        icon: Settings,
        pages: [
            {
                id: "redaction",
                name: "Redakce",
                icon: Users,
                href: "/dashboard/redaction",
                description: "Spravuj členy redakce magazínu"
            },
            {
                id: "permissions",
                name: "Oprávnění a role",
                icon: ScanEye,
                href: "/dashboard/permissions",
                description: "Nastav role a oprávnění uživatelů"
            },
            {
                id: "settings",
                name: "Nastavení magazínu",
                icon: Settings2,
                href: "/dashboard/settings",
                description: "Konfiguruj obecné nastavení magazínu"
            },
        ],
    },
];

