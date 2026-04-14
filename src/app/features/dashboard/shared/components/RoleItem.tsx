import React from 'react';
import { RoleBadge, type Role } from './RoleBadge';
import Button from '@/components/ui/dashboard/Button';
import { Trash2, Minus, Plus } from 'lucide-react';

export interface RoleItemProps {
  role: Role;
  hasRole?: boolean;
  onToggle?: (roleId: string, add: boolean) => void;
  onRemove?: (roleId: string) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'toggle' | 'remove';
}

/**
 * Řádek s rolí a akcí (toggle/remove).
 * @param {RoleItemProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} RoleItem.
 */
export function RoleItem({
  role,
  hasRole = false,
  onToggle,
  onRemove,
  disabled = false,
  className,
  variant = 'toggle'
}: RoleItemProps) {
  return (
    <div className={`flex items-center justify-between p-2 bg-zinc-800/25 border border-zinc-800/50 rounded-lg ${className || ''}`}>
      <RoleBadge 
        role={role} 
        size="md" 
        variant="badge"
        className="text-zinc-200" 
      />
      {variant === 'remove' && onRemove ? (
        <button
          onClick={() => onRemove(role.id)}
          disabled={disabled}
          className="size-8 flex items-center justify-center hover:bg-zinc-800/75 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Trash2 size={16} className="text-zinc-200" />
        </button>
      ) : (
        onToggle && (
          <Button
            href="#"
            variant={hasRole ? "secondary" : "secondary"}
            onClick={() => onToggle(role.id, !hasRole)}
            className={`size-8 tracking-tight cursor-pointer p-1 rounded-lg${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {hasRole ? <Minus size={16} className="text-zinc-200" /> : <Plus size={16} className="text-zinc-200" />}
          </Button>
        )
      )}
    </div>
  );
}
