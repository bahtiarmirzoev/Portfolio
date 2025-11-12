import { create } from 'zustand';
import { favoritesService } from '../services/favoritesService';

export const useFavoritesStore = create((set, get) => ({
  movieFavorites: [],
  seriesFavorites: [],
  loading: false,
  error: null,
  activeTab: 'all', // 'all', 'movies', 'series'

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  loadFavorites: async (tab = null) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const activeTab = tab || state.activeTab;

      if (activeTab === 'all' || activeTab === 'movies') {
        const movies = await favoritesService.getFavorites(1, 100);
        set({ movieFavorites: Array.isArray(movies) ? movies : [] });
      }

      if (activeTab === 'all' || activeTab === 'series') {
        const series = await favoritesService.getFavoriteSeries(1, 100);
        set({ seriesFavorites: Array.isArray(series) ? series : [] });
      }

      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  addMovieToFavorites: async (movieId) => {
    try {
      await favoritesService.addToFavorites(movieId);
      set((state) => ({
        movieFavorites: [...state.movieFavorites, movieId],
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  removeMovieFromFavorites: async (movieId) => {
    try {
      await favoritesService.removeFromFavorites(movieId);
      set((state) => ({
        movieFavorites: state.movieFavorites.filter((id) => id !== movieId),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  addSeriesToFavorites: async (seriesId) => {
    try {
      await favoritesService.addSeriesToFavorites(seriesId);
      set((state) => ({
        seriesFavorites: [...state.seriesFavorites, seriesId],
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  removeSeriesFromFavorites: async (seriesId) => {
    try {
      await favoritesService.removeSeriesFromFavorites(seriesId);
      set((state) => ({
        seriesFavorites: state.seriesFavorites.filter((id) => id !== seriesId),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  isMovieFavorite: (movieId) => {
    const state = get();
    return state.movieFavorites.some((id) => id === movieId || id.toString() === movieId.toString());
  },

  isSeriesFavorite: (seriesId) => {
    const state = get();
    return state.seriesFavorites.some((id) => id === seriesId || id.toString() === seriesId.toString());
  },

  reset: () => set({
    movieFavorites: [],
    seriesFavorites: [],
    loading: false,
    error: null,
    activeTab: 'all',
  }),
}));

