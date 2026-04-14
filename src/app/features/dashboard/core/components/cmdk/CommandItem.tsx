'use client'

import { useCommand } from './CommandProvider';
import { CommandItem as CommandItemType } from '@/utils/cmdk/types';
import { getAllItemsFromGroups } from '@/utils/cmdk/filters';

interface CommandItemProps {
  item?: CommandItemType;
  children?: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
}

export function CommandItem({ 
  item, 
  children, 
  onSelect, 
  disabled = false, 
  className = "" 
}: CommandItemProps) {
  const { state, executeSelected } = useCommand();
  
  // Výpočet indexu pro tuto položku
  const allItems = getAllItemsFromGroups(state.filteredGroups);
  const itemIndex = item ? allItems.findIndex(i => i.id === item.id) : -1;
  const isSelected = itemIndex === state.selectedIndex && itemIndex !== -1;
  const isDisabled = disabled || item?.disabled;
  
  const handleClick = () => {
    if (isDisabled) return;
    
    if (onSelect) {
      onSelect();
    } else if (item?.action) {
      item.action();
    } else if (item?.href) {
      window.location.href = item.href;
    }
  };
  
  const renderShortcut = (shortcut: string[]) => (
    <div className="flex items-center gap-1">
      {shortcut.map((key, idx) => {
        // Převést klávesy na čitelnější formát
        let displayKey = key;
        if (key.toLowerCase() === 'ctrl') displayKey = 'Ctrl';
        if (key.toLowerCase() === 'shift') displayKey = 'Shift';
        if (key.toLowerCase() === 'alt') displayKey = 'Alt';
        if (key.toLowerCase() === 'meta' || key === '⌘') displayKey = '⌘';
        
        return (
          <kbd
            key={`shortcut-${idx}-${displayKey}`}
            className="px-1.5 py-0.5 text-xs font-medium text-zinc-200 bg-zinc-800 border-b-2 border-zinc-700 rounded-[3px]"
          >
            {displayKey}
          </kbd>
        );
      })}
    </div>
  );
  
  return (
    <div
      role="button"
      tabIndex={0}
      className={`
        rounded-lg px-4 py-2 flex items-center justify-between cursor-pointer transition-colors my-0.5
        ${isSelected ? 'bg-zinc-800/50 hover:bg-zinc-800/75' : 'hover:bg-zinc-800/75'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {item?.icon && (
          <div className="w-4 h-4 text-zinc-600 shrink-0">
            {item.icon}
          </div>
        )}
        
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold -tracking-[0.01em] text-zinc-200 truncate">
            {item?.label || children}
          </div>
          {item?.description && (
            <div className="text-xs -tracking-[0.01em] font-medium text-zinc-500 truncate">
              {item.description}
            </div>
          )}
        </div>
      </div>
      
      {item?.shortcut && renderShortcut(item.shortcut)}
    </div>
  );
}
