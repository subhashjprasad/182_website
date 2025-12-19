/**
 * Zustand store for UI state (filters, sort, etc.)
 */
import { create } from 'zustand';
import type { FilterState } from '../lib/types';
import type { SortOption } from '../lib/filterPosts';

interface UIStore {
  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  sortBy: SortOption;
  setSortBy: (sortBy: SortOption) => void;

  // Filter panel visibility (mobile)
  isFilterPanelOpen: boolean;
  toggleFilterPanel: () => void;
  closeFilterPanel: () => void;
}

const defaultFilters: FilterState = {
  llms: [],
  llmVariants: [],
  assistants: [],
  taskTypes: [],
  homeworks: [],
  minHighlightScore: 0,
  minCodeQuality: 0,
  minSuccessRate: 0,
};

export const useUIStore = create<UIStore>((set) => ({
  // Search & Filters
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  filters: defaultFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: defaultFilters }),

  sortBy: 'relevance',
  setSortBy: (sortBy) => set({ sortBy }),

  // Filter panel
  isFilterPanelOpen: false,
  toggleFilterPanel: () =>
    set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),
  closeFilterPanel: () => set({ isFilterPanelOpen: false }),
}));
