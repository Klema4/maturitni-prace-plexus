'use client'

import { useMemo } from "react";
import Avatar from "@/components/ui/dashboard/Avatar";
import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/dashboard/Modal";
import Button from "@/components/ui/dashboard/Button";
import { Users, Plus, Edit, Save } from "lucide-react";
import { RoleBadge, type Role as RoleBadgeRole } from "@/app/features/dashboard/shared/components/RoleBadge";
import { RoleItem } from "@/app/features/dashboard/shared/components/RoleItem";
import { useRedactionPage } from "./hooks/useRedactionPage";

/**
 * Vrátí nejvyšší váhu role člena.
 * @param member - Člen redakce.
 * @param roleWeightById - Mapa `roleId -> weight`.
 * @return Váha role (vyšší = vyšší priorita).
 */
function getMemberWeight(member: { roles: Array<{ id: string }> }, roleWeightById: Record<string, number>) {
  let max = 0;
  for (const role of member.roles) {
    const weight = roleWeightById[role.id] ?? 0;
    if (weight > max) max = weight;
  }
  return max;
}

export default function Redaction() {
  const {
    members,
    allUsers,
    roles,
    loading,
    error,
    isAddModalOpen,
    isEditModalOpen,
    editingMember,
    formData,
    updateFormField,
    closeAddModal,
    closeEditModal,
    handleOpenAddModal,
    handleOpenEditModal,
    handleAddRole,
    handleRemoveRole,
    handleAddRoleToEditingMember,
  } = useRedactionPage();

  const roleWeightById = useMemo(() => {
    const map: Record<string, number> = {};
    for (const role of roles) {
      map[role.id] = typeof role.weight === "number" ? role.weight : 0;
    }
    return map;
  }, [roles]);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const weightDiff = getMemberWeight(b, roleWeightById) - getMemberWeight(a, roleWeightById);
      if (weightDiff !== 0) {
        return weightDiff;
      }

      const aName = `${a.surname} ${a.name}`.trim();
      const bName = `${b.surname} ${b.name}`.trim();
      return aName.localeCompare(bName, "cs", { sensitivity: "base" });
    });
  }, [members, roleWeightById]);

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Redakce</Heading>
          <Paragraph>Spravuj členy redakce magazínu.</Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám členy redakce...</Paragraph>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Redakce</Heading>
          <Paragraph>Spravuj členy redakce magazínu.</Paragraph>
        </header>
        <div className="mt-4">
          <Paragraph color="muted" className="text-red-400">{error}</Paragraph>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <Heading variant="h1">Redakce</Heading>
        <Paragraph>Spravuj členy redakce magazínu.</Paragraph>
      </header>
      <QuickOptions options={[
        { label: "Přidat člena", variant: "primary", icon: Plus, onClick: handleOpenAddModal },
      ]} />
      <section className="mt-4">
        <div className="grid grid-cols-1 gap-1">
          {sortedMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-2 not-last:border-b border-zinc-700/50 pb-3 pt-2 px-1"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={member.image || undefined}
                    alt={`${member.name} ${member.surname}`}
                    size="xs"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:gap-3 min-w-0">
                      <Heading variant="h6" className="leading-4! truncate">
                        {member.name} {member.surname}
                      </Heading>
                      <Paragraph size="extrasmall" className="truncate">
                        {member.email}
                      </Paragraph>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {member.primaryRole && (
                        <Paragraph size="extrasmall" color="muted">
                          {member.primaryRole.name}
                        </Paragraph>
                      )}
                      <span className="text-xs text-zinc-500">
                        Články:{" "}
                        <span className="text-white font-semibold">
                          {member.articlesCount}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors shrink-0"
                  onClick={() => handleOpenEditModal(member)}
                  aria-label={`Upravit role - ${member.name} ${member.surname}`}
                >
                  <Edit size={16} className="text-zinc-400" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-zinc-400 flex-wrap pl-9">
                <div className="flex gap-2 flex-wrap">
                  {member.roles.map((role) => (
                    <RoleBadge
                      key={role.id}
                      role={role as RoleBadgeRole}
                      size="sm"
                      variant="badge"
                      showIcon={false}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal pro přidání člena */}
      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} size="md">
        <ModalHeader onClose={closeAddModal}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Přidat člena redakce</span>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium tracking-tight text-white mb-1.5">
              Uživatel
            </label>
            <select
              value={formData.userId}
              onChange={(e) => updateFormField("userId", e.target.value)}
              className="w-full bg-zinc-800/75 border border-zinc-700/50 rounded-md text-white text-sm tracking-tight font-medium focus:outline-none focus:ring-2 focus:ring-white/75 transition-all px-3 py-2.5"
              required
            >
              <option value="">Vyber uživatele...</option>
              {allUsers
                .filter(user => !members.find(m => m.id === user.id))
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.surname} ({user.email})
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium tracking-tight text-white mb-1.5">
              Role
            </label>
            <select
              value={formData.roleId}
              onChange={(e) => updateFormField("roleId", e.target.value)}
              className="w-full bg-zinc-800/75 border border-zinc-700/50 rounded-md text-white text-sm tracking-tight font-medium focus:outline-none focus:ring-2 focus:ring-white/75 transition-all px-3 py-2.5"
              required
            >
              <option value="">Vyber roli...</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-end gap-2">
            <Button href="#" variant="outline" onClick={closeAddModal}>
              Zrušit
            </Button>
            <Button href="#" variant="primary" onClick={handleAddRole} UseIcon={Save}>
              Přidat
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Modal pro úpravu rolí člena */}
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} size="md">
        <ModalHeader onClose={closeEditModal}>
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-400" />
            <span>Upravit role - {editingMember?.name} {editingMember?.surname}</span>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium tracking-tight text-white mb-2">
              Aktuální role
            </label>
            <div className="space-y-2">
              {editingMember?.roles.map((role) => (
                <RoleItem
                  key={role.id}
                  role={role as RoleBadgeRole}
                  variant="remove"
                  onRemove={(roleId) => editingMember && handleRemoveRole(editingMember.id, roleId)}
                />
              ))}
              {editingMember?.roles.length === 0 && (
                <Paragraph size="small" color="muted">Žádné role</Paragraph>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium tracking-tight text-white mb-1.5">
              Přidat roli
            </label>
            <select
              value={formData.roleId}
              onChange={(e) => updateFormField("roleId", e.target.value)}
              className="w-full bg-zinc-800/75 border border-zinc-700/50 rounded-md text-white text-sm tracking-tight font-medium focus:outline-none focus:ring-2 focus:ring-white/75 transition-all px-3 py-2.5"
            >
              <option value="">Vyber roli...</option>
              {roles
                .filter(role => !editingMember?.roles.find(r => r.id === role.id))
                .map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
            </select>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-end gap-2">
            <Button href="#" variant="outline" onClick={closeEditModal}>
              Zavřít
            </Button>
            {formData.roleId && editingMember && (
              <Button 
                href="#" 
                variant="primary" 
                onClick={handleAddRoleToEditingMember}
                UseIcon={Save}
              >
                Přidat roli
              </Button>
            )}
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
}



