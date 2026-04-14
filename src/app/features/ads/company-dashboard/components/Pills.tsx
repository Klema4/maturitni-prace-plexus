import { Avatar } from "@/app/components/blog/ui/Avatar";
import { Badge } from "@/app/components/blog/ui/Badge";
import type { CompanyAdsRole } from "@/lib/schemas/companyAdsSchema";
import type { CompanyAdsInvite, CompanyAdsMember } from "../types";
import { formatDate } from "./formatters";

export function MemberPill({ member }: { member: CompanyAdsMember }) {
  const fullName = `${member.user.name} ${member.user.surname}`.trim();

  const roles: Record<CompanyAdsRole, string> = {
    owner: "Vlastník",
    manager: "Správce",
    viewer: "Čtenář",
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-3.5 py-3.5">
      <Avatar src={member.user.image ?? undefined} alt={fullName} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold tracking-tight text-dark">{fullName}</p>
        <p className="truncate text-xs font-medium tracking-tight text-zinc-500">{member.user.email}</p>
      </div>
      <Badge className="border-zinc-200! bg-white text-zinc-600 hover:bg-white">{roles[member.role]}</Badge>
    </div>
  );
}

export function InvitePill({ invite }: { invite: CompanyAdsInvite }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-black/6 bg-zinc-50/70 px-3.5 py-3.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight text-dark">{invite.email}</p>
        <p className="text-xs font-medium tracking-tight text-zinc-500">
          Role {invite.role} • Platí do {formatDate(invite.expiresAt)}
        </p>
      </div>
      <Badge className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">Čeká</Badge>
    </div>
  );
}
