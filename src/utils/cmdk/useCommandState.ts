import { useReducer, useCallback, useEffect } from 'react';
import { CommandState, CommandAction, CommandGroup, CommandItem } from './types';
import { filterGroups, getAllItemsFromGroups, getMaxIndex, normalizeIndex } from './filters';

const initialState: CommandState = {
  query: '',
  selectedIndex: 0,
  items: [],
  groups: [],
  filteredItems: [],
  filteredGroups: [],
  isLoading: false,
};

function commandReducer(state: CommandState, action: CommandAction): CommandState {
  switch (action.type) {
    case 'SET_QUERY': {
      const query = action.payload;
      const filteredGroups = filterGroups(state.groups, query);
      const filteredItems = getAllItemsFromGroups(filteredGroups);
      
      return {
        ...state,
        query,
        filteredGroups,
        filteredItems,
        selectedIndex: 0,
      };
    }
    
    case 'SET_SELECTED_INDEX':
      return {
        ...state,
        selectedIndex: normalizeIndex(action.payload, getMaxIndex(state.filteredGroups)),
      };
      
    case 'SET_ITEMS': {
      const items = action.payload;
      const filteredItems = getAllItemsFromGroups(state.filteredGroups);
      
      return {
        ...state,
        items,
        filteredItems,
      };
    }
    
    case 'SET_GROUPS': {
      const groups = action.payload;
      const filteredGroups = filterGroups(groups, state.query);
      const filteredItems = getAllItemsFromGroups(filteredGroups);
      
      return {
        ...state,
        groups,
        filteredGroups,
        filteredItems,
        items: getAllItemsFromGroups(groups),
        selectedIndex: 0,
      };
    }
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
      
    case 'MOVE_UP':
      return {
        ...state,
        selectedIndex: normalizeIndex(state.selectedIndex - 1, getMaxIndex(state.filteredGroups)),
      };
      
    case 'MOVE_DOWN':
      return {
        ...state,
        selectedIndex: normalizeIndex(state.selectedIndex + 1, getMaxIndex(state.filteredGroups)),
      };
      
    case 'RESET':
      return {
        ...initialState,
        groups: state.groups,
        items: state.items,
        filteredGroups: state.groups,
        filteredItems: getAllItemsFromGroups(state.groups),
      };
      
    default:
      return state;
  }
}

export function useCommandState(apiEndpoint?: string) {
  const [state, dispatch] = useReducer(commandReducer, initialState);
  
  const setQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_QUERY', payload: query });
  }, []);
  
  const setSelectedIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_SELECTED_INDEX', payload: index });
  }, []);
  
  const setItems = useCallback((items: CommandItem[]) => {
    dispatch({ type: 'SET_ITEMS', payload: items });
  }, []);
  
  const setGroups = useCallback((groups: CommandGroup[]) => {
    dispatch({ type: 'SET_GROUPS', payload: groups });
  }, []);
  
  const moveUp = useCallback(() => {
    dispatch({ type: 'MOVE_UP' });
  }, []);
  
  const moveDown = useCallback(() => {
    dispatch({ type: 'MOVE_DOWN' });
  }, []);
  
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);
  
  // Načtení dat z API, pokud je poskytnut koncový bod
  useEffect(() => {
    if (!apiEndpoint) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    fetch(apiEndpoint)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        return res.json();
      })
      .then(data => {
        if (data.commands && Array.isArray(data.commands)) {
          setGroups(data.commands);
        }
      })
      .catch(error => {
        console.error('Failed to load commands from API:', error);
      })
      .finally(() => {
        dispatch({ type: 'SET_LOADING', payload: false });
      });
  }, [apiEndpoint, setGroups]);
  
  return {
    state,
    actions: {
      setQuery,
      setSelectedIndex,
      setItems,
      setGroups,
      moveUp,
      moveDown,
      reset,
    },
  };
}
