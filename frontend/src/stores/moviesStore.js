import { create } from 'zustand';
import { moviesService } from '../services/moviesService';

export const useMoviesStore = create((set, get) => ({
  movies: [],
  currentMovie: null,
  similarMovies: [],
  loading: false,
  error: null,
  filters: {
    genre: '',
    yearFrom: '',
    yearTo: '',
    actor: '',
  },
  searchQuery: '',
  sortBy: 'default',
  viewMode: 'grid',
  page: 1,
  hasMore: true,
  pageSize: 12,

  // Actions
  setFilters: (filters) => set({ filters, page: 1 }),
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy, page: 1 }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setPage: (page) => set({ page }),

  loadMovies: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const requestParams = {
        skip: (state.page - 1) * state.pageSize,
        take: state.pageSize,
        ...params,
      };

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

      const data = await moviesService.getAll(requestParams);
      const movies = Array.isArray(data) ? data : data?.items || data?.data || [];

      if (state.page === 1) {
        set({ movies, hasMore: movies.length === state.pageSize, loading: false });
      } else {
        set((state) => ({
          movies: [...state.movies, ...movies],
          hasMore: movies.length === state.pageSize,
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loadMovie: async (id) => {
    set({ loading: true, error: null });
    try {
      const movie = await moviesService.getById(id);
      set({ currentMovie: movie, loading: false });
      return movie;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loadSimilarMovies: async (movieId, genres = []) => {
    try {
      const params = {};
      if (genres.length > 0) {
        params.genre = genres[0];
      }
      const data = await moviesService.getAll({ ...params, take: 6 });
      const movies = Array.isArray(data) ? data : data?.items || data?.data || [];
      const similar = movies.filter((m) => m.id !== movieId).slice(0, 5);
      set({ similarMovies: similar });
    } catch (error) {
      console.error('Error loading similar movies:', error);
    }
  },

  reset: () => set({
    movies: [],
    currentMovie: null,
    similarMovies: [],
    loading: false,
    error: null,
    filters: { genre: '', yearFrom: '', yearTo: '', actor: '' },
    searchQuery: '',
    sortBy: 'default',
    page: 1,
    hasMore: true,
  }),
}));

