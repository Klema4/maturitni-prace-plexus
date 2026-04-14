"use client";

import { Menu } from "lucide-react";
import { Button } from "@/app/components/blog/ui/Button";

type CompanyAdsWorkspaceHeaderProps = {
  companyName?: string | null;
  onOpenMenu: () => void;
};

export function CompanyAdsWorkspaceHeader({
  companyName,
  onOpenMenu,
}: CompanyAdsWorkspaceHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

      <div className="lg:hidden">
        <Button
          variant="outline"
          size="sm"
          className="border-black/10 bg-white"
          onClick={onOpenMenu}
        >
          <Menu size={16} />
          Menu firmy
        </Button>
      </div>
    </header>
  );
}
