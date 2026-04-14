"use client";

import Link from "next/link";
import { clsx } from "clsx";
import {
  ChevronRight,
  X,
} from "lucide-react";
import { SelectDropdown } from "@/app/components/blog/ui/Dropdown";
import { companyAdsNavigation } from "@/app/features/ads/company-dashboard/companyAdsNavigation.constants";

type OrganizationOption = {
  id: string;
  name: string;
};

type CompanyAdsSidebarProps = {
  activeOrganization?: {
    id: string;
    name: string;
    onboardingStatus: string;
  } | null;
  activePath: string;
  buildCompanyHref: (href: string, organizationId?: string | null) => string;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onSwitchOrganization: (organizationId: string) => void;
  organizations: OrganizationOption[];
  role: string;
};

function CompanySidebarLink({
  active,
  children,
  href,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  children: string;
  href: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium tracking-tight transition-colors",
        active
          ? "bg-primary text-white"
          : "text-zinc-600 hover:bg-primary/15 hover:text-zinc-950",
      )}
    >
      <Icon size={16} className={active ? "text-white" : "text-zinc-500"} />
      <span className="flex-1">{children}</span>
      {active ? <ChevronRight size={15} className="text-white/80" /> : null}
    </Link>
  );
}

export function CompanyAdsSidebar({
  activeOrganization,
  activePath,
  buildCompanyHref,
  isOpen,
  loading,
  onClose,
  onRefresh,
  onSwitchOrganization,
  organizations,
}: CompanyAdsSidebarProps) {
  return (
    <>
      <button
        type="button"
        className={clsx(
          "fixed inset-0 z-40 bg-black/35 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-label="Zavřít postranní menu firmy"
      />

      <aside
        className={clsx(
          "w-[300px] fixed inset-y-0 left-0 z-50 border-r border-zinc-200 bg-white p-4 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex items-start justify-between gap-3 pb-5">
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-tight text-dark">
                {loading ? "Načítám firmu" : activeOrganization?.name ?? "Bez firmy"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/8 bg-white text-zinc-600 transition-colors hover:bg-zinc-100 lg:hidden"
              aria-label="Zavřít menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-6 py-2">
            <div>
              <SelectDropdown
                value={activeOrganization?.id ?? ""}
                onChange={(value) => {
                  onSwitchOrganization(String(value));
                  onClose();
                }}
                options={organizations.map((organization) => ({
                  value: organization.id,
                  label: organization.name,
                }))}
                placeholder="Vyber firmu"
                buttonClassName="w-full rounded-2xl border-black/10 bg-white px-4 py-3 text-left text-sm font-medium text-dark shadow-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <nav className="space-y-1">
              {companyAdsNavigation.map((item) => {
                const active = item.href === activePath;

                return (
                  <CompanySidebarLink
                    key={item.href}
                    active={active}
                    href={buildCompanyHref(item.href, activeOrganization?.id)}
                    icon={item.icon}
                    onClick={onClose}
                  >
                    {item.label}
                  </CompanySidebarLink>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
