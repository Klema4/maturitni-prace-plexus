import React from 'react';
import { Shield, User, Edit, FileCheck, Pencil, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Mapování názvů rolí na ikony
 */
const roleIcons: Record<string, React.ElementType> = {
  "Superadministrátor": Shield,
  "Administrátor": Shield,
  "Editor": Edit,
  "Korektor": FileCheck,
  "Redaktor": Pencil,
  "Spisovatel": Pencil,
  "Moderátor": MessageSquare,
  "Uživatel": User,
};

export interface Role {
  id: string;
  name: string;
  color: string;
}

export interface RoleBadgeProps {
  role: Role;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'icon' | 'full';
  showIcon?: boolean;
  className?: string;
}

/**
 * Badge pro zobrazení role.
 * @param {RoleBadgeProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element | null} RoleBadge.
 */
export function RoleBadge({ 
  role, 
  size = 'md', 
  variant = 'badge',
  showIcon = true,
  className 
}: RoleBadgeProps) {
  const Icon = roleIcons[role.name] || Shield;
  
  const sizeClasses = {
    sm: {
      icon: 'size-2',
      container: 'size-6',
      text: 'text-xs font-medium tracking-tight',
      padding: 'px-1.5 py-1.5',
    },
    md: {
      icon: 'size-3',
      container: 'size-8',
      text: 'text-sm font-medium tracking-tight',
      padding: 'px-2 py-1',
    },
    lg: {
      icon: 'size-4',
      container: 'size-10',
      text: 'text-base font-medium tracking-tight',
      padding: 'px-2.5 py-1',
    },
  };

  const currentSize = sizeClasses[size];

  // Varianta: badge (pouze text s pozadím)
  if (variant === 'badge') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-md',
          currentSize.text,
          currentSize.padding,
          'font-medium tracking-tight text-zinc-200',
          className
        )}
        style={{ backgroundColor: `${role.color}50` }}
      >
        {showIcon && <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />}
        {role.name}
      </span>
    );
  }

  // Varianta: icon (ikonka s pozadím)
  if (variant === 'icon') {
    if (!showIcon) {
      return null;
    }

    return (
      <div
        className={clsx(
          'rounded-md flex items-center justify-center shrink-0',
          currentSize.container,
          className
        )}
        style={{ backgroundColor: `${role.color}10`, color: role.color }}
      >
        <Icon size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />
      </div>
    );
  }

  // Varianta: full (ikonka + text)
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {showIcon ? (
        <div
          className={clsx(
            'rounded-md flex items-center justify-center shrink-0',
            currentSize.container
          )}
          style={{ backgroundColor: `${role.color}10`, color: role.color }}
        >
          <Icon size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />
        </div>
      ) : null}
      <span className={clsx('font-medium tracking-tight text-zinc-200', currentSize.text)}>
        {role.name}
      </span>
    </div>
  );
}
