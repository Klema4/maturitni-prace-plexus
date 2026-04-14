import { CommandItem, CommandGroup } from './types';

export function filterItems(items: CommandItem[], query: string): CommandItem[] {
  if (!query.trim()) return items;
  
  const searchTerm = query.toLowerCase().trim();
  
  return items.filter(item => {
    const labelMatch = item.label.toLowerCase().includes(searchTerm);
    const valueMatch = item.value?.toLowerCase().includes(searchTerm);
    const descriptionMatch = item.description?.toLowerCase().includes(searchTerm);
    
    return labelMatch || valueMatch || descriptionMatch;
  });
}

export function filterGroups(groups: CommandGroup[], query: string): CommandGroup[] {
  if (!query.trim()) return groups;
  
  return groups
    .map(group => ({
      ...group,
      items: filterItems(group.items, query)
    }))
    .filter(group => group.items.length > 0);
}

export function getAllItemsFromGroups(groups: CommandGroup[]): CommandItem[] {
  return groups.flatMap(group => group.items);
}

export function findItemByIndex(groups: CommandGroup[], index: number): CommandItem | null {
  const allItems = getAllItemsFromGroups(groups);
  return allItems[index] || null;
}

export function getMaxIndex(groups: CommandGroup[]): number {
  const allItems = getAllItemsFromGroups(groups);
  return Math.max(0, allItems.length - 1);
}

export function normalizeIndex(index: number, maxIndex: number): number {
  if (index < 0) return maxIndex;
  if (index > maxIndex) return 0;
  return index;
}
