'use client'

import { CommandItem } from './CommandItem';
import { CommandGroup as CommandGroupType } from '@/utils/cmdk/types';

interface CommandGroupProps {
  group?: CommandGroupType;
  heading?: string;
  children?: React.ReactNode;
  className?: string;
}

export function CommandGroup({ 
  group, 
  heading, 
  children, 
  className = "" 
}: CommandGroupProps) {
  const groupHeading = heading || group?.heading;
  const groupItems = group?.items || [];
  
  return (
    <div className={`${className}`}>
      {groupHeading && (
        <div className="px-4 py-2 text-xs font-medium text-zinc-600 uppercase tracking-wide">
          {groupHeading}
        </div>
      )}
      <div>
        {/* Render items from group prop (API data) */}
        {groupItems.map((item) => (
          <CommandItem key={item.id} item={item} />
        ))}
        
        {/* Render children (JSX components) */}
        {children}
      </div>
    </div>
  );
}
