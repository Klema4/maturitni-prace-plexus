export interface CommandItem {
  id: string;
  label: string;
  value?: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  action?: () => void;
  href?: string;
  disabled?: boolean;
  group?: string;
}

export interface CommandGroup {
  id: string;
  heading: string;
  items: CommandItem[];
}

export interface CommandState {
  query: string;
  selectedIndex: number;
  items: CommandItem[];
  groups: CommandGroup[];
  filteredItems: CommandItem[];
  filteredGroups: CommandGroup[];
  isLoading: boolean;
}

export interface CommandAPI {
  commands: CommandGroup[];
}

export type CommandAction = 
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_SELECTED_INDEX'; payload: number }
  | { type: 'SET_ITEMS'; payload: CommandItem[] }
  | { type: 'SET_GROUPS'; payload: CommandGroup[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'MOVE_UP' }
  | { type: 'MOVE_DOWN' }
  | { type: 'RESET' };
