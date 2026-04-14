import {
  BarChart3,
  CalendarDays,
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  Settings2,
  Users,
} from "lucide-react";

export const companyAdsNavigation = [
  { href: "/firmy/reklamy", label: "Přehled", icon: LayoutDashboard },
  { href: "/firmy/reklamy/kampane", label: "Kampaně", icon: Megaphone },
  { href: "/firmy/reklamy/kalendar", label: "Kalendář", icon: CalendarDays },
  { href: "/firmy/reklamy/analyza", label: "Analýza", icon: BarChart3 },
  { href: "/firmy/reklamy/platby", label: "Platby", icon: CreditCard },
  { href: "/firmy/reklamy/tym", label: "Tým", icon: Users },
  { href: "/firmy/reklamy/nastaveni", label: "Nastavení", icon: Settings2 },
  { href: "/firmy/reklamy/pomoc", label: "Pomoc", icon: CircleHelp },
] as const;
