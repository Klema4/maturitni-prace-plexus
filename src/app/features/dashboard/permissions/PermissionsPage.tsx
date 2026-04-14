'use client'

import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/dashboard/Modal";
import Button from "@/components/ui/dashboard/Button";
import { Input } from "@/components/ui/dashboard/Inputs";
import { Shield, Edit, Plus, Trash2, Save, GripVertical } from "lucide-react";
import { RoleBadge, type Role as RoleBadgeRole } from "@/app/features/dashboard/shared/components/RoleBadge";
import { PermissionSection } from "@/app/features/dashboard/permissions/components/PermissionSection";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {
  PermissionRole as Role,
} from "./types";
import { usePermissionsPage } from "./hooks/usePermissionsPage";

/**
 * Kompaktní řádek role s přetahováním (dnd-kit).
 * Zachovává možnost přetahovat, upravit a smazat roli.
 * @param role - Role.
 * @param onEdit - Callback pro editaci role.
 * @param onDelete - Callback pro smazání role.
 * @return JSX element.
 */
function SortableRoleRow({
  role,
  onEdit,
  onDelete,
}: {
  role: Role;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: role.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center justify-between gap-3 not-last:border-b border-zinc-700/50 py-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-800 rounded transition-colors shrink-0"
            aria-label={`Změnit pořadí role ${role.name}`}
          >
            <GripVertical size={18} className="text-zinc-500" />
          </button>

          <RoleBadge role={role as RoleBadgeRole} size="sm" variant="icon" />

          <div className="min-w-0">
            <Heading variant="h6" className="leading-4! truncate">
              {role.name}
            </Heading>
            <Paragraph size="extrasmall" color="muted">
              Uživatelé s rolí:{" "}
              <span className="text-white font-semibold">{role.userCount}</span>
            </Paragraph>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
            onClick={onEdit}
            aria-label={`Upravit roli ${role.name}`}
          >
            <Edit size={16} className="text-zinc-400" />
          </button>
          <button
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
            onClick={onDelete}
            aria-label={`Smazat roli ${role.name}`}
          >
            <Trash2 size={16} className="text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Permissions() {
  const {
    roles,
    loading,
    error,
    isRoleModalOpen,
    editingRole,
    roleFormData,
    rolePermissions,
    sensors,
    setRolePermissions,
    updateRoleFormField,
    closeRoleModal,
    handleOpenRoleModal,
    handleDragEnd,
    handleSaveRole,
    handleDeleteRole,
  } = usePermissionsPage();

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Oprávnění a role</Heading>
          <Paragraph>Nastav role a oprávnění uživatelů.</Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám role...</Paragraph>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Oprávnění a role</Heading>
          <Paragraph>Nastav role a oprávnění uživatelů.</Paragraph>
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
        <Heading variant="h1">Oprávnění a role</Heading>
        <Paragraph>Nastav role a oprávnění uživatelů.</Paragraph>
      </header>
      <QuickOptions options={[
        { label: "Nová role", variant: "primary", icon: Plus, onClick: () => handleOpenRoleModal() },
      ]} />
      <section className="mt-4">
        <Heading variant="h3" className="mb-4">Dostupné role</Heading>
        <Paragraph size="small" color="muted" className="mb-4">
          Přetáhni role pro změnu pořadí (řazení podle váhy)
        </Paragraph>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={roles.map(r => r.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 gap-1">
              {roles.map((role) => (
                <SortableRoleRow
                  key={role.id}
                  role={role}
                  onEdit={() => handleOpenRoleModal(role)}
                  onDelete={() => handleDeleteRole(role.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* Modal pro vytvoření/úpravu role */}
      <Modal isOpen={isRoleModalOpen} onClose={closeRoleModal} size="lg">
        <ModalHeader onClose={closeRoleModal}>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span>{editingRole ? `Upravit roli - ${editingRole.name}` : 'Nová role'}</span>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Název role"
              value={roleFormData.name}
              onChange={(e) => updateRoleFormField("name", e.target.value)}
              placeholder="Zadej název..."
              maxLength={64}
              required
            />
            <div>
              <label className="block text-sm font-medium tracking-tight text-white mb-1.5">
                Barva
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={roleFormData.color}
                  onChange={(e) => updateRoleFormField("color", e.target.value)}
                  className="w-16 h-10 rounded border border-zinc-700 cursor-pointer"
                />
                <Input
                  value={roleFormData.color}
                  onChange={(e) => updateRoleFormField("color", e.target.value)}
                  placeholder="#FFFFFF"
                  maxLength={7}
                  className="flex-1"
                />
              </div>
            </div>
            <Input
              label="Váha (řazení)"
              type="number"
              value={roleFormData.weight}
              onChange={(e) =>
                updateRoleFormField("weight", parseInt(e.target.value) || 0)
              }
              placeholder="0"
            />
          </div>
          
          <div className="border-t border-zinc-800 pt-6">
            <h3 className="text-sm font-semibold tracking-tight text-white mb-4">Oprávnění</h3>
            <PermissionSection
              permissions={rolePermissions}
              onPermissionsChange={setRolePermissions}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-end gap-2">
            <Button href="#" variant="outline" onClick={closeRoleModal}>
              Zrušit
            </Button>
            <Button href="#" variant="primary" onClick={handleSaveRole} UseIcon={Save}>
              Uložit
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
}
