"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import {
  AlertCircle,
  Ban,
  CheckCircle,
  HardDrive,
  MoreVertical,
  Shield,
  User,
  UserCog,
  Pencil,
} from "lucide-react";
import Avatar from "@/components/ui/dashboard/Avatar";
import Button from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import {
  DropdownContent,
  DropdownDivider,
  DropdownItem,
  DropdownWrapper,
} from "@/components/ui/dashboard/Dropdown";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/dashboard/Modal";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { Separator } from "@/app/components/blog/ui";
import {
  RoleBadge,
  type Role as RoleBadgeRole,
} from "@/app/features/dashboard/shared/components/RoleBadge";
import { RoleItem } from "@/app/features/dashboard/shared/components/RoleItem";
import { useDropdown } from "@/utils/dropdown";
import { Input } from "@/components/ui/dashboard/Inputs";
import type {
  DashboardUser as DashboardUserRecord,
  Role,
  UserRole,
} from "../types";

export function UserCard({
  user,
  roles,
  onRoleChange,
  onBanToggle,
  onQuotaChange,
  onUpdateUserInfo,
}: {
  user: DashboardUserRecord;
  roles: Role[];
  onRoleChange: (
    userId: string,
    roleId: string,
    add: boolean,
  ) => Promise<void> | void;
  onBanToggle: (userId: string, ban: boolean) => Promise<void> | void;
  onQuotaChange: (
    userId: string,
    maxStorageBytes: number,
  ) => Promise<void> | void;
  onUpdateUserInfo: (
    userId: string,
    data: { name: string; surname: string; email: string },
  ) => Promise<void> | void;
}) {
  const { open, dropdownRef, toggleRef, toggleDropdown, closeDropdown } =
    useDropdown();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [quotaGb, setQuotaGb] = useState(
    () => Math.max(0, user.maxStorageBytes) / (1024 * 1024 * 1024),
  );
  const [editName, setEditName] = useState(user.name);
  const [editSurname, setEditSurname] = useState(user.surname);
  const [editEmail, setEditEmail] = useState(user.email);

  const getRoleDisplay = (userRoles: UserRole[]) => {
    if (userRoles.length === 0) {
      return {
        label: "Uživatel",
        icon: User,
        bgColor: "bg-zinc-800",
        iconColor: "text-zinc-400",
        color: "#27272a",
      };
    }

    const primaryRole = [...userRoles].sort((a, b) => {
      const aWeight = typeof a.weight === "number" ? a.weight : 0;
      const bWeight = typeof b.weight === "number" ? b.weight : 0;
      return bWeight - aWeight;
    })[0];

    const adminRole = userRoles.find((role) =>
      role.name.toLowerCase().includes("admin"),
    );

    if (adminRole) {
      return {
        icon: Shield,
        color: adminRole.color,
        label: adminRole.name,
      };
    }

    return {
      label: primaryRole?.name ?? "Uživatel",
      icon: User,
      bgColor: "bg-zinc-800",
      iconColor: "text-zinc-400",
      color: primaryRole?.color ?? "#27272a",
    };
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open && toggleRef.current) {
      const rect = toggleRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.right - 192,
      });
      return;
    }

    setDropdownPosition(null);
  }, [open, toggleRef]);

  const handleRoleChange = async (roleId: string, add: boolean) => {
    setActionLoading(true);
    try {
      await onRoleChange(user.id, roleId, add);
      setShowRoleModal(false);
    } catch (actionError) {
      alert(
        actionError instanceof Error ? actionError.message : "Nastala chyba",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanToggle = async (ban: boolean) => {
    setActionLoading(true);
    try {
      await onBanToggle(user.id, ban);
      setShowBanModal(false);
    } catch (actionError) {
      alert(
        actionError instanceof Error ? actionError.message : "Nastala chyba",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuotaSave = async () => {
    const nextQuotaGb =
      typeof quotaGb === "number" && Number.isFinite(quotaGb) ? quotaGb : 0;
    const nextBytes = Math.round(Math.max(0, nextQuotaGb) * 1024 * 1024 * 1024);

    setActionLoading(true);
    try {
      await onQuotaChange(user.id, nextBytes);
      setShowQuotaModal(false);
    } catch (actionError) {
      alert(
        actionError instanceof Error ? actionError.message : "Nastala chyba",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserInfoSave = async () => {
    setActionLoading(true);
    try {
      await onUpdateUserInfo(user.id, {
        name: editName.trim(),
        surname: editSurname.trim(),
        email: editEmail.trim(),
      });
      setShowEditInfoModal(false);
    } catch (actionError) {
      alert(
        actionError instanceof Error ? actionError.message : "Nastala chyba",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const roleDisplay = getRoleDisplay(user.roles);
  const RoleIcon = roleDisplay.icon;

  return (
    <>
      <div className="flex justify-between items-center gap-3 not-last:border-b border-zinc-700/50 pb-1">
        <div className="flex items-center gap-3">
          <Avatar
            src={user.image || undefined}
            alt={`${user.name} ${user.surname}`}
            size="xs"
          />
          <div className="flex flex-col md:flex-row md:items-center md:gap-3">
            <Heading variant="h6" className="leading-4!">
              {user.name} {user.surname}
            </Heading>
            <Paragraph size="extrasmall">{user.email}</Paragraph>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold tracking-tight text-zinc-100"
            style={{
              borderColor: roleDisplay.color,
              backgroundColor: `${roleDisplay.color}22`,
            }}
          >
            <RoleIcon size={14} style={{ color: roleDisplay.color }} />
            {roleDisplay.label}
          </span>
          <div className="relative">
            <button
              ref={toggleRef as never}
              onClick={toggleDropdown}
              className="cursor-pointer rounded-md size-6 flex items-center justify-center transition-colors hover:bg-zinc-800"
            >
              <MoreVertical size={16} className="text-zinc-400" />
            </button>
            {mounted &&
              dropdownPosition &&
              open &&
              createPortal(
                <DropdownWrapper
                  ref={dropdownRef}
                  open={open}
                  className="fixed w-48"
                  style={{
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                  }}
                >
                  <DropdownContent>
                    <DropdownItem
                      Icon={UserCog}
                      onClick={() => {
                        setShowRoleModal(true);
                        closeDropdown();
                      }}
                    >
                      Změnit roli
                    </DropdownItem>
                    <DropdownItem
                      Icon={Pencil}
                      onClick={() => {
                        setEditName(user.name);
                        setEditSurname(user.surname);
                        setEditEmail(user.email);
                        setShowEditInfoModal(true);
                        closeDropdown();
                      }}
                    >
                      Změnit informace
                    </DropdownItem>
                    <DropdownItem
                      Icon={HardDrive}
                      onClick={() => {
                        setQuotaGb(
                          Math.max(0, user.maxStorageBytes) /
                            (1024 * 1024 * 1024),
                        );
                        setShowQuotaModal(true);
                        closeDropdown();
                      }}
                    >
                      Změnit kvótu
                    </DropdownItem>
                    <DropdownDivider />
                    {user.isBanned ? (
                      <DropdownItem
                        Icon={CheckCircle}
                        variant="secondary"
                        onClick={() => {
                          setShowBanModal(true);
                          closeDropdown();
                        }}
                      >
                        Odzabanovat
                      </DropdownItem>
                    ) : (
                      <DropdownItem
                        Icon={Ban}
                        variant="danger"
                        onClick={() => {
                          setShowBanModal(true);
                          closeDropdown();
                        }}
                      >
                        Zabanovat
                      </DropdownItem>
                    )}
                  </DropdownContent>
                </DropdownWrapper>,
                document.body,
              )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        size="md"
      >
        <ModalHeader onClose={() => setShowRoleModal(false)}>
          Změnit role uživatele
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Heading variant="h6" className="mb-2 text-zinc-300">
                Aktuální role:
              </Heading>
              <div className="flex flex-wrap items-center gap-2">
                {user.roles.map((role) => (
                  <RoleBadge
                    key={role.id}
                    role={role as RoleBadgeRole}
                    variant="badge"
                    size="sm"
                  />
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Heading variant="h6" className="mb-2 text-zinc-300">
                Dostupné role:
              </Heading>
              {roles.map((role) => {
                const hasRole = user.roles.some(
                  (userRole) => userRole.id === role.id,
                );
                return (
                  <RoleItem
                    key={role.id}
                    role={role as RoleBadgeRole}
                    hasRole={hasRole}
                    onToggle={(roleId, add) => handleRoleChange(roleId, add)}
                    disabled={actionLoading}
                  />
                );
              })}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            href="#"
            variant="outline"
            onClick={() => setShowRoleModal(false)}
            className="cursor-pointer tracking-tight"
          >
            Zavřít
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        size="sm"
      >
        <ModalHeader onClose={() => setShowQuotaModal(false)}>
          Změnit kvótu úložiště
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Paragraph size="small" color="muted" className="mb-2">
                Uživatel:{" "}
                <strong>
                  {user.name} {user.surname}
                </strong>
              </Paragraph>
              <label className="mb-2 block text-sm font-medium tracking-tight text-zinc-300">
                Kvóta (GB)
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3">
                <HardDrive className="h-4 w-4 text-zinc-400" />
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={quotaGb}
                  onChange={(event) => setQuotaGb(Number(event.target.value))}
                  className="flex-1 bg-transparent text-sm tracking-tight text-zinc-200 outline-none focus:ring-0"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 5].map((gb) => (
                  <button
                    key={gb}
                    type="button"
                    onClick={() => setQuotaGb(gb)}
                    className="cursor-pointer rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold tracking-tight text-zinc-200 hover:bg-zinc-800"
                  >
                    {gb} GB
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            href="#"
            variant="outline"
            onClick={() => setShowQuotaModal(false)}
            className={`cursor-pointer tracking-tight ${actionLoading ? "pointer-events-none opacity-50" : ""}`}
          >
            Zrušit
          </Button>
          <Button
            href="#"
            variant="primary"
            onClick={handleQuotaSave}
            className={`cursor-pointer tracking-tight ${actionLoading ? "pointer-events-none opacity-50" : ""}`}
          >
            {actionLoading ? "Ukládám..." : "Uložit"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showEditInfoModal}
        onClose={() => setShowEditInfoModal(false)}
        size="md"
      >
        <ModalHeader onClose={() => setShowEditInfoModal(false)}>
          Změnit informace o uživateli
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Paragraph size="small" color="muted" className="mb-2">
                Uživatel:{" "}
                <strong>
                  {user.name} {user.surname}
                </strong>
              </Paragraph>
            </div>
            <div className="space-y-3">
              <Input
                label="Jméno"
                type="text"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
              />
              <Input
                label="Příjmení"
                type="text"
                value={editSurname}
                onChange={(event) => setEditSurname(event.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={editEmail}
                onChange={(event) => setEditEmail(event.target.value)}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            href="#"
            variant="outline"
            onClick={() => setShowEditInfoModal(false)}
            className={`cursor-pointer tracking-tight ${actionLoading ? "pointer-events-none opacity-50" : ""}`}
          >
            Zrušit
          </Button>
          <Button
            href="#"
            variant="primary"
            onClick={handleUserInfoSave}
            className={`cursor-pointer tracking-tight ${actionLoading ? "pointer-events-none opacity-50" : ""}`}
          >
            {actionLoading ? "Ukládám..." : "Uložit"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        size="sm"
      >
        <ModalHeader onClose={() => setShowBanModal(false)}>
          {user.isBanned ? "Odzabanovat uživatele" : "Zabanovat uživatele"}
        </ModalHeader>
        <ModalBody>
          <div className="flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-yellow-400"
            />
            <div>
              <Paragraph className="mb-1 text-zinc-200">
                {user.isBanned
                  ? "Opravdu chcete odzabanovat tohoto uživatele?"
                  : "Opravdu chcete zabanovat tohoto uživatele?"}
              </Paragraph>
              <Paragraph size="small" color="muted">
                Uživatel:{" "}
                <strong>
                  {user.name} {user.surname}
                </strong>{" "}
                ({user.email})
              </Paragraph>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            href="#"
            variant="outline"
            onClick={() => setShowBanModal(false)}
            className={`cursor-pointer tracking-tight ${actionLoading ? "pointer-events-none opacity-50" : ""}`}
          >
            Zrušit
          </Button>
          <Button
            href="#"
            variant={user.isBanned ? "success" : "danger"}
            onClick={() => handleBanToggle(!user.isBanned)}
            className={`cursor-pointer tracking-tight ${actionLoading ? "pointer-events-none opacity-50" : ""}`}
          >
            {actionLoading
              ? "Zpracovávám..."
              : user.isBanned
                ? "Odzabanovat"
                : "Zabanovat"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
