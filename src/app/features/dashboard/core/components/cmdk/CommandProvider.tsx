'use client'

import React, { createContext, useContext, useEffect } from 'react';
import { useCommandState } from '@/utils/cmdk/useCommandState';
import { CommandState, CommandItem, CommandGroup } from '@/utils/cmdk/types';
import { findItemByIndex, getAllItemsFromGroups } from '@/utils/cmdk/filters';
import { registerGlobalShortcuts } from '@/utils/cmdk/shortcuts';
import { commandActions, registerDefaultActions } from '@/utils/cmdk/actions';

interface CommandContextType {
  state: CommandState;
  actions: {
    setQuery: (query: string) => void;
    setSelectedIndex: (index: number) => void;
    setItems: (items: CommandItem[]) => void;
    setGroups: (groups: CommandGroup[]) => void;
    moveUp: () => void;
    moveDown: () => void;
    reset: () => void;
  };
  executeSelected: () => void;
  onClose?: () => void;
}

const CommandContext = createContext<CommandContextType | null>(null);

interface CommandProviderProps {
  children: React.ReactNode;
  apiEndpoint?: string;
  onClose?: () => void;
}

export function CommandProvider({ children, apiEndpoint, onClose }: CommandProviderProps) {
  const { state, actions } = useCommandState(apiEndpoint);
  
  // Registrace výchozích akcí při mountu
  useEffect(() => {
    registerDefaultActions();
  }, []);
  
  const executeItem = (item: CommandItem) => {
    if (item.disabled) return;
    
    if (item.action) {
      item.action();
    } else if (item.value && commandActions.execute(item.value)) {
    } else if (item.href) {
    }
    onClose?.();
  };
  
  const executeSelected = () => {
    const selectedItem = findItemByIndex(state.filteredGroups, state.selectedIndex);
    if (selectedItem) {
      executeItem(selectedItem);
    }
  };
  
  // Registrace globálních zkratek pro všechny položky
  useEffect(() => {
    const allItems = getAllItemsFromGroups(state.groups);
    const itemsWithShortcuts = allItems.filter(item => item.shortcut && item.shortcut.length > 0);
    
    if (itemsWithShortcuts.length === 0) return;
    
    const unregister = registerGlobalShortcuts(itemsWithShortcuts, executeItem);
    return unregister;
  }, [state.groups]);
  
  // Zpracování klávesnicové navigace v command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Zpracovat tyto klávesy pouze když je command palette otevřená
      if (!document.querySelector('[data-command-palette-open]')) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          actions.moveUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          actions.moveDown();
          break;
        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          executeSelected();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, {
      capture: true,
      passive: false
    });
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, {
        capture: true
      } as any);
    };
  }, [actions, executeSelected]);
  
  const contextValue = {
    state,
    actions,
    executeSelected,
    onClose,
  };
  
  return (
    <CommandContext.Provider value={contextValue}>
      <div className='w-full sm:w-auto' data-command-palette-open>
        {children}
      </div>
    </CommandContext.Provider>
  );
}

export function useCommand() {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error('useCommand must be used within a CommandProvider');
  }
  return context;
}
