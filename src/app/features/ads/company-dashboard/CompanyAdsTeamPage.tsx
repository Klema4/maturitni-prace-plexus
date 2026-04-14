"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { MailPlus, Trash2 } from "lucide-react";
import { Button } from "@/app/components/blog/ui/Button";
import { Input } from "@/app/components/blog/ui/Inputs";
import { useCompanyAdsContext } from "./CompanyAdsProvider";
import {
  getCompanyAdsMembers,
  inviteCompanyAdsMember,
  removeCompanyAdsMember,
  updateCompanyAdsMemberRole,
} from "./api/companyAds.api";
import type {
  CompanyAdsMember,
  CompanyAdsMembersResponse,
  CompanyAdsRole,
} from "./types";
import {
  EmptyState,
  InvitePill,
  LoadingState,
  PageSection,
  Panel,
} from "./components";

const inviteRoles: Array<{
  value: Exclude<CompanyAdsRole, "owner">;
  label: string;
}> = [
  { value: "manager", label: "Správce" },
  { value: "viewer", label: "Pouze náhled" },
];

export default function CompanyAdsTeamPage() {
  const {
    activeOrganization,
    canManage,
    loading: contextLoading,
  } = useCompanyAdsContext();
  const [data, setData] = useState<CompanyAdsMembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] =
    useState<Exclude<CompanyAdsRole, "owner">>("manager");
  const [savingInvite, setSavingInvite] = useState(false);

  const lastFetchedOrgRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  const loadData = useEffectEvent(async () => {
    const orgId = activeOrganization?.id;
    if (!orgId) return;

    // Přeskočí načtení, pokud už pro stejnou organizaci běží požadavek nebo už data máme
    if (inFlightRef.current && lastFetchedOrgRef.current === orgId) return;
    if (lastFetchedOrgRef.current === orgId && data) return;

    try {
      inFlightRef.current = true;
      setLoading(true);
      setError(null);
      const json = (await getCompanyAdsMembers(orgId)) as CompanyAdsMembersResponse;
      setData(json);
      lastFetchedOrgRef.current = orgId;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nepodařilo se načíst tým firmy.",
      );
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!activeOrganization?.id || contextLoading) return;
    void loadData();
  }, [activeOrganization?.id, contextLoading, loadData]);

  const ownersCount = useMemo(
    () => data?.members.filter((member) => member.role === "owner").length ?? 0,
    [data?.members],
  );

  const handleInvite = async () => {
    if (!activeOrganization?.id) return;

    try {
      setSavingInvite(true);
      setError(null);
      await inviteCompanyAdsMember(
        activeOrganization.id,
        inviteEmail,
        inviteRole,
      );

      setInviteEmail("");
      setInviteRole("manager");
      lastFetchedOrgRef.current = null;
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Pozvánku se nepodařilo odeslat.",
      );
    } finally {
      setSavingInvite(false);
    }
  };

  const handleRoleChange = async (
    member: CompanyAdsMember,
    nextRole: Exclude<CompanyAdsRole, "owner">,
  ) => {
    if (!activeOrganization?.id) return;

    try {
      setError(null);
      await updateCompanyAdsMemberRole(
        activeOrganization.id,
        member.userId,
        nextRole,
      );
      lastFetchedOrgRef.current = null;
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Roli se nepodařilo změnit.",
      );
    }
  };

  const handleRemove = async (member: CompanyAdsMember) => {
    if (!activeOrganization?.id) return;
    if (
      !confirm(
        `Opravdu chcete odebrat ${member.user.name} ${member.user.surname} z firmy?`,
      )
    )
      return;

    try {
      setError(null);
      await removeCompanyAdsMember(activeOrganization.id, member.userId);
      lastFetchedOrgRef.current = null;
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Člena se nepodařilo odebrat.",
      );
    }
  };

  if (contextLoading || loading) {
    return <LoadingState label="Načítám tým firmy..." />;
  }

  if (error && !data) {
    return <EmptyState title="Tým se nepodařilo načíst" description={error} />;
  }

  return (
    <div className="space-y-6">
      <PageSection
        title="Lidé a přístupy"
        description="Pozvánky, role i přístupy se spravují jen pro právě vybranou firmu."
      />

      {error ? (
        <Panel title="Poslední chyba">
          <p className="text-sm font-medium tracking-tight text-rose-600">
            {error}
          </p>
        </Panel>
      ) : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_1.3fr]">
        <Panel
          title="Pozvat nového člena"
          description="Pozvánka přijde emailem a příjemce se po přijetí rovnou přidá do firmy."
        >
          {canManage ? (
            <div className="space-y-4">
              <Input
                label="Email pozvaného"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="uzivatel@firma.cz"
                variant="light"
              />
              <div className="space-y-2">
                <label
                  htmlFor="company-ads-invite-role"
                  className="text-sm font-medium tracking-tight text-dark"
                >
                  Role po přijetí
                </label>
                <select
                  id="company-ads-invite-role"
                  value={inviteRole}
                  onChange={(event) =>
                    setInviteRole(
                      event.target.value as Exclude<CompanyAdsRole, "owner">,
                    )
                  }
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium tracking-tight text-dark outline-none transition focus:ring-2 focus:ring-primary"
                >
                  {inviteRoles.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="bg-dark text-white"
                onClick={() => {
                  void handleInvite();
                }}
                disabled={savingInvite}
              >
                <MailPlus size={16} />
                {savingInvite ? "Odesílám pozvánku..." : "Poslat pozvánku"}
              </Button>
            </div>
          ) : (
            <EmptyState
              title="Nemáte oprávnění zvát další lidi"
              description="Účet s rolí pro náhled má v této sekci pouze přístup ke čtení."
            />
          )}
        </Panel>

        <Panel
          title="Čekající pozvánky"
          description="Pozvánky jsou navázané na email a čekají na potvrzení od příjemce."
        >
          <div className="space-y-3">
            {data?.pendingInvites.length ? (
              data.pendingInvites.map((invite) => (
                <InvitePill key={invite.id} invite={invite} />
              ))
            ) : (
              <EmptyState
                title="Nikdo aktuálně nečeká"
                description="Po odeslání pozvánky se její stav objeví právě tady."
              />
            )}
          </div>
        </Panel>
      </div>

      <Panel
        title="Aktivní členové firmy"
        description="Každý člen má samostatnou roli v rámci této firmy."
      >
        <div className="space-y-3">
          {data?.members.length ? (
            data.members.map((member) => {
              const fullName =
                `${member.user.name} ${member.user.surname}`.trim();
              const disableRemove = member.role === "owner" && ownersCount <= 1;
              const disableSelect = !canManage || member.role === "owner";

              return (
                <div
                  key={member.userId}
                  className="flex flex-col gap-4 rounded-xl border border-black/6 bg-zinc-50/60 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-lg font-semibold tracking-tight text-dark">
                      {fullName}
                    </p>
                    <p className="mt-1 text-sm font-medium tracking-tight text-zinc-500">
                      {member.user.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {member.role === "owner" ? (
                      <span className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold tracking-tight text-zinc-600">
                        Vlastník
                      </span>
                    ) : (
                      <select
                        value={member.role}
                        disabled={disableSelect}
                        onChange={(event) => {
                          void handleRoleChange(
                            member,
                            event.target.value as Exclude<
                              CompanyAdsRole,
                              "owner"
                            >,
                          );
                        }}
                        className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold tracking-tight text-dark outline-none transition focus:ring-2 focus:ring-primary disabled:opacity-60"
                      >
                        {inviteRoles.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {canManage ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={disableRemove}
                        onClick={() => {
                          void handleRemove(member);
                        }}
                        className="text-rose-600 hover:bg-rose-50 disabled:text-zinc-400"
                      >
                        <Trash2 size={15} />
                        Odebrat
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              title="Firma zatím nemá žádné členy"
              description="Jakmile onboarding pozve další uživatele, objeví se tady."
            />
          )}
        </div>
      </Panel>
    </div>
  );
}
