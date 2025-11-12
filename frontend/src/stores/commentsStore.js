import { create } from 'zustand';
import { commentsService } from '../services/commentsService';
import { seriesCommentsService } from '../services/seriesCommentsService';

export const useCommentsStore = create((set, get) => ({
  movieComments: [],
  seriesComments: [],
  userComments: [], // Все комментарии пользователя
  loading: false,
  error: null,
  activeTab: 'all', // 'all', 'movies', 'series'

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  loadMovieComments: async (movieId) => {
    set({ loading: true, error: null });
    try {
      const comments = await commentsService.getMovieComments(movieId);
      set({ movieComments: Array.isArray(comments) ? comments : [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loadSeriesComments: async (seriesId) => {
    set({ loading: true, error: null });
    try {
      const comments = await seriesCommentsService.getSeriesComments(seriesId);
      set({ seriesComments: Array.isArray(comments) ? comments : [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loadUserComments: async () => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const activeTab = state.activeTab;

      if (activeTab === 'all' || activeTab === 'movies') {
        const movieComments = await commentsService.getMyComments?.() || [];
        set((state) => ({ userComments: [...movieComments] }));
      }

      if (activeTab === 'all' || activeTab === 'series') {
        const seriesComments = await seriesCommentsService.getMyComments?.() || [];
        set((state) => ({ userComments: [...state.userComments, ...seriesComments] }));
      }

      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  addMovieComment: async (movieId, content) => {
    try {
      const comment = await commentsService.createComment(movieId, content);
      set((state) => ({
        movieComments: [...state.movieComments, comment],
      }));
      return comment;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  addSeriesComment: async (seriesId, content) => {
    try {
      const comment = await seriesCommentsService.createComment(seriesId, content);
      set((state) => ({
        seriesComments: [...state.seriesComments, comment],
      }));
      return comment;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateMovieComment: async (movieId, commentId, content) => {
    try {
      const updated = await commentsService.updateComment(movieId, commentId, content);
      set((state) => ({
        movieComments: state.movieComments.map((c) =>
          c.id === commentId ? updated : c
        ),
      }));
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateSeriesComment: async (seriesId, commentId, content) => {
    try {
      const updated = await seriesCommentsService.updateComment(seriesId, commentId, content);
      set((state) => ({
        seriesComments: state.seriesComments.map((c) =>
          c.id === commentId ? updated : c
        ),
      }));
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteMovieComment: async (movieId, commentId) => {
    try {
      await commentsService.deleteComment(movieId, commentId);
      set((state) => ({
        movieComments: state.movieComments.filter((c) => c.id !== commentId),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteSeriesComment: async (seriesId, commentId) => {
    try {
      await seriesCommentsService.deleteComment(seriesId, commentId);
      set((state) => ({
        seriesComments: state.seriesComments.filter((c) => c.id !== commentId),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  reset: () => set({
    movieComments: [],
    seriesComments: [],
    userComments: [],
    loading: false,
    error: null,
    activeTab: 'all',
  }),
}));

