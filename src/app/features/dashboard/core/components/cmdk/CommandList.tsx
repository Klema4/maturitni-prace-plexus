'use client'

import React from 'react';
import { useCommand } from './CommandProvider';
import { CommandEmpty } from './CommandEmpty';
import { CommandGroup } from './CommandGroup';

interface CommandListProps {
  children?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function CommandList({ 
  children, 
  emptyMessage = "Žádné výsledky nenalezeny.",
  className = "" 
}: CommandListProps) {
  const { state } = useCommand();
  
  const hasResults = state.filteredGroups.length > 0 || React.Children.count(children) > 0;
  
  return (
    <div className={`p-1 max-h-[400px] overflow-y-auto ${className}`}>
      {!hasResults && !state.isLoading ? (
        <CommandEmpty message={emptyMessage} />
      ) : (
        <div className="py-2">
          {/* Render groups from state (API data) */}
          {state.filteredGroups.map((group) => (
            <CommandGroup key={group.id} group={group} />
          ))}
          
          {/* Render children (JSX components) */}
          {children}
        </div>
      )}
    </div>
  );
}
