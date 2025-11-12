import { create } from 'zustand';
import { actorsService } from '../services/actorsService';

export const useActorsStore = create((set, get) => ({
  actors: [],
  currentActor: null,
  loading: false,
  error: null,
  searchQuery: '',
  sortBy: 'name',
  sortOrder: 'asc',
  viewMode: 'grid',
  page: 1,
  pageSize: 60,
  totalActors: 0,

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy, page: 1 }),
  setSortOrder: (order) => set({ sortOrder: order, page: 1 }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setPage: (page) => set({ page }),

  loadActors: async () => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const result = await actorsService.getAll({
        page: state.page,
        pageSize: state.pageSize,
        search: state.searchQuery,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      });

      set({
        actors: result.items,
        totalActors: result.total,
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loadActor: async (id) => {
    set({ loading: true, error: null });
    try {
      const actor = await actorsService.getById(id);
      set({ currentActor: actor, loading: false });
      return actor;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  reset: () => set({
    actors: [],
    currentActor: null,
    loading: false,
    error: null,
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    totalActors: 0,
  }),
}));

