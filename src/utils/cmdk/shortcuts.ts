import { CommandItem } from './types';

export function parseShortcut(shortcut: string[]): { 
  key: string; 
  ctrlKey: boolean; 
  metaKey: boolean; 
  altKey: boolean; 
  shiftKey: boolean; 
} {
  const result = {
    key: '',
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
  };

  shortcut.forEach(part => {
    const normalized = part.toLowerCase();
    
    if (normalized === '⌘' || normalized === 'cmd' || normalized === 'meta') {
      result.metaKey = true;
    } else if (normalized === 'ctrl' || normalized === '^') {
      result.ctrlKey = true;
    } else if (normalized === 'alt' || normalized === '⌥') {
      result.altKey = true;
    } else if (normalized === 'shift' || normalized === '⇧') {
      result.shiftKey = true;
    } else {
      result.key = part.toLowerCase();
    }
  });

  return result;
}

export function matchesShortcut(
  event: KeyboardEvent, 
  shortcut: string[]
): boolean {
  const parsed = parseShortcut(shortcut);
  
  return (
    event.key.toLowerCase() === parsed.key &&
    event.ctrlKey === parsed.ctrlKey &&
    event.metaKey === parsed.metaKey &&
    event.altKey === parsed.altKey &&
    event.shiftKey === parsed.shiftKey
  );
}

export function registerGlobalShortcuts(
  items: CommandItem[],
  onExecute: (item: CommandItem) => void
): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Přeskočit, pokud uživatel píše do input/textarea/contenteditable
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    // Nejdříve zkontrolovat shody, pak zabránit výchozímu chování
    for (const item of items) {
      if (item.shortcut && matchesShortcut(event, item.shortcut)) {
        // Okamžitě zabránit výchozímu chování prohlížeče
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        // Vykonat naši akci
        onExecute(item);
        return; // Důležité: okamžitě ukončit po shodě
      }
    }
  };

  // Použití capture fáze a vyšší priority
  document.addEventListener('keydown', handleKeyDown, {
    capture: true,
    passive: false
  });
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown, {
      capture: true
    } as any);
  };
}
