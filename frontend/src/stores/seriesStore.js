import { create } from 'zustand';
import { seriesService } from '../services/seriesService';

export const useSeriesStore = create((set, get) => ({
  series: [],
  currentSeries: null,
  similarSeries: [],
  loading: false,
  error: null,
  filters: {
    genre: '',
    yearFrom: '',
    yearTo: '',
    actor: '',
  },
  searchQuery: '',
  showOngoing: false,
  sortBy: 'default',
  viewMode: 'grid',
  page: 1,
  hasMore: true,
  pageSize: 12,

  // Actions
  setFilters: (filters) => set({ filters, page: 1 }),
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setShowOngoing: (show) => set({ showOngoing: show, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy, page: 1 }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setPage: (page) => set({ page }),

  loadSeries: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const requestParams = {
        skip: (state.page - 1) * state.pageSize,
        take: state.pageSize,
        ...params,
      };

      if (state.showOngoing) {
        requestParams.isOngoing = true;
      }

      if (state.searchQuery) {
        requestParams.search = state.searchQuery;
      } else {
        if (state.filters.genre) requestParams.genre = state.filters.genre;
        if (state.filters.yearFrom) requestParams.yearFrom = parseInt(state.filters.yearFrom);
        if (state.filters.yearTo) requestParams.yearTo = parseInt(state.filters.yearTo);
        if (state.filters.actor) requestParams.actor = state.filters.actor;
      }

      if (state.sortBy !== 'default') {
        requestParams.sortBy = state.sortBy;
      }

      const data = state.showOngoing
        ? await seriesService.getOngoing(requestParams)
        : await seriesService.getAll(requestParams);
      
      const series = Array.isArray(data) ? data : data?.items || data?.data || [];

      if (state.page === 1) {
        set({ series, hasMore: series.length === state.pageSize, loading: false });
      } else {
        set((state) => ({
          series: [...state.series, ...series],
          hasMore: series.length === state.pageSize,
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loadSeriesById: async (id) => {
    set({ loading: true, error: null });
    try {
      const series = await seriesService.getById(id);
      set({ currentSeries: series, loading: false });
      return series;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loadSimilarSeries: async (seriesId, genres = []) => {
    try {
      const params = {};
      if (genres.length > 0) {
        params.genre = genres[0];
      }
      const data = await seriesService.getAll({ ...params, take: 6 });
      const series = Array.isArray(data) ? data : data?.items || data?.data || [];
      const similar = series.filter((s) => s.id !== seriesId).slice(0, 5);
      set({ similarSeries: similar });
    } catch (error) {
      console.error('Error loading similar series:', error);
    }
  },

  reset: () => set({
    series: [],
    currentSeries: null,
    similarSeries: [],
    loading: false,
    error: null,
    filters: { genre: '', yearFrom: '', yearTo: '', actor: '' },
    searchQuery: '',
    showOngoing: false,
    sortBy: 'default',
    page: 1,
    hasMore: true,
  }),
}));

