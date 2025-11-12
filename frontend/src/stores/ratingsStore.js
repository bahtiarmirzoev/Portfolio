import { create } from 'zustand';
import { ratingsService } from '../services/ratingsService';
import { seriesRatingsService } from '../services/seriesRatingsService';

export const useRatingsStore = create((set, get) => ({
  movieRatings: {}, // { movieId: rating }
  seriesRatings: {}, // { seriesId: rating }
  userRatings: [], // Все рейтинги пользователя
  loading: false,
  error: null,
  activeTab: 'all', // 'all', 'movies', 'series'

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  loadMovieRating: async (movieId) => {
    try {
      const rating = await ratingsService.getMyRating(movieId);
      const ratingValue = rating?.value ?? rating?.MyRating ?? rating?.myRating;
      if (ratingValue) {
        set((state) => ({
          movieRatings: { ...state.movieRatings, [movieId]: ratingValue },
        }));
      }
      return ratingValue;
    } catch (error) {
      // Игнорируем ошибку, если нет рейтинга
      return null;
    }
  },

  loadSeriesRating: async (seriesId) => {
    try {
      const rating = await seriesRatingsService.getMyRating(seriesId);
      const ratingValue = rating?.value ?? rating?.myRating;
      if (ratingValue) {
        set((state) => ({
          seriesRatings: { ...state.seriesRatings, [seriesId]: ratingValue },
        }));
      }
      return ratingValue;
    } catch (error) {
      return null;
    }
  },

  loadUserRatings: async () => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const activeTab = state.activeTab;

      if (activeTab === 'all' || activeTab === 'movies') {
        const movieRatings = await ratingsService.getMyRatings();
        const ratings = Array.isArray(movieRatings) ? movieRatings : [];
        set((state) => ({ userRatings: [...ratings] }));
      }

      if (activeTab === 'all' || activeTab === 'series') {
        const seriesRatings = await seriesRatingsService.getMyRatings();
        const ratings = Array.isArray(seriesRatings) ? seriesRatings : [];
        set((state) => ({ userRatings: [...state.userRatings, ...ratings] }));
      }

      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  rateMovie: async (movieId, value) => {
    try {
      await ratingsService.rateMovie(movieId, value);
      set((state) => ({
        movieRatings: { ...state.movieRatings, [movieId]: value },
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  rateSeries: async (seriesId, value) => {
    try {
      await seriesRatingsService.rateSeries(seriesId, value);
      set((state) => ({
        seriesRatings: { ...state.seriesRatings, [seriesId]: value },
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  getMovieRating: (movieId) => {
    const state = get();
    return state.movieRatings[movieId] || null;
  },

  getSeriesRating: (seriesId) => {
    const state = get();
    return state.seriesRatings[seriesId] || null;
  },

  reset: () => set({
    movieRatings: {},
    seriesRatings: {},
    userRatings: [],
    loading: false,
    error: null,
    activeTab: 'all',
  }),
}));

