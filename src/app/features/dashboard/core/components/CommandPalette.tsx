import CommandPalette from './cmdk/CommandPalette';
import { CommandGroup, CommandItem, CommandSeparator } from './cmdk/CommandPalette';
import { Settings, FileText, Users, Home } from 'lucide-react';

/**
 * Obalová komponenta palety příkazů pro dashboard.
 * Poskytuje rozhraní palety příkazů pro rychlý přístup k různým akcím.
 * @param {Object} props - Vlastnosti komponenty.
 * @param {boolean} props.open - Určuje, zda je paleta příkazů otevřená.
 * @param {function} props.setOpen - Funkce pro nastavení stavu otevření palety příkazů.
 * @return {JSX.Element} Vykreslená komponenta `CommandPaletteWrapper`.
 */

type CommandPaletteWrapperProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function CommandPaletteWrapper({ open, setOpen }: CommandPaletteWrapperProps) {
  return (
    <CommandPalette 
      open={open} 
      setOpen={setOpen}
      apiEndpoint="/api/cmdk"
      placeholder="Zadejte příkaz nebo vyhledejte..."
    >
      {/* Sem lze doplnit statické příkazy, případně používat jen API */}
      <CommandGroup heading="Rychlé akce">
        <CommandItem onSelect={() => window.location.href = '/dashboard'}>
          <div className="flex items-center gap-3">
            <Home className="w-4 h-4" />
            <span>Hlavní stránka</span>
          </div>
        </CommandItem>
        <CommandSeparator />
        <CommandItem onSelect={() => setOpen(false)}>
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4" />
            <span>Zavřít příkazy</span>
          </div>
        </CommandItem>
      </CommandGroup>
    </CommandPalette>
  );
}
